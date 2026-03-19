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
from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from .models import User as LernevoUser

class ProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    mobile = serializers.CharField(required=False)
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        # If you add role later, update this
        return "Member"

    def update(self, instance, validated_data):
        auth_user = instance.auth_user

        if "username" in validated_data:
            auth_user.username = validated_data["username"]

        if "email" in validated_data:
            auth_user.email = validated_data["email"]

        auth_user.save()

        if "mobile" in validated_data:
            instance.mobile = validated_data["mobile"]
            instance.save()

        return instance
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
class ProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["profile_image"]


from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["id", "created_at", "is_resolved"]

from .models import Enquiry
from rest_framework import serializers

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = "__all__"


from .models import DemoBooking
from rest_framework import serializers

class DemoBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemoBooking
        fields = "__all__"













from rest_framework import serializers
from .models import *

# -------------------------
# CHILD SERIALIZERS
# -------------------------

class ResumePersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumePersonalInfo
        fields = '__all__'


class ResumeExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeExperience
        fields = '__all__'


class ResumeEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeEducation
        fields = '__all__'


class ResumeSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSkill
        fields = '__all__'


# -------------------------
# MAIN RESUME SERIALIZER
# -------------------------

class ResumeSerializer(serializers.ModelSerializer):
    personal_info = ResumePersonalInfoSerializer()
    experiences = ResumeExperienceSerializer(many=True)
    educations = ResumeEducationSerializer(many=True)
    skills = ResumeSkillSerializer(many=True)

    class Meta:
        model = Resume
        fields = '__all__'

    # 🔥 CREATE (IMPORTANT)
    def create(self, validated_data):
        personal_data = validated_data.pop('personal_info')
        experiences_data = validated_data.pop('experiences')
        educations_data = validated_data.pop('educations')
        skills_data = validated_data.pop('skills')

        resume = Resume.objects.create(**validated_data)

        # personal
        ResumePersonalInfo.objects.create(
            resume=resume, **personal_data
        )

        # experiences
        for exp in experiences_data:
            ResumeExperience.objects.create(resume=resume, **exp)

        # education
        for edu in educations_data:
            ResumeEducation.objects.create(resume=resume, **edu)

        # skills
        for skill in skills_data:
            ResumeSkill.objects.create(resume=resume, **skill)

        return resume

    # 🔥 UPDATE
    def update(self, instance, validated_data):
        personal_data = validated_data.pop('personal_info')
        experiences_data = validated_data.pop('experiences')
        educations_data = validated_data.pop('educations')
        skills_data = validated_data.pop('skills')

        # update resume
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # update personal info
        ResumePersonalInfo.objects.update_or_create(
            resume=instance,
            defaults=personal_data
        )

        # clear old & re-add
        instance.experiences.all().delete()
        for exp in experiences_data:
            ResumeExperience.objects.create(resume=instance, **exp)

        instance.educations.all().delete()
        for edu in educations_data:
            ResumeEducation.objects.create(resume=instance, **edu)

        instance.skills.all().delete()
        for skill in skills_data:
            ResumeSkill.objects.create(resume=instance, **skill)

        return instance