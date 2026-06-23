import uuid
from django.db import models
from django.contrib.auth.models import User as AuthUser
from django.conf import settings  # ✅ ADD THIS IMPORT
import random


class Role(models.Model):
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('TRAINER', 'Trainer'),
        ('ADMIN', 'Admin'),
        ('SUPER_ADMIN', 'Super Admin'),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# =========================
# ORGANIZATION
# =========================
class Organization(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15)

    is_active = models.BooleanField(default=True)
    is_delete = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# =========================
# WELLNESS TYPE
# =========================
class WellnessType(models.Model):
    WELLNESS_CHOICES = [
        ('FITNESS', 'Fitness'),
        ('NUTRITION', 'Nutrition'),
        ('MENTAL', 'Mental Health'),
        ('LEARNING', 'Learning'),
    ]

    name = models.CharField(max_length=50, choices=WELLNESS_CHOICES, unique=True)
    is_delete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_name_display()


# =========================
# MAIN USER (BUSINESS USER)
# =========================
class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    auth_user = models.OneToOneField(
        AuthUser,
        on_delete=models.CASCADE,
        related_name="lernevo_user"
    )

    country_code = models.CharField(max_length=5, default="+91", null=True, blank=True)
    mobile = models.CharField(
        max_length=15,
        null=True,
        blank=True
    )
    user_code = models.CharField(
        max_length=6,
        unique=True,
        null=True,        
        blank=True,
        editable=False
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    is_frozen = models.BooleanField(default=False)
    frozen_at = models.DateTimeField(null=True, blank=True)
    unfrozen_at = models.DateTimeField(null=True, blank=True)
    needs_password_reset = models.BooleanField(default=False)
    is_delete = models.BooleanField(default=False)
    is_first_login = models.BooleanField(default=True)

    last_login = models.DateTimeField(null=True, blank=True)
    expired_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.user_code:
            self.user_code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        while True:
            code = str(random.randint(100000, 999999))
            if not User.objects.filter(user_code=code).exists():
                return code

    def __str__(self):
        return f"{self.auth_user.username} - {self.user_code}"
 

# =========================
# USER PROFILE (WELLNESS)
# =========================
class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    
    profile_image = models.ImageField(
        upload_to="profile_images/",
        null=True,
        blank=True
    )

    height_cm = models.FloatField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)

    goal = models.CharField(max_length=255)
    activity_level = models.CharField(max_length=20, choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')], default='MEDIUM')

    assigned_trainer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_users"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}"


# =========================
# DAILY PROGRESS
# =========================
class DailyProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)

    workout_done = models.BooleanField(default=False)
    calories_consumed = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user} - {self.date}"


# =========================
# SECURE MESSAGING
# =========================
class Message(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )

    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} → {self.receiver}"


class WorkoutGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="created_groups"
    )
    
    members = models.ManyToManyField(
        User, 
        related_name="workout_groups",
        blank=True
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserOTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(null=True, blank=True)

    user = models.ForeignKey(
        AuthUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="otps"
    )

    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    is_delete = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"OTP - {self.email or self.user.username}"


class ContactMessage(models.Model):
    INQUIRY_CHOICES = [
        ('general', 'General Inquiry'),
        ('support', 'Customer Support'),
        ('partnership', 'Partnership'),
        ('demo', 'Book a Demo'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    inquiry_type = models.CharField(
        max_length=20,
        choices=INQUIRY_CHOICES,
        default='general'
    )

    is_resolved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"


class Enquiry(models.Model):
    INTEREST_CHOICES = [
        ('holistic', 'Holistic Wellness Journey'),
        ('fitness', 'Fitness & Training'),
        ('nutrition', 'Nutrition Guidance'),
        ('mental', 'Mental Wellness'),
        ('sleep', 'Sleep Optimization'),
        ('trainer', 'Become a Trainer'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()

    interest_area = models.CharField(
        max_length=20,
        choices=INTEREST_CHOICES,
        default='holistic'
    )

    message = models.TextField(blank=True)

    is_trainer = models.BooleanField(default=False)
    agree_to_terms = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} - {self.interest_area}"


class DemoBooking(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=20)
    questions = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.preferred_date}"


##############################################################
# RESUME BUILDER MODELS
##############################################################

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("app.User", on_delete=models.CASCADE, related_name="resumes")

    title = models.CharField(max_length=150, default="My Resume")

    font = models.CharField(max_length=50, default="Inter")
    theme_color = models.CharField(max_length=20, default="#2563eb")
    layout = models.CharField(max_length=50, default="one-col")
    photo_position = models.CharField(max_length=20, default="left")
    photo_size = models.CharField(max_length=20, default="medium")

    canvas_states = models.JSONField(default=dict, blank=True)

    is_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ResumePersonalInfo(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name="personal_info")

    full_name = models.CharField(max_length=150, blank=True)
    job_title = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    linkedin = models.CharField(max_length=255, blank=True)
    github = models.CharField(max_length=255, blank=True)

    photo = models.TextField(null=True, blank=True)


class ResumeSummary(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name="summary")
    text = models.TextField(blank=True)


class ResumeExperience(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="experiences")

    company = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=150, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)


class ResumeUGEducation(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="ug_education")

    college = models.CharField(max_length=150, blank=True)
    degree = models.CharField(max_length=150, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    graduated_year = models.CharField(max_length=50, blank=True)
    gpa = models.CharField(max_length=20, blank=True)
    highlights = models.TextField(blank=True)


class ResumeSchoolEducation(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="school_education")

    school_name = models.CharField(max_length=150, blank=True)
    board = models.CharField(max_length=100, blank=True)
    stream = models.CharField(max_length=100, blank=True)
    passing_year = models.CharField(max_length=50, blank=True)
    percentage = models.CharField(max_length=20, blank=True)
    highlights = models.TextField(blank=True)


class ResumeSkill(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="skills")

    name = models.CharField(max_length=100)
    level = models.IntegerField(default=3)
    badge = models.CharField(max_length=50, default="Intermediate")


class ResumeProject(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="projects")

    name = models.CharField(max_length=150, blank=True)
    tech = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    link = models.URLField(blank=True, null=True)
    date = models.CharField(max_length=50, blank=True)


class ResumeCertification(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="certifications")

    name = models.CharField(max_length=150, blank=True)
    issuer = models.CharField(max_length=150, blank=True)
    date = models.CharField(max_length=50, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)


class ResumeLanguage(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="languages")

    language = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=50, default="Intermediate")
    stars = models.IntegerField(default=3)


class ResumeOptionalSection(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="optional_sections")

    title = models.CharField(max_length=150)
    content = models.TextField(blank=True)
    section_type = models.CharField(max_length=50, default="custom")


# =========================================================
# SKILL GAP ANALYSIS MODELS - FIXED
# =========================================================

class SkillGapResume(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # ✅ FIXED: Use settings.AUTH_USER_MODEL with the custom User model
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # This will be 'app.User'
        on_delete=models.CASCADE,
        related_name="skill_gap_resumes"
    )

    resume_pdf = models.FileField(
        upload_to="skill_gap_resumes/"
    )

    extracted_text = models.TextField()

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return str(self.id)


class SkillGapAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ✅ FIXED: Use settings.AUTH_USER_MODEL
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skill_gap_analyses"
    )

    # ✅ FIXED: Direct import of SkillGapResume
    resume = models.ForeignKey(
        SkillGapResume,
        on_delete=models.CASCADE,
        related_name="skill_gap_results"
    )

    job_title = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    job_description = models.TextField()

    ats_score = models.IntegerField(default=0)
    match_score = models.IntegerField(default=0)
    gap_score = models.IntegerField(default=0)
    resume_quality_score = models.IntegerField(default=0)

    open_jobs = models.IntegerField(default=0)
    salary_range = models.CharField(max_length=100, blank=True)
    growth_rate = models.CharField(max_length=50, blank=True)

    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.job_title}"


