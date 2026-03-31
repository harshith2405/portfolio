from django.urls import path

from .views import (
    ConversationDetailAPIView,
    ConversationListAPIView,
    ConversationMessagesAPIView,
)

urlpatterns = [
    path("conversations/", ConversationListAPIView.as_view(), name="conversation-list"),
    path(
        "conversations/<int:conversation_id>/",
        ConversationDetailAPIView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        ConversationMessagesAPIView.as_view(),
        name="conversation-messages",
    ),
]
