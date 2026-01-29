from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from django.contrib.auth import authenticate
from .models import User, Role, UserProfile, Organization, WellnessType

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.CharField()  
    organization = serializers.CharField(required=False, allow_blank=True)
    wellness_types = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = User
        # 🔹 Inga 'country_code' field-ah add pannunga
        fields = ['username', 'email', 'password', 'country_code', 'mobile', 'role', 'organization', 'wellness_types']

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')

        # ---------------- Check duplicates ----------------
        if AuthUser.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        if AuthUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})

        # ---------------- Role ----------------
        role_name = validated_data.pop('role')
        role_name_upper = role_name.upper()

        if role_name_upper not in [r[0] for r in Role.ROLE_CHOICES]:
            raise serializers.ValidationError({"role": "Invalid role name"})

        role_obj, _ = Role.objects.get_or_create(
            name=role_name_upper,
            defaults={'description': f'{role_name_upper} role'}
        )

        # ---------------- Organization ----------------
        org_name = validated_data.pop('organization', None)
        org_obj = None
        if org_name:
            org_obj, _ = Organization.objects.get_or_create(
                name=org_name,
                defaults={'email': f'{org_name.lower().replace(" ","")}@example.com', 'mobile': '0000000000'}
            )

        # ---------------- Wellness Types ----------------
        wellness_names = validated_data.pop('wellness_types', [])
        wellness_objs = WellnessType.objects.filter(name__in=[w.upper() for w in wellness_names])

        # ---------------- Auth user ----------------
        auth_user = AuthUser.objects.create_user(username=username, email=email, password=password)

        # ---------------- Custom User ----------------
        # Inga validated_data kulla 'country_code' matrum 'mobile' renduமே irukkum
        user = User.objects.create(auth_user=auth_user, role=role_obj, organization=org_obj, **validated_data)
        user.wellness_types.set(wellness_objs)

        # ---------------- Profile ----------------
        UserProfile.objects.create(user=user, goal="", activity_level="MEDIUM")

        return user

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
