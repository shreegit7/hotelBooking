from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse  # add this

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('hotels.urls')),
    
    # Root path shows simple message
    path('', lambda request: JsonResponse({"status": "Hotel API running"})),
]