class ResumeMetric(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="resume_metrics"
    )

    METRIC_TYPES = [
        ('KEYWORD_DENSITY', 'Keyword Density'),
        ('FORMATTING', 'Formatting'),
        ('EXPERIENCE_MATCH', 'Experience Match'),
        ('SOFT_SKILLS', 'Soft Skills'),
        ('ATS_COMPATIBILITY', 'ATS Compatibility'),
        ('RELEVANCE_SCORE', 'Relevance Score'),
    ]

    metric_type = models.CharField(max_length=50, choices=METRIC_TYPES)
    score = models.IntegerField(default=0)
    label = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.metric_type} - {self.score}%"

  
  
class SkillAnalysis(models.Model):
    SKILL_STATUS = [
        ('MATCHED', 'Matched'),
        ('MISSING', 'Missing'),
    ]

    PRIORITY_LEVELS = [
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]

    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="skills"
    )

    skill_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=SKILL_STATUS)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, null=True, blank=True)
    score = models.IntegerField(default=0)

    def __str__(self):
        return self.skill_name


class JobRoleMatch(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="job_matches"
    )

    role_name = models.CharField(max_length=150)
    match_percentage = models.IntegerField(default=0)
    average_salary = models.CharField(max_length=100, blank=True)
    demand_level = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.role_name


class AICareerSuggestion(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="career_suggestions"
    )

    skill_name = models.CharField(max_length=100)
    role_name = models.CharField(max_length=150)
    is_matched = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.skill_name} → {self.role_name}"


class LearningRoadmap(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="learning_roadmaps"
    )

    skill_name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=10, blank=True)
    udemy_link = models.URLField(blank=True, null=True)
    youtube_link = models.URLField(blank=True, null=True)
    google_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.skill_name


class ImprovementTip(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="improvement_tips"
    )

    title = models.CharField(max_length=255)
    impact_percentage = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title


class FocusArea(models.Model):
    PRIORITY_TYPES = [
        ('HIGH', 'High Impact'),
        ('MEDIUM', 'Medium Impact'),
        ('LOW', 'Low Impact'),
    ]

    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="focus_areas"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_TYPES)

    def __str__(self):
        return self.title


class DailyGoal(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_goals"
    )

    title = models.CharField(max_length=255)
    xp_points = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ResumeQualityMetric(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="quality_metrics"
    )

    QUALITY_TYPES = [
        ('CLARITY', 'Clarity'),
        ('IMPACT', 'Impact'),
        ('STRUCTURE', 'Structure'),
        ('READABILITY', 'Readability'),
        ('PROFESSIONALISM', 'Professionalism'),
        ('ATS_READINESS', 'ATS Readiness'),
    ]

    metric_type = models.CharField(max_length=50, choices=QUALITY_TYPES)
    score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.metric_type} - {self.score}%"


class ResumeDetection(models.Model):
    RESUME_TYPE_CHOICES = [
        ('AI_WRITTEN', 'AI Written'),
        ('HUMAN_WRITTEN', 'Human Written'),
        ('HYBRID', 'Hybrid'),
    ]
    
    CONFIDENCE_CHOICES = [
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        'SkillGapAnalysis',
        on_delete=models.CASCADE,
        related_name="resume_detections",
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resume_detections"
    )
    
    resume_type = models.CharField(max_length=20, choices=RESUME_TYPE_CHOICES)
    detection_confidence = models.CharField(max_length=10, choices=CONFIDENCE_CHOICES)
    ai_written_probability = models.IntegerField(default=50)
    human_written_probability = models.IntegerField(default=50)
    
    ai_signals = models.JSONField(default=list, blank=True)
    human_signals = models.JSONField(default=list, blank=True)
    strengths = models.JSONField(default=list, blank=True)
    red_flags = models.JSONField(default=list, blank=True)
    recommendation = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.resume_type} - {self.created_at}"