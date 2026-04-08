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
            'photo':     {'required': False, 'allow_null': True, 'allow_blank': True},  # TextField, allow_blank is fine
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

    # Mapping frontend → backend
    schoolName = serializers.CharField(source='school_name', required=False, allow_blank=True)
    passingYear = serializers.CharField(source='passing_year', required=False, allow_blank=True)

    class Meta:
        model = ResumeSchoolEducation
        exclude = ['resume']
        extra_kwargs = {
            'school_name':   {'required': False, 'allow_null': True, 'allow_blank': True},
            'board':         {'required': False, 'allow_null': True, 'allow_blank': True},
            'stream':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'passing_year':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'percentage':    {'required': False, 'allow_null': True, 'allow_blank': True},
            'highlights':    {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # rename back to frontend camelCase
        data['schoolName'] = data.pop('school_name', '')
        data['passingYear'] = data.pop('passing_year', '')
        return data

class SkillSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = ResumeSkill
        exclude = ['resume']
        extra_kwargs = {
            'name':  {'required': False, 'allow_null': True, 'allow_blank': True},
            'level': {'required': False, 'allow_null': True},          # Integer – no allow_blank
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
            'stars':       {'required': False, 'allow_null': True},    # Integer – no allow_blank
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

# ───────────── MAIN SERIALIZER (FIXED CREATE/UPDATE) ─────────────

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
        extra_kwargs = {
            # string fields → allow_blank + allow_null
            'title':         {'required': False, 'allow_null': True, 'allow_blank': True},
            'font':          {'required': False, 'allow_null': True, 'allow_blank': True},
            'theme_color':   {'required': False, 'allow_null': True, 'allow_blank': True},
            'layout':        {'required': False, 'allow_null': True, 'allow_blank': True},
            'photo_position':{'required': False, 'allow_null': True, 'allow_blank': True},
            'photo_size':    {'required': False, 'allow_null': True, 'allow_blank': True},
            # JSONField – no allow_blank, only required=False
            'canvas_states': {'required': False},
        }

    # Helper to strip 'id' from nested dicts (sent by frontend)
    def _strip_ids(self, items):
        for item in items:
            item.pop('id', None)
        return items

    def create(self, validated_data):
        personal_data = validated_data.pop('personal_info', None)
        summary_data = validated_data.pop('summary', None)
        
        exp_data = self._strip_ids(validated_data.pop('experiences', []))
        ug_data = self._strip_ids(validated_data.pop('ug_education', []))
        school_data = self._strip_ids(validated_data.pop('school_education', []))
        skill_data = self._strip_ids(validated_data.pop('skills', []))
        proj_data = self._strip_ids(validated_data.pop('projects', []))
        cert_data = self._strip_ids(validated_data.pop('certifications', []))
        lang_data = self._strip_ids(validated_data.pop('languages', []))
        optional_data = self._strip_ids(validated_data.pop('optional_sections', []))

        # Create main Resume
        resume = Resume.objects.create(**validated_data)

        # Create related objects if they contain any data
        if personal_data and any(personal_data.values()):
            ResumePersonalInfo.objects.create(resume=resume, **personal_data)
        if summary_data and summary_data.get('text'):
            ResumeSummary.objects.create(resume=resume, **summary_data)

        for item in exp_data:
            if any(item.values()):
                ResumeExperience.objects.create(resume=resume, **item)
        for item in ug_data:
            if any(item.values()):
                ResumeUGEducation.objects.create(resume=resume, **item)
        for item in school_data:
            if any(item.values()):
                ResumeSchoolEducation.objects.create(resume=resume, **item)
        for item in skill_data:
            if any(item.values()):
                ResumeSkill.objects.create(resume=resume, **item)
        for item in proj_data:
            if any(item.values()):
                ResumeProject.objects.create(resume=resume, **item)
        for item in cert_data:
            if any(item.values()):
                ResumeCertification.objects.create(resume=resume, **item)
        for item in lang_data:
            if any(item.values()):
                ResumeLanguage.objects.create(resume=resume, **item)
        for item in optional_data:
            if any(item.values()):
                ResumeOptionalSection.objects.create(resume=resume, **item)

        return resume

    def update(self, instance, validated_data):
        # Update main resume fields
        for attr in ['title', 'font', 'theme_color', 'layout', 'photo_position', 'photo_size', 'canvas_states']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        instance.save()

        # Update or create personal_info safely
        p_info = validated_data.get('personal_info')
        if p_info:
            try:
                info = instance.personal_info
                for k, v in p_info.items():
                    setattr(info, k, v)
                info.save()
            except ResumePersonalInfo.DoesNotExist:
                ResumePersonalInfo.objects.create(resume=instance, **p_info)

        # Update or create summary safely
        summ = validated_data.get('summary')
        if summ:
            try:
                s = instance.summary
                s.text = summ.get('text', s.text)
                s.save()
            except ResumeSummary.DoesNotExist:
                ResumeSummary.objects.create(resume=instance, **summ)

        # Helper to replace list of related objects (strip ids, delete old, create new)
        def replace_items(manager, data_list, model_class):
            manager.all().delete()
            for item in self._strip_ids(data_list):
                if any(item.values()):
                    model_class.objects.create(resume=instance, **item)

        replace_items(instance.experiences, validated_data.get('experiences', []), ResumeExperience)
        replace_items(instance.ug_education, validated_data.get('ug_education', []), ResumeUGEducation)
        replace_items(instance.school_education, validated_data.get('school_education', []), ResumeSchoolEducation)
        replace_items(instance.skills, validated_data.get('skills', []), ResumeSkill)
        replace_items(instance.projects, validated_data.get('projects', []), ResumeProject)
        replace_items(instance.certifications, validated_data.get('certifications', []), ResumeCertification)
        replace_items(instance.languages, validated_data.get('languages', []), ResumeLanguage)
        replace_items(instance.optional_sections, validated_data.get('optional_sections', []), ResumeOptionalSection)

        return instance