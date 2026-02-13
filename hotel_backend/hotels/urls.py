from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HotelViewSet, RatingViewSet, BookingViewSet,
    hotel_login, hotel_logout, hotel_profile,
    user_register, user_login, user_logout, user_profile
)

router = DefaultRouter()
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    # Hotel authentication
    path('auth/hotel/login/', hotel_login, name='hotel-login'),
    path('auth/hotel/logout/', hotel_logout, name='hotel-logout'),
    path('auth/hotel/profile/', hotel_profile, name='hotel-profile'),
    # User authentication
    path('auth/register/', user_register, name='user-register'),
    path('auth/login/', user_login, name='user-login'),
    path('auth/logout/', user_logout, name='user-logout'),
    path('auth/profile/', user_profile, name='user-profile'),
]

