from rest_framework import serializers

from .models import (
    AdminUser,
    AIConfig,
    ChatMessage,
    Conversation,
    EditableContent,
    Message,
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
        ]

    def get_conversation_count(self, obj):
        return obj.conversations.count()

    def get_message_count(self, obj):
        return obj.chat_messages.count()


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
