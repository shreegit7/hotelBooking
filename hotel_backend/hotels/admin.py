from django.contrib import admin
from .models import Hotel, Rating, Booking


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    """Admin interface for Hotel model."""
    list_display = ['name', 'location', 'price', 'rating', 'id']
    list_filter = ['location', 'rating']
    search_fields = ['name', 'location']
    ordering = ['name']


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    """Admin interface for Rating model."""
    list_display = ['user_name', 'hotel', 'rating', 'created_at']
    list_filter = ['rating', 'created_at', 'hotel']
    search_fields = ['user_name', 'hotel__name', 'comment']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model."""
    list_display = ['booking_reference', 'guest_name', 'hotel', 'check_in', 'check_out', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'created_at', 'hotel']
    search_fields = ['booking_reference', 'guest_name', 'guest_email', 'hotel__name']
    ordering = ['-created_at']
    readonly_fields = ['booking_reference', 'created_at']

