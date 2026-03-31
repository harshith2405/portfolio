from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("conversations", "0003_remove_conversationmemory_summary_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="conversation",
            name="visitor_name",
            field=models.CharField(
                db_index=True,
                default="Guest",
                max_length=255,
            ),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name="conversation",
            name="user",
        ),
    ]
