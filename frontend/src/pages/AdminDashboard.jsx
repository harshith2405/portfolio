import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { conversationApi } from "../services/api";
import { Download, Search } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const loadConversations = async () => {
    try {
      const res = await conversationApi.list({ search, limit: 100 });
      setConversations(res.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conversations_export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage customer conversations
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="px-4 py-2 border rounded-md hover:bg-muted">
            Back to Chat
          </Link>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Messages
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Updated
                </th>
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    {conv.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {conv.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        conv.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {conv.messages?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(conv.updated_at), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/?id=${conv.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
