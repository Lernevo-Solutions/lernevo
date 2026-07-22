# app/urls.py - UPDATE THIS
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Add this import for views
from . import views  # ⬅️ ADD THIS LINE

from .views import (
    DBCheckView,
    DetectResumeAPIView,
    ForcePasswordUpdateView,
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
    AnalyzeSkillGapAPIView,
    DemoBookingCreateAPIView,
    FeedbackAPIView,
)
from .roles_views import (
    RolesAcceptAPIView,
    RolesCancelAPIView,
    RolesChangeRoleAPIView,
    RolesInvitationLookupAPIView,
    RolesInviteAPIView,
    RolesMembersAPIView,
    RolesResendAPIView,
    RolesStatsAPIView,
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
    path('db-check/', DBCheckView.as_view()),

    path("profile/", ProfileView.as_view()),
    path("profile/change-password/", ChangePasswordView.as_view()),
    path("profile/upload-image/", ProfileImageUploadView.as_view()),

    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),

    path("contact/", ContactMessageCreateAPIView.as_view()),
    path("enquiry/", EnquiryCreateAPIView.as_view()),
    path("book-demo/", DemoBookingCreateAPIView.as_view()),
    
    # 🔥 VERTEX AI ENDPOINTS - Now views is defined
    path("ai/summary/", views.ai_generate_summary, name='ai-summary'),
    path("ai/projects/", views.ai_generate_projects, name='ai-projects'),
    path("ai/experience/", views.ai_generate_experience, name='ai-experience'),
    path("ai/certifications/", views.ai_generate_certifications, name='ai-certifications'),
    path("ai/education/", views.ai_generate_education, name='ai-education'),
    path("ai/skills/", views.ai_suggest_skills, name='ai-skills'),
    path("ai/health/", views.ai_health_check, name='ai-health'),
    path("test-vertex-rest/", views.test_vertex_rest),
    path(
        "analyze-skill-gap/",
        AnalyzeSkillGapAPIView.as_view(),
        name="analyze-skill-gap"
    ),
  path('detect-resume/', DetectResumeAPIView.as_view(), name='detect-resume'),
  path('users/', views.user_management_api, name='user_management'),
  path('roles/members/', RolesMembersAPIView.as_view(), name='roles-members'),
  path('roles/stats/', RolesStatsAPIView.as_view(), name='roles-stats'),
  path('roles/invite/', RolesInviteAPIView.as_view(), name='roles-invite'),
  path('roles/resend/', RolesResendAPIView.as_view(), name='roles-resend'),
  path('roles/cancel/', RolesCancelAPIView.as_view(), name='roles-cancel'),
  path('roles/change-role/', RolesChangeRoleAPIView.as_view(), name='roles-change-role'),
  path('roles/invitation/<str:token>/', RolesInvitationLookupAPIView.as_view(), name='roles-invitation'),
  path('roles/accept/', RolesAcceptAPIView.as_view(), name='roles-accept'),
  path('auth/force-update-password/', ForcePasswordUpdateView.as_view(), name='force_password_update'),
  path('feedback/', views.FeedbackAPIView.as_view(), name='feedback'),
  path('feedback/list/', views.FeedbackListAPIView.as_view(), name='feedback-list'),
    # 🔥 IMPORTANT (ADD THIS LINE)
    path('', include(router.urls)),
]
