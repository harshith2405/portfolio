import React from "react";
import { Plus, MessageSquare, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  search,
  setSearch,
}) => {
  return (
    <div className="w-80 bg-green-600 text-white flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors"
          data-testid="new-chat-btn"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/10 border border-white/20 text-white rounded-lg placeholder-white/60 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-colors"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-white/60 text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeId === conv.id ? "bg-white/20" : "hover:bg-white/10"
                }`}
                onClick={() => onSelect(conv.id)}
                data-testid={`conversation-item-${conv.id}`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <MessageSquare size={16} className="shrink-0 text-white/80" />
                  <div className="truncate flex-1">
                    <div className="font-normal text-sm truncate text-white">
                      {conv.title || "New Conversation"}
                    </div>
                    {conv.updated_at && (
                      <div className="text-xs text-white/60 mt-0.5">
                        {format(new Date(conv.updated_at), "MMM d")}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/20 rounded transition-all shrink-0"
                  data-testid={`delete-btn-${conv.id}`}
                  title="Delete conversation"
                >
                  <Trash2
                    size={14}
                    className="text-white/80 hover:text-red-300"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
