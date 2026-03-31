import random
from collections import OrderedDict


DEFAULT_LOCATIONS = [
    "Hyderabad",
    "Bengaluru",
    "Mumbai",
    "Pune",
    "Chennai",
]

_connections = OrderedDict()


def upsert_connection(channel_name: str, visitor_name: str, location: str | None) -> dict:
    resolved_location = (location or "").strip() or random.choice(DEFAULT_LOCATIONS)
    _connections[channel_name] = {
        "visitor_name": visitor_name or "Anonymous visitor",
        "location": resolved_location,
    }
    return snapshot()


def remove_connection(channel_name: str) -> dict:
    _connections.pop(channel_name, None)
    return snapshot()


def snapshot() -> dict:
    latest = next(reversed(_connections.values()), None) if _connections else None
    return {
        "active_users": len(_connections),
        "latest_location": latest["location"] if latest else None,
        "latest_visitor": latest["visitor_name"] if latest else None,
    }
