from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("conversations", "0009_projectinfo"),
    ]

    operations = [
        migrations.CreateModel(
            name="ResumeAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file_name", models.CharField(max_length=255)),
                ("content_type", models.CharField(default="application/pdf", max_length=100)),
                ("file_data", models.BinaryField()),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Resume Asset",
                "verbose_name_plural": "Resume Asset",
            },
        ),
    ]
