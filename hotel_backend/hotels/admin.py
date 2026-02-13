from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from django.contrib import messages
from django import forms
from .models import Hotel, Rating, Booking, HotelImage


class HotelAdminForm(forms.ModelForm):
    """Custom form for Hotel admin with user creation."""
    create_user = forms.BooleanField(
        required=False,
        initial=False,
        help_text="Check to create a new user account for this hotel"
    )
    username = forms.CharField(
        required=False,
        max_length=150,
        help_text="Username for the hotel account (required if creating user)"
    )
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        help_text="Password for the hotel account (required if creating user)"
    )
    email = forms.EmailField(
        required=False,
        help_text="Email for the hotel account (optional)"
    )
    
    class Meta:
        model = Hotel
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        create_user = cleaned_data.get('create_user')
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        user = cleaned_data.get('user')
        
        if create_user:
            if not username:
                raise ValidationError({'username': 'Username is required when creating a user account.'})
            if not password:
                raise ValidationError({'password': 'Password is required when creating a user account.'})
            if User.objects.filter(username=username).exists():
                raise ValidationError({'username': 'A user with this username already exists.'})
        elif not user:
            # If not creating user and no user is selected, that's okay (hotel can be created without account)
            pass
        
        return cleaned_data




class HotelImageInline(admin.TabularInline):
    """Inline admin for HotelImage model."""
    model = HotelImage
    extra = 1
    fields = ('image_url', 'alt_text', 'display_order')
    ordering = ('display_order',)


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    """Admin interface for Hotel model."""
    form = HotelAdminForm
    list_display = ['name', 'location', 'price', 'rating', 'has_user_account', 'active_bookings_count', 'id']
    list_filter = ['location', 'rating']
    search_fields = ['name', 'location']
    ordering = ['name']
    inlines = [HotelImageInline]
    fieldsets = (
        ('Hotel Information', {
            'fields': ('name', 'location', 'price', 'rating', 'image', 'description', 'amenities')
        }),
        ('User Account', {
            'fields': ('user', 'create_user', 'username', 'password', 'email'),
            'description': 'Link an existing user account or create a new one for this hotel.'
        }),
    )
    
    def has_user_account(self, obj):
        """Display if hotel has a user account."""
        if obj.user:
            return format_html('<span style="color: green;">✓ Yes</span>')
        return format_html('<span style="color: red;">✗ No</span>')
    has_user_account.short_description = 'Has Account'
    
    def active_bookings_count(self, obj):
        """Display count of active bookings."""
        count = obj.bookings.filter(status__in=['pending', 'confirmed']).count()
        if count > 0:
            return format_html('<span style="color: orange;">{}</span>', count)
        return count
    active_bookings_count.short_description = 'Active Bookings'
    
    def save_model(self, request, obj, form, change):
        """Handle user creation when saving hotel."""
        create_user = form.cleaned_data.get('create_user', False)
        username = form.cleaned_data.get('username', '')
        password = form.cleaned_data.get('password', '')
        email = form.cleaned_data.get('email', '')
        
        if create_user and username and password:
            # Create new user account
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email if email else '',
                is_staff=False,
                is_superuser=False
            )
            obj.user = user
        
        super().save_model(request, obj, form, change)
    
    def delete_model(self, request, obj):
        """Prevent deletion if hotel has active bookings."""
        if obj.has_active_bookings():
            active_count = obj.bookings.filter(status__in=['pending', 'confirmed']).count()
            messages.error(
                request,
                f'Cannot delete hotel "{obj.name}" because it has {active_count} active booking(s). '
                'Please cancel or complete all bookings before deleting.'
            )
            return
        super().delete_model(request, obj)
    
    def get_readonly_fields(self, request, obj=None):
        """Make user field readonly if hotel already has a user."""
        readonly = []
        if obj and obj.user:
            readonly.append('user')
        return readonly


@admin.register(HotelImage)
class HotelImageAdmin(admin.ModelAdmin):
    """Admin interface for HotelImage model."""
    list_display = ['hotel', 'image_url', 'display_order', 'created_at']
    list_filter = ['hotel', 'created_at']
    search_fields = ['hotel__name', 'alt_text']
    ordering = ['hotel', 'display_order', 'created_at']
    readonly_fields = ['created_at']


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

