from rest_framework import serializers
from .models import Hotel, Rating, Booking


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model."""
    
    class Meta:
        model = Rating
        fields = ['id', 'hotel', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'hotel', 'created_at']


class HotelSerializer(serializers.ModelSerializer):
    """Serializer for Hotel model."""
    
    # Include user ratings count and average
    ratings_count = serializers.SerializerMethodField()
    average_user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'location', 'price', 'rating', 'image', 'description', 'amenities', 'ratings_count', 'average_user_rating']
        read_only_fields = ['id']
    
    def get_ratings_count(self, obj):
        """Get the count of user ratings for this hotel."""
        return obj.ratings.count()
    
    def get_average_user_rating(self, obj):
        """Calculate average rating from user ratings."""
        ratings = obj.ratings.all()
        if ratings.exists():
            avg = sum(r.rating for r in ratings) / ratings.count()
            return round(avg, 1)
        return None


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model."""
    
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'hotel', 'hotel_name', 'guest_name', 'guest_email',
            'check_in', 'check_out', 'num_guests', 'total_price',
            'booking_reference', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'created_at', 'status']
    
    def validate(self, data):
        """Validate booking dates."""
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        
        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError({
                    'check_out': 'Check-out date must be after check-in date.'
                })
        
        return data

