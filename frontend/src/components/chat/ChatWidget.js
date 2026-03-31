import React, { useState, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { conversationApi } from "../../services/api";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWidget = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setConversation(null);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const res = await conversationApi.get(conversationId);
      setConversation(res.data);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (content) => {
    setSending(true);
    try {
      const res = await conversationApi.sendMessage(conversationId, content);
      setConversation(res.data);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-gray-500">
        <svg
          className="w-16 h-16 mb-6 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <p className="text-lg">Select a conversation or start a new one</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <MessageList messages={conversation?.messages || []} sending={sending} />

      <MessageInput onSend={handleSend} disabled={sending} />
    </div>
  );
};

export default ChatWidget;
