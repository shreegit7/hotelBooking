from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Hotel, Rating, Booking
from .serializers import HotelSerializer, RatingSerializer, BookingSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def hotel_login(request):
    """
    Hotel login endpoint.
    Returns authentication token if credentials are valid.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if user has a hotel account
    try:
        hotel = user.hotel
    except Hotel.DoesNotExist:
        return Response(
            {'error': 'This account is not associated with a hotel.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get or create token for the user
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'hotel_id': hotel.id,
        'hotel_name': hotel.name,
        'username': user.username
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hotel_logout(request):
    """
    Hotel logout endpoint.
    Deletes the authentication token.
    """
    try:
        request.user.auth_token.delete()
    except:
        pass
    
    return Response({'message': 'Successfully logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hotel_profile(request):
    """
    Get the authenticated hotel's profile.
    """
    try:
        hotel = request.user.hotel
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)
    except Hotel.DoesNotExist:
        return Response(
            {'error': 'This account is not associated with a hotel.'},
            status=status.HTTP_403_FORBIDDEN
        )


class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing hotels.
    Supports ordering via query parameters: ?ordering=price, -price, -rating, name
    Supports search via query parameters: ?search=keyword
    """
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['price', 'rating', 'name']
    ordering = ['name']  # Default ordering
    search_fields = ['name', 'location']
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get', 'post'])
    def ratings(self, request, pk=None):
        """Get or create ratings for a hotel."""
        hotel = self.get_object()
        
        if request.method == 'GET':
            ratings = hotel.ratings.all()
            serializer = RatingSerializer(ratings, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = RatingSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(hotel=hotel)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        """Create a booking for a hotel."""
        hotel = self.get_object()
        
        # Create a mutable copy of request.data
        booking_data = request.data.copy()
        
        # Calculate total price based on nights
        check_in_str = booking_data.get('check_in')
        check_out_str = booking_data.get('check_out')
        
        if check_in_str and check_out_str:
            try:
                check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
                check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
                nights = (check_out - check_in).days
                
                if nights <= 0:
                    return Response(
                        {'error': 'Check-out date must be after check-in date.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                total_price = hotel.price * Decimal(nights)
                booking_data['total_price'] = str(total_price)
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'check_in and check_out dates are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove hotel from data since we'll pass it to save()
        booking_data.pop('hotel', None)
        
        serializer = BookingSerializer(data=booking_data)
        if serializer.is_valid():
            booking = serializer.save(hotel=hotel, status='pending')  # Changed to pending - hotels need to approve
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RatingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ratings.
    Allows creating ratings (POST) and viewing ratings (GET).
    """
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter ratings by hotel if hotel_id is provided."""
        queryset = Rating.objects.all()
        hotel_id = self.request.query_params.get('hotel_id', None)
        if hotel_id:
            queryset = queryset.filter(hotel_id=hotel_id)
        return queryset


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings.
    - Public users can create bookings (POST)
    - Authenticated hotels can view and manage only their own bookings
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        """Allow anyone to create bookings, but require auth for viewing/managing."""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter bookings based on user type."""
        queryset = Booking.objects.all()
        
        # If user is authenticated and has a hotel account, show only their bookings
        if self.request.user.is_authenticated:
            try:
                hotel = self.request.user.hotel
                queryset = queryset.filter(hotel=hotel)
            except Hotel.DoesNotExist:
                # User is authenticated but not a hotel - return empty queryset
                queryset = queryset.none()
        else:
            # For unauthenticated users, filter by hotel_id query param if provided
            hotel_id = self.request.query_params.get('hotel_id', None)
            if hotel_id:
                queryset = queryset.filter(hotel_id=hotel_id)
            else:
                # Don't show bookings to unauthenticated users without hotel_id
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending booking."""
        booking = self.get_object()
        
        # Verify this booking belongs to the authenticated hotel
        try:
            hotel = request.user.hotel
            if booking.hotel != hotel:
                return Response(
                    {'error': 'You can only approve bookings for your own hotel.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'You must be logged in as a hotel to approve bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': f'Only pending bookings can be approved. Current status: {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'confirmed'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a pending booking."""
        booking = self.get_object()
        
        # Verify this booking belongs to the authenticated hotel
        try:
            hotel = request.user.hotel
            if booking.hotel != hotel:
                return Response(
                    {'error': 'You can only decline bookings for your own hotel.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'You must be logged in as a hotel to decline bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': f'Only pending bookings can be declined. Current status: {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'declined'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

