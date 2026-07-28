import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User as AuthUser
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invitation, Role, User as LernevoUser, UserProfile

TRAINER_ALLOWED_ROLES = ("USER", "TRAINER")
ROLE_LABELS = {
    "USER": "User",
    "TRAINER": "Trainer",
}


def _normalize_trainer_role(role_name):
    value = (role_name or "").strip().upper()
    if value not in TRAINER_ALLOWED_ROLES:
        return None
    return value


def _expire_invites():
    Invitation.objects.filter(
        status="PENDING",
        expires_at__lt=timezone.now(),
    ).update(status="EXPIRED")


def _get_current_trainer(request):
    try:
        current = LernevoUser.objects.select_related("role", "auth_user").get(
            auth_user=request.user,
            is_delete=False,
        )
    except LernevoUser.DoesNotExist:
        return None

    if not current.role or current.role.name not in ("TRAINER", "ADMIN", "SUPER_ADMIN"):
        return None

    return current


def _require_trainer(request):
    if not request.user.is_authenticated:
        return None, Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    current = _get_current_trainer(request)
    if not current:
        return None, Response({"detail": "Trainer access required"}, status=status.HTTP_403_FORBIDDEN)

    return current, None


def _trainer_role_object(role_name):
    normalized = _normalize_trainer_role(role_name)
    if not normalized:
        return None
    role, _ = Role.objects.get_or_create(
        name=normalized,
        defaults={"description": f"Standard {ROLE_LABELS[normalized]} User"},
    )
    return role


def _format_dt(value):
    return value.strftime("%Y-%m-%d %H:%M:%S") if value else "-"


def _member_payload_from_user(user):
    role_name = user.role.name if user.role else "USER"
    if role_name not in TRAINER_ALLOWED_ROLES:
        role_name = "USER"

    principal_email = user.auth_user.email or ""
    display_name = user.auth_user.first_name or user.auth_user.username or "-"
    user_code = getattr(user, 'user_code', None) or str(user.id)

    return {
        "kind": "USER",
        "id": str(user.id),
        "user_code": user_code,
        "member_id": user_code,
        "member_type": "USER",
        "principal_email": principal_email,
        "name": display_name,
        "role": role_name,
        "status": "Active",
        "joined_on": _format_dt(user.created_at),
        "is_pending": False,
        "can_edit": True,
    }


def _member_payload_from_invitation(invitation):
    return {
        "kind": "INVITATION",
        "id": str(invitation.id),
        "user_code": f"INV-{(str(invitation.id))[:6].upper()}",
        "member_id": str(invitation.id),
        "member_type": "INVITATION",
        "principal_email": invitation.email,
        "name": "-",
        "role": invitation.role.name if invitation.role else "USER",
        "status": "Pending",
        "joined_on": _format_dt(invitation.created_at),
        "is_pending": True,
        "can_edit": True,
        "token": invitation.token,
        "expires_at": _format_dt(invitation.expires_at),
    }


