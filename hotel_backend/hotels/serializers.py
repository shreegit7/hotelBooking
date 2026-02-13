from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Hotel, Rating, Booking, HotelImage, CANCEL_WINDOW_HOURS


class HotelImageSerializer(serializers.ModelSerializer):
    """Serializer for HotelImage model."""
    
    class Meta:
        model = HotelImage
        fields = ['id', 'image_url', 'alt_text', 'display_order']
        read_only_fields = ['id']


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model."""
    
    class Meta:
        model = Rating
        fields = [
            'id',
            'hotel',
            'user_name',
            'rating',
            'comment',
            'created_at',
            'hotel_reply',
            'replied_at',
        ]
        read_only_fields = ['id', 'hotel', 'created_at', 'hotel_reply', 'replied_at']


class HotelSerializer(serializers.ModelSerializer):
    """Serializer for Hotel model."""
    
    # Include user ratings count and average
    ratings_count = serializers.SerializerMethodField()
    average_user_rating = serializers.SerializerMethodField()
    images = HotelImageSerializer(many=True, read_only=True)
    # Keep image field for backward compatibility - returns first image URL or legacy image
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'location', 'price', 'rating', 'image', 'images', 'description', 'amenities', 'ratings_count', 'average_user_rating']
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
    
    def get_image(self, obj):
        """Get the primary image URL - first from images, fallback to legacy image field."""
        images = obj.images.all()
        if images.exists():
            return images.first().image_url
        return obj.image  # Fallback to legacy image field


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model."""
    
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    cancel_deadline = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'hotel', 'hotel_name', 'user', 'guest_name', 'guest_email',
            'check_in', 'check_out', 'num_guests', 'total_price',
            'booking_reference', 'status', 'created_at', 'can_cancel', 'cancel_deadline'
        ]
        read_only_fields = ['id', 'hotel', 'user', 'booking_reference', 'created_at', 'status', 'total_price']
    
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

    def get_cancel_deadline(self, obj):
        deadline = obj.created_at + timedelta(hours=CANCEL_WINDOW_HOURS)
        return deadline.isoformat()

    def get_can_cancel(self, obj):
        if obj.status not in ['pending', 'confirmed']:
            return False
        deadline = obj.created_at + timedelta(hours=CANCEL_WINDOW_HOURS)
        return timezone.now() <= deadline

