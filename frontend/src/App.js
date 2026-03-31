import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
} from "./services/api";

function App() {
  const [visitorName, setVisitorName] = useState(
    () => localStorage.getItem("portfolio_visitor_name") || ""
  );
  const [draftName, setDraftName] = useState(
    () => localStorage.getItem("portfolio_visitor_name") || ""
  );
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  const profileHighlights = useMemo(
    () => [
      "Recruiter-focused AI assistant powered by Gemini",
      "Conversation history grouped by visitor name",
      "Fixed portfolio context + short-term chat memory",
    ],
    []
  );

  useEffect(() => {
    if (visitorName) {
      void loadConversations(visitorName);
    }
  }, [visitorName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversation = async (id, name = visitorName) => {
    const res = await getConversation(id, name);
    setMessages(res.data.messages || []);
    setConversationId(res.data.id);
  };

  const loadConversations = async (name) => {
    try {
      setError("");
      const res = await listConversations(name);
      const items = res.data;
      setConversations(items);

      const latestConversation = items[0];
      if (!latestConversation) {
        setConversationId(null);
        setMessages([]);
        return;
      }

      await loadConversation(latestConversation.id, name);
    } catch (err) {
      console.error(err);
      setError("Unable to load chat history");
    }
  };

  const handleStart = () => {
    const normalizedName = draftName.trim();
    if (!normalizedName) {
      setError("Please enter your name");
      return;
    }

    localStorage.setItem("portfolio_visitor_name", normalizedName);
    setError("");
    setVisitorName(normalizedName);
  };

  const handleSwitchVisitor = () => {
    localStorage.removeItem("portfolio_visitor_name");
    setVisitorName("");
    setDraftName("");
    setConversationId(null);
    setConversations([]);
    setMessages([]);
    setError("");
    setInput("");
  };

  const handleNewChat = async () => {
    if (!visitorName) return;

    try {
      setError("");
      const res = await createConversation(visitorName);
      const nextConversation = res.data;
      setConversations((current) => [nextConversation, ...current]);
      setConversationId(nextConversation.id);
      setMessages([]);
      setInput("");
    } catch (err) {
      console.error(err);
      setError("Unable to start a new chat");
    }
  };

  const handleConversationSelect = async (id) => {
    try {
      setError("");
      await loadConversation(id, visitorName);
    } catch (err) {
      console.error(err);
      setError("Unable to open that conversation");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !visitorName) return;

    try {
      setLoading(true);
      setError("");
      const res = await sendMessage({
        name: visitorName,
        text: input,
        conversationId,
      });
      const convId = res.data.conversation_id;
      setInput("");
      await loadConversation(convId, visitorName);
      await loadConversations(visitorName);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!visitorName) {
    return (
      <div className="name-gate">
        <div className="name-card">
          <span className="eyebrow">Portfolio Assistant</span>
          <h1>Start the recruiter chat</h1>
          <p>
          Enter your name to continue your conversation history.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <div className="name-form">
            <input
              className="name-input"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Your name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleStart();
              }
            }}
          />
            <button className="primary-button" onClick={handleStart}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-layout">
      <aside className="profile-panel">
        <div className="profile-card">
          <span className="eyebrow">Portfolio</span>
          <h1>Build a recruiter-first introduction.</h1>
          <p className="profile-copy">
            This layout is ready for your personal story on the left and an AI recruiter
            assistant on the right. I also created a fixed memory file on the backend so
            we can load your resume, GitHub, achievements, and hiring pitch next.
          </p>

          <div className="profile-block">
            <h2>What this chatbot already supports</h2>
            <ul className="highlight-list">
              {profileHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="profile-block muted-block">
            <div className="stat-label">Active visitor</div>
            <div className="stat-value">{visitorName}</div>
            <button className="secondary-button" onClick={handleSwitchVisitor}>
              Change visitor name
            </button>
          </div>
        </div>
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Recruiter Chat</span>
            <h2>Ask about skills, projects, hiring fit, or background</h2>
          </div>
          <button className="primary-button" onClick={handleNewChat}>
            New chat
          </button>
        </header>

        <section className="history-strip">
          {conversations.length === 0 ? (
            <div className="history-empty">No saved chats for this visitor yet.</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`history-card ${
                  conversation.id === conversationId ? "active" : ""
                }`}
                onClick={() => handleConversationSelect(conversation.id)}
              >
                <span className="history-title">{conversation.title}</span>
                <span className="history-preview">{conversation.preview}</span>
              </button>
            ))
          )}
        </section>

        {error && <div className="error-banner inline">{error}</div>}

        <section className="messages-panel">
          {messages.length === 0 && !loading ? (
            <div className="empty-chat">
              <h3>Start a fresh conversation</h3>
              <p>
                Ask why you should be hired, what projects stand out, or what tech stack
                this portfolio uses.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-row ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="message-bubble">
                  <span className="message-role">
                    {msg.role === "user" ? visitorName : "Assistant"}
                  </span>
                  <p>{msg.content?.text}</p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble">
                <span className="message-role">Assistant</span>
                <p>Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        <footer className="composer">
          <textarea
            className="composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about projects, resume highlights, strengths, or hiring fit..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className="primary-button composer-button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;
