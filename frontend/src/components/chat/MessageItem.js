import React from "react";
import { User } from "lucide-react";

const MessageItem = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-blue-600" : "bg-green-500"
        }`}
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V9z" />
          </svg>
        )}
      </div>

      <div className="flex-1" data-testid={`message-${message.id}`}>
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="text-gray-800 text-base leading-7 whitespace-pre-wrap">
          {message.content}
        </div>
        {message.intent && (
          <div className="mt-2 text-xs text-gray-500 italic">
            Intent: {message.intent}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
