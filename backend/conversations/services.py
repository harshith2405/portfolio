from django.core.exceptions import ObjectDoesNotExist
from django.db import close_old_connections

from .models import Conversation, ConversationMemory, Message, UserSession


class ConversationService:
    @staticmethod
    def normalize_visitor_name(visitor_name: str) -> str:
        normalized = (visitor_name or "").strip()
        if not normalized:
            raise ValueError("Visitor name is required")
        return normalized

    @staticmethod
    def get_or_create_conversation(visitor_name, conversation_id=None, session=None):
        close_old_connections()
        visitor_name = ConversationService.normalize_visitor_name(visitor_name)
        session_obj = None
        if session is not None:
            if isinstance(session, UserSession):
                session_obj = session
            else:
                session_obj = UserSession.objects.filter(id=session).first()

        if conversation_id:
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    visitor_name__iexact=visitor_name,
                )
                if (
                    session_obj
                    and session_obj.role == "user"
                    and conversation.session_id != session_obj.id
                ):
                    raise ValueError("Invalid conversation_id")
                if session_obj and conversation.session_id is None:
                    conversation.session = session_obj
                    conversation.save(update_fields=["session"])
                return conversation
            except ObjectDoesNotExist:
                raise ValueError("Invalid conversation_id")

        return Conversation.objects.create(visitor_name=visitor_name, session=session_obj)

    @staticmethod
    def get_conversations_for_visitor(visitor_name):
        close_old_connections()
        visitor_name = ConversationService.normalize_visitor_name(visitor_name)
        return Conversation.objects.filter(
            visitor_name__iexact=visitor_name,
        ).order_by("-updated_at")

    @staticmethod
    def save_message(conversation, role, content):
        close_old_connections()
        message = Message.objects.create(
            conversation=conversation,
            role=role,
            content=content,
        )
        conversation.save(update_fields=["updated_at"])
        return message

    @staticmethod
    def get_recent_messages(conversation, limit=5):
        close_old_connections()
        return (
            Message.objects.filter(conversation=conversation)
            .order_by("-created_at")[:limit][::-1]
        )

    @staticmethod
    def get_conversations_for_session(session_id):
        close_old_connections()
        return Conversation.objects.filter(session_id=session_id).order_by("-updated_at")


class ConversationMemoryService:
    @staticmethod
    def upsert_memory(conversation, memories: list):
        close_old_connections()
        memory_obj, _ = ConversationMemory.objects.get_or_create(
            conversation=conversation,
        )

        data = memory_obj.memory

        for memory in memories:
            if memory.get("g", 0) < 4:
                continue

            key = memory.get("k")
            value = memory.get("v")

            if key and value:
                data[key] = value

        memory_obj.memory = data
        memory_obj.save()
        return memory_obj

    @staticmethod
    def build_summary(conversation) -> str:
        close_old_connections()
        try:
            memory = conversation.memory.memory
        except ConversationMemory.DoesNotExist:
            return ""

        return " ".join(memory.values())
