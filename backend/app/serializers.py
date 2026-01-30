from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from django.contrib.auth import authenticate
from .models import User, Role, UserProfile, Organization, WellnessType

from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from .models import User


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    mobile = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        mobile = validated_data["mobile"]
        password = validated_data["password"]

        # ❌ Username already exists
        if AuthUser.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "username": "Username already exists"
            })

        # ❌ Email already exists
        if AuthUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "Email already registered"
            })

        # ❌ Mobile already exists (IMPORTANT 🔥)
        if User.objects.filter(mobile=mobile, is_delete=False).exists():
            raise serializers.ValidationError({
                "mobile": "Mobile number already registered"
            })

        # ✅ Create Auth user
        auth_user = AuthUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # ✅ Create custom User with mobile
        User.objects.create(
            auth_user=auth_user,
            mobile=mobile
        )

        return auth_user



# ---------------- Login Serializer ----------------
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        attrs['user'] = user
        return attrs
