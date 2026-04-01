from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied

from conversations.models import AdminUser, EditableContent, UserSession


DEFAULT_SUPER_ADMIN_NAME = getattr(settings, "SUPER_ADMIN_NAME", "superadmin")
DEFAULT_SUPER_ADMIN_PASSWORD = getattr(settings, "SUPER_ADMIN_PASSWORD", "change-me-now")
SESSION_HEADER_NAME = "HTTP_X_SESSION_ID"


def ensure_super_admin_exists():
    super_admin, created = AdminUser.objects.get_or_create(
        name=DEFAULT_SUPER_ADMIN_NAME,
        defaults={
            "password": make_password(DEFAULT_SUPER_ADMIN_PASSWORD),
            "role": "super_admin",
        },
    )
    if super_admin.role != "super_admin":
        super_admin.role = "super_admin"
        if created:
            super_admin.password = make_password(DEFAULT_SUPER_ADMIN_PASSWORD)
        super_admin.save(update_fields=["role"])
    return super_admin


def find_admin_user(name: str):
    ensure_super_admin_exists()
    normalized_name = (name or "").strip()
    if not normalized_name:
        return None
    return AdminUser.objects.filter(name__iexact=normalized_name).first()


def start_user_session(name: str, role: str):
    normalized_name = (name or "").strip()
    if not normalized_name:
        raise ValueError("Name is required")

    return UserSession.objects.create(name=normalized_name, role=role)


def validate_admin_login(name: str, password: str):
    admin_user = find_admin_user(name)
    if admin_user is None:
        return None
    if not password or not check_password(password, admin_user.password):
        return False
    return admin_user


def get_request_session(request):
    session_id = request.META.get(SESSION_HEADER_NAME) or request.query_params.get("session_id")
    if not session_id:
        raise PermissionDenied("Session id is required")

    try:
        session = UserSession.objects.get(id=session_id)
    except (UserSession.DoesNotExist, ValidationError, ValueError) as exc:
        raise PermissionDenied("Invalid session id") from exc

    session.save(update_fields=["last_active_at"])
    return session


def require_roles(request, allowed_roles: set[str]):
    session = get_request_session(request)
    if session.role not in allowed_roles:
        raise PermissionDenied("You do not have permission to access this resource")
    return session


def upsert_editable_content(key: str, value):
    normalized_key = (key or "").strip().lower()
    if not normalized_key:
        raise ValueError("Content key is required")

    content, _ = EditableContent.objects.update_or_create(
        key=normalized_key,
        defaults={"value": value},
    )
    return content
