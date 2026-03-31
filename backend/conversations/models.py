import uuid

from django.db import models


ROLE_CHOICES = (
    ("user", "User"),
    ("admin", "Admin"),
    ("super_admin", "Super Admin"),
)


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class AdminUser(models.Model):
    name = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="admin")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"


class EditableContent(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key


class Conversation(models.Model):
    """
    Represents a single chat session (New Chat).
    """

    STATUS_CHOICES = (
        ("open", "Open"),
        ("closed", "Closed"),
    )

    visitor_name = models.CharField(
        max_length=255,
        db_index=True,
    )
    session = models.ForeignKey(
        UserSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id} ({self.visitor_name}, {self.status})"


class Message(models.Model):
    """
    Stores each message inside a conversation.
    Content is stored as JSON for LLM friendliness.
    """

    ROLE_CHOICES = (
        ("user", "user"),
        ("assistant", "assistant"),
    )

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
    )

    # PostgreSQL JSONB (Django handles this automatically)
    content = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} message (Conversation {self.conversation.id})"


class ConversationMemory(models.Model):
    """
    Stores long-term summarized memory for a conversation.
    One row per conversation.
    """

    conversation = models.OneToOneField(
        Conversation,
        on_delete=models.CASCADE,
        related_name="memory",
    )

    # Summarized long-term context
    memory = models.JSONField(default=dict)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Memory for Conversation {self.conversation.id}"


class PortfolioEvent(models.Model):
    EVENT_CHOICES = (
        ("session_started", "Session Started"),
        ("message_sent", "Message Sent"),
        ("button_click", "Button Click"),
        ("section_view", "Section View"),
        ("project_focus", "Project Focus"),
        ("recruiter_mode_toggle", "Recruiter Mode Toggle"),
    )

    visitor_name = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} ({self.visitor_name or 'anonymous'})"


class ChatMessage(models.Model):
    session = models.ForeignKey(
        UserSession,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_messages",
    )
    message = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatMessage {self.id} ({self.session.name})"


class UserEvent(models.Model):
    EVENT_CHOICES = (
        ("entered", "Entered"),
        ("message_sent", "Message Sent"),
        ("viewed_projects", "Viewed Projects"),
        ("viewed_skills", "Viewed Skills"),
    )

    session = models.ForeignKey(
        UserSession,
        on_delete=models.CASCADE,
        related_name="journey_events",
    )
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.name} - {self.event_type}"


class AIConfig(models.Model):
    TONE_CHOICES = (
        ("formal", "Formal"),
        ("friendly", "Friendly"),
        ("technical", "Technical"),
    )
    LENGTH_CHOICES = (
        ("short", "Short"),
        ("medium", "Medium"),
        ("long", "Long"),
    )

    tone = models.CharField(max_length=20, choices=TONE_CHOICES, default="friendly")
    response_length = models.CharField(max_length=20, choices=LENGTH_CHOICES, default="medium")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI Configuration"
        verbose_name_plural = "AI Configuration"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"AI Config (tone={self.tone}, length={self.response_length})"
