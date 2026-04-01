from django.db import migrations, models


def seed_project_info(apps, schema_editor):
    ProjectInfo = apps.get_model("conversations", "ProjectInfo")

    records = [
        {
            "slug": "ai-chatbot-with-memory",
            "project_name": "AI Chatbot with Memory",
            "summary": "Advanced conversational chatbot with memory and retrieval-based answering.",
            "why_matters": [
                "Shows how I design assistant systems that stay grounded in structured profile and project data.",
                "HyDE-based retrieval improved grounding quality and helped reduce hallucinations on knowledge-heavy prompts.",
            ],
            "design_choices": [
                "I used a dual-memory approach with recent conversation context plus persistent portfolio knowledge.",
                "I added RAG and HyDE retrieval so the assistant could fetch stronger context before generating replies.",
                "I kept the response layer structured so answers stay aligned with profile data instead of drifting.",
            ],
            "contribution": [],
            "constraints": [
                "I had to balance response quality with chat latency so the system still feels interactive.",
                "I chose controlled retrieval over free-form generation because predictable recruiter answers mattered more than creativity.",
            ],
            "outcome": "Production-style chatbot architecture with cleaner context handling and stronger follow-up consistency.",
            "sort_order": 1,
        },
        {
            "slug": "anomaly-detection-system",
            "project_name": "Anomaly Detection System",
            "summary": "Detects anomalies in real-time video streams from an IP camera feed.",
            "why_matters": [
                "Shows real-time computer vision, event-driven alerting, and practical system integration.",
                "Moves beyond model training by connecting detection output to actionable notifications.",
            ],
            "design_choices": [
                "I trained the model for anomaly detection and used OpenCV-based frame processing to handle the live feed.",
                "I connected alerting through Twilio so the system produced immediate notifications instead of passive logs.",
            ],
            "contribution": [
                "Trained the anomaly detection model.",
                "Worked on the OpenCV pipeline for live frame processing.",
            ],
            "constraints": [
                "Real-time systems force trade-offs between detection quality, throughput, and alert sensitivity.",
                "False positives can make alert systems noisy, so the thresholding logic has to be tuned carefully.",
            ],
            "outcome": "Built a real-time anomaly pipeline that detects suspicious events and triggers immediate alerts.",
            "sort_order": 2,
        },
        {
            "slug": "employee-summary-generator",
            "project_name": "Employee Summary Generator",
            "summary": "Converts structured employee database data into concise natural-language summaries.",
            "why_matters": [
                "Shows how I turn raw structured data into readable outputs that are useful in a business workflow.",
                "Demonstrates API-first thinking and grounding generated text in actual database records.",
            ],
            "design_choices": [
                "I kept the summarization layer separate from data access so the API stayed easier to maintain and extend.",
                "I constrained the generation flow around structured employee records to keep summaries accurate.",
            ],
            "contribution": [],
            "constraints": [
                "Generated summaries have to remain grounded in source values rather than sounding good but drifting from the data.",
                "The API needed to stay simple enough to extend later without tightly coupling business logic and generation logic.",
            ],
            "outcome": "Automated readable summaries from raw employee records while keeping the service clean and extensible.",
            "sort_order": 3,
        },
        {
            "slug": "interview-ai",
            "project_name": "Interview AI",
            "summary": "Simulates interview experiences with AI-driven interviewers and session management.",
            "why_matters": [
                "Shows product thinking for interview preparation rather than only backend utility work.",
                "Highlights full-stack flow design where UX, session handling, and persistence all matter together.",
            ],
            "design_choices": [
                "I modeled the interview flow around structured sessions so the product feels guided instead of loose and repetitive.",
                "I used Prisma for cleaner session persistence and ShadCN UI for a more polished user experience.",
            ],
            "contribution": [],
            "constraints": [
                "The interface had to feel guided without becoming cluttered or overwhelming for the user.",
                "Interview practice needed to feel realistic while still staying simple enough to use repeatedly.",
            ],
            "outcome": "Built a more organized mock interview product that feels like a real guided practice environment.",
            "sort_order": 4,
        },
    ]

    for record in records:
        ProjectInfo.objects.update_or_create(slug=record["slug"], defaults=record)


class Migration(migrations.Migration):
    dependencies = [
        ("conversations", "0008_aiconfig"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectInfo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(unique=True)),
                ("project_name", models.CharField(max_length=255)),
                ("summary", models.TextField(blank=True)),
                ("why_matters", models.JSONField(blank=True, default=list)),
                ("design_choices", models.JSONField(blank=True, default=list)),
                ("contribution", models.JSONField(blank=True, default=list)),
                ("constraints", models.JSONField(blank=True, default=list)),
                ("outcome", models.TextField(blank=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["sort_order", "project_name"]},
        ),
        migrations.RunPython(seed_project_info, migrations.RunPython.noop),
    ]
