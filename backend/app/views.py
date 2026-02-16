import token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User as AuthUser
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.timezone import now

from datetime import timedelta
import uuid
from .models import UserProfile
from .models import User, UserOTP
from .serializers import RegisterSerializer, LoginSerializer
from .serializers import ProfileSerializer, ProfileImageSerializer
from .models import User as LernevoUser   
import logging
logger = logging.getLogger(__name__)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get("email")

            otp_verified = UserOTP.objects.filter(email=email, is_used=True).exists()
            if not otp_verified:
                return Response({"detail": "Email not verified via OTP"}, status=400)

            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            auth_user = serializer.save()

            # Get custom user
            from .models import User as LernevoUser
            custom_user = LernevoUser.objects.get(auth_user=auth_user)

            token = None
            try:
                token = Token.objects.get(user=auth_user)  # first try to get
            except Token.DoesNotExist:
                token = Token.objects.create(user=auth_user)  # if not, create

            if not token:
                return Response({"detail": "Token creation failed"}, status=500)

            return Response(
                {
                    "message": "User registered successfully",
                    "token": token.key,
                    "user_code": custom_user.user_code
                },
                status=201
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"RegisterView error: {str(e)}", exc_info=True)
            return Response({"detail": "Internal server error"}, status=500)
# ---------------- OTP for registration only ----------------
class OTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # ❌ Already registered email
        if AuthUser.objects.filter(email=email).exists():
            return Response({"detail": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        # ================= SEND OTP =================
        if not otp_code:
            # invalidate old OTPs
            UserOTP.objects.filter(email=email, is_used=False).update(is_used=True)

            otp = uuid.uuid4().hex[:6].upper()

            UserOTP.objects.create(
                email=email,
                otp_code=otp,
                expires_at=now() + timedelta(minutes=5)
            )

            self.send_otp_email(email, otp)
            return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)

        # ================= VERIFY OTP =================
        otp_code = otp_code.upper()

        otp_obj = UserOTP.objects.filter(
            email=email,
            otp_code=otp_code,
            is_used=False,
            expires_at__gte=now()
        ).first()

        if not otp_obj:
            return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.is_used = True
        otp_obj.used_at = now()
        otp_obj.save()

        return Response({"message": "Email verified"}, status=status.HTTP_200_OK)

    def send_otp_email(self, email, otp):
        subject = "Your OTP Code"
        text = f"Your OTP is {otp}. It expires in 5 minutes."
        html = f"<p>Your OTP is <b>{otp}</b>. It expires in 5 minutes.</p>"

        mail = EmailMultiAlternatives(
            subject,
            text,
            "no-reply@example.com",
            [email]
        )
        mail.attach_alternative(html, "text/html")
        mail.send()

from django.db.models import Q


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # input-ai eduthu trim seithu lower case-ku maathuvom
        identifier = request.data.get("username", "").strip().lower() 
        password = request.data.get("password")

        if not identifier or not password:
            return Response(
                {"detail": "Username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Inga dhaan logic: identifier-ai username matrum email rendu koodavum match panni paarkurom
        user = AuthUser.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()

        if not user:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Password correct-aa nu check pannuvom
        if not user.check_password(password):
            return Response(
                {"detail": "Invalid password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Token generate panni anupuvom
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful", 
                "token": token.key,
                "user_name": user.username # Frontend-ku real username-aiye anupuvom
            },
            status=status.HTTP_200_OK
        )


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
