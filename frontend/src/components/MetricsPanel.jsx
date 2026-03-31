import { motion } from "framer-motion";
import { Activity, BarChart3, Eye, MessageSquareText } from "lucide-react";

const ICONS = {
  total_visitors: Eye,
  messages_sent: MessageSquareText,
  most_viewed_project: BarChart3,
  active_users: Activity,
};

function MetricCard({ label, metricKey, value }) {
  const Icon = ICONS[metricKey] || Activity;

  return (
    <motion.div
      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</span>
        <Icon className="text-cyan-300" size={18} />
      </div>
      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
    </motion.div>
  );
}

function MetricsPanel({ metrics, presence }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-7"
      initial={{ opacity: 0, y: 18 }}
      transition={{ delay: 0.04, duration: 0.45 }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Live Metrics
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Product-style signals recruiters can see in real time
          </h2>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
          {presence.active_users} users currently viewing
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Visitors" metricKey="total_visitors" value={metrics.total_visitors} />
        <MetricCard label="Messages Sent" metricKey="messages_sent" value={metrics.messages_sent} />
        <MetricCard label="Most Viewed Project" metricKey="most_viewed_project" value={metrics.most_viewed_project} />
        <MetricCard label="Active Users" metricKey="active_users" value={presence.active_users} />
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-5 py-4 text-sm text-slate-300">
        {presence.latest_location
          ? `Someone from ${presence.latest_location} is viewing right now.`
          : "Waiting for live visitors to connect."}
      </div>
    </motion.section>
  );
}

export default MetricsPanel;
