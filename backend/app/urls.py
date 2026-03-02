from django.urls import path
from .views import EnquiryCreateAPIView, OTPView, PasswordResetRequestView, RegisterView, LoginView,CheckAvailabilityView,ProfileView, ChangePasswordView,ProfileImageUploadView,  PasswordResetRequestView, PasswordResetConfirmView
from .views import ContactMessageCreateAPIView,DemoBookingCreateAPIView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
      path('otp/', OTPView.as_view(), name='otp-login'),
        path('check-availability/', CheckAvailabilityView.as_view(), name='check-availability'),
        
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/change-password/", ChangePasswordView.as_view()),
    path("profile/upload-image/", ProfileImageUploadView.as_view()),
     path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),
     path("contact/", ContactMessageCreateAPIView.as_view(), name="contact"),
     path("enquiry/", EnquiryCreateAPIView.as_view()),
      path("book-demo/", DemoBookingCreateAPIView.as_view()),
]
