import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function MetricCard({ label, value, caption }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {caption ? <div className="mt-2 text-sm text-slate-400">{caption}</div> : null}
    </div>
  );
}

function AdminConsole({
  activeTab,
  adminAnalytics,
  adminHistory,
  adminJourney,
  adminReplay,
  admins,
  adminSessions,
  contentDrafts,
  contentSaveStatus,
  loading,
  onAddAdmin,
  onChangeContent,
  onLoadHistory,
  onRemoveAdmin,
  onReplayChat,
  onSearch,
  onSearchInputChange,
  onSelectTab,
  onUpdateContent,
  replaying,
  role,
  searchQuery,
  searchResults,
}) {
  const isSuperAdmin = role === "super_admin";
  const roleOptions = ["user", "admin", "super_admin"];
  const [visibleRoles, setVisibleRoles] = useState(roleOptions);

  const effectiveVisibleRoles = isSuperAdmin ? visibleRoles : ["user", "admin"];
  const orderedContentEntries = useMemo(
    () =>
      Object.entries(contentDrafts).sort(([leftKey], [rightKey]) => {
        if (leftKey === "candidate snapshot") return -1;
        if (rightKey === "candidate snapshot") return 1;
        return leftKey.localeCompare(rightKey);
      }),
    [contentDrafts]
  );

  const filteredSessions = useMemo(
    () => adminSessions.filter((session) => effectiveVisibleRoles.includes(session.role)),
    [adminSessions, effectiveVisibleRoles]
  );
  const filteredSearchSessions = useMemo(
    () => searchResults.sessions.filter((session) => effectiveVisibleRoles.includes(session.role)),
    [searchResults.sessions, effectiveVisibleRoles]
  );
  const filteredSearchMessages = useMemo(
    () =>
      searchResults.messages.filter((entry) =>
        effectiveVisibleRoles.includes(entry.session_role)
      ),
    [searchResults.messages, effectiveVisibleRoles]
  );

  const toggleVisibleRole = (targetRole) => {
    setVisibleRoles((current) => {
      if (current.includes(targetRole)) {
        const next = current.filter((item) => item !== targetRole);
        return next.length ? next : [targetRole];
      }
      return [...current, targetRole];
    });
  };

  const renderRoleToggles = () => {
    if (!isSuperAdmin) {
      return (
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Showing user + admin sessions
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {roleOptions.map((roleOption) => (
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              effectiveVisibleRoles.includes(roleOption)
                ? "bg-amber-300 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300"
            }`}
            key={roleOption}
            onClick={() => toggleVisibleRole(roleOption)}
            type="button"
          >
            {roleOption}
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-amber-400/20 bg-amber-400/5 p-7"
      initial={{ opacity: 0, y: 16 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            Control Layer
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {isSuperAdmin ? "Super admin controls" : "Admin monitoring"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "sessions"
                ? "bg-amber-300 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-200"
            }`}
            onClick={() => onSelectTab("sessions")}
            type="button"
          >
            Admin Dashboard
          </button>
          {isSuperAdmin ? (
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === "admins"
                  ? "bg-amber-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-200"
              }`}
              onClick={() => onSelectTab("admins")}
              type="button"
            >
              Manage Admins
            </button>
          ) : null}
          {isSuperAdmin ? (
            <button
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === "content"
                  ? "bg-amber-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-200"
              }`}
              onClick={() => onSelectTab("content")}
              type="button"
            >
              Edit Content
            </button>
          ) : null}
        </div>
      </div>

      {activeTab === "sessions" ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Visible Sessions" value={adminAnalytics.total_users || 0} />
            <MetricCard label="Active 24h" value={adminAnalytics.active_last_24h || 0} />
            <MetricCard
              label="Avg Messages"
              value={adminAnalytics.avg_messages_per_user || 0}
            />
            <MetricCard
              label="Top Query"
              value={adminAnalytics.most_common_queries?.[0]?.message || "No data"}
              caption={
                adminAnalytics.most_common_queries?.[0]
                  ? `${adminAnalytics.most_common_queries[0].total} times`
                  : "Waiting for enough traffic"
              }
            />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Smart Search
              </div>
              {renderRoleToggles()}
            </div>
            <form className="flex gap-3" onSubmit={onSearch}>
              <input
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="Search user names or chat messages"
                value={searchQuery}
              />
              <button
                className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950"
                disabled={loading}
                type="submit"
              >
                Search
              </button>
            </form>
            {filteredSearchSessions.length > 0 || filteredSearchMessages.length > 0 ? (
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  {filteredSearchSessions.map((session) => (
                    <button
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                      key={session.id}
                      onClick={() => onLoadHistory(session.id)}
                      type="button"
                    >
                      <div className="font-semibold text-white">{session.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {session.role}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Tags: {(session.tags || []).join(", ") || "No tags"}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredSearchMessages.map((entry) => (
                    <button
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                      key={entry.id}
                      onClick={() => onLoadHistory(entry.session_id)}
                      type="button"
                    >
                      <div className="font-semibold text-white">{entry.session_name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {entry.session_role}
                      </div>
                      <div className="mt-1 text-sm text-slate-300">{entry.message}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Visitor sessions
                </div>
                {renderRoleToggles()}
              </div>
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <button
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-amber-300/40"
                    key={session.id}
                    onClick={() => onLoadHistory(session.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{session.name}</div>
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          {session.role}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(session.tags || []).map((tag) => (
                            <span
                              className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] text-amber-100"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <div>{session.conversation_count} chats</div>
                        <div>{session.message_count} messages</div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredSessions.length === 0 ? (
                  <p className="text-sm text-slate-400">No sessions in the selected role view.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Chat replay
                  </div>
                  <button
                    className="rounded-2xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950"
                    disabled={replaying || !(adminHistory?.chat_messages || []).length}
                    onClick={onReplayChat}
                    type="button"
                  >
                    {replaying ? "Replaying..." : "Replay chat"}
                  </button>
                </div>
                {adminHistory ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-lg font-semibold text-white">{adminHistory.name}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {adminHistory.role} • {adminHistory.conversation_count} chats • {adminHistory.message_count} messages
                      </div>
                    </div>
                    <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                      {(adminReplay.length ? adminReplay : adminHistory.chat_messages || []).map(
                        (entry) => (
                          <div
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                            key={entry.id}
                          >
                            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-cyan-100">
                              {entry.message}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">
                              {entry.response}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Select a session to inspect activity.</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  User Journey
                </div>
                {adminJourney.length ? (
                  <div className="space-y-3">
                    {adminJourney.map((event) => (
                      <div
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        key={event.id}
                      >
                        <div className="text-xs uppercase tracking-[0.25em] text-amber-200">
                          {event.event_type}
                        </div>
                        <div className="mt-1 text-sm text-slate-300">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No journey events loaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isSuperAdmin && activeTab === "admins" ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5"
            onSubmit={onAddAdmin}
          >
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Add admin
            </div>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                name="name"
                placeholder="Admin name"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                name="password"
                placeholder="Password"
                type="password"
              />
              <button
                className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950"
                disabled={loading}
                type="submit"
              >
                {loading ? "Saving..." : "Create Admin"}
              </button>
            </div>
          </form>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Admin users
            </div>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  key={admin.id}
                >
                  <div>
                    <div className="font-semibold text-white">{admin.name}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {admin.role}
                    </div>
                  </div>
                  {admin.role !== "super_admin" ? (
                    <button
                      className="rounded-xl border border-rose-400/30 px-3 py-2 text-sm text-rose-200"
                      onClick={() => onRemoveAdmin(admin.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isSuperAdmin && activeTab === "content" ? (
        <div className="mt-6 grid gap-4">
          {contentSaveStatus?.message ? (
            <div
              className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
                contentSaveStatus.type === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                  : "border-rose-400/30 bg-rose-400/10 text-rose-100"
              }`}
            >
              {contentSaveStatus.message}
            </div>
          ) : null}
          {orderedContentEntries.map(([key, value]) => (
            <div
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5"
              key={key}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                {key}
              </div>
              <textarea
                className="mt-4 min-h-[180px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white"
                onChange={(event) => onChangeContent(key, event.target.value)}
                value={value}
              />
              <button
                className="mt-4 rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-slate-950"
                disabled={loading}
                onClick={() => onUpdateContent(key)}
                type="button"
              >
                {loading ? "Saving..." : "Save Content"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </motion.section>
  );
}

export default AdminConsole;
