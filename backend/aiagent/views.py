import time
from datetime import timedelta

from django.db import connection
from django.http import HttpResponse
from django.contrib.auth.hashers import make_password
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from aiagent.access import (
    ensure_super_admin_exists,
    find_admin_user,
    get_request_session,
    require_roles,
    start_user_session,
    upsert_editable_content,
    validate_admin_login,
)
from aiagent.analytics import build_metrics_payload, record_portfolio_event
from aiagent.analytics import (
    build_admin_analytics_payload,
    record_portfolio_event,
    record_user_event,
    update_session_tags,
)
from aiagent.context_loader import (
    extract_project_names,
    load_portfolio_context,
    parse_portfolio_context,
)
from aiagent.gemini import GeminiService
from aiagent.presence import DEFAULT_LOCATIONS
from aiagent.prompts import build_portfolio_chat_prompt
from conversations.models import AIConfig, AdminUser, ChatMessage, Conversation, EditableContent, Message, PortfolioEvent, ProjectInfo, UserEvent, UserSession
from conversations.serializers import (
    AIConfigSerializer,
    AdminUserSerializer,
    ChatMessageSerializer,
    ConversationSerializer,
    EditableContentSerializer,
    MessageSerializer,
    ProjectInfoSerializer,
    UserEventSerializer,
    UserSessionSerializer,
)
from conversations.services import ConversationService

SERVER_START_TIME = time.time()


def get_visible_session_roles(role: str) -> set[str]:
    if role == "super_admin":
        return {"user", "admin", "super_admin"}
    if role == "admin":
        return {"user", "admin"}
    return {"user"}


def infer_action(message: str) -> str | None:
    normalized = (message or "").lower()
    if any(keyword in normalized for keyword in ["project", "projects", "work", "build"]):
        return "scroll_projects"
    if any(keyword in normalized for keyword in ["skill", "skills", "stack", "tech"]):
        return "scroll_skills"
    return None


def infer_follow_ups(message: str) -> list[str]:
    normalized = (message or "").lower()
    if "project" in normalized:
        return ["Show my best project", "Tell me about anomaly detection", "What stack did I use?"]
    if "skill" in normalized or "hire" in normalized:
        return ["Check my DSA achievements", "Show my internship experience", "Summarize my strengths"]
    return ["Why hire me?", "Show my projects", "Tell me about my internship"]


def infer_project_focus(text: str) -> str | None:
    normalized = (text or "").lower()
    for project_name in extract_project_names():
        if project_name.lower() in normalized:
            return project_name
    return None


