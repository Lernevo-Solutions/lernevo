from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ResumeViewSet,
    EnquiryCreateAPIView,
    OTPView,
    PasswordResetRequestView,
    RegisterView,
    LoginView,
    CheckAvailabilityView,
    ProfileView,
    ChangePasswordView,
    ProfileImageUploadView,
    PasswordResetConfirmView,
    ContactMessageCreateAPIView,
    DemoBookingCreateAPIView,
)

# ✅ ROUTER
router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')

urlpatterns = [

    # 🔥 NORMAL APIs
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('otp/', OTPView.as_view()),
    path('check-availability/', CheckAvailabilityView.as_view()),

    path("profile/", ProfileView.as_view()),
    path("profile/change-password/", ChangePasswordView.as_view()),
    path("profile/upload-image/", ProfileImageUploadView.as_view()),

    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),

    path("contact/", ContactMessageCreateAPIView.as_view()),
    path("enquiry/", EnquiryCreateAPIView.as_view()),
    path("book-demo/", DemoBookingCreateAPIView.as_view()),

    # 🔥 IMPORTANT (ADD THIS LINE)
    path('', include(router.urls)),
]