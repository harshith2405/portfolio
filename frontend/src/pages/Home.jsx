import { useEffect, useRef, useState } from "react";

import ChatbotPanel from "../components/ChatbotPanel";
import Dashboard from "../components/Dashboard";
import {
  addAdmin,
  createConversation,
  getAdminAnalytics,
  getAdminHistory,
  getAdminSessions,
  getAdmins,
  getAIConfig,
  getHeatmap,
  getHistory,
  getMetrics,
  getPortfolio,
  getSystemHealth,
  getUserJourney,
  removeAdmin,
  searchAdminData,
  setAuthSession,
  startSession,
  trackEvent,
  updateAIConfig,
  updateContent,
} from "../services/api";

const LOCATION_KEY = "portfolio_mock_location";
const ACTIVE_TABS_KEY = "portfolio_active_tabs";
const MOCK_LOCATIONS = ["Hyderabad", "Bengaluru", "Pune", "Chennai", "Mumbai"];
const PRESENCE_TTL_MS = 20000;

function Home() {
  const [visitorName, setVisitorName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [password, setPassword] = useState("");
  const [requirePassword, setRequirePassword] = useState(false);
  const [showNameModal, setShowNameModal] = useState(true);
  const [authSessionId, setAuthSessionId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [role, setRole] = useState("user");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [portfolio, setPortfolio] = useState({ content: "", sections: {}, editable_content: [] });
  const [contentDrafts, setContentDrafts] = useState({});
  const [activeSection, setActiveSection] = useState("");
  const [focusedProject, setFocusedProject] = useState("");
  const [presence, setPresence] = useState({ active_users: 0, latest_location: "" });
  const [metrics, setMetrics] = useState({
    total_visitors: 0,
    messages_sent: 0,
    most_viewed_project: "No data yet",
  });
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [booting, setBooting] = useState(false);
  const [loadingAdminTools, setLoadingAdminTools] = useState(false);
  const [adminConsoleTab, setAdminConsoleTab] = useState("sessions");
  const [adminAnalytics, setAdminAnalytics] = useState({
    total_users: 0,
    active_last_24h: 0,
    avg_messages_per_user: 0,
    most_common_queries: [],
  });
  const [adminSessions, setAdminSessions] = useState([]);
  const [adminHistory, setAdminHistory] = useState(null);
  const [adminJourney, setAdminJourney] = useState([]);
  const [adminReplay, setAdminReplay] = useState([]);
  const [replayingAdminChat, setReplayingAdminChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ sessions: [], messages: [] });
  const [adminUsers, setAdminUsers] = useState([]);
  const [error, setError] = useState("");
  const [aiConfig, setAIConfig] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [viewerLocation] = useState(() => {
    const saved = window.localStorage.getItem(LOCATION_KEY);
    if (saved) return saved;
    const next = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    window.localStorage.setItem(LOCATION_KEY, next);
    return next;
  });

  const tabIdRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  const socketPresenceRef = useRef({ active_users: 0, latest_location: "" });
  const replayTimeoutsRef = useRef([]);
  const projectsRef = useRef(null);
  const skillsRef = useRef(null);

  const buildContentDrafts = (payload) => {
    const nextDrafts = {};
    const sections = payload.sections || {};

    Object.entries(sections).forEach(([key, value]) => {
      nextDrafts[key] = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    });

    (payload.editable_content || []).forEach((entry) => {
      nextDrafts[entry.key] =
        typeof entry.value === "string"
          ? entry.value
          : JSON.stringify(entry.value, null, 2);
    });

    return nextDrafts;
  };

  const readActiveTabs = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(ACTIVE_TABS_KEY) || "{}");
      const now = Date.now();
      const freshEntries = Object.entries(parsed).filter(
        ([, value]) => now - (value?.updated_at || 0) < PRESENCE_TTL_MS
      );
      return Object.fromEntries(freshEntries);
    } catch (storageError) {
      console.error("Failed to read active tabs", storageError);
      return {};
    }
  };

  const loadPortfolio = async () => {
    const response = await getPortfolio();
    setPortfolio(response.data);
    setContentDrafts(buildContentDrafts(response.data));
  };

  const refreshMetrics = async () => {
    const response = await getMetrics();
    setMetrics(response.data);
    socketPresenceRef.current = {
      active_users: response.data.active_users || 0,
      latest_location: response.data.latest_viewer_location || "",
    };
    setPresence((current) => ({
      active_users:
        typeof response.data.active_users === "number"
          ? response.data.active_users
          : current.active_users,
      latest_location: response.data.latest_viewer_location || current.latest_location || "",
    }));
  };

  const loadAdminData = async (nextRole = role) => {
    if (nextRole !== "admin" && nextRole !== "super_admin") return;

    setLoadingAdminTools(true);
    try {
      const [analyticsResponse, sessionsResponse] = await Promise.all([
        getAdminAnalytics(),
        getAdminSessions(),
      ]);
      setAdminAnalytics(analyticsResponse.data);
      setAdminSessions(sessionsResponse.data);

      if (nextRole === "super_admin") {
        const [adminsResponse, configResponse, heatmapResponse, healthResponse] =
          await Promise.all([
            getAdmins(),
            getAIConfig(),
            getHeatmap(),
            getSystemHealth(),
          ]);
        setAdminUsers(adminsResponse.data);
        setAIConfig(configResponse.data);
        setHeatmapData(heatmapResponse.data);
        setSystemHealth(healthResponse.data);
      } else {
        setAdminUsers([]);
      }
    } catch (adminError) {
      console.error("Failed to load admin data", adminError);
      setError("Unable to load admin tools right now.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  const handleRefreshHeatmap = async () => {
    try {
      const response = await getHeatmap();
      setHeatmapData(response.data);
    } catch (err) {
      console.error("Failed to refresh heatmap", err);
    }
  };

  const handleRefreshHealth = async () => {
    try {
      const response = await getSystemHealth();
      setSystemHealth(response.data);
    } catch (err) {
      console.error("Failed to refresh health", err);
    }
  };

  const handleUpdateAIConfig = async (payload) => {
    try {
      const response = await updateAIConfig(payload);
      setAIConfig(response.data);
    } catch (err) {
      console.error("Failed to update AI config", err);
      setError("Failed to update AI configuration.");
    }
  };

  useEffect(() => {
    void loadPortfolio().catch((portfolioError) => {
      console.error("Failed to load portfolio context", portfolioError);
    });
    void refreshMetrics().catch((metricsError) => {
      console.error("Failed to load metrics", metricsError);
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshMetrics().catch((metricsError) => {
        console.error("Failed to refresh metrics", metricsError);
      });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setAuthSession(authSessionId);
  }, [authSessionId]);

  useEffect(() => {
    if (role === "admin" || role === "super_admin") {
      void loadAdminData(role);
    }
  }, [role]);

  useEffect(
    () => () => {
      replayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      replayTimeoutsRef.current = [];
    },
    []
  );

  useEffect(() => {
    if (!visitorName) return undefined;

    const syncPresenceFromTabs = () => {
      const activeTabs = readActiveTabs();
      const entries = Object.values(activeTabs);
      const latestEntry = entries
        .slice()
        .sort((left, right) => (right.updated_at || 0) - (left.updated_at || 0))[0];

      setPresence({
        active_users: Math.max(socketPresenceRef.current.active_users || 0, entries.length),
        latest_location:
          socketPresenceRef.current.latest_location || latestEntry?.location || viewerLocation,
      });
    };

    const writeHeartbeat = () => {
      const nextTabs = readActiveTabs();
      nextTabs[tabIdRef.current] = {
        name: visitorName,
        location: viewerLocation,
        updated_at: Date.now(),
      };
      window.localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(nextTabs));
      syncPresenceFromTabs();
    };

    const clearHeartbeat = () => {
      const nextTabs = readActiveTabs();
      delete nextTabs[tabIdRef.current];
      window.localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(nextTabs));
    };

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "127.0.0.1:8000"
        : `${window.location.hostname}:8000`;
    const socket = new WebSocket(
      `${protocol}://${backendHost}/ws/presence/?name=${encodeURIComponent(visitorName)}&location=${encodeURIComponent(viewerLocation)}`
    );

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        socketPresenceRef.current = {
          active_users: payload.active_users || 0,
          latest_location: payload.latest_location || viewerLocation,
        };
        syncPresenceFromTabs();
      } catch (presenceError) {
        console.error("Failed to parse presence payload", presenceError);
      }
    };

    socket.onerror = () => {
      console.error("Presence websocket failed; relying on metrics polling.");
    };

    writeHeartbeat();
    const heartbeatId = window.setInterval(writeHeartbeat, 5000);
    window.addEventListener("storage", syncPresenceFromTabs);
    window.addEventListener("beforeunload", clearHeartbeat);
    window.addEventListener("pagehide", clearHeartbeat);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener("storage", syncPresenceFromTabs);
      window.removeEventListener("beforeunload", clearHeartbeat);
      window.removeEventListener("pagehide", clearHeartbeat);
      clearHeartbeat();
      socket.close();
    };
  }, [viewerLocation, visitorName]);

  useEffect(() => {
    if (!visitorName) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.getAttribute("data-section");
            if (sectionName) {
              void sendAnalytics("section_view", { section: sectionName });
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    if (projectsRef.current) observer.observe(projectsRef.current);
    if (skillsRef.current) observer.observe(skillsRef.current);

    return () => observer.disconnect();
  }, [sessionId, visitorName]);

  const sendAnalytics = async (eventType, metadata = {}, conversationId = sessionId) => {
    if (!visitorName) return;

    try {
      await trackEvent({
        visitor_name: visitorName,
        event_type: eventType,
        conversation_id: conversationId || null,
        metadata,
      });
      await refreshMetrics();
    } catch (analyticsError) {
      console.error("Failed to track analytics event", analyticsError);
    }
  };

  const handleAction = (action) => {
    if (!action) return;

    const targetMap = {
      scroll_projects: projectsRef,
      scroll_skills: skillsRef,
    };

    const sectionMap = {
      scroll_projects: "projects",
      scroll_skills: "skills",
    };

    const targetRef = targetMap[action];
    const nextSection = sectionMap[action];

    if (targetRef?.current && nextSection) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(nextSection);
      void sendAnalytics("section_view", { section: nextSection });
      window.clearTimeout(handleAction.timeoutId);
      handleAction.timeoutId = window.setTimeout(() => setActiveSection(""), 1800);
    }
  };

  const bootstrapSession = async (name, nextPassword = "") => {
    setBooting(true);
    setError("");

    try {
      const response = await startSession(name, viewerLocation, nextPassword);

      if (response.data.require_password) {
        setRequirePassword(true);
        setBooting(false);
        return;
      }

      const nextConversationId = String(response.data.session_id);
      const nextRole = response.data.role || "user";
      const nextAuthSessionId = String(response.data.auth_session_id);

      setAuthSessionId(nextAuthSessionId);
      setRole(nextRole);
      setVisitorName(name);
      setSessionId(nextConversationId);
      setMessages(response.data.history || []);
      setConversations(response.data.conversations || []);
      setFocusedProject("");
      setShowNameModal(false);
      setRequirePassword(false);
      setPassword("");
      await refreshMetrics();
      await loadAdminData(nextRole);
    } finally {
      setBooting(false);
    }
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    const normalizedName = draftName.trim();

    if (!normalizedName) {
      setError("Please enter your name to begin.");
      return;
    }

    try {
      await bootstrapSession(normalizedName, password);
    } catch (sessionError) {
      console.error("Failed to start session", sessionError);
      setError(
        requirePassword
          ? "Unable to log in with that password."
          : "Unable to start your session right now."
      );
    }
  };

  const handleNewChat = async () => {
    if (!visitorName) return;

    try {
      const response = await createConversation(visitorName);
      const nextConversationId = String(response.data.id);
      setSessionId(nextConversationId);
      setMessages([]);
      setConversations((current) => [response.data, ...current]);
      setFocusedProject("");
      void sendAnalytics("button_click", { target: "new_chat" }, nextConversationId);
    } catch (newChatError) {
      console.error("Failed to create conversation", newChatError);
      setError("Unable to create a new chat.");
    }
  };

  const handleSelectConversation = async (conversationId) => {
    if (!visitorName) return;

    try {
      const response = await getHistory(conversationId, visitorName);
      setSessionId(String(response.data.id));
      setMessages(response.data.messages || []);
      setFocusedProject("");
    } catch (historyError) {
      console.error("Failed to load conversation", historyError);
      setError("Unable to load that chat history.");
    }
  };

  const handleVisitorReset = () => {
    replayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    replayTimeoutsRef.current = [];
    setAuthSessionId("");
    setVisitorName("");
    setDraftName("");
    setPassword("");
    setRequirePassword(false);
    setSessionId("");
    setRole("user");
    setMessages([]);
    setConversations([]);
    setFocusedProject("");
    setAdminSessions([]);
    setAdminUsers([]);
    setAdminHistory(null);
    setAdminJourney([]);
    setAdminReplay([]);
    setReplayingAdminChat(false);
    setAdminAnalytics({
      total_users: 0,
      active_last_24h: 0,
      avg_messages_per_user: 0,
      most_common_queries: [],
    });
    setSearchQuery("");
    setSearchResults({ sessions: [], messages: [] });
    setShowNameModal(true);
    setBooting(false);
    setError("");
  };

  const handleProjectFocus = (projectName) => {
    setFocusedProject(projectName);
    void sendAnalytics("project_focus", { project_name: projectName });
  };

  const handleRecruiterModeToggle = () => {
    const nextValue = !recruiterMode;
    setRecruiterMode(nextValue);
    void sendAnalytics("recruiter_mode_toggle", { enabled: nextValue });
  };

  const handleLoadAdminHistory = async (targetSessionId) => {
    try {
      setLoadingAdminTools(true);
      const [historyResponse, journeyResponse] = await Promise.all([
        getAdminHistory(targetSessionId),
        getUserJourney(targetSessionId),
      ]);
      replayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      replayTimeoutsRef.current = [];
      setReplayingAdminChat(false);
      setAdminReplay([]);
      setAdminHistory(historyResponse.data);
      setAdminJourney(journeyResponse.data.events || []);
    } catch (adminError) {
      console.error("Failed to load admin history", adminError);
      setError("Unable to load that session history.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  const handleSearchAdmin = async (event) => {
    event.preventDefault();
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      setSearchResults({ sessions: [], messages: [] });
      return;
    }

    try {
      setLoadingAdminTools(true);
      const response = await searchAdminData(normalizedQuery);
      setSearchResults({
        sessions: response.data.sessions || [],
        messages: response.data.messages || [],
      });
    } catch (searchError) {
      console.error("Failed to search admin data", searchError);
      setError("Unable to search sessions right now.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  const handleReplayChat = () => {
    const transcript = adminHistory?.chat_messages || [];
    if (!transcript.length) return;

    replayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    replayTimeoutsRef.current = [];
    setAdminReplay([]);
    setReplayingAdminChat(true);

    transcript.forEach((entry, index) => {
      const timeoutId = window.setTimeout(() => {
        setAdminReplay((current) => [...current, entry]);
        if (index === transcript.length - 1) {
          setReplayingAdminChat(false);
        }
      }, index * 900);
      replayTimeoutsRef.current.push(timeoutId);
    });
  };

  const handleAddAdmin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const nextPassword = String(formData.get("password") || "").trim();

    if (!name || !nextPassword) {
      setError("Admin name and password are required.");
      return;
    }

    try {
      setLoadingAdminTools(true);
      await addAdmin({ name, password: nextPassword });
      event.currentTarget.reset();
      const adminsResponse = await getAdmins();
      setAdminUsers(adminsResponse.data);
    } catch (adminError) {
      console.error("Failed to add admin", adminError);
      setError("Unable to add admin right now.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      setLoadingAdminTools(true);
      await removeAdmin(adminId);
      const adminsResponse = await getAdmins();
      setAdminUsers(adminsResponse.data);
    } catch (adminError) {
      console.error("Failed to remove admin", adminError);
      setError("Unable to remove that admin.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  const handleChangeContent = (key, value) => {
    setContentDrafts((current) => ({ ...current, [key]: value }));
  };

  const handleUpdateContent = async (key) => {
    try {
      setLoadingAdminTools(true);
      await updateContent({ key, value: contentDrafts[key] || "" });
      await loadPortfolio();
    } catch (contentError) {
      console.error("Failed to update content", contentError);
      setError("Unable to update content right now.");
    } finally {
      setLoadingAdminTools(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <div className="lg:w-[70%]">
          <Dashboard
            activeSection={activeSection}
            adminConsoleTab={adminConsoleTab}
            adminAnalytics={adminAnalytics}
            adminHistory={adminHistory}
            adminJourney={adminJourney}
            adminReplay={adminReplay}
            adminSessions={adminSessions}
            adminUsers={adminUsers}
            aiConfig={aiConfig}
            contentDrafts={contentDrafts}
            focusedProject={focusedProject}
            heatmapData={heatmapData}
            loadingAdminTools={loadingAdminTools}
            metrics={metrics}
            onAddAdmin={handleAddAdmin}
            onChangeContent={handleChangeContent}
            onLoadAdminHistory={handleLoadAdminHistory}
            onProjectClick={handleProjectFocus}
            onRefreshHeatmap={handleRefreshHeatmap}
            onRefreshHealth={handleRefreshHealth}
            onReplayChat={handleReplayChat}
            onRemoveAdmin={handleRemoveAdmin}
            onResetVisitor={handleVisitorReset}
            onSearchAdmin={handleSearchAdmin}
            onSearchInputChange={setSearchQuery}
            onSelectAdminTab={setAdminConsoleTab}
            onToggleRecruiterMode={handleRecruiterModeToggle}
            onUpdateAIConfig={handleUpdateAIConfig}
            onUpdateContent={handleUpdateContent}
            portfolio={portfolio}
            presence={presence}
            projectsRef={projectsRef}
            recruiterMode={recruiterMode}
            replayingAdminChat={replayingAdminChat}
            role={role}
            searchQuery={searchQuery}
            searchResults={searchResults}
            skillsRef={skillsRef}
            systemHealth={systemHealth}
            visitorName={visitorName}
          />
        </div>

        <div className="lg:w-[30%]">
          <ChatbotPanel
            booting={booting}
            conversations={conversations}
            error={error}
            messages={messages}
            name={visitorName}
            onAction={handleAction}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onFocusProject={setFocusedProject}
            onUpdateConversations={setConversations}
            onUpdateMessages={setMessages}
            onUpdateSession={setSessionId}
            onTrackEvent={sendAnalytics}
            recruiterMode={recruiterMode}
            sessionId={sessionId}
            setError={setError}
          />
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-cyan-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Portfolio Access
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Enter your name to start
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Recruiters continue normally. Registered admins are asked for a password.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleNameSubmit}>
              <input
                autoFocus
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400"
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Enter your name"
                value={draftName}
              />
              {requirePassword && (
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  type="password"
                  value={password}
                />
              )}
              {error && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
              <button
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                disabled={booting}
                type="submit"
              >
                {booting ? "Starting..." : requirePassword ? "Log In" : "Continue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
