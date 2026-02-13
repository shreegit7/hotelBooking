from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal
from .models import Hotel, Rating, Booking, CANCEL_WINDOW_HOURS
from .serializers import HotelSerializer, RatingSerializer, BookingSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    """
    User registration endpoint.
    Allows registration with username or email.
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not password:
        return Response(
            {'error': 'Password is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If email provided but no username, use email as username
    if email and not username:
        username = email
    
    if not username:
        return Response(
            {'error': 'Username or email is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'A user with this username already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if email and User.objects.filter(email=email).exists():
        return Response(
            {'error': 'A user with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email if email else '',
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User registered successfully.',
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Error creating user: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    User login endpoint.
    Allows login with username or email.
    """
    username_or_email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return Response(
            {'error': 'Username/email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to find user by username or email
    try:
        if '@' in username_or_email:
            user = User.objects.get(email=username_or_email)
        else:
            user = User.objects.get(username=username_or_email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Authenticate user
    authenticated_user = authenticate(username=user.username, password=password)
    
    if authenticated_user is None:
        return Response(
            {'error': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if this is a hotel account (should use hotel login instead)
    try:
        hotel = authenticated_user.hotel
        return Response(
            {'error': 'This is a hotel account. Please use the hotel login endpoint.'},
            status=status.HTTP_403_FORBIDDEN
        )
    except Hotel.DoesNotExist:
        pass  # Regular user, continue
    
    # Get or create token for the user
    token, created = Token.objects.get_or_create(user=authenticated_user)
    
    return Response({
        'token': token.key,
        'user_id': authenticated_user.id,
        'username': authenticated_user.username,
        'email': authenticated_user.email
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    User logout endpoint.
    Deletes the authentication token.
    """
    try:
        request.user.auth_token.delete()
    except:
        pass
    
    return Response({'message': 'Successfully logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the authenticated user's profile.
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name
    })


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
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Login required to submit a review.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            try:
                request.user.hotel
                return Response(
                    {'error': 'Hotel accounts cannot submit reviews.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            except Hotel.DoesNotExist:
                pass

            rating_data = request.data.copy()
            if not rating_data.get('user_name'):
                rating_data['user_name'] = request.user.get_full_name() or request.user.username

            serializer = RatingSerializer(data=rating_data)
            if serializer.is_valid():
                serializer.save(hotel=hotel)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def book(self, request, pk=None):
        """Create a booking for a hotel."""
        hotel = self.get_object()
        
        # Create a mutable copy of request.data
        booking_data = request.data.copy()

        # Reject hotel accounts from booking
        try:
            request.user.hotel
            return Response(
                {'error': 'Hotel accounts cannot book rooms.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Hotel.DoesNotExist:
            pass

        # Default guest name/email from user if not provided
        if not booking_data.get('guest_name'):
            booking_data['guest_name'] = request.user.get_full_name() or request.user.username
        if not booking_data.get('guest_email') and request.user.email:
            booking_data['guest_email'] = request.user.email
        
        # Calculate total price based on nights
        check_in_str = booking_data.get('check_in')
        check_out_str = booking_data.get('check_out')
        
        total_price = None
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
        
        # Link to authenticated user (non-hotel)
        user = request.user
        
        serializer = BookingSerializer(data=booking_data)
        if serializer.is_valid():
            booking = serializer.save(hotel=hotel, user=user, status='pending', total_price=total_price)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RatingViewSet(viewsets.ReadOnlyModelViewSet):
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

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Allow hotel to reply to a review."""
        rating = self.get_object()

        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            hotel = request.user.hotel
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'Only hotel accounts can reply to reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if rating.hotel != hotel:
            return Response(
                {'error': 'You can only reply to reviews for your own hotel.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reply_text = (request.data.get('hotel_reply') or '').strip()
        if not reply_text:
            return Response(
                {'error': 'Reply text is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating.hotel_reply = reply_text
        rating.replied_at = timezone.now()
        rating.save()

        serializer = self.get_serializer(rating)
        return Response(serializer.data)


class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing bookings.
    - Public users can create bookings (POST)
    - Authenticated hotels can view and manage only their own bookings
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter bookings based on user type."""
        queryset = Booking.objects.all()
        
        # If user is authenticated
        if self.request.user.is_authenticated:
            try:
                # Check if it's a hotel account
                hotel = self.request.user.hotel
                queryset = queryset.filter(hotel=hotel)
            except Hotel.DoesNotExist:
                # Regular user - show only their own bookings
                queryset = queryset.filter(user=self.request.user)
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
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking (for regular users)."""
        booking = self.get_object()
        
        # Verify this booking belongs to the authenticated user
        if not request.user.is_authenticated:
            return Response(
                {'error': 'You must be logged in to cancel bookings.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user owns this booking
        if booking.user != request.user:
            return Response(
                {'error': 'You can only cancel your own bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow canceling pending or confirmed bookings
        if booking.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel booking with status: {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cancel_deadline = booking.created_at + timedelta(hours=CANCEL_WINDOW_HOURS)
        if timezone.now() > cancel_deadline:
            return Response(
                {'error': 'Cancellation window expired. Please contact the hotel to cancel.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='hotel-cancel')
    def hotel_cancel(self, request, pk=None):
        """Cancel a booking (for hotels)."""
        booking = self.get_object()
        
        try:
            hotel = request.user.hotel
            if booking.hotel != hotel:
                return Response(
                    {'error': 'You can only cancel bookings for your own hotel.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Hotel.DoesNotExist:
            return Response(
                {'error': 'You must be logged in as a hotel to cancel bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel booking with status: {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