def _send_invitation_email(invitation, accept_link):
    subject = "You're invited to Lernevo"
    text = (
        f"You have been invited as {invitation.role.name.title()}.\n\n"
        f"Accept your invitation here:\n{accept_link}\n\n"
        f"This link expires at {invitation.expires_at.strftime('%Y-%m-%d %H:%M:%S')}."
    )
    html = f"""
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin: 0 0 12px;">You have a new Lernevo invitation</h2>
          <p>You have been invited as <strong>{invitation.role.name.title()}</strong>.</p>
          <p><a href="{accept_link}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#d97706;color:#fff;text-decoration:none;">Accept Invitation</a></p>
          <p style="font-size: 12px; color: #64748b;">This link expires at {invitation.expires_at.strftime('%Y-%m-%d %H:%M:%S')}.</p>
        </div>
    """

    sender = str(getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()
    if not sender:
        sender = str(getattr(settings, "EMAIL_HOST_USER", "") or "").strip()

    if not sender:
        raise RuntimeError("Email sender is not configured.")

    message = EmailMultiAlternatives(subject, text, sender, [invitation.email])
    message.attach_alternative(html, "text/html")
    message.send()


# ==========================================
# TRAINER SCOPED API ENDPOINTS
# ==========================================

class TrainerRolesStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_trainer, error_response = _require_trainer(request)
        if error_response:
            return error_response

        _expire_invites()

        # Admin/SuperAdmin aah irundha full list, illana Trainer-ku assign aana users filter
        if current_trainer.role and current_trainer.role.name in ("ADMIN", "SUPER_ADMIN"):
            scoped_users = LernevoUser.objects.select_related("role").filter(
                is_delete=False,
                role__name__in=TRAINER_ALLOWED_ROLES
            )
            pending_invites_count = Invitation.objects.filter(
                status="PENDING",
                role__name__in=TRAINER_ALLOWED_ROLES
            ).count()
        else:
            # ✅ Trainer Scope: Intha Trainer-ku assign aana Users + Intha Trainer invite panna Users[cite: 5]
            scoped_users = LernevoUser.objects.select_related("role", "profile").filter(
                is_delete=False,
                role__name__in=TRAINER_ALLOWED_ROLES
            ).filter(
                Q(profile__assigned_trainer=current_trainer) | Q(id=current_trainer.id)
            )
            pending_invites_count = Invitation.objects.filter(
                status="PENDING",
                invited_by=current_trainer,
                role__name__in=TRAINER_ALLOWED_ROLES
            ).count()

        stats = {
            "total_users": scoped_users.filter(role__name="USER").count(),
            "trainers": scoped_users.filter(role__name="TRAINER").count(),
            "pending_invites": pending_invites_count,
        }
        return Response({"success": True, "stats": stats})


class TrainerRolesMembersAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_trainer, error_response = _require_trainer(request)
        if error_response:
            return error_response

        _expire_invites()

        # Admin/SuperAdmin full view
        if current_trainer.role and current_trainer.role.name in ("ADMIN", "SUPER_ADMIN"):
            users = (
                LernevoUser.objects.select_related("auth_user", "role")
                .filter(is_delete=False, role__name__in=TRAINER_ALLOWED_ROLES)
                .order_by("-created_at")
            )
            invitations = (
                Invitation.objects.select_related("role", "invited_by", "invited_by__auth_user")
                .filter(status="PENDING", role__name__in=TRAINER_ALLOWED_ROLES)
                .order_by("-created_at")
            )
        else:
            # ✅ Specific Trainer Filter: Indha trainer-ku profile-la assign aana users mattum[cite: 5]
            users = (
                LernevoUser.objects.select_related("auth_user", "role", "profile")
                .filter(
                    is_delete=False,
                    role__name__in=TRAINER_ALLOWED_ROLES
                )
                .filter(
                    Q(profile__assigned_trainer=current_trainer) | Q(id=current_trainer.id)
                )
                .order_by("-created_at")
            )
            # Indha trainer anuppina pending invitations mattum
            invitations = (
                Invitation.objects.select_related("role", "invited_by", "invited_by__auth_user")
                .filter(
                    status="PENDING",
                    invited_by=current_trainer,
                    role__name__in=TRAINER_ALLOWED_ROLES
                )
                .order_by("-created_at")
            )

        members = [_member_payload_from_user(user) for user in users]
        members.extend(_member_payload_from_invitation(invitation) for invitation in invitations)

        return Response({"success": True, "members": members})


class TrainerRolesInviteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_trainer, error_response = _require_trainer(request)
        if error_response:
            return error_response

        email = (request.data.get("email") or "").strip().lower()
        raw_role = (request.data.get("role") or "").strip().upper()
        role_name = _normalize_trainer_role(raw_role)

        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not role_name:
            return Response({"detail": "Trainer can only assign USER or TRAINER roles"}, status=status.HTTP_403_FORBIDDEN)

        if AuthUser.objects.filter(email__iexact=email).exists():
            return Response({"detail": "An account already exists for this email"}, status=status.HTTP_409_CONFLICT)

        if Invitation.objects.filter(email__iexact=email, status="PENDING").exists():
            return Response({"detail": "An active invitation already exists for this email"}, status=status.HTTP_409_CONFLICT)

        role = _trainer_role_object(role_name)
        token = secrets.token_urlsafe(32)
        invitation = Invitation.objects.create(
            email=email,
            role=role,
            invited_by=current_trainer,
            token=token,
            status="PENDING",
            expires_at=timezone.now() + timedelta(days=7),
        )

        accept_link = f"{settings.FRONTEND_URL}/get-started?mode=register&invitation_token={token}"
        email_sent = True
        warning = None
        try:
            _send_invitation_email(invitation, accept_link)
        except Exception as exc:
            email_sent = False
            warning = f"Invitation saved, but email delivery failed: {exc}"

        return Response(
            {
                "success": True,
                "message": "Invitation created successfully",
                "member": _member_payload_from_invitation(invitation),
                "email_sent": email_sent,
                "warning": warning,
            },
            status=status.HTTP_201_CREATED,
        )


class TrainerRolesChangeRoleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        current_trainer, error_response = _require_trainer(request)
        if error_response:
            return error_response

        member_type = (request.data.get("member_type") or request.data.get("type") or "USER").strip().upper()
        member_id = request.data.get("member_id") or request.data.get("id")
        raw_role = (request.data.get("role") or "").strip().upper()
        requested_role = _normalize_trainer_role(raw_role)

        if not member_id:
            return Response({"detail": "Member id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not requested_role:
            return Response({"detail": "Trainer can only assign USER or TRAINER roles"}, status=status.HTTP_403_FORBIDDEN)

        if member_type == "INVITATION":
            invitation = Invitation.objects.select_related("role").filter(id=member_id).first()
            if not invitation:
                return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
            if invitation.role.name not in TRAINER_ALLOWED_ROLES:
                return Response({"detail": "Action not allowed for this invitation"}, status=status.HTTP_403_FORBIDDEN)

            invitation.role = _trainer_role_object(requested_role)
            invitation.save(update_fields=["role", "updated_at"])
            return Response(
                {
                    "success": True,
                    "message": "Invitation role updated successfully",
                    "member": _member_payload_from_invitation(invitation),
                }
            )

        user = LernevoUser.objects.select_related("auth_user", "role", "profile").filter(id=member_id, is_delete=False).first()
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Non-admin trainer context check: Un-assigned users-a modify panna koodathu[cite: 5]
        if current_trainer.role and current_trainer.role.name not in ("ADMIN", "SUPER_ADMIN"):
            has_access = (
                user.id == current_trainer.id or 
                (hasattr(user, 'profile') and user.profile.assigned_trainer == current_trainer)
            )
            if not has_access:
                return Response({"detail": "You can only modify users assigned to you"}, status=status.HTTP_403_FORBIDDEN)

        if user.role and user.role.name not in TRAINER_ALLOWED_ROLES:
            return Response({"detail": "Trainer cannot modify Admin or Super Admin users"}, status=status.HTTP_403_FORBIDDEN)

        role = _trainer_role_object(requested_role)
        user.role = role
        user.save(update_fields=["role", "updated_at"])

        return Response(
            {
                "success": True,
                "message": "Role updated successfully",
                "member": _member_payload_from_user(user),
            }
        )
        
