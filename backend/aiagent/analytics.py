from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone

from aiagent.presence import snapshot
from conversations.models import ChatMessage, Conversation, PortfolioEvent, UserEvent, UserSession


def record_portfolio_event(event_type, visitor_name="", conversation=None, metadata=None):
    return PortfolioEvent.objects.create(
        visitor_name=visitor_name or "",
        event_type=event_type,
        conversation=conversation,
        metadata=metadata or {},
    )


def build_metrics_payload():
    presence = snapshot()

    total_visitors = (
        PortfolioEvent.objects.filter(event_type="session_started")
        .exclude(visitor_name="")
        .values("visitor_name")
        .distinct()
        .count()
    )
    messages_sent = PortfolioEvent.objects.filter(event_type="message_sent").count()

    top_project = (
        PortfolioEvent.objects.filter(event_type="project_focus")
        .values("metadata__project_name")
        .annotate(total=Count("id"))
        .order_by("-total")
        .first()
    )

    return {
        "total_visitors": total_visitors,
        "messages_sent": messages_sent,
        "most_viewed_project": top_project["metadata__project_name"] if top_project else "No data yet",
        "active_users": presence["active_users"],
        "latest_viewer_location": presence["latest_location"] or "Unknown",
        "conversation_count": Conversation.objects.count(),
    }


def record_user_event(session, event_type, metadata=None):
    if session is None:
        return None
    return UserEvent.objects.create(
        session=session,
        event_type=event_type,
        metadata=metadata or {},
    )


def update_session_tags(session, user_message):
    if session is None:
        return []

    normalized = (user_message or "").lower()
    next_tags = set(session.tags or [])
    if "dsa" in normalized:
        next_tags.add("DSA-focused")
    if "project" in normalized or "projects" in normalized:
        next_tags.add("project-focused")

    if list(next_tags) != list(session.tags or []):
        session.tags = sorted(next_tags)
        session.save(update_fields=["tags", "last_active_at"])

    return session.tags


def build_admin_analytics_payload(role="admin"):
    last_24h = timezone.now() - timedelta(hours=24)
    visible_roles = ["user", "admin"] if role == "admin" else ["user", "admin", "super_admin"]
    visible_sessions = UserSession.objects.filter(role__in=visible_roles)
    total_users = visible_sessions.count()
    active_last_24h = visible_sessions.filter(last_active_at__gte=last_24h).count()

    averages = (
        visible_sessions.annotate(message_total=Count("chat_messages"))
        .aggregate(avg_messages_per_user=Avg("message_total"))
    )
    common_queries = list(
        ChatMessage.objects.filter(session__role__in=visible_roles)
        .values("message")
        .annotate(total=Count("id"))
        .order_by("-total", "message")[:5]
    )

    return {
        "total_users": total_users,
        "active_last_24h": active_last_24h,
        "avg_messages_per_user": round(averages["avg_messages_per_user"] or 0, 2),
        "most_common_queries": common_queries,
    }
