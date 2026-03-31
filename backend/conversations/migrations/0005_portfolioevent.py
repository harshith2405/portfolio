from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("conversations", "0004_replace_user_with_visitor_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="PortfolioEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_name", models.CharField(blank=True, max_length=255)),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("session_started", "Session Started"),
                            ("message_sent", "Message Sent"),
                            ("button_click", "Button Click"),
                            ("section_view", "Section View"),
                            ("project_focus", "Project Focus"),
                            ("recruiter_mode_toggle", "Recruiter Mode Toggle"),
                        ],
                        max_length=50,
                    ),
                ),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "conversation",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="events",
                        to="conversations.conversation",
                    ),
                ),
            ],
        ),
    ]
