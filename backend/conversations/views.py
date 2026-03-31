from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from aiagent.access import get_request_session
from .models import Message
from .serializers import ConversationSerializer, MessageSerializer
from .services import ConversationService


class ConversationListAPIView(APIView):
    """
    List all conversations for the user
    """

    def get(self, request):
        visitor_name = request.query_params.get("name")
        try:
            conversations = ConversationService.get_conversations_for_visitor(
                visitor_name
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConversationSerializer(conversations, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        visitor_name = request.data.get("name")
        request_session = None

        try:
            request_session = get_request_session(request)
        except PermissionDenied:
            request_session = None

        try:
            conversation = ConversationService.get_or_create_conversation(
                visitor_name=visitor_name,
                session=request_session,
            )
        except ValueError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationMessagesAPIView(APIView):
    """
    Get full message history for a conversation
    """

    def get(self, request, conversation_id):
        visitor_name = request.query_params.get("name")

        try:
            conversation = ConversationService.get_or_create_conversation(
                visitor_name=visitor_name,
                conversation_id=conversation_id,
            )
        except ValueError as exc:
            status_code = (
                status.HTTP_400_BAD_REQUEST
                if str(exc) == "Visitor name is required"
                else status.HTTP_404_NOT_FOUND
            )
            return Response(
                {"error": str(exc) if status_code == status.HTTP_400_BAD_REQUEST else "Conversation not found"},
                status=status_code,
            )

        messages = Message.objects.filter(conversation=conversation).order_by("created_at")
        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ConversationDetailAPIView(APIView):
    """
    Get conversation metadata and full message history for a visitor-owned conversation.
    """

    def get(self, request, conversation_id):
        visitor_name = request.query_params.get("name")

        try:
            conversation = ConversationService.get_or_create_conversation(
                visitor_name=visitor_name,
                conversation_id=conversation_id,
            )
        except ValueError as exc:
            status_code = (
                status.HTTP_400_BAD_REQUEST
                if str(exc) == "Visitor name is required"
                else status.HTTP_404_NOT_FOUND
            )
            return Response(
                {"error": str(exc) if status_code == status.HTTP_400_BAD_REQUEST else "Conversation not found"},
                status=status_code,
            )

        payload = ConversationSerializer(conversation).data
        payload["messages"] = MessageSerializer(
            conversation.messages.order_by("created_at"),
            many=True,
        ).data
        return Response(payload, status=status.HTTP_200_OK)
