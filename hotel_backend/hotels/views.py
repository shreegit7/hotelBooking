from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
from decimal import Decimal
from .models import Hotel, Rating, Booking
from .serializers import HotelSerializer, RatingSerializer, BookingSerializer


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
        
        # Calculate total price based on nights
        check_in_str = request.data.get('check_in')
        check_out_str = request.data.get('check_out')
        
        if check_in_str and check_out_str:
            check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
            nights = (check_out - check_in).days
            
            if nights <= 0:
                return Response(
                    {'error': 'Check-out date must be after check-in date.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            total_price = hotel.price * Decimal(nights)
            request.data['total_price'] = str(total_price)
        
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save(hotel=hotel, status='confirmed')
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
    Allows creating bookings (POST) and viewing bookings (GET).
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter bookings by hotel if hotel_id is provided."""
        queryset = Booking.objects.all()
        hotel_id = self.request.query_params.get('hotel_id', None)
        if hotel_id:
            queryset = queryset.filter(hotel_id=hotel_id)
        return queryset

