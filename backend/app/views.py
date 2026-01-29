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

# ---------------- Register View ----------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Login View ----------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            auth_user = serializer.validated_data['user']

            # 1. Deactivate old OTPs
            UserOTP.objects.filter(user=auth_user, is_used=False).update(is_used=True, deleted_at=now())

            # 2. Create new OTP
            otp_code = uuid.uuid4().hex[:6].upper()
            UserOTP.objects.create(user=auth_user, otp_code=otp_code, expires_at=now() + timedelta(minutes=5))

            # 3. Send OTP via email only
            self.send_otp_email(auth_user.email, otp_code)

            return Response({"message": "OTP sent to Email", "otp_required": True}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_otp_email(self, email, otp):
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


# ---------------- OTP Verification View ----------------
class OTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp_code = request.data.get("otp")

        try:
            user = AuthUser.objects.get(username=username)
            user_otp = UserOTP.objects.filter(
                user=user, 
                otp_code=otp_code, 
                is_used=False, 
                expires_at__gte=now()
            ).first()

            if not user_otp:
                return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

            # Mark OTP as used
            user_otp.is_used = True
            user_otp.deleted_at = now()
            user_otp.save()

            # Create or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"message": "Login successful", "token": token.key}, status=status.HTTP_200_OK)

        except AuthUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
