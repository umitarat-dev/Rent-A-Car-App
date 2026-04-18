from django.urls import path, include
from .views import RegisterAPI
from .views import RegisterAPI, GoogleLogin # GoogleLogin ekledik

urlpatterns = [
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('register/', RegisterAPI.as_view()),
    
    # 🎯 YENİ YOL: React artık buraya POST atacak
    # Tam adres: http://127.0.0.1:8000/users/auth/google/
    path('auth/google/', GoogleLogin.as_view(), name='google_login'), # GoogleLogin için URL ekledik
]