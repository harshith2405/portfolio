from pathlib import Path

from conversations.models import EditableContent


PORTFOLIO_CONTEXT_PATH = Path(__file__).resolve().parent / "portfolio_context.md"


def _parse_sections(content: str) -> dict:
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


def _read_file_content() -> str:
    if not PORTFOLIO_CONTEXT_PATH.exists():
        return ""

    return PORTFOLIO_CONTEXT_PATH.read_text(encoding="utf-8").strip()


def _build_merged_content() -> str:
    sections = _parse_sections(_read_file_content())

    for row in EditableContent.objects.order_by("key"):
        value = row.value
        rendered = value.strip() if isinstance(value, str) else str(value).strip()
        if rendered:
            sections[row.key.lower()] = rendered

    if not sections:
        return ""

    return "\n\n".join(
        [f"## {key.title()}\n{value}" for key, value in sections.items() if value]
    ).strip()


def load_portfolio_context() -> str:
    return _build_merged_content()


def parse_portfolio_context() -> dict:
    return _parse_sections(load_portfolio_context())


def extract_project_names() -> list[str]:
    projects_section = parse_portfolio_context().get("projects", "")
    names = []

    for line in projects_section.splitlines():
        stripped = line.strip()
        if stripped.startswith("- Project name:"):
            raw_name = stripped.replace("- Project name:", "").strip()
            names.append(raw_name.split(" (")[0].strip())

    return names
