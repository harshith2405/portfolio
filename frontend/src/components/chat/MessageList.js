import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, sending }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages?.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {sending && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V9z" />
              </svg>
            </div>
            <div className="flex-1">
              <Loader2 className="animate-spin text-gray-400" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
