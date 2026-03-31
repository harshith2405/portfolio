import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, History, Mic, PanelLeftClose, PanelLeft, SendHorizonal, Sparkles, Volume2 } from "lucide-react";

import { getHistory, sendMessage } from "../services/api";

const SUGGESTED_PROMPTS = ["Why hire me?", "Show my projects", "What are my skills?"];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((dot) => (
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
          className="h-2.5 w-2.5 rounded-full bg-cyan-300"
          key={dot}
          transition={{ duration: 0.9, delay: dot * 0.12, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function ChatbotPanel({
  booting,
  conversations,
  error,
  messages,
  name,
  onAction,
  onFocusProject,
  onNewChat,
  onSelectConversation,
  onTrackEvent,
  onUpdateConversations,
  onUpdateMessages,
  onUpdateSession,
  recruiterMode,
  sessionId,
  setError,
}) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [followUps, setFollowUps] = useState(SUGGESTED_PROMPTS);
  const [historyOpen, setHistoryOpen] = useState(true);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return undefined;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setDraft(transcript);
      setListening(false);
      if (transcript.trim()) {
        void submitMessage(transcript);
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone permission was blocked. Please allow mic access and try again.");
        return;
      }
      setError("Voice input could not start in this browser. Try Chrome or Edge.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [loading, name, sessionId, setError]);

  const triggerSpeechInput = () => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported here. Use Chrome or Edge on localhost/HTTPS.");
      return;
    }
    if (listening || loading) return;

    setError("");
    setListening(true);
    recognitionRef.current.start();
  };

  const submitMessage = async (text) => {
    if (!text.trim() || !name || !sessionId || loading) return;

    const optimisticUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: { text },
    };

    onUpdateMessages((current) => [...current, optimisticUserMessage]);
    setDraft("");
    setLoading(true);
    setError("");

    try {
      const [response] = await Promise.all([
        sendMessage(sessionId, text, name),
        new Promise((resolve) => window.setTimeout(resolve, 850)),
      ]);
      const nextSessionId = String(response.data.session_id || response.data.conversation_id);
      onUpdateSession(nextSessionId);

      const historyResponse = await getHistory(nextSessionId, name);
      onUpdateMessages(historyResponse.data.messages || []);
      onUpdateConversations((current) => {
        const nextConversation = current.filter(
          (conversation) => String(conversation.id) !== String(historyResponse.data.id)
        );
        return [historyResponse.data, ...nextConversation];
      });
      onAction(response.data.action);
      onFocusProject(response.data.focus_project || "");
      setFollowUps(response.data.follow_ups || SUGGESTED_PROMPTS);
      await onTrackEvent("button_click", { target: "chat_send" }, nextSessionId);

      if (speakReplies && "speechSynthesis" in window && response.data.reply) {
        const utterance = new SpeechSynthesisUtterance(response.data.reply);
        utterance.rate = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (chatError) {
      console.error("Failed to send message", chatError);
      onUpdateMessages((current) =>
        current.filter((message) => message.id !== optimisticUserMessage.id)
      );
      setError("The chatbot could not answer right now.");
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;
  const mergedSuggestions = hasMessages
    ? [...new Set([...followUps, ...SUGGESTED_PROMPTS])].slice(0, 2)
    : SUGGESTED_PROMPTS.slice(0, 2);

  return (
    <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">

        {/* ── Compact Header ── */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Portfolio Copilot
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-tight text-white">
                Ask anything about this candidate
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[10px] transition ${
                  speakReplies
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-400"
                }`}
                onClick={() => setSpeakReplies((c) => !c)}
                type="button"
                title={speakReplies ? "Voice replies on" : "Voice replies off"}
              >
                <Volume2 size={12} />
              </button>
              <button
                className={`inline-flex items-center justify-center rounded-full p-1.5 transition ${
                  historyOpen
                    ? "bg-white/10 text-cyan-300"
                    : "bg-white/5 text-slate-400 hover:text-cyan-300"
                }`}
                onClick={() => setHistoryOpen((o) => !o)}
                type="button"
                title={historyOpen ? "Hide history" : "Show history"}
              >
                {historyOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
              </button>
              <button
                className="rounded-xl bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                onClick={onNewChat}
                type="button"
              >
                New chat
              </button>
            </div>
          </div>
        </div>

        {/* ── Middle: Chat messages + Session history sidebar ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* Chat column */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {booting ? (
                <div className="flex h-full items-center justify-center">
                  <TypingIndicator />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">
                    The assistant is ready
                  </h3>
                  <p className="mt-1.5 max-w-[220px] text-xs leading-5 text-slate-400">
                    Ask for projects, skills, experience, or a quick summary.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          initial={{ opacity: 0, y: 10 }}
                          key={message.id}
                        >
                          <div
                            className={`max-w-[92%] rounded-2xl border px-3 py-2.5 ${
                              isUser
                                ? "border-cyan-400/30 bg-cyan-400 text-slate-950"
                                : "border-white/10 bg-slate-900/90 text-slate-100"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]">
                              {isUser ? <Sparkles size={11} /> : <Bot size={11} />}
                              {isUser ? name : "Assistant"}
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.content?.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 8 }}
                    >
                      <div className="rounded-2xl border border-white/10 bg-slate-900/90 px-3 py-2.5">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          <Bot size={11} />
                          Assistant
                        </div>
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>
          </div>

          {/* ── Session history sidebar (right, collapsible) ── */}
          <AnimatePresence initial={false}>
            {historyOpen && conversations.length > 0 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden border-l border-white/10"
              >
                <div className="h-full w-[150px] overflow-y-auto p-2">
                  <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                    <History size={10} />
                    History
                  </div>
                  <div className="space-y-1.5">
                    {conversations.map((conversation) => (
                      <button
                        className={`w-full rounded-xl border px-2.5 py-2 text-left transition ${
                          String(conversation.id) === String(sessionId)
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                        }`}
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation.id)}
                        type="button"
                      >
                        <div className="truncate text-[11px] font-semibold">
                          {conversation.title}
                        </div>
                        <div className="mt-0.5 truncate text-[9px] leading-4 text-slate-400">
                          {conversation.preview}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom: error + merged suggestions + input ── */}
        <div className="border-t border-white/10">
          {error && (
            <div className="mx-3 mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* Merged suggestion pills */}
          <div className="px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {mergedSuggestions.map((prompt) => (
                <button
                  className={`rounded-full px-2.5 py-1 text-[10px] transition ${
                    recruiterMode
                      ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-100"
                  }`}
                  key={prompt}
                  onClick={() => {
                    void onTrackEvent("button_click", { target: "suggested_prompt", prompt });
                    void submitMessage(prompt);
                  }}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Compact input */}
          <div className="border-t border-white/10 px-3 py-2">
            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submitMessage(draft);
              }}
            >
              <textarea
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm leading-5 text-white placeholder:text-slate-500 focus:border-cyan-400"
                disabled={loading}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage(draft);
                  }
                }}
                placeholder="Ask about this candidate..."
                value={draft}
              />
              <button
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                  listening
                    ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40"
                }`}
                onClick={triggerSpeechInput}
                type="button"
              >
                <Mic size={15} />
              </button>
              <button
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !draft.trim()}
                type="submit"
              >
                <SendHorizonal size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;
