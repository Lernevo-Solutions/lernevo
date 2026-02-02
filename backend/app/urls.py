from django.urls import path
from .views import OTPView, RegisterView, LoginView,CheckAvailabilityView,ProfileView, ChangePasswordView,ProfileImageUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
      path('otp/', OTPView.as_view(), name='otp-login'),
        path('check-availability/', CheckAvailabilityView.as_view(), name='check-availability'),
        
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/change-password/", ChangePasswordView.as_view()),
    path("profile/upload-image/", ProfileImageUploadView.as_view()),
]
