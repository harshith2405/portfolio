from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("conversations", "0010_resumeasset"),
    ]

    operations = [
        migrations.CreateModel(
            name="RecruiterFollowUp",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("recruiter_name", models.CharField(max_length=255)),
                ("email", models.EmailField(max_length=254)),
                ("company", models.CharField(blank=True, max_length=255)),
                ("role_interest", models.CharField(blank=True, max_length=100)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "conversation",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="follow_up_requests",
                        to="conversations.conversation",
                    ),
                ),
                (
                    "session",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="follow_up_requests",
                        to="conversations.usersession",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
