from django.urls import path
from .views import OTPView, RegisterView, LoginView,CheckAvailabilityView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
      path('otp/', OTPView.as_view(), name='otp-login'),
        path('check-availability/', CheckAvailabilityView.as_view(), name='check-availability'),
     
]