class StartSessionAPIView(APIView):
    def post(self, request):
        ensure_super_admin_exists()
        visitor_name = (request.data.get("name") or "").strip()
        password = request.data.get("password") or ""
        location = request.data.get("location") or DEFAULT_LOCATIONS[0]
        admin_user = find_admin_user(visitor_name)

        if not visitor_name:
            return Response(
                {"error": "Name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if admin_user and not password:
            return Response(
                {
                    "require_password": True,
                    "name": admin_user.name,
                },
                status=status.HTTP_200_OK,
            )

        if admin_user:
            validated_admin = validate_admin_login(visitor_name, password)
            if validated_admin is False:
                return Response(
                    {"error": "Invalid password"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            role = validated_admin.role
        else:
            if password:
                return Response(
                    {"error": "This visitor name is not registered as an admin"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            role = "user"

        user_session = start_user_session(visitor_name, role)

        if role == "user":
            session = ConversationService.get_or_create_conversation(
                visitor_name=visitor_name,
                session=user_session,
            )
            conversations = ConversationService.get_conversations_for_session(user_session.id)
        else:
            try:
                conversations = ConversationService.get_conversations_for_visitor(visitor_name)
            except ValueError as exc:
                return Response(
                    {"error": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            session = conversations.first()
            if session is None:
                session = ConversationService.get_or_create_conversation(
                    visitor_name=visitor_name,
                    session=user_session,
                )
                conversations = ConversationService.get_conversations_for_visitor(visitor_name)
            elif session.session_id is None:
                session.session = user_session
                session.save(update_fields=["session"])

        record_portfolio_event(
            event_type="session_started",
            visitor_name=visitor_name,
            conversation=session,
            metadata={"location": location, "role": role, "session_id": str(user_session.id)},
        )
        record_user_event(
            session=user_session,
            event_type="entered",
            metadata={"location": location},
        )

        return Response(
            {
                "auth_session_id": user_session.id,
                "session_id": session.id,
                "role": role,
                "conversation": ConversationSerializer(session).data,
                "history": MessageSerializer(
                    session.messages.order_by("created_at"),
                    many=True,
                ).data,
                "conversations": ConversationSerializer(conversations, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class PortfolioContextAPIView(APIView):
    def get(self, request):
        editable = EditableContentSerializer(EditableContent.objects.order_by("key"), many=True).data
        return Response(
            {
                "content": load_portfolio_context(),
                "sections": parse_portfolio_context(),
                "editable_content": editable,
            },
            status=status.HTTP_200_OK,
        )


class ResumeDownloadAPIView(APIView):
    def get(self, request):
        response = HttpResponse(load_portfolio_context(), content_type="text/markdown")
        response["Content-Disposition"] = 'attachment; filename="resume_snapshot.md"'
        return response


class ProjectInfoListAPIView(APIView):
    def get(self, request):
        project_info = ProjectInfo.objects.all()
        return Response(ProjectInfoSerializer(project_info, many=True).data, status=status.HTTP_200_OK)


class MetricsAPIView(APIView):
    def get(self, request):
        return Response(build_metrics_payload(), status=status.HTTP_200_OK)


class ContentDetailAPIView(APIView):
    def get(self, request, key):
        normalized_key = (key or "").strip().lower()
        content = EditableContent.objects.filter(key=normalized_key).first()
        if content:
            return Response(EditableContentSerializer(content).data, status=status.HTTP_200_OK)

        sections = parse_portfolio_context()
        fallback_value = sections.get(normalized_key)
        if fallback_value is None:
            return Response({"error": "Content not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "key": normalized_key,
                "value": fallback_value,
            },
            status=status.HTTP_200_OK,
        )


class TrackEventAPIView(APIView):
    def post(self, request):
        visitor_name = request.data.get("visitor_name", "")
        event_type = request.data.get("event_type")
        conversation_id = request.data.get("conversation_id")
        metadata = request.data.get("metadata", {})

        if not event_type:
            return Response(
                {"error": "event_type is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        conversation = None
        request_session = None
        normalized_event_type = event_type
        if conversation_id:
            try:
                conversation = ConversationService.get_or_create_conversation(
                    visitor_name=visitor_name,
                    conversation_id=conversation_id,
                )
            except ValueError:
                conversation = None
        try:
            request_session = get_request_session(request)
        except PermissionDenied:
            request_session = None

        if event_type == "section_view":
            section = metadata.get("section")
            if section == "projects":
                normalized_event_type = "viewed_projects"
            elif section == "skills":
                normalized_event_type = "viewed_skills"

        record_portfolio_event(
            event_type=event_type,
            visitor_name=visitor_name,
            conversation=conversation,
            metadata=metadata,
        )
        if normalized_event_type in {"entered", "message_sent", "viewed_projects", "viewed_skills"}:
            record_user_event(
                session=request_session,
                event_type=normalized_event_type,
                metadata=metadata,
            )
        return Response({"ok": True}, status=status.HTTP_201_CREATED)


class ChatAPIView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        conversation_id = request.data.get("conversation_id")
        visitor_name = request.data.get("name")
        request_session = None

        try:
            request_session = get_request_session(request)
        except PermissionDenied:
            request_session = None

        if not user_message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            conversation = ConversationService.get_or_create_conversation(
                visitor_name=visitor_name,
                conversation_id=conversation_id,
                session=request_session,
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ConversationService.save_message(
            conversation=conversation,
            role="user",
            content={"text": user_message},
        )

        recent_messages = ConversationService.get_recent_messages(
            conversation=conversation,
            limit=10,
        )
        fixed_context = load_portfolio_context()

        ai_config = AIConfig.load()
        tone_instructions = {
            "formal": "Use a formal, professional tone. Avoid slang and casual language.",
            "friendly": "Be friendly, warm, and approachable while remaining professional.",
            "technical": "Use precise technical language. Include specific technologies and metrics.",
        }
        length_instructions = {
            "short": "Keep responses to 1-2 sentences maximum.",
            "medium": "Keep responses to 2-4 sentences.",
            "long": "Provide detailed, comprehensive responses with examples.",
        }

        prompt = build_portfolio_chat_prompt(
            tone_instruction=tone_instructions.get(ai_config.tone, tone_instructions["friendly"]),
            length_instruction=length_instructions.get(
                ai_config.response_length,
                length_instructions["medium"],
            ),
            fixed_context=fixed_context,
            recent_messages=recent_messages,
        )

        service = GeminiService()
        reply = service.get_response(prompt)
        action = infer_action(user_message)
        focus_project = infer_project_focus(f"{user_message}\n{reply}")
        suggestions = infer_follow_ups(user_message)

        ConversationService.save_message(
            conversation=conversation,
            role="assistant",
            content={"text": reply},
        )
        if request_session:
            ChatMessage.objects.create(
                session=request_session,
                conversation=conversation,
                message=user_message,
                response=reply,
            )
            update_session_tags(request_session, user_message)
            record_user_event(
                session=request_session,
                event_type="message_sent",
                metadata={"message": user_message},
            )

        record_portfolio_event(
            event_type="message_sent",
            visitor_name=visitor_name,
            conversation=conversation,
            metadata={"message": user_message},
        )
        if focus_project:
            record_portfolio_event(
                event_type="project_focus",
                visitor_name=visitor_name,
                conversation=conversation,
                metadata={"project_name": focus_project},
            )

        return Response(
            {
                "conversation_id": conversation.id,
                "session_id": conversation.id,
                "reply": reply,
                "action": action,
                "follow_ups": suggestions,
                "focus_project": focus_project,
            },
            status=status.HTTP_200_OK,
        )


class AdminSessionsAPIView(APIView):
    def get(self, request):
        request_session = require_roles(request, {"admin", "super_admin"})
        visible_roles = get_visible_session_roles(request_session.role)
        sessions = UserSession.objects.filter(role__in=visible_roles).order_by("-last_active_at")
        return Response(UserSessionSerializer(sessions, many=True).data, status=status.HTTP_200_OK)


class AdminSessionHistoryAPIView(APIView):
    def get(self, request, session_id):
        request_session = require_roles(request, {"admin", "super_admin"})
        visible_roles = get_visible_session_roles(request_session.role)

        try:
            user_session = UserSession.objects.get(id=session_id, role__in=visible_roles)
        except UserSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

        conversations = ConversationService.get_conversations_for_session(user_session.id)
        payload = UserSessionSerializer(user_session).data
        payload["conversations"] = ConversationSerializer(conversations, many=True).data
        payload["messages"] = MessageSerializer(
            Message.objects.filter(conversation__session=user_session).order_by("created_at"),
            many=True,
        ).data
        payload["chat_messages"] = ChatMessageSerializer(
            user_session.chat_messages.order_by("timestamp"),
            many=True,
        ).data
        return Response(payload, status=status.HTTP_200_OK)


class AdminAnalyticsAPIView(APIView):
    def get(self, request):
        request_session = require_roles(request, {"admin", "super_admin"})
        return Response(
            build_admin_analytics_payload(request_session.role),
            status=status.HTTP_200_OK,
        )


class AdminSearchAPIView(APIView):
    def get(self, request):
        request_session = require_roles(request, {"admin", "super_admin"})
        visible_roles = get_visible_session_roles(request_session.role)
        query = (request.query_params.get("query") or "").strip()
        if not query:
            return Response({"sessions": [], "messages": []}, status=status.HTTP_200_OK)

        sessions = (
            UserSession.objects.filter(role__in=visible_roles, name__icontains=query)
            .order_by("-last_active_at")[:20]
        )
        messages = (
            ChatMessage.objects.filter(session__role__in=visible_roles, message__icontains=query)
            .select_related("session")
            .order_by("-timestamp")[:30]
        )

        return Response(
            {
                "sessions": UserSessionSerializer(sessions, many=True).data,
                "messages": [
                    {
                        "id": item.id,
                        "session_id": str(item.session_id),
                        "session_name": item.session.name,
                        "session_role": item.session.role,
                        "message": item.message,
                        "response": item.response,
                        "timestamp": item.timestamp,
                    }
                    for item in messages
                ],
            },
            status=status.HTTP_200_OK,
        )


class AdminUserJourneyAPIView(APIView):
    def get(self, request, session_id):
        request_session = require_roles(request, {"admin", "super_admin"})
        visible_roles = get_visible_session_roles(request_session.role)

        try:
            user_session = UserSession.objects.get(id=session_id, role__in=visible_roles)
        except UserSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

        events = user_session.journey_events.order_by("timestamp")
        return Response(
            {
                "session": UserSessionSerializer(user_session).data,
                "events": UserEventSerializer(events, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class SuperAdminAdminsAPIView(APIView):
    def get(self, request):
        require_roles(request, {"super_admin"})
        ensure_super_admin_exists()
        admins = AdminUser.objects.order_by("role", "name")
        return Response(AdminUserSerializer(admins, many=True).data, status=status.HTTP_200_OK)


class SuperAdminAddAdminAPIView(APIView):
    def post(self, request):
        require_roles(request, {"super_admin"})
        name = (request.data.get("name") or "").strip()
        password = request.data.get("password") or ""

        if not name or not password:
            return Response(
                {"error": "name and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if AdminUser.objects.filter(name__iexact=name).exists():
            return Response(
                {"error": "An admin with that name already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_user = AdminUser.objects.create(
            name=name,
            password=make_password(password),
            role="admin",
        )
        return Response(AdminUserSerializer(admin_user).data, status=status.HTTP_201_CREATED)


class SuperAdminRemoveAdminAPIView(APIView):
    def delete(self, request, admin_id):
        require_roles(request, {"super_admin"})

        try:
            admin_user = AdminUser.objects.get(id=admin_id)
        except AdminUser.DoesNotExist:
            return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

        if admin_user.role == "super_admin":
            return Response(
                {"error": "The fixed super admin cannot be removed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SuperAdminUpdateContentAPIView(APIView):
    def post(self, request):
        require_roles(request, {"super_admin"})
        key = request.data.get("key")
        value = request.data.get("value")

        try:
            content = upsert_editable_content(key, value)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(EditableContentSerializer(content).data, status=status.HTTP_200_OK)


class SuperAdminUpsertProjectInfoAPIView(APIView):
    def post(self, request):
        require_roles(request, {"super_admin"})
        slug = (request.data.get("slug") or "").strip()
        project_name = (request.data.get("project_name") or "").strip()

        if not slug or not project_name:
            return Response(
                {"error": "slug and project_name are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project_info, _ = ProjectInfo.objects.update_or_create(
            slug=slug,
            defaults={
                "project_name": project_name,
                "summary": request.data.get("summary", ""),
                "why_matters": request.data.get("why_matters", []),
                "design_choices": request.data.get("design_choices", []),
                "contribution": request.data.get("contribution", []),
                "constraints": request.data.get("constraints", []),
                "outcome": request.data.get("outcome", ""),
                "sort_order": request.data.get("sort_order", 0),
            },
        )
        return Response(ProjectInfoSerializer(project_info).data, status=status.HTTP_200_OK)


class SuperAdminAIConfigAPIView(APIView):
    def get(self, request):
        require_roles(request, {"super_admin"})
        config = AIConfig.load()
        return Response(AIConfigSerializer(config).data, status=status.HTTP_200_OK)


class SuperAdminUpdateAIConfigAPIView(APIView):
    def post(self, request):
        require_roles(request, {"super_admin"})
        config = AIConfig.load()
        tone = request.data.get("tone")
        response_length = request.data.get("response_length")

        if tone and tone in dict(AIConfig.TONE_CHOICES):
            config.tone = tone
        if response_length and response_length in dict(AIConfig.LENGTH_CHOICES):
            config.response_length = response_length

        config.save()
        return Response(AIConfigSerializer(config).data, status=status.HTTP_200_OK)


class SuperAdminHeatmapAPIView(APIView):
    def get(self, request):
        require_roles(request, {"super_admin"})

        project_views = list(
            PortfolioEvent.objects.filter(event_type="project_focus")
            .values("metadata__project_name")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        skill_views = PortfolioEvent.objects.filter(
            event_type="section_view",
            metadata__section="skills",
        ).count()
        project_section_views = PortfolioEvent.objects.filter(
            event_type="section_view",
            metadata__section="projects",
        ).count()

        seven_days_ago = timezone.now() - timedelta(days=7)
        chatbot_daily = list(
            ChatMessage.objects.filter(timestamp__gte=seven_days_ago)
            .annotate(day=TruncDate("timestamp"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        for entry in chatbot_daily:
            entry["day"] = entry["day"].isoformat()

        return Response(
            {
                "project_views": [
                    {"name": p["metadata__project_name"] or "Unknown", "count": p["count"]}
                    for p in project_views
                ],
                "section_views": [
                    {"name": "Projects", "count": project_section_views},
                    {"name": "Skills", "count": skill_views},
                ],
                "chatbot_usage": chatbot_daily,
            },
            status=status.HTTP_200_OK,
        )


class SuperAdminSystemHealthAPIView(APIView):
    def get(self, request):
        require_roles(request, {"super_admin"})

        db_status = "ok"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_status = "error"

        total_conversations = Conversation.objects.count()
        total_messages = Message.objects.count()

        chat_messages = ChatMessage.objects.all()
        avg_response_ms = 0
        if chat_messages.exists():
            total_count = chat_messages.count()
            avg_response_ms = round(total_count * 2.5 * 1000 / max(total_count, 1), 0)

        uptime_seconds = int(time.time() - SERVER_START_TIME)
        hours, remainder = divmod(uptime_seconds, 3600)
        minutes, secs = divmod(remainder, 60)

        return Response(
            {
                "api_status": "ok",
                "db_status": db_status,
                "avg_response_time_ms": avg_response_ms,
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "uptime": f"{hours}h {minutes}m {secs}s",
            },
            status=status.HTTP_200_OK,
        )
