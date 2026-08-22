import { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  History,
  MailPlus,
  Mic,
  PanelLeftClose,
  PanelLeft,
  SendHorizonal,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { getHistory, sendMessage } from "../services/api";

const SUGGESTED_PROMPTS = [
  "Why hire Harshith?",
  "What is your highest-impact project?",
  "Tell me about your LeetCode achievements",
];

const ASSISTANT_NAME = "Harshith";
const ROLE_FIT_PROMPTS = {
  backend: [
    "How do you design scalable APIs?",
    "Tell me about your database & caching decisions",
    "How do you optimize backend performance?",
  ],
  full_stack: [
    "How do you work end-to-end?",
    "Show your best full-stack architecture",
    "How do you connect frontend UI with distributed APIs?",
  ],
  ai: [
    "Explain your HyDE RAG architecture",
    "Tell me about your real-time computer vision system",
    "How do you reduce hallucinations in AI responses?",
  ],
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-2">
      {[0, 1, 2].map((dot) => (
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          className="h-2 w-2 rounded-full bg-cyan-400"
          key={dot}
          transition={{ duration: 0.8, delay: dot * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function ChatbotPanel({
  booting,
  conversations,
  error,
  isOpen,
  messages,
  name,
  onAction,
  onClose,
  onFollowUpSubmit,
  onFocusProject,
  onNewChat,
  onSelectConversation,
  onTrackEvent,
  onUpdateConversations,
  onUpdateMessages,
  onUpdateSession,
  roleFit,
  recruiterMode,
  sessionId,
  setError,
}) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const [speechOutputSupported, setSpeechOutputSupported] = useState(false);
  const [followUps, setFollowUps] = useState(SUGGESTED_PROMPTS);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [openEvidenceIds, setOpenEvidenceIds] = useState([]);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpState, setFollowUpState] = useState({
    recruiter_name: name || "",
    email: "",
    company: "",
    role_interest: roleFit || "full_stack",
    notes: "",
  });
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setFollowUpState((current) => ({
      ...current,
      recruiter_name: current.recruiter_name || name || "",
      role_interest: roleFit || current.role_interest,
    }));
  }, [name, roleFit]);

  useEffect(() => {
    const canRecognize =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

    setVoiceInputSupported(canRecognize);
    setSpeechOutputSupported(canSpeak);

    if (canSpeak) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    if (!canRecognize) {
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
      if (event.error === "no-speech") {
        setError("No speech was detected. Try speaking a little closer to the mic.");
        return;
      }
      setError("Voice input could not start in this browser. Try Chrome or Edge.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loading, name, sessionId, setError]);

  const speakText = (text) => {
    if (!text || !speechOutputSupported || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice =
      voicesRef.current.find((voice) => /en/i.test(voice.lang) && voice.default) ||
      voicesRef.current.find((voice) => /en/i.test(voice.lang)) ||
      null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const triggerSpeechInput = async () => {
    if (!voiceInputSupported || !recognitionRef.current) {
      setError("Voice input is not supported here. Use Chrome or Edge on localhost/HTTPS.");
      return;
    }
    if (listening || loading) return;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      setError("");
      setListening(true);
      recognitionRef.current.start();
    } catch (microphoneError) {
      setListening(false);
      setError("Microphone access was denied or unavailable. Please allow mic access and try again.");
    }
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
        sendMessage(sessionId, text, name, roleFit),
        new Promise((resolve) => window.setTimeout(resolve, 600)),
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

      if (speakReplies && response.data.reply) {
        window.setTimeout(() => {
          speakText(response.data.reply);
        }, 120);
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
  const roleSuggestions = useMemo(
    () => ROLE_FIT_PROMPTS[roleFit] || ROLE_FIT_PROMPTS.full_stack,
    [roleFit]
  );
  const mergedSuggestions = hasMessages
    ? [...new Set([...followUps, ...roleSuggestions])].slice(0, 3)
    : roleSuggestions.slice(0, 3);

  const toggleEvidence = (messageId) => {
    setOpenEvidenceIds((current) =>
      current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : [...current, messageId]
    );
  };

  const handleFollowUpChange = (field, value) => {
    setFollowUpMessage("");
    setFollowUpState((current) => ({ ...current, [field]: value }));
  };

  const handleFollowUpSubmit = async (event) => {
    event.preventDefault();
    if (!followUpState.recruiter_name.trim() || !followUpState.email.trim()) {
      setFollowUpMessage("Name and email are required.");
      return;
    }

    try {
      setFollowUpSubmitting(true);
      await onFollowUpSubmit({
        ...followUpState,
        role_interest: followUpState.role_interest || roleFit,
      });
      setFollowUpMessage("Follow-up request sent successfully.");
      setFollowUpOpen(false);
    } catch (submitError) {
      console.error("Failed to submit recruiter follow-up", submitError);
      setFollowUpMessage("Could not send the follow-up request right now.");
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex h-[min(820px,calc(100svh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c0c11] shadow-2xl"
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#0e0e14]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 text-white">
                  <Sparkles size={16} className="text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white leading-none">
                      Harshith's Copilot
                    </h2>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live AI
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8c8c94]">
                    Ask about projects, system architecture, DSA rank & experience
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice toggle */}
                {speechOutputSupported && (
                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                      speakReplies
                        ? "border-cyan-400/40 bg-cyan-400/20 text-cyan-200"
                        : "border-white/10 bg-white/[0.04] text-[#8e8e96] hover:text-white"
                    }`}
                    onClick={() => {
                      setSpeakReplies((curr) => {
                        const next = !curr;
                        if (next) speakText("Voice playback enabled.");
                        else window.speechSynthesis.cancel();
                        return next;
                      });
                    }}
                    type="button"
                    title={speakReplies ? "Mute voice replies" : "Enable voice replies"}
                  >
                    {speakReplies ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                )}

                {/* History toggle */}
                <button
                  className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition ${
                    historyOpen
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.04] text-[#8e8e96] hover:text-white"
                  }`}
                  onClick={() => setHistoryOpen((o) => !o)}
                  type="button"
                  title="Toggle conversation history"
                >
                  <History size={14} />
                  <span className="hidden sm:inline">History</span>
                </button>

                {/* New chat */}
                <button
                  className="rounded-lg bg-white/[0.08] border border-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                  onClick={onNewChat}
                  type="button"
                >
                  + New Chat
                </button>

                {/* Close */}
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#9e9ea6] transition hover:bg-white hover:text-black ml-1"
                  onClick={onClose}
                  type="button"
                  aria-label="Close Assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Middle: Messages + Sidebar ── */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              
              {/* Chat Messages Column */}
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0a0a0e]">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                  {booting ? (
                    <div className="flex h-full items-center justify-center">
                      <TypingIndicator />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center px-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-cyan-400">
                        <Sparkles size={28} />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-white">
                        Ask about Harshith's Experience & Code
                      </h3>
                      <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#8c8c94]">
                        I answer in first-person with verified facts grounded in this portfolio, including architecture choices, DSA ranking, and project outcomes.
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {mergedSuggestions.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => {
                              void onTrackEvent("button_click", { target: "suggested_prompt", prompt });
                              void submitMessage(prompt);
                            }}
                            type="button"
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-[#c4c4cc] transition hover:border-white/30 hover:text-white"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {messages.map((message) => {
                          const isUser = message.role === "user";
                          const evidence = message.content?.evidence || [];
                          const evidenceOpen = openEvidenceIds.includes(message.id);

                          return (
                            <motion.div
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                              initial={{ opacity: 0, y: 8 }}
                              key={message.id}
                            >
                              <div
                                className={`max-w-[88%] rounded-2xl p-4 ${
                                  isUser
                                    ? "bg-white text-black font-medium text-sm shadow-md"
                                    : "border border-white/[0.08] bg-[#121218] text-[#e2e2e8] text-sm leading-relaxed"
                                }`}
                              >
                                <div className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${
                                  isUser ? "text-neutral-600" : "text-[#71717a]"
                                }`}>
                                  {isUser ? <User size={11} /> : <Bot size={11} className="text-cyan-400" />}
                                  <span>{isUser ? (name || "You") : "Harshith (AI)"}</span>
                                </div>

                                <div className="whitespace-pre-wrap leading-relaxed">
                                  {message.content?.text}
                                </div>

                                {!isUser && evidence.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                                    <button
                                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition"
                                      onClick={() => toggleEvidence(message.id)}
                                      type="button"
                                    >
                                      <BookOpen size={12} />
                                      <span>{evidenceOpen ? "Hide Portfolio Citations" : `View Evidence (${evidence.length})`}</span>
                                      {evidenceOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>

                                    {evidenceOpen && (
                                      <div className="mt-2 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3 text-xs">
                                        {evidence.map((source, i) => (
                                          <div key={i} className="space-y-0.5">
                                            <span className="font-mono text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">
                                              {source.label}
                                            </span>
                                            <p className="text-[#a0a0a8] text-[11px] leading-relaxed">
                                              {source.snippet}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
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
                          <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-3">
                            <div className="mb-1 flex items-center gap-1 text-[10px] font-mono text-[#71717a] uppercase">
                              <Bot size={11} className="text-cyan-400" />
                              <span>Harshith is thinking...</span>
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

              {/* Session History Sidebar */}
              <AnimatePresence initial={false}>
                {historyOpen && (
                  <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="shrink-0 overflow-hidden border-l border-white/[0.08] bg-[#09090d]"
                  >
                    <div className="h-full w-[220px] overflow-y-auto p-3">
                      <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#71717a] uppercase tracking-wider">
                        <span>Past Sessions</span>
                        <span>{conversations.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {conversations.map((conv) => {
                          const isActive = String(conv.id) === String(sessionId);
                          return (
                            <button
                              key={conv.id}
                              onClick={() => onSelectConversation(conv.id)}
                              type="button"
                              className={`w-full rounded-xl p-2.5 text-left transition text-xs ${
                                isActive
                                  ? "border border-white/30 bg-white/10 text-white"
                                  : "border border-white/[0.04] bg-white/[0.02] text-[#8c8c94] hover:bg-white/[0.05] hover:text-white"
                              }`}
                            >
                              <div className="truncate font-medium">{conv.title || "New chat"}</div>
                              <div className="truncate text-[10px] text-[#63636b] mt-0.5">{conv.preview}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

            </div>

            {/* ── Bottom Section: Suggestion Chips, Recruiter Drawer, Input Bar ── */}
            <div className="border-t border-white/[0.08] bg-[#0c0c11] p-4">
              
              {error && (
                <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {/* Suggestions */}
              {messages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {mergedSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        void onTrackEvent("button_click", { target: "suggested_prompt", prompt });
                        void submitMessage(prompt);
                      }}
                      type="button"
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-[#a0a0a8] transition hover:border-white/20 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Recruiter Follow Up Section */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-[#8c8c94]">
                  <span>Want Harshith to follow up directly?</span>
                  <button
                    onClick={() => setFollowUpOpen((o) => !o)}
                    type="button"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition font-medium"
                  >
                    <MailPlus size={13} />
                    <span>{followUpOpen ? "Hide Form" : "Request Interview Connect"}</span>
                  </button>
                </div>

                {followUpOpen && (
                  <form onSubmit={handleFollowUpSubmit} className="mt-3 grid gap-2.5 rounded-2xl border border-white/[0.08] bg-[#121218] p-3.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-[#63636b] focus:border-white/30"
                        placeholder="Your Name"
                        value={followUpState.recruiter_name}
                        onChange={(e) => handleFollowUpChange("recruiter_name", e.target.value)}
                      />
                      <input
                        type="email"
                        className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-[#63636b] focus:border-white/30"
                        placeholder="Work Email"
                        value={followUpState.email}
                        onChange={(e) => handleFollowUpChange("email", e.target.value)}
                      />
                    </div>
                    <input
                      className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-[#63636b] focus:border-white/30"
                      placeholder="Company (optional)"
                      value={followUpState.company}
                      onChange={(e) => handleFollowUpChange("company", e.target.value)}
                    />
                    <textarea
                      rows={2}
                      className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white placeholder:text-[#63636b] focus:border-white/30 resize-none"
                      placeholder="Role details or questions..."
                      value={followUpState.notes}
                      onChange={(e) => handleFollowUpChange("notes", e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={followUpSubmitting}
                      className="rounded-lg bg-white py-2 text-xs font-semibold text-black transition hover:bg-[#e4e4e7] disabled:opacity-50"
                    >
                      {followUpSubmitting ? "Sending..." : "Submit Follow-Up Request"}
                    </button>
                  </form>
                )}
              </div>

              {/* Input bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitMessage(draft);
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-[#121218] p-1.5 pl-4 focus-within:border-white/40 transition"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask a technical or hiring question about Harshith..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#63636b] outline-none"
                  disabled={loading}
                />

                {voiceInputSupported && (
                  <button
                    type="button"
                    onClick={triggerSpeechInput}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      listening
                        ? "bg-cyan-500/20 text-cyan-300 animate-pulse border border-cyan-400/40"
                        : "text-[#8c8c94] hover:text-white hover:bg-white/[0.06]"
                    }`}
                    title={listening ? "Listening..." : "Click to speak"}
                  >
                    <Mic size={16} />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || !draft.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition hover:bg-[#e4e4e7] disabled:opacity-40 disabled:hover:bg-white"
                  title="Send message"
                >
                  <SendHorizonal size={16} />
                </button>
              </form>

            </div>

          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ChatbotPanel;
