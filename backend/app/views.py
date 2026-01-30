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

from .models import User, UserOTP
from .serializers import RegisterSerializer, LoginSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        # check OTP verified
        otp_verified = UserOTP.objects.filter(
            email=email,
            is_used=True
        ).exists()

        if not otp_verified:
            return Response(
                {"detail": "Email not verified via OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        auth_user = serializer.save()   # AuthUser

        # 🔥 Get custom User (where user_code is stored)
        custom_user = auth_user.lernevo_user

        token, _ = Token.objects.get_or_create(user=auth_user)

        return Response(
            {
                "message": "User registered successfully",
                "token": token.key,
                "user_code": custom_user.user_code  
            },
            status=status.HTTP_201_CREATED
        )


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



# ---------------- Login without OTP ----------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = AuthUser.objects.filter(username=username).first()
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"detail": "Invalid password"}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"message": "Login successful", "token": token.key}, status=status.HTTP_200_OK)


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