import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User as AuthUser
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invitation, Role, User as LernevoUser

ALLOWED_ROLES = ("USER", "TRAINER", "ADMIN")
ROLE_LABELS = {
    "USER": "User",
    "TRAINER": "Trainer",
    "ADMIN": "Admin",
}


def _normalize_role(role_name):
    value = (role_name or "").strip().upper()
    if value not in ALLOWED_ROLES:
        return None
    return value


def _expire_invites():
    Invitation.objects.filter(
        status="PENDING",
        expires_at__lt=timezone.now(),
    ).update(status="EXPIRED")


def _get_current_admin(request):
    try:
        current = LernevoUser.objects.select_related("role", "auth_user").get(
            auth_user=request.user,
            is_delete=False,
        )
    except LernevoUser.DoesNotExist:
        return None

    if not current.role or current.role.name not in ("ADMIN", "SUPER_ADMIN"):
        return None

    return current


def _require_admin(request):
    if not request.user.is_authenticated:
        return None, Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    current = _get_current_admin(request)
    if not current:
        return None, Response({"detail": "Admin or Super Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    return current, None


def _role_object(role_name):
    normalized = _normalize_role(role_name)
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
    if role_name not in ALLOWED_ROLES:
        role_name = "USER"

    principal_email = user.auth_user.email or ""
    display_name = user.auth_user.first_name or user.auth_user.username or "-"
    user_code = getattr(user, 'user_code', None) or str(user.id)

    # ✅ UserProfile-la irundhu assigned trainer info-vai edukkirom
    assigned_trainer_id = None
    assigned_trainer_name = None
    
    if hasattr(user, 'profile') and user.profile and user.profile.assigned_trainer:
        trainer = user.profile.assigned_trainer
        assigned_trainer_id = str(trainer.id)
        # First name irundha adhai edukkum, illana username-ai edukkum
        assigned_trainer_name = trainer.auth_user.first_name or trainer.auth_user.username

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
        # ✅ Assigned Trainer Details Payload-la serkkirom
        "assigned_trainer_id": assigned_trainer_id,
        "assigned_trainer_name": assigned_trainer_name,
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
          <p><a href="{accept_link}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7c3aed;color:#fff;text-decoration:none;">Accept Invitation</a></p>
          <p style="font-size: 12px; color: #64748b;">This link expires at {invitation.expires_at.strftime('%Y-%m-%d %H:%M:%S')}.</p>
        </div>
    """

    sender = str(getattr(settings, "DEFAULT_FROM_EMAIL", "") or "").strip()
    if not sender:
        sender = str(getattr(settings, "EMAIL_HOST_USER", "") or "").strip()

    if not sender:
        raise RuntimeError(
            "Email sender is not configured. Set DEFAULT_FROM_EMAIL or EMAIL_HOST_USER in backend/.env."
        )

    message = EmailMultiAlternatives(
        subject,
        text,
        sender,
        [invitation.email],
    )
    message.attach_alternative(html, "text/html")
    message.send()


class RolesStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        _expire_invites()

        active_users = LernevoUser.objects.select_related("role").filter(is_delete=False)
        active_users = active_users.exclude(role__name="SUPER_ADMIN")

        stats = {
            "total_users": active_users.count(),
            "trainers": active_users.filter(role__name="TRAINER").count(),
            "admins": active_users.filter(role__name="ADMIN").count(),
            "pending_invites": Invitation.objects.filter(status="PENDING").count(),
        }
        return Response({"success": True, "stats": stats})

class RolesMembersAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        _expire_invites()

        # ✅ 'profile' & 'profile__assigned_trainer' select_related-la sethurukom
        users = (
            LernevoUser.objects.select_related("auth_user", "role", "profile", "profile__assigned_trainer")
            .filter(is_delete=False)
            .exclude(role__name="SUPER_ADMIN")
            .order_by("-created_at")
        )
        invitations = (
            Invitation.objects.select_related("role", "invited_by", "invited_by__auth_user")
            .filter(status="PENDING")
            .order_by("-created_at")
        )

        members = [_member_payload_from_user(user) for user in users]
        members.extend(_member_payload_from_invitation(invitation) for invitation in invitations)

        return Response({"success": True, "members": members})

class RolesInviteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        email = (request.data.get("email") or "").strip().lower()
        raw_role = (request.data.get("role") or "").strip().upper()
        if raw_role == "SUPER_ADMIN":
            return Response({"detail": "Super Admin assignment is not allowed"}, status=status.HTTP_403_FORBIDDEN)
        role_name = _normalize_role(raw_role)

        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not role_name:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        if AuthUser.objects.filter(email__iexact=email).exists():
            return Response({"detail": "An account already exists for this email"}, status=status.HTTP_409_CONFLICT)

        if Invitation.objects.filter(email__iexact=email, status="PENDING").exists():
            return Response({"detail": "An active invitation already exists for this email"}, status=status.HTTP_409_CONFLICT)

        role = _role_object(role_name)
        if not role:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        token = secrets.token_urlsafe(32)
        invitation = Invitation.objects.create(
            email=email,
            role=role,
            invited_by=current,
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

        payload = _member_payload_from_invitation(invitation)
        return Response(
            {
                "success": True,
                "message": "Invitation created successfully",
                "member": payload,
                "email_sent": email_sent,
                "warning": warning,
            },
            status=status.HTTP_201_CREATED,
        )


class RolesResendAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        invitation_id = request.data.get("id") or request.data.get("invitation_id")
        token = request.data.get("token")

        invitation = None
        if invitation_id:
            invitation = Invitation.objects.filter(id=invitation_id).select_related("role").first()
        elif token:
            invitation = Invitation.objects.filter(token=token).select_related("role").first()

        if not invitation:
            return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
        if invitation.status != "PENDING":
            return Response({"detail": "Only pending invitations can be resent"}, status=status.HTTP_400_BAD_REQUEST)

        invitation.token = secrets.token_urlsafe(32)
        invitation.expires_at = timezone.now() + timedelta(days=7)
        invitation.save(update_fields=["token", "expires_at", "updated_at"])

        accept_link = f"{settings.FRONTEND_URL}/get-started?mode=register&invitation_token={invitation.token}"
        email_sent = True
        warning = None
        try:
            _send_invitation_email(invitation, accept_link)
        except Exception as exc:
            email_sent = False
            warning = f"Invitation updated, but email delivery failed: {exc}"

        return Response(
            {
                "success": True,
                "message": "Invitation resent successfully",
                "member": _member_payload_from_invitation(invitation),
                "email_sent": email_sent,
                "warning": warning,
            }
        )


class RolesCancelAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        invitation_id = request.data.get("id") or request.data.get("invitation_id")
        token = request.data.get("token")

        invitation = None
        if invitation_id:
            invitation = Invitation.objects.filter(id=invitation_id).select_related("role").first()
        elif token:
            invitation = Invitation.objects.filter(token=token).select_related("role").first()

        if not invitation:
            return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
        if invitation.status != "PENDING":
            return Response({"detail": "Only pending invitations can be cancelled"}, status=status.HTTP_400_BAD_REQUEST)

        invitation.status = "CANCELLED"
        invitation.save(update_fields=["status", "updated_at"])

        return Response({"success": True, "message": "Invitation cancelled successfully"})


class RolesChangeRoleAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        current, error_response = _require_admin(request)
        if error_response:
            return error_response

        member_type = (request.data.get("member_type") or request.data.get("type") or "USER").strip().upper()
        member_id = request.data.get("member_id") or request.data.get("id")
        raw_role = (request.data.get("role") or "").strip().upper()
        if raw_role == "SUPER_ADMIN":
            return Response({"detail": "Super Admin assignment is not allowed"}, status=status.HTTP_403_FORBIDDEN)
        requested_role = _normalize_role(raw_role)

        if not member_id:
            return Response({"detail": "Member id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not requested_role:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        if requested_role == "SUPER_ADMIN":
            return Response({"detail": "Super Admin assignment is not allowed"}, status=status.HTTP_403_FORBIDDEN)

        if member_type == "INVITATION":
            invitation = Invitation.objects.select_related("role").filter(id=member_id).first()
            if not invitation:
                return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
            if invitation.status != "PENDING":
                return Response({"detail": "Only pending invitations can be updated"}, status=status.HTTP_400_BAD_REQUEST)

            invitation.role = _role_object(requested_role)
            invitation.save(update_fields=["role", "updated_at"])
            return Response(
                {
                    "success": True,
                    "message": "Invitation role updated successfully",
                    "member": _member_payload_from_invitation(invitation),
                }
            )

        user = LernevoUser.objects.select_related("auth_user", "role").filter(id=member_id, is_delete=False).first()
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        if user.role and user.role.name == "SUPER_ADMIN":
            return Response({"detail": "Super Admin role cannot be modified here"}, status=status.HTTP_403_FORBIDDEN)

        role = _role_object(requested_role)
        if not role:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        user.role = role
        user.save(update_fields=["role", "updated_at"])

        return Response(
            {
                "success": True,
                "message": "Role updated successfully",
                "member": _member_payload_from_user(user),
            }
        )


class RolesInvitationLookupAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        _expire_invites()
        invitation = Invitation.objects.select_related("role").filter(token=token).first()

        if not invitation:
            return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
        if invitation.status == "EXPIRED":
            return Response({"detail": "Invitation expired"}, status=status.HTTP_410_GONE)
        if invitation.status == "CANCELLED":
            return Response({"detail": "Invitation cancelled"}, status=status.HTTP_410_GONE)
        if invitation.status == "ACCEPTED":
            return Response({"detail": "Invitation already accepted"}, status=status.HTTP_409_CONFLICT)

        return Response(
            {
                "success": True,
                "invitation": _member_payload_from_invitation(invitation),
            }
        )


class RolesAcceptAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        token = (request.data.get("token") or "").strip()
        name = (request.data.get("name") or "").strip()
        password = request.data.get("password") or ""
        username = (request.data.get("username") or "").strip().lower()

        if not token:
            return Response({"detail": "Invitation token is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not name:
            return Response({"detail": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"detail": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        invitation = Invitation.objects.select_related("role").filter(token=token).first()
        if not invitation:
            return Response({"detail": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
        if invitation.status == "EXPIRED":
            return Response({"detail": "Invitation expired"}, status=status.HTTP_410_GONE)
        if invitation.status == "CANCELLED":
            return Response({"detail": "Invitation cancelled"}, status=status.HTTP_410_GONE)
        if invitation.status == "ACCEPTED":
            return Response({"detail": "Invitation already accepted"}, status=status.HTTP_409_CONFLICT)

        if invitation.expires_at < timezone.now():
            invitation.status = "EXPIRED"
            invitation.save(update_fields=["status", "updated_at"])
            return Response({"detail": "Invitation expired"}, status=status.HTTP_410_GONE)

        email = invitation.email
        if AuthUser.objects.filter(email__iexact=email).exists():
            return Response({"detail": "An account already exists for this invitation email"}, status=status.HTTP_409_CONFLICT)

        final_username = username or slugify(name) or slugify(email.split("@")[0])

        if AuthUser.objects.filter(username__iexact=final_username).exists():
            return Response({"detail": "Username is already taken. Please enter a different username."}, status=status.HTTP_400_BAD_REQUEST)

        auth_user = AuthUser.objects.create_user(
            username=final_username,
            email=email,
            password=password,
            first_name=name,
        )

        role = _role_object(invitation.role.name if invitation.role else "USER")
        lernevo_user = LernevoUser.objects.create(
            auth_user=auth_user,
            role=role,
            is_first_login=False,
        )

        invitation.status = "ACCEPTED"
        invitation.accepted_by = lernevo_user
        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["status", "accepted_by", "accepted_at", "updated_at"])

        token_obj, _ = Token.objects.get_or_create(user=auth_user)

        return Response(
            {
                "success": True,
                "message": "Invitation accepted successfully",
                "token": token_obj.key,
                "user": {
                    "id": str(lernevo_user.id),
                    "username": auth_user.username,
                    "email": auth_user.email,
                    "name": auth_user.first_name,
                    "role": lernevo_user.role.name if lernevo_user.role else "USER",
                },
            },
            status=status.HTTP_201_CREATED,
        )