
import uuid
from django.db import models
from django.contrib.auth.models import User as AuthUser
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

    #role = models.ForeignKey(Role, on_delete=models.CASCADE)
    #organization = models.ForeignKey(Organization,on_delete=models.SET_NULL,null=True,blank=True,related_name="users")

    #wellness_types = models.ManyToManyField(WellnessType,related_name="users",blank=True)
    country_code = models.CharField(max_length=5, default="+91")
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


    #fcm_token = models.CharField(max_length=255, null=True, blank=True) # The "Phone Address"
    is_frozen = models.BooleanField(default=False)
    frozen_at = models.DateTimeField(null=True, blank=True)
    unfrozen_at = models.DateTimeField(null=True, blank=True)

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
    activity_level = models.CharField( max_length=20, choices=[ ('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ], default='MEDIUM' )

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
    
    # Yar vena create pannalam (Trainer or Admin)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="created_groups"
    )
    
    # Group-la join panra users
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


##############################################################
class Resume(models.Model):

    TEMPLATE_CHOICES = [
        ('MODERN', 'Modern'),
        ('PROFESSIONAL', 'Professional'),
        ('MINIMAL', 'Minimal'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes"
    )

    title = models.CharField(max_length=150)
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES)

    ai_summary = models.TextField(null=True, blank=True)

    is_delete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.template}"


class ResumePersonalInfo(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="personal_info"
    )

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)

    linkedin = models.URLField(null=True, blank=True)
    github = models.URLField(null=True, blank=True)
    portfolio = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.full_name


class ResumeExperience(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="experiences"
    )

    job_title = models.CharField(max_length=100)
    company = models.CharField(max_length=150)

    start_date = models.CharField(max_length=20)
    end_date = models.CharField(max_length=20, null=True, blank=True)

    description = models.TextField()

    def __str__(self):
        return f"{self.job_title} - {self.company}"

class ResumeEducation(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="educations"
    )

    degree = models.CharField(max_length=150)
    institution = models.CharField(max_length=150)
    year = models.CharField(max_length=10)

    def __str__(self):
        return self.degree

class ResumeSkill(models.Model):
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="skills"
    )

    skill_name = models.CharField(max_length=100)

    def __str__(self):
        return self.skill_name


class SkillGapAnalysis(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="skill_gap_analyses"
    )

    resume_text = models.TextField()
    job_description = models.TextField()

    ats_score = models.IntegerField()
    match_score = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Skill Gap - {self.user}"

class SkillGapStrength(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="strengths"
    )

    strength = models.CharField(max_length=255)

class SkillGapMissingSkill(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="missing_skills"
    )

    skill = models.CharField(max_length=255)

class SkillGapSuggestion(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="suggestions"
    )

    suggestion = models.TextField()

class SkillGapInterviewHighlight(models.Model):
    analysis = models.ForeignKey(
        SkillGapAnalysis,
        on_delete=models.CASCADE,
        related_name="interview_highlights"
    )

    highlight = models.TextField()
