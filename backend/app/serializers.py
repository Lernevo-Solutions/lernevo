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

# ───────────── SIMPLE SERIALIZERS (ALL OPTIONAL) ─────────────

class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumePersonalInfo
        exclude = ['resume']
        extra_kwargs = {
            'full_name': {'required': False, 'allow_null': True, 'allow_blank': True},
            'job_title': {'required': False, 'allow_null': True, 'allow_blank': True},
            'email':     {'required': False, 'allow_null': True, 'allow_blank': True},
            'phone':     {'required': False, 'allow_null': True, 'allow_blank': True},
            'location':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'linkedin':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'github':    {'required': False, 'allow_null': True, 'allow_blank': True},
            'photo':     {'required': False, 'allow_null': True},
        }

class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSummary
        exclude = ['resume']
        extra_kwargs = {
            'text': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class ExperienceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeExperience
        exclude = ['resume']
        extra_kwargs = {
            'company':     {'required': False, 'allow_null': True, 'allow_blank': True},
            'role':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'duration':    {'required': False, 'allow_null': True, 'allow_blank': True},
            'location':    {'required': False, 'allow_null': True, 'allow_blank': True},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class UGEducationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeUGEducation
        exclude = ['resume']
        extra_kwargs = {
            'college':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'degree':         {'required': False, 'allow_null': True, 'allow_blank': True},
            'branch':         {'required': False, 'allow_null': True, 'allow_blank': True},
            'graduatedYear':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'gpa':            {'required': False, 'allow_null': True, 'allow_blank': True},
            'highlights':     {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class SchoolEducationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    # 🔥 Mapping frontend → backend
    schoolName = serializers.CharField(source='school_name', required=False, allow_blank=True)
    passingYear = serializers.CharField(source='passing_year', required=False, allow_blank=True)

    class Meta:
        model = ResumeSchoolEducation
        exclude = ['resume']
        extra_kwargs = {
            # ❌ USE MODEL FIELD NAMES HERE (IMPORTANT)
            'school_name': {'required': False, 'allow_null': True, 'allow_blank': True},
            'board': {'required': False, 'allow_null': True, 'allow_blank': True},
            'stream': {'required': False, 'allow_null': True, 'allow_blank': True},
            'passing_year': {'required': False, 'allow_null': True, 'allow_blank': True},
            'percentage': {'required': False, 'allow_null': True, 'allow_blank': True},
            'highlights': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    # 🔥 REMOVE DUPLICATE FIELDS IN RESPONSE
    def to_representation(self, instance):
        data = super().to_representation(instance)

        data.pop('school_name', None)
        data.pop('passing_year', None)

        return data

class SkillSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeSkill
        exclude = ['resume']
        extra_kwargs = {
            'name':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'level': {'required': False, 'allow_null': True},
            'badge': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    tech_stack = serializers.CharField(source='tech', required=False, allow_blank=True)
    class Meta:
        model = ResumeProject
        exclude = ['resume']
        extra_kwargs = {
            'name':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'tech_stack':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'date':        {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class CertificationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeCertification
        exclude = ['resume']
        extra_kwargs = {
            'name':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'issuer':      {'required': False, 'allow_null': True, 'allow_blank': True},
            'date':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class LanguageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeLanguage
        exclude = ['resume']
        extra_kwargs = {
            'language':    {'required': False, 'allow_null': True, 'allow_blank': True},
            'proficiency': {'required': False, 'allow_null': True, 'allow_blank': True},
            'stars':       {'required': False, 'allow_null': True},
        }

class OptionalSectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeOptionalSection
        exclude = ['resume']
        extra_kwargs = {
            'title':   {'required': False, 'allow_null': True, 'allow_blank': True},
            'content': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

# ───────────── MAIN SERIALIZER (NO REQUIRED FIELDS) ─────────────

class ResumeSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer(required=False, allow_null=True)
    summary = SummarySerializer(required=False, allow_null=True)
    
    experiences = ExperienceSerializer(many=True, required=False)
    ug_education = UGEducationSerializer(many=True, required=False)
    school_education = SchoolEducationSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    projects = ProjectSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    languages = LanguageSerializer(many=True, required=False)
    optional_sections = OptionalSectionSerializer(many=True, required=False)

    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ['user']
        # Resume model-il irukkura fields kooda optional-āga mātra:
        extra_kwargs = {
            'title':       {'required': False, 'allow_null': True, 'allow_blank': True},
            'font':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'theme_color': {'required': False, 'allow_null': True, 'allow_blank': True},
            'layout':      {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def create(self, validated_data):
        # Nested data handling with default empty values
        personal_data = validated_data.pop('personal_info', None)
        summary_data  = validated_data.pop('summary', None)
        
        exp_data     = validated_data.pop('experiences', [])
        ug_data      = validated_data.pop('ug_education', [])
        school_data  = validated_data.pop('school_education', [])
        skill_data   = validated_data.pop('skills', [])
        proj_data    = validated_data.pop('projects', [])
        cert_data    = validated_data.pop('certifications', [])
        lang_data    = validated_data.pop('languages', [])
        optional_data = validated_data.pop('optional_sections', [])

        # Create main Resume
        resume = Resume.objects.create(**validated_data)

        # Create related data if available
        if personal_data: ResumePersonalInfo.objects.create(resume=resume, **personal_data)
        if summary_data:  ResumeSummary.objects.create(resume=resume, **summary_data)

        # Create list items only if data exists in the item
        for item in exp_data:
            if any(item.values()): ResumeExperience.objects.create(resume=resume, **item)
        for item in ug_data:
            if any(item.values()): ResumeUGEducation.objects.create(resume=resume, **item)
        for item in school_data:
            if any(item.values()): ResumeSchoolEducation.objects.create(resume=resume, **item)
        for item in skill_data:
            if any(item.values()): ResumeSkill.objects.create(resume=resume, **item)
        for item in proj_data:
            if any(item.values()): ResumeProject.objects.create(resume=resume, **item)
        for item in cert_data:
            if any(item.values()): ResumeCertification.objects.create(resume=resume, **item)
        for item in lang_data:
            if any(item.values()): ResumeLanguage.objects.create(resume=resume, **item)
        for item in optional_data:
            if any(item.values()): ResumeOptionalSection.objects.create(resume=resume, **item)

        return resume

    def update(self, instance, validated_data):
        # Standard update logic for main model
        instance.title = validated_data.get('title', instance.title)
        instance.font = validated_data.get('font', instance.font)
        instance.theme_color = validated_data.get('theme_color', instance.theme_color)
        instance.layout = validated_data.get('layout', instance.layout)
        instance.photo_position = validated_data.get('photo_position', instance.photo_position)
        instance.photo_size = validated_data.get('photo_size', instance.photo_size)
        instance.canvas_states = validated_data.get('canvas_states', instance.canvas_states)
        instance.save()

        # Update Personal Info (Safe check)
        p_info = validated_data.get('personal_info')
        if p_info:
            for attr, value in p_info.items():
                setattr(instance.personal_info, attr, value)
            instance.personal_info.save()

        # Update Summary (Safe check)
        summ = validated_data.get('summary')
        if summ:
            for attr, value in summ.items():
                setattr(instance.summary, attr, value)
            instance.summary.save()

        # Helper to recreate list items
        def recreate_items(manager, data_list, model_class):
            manager.all().delete()
            for item in data_list:
                if any(item.values()): # Only create if not empty
                    model_class.objects.create(resume=instance, **item)

        recreate_items(instance.experiences, validated_data.get('experiences', []), ResumeExperience)
        recreate_items(instance.ug_education, validated_data.get('ug_education', []), ResumeUGEducation)
        recreate_items(instance.school_education, validated_data.get('school_education', []), ResumeSchoolEducation)
        recreate_items(instance.skills, validated_data.get('skills', []), ResumeSkill)
        recreate_items(instance.projects, validated_data.get('projects', []), ResumeProject)
        recreate_items(instance.certifications, validated_data.get('certifications', []), ResumeCertification)
        recreate_items(instance.languages, validated_data.get('languages', []), ResumeLanguage)
        recreate_items(instance.optional_sections, validated_data.get('optional_sections', []), ResumeOptionalSection)

        return instance