from pathlib import Path

from conversations.models import EditableContent


PORTFOLIO_CONTEXT_PATH = Path(__file__).resolve().parent / "portfolio_context.md"


def _build_content_from_db() -> str:
    content_rows = EditableContent.objects.order_by("key")
    if not content_rows.exists():
        return ""

    sections = []
    for row in content_rows:
        value = row.value
        if isinstance(value, str):
            rendered = value.strip()
        else:
            rendered = str(value).strip()
        if rendered:
            sections.append(f"## {row.key.title()}\n{rendered}")
    return "\n\n".join(sections).strip()


def load_portfolio_context() -> str:
    db_content = _build_content_from_db()
    if db_content:
        return db_content

    if not PORTFOLIO_CONTEXT_PATH.exists():
        return ""

    return PORTFOLIO_CONTEXT_PATH.read_text(encoding="utf-8").strip()


def parse_portfolio_context() -> dict:
    content = load_portfolio_context()
    if not content:
        return {}

    sections = {}
    current_section = "intro"
    buffer = []

    for line in content.splitlines():
        if line.startswith("## "):
            sections[current_section] = "\n".join(buffer).strip()
            current_section = line[3:].strip().lower()
            buffer = []
            continue
        buffer.append(line)

    sections[current_section] = "\n".join(buffer).strip()
    return {key: value for key, value in sections.items() if value}


def extract_project_names() -> list[str]:
    projects_section = parse_portfolio_context().get("projects", "")
    names = []

    for line in projects_section.splitlines():
        stripped = line.strip()
        if stripped.startswith("- Project name:"):
            raw_name = stripped.replace("- Project name:", "").strip()
            names.append(raw_name.split(" (")[0].strip())

    return names
