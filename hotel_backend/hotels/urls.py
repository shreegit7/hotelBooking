from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HotelViewSet, RatingViewSet, BookingViewSet, hotel_login, hotel_logout, hotel_profile

router = DefaultRouter()
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', hotel_login, name='hotel-login'),
    path('auth/logout/', hotel_logout, name='hotel-logout'),
    path('auth/profile/', hotel_profile, name='hotel-profile'),
]

