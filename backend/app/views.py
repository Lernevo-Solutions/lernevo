from ast import Dict
import token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User as AuthUser
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.exceptions import ImproperlyConfigured
from smtplib import SMTPException
from django.utils.timezone import now
from rest_framework import viewsets, permissions
from .models import Resume
from .serializers import ResumeSerializer
from datetime import timedelta
import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import UserProfile
from .models import User, UserOTP
from .serializers import DemoBookingSerializer, RegisterSerializer, LoginSerializer, OTPRequestSerializer
from .serializers import ProfileSerializer, ProfileImageSerializer
from .models import User as LernevoUser 
from django.db.models import Q
from django.db import transaction  
import random
import logging
logger = logging.getLogger(__name__)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        print("=" * 60)
        print("📝 REGISTRATION STARTED")
        
        try:
            # Get data from request
            email = request.data.get("email", "").strip().lower()
            username = request.data.get("username", "").strip().lower()
            password = request.data.get("password")
            mobile = request.data.get("mobile", "")
            name = request.data.get("name", "")
            user_code = request.data.get("user_code")
            
            print(f"Email: {email}")
            print(f"Username: {username}")
            print(f"Mobile: {mobile}")
            
            # Validation
            if not email or not username or not password:
                return Response(
                    {"detail": "Email, username and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already exists
            if AuthUser.objects.filter(email__iexact=email).exists():
                print(f"❌ Email already exists: {email}")
                return Response(
                    {"detail": "Email already registered"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if AuthUser.objects.filter(username__iexact=username).exists():
                print(f"❌ Username already exists: {username}")
                return Response(
                    {"detail": "Username already taken"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check mobile in custom table
            if mobile and LernevoUser.objects.filter(mobile=mobile, is_delete=False).exists():
                print(f"❌ Mobile already exists: {mobile}")
                return Response(
                    {"detail": "Mobile number already registered"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # STEP 1: Create Django auth_user
            print("Step 1: Creating Django auth_user...")
            auth_user = AuthUser.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            auth_user.first_name = name
            auth_user.save()
            print(f"✅ Auth user created: ID={auth_user.id}")
            
            # STEP 2: Generate unique user_code
            if not user_code:
                user_code = str(random.randint(100000, 999999))
                while LernevoUser.objects.filter(user_code=user_code).exists():
                    user_code = str(random.randint(100000, 999999))
            
            # STEP 3: Create custom LernevoUser
            print("Step 2: Creating custom LernevoUser...")
            custom_user = LernevoUser.objects.create(
                auth_user=auth_user,
                mobile=mobile,
                user_code=user_code
            )
            print(f"✅ Custom user created: ID={custom_user.id}, Code={user_code}")
            
            # STEP 4: Create auth token
            print("Step 3: Creating auth token...")
            token, _ = Token.objects.get_or_create(user=auth_user)
            
            # VERIFY both records exist
            print("\n📋 VERIFICATION:")
            auth_exists = AuthUser.objects.filter(id=auth_user.id).exists()
            custom_exists = LernevoUser.objects.filter(id=custom_user.id).exists()
            print(f"  - Auth user in DB: {auth_exists}")
            print(f"  - Custom user in DB: {custom_exists}")
            
            if not auth_exists or not custom_exists:
                raise Exception("Failed to save user data to database")
            
            print("=" * 60)
            print(f"✅ REGISTRATION SUCCESSFUL for {username}")
            print("=" * 60)
            
            return Response({
                "message": "User registered successfully",
                "token": token.key,
                "user_code": custom_user.user_code,
                "user_name": auth_user.username,
                "email": auth_user.email,
                "name": auth_user.first_name,
                "mobile": custom_user.mobile
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"❌ Registration error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================
# LOGIN VIEW - Finds user from both tables
# ============================================================
from django.utils import timezone

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("=" * 60)
        print("🔐 LOGIN ATTEMPT")
        
        identifier = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        
        if not identifier or not password:
            return Response(
                {"detail": "Username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = AuthUser.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()
        
        if not user:
            return Response(
                {"detail": "User not found. Please register first."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user.check_password(password):
            return Response(
                {"detail": "Invalid password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ ✅ ✅ ADD THIS - Update last_login in AuthUser
        user.last_login = timezone.now()
        user.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        
        try:
            custom_user = LernevoUser.objects.get(auth_user=user)
            
            # ✅ ✅ ✅ ADD THIS - Update last_login in custom User model
            custom_user.last_login = timezone.now()
            custom_user.is_first_login = False  # First login done
            custom_user.save()
            
            user_code = custom_user.user_code
            mobile = custom_user.mobile
            
        except LernevoUser.DoesNotExist:
            user_code = str(random.randint(100000, 999999))
            while LernevoUser.objects.filter(user_code=user_code).exists():
                user_code = str(random.randint(100000, 999999))
            
            custom_user = LernevoUser.objects.create(
                auth_user=user,
                mobile="",
                user_code=user_code
            )
        
        print(f"✅ Last login updated: {custom_user.last_login}")
        
        return Response({
            "message": "Login successful",
            "token": token.key,
            "user_name": user.username,
            "email": user.email,
            "name": user.first_name,
            "user_code": user_code,
            "mobile": mobile,
            "last_login": custom_user.last_login.strftime('%Y-%m-%d %H:%M:%S') if custom_user.last_login else 'Never'
        }, status=status.HTTP_200_OK)
class DBCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")

            user_count = AuthUser.objects.count()
            lernevo_count = LernevoUser.objects.count()

            return Response({
                "status": "connected",
                "db_engine": connection.vendor,
                "db_name": connection.settings_dict.get("NAME", "unknown"),
                "db_host": connection.settings_dict.get("HOST", "localhost (SQLite)"),
                "auth_user_count": user_count,
                "lernevo_user_count": lernevo_count,
                "warning": (
                    "⚠️ SQLite used - data LOST on container restart!"
                    if connection.vendor == "sqlite"
                    else "✅ Persistent DB connected"
                )
            }, status=200)
        except Exception as e:
            return Response({"status": "error", "error": str(e)}, status=500)


# ---------------- OTP for registration only ----------------
class OTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp"]

        if not otp_code:
            if AuthUser.objects.filter(email__iexact=email).exists():
                return Response({"detail": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

            UserOTP.objects.filter(
                email=email,
                is_used=False,
                is_delete=False,
            ).update(is_used=True, used_at=now())

            otp = uuid.uuid4().hex[:6].upper()

            otp_obj = UserOTP.objects.create(
                email=email,
                otp_code=otp,
                expires_at=now() + timedelta(minutes=5)
            )

            try:
                self.send_otp_email(email, otp)
            except ImproperlyConfigured as exc:
                otp_obj.delete()
                logger.error("OTP email configuration error for %s: %s", email, exc, exc_info=True)
                return Response(
                    {"detail": "OTP email service is not configured correctly"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except SMTPException as exc:
                otp_obj.delete()
                logger.warning("SMTP delivery failed for %s: %s", email, exc, exc_info=True)
                return Response(
                    {"detail": "Unable to deliver OTP to this email address. Try a different email."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            except Exception as exc:
                otp_obj.delete()
                logger.error("Unexpected OTP email failure for %s: %s", email, exc, exc_info=True)
                return Response(
                    {"detail": "Failed to send OTP email. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response({"message": "OTP sent to email", "email": email}, status=status.HTTP_200_OK)

        otp_obj = UserOTP.objects.filter(
            email=email,
            otp_code=otp_code,
            is_used=False,
            is_delete=False,
            expires_at__gte=now()
        ).order_by("-created_at").first()

        if not otp_obj:
            return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.is_used = True
        otp_obj.used_at = now()
        otp_obj.save()

        return Response({"message": "Email verified", "email": email, "verified": True}, status=status.HTTP_200_OK)

    def send_otp_email(self, email, otp):
        self._validate_email_settings()

        subject = "Your OTP Code"
        text = f"Your OTP is {otp}. It expires in 5 minutes."
        html = f"<p>Your OTP is <b>{otp}</b>. It expires in 5 minutes.</p>"

        mail = EmailMultiAlternatives(
            subject,
            text,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        mail.attach_alternative(html, "text/html")
        mail.send()

    def _validate_email_settings(self):
        missing_fields = []
        for field in (
            "EMAIL_HOST",
            "EMAIL_PORT",
            "DEFAULT_FROM_EMAIL",
            "EMAIL_HOST_USER",
            "EMAIL_HOST_PASSWORD",
        ):
            if not getattr(settings, field, None):
                missing_fields.append(field)

        if not settings.EMAIL_USE_TLS:
            missing_fields.append("EMAIL_USE_TLS")

        if missing_fields:
            raise ImproperlyConfigured(
                "Email settings missing or invalid: " + ", ".join(missing_fields)
            )

from django.db.models import Q




class CheckAvailabilityView(APIView):
    permission_classes = []  # AllowAny

    def post(self, request):
        email = request.data.get("email")
        phone = request.data.get("phone")

        email_exists = AuthUser.objects.filter(email=email).exists()
        phone_exists = User.objects.filter(mobile=phone, is_delete=False).exists()

        return Response({
            "email_available": not email_exists,
            "phone_available": not phone_exists
        }, status=status.HTTP_200_OK)
    


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import User as LernevoUser
from .serializers import ProfileSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            lernevo_user = LernevoUser.objects.get(auth_user=request.user)
        except LernevoUser.DoesNotExist:
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(lernevo_user)
        return Response({
            "username": lernevo_user.auth_user.username,
            "email": lernevo_user.auth_user.email,
            "mobile": lernevo_user.mobile,
            "role": "Member"
        })

    def put(self, request):
        try:
            lernevo_user = LernevoUser.objects.get(auth_user=request.user)
        except LernevoUser.DoesNotExist:
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(
            lernevo_user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "username": lernevo_user.auth_user.username,
                "email": lernevo_user.auth_user.email,
                "mobile": lernevo_user.mobile,
                "role": ""
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate

from .serializers import ChangePasswordSerializer

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        # ✅ check old password
        if not user.check_password(old_password):
            return Response(
                {"message": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password updated successfully"},
            status=status.HTTP_200_OK
        )
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ✅ Get or create LernevoUser
        lernevo_user, _ = LernevoUser.objects.get_or_create(auth_user=request.user)
        # ✅ Get or create UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=lernevo_user)

        serializer = ProfileSerializer(lernevo_user)
        return Response({
            "username": lernevo_user.auth_user.username,
            "email": lernevo_user.auth_user.email,
            "mobile": lernevo_user.mobile,
            "role": "Member"
        })

    def put(self, request):
        # ✅ Get or create LernevoUser
        lernevo_user, _ = LernevoUser.objects.get_or_create(auth_user=request.user)
        # ✅ Get or create UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=lernevo_user)

        serializer = ProfileSerializer(
            lernevo_user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "username": lernevo_user.auth_user.username,
                "email": lernevo_user.auth_user.email,
                "mobile": lernevo_user.mobile,
                "role": "Member"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Profile Image Upload ----------------
class ProfileImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        # ✅ Get or create LernevoUser
        lernevo_user, _ = LernevoUser.objects.get_or_create(auth_user=request.user)
        # ✅ Get or create UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=lernevo_user)

        serializer = ProfileImageSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Profile image updated successfully",
                    "profile_image": request.build_absolute_uri(
                        profile.profile_image.url
                    )
                },
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"detail": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = AuthUser.objects.filter(email=email).first()
        if not user:
            return Response(
                {"detail": "Email not registered"},
                status=status.HTTP_404_NOT_FOUND
            )

        # invalidate old OTPs
        UserOTP.objects.filter(
            email=email,
            is_used=False
        ).update(is_used=True)

        otp = uuid.uuid4().hex[:6].upper()

        UserOTP.objects.create(
            email=email,
            user=user,
            otp_code=otp,
            expires_at=now() + timedelta(minutes=15)
        )

        reset_link = f"{settings.FRONTEND_URL}/reset-password-confirm?email={email}&otp={otp}"

        self.send_reset_email(email, reset_link)

        return Response(
            {"message": "Password reset link sent"},
            status=status.HTTP_200_OK
        )

    def send_reset_email(self, email, link):
        subject = "Reset Your Password"
        text = f"Click the link to reset your password: {link}"
        html = f"""
        <p>Click the button below to reset your password:</p>
        <a href="{link}" style="padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">
            Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        """

        mail = EmailMultiAlternatives(
            subject,
            text,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        mail.attach_alternative(html, "text/html")
        mail.send()
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not all([email, otp, new_password]):
            return Response(
                {"detail": "Email, OTP and new password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_obj = UserOTP.objects.filter(
            email=email,
            otp_code=otp.upper(),
            is_used=False,
            expires_at__gte=now()
        ).first()

        if not otp_obj:
            return Response(
                {"detail": "Invalid or expired reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = otp_obj.user
        user.set_password(new_password)
        user.save()

        otp_obj.is_used = True
        otp_obj.used_at = now()
        otp_obj.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)

        if serializer.is_valid():
            contact = serializer.save()

            try:
                send_mail(
                    subject=f"New Contact: {contact.subject}",
                    message=f"""
Name: {contact.name}
Email: {contact.email}
Inquiry Type: {contact.inquiry_type}

Message:
{contact.message}
""",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=["lernevosolution@gmail.com"],
                    fail_silently=True,
                )
            except Exception as e:
                print("Email error:", e)

            return Response(
                {"message": "Message sent successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from .models import Enquiry
from .serializers import EnquirySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class EnquiryCreateAPIView(APIView):

    permission_classes = []  # public access

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Enquiry submitted successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from django.core.mail import send_mail
from django.conf import settings

class DemoBookingCreateAPIView(APIView):

    permission_classes = []

    def post(self, request):
        serializer = DemoBookingSerializer(data=request.data)

        if serializer.is_valid():
            booking = serializer.save()

            # 📧 Email Content
            subject = "New Demo Booking - Lernevo"

            message = f"""
New Demo Request Received

Full Name: {booking.full_name}
Email: {booking.email}
Preferred Date: {booking.preferred_date}
Preferred Time: {booking.preferred_time}

Questions:
{booking.questions}
"""

            # Send email to company
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                ["lernevosolution@gmail.com"],  # Company email
                fail_silently=False,
            )

            return Response(
                {"message": "Demo booked successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
import traceback

from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, User
from .serializers import ResumeSerializer
import traceback
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, User
from .serializers import ResumeSerializer
import traceback

from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume, User
from .serializers import ResumeSerializer
import traceback


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    # ✅ GET USER RESUMES
    def get_queryset(self):
        try:
            auth_user = self.request.user

            if not auth_user or not auth_user.is_authenticated:
                return Resume.objects.none()

            return Resume.objects.filter(
                user__auth_user=auth_user,
                is_delete=False
            )

        except Exception as e:
            print("❌ QUERY ERROR:", str(e))
            return Resume.objects.none()

    # 🔥 AUTO CREATE USER + SAFE SAVE
    def perform_create(self, serializer):
        try:
            auth_user = self.request.user

            if not auth_user or not auth_user.is_authenticated:
                raise Exception("User not authenticated")

            # ✅ GET OR CREATE app.User
            app_user, created = User.objects.get_or_create(
                auth_user=auth_user,
                defaults={
                    "mobile": ""
                }
            )

            if created:
                print("✅ app.User CREATED")

            print("✅ USING USER:", app_user)

            serializer.save(user=app_user)

        except Exception as e:
            print("❌ CREATE ERROR:", str(e))
            traceback.print_exc()
            raise Exception(f"Resume creation failed: {str(e)}")

    # 🔥 DEBUG CREATE (NO 500 ERROR)
    def create(self, request, *args, **kwargs):
        try:
            print("📦 REQUEST DATA:", request.data)  # debug

            return super().create(request, *args, **kwargs)

        except Exception as e:
            print("❌ API ERROR:", str(e))
            traceback.print_exc()

            return Response(
                {
                    "detail": f"Resume creation failed: {str(e)}",
                    "hint": "Check backend logs"
                },
                status=400
            )

    # 🔥 UPDATE ALSO SAFE
    def update(self, request, *args, **kwargs):
        try:
            print("✏️ UPDATE DATA:", request.data)

            return super().update(request, *args, **kwargs)

        except Exception as e:
            print("❌ UPDATE ERROR:", str(e))
            traceback.print_exc()

            return Response(
                {
                    "detail": f"Resume update failed: {str(e)}"
                },
                status=400
            )

    # 🔥 DELETE (SOFT DELETE)
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_delete = True
            instance.save()

            return Response({"message": "Resume deleted successfully"})

        except Exception as e:
            print("❌ DELETE ERROR:", str(e))
            traceback.print_exc()

            return Response(
                {
                    "detail": f"Delete failed: {str(e)}"
                },
                status=400
            )
 # At the VERY END of your app/views.py - add this ONE TIME only

# ============================================================
# VERTEX AI ENDPOINTS - ONE COPY ONLY
# ============================================================
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .vertex_ai_service import vertex_service
from .models import (
    Resume, ResumePersonalInfo, ResumeSkill,
    ResumeSummary, ResumeProject, ResumeExperience,
    ResumeCertification, ResumeUGEducation
)

# ---------------- SUMMARY ----------------
@api_view(['POST'])
def ai_generate_summary(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")

    if not resume_id:
        return Response({"error": "resume_id required"}, status=400)

    resume = get_object_or_404(Resume, id=resume_id)

    personal = ResumePersonalInfo.objects.filter(resume=resume).first()
    skills = ResumeSkill.objects.filter(resume=resume)
    skills_text = ", ".join([s.name for s in skills])

    current = ""
    if action == "improve":
        obj = ResumeSummary.objects.filter(resume=resume).first()
        if obj:
            current = obj.text

    user_data = {
        "title": personal.job_title if personal else "",
        "skills": skills_text,
        "experience_context": request.data.get("experience_context", "")
    }

    result = vertex_service.generate_summary(user_data, action, current)

    obj, _ = ResumeSummary.objects.get_or_create(resume=resume)
    obj.text = result
    obj.save()

    return Response({"success": True, "result": result})


# ---------------- PROJECTS ----------------
@api_view(['POST'])
def ai_generate_projects(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")

    if not resume_id:
        return Response({"error": "resume_id required"}, status=400)

    resume = get_object_or_404(Resume, id=resume_id)

    personal = ResumePersonalInfo.objects.filter(resume=resume).first()
    skills = ResumeSkill.objects.filter(resume=resume)
    skills_text = ", ".join([s.name for s in skills])

    current = ""
    if action == "improve":
        projects = ResumeProject.objects.filter(resume=resume)
        current = "\n".join([p.description for p in projects])

    user_data = {
        "title": personal.job_title if personal else "",
        "tech_stack": skills_text,
        "context": request.data.get("context", ""),
        "num_projects": request.data.get("num_projects", 3)
    }

    result = vertex_service.generate_projects(user_data, action, current)

    return Response({"success": True, "result": result})


# ---------------- EXPERIENCE ----------------
@api_view(['POST'])
def ai_generate_experience(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")

    if not resume_id:
        return Response({"error": "resume_id required"}, status=400)

    resume = get_object_or_404(Resume, id=resume_id)

    personal = ResumePersonalInfo.objects.filter(resume=resume).first()
    skills = ResumeSkill.objects.filter(resume=resume)
    skills_text = ", ".join([s.name for s in skills])

    current = ""
    if action == "improve":
        experiences = ResumeExperience.objects.filter(resume=resume)
        current = "\n".join([e.description for e in experiences])

    user_data = {
        "role": personal.job_title if personal else "",
        "company": request.data.get("company", "Company"),
        "duration": request.data.get("duration", "Present"),
        "responsibilities": request.data.get("responsibilities", ""),
        "tech_stack": skills_text
    }

    result = vertex_service.generate_experience(user_data, action, current)

    return Response({"success": True, "result": result})
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

# ---------------- CERTIFICATIONS ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_certifications(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")
    industry = request.data.get("industry", "Technology")
    certification_name = request.data.get("certification_name", "")
    issuer = request.data.get("issuer", "")
    keywords = request.data.get("keywords", "")
    current_text = request.data.get("current_text", "")

    if not resume_id or resume_id == "null":
        user_data = {
            "title": request.data.get("title", ""),
            "skills": request.data.get("skills", ""),
            "industry": industry,
            "certification_name": certification_name,
            "issuer": issuer,
            "keywords": keywords,
            "current_text": current_text,
        }
        mode = "preview"
    else:
        resume = get_object_or_404(Resume, id=resume_id)
        personal = ResumePersonalInfo.objects.filter(resume=resume).first()
        skills = ResumeSkill.objects.filter(resume=resume)
        skills_text = ", ".join([s.name for s in skills])

        user_data = {
            "title": personal.job_title if personal else "",
            "skills": skills_text,
            "industry": industry,
            "certification_name": certification_name,
            "issuer": issuer,
            "keywords": keywords,
            "current_text": current_text,
        }
        mode = "saved"

    try:
        result = vertex_service.generate_certifications(user_data, action, current_text)
        return _vertex_success_response(result, mode=mode)
    except Exception as exc:
        return _vertex_error_response(exc, "Certification generation")


# ---------------- SKILLS ----------------
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_suggest_skills(request):
    resume_id = request.data.get("resume_id")
    level = request.data.get("level", "Intermediate")

    if not resume_id or resume_id == "null":
        # PREVIEW MODE
        user_data = {
            "title": request.data.get("title", ""),
            "current_skills": request.data.get("current_skills", ""),
            "level": level
        }
    else:
        # NORMAL MODE
        resume = get_object_or_404(Resume, id=resume_id)
        personal = ResumePersonalInfo.objects.filter(resume=resume).first()
        skills = ResumeSkill.objects.filter(resume=resume)
        
        user_data = {
            "title": personal.job_title if personal else "",
            "current_skills": ", ".join([s.name for s in skills]),
            "level": level
        }

    try:
        result = vertex_service.generate_skills(user_data)
        return Response({"success": True, "result": result})
    except Exception as exc:
        return _vertex_error_response(exc, "Skill suggestion")

# ---------------- EDUCATION ----------------
@api_view(['POST'])
def ai_generate_education(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")

    if not resume_id:
        return Response({"error": "resume_id required"}, status=400)

    resume = get_object_or_404(Resume, id=resume_id)

    current = ""
    if action == "improve":
        edu = ResumeUGEducation.objects.filter(resume=resume).first()
        if edu:
            current = f"{edu.degree} {edu.branch}"

    user_data = {
        "degree": request.data.get("degree", "Bachelor's"),
        "field": request.data.get("field", "CS"),
        "university": request.data.get("university", "University"),
        "year": request.data.get("year", "2024"),
        "coursework": request.data.get("coursework", "")
    }

    result = vertex_service.generate_education(user_data, action, current)

    return Response({"success": True, "result": result})


# ---------------- SKILLS ----------------
@api_view(['POST'])
def ai_suggest_skills(request):
    resume_id = request.data.get("resume_id")

    if not resume_id:
        return Response({"error": "resume_id required"}, status=400)

    resume = get_object_or_404(Resume, id=resume_id)

    personal = ResumePersonalInfo.objects.filter(resume=resume).first()
    skills = ResumeSkill.objects.filter(resume=resume)
    skills_text = ", ".join([s.name for s in skills])

    user_data = {
        "title": personal.job_title if personal else "",
        "current_skills": skills_text,
        "level": request.data.get("level", "Intermediate")
    }

    result = vertex_service.generate_skills(user_data)

    return Response({"success": True, "result": result})


# ---------------- HEALTH ----------------
@api_view(['GET'])
def ai_health_check(request):
    return Response({
        "status": "ok",
        "vertex": {
            "configured": True,
            "project": settings.VERTEX_PROJECT_ID,
            "location": settings.VERTEX_LOCATION,
            "model": settings.VERTEX_MODEL,
        },
    })



import requests
from google.auth import default
from google.auth.transport.requests import Request
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def test_vertex_rest(request):
    try:
        # ✅ Get credentials automatically (ADC)
        credentials, project = default()
        credentials.refresh(Request())

        token = credentials.token

        model_path = (
            f"projects/{settings.VERTEX_PROJECT_ID}/locations/{settings.VERTEX_LOCATION}/"
            f"publishers/google/models/{settings.VERTEX_MODEL}"
        )
        url = f"https://aiplatform.googleapis.com/v1/{model_path}:generateContent"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": "Write a resume summary"}]
                }
            ]
        }

        response = requests.post(url, headers=headers, json=data)

        return Response({
            "status_code": response.status_code,
            "response": response.json()
        })

    except Exception as e:
        return Response({"error": str(e)})


# ============================================================
# Vertex AI endpoint overrides for clearer local debugging
# ============================================================
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny

# Helper for error responses
def _vertex_error_response(exc, label: str):
    return Response(
        {
            "success": False,
            "error": f"{label} failed",
            "detail": str(exc),
        },
        status=status.HTTP_502_BAD_GATEWAY,
    )


def _vertex_success_response(result, mode=None):
    payload = {
        "success": True,
        "options": result.get("options", []),
    }
    if mode:
        payload["mode"] = mode
    return Response(payload)

# ---------------- EXPERIENCE ----------------
@api_view(["POST"])
@permission_classes([AllowAny])
def ai_generate_experience(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")
    company = request.data.get("company", "")
    role = request.data.get("role", "")
    responsibilities = request.data.get("responsibilities", "")
    keywords = request.data.get("keywords", "")
    current_text = request.data.get("current_text", "")

    if not resume_id or resume_id == "null":
        user_data = {
            "role": role,
            "company": company,
            "duration": "Present",
            "responsibilities": responsibilities,
            "tech_stack": "",
            "keywords": keywords,
            "current_text": current_text,
            "target_word_count": request.data.get("target_word_count", 200),
        }
        mode = "preview"
    else:
        resume = get_object_or_404(Resume, id=resume_id)
        skills = ResumeSkill.objects.filter(resume=resume)
        skills_text = ", ".join([s.name for s in skills])

        user_data = {
            "role": role or (resume.personal_info.job_title if hasattr(resume, "personal_info") else ""),
            "company": company or "Company",
            "duration": "Present",
            "responsibilities": responsibilities,
            "tech_stack": skills_text,
            "keywords": keywords,
            "current_text": current_text,
            "target_word_count": request.data.get("target_word_count", 200),
        }
        mode = "saved"

    try:
        result = vertex_service.generate_experience(user_data, action, current_text)
        return _vertex_success_response(result, mode=mode)
    except Exception as exc:
        return _vertex_error_response(exc, "Experience generation")

# ---------------- PROJECTS ----------------
@api_view(["POST"])
@permission_classes([AllowAny])
def ai_generate_projects(request):
    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")
    context = request.data.get("context", "")
    project_name = request.data.get("project_name", "")
    tech_stack = request.data.get("tech_stack", "")
    keywords = request.data.get("keywords", "")
    current_text = request.data.get("current_text", "")

    if not resume_id or resume_id == "null":
        user_data = {
            "title": request.data.get("title", ""),
            "project_name": project_name,
            "tech_stack": tech_stack,
            "keywords": keywords,
            "context": context,
            "current_text": current_text,
            "num_projects": request.data.get("num_projects", 3),
            "target_word_count": request.data.get("target_word_count", 250),
        }
        mode = "preview"
    else:
        resume = get_object_or_404(Resume, id=resume_id)
        skills = ResumeSkill.objects.filter(resume=resume)
        user_data = {
            "title": resume.personal_info.job_title if hasattr(resume, "personal_info") else "",
            "project_name": project_name,
            "tech_stack": tech_stack or ", ".join([s.name for s in skills]),
            "keywords": keywords,
            "context": context,
            "current_text": current_text,
            "num_projects": request.data.get("num_projects", 3),
            "target_word_count": request.data.get("target_word_count", 250),
        }
        mode = "saved"

    try:
        result = vertex_service.generate_projects(user_data, action, current_text)
        return _vertex_success_response(result, mode=mode)
    except Exception as exc:
        return _vertex_error_response(exc, "Project generation")

# ---------------- EDUCATION ----------------
@api_view(["POST"])
@permission_classes([AllowAny])
def ai_generate_education(request):
    resume_id = request.data.get("resume_id")
    user_data = {
        "degree": request.data.get("degree", "Bachelor's"),
        "field": request.data.get("field", "CS"),
        "university": request.data.get("university", "University"),
        "year": request.data.get("year", "2024"),
        "coursework": request.data.get("coursework", ""),
        "keywords": request.data.get("keywords", ""),
        "current_text": request.data.get("current_text", ""),
        "target_word_count": request.data.get("target_word_count", 150),
    }

    try:
        result = vertex_service.generate_education(
            user_data,
            request.data.get("action", "generate"),
            user_data["current_text"],
        )
        return _vertex_success_response(result, mode="preview" if not resume_id or resume_id == "null" else "saved")
    except Exception as exc:
        return _vertex_error_response(exc, "Education generation")


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_suggest_skills(request):
    resume_id = request.data.get("resume_id")
    level = request.data.get("level", "Intermediate")

    if not resume_id or resume_id == "null":
        user_data = {
            "title": request.data.get("title", ""),
            "current_skills": request.data.get("current_skills", ""),
            "level": level,
        }
        mode = "preview"
    else:
        resume = get_object_or_404(Resume, id=resume_id)
        personal = ResumePersonalInfo.objects.filter(resume=resume).first()
        skills = ResumeSkill.objects.filter(resume=resume)

        user_data = {
            "title": personal.job_title if personal else "",
            "current_skills": ", ".join([s.name for s in skills]),
            "level": level,
        }
        mode = "saved"

    try:
        result = vertex_service.generate_skills(user_data)
    except Exception as exc:
        return _vertex_error_response(exc, "Skill suggestion")

    return Response({"success": True, "result": result, "mode": mode})


@api_view(["GET"])
@permission_classes([AllowAny])
def ai_health_check(request):
    return Response(
        {
            "status": "ok",
            "vertex": {
                "configured": True,
                "project": settings.VERTEX_PROJECT_ID,
                "location": settings.VERTEX_LOCATION,
                "model": settings.VERTEX_MODEL,
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def test_vertex_rest(request):
    try:
        credentials, project = default()
        credentials.refresh(Request())

        model_path = (
            f"projects/{settings.VERTEX_PROJECT_ID}/locations/{settings.VERTEX_LOCATION}/"
            f"publishers/google/models/{settings.VERTEX_MODEL}"
        )
        url = f"https://aiplatform.googleapis.com/v1/{model_path}:generateContent"
        headers = {
            "Authorization": f"Bearer {credentials.token}",
            "Content-Type": "application/json",
        }
        data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": "Write a resume summary"}],
                }
            ]
        }

        response = requests.post(url, headers=headers, json=data, timeout=60)

        return Response(
            {
                "status_code": response.status_code,
                "response": response.json(),
                "model_path": model_path,
                "resolved_project": project,
            },
            status=response.status_code if response.status_code >= 400 else status.HTTP_200_OK,
        )
    except Exception as exc:
        return Response(
            {
                "status_code": 500,
                "error": str(exc),
                "project": settings.VERTEX_PROJECT_ID,
                "location": settings.VERTEX_LOCATION,
                "model": settings.VERTEX_MODEL,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def ai_generate_summary(request):

    if request.method == "GET":
        return Response(
            {
                "success": False,
                "message": "Use POST /api/ai/summary/",
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    # ❌ REMOVE strict auth block (optional for preview)
    # if not request.user or not request.user.is_authenticated:
    #     return Response({"error": "Authentication required"}, status=401)

    resume_id = request.data.get("resume_id")
    action = request.data.get("action", "generate")
    keywords = request.data.get("keywords", "")
    current_text = request.data.get("current_text", "")



    # =========================================================
    # ✅ PREVIEW MODE (NO resume_id)
    # =========================================================
    if not resume_id:
        user_data = {
            "title": request.data.get("title", ""),
            "skills": request.data.get("skills", ""),
            "keywords": keywords,
            "experience_context": request.data.get("experience_context", ""),
            "current_text": current_text,
            "target_word_count": request.data.get("target_word_count", 100),
        }

        try:
            result = vertex_service.generate_summary(user_data, action, current_text)
        except Exception as exc:
            return _vertex_error_response(exc, "Summary generation")

        return _vertex_success_response(result, mode="preview")

    # =========================================================
    # ✅ NORMAL MODE (WITH resume_id)
    # =========================================================
    resume = get_object_or_404(Resume, id=resume_id)

    personal = ResumePersonalInfo.objects.filter(resume=resume).first()
    skills = ResumeSkill.objects.filter(resume=resume)
    skills_text = ", ".join([s.name for s in skills])

    current = current_text
    if not current and action == "improve":
        obj = ResumeSummary.objects.filter(resume=resume).first()
        if obj:
            current = obj.text

    user_data = {
        "title": personal.job_title if personal else "",
        "skills": skills_text,
        "keywords": keywords,
        "experience_context": request.data.get("experience_context", ""),
        "current_text": current_text,
        "target_word_count": request.data.get("target_word_count", 100),
    }

    try:
        result = vertex_service.generate_summary(user_data, action, current)
    except Exception as exc:
        return _vertex_error_response(exc, "Summary generation")

    return _vertex_success_response(result, mode="saved")
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated  # Add this

import fitz

from .models import (
    SkillGapResume,
    SkillGapAnalysis,
    SkillAnalysis,
    JobRoleMatch,
    AICareerSuggestion,
    LearningRoadmap,
    ImprovementTip,
    FocusArea,
)

from .serializers import (
    SkillGapAnalysisSerializer
)

from .vertex_ai_service import (
    vertex_service
)
import fitz
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from .models import (
    SkillGapResume,
    SkillGapAnalysis,
    SkillAnalysis,
    JobRoleMatch,
    AICareerSuggestion,
    LearningRoadmap,
    ImprovementTip,
    FocusArea,
    ResumeMetric,
)

from .serializers import (
    SkillGapAnalysisSerializer
)

from .vertex_ai_service import (
    vertex_service
)

from .vertex_ai_service import (
    vertex_service
)
import pytesseract
from PIL import Image
import io
class AnalyzeSkillGapAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            resume_file = request.FILES.get("resume")
            job_description = request.data.get("job_description")
            job_title = request.data.get("job_title", "")
            company_name = request.data.get("company_name", "")

            if not resume_file:
                return Response({"success": False, "message": "Resume file required"}, status=400)

            if not job_description:
                return Response({"success": False, "message": "Job description required"}, status=400)

            # ── Extract text from file ──────────────────────────────────────
            pdf_text = ""
            resume_bytes = resume_file.read() # Read once to avoid cursor issues

            if resume_file.name.endswith('.txt'):
                pdf_text = resume_bytes.decode('utf-8')
            else:
                # 1. Try standard text extraction first
                pdf_document = fitz.open(stream=resume_bytes, filetype="pdf")
                for page in pdf_document:
                    pdf_text += page.get_text()
                
                # 2. 🔥 FIX: Fallback to OCR if extracted text is too short or missing (Scanned PDFs)
                if len(pdf_text.strip()) < 150: 
                    print("⚠️ Standard text extraction failed or insufficient. Switching to OCR...")
                    pdf_text = "" # Reset
                    for page in pdf_document:
                        # Render page to a high-res image (pixmap)
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) 
                        image_data = pix.tobytes("png")
                        image = Image.open(io.BytesIO(image_data))
                        
                        # Run OCR on the page image
                        page_ocr_text = pytesseract.image_to_string(image)
                        pdf_text += page_ocr_text + "\n"
                
                pdf_document.close()

            print(f"📄 Total Extracted Text Length: {len(pdf_text)}")  # Debug

            # Protect against entirely unreadable files
            if len(pdf_text.strip()) < 10:
                return Response({
                    "success": False, 
                    "message": "Could not read the resume text. Please ensure the file is not corrupted or password-protected."
                }, status=400)

            # ── Store resume ────────────────────────────────────────────────
            skill_gap_resume = SkillGapResume.objects.create(
                user=user,
                resume_pdf=resume_file,
                extracted_text=pdf_text
            )

            # ── AI Analysis ─────────────────────────────────────────────────
            ai_response = vertex_service.analyze_skill_gap(
                resume_text=pdf_text,
                job_description=job_description
            )
            print("AI Response received:", ai_response)
            
            # Get resume detection result
            detection_result = None
            try:
                detection_result = vertex_service.detect_resume_authenticity(
                    resume_text=pdf_text,
                    job_description=job_description,
                    ats_score=ai_response.get("ats_score", 65)
                )
                detection_result['analyzed_from_text'] = bool(pdf_text and len(pdf_text) > 100)
                print("Detection result received")
            except Exception as detect_error:
                print(f"Detection error (non-critical): {detect_error}")
                detection_result = {
                    "resume_type": "Hybrid",
                    "detection_confidence": "Low",
                    "ai_written_probability": 35,
                    "human_written_probability": 65,
                    "ai_signals": ["Detection service temporarily unavailable"],
                    "human_signals": ["Unable to perform deep analysis"],
                    "strengths": ["Basic resume structure detected"],
                    "red_flags": ["Limited analysis available"],
                    "recommendation": "Please try again later for complete detection.",
                    "analyzed_from_text": False
                }

            # ── Create Analysis Record ─────────────────────────────────────
            analysis = SkillGapAnalysis.objects.create(
                user=user,
                resume=skill_gap_resume,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                ats_score=ai_response.get("ats_score", 65),
                match_score=ai_response.get("match_score", 60),
                gap_score=ai_response.get("gap_score", 40),
                resume_quality_score=ai_response.get("ats_score", 65),
                open_jobs=ai_response.get("open_jobs", 0),
                salary_range=ai_response.get("salary_range", ""),
                growth_rate=ai_response.get("growth_rate", ""),
            )

            # ── Resume Metrics ─────────────────────────────────────────────
            for metric in ai_response.get("resume_metrics", []):
                ResumeMetric.objects.create(
                    analysis=analysis,
                    metric_type=metric.get("metric_type", "").upper().replace(" ", "_"),
                    score=metric.get("score", 70),
                    label=metric.get("label", "")
                )

            # ── Skills ─────────────────────────────────────────────────────
            for skill in ai_response.get("skills", []):
                SkillAnalysis.objects.create(
                    analysis=analysis,
                    skill_name=skill.get("skill_name", ""),
                    status=skill.get("status", "MATCHED").upper(),
                    priority="HIGH" if skill.get("status", "").upper() == "MISSING" else "MEDIUM",
                    score=skill.get("score", 70)
                )

            # ── Job Matches ────────────────────────────────────────────────
            for item in ai_response.get("job_matches", []):
                JobRoleMatch.objects.create(
                    analysis=analysis,
                    role_name=item.get("role_name", item.get("role", "")),
                    match_percentage=item.get("match_percentage", 0),
                    average_salary=item.get("average_salary", ""),
                    demand_level=item.get("demand_level", "")
                )

            # ── Career Suggestions ─────────────────────────────────────────
            for item in ai_response.get("career_suggestions", []):
                AICareerSuggestion.objects.create(
                    analysis=analysis,
                    skill_name=item.get("skill_name", item.get("skill", "")),
                    role_name=item.get("role_name", item.get("role", "")),
                    is_matched=True
                )

            # ── Learning Roadmap ───────────────────────────────────────────
            roadmap_data = ai_response.get("learning_roadmaps", ai_response.get("learning_roadmap", []))
            for item in roadmap_data:
                LearningRoadmap.objects.create(
                    analysis=analysis,
                    skill_name=item.get("skill_name", item.get("skill", "")),
                    youtube_link=item.get("youtube_link", ""),
                    google_link=item.get("google_link", "")
                )

            # ── Improvement Tips ───────────────────────────────────────────
            for item in ai_response.get("improvement_tips", []):
                raw_impact = item.get("impact_percentage", item.get("impact", ""))
                impact_str = str(raw_impact) if raw_impact != "" else ""
                ImproveTip = ImprovementTip.objects.create(
                    analysis=analysis,
                    title=item.get("title", ""),
                    impact_percentage=impact_str,
                    description=item.get("description", item.get("title", ""))
                )

            # ── Focus Areas ────────────────────────────────────────────────
            for item in ai_response.get("focus_areas", []):
                FocusArea.objects.create(
                    analysis=analysis,
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    priority=item.get("priority", "MEDIUM")
                )
            
            # Save detection result to database
            try:
                ResumeDetection.objects.create(
                    user=user,
                    analysis=analysis,
                    resume_type=detection_result.get('resume_type', 'HYBRID').upper().replace('-', '_'),
                    detection_confidence=detection_result.get('detection_confidence', 'MEDIUM').upper(),
                    ai_written_probability=detection_result.get('ai_written_probability', 50),
                    human_written_probability=detection_result.get('human_written_probability', 50),
                    ai_signals=detection_result.get('ai_signals', []),
                    human_signals=detection_result.get('human_signals', []),
                    strengths=detection_result.get('strengths', []),
                    red_flags=detection_result.get('red_flags', []),
                    recommendation=detection_result.get('recommendation', '')
                )
            except Exception as e:
                print(f"Could not save detection: {e}")

            serializer = SkillGapAnalysisSerializer(analysis)
            
            # Add extracted text to response
            response_data = serializer.data
            response_data['resume_detection'] = detection_result
            response_data['extracted_resume_text'] = pdf_text 
            
            print(f"📝 Sending extracted text length: {len(pdf_text)}")

            return Response({
                "success": True,
                "message": "Skill Gap Analysis Completed",
                "data": response_data
            }, status=200)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"success": False, "message": str(e)}, status=500)
# Add this import at the top of views.py if not already present
from .models import ResumeDetection
from .serializers import ResumeDetectionSerializer

# Add this class at the end of views.py (before the final closing)
# ============================================================
# RESUME DETECTION API ENDPOINT
# ============================================================

class DetectResumeAPIView(APIView):
    """
    Detect if a resume is AI-written or human-written using Vertex AI.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get request data
            ats_score = request.data.get('ats_score', 65)
            resume_text = request.data.get('resume_text', '')
            job_description = request.data.get('job_description', '')
            analysis_id = request.data.get('analysis_id')
            
            # Validate inputs
            if not resume_text:
                return Response({
                    "success": False,
                    "error": "Resume text is required for analysis",
                    "data": self._get_fallback_detection_response("No resume text provided")
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # If analysis_id is provided, try to get more context from the analysis
            analysis = None
            if analysis_id:
                try:
                    analysis = SkillGapAnalysis.objects.get(id=analysis_id)
                    # If job_description is empty, try to get it from stored analysis
                    if not job_description:
                        job_description = analysis.job_description
                    # Use the stored ATS score if not provided
                    if ats_score == 65:
                        ats_score = analysis.ats_score
                except SkillGapAnalysis.DoesNotExist:
                    pass  # Continue without analysis context
            
            # Call Vertex AI for detection
            result = vertex_service.detect_resume_authenticity(
                resume_text=resume_text,
                job_description=job_description or "No specific job description provided",
                ats_score=ats_score
            )
            
            # Add flag indicating whether analysis was done from actual text
            result['analyzed_from_text'] = bool(resume_text and len(resume_text) > 100)
            
            # Save detection result to database
            try:
                # Get the LernevoUser instance
                lernevo_user = User.objects.get(auth_user=request.user)
                
                detection = ResumeDetection.objects.create(
                    user=lernevo_user,
                    analysis=analysis if analysis_id else None,
                    resume_type=result.get('resume_type', 'HYBRID').upper().replace('-', '_'),
                    detection_confidence=result.get('detection_confidence', 'MEDIUM').upper(),
                    ai_written_probability=result.get('ai_written_probability', 50),
                    human_written_probability=result.get('human_written_probability', 50),
                    ai_signals=result.get('ai_signals', []),
                    human_signals=result.get('human_signals', []),
                    strengths=result.get('strengths', []),
                    red_flags=result.get('red_flags', []),
                    recommendation=result.get('recommendation', '')
                )
                logger.info(f"Resume detection saved with ID: {detection.id}")
            except Exception as e:
                logger.warning(f"Could not save detection result: {e}")
            
            return Response({
                "success": True,
                "message": "Resume analysis completed successfully",
                "data": result
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Resume detection error: {str(e)}", exc_info=True)
            return Response({
                "success": False,
                "error": str(e),
                "data": self._get_fallback_detection_response(str(e))
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_fallback_detection_response(self, error_msg: str = "") -> Dict:
        """Return fallback response when detection fails."""
        return {
            "resume_type": "Hybrid",
            "detection_confidence": "Low",
            "ai_written_probability": 30,
            "human_written_probability": 70,
            "ai_signals": [
                "Analysis could not be completed: " + error_msg if error_msg else "AI detection service temporarily unavailable"
            ],
            "human_signals": [],
            "strengths": [
                "Please try again later for complete analysis"
            ],
            "red_flags": [
                "Unable to perform deep content analysis"
            ],
            "recommendation": "Your resume appears to be human-written based on basic patterns. For better analysis, ensure your resume has sufficient content (at least 500 characters).",
            "analyzed_from_text": False
        }
        
        
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import User
import json

@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def user_management_api(request):
    """
    ONE API FOR EVERYTHING
    
    GET    - Get all users
    POST   - Update last login / Toggle freeze / Update status
    """
    
    # ========== GET ALL USERS ==========
    if request.method == 'GET':
        try:
            users = User.objects.select_related('auth_user').filter(is_delete=False)
            
            data = []
            for user in users:
                data.append({
                    'id': str(user.id),
                    'username': user.auth_user.username,
                    'email': user.auth_user.email,
                    'country_code': user.country_code,
                    'mobile': user.mobile if user.mobile else '-',
                    'user_code': user.user_code,
                    'is_frozen': user.is_frozen,
                    'is_first_login': user.is_first_login,
                    'registered_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never',
                })
            
            return JsonResponse({
                'success': True,
                'action': 'get_all_users',
                'count': len(data),
                'users': data
            })
        
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    # ========== POST - Various Actions ==========
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            action = body.get('action')
            user_id = body.get('user_id')
            
            # ---------- Action 1: Update Last Login ----------
            if action == 'update_last_login':
                user = User.objects.get(id=user_id)
                user.last_login = timezone.now()
                user.is_first_login = False
                user.save()
                
                return JsonResponse({
                    'success': True,
                    'action': 'update_last_login',
                    'message': 'Last login updated successfully',
                    'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S')
                })
            
            # ---------- Action 2: Toggle Freeze/Unfreeze ----------
            elif action == 'toggle_freeze':
                user = User.objects.get(id=user_id)
                user.is_frozen = not user.is_frozen
                
                if user.is_frozen:
                    user.frozen_at = timezone.now()
                    message = 'User frozen successfully'
                else:
                    user.unfrozen_at = timezone.now()
                    message = 'User unfrozen successfully'
                
                user.save()
                
                return JsonResponse({
                    'success': True,
                    'action': 'toggle_freeze',
                    'message': message,
                    'is_frozen': user.is_frozen
                })
            
            # ---------- Action 3: Get Single User ----------
            elif action == 'get_user':
                user = User.objects.select_related('auth_user').get(id=user_id)
                
                return JsonResponse({
                    'success': True,
                    'action': 'get_user',
                    'user': {
                        'id': str(user.id),
                        'username': user.auth_user.username,
                        'email': user.auth_user.email,
                        'country_code': user.country_code,
                        'mobile': user.mobile,
                        'user_code': user.user_code,
                        'is_frozen': user.is_frozen,
                        'is_first_login': user.is_first_login,
                        'registered_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                        'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never',
                    }
                })
            
            # ---------- Action 4: Update First Login Status ----------
            elif action == 'update_first_login':
                user = User.objects.get(id=user_id)
                user.is_first_login = False
                user.save()
                
                return JsonResponse({
                    'success': True,
                    'action': 'update_first_login',
                    'message': 'First login status updated'
                })
            
            # ---------- Action 5: Get Statistics ----------
            elif action == 'get_stats':
                total = User.objects.filter(is_delete=False).count()
                active = User.objects.filter(is_delete=False, is_frozen=False).count()
                frozen = User.objects.filter(is_delete=False, is_frozen=True).count()
                first_login = User.objects.filter(is_delete=False, is_first_login=True).count()
                
                return JsonResponse({
                    'success': True,
                    'action': 'get_stats',
                    'stats': {
                        'total': total,
                        'active': active,
                        'frozen': frozen,
                        'first_login': first_login
                    }
                })
            
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid action. Available: update_last_login, toggle_freeze, get_user, update_first_login, get_stats'
                }, status=400)
        
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    # ========== DELETE - Soft Delete User ==========
    elif request.method == 'DELETE':
        try:
            body = json.loads(request.body)
            user_id = body.get('user_id')
            
            user = User.objects.get(id=user_id)
            user.is_delete = True
            user.deleted_at = timezone.now()
            user.save()
            
            return JsonResponse({
                'success': True,
                'action': 'delete_user',
                'message': 'User deleted successfully'
            })
        
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)