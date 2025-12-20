from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Hotel(models.Model):
    """Hotel model for storing hotel information."""
    
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    image = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField()
    amenities = models.JSONField(default=list, blank=True)  # Store as list of strings
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Rating(models.Model):
    """User rating model for hotels."""
    
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='ratings')
    user_name = models.CharField(max_length=100)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user_name} - {self.rating}/5 for {self.hotel.name}"


class Booking(models.Model):
    """Booking model for hotel reservations."""
    
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='bookings')
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField()
    check_in = models.DateField()
    check_out = models.DateField()
    num_guests = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        default=1
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('confirmed', 'Confirmed'),
            ('cancelled', 'Cancelled'),
        ],
        default='confirmed'
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.booking_reference} - {self.guest_name} - {self.hotel.name}"
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            # Generate a unique booking reference
            import random
            import string
            self.booking_reference = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        super().save(*args, **kwargs)

