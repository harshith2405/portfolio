import json
from urllib.parse import parse_qs

from channels.generic.websocket import AsyncWebsocketConsumer

from aiagent.presence import remove_connection, upsert_connection


class PresenceConsumer(AsyncWebsocketConsumer):
    group_name = "portfolio_presence"

    async def connect(self):
        params = parse_qs(self.scope["query_string"].decode())
        visitor_name = params.get("name", ["Anonymous visitor"])[0]
        location = params.get("location", [""])[0]

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        state = upsert_connection(self.channel_name, visitor_name, location)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence.update",
                "payload": state,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        state = remove_connection(self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence.update",
                "payload": state,
            },
        )

    async def presence_update(self, event):
        await self.send(text_data=json.dumps(event["payload"]))
