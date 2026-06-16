from rest_framework import serializers

from .models import (
    AdminUser,
    AIConfig,
    ChatMessage,
    Conversation,
    EditableContent,
    Message,
    PortfolioEvent,
    ProjectInfo,
    RecruiterFollowUp,
    ResumeAsset,
    UserEvent,
    UserSession,
)


class ConversationSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "visitor_name",
            "status",
            "title",
            "preview",
            "created_at",
            "updated_at",
        ]

    def get_title(self, obj):
        first_user_message = obj.messages.filter(role="user").order_by("created_at").first()
        if not first_user_message:
            return "New chat"
        return first_user_message.content.get("text", "New chat")[:60]

    def get_preview(self, obj):
        latest_message = obj.messages.order_by("-created_at").first()
        if not latest_message:
            return "No messages yet"
        return latest_message.content.get("text", "")[:100]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "content", "created_at"]


class UserSessionSerializer(serializers.ModelSerializer):
    conversation_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    lead_score = serializers.SerializerMethodField()
    lead_status = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = [
            "id",
            "name",
            "role",
            "tags",
            "created_at",
            "last_active_at",
            "conversation_count",
            "message_count",
            "lead_score",
            "lead_status",
        ]

    def get_conversation_count(self, obj):
        return obj.conversations.count()

    def get_message_count(self, obj):
        return obj.chat_messages.count()

    def _calculate_lead_score(self, obj):
        user_messages = " ".join(
            obj.chat_messages.values_list("message", flat=True)
        ).lower()
        portfolio_events = PortfolioEvent.objects.filter(conversation__session=obj)
        journey_events = obj.journey_events.all()

        opened_resume = portfolio_events.filter(
            event_type="button_click",
            metadata__target__in=[
                "candidate_resume_download",
                "resume_snapshot_download",
            ],
        ).exists()
        asked_hiring_question = any(
            keyword in user_messages
            for keyword in [
                "hire",
                "recruit",
                "resume",
                "job",
                "role",
                "interview",
                "why should",
            ]
        )
        viewed_projects = journey_events.filter(event_type="viewed_projects").exists()
        requested_follow_up = portfolio_events.filter(
            event_type="button_click",
            metadata__target="follow_up_submit",
        ).exists()

        score = 0
        if opened_resume:
            score += 40
        if asked_hiring_question:
            score += 35
        if viewed_projects:
            score += 25
        if requested_follow_up:
            score += 45

        return min(score, 100)

    def get_lead_score(self, obj):
        return self._calculate_lead_score(obj)

    def get_lead_status(self, obj):
        score = self._calculate_lead_score(obj)
        if score >= 70:
            return "high interest"
        if score >= 35:
            return "warm"
        return "new"


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ["id", "name", "role", "created_at"]


class EditableContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditableContent
        fields = ["id", "key", "value", "updated_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "message", "response", "timestamp", "conversation"]


class UserEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEvent
        fields = ["id", "event_type", "metadata", "timestamp"]


class AIConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConfig
        fields = ["tone", "response_length", "updated_at"]


class ProjectInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInfo
        fields = [
            "id",
            "slug",
            "project_name",
            "summary",
            "why_matters",
            "design_choices",
            "contribution",
            "constraints",
            "outcome",
            "sort_order",
            "updated_at",
        ]


class ResumeAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAsset
        fields = ["file_name", "content_type", "updated_at"]


class RecruiterFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterFollowUp
        fields = [
            "id",
            "recruiter_name",
            "email",
            "company",
            "role_interest",
            "notes",
            "created_at",
        ]
