import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  Gauge,
  Loader2,
  MessageSquare,
  Save,
  Server,
  Shield,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "ai", label: "AI Controls", icon: Brain },
  { id: "heatmap", label: "Usage Heatmap", icon: BarChart3 },
  { id: "health", label: "System Health", icon: Activity },
];

function BarChart({ data, labelKey, valueKey, color = "bg-cyan-400" }) {
  const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-xs text-slate-300">
            {item[labelKey]}
          </div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-white/5">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-lg ${color}`}
              initial={{ width: 0 }}
              animate={{ width: `${(item[valueKey] / maxVal) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
            <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-white">
              {item[valueKey]}
            </span>
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-sm text-slate-500">No data yet.</p>
      )}
    </div>
  );
}

function SuperAdminPanel({
  aiConfig,
  heatmapData,
  loading,
  onRefreshHealth,
  onRefreshHeatmap,
  onUpdateAIConfig,
  systemHealth,
}) {
  const [activeTab, setActiveTab] = useState("ai");
  const [tone, setTone] = useState(aiConfig?.tone || "friendly");
  const [responseLength, setResponseLength] = useState(
    aiConfig?.response_length || "medium"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (aiConfig) {
      setTone(aiConfig.tone);
      setResponseLength(aiConfig.response_length);
    }
  }, [aiConfig]);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await onUpdateAIConfig({ tone, response_length: responseLength });
    } finally {
      setSaving(false);
    }
  };

  const hasConfigChanged =
    aiConfig && (tone !== aiConfig.tone || responseLength !== aiConfig.response_length);

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-[2rem] border border-amber-400/20 bg-amber-400/5 p-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
          <Shield size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            Super Admin Panel
          </p>
          <h2 className="mt-0.5 text-xl font-semibold text-white">
            System Controls & Monitoring
          </h2>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-5 flex gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/30 hover:text-amber-100"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── AI Controls Tab ── */}
      {activeTab === "ai" && (
        <motion.div
          key="ai"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 grid gap-5 xl:grid-cols-2"
        >
          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Chatbot Personality</CardTitle>
              <CardDescription>
                Control how the AI assistant responds to recruiters. Changes apply to new conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Response Tone
                </label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Response Length
                </label>
                <Select value={responseLength} onValueChange={setResponseLength}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900">
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (2-4 sentences)</SelectItem>
                    <SelectItem value="long">Long (detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                disabled={saving || !hasConfigChanged}
                onClick={handleSaveConfig}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="text-white">Current Configuration</CardTitle>
              <CardDescription>
                Active settings applied to new conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiConfig ? (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-sm text-slate-400">Tone</span>
                    <Badge className="bg-cyan-400/10 text-cyan-300 border-cyan-400/20">
                      {aiConfig.tone}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-sm text-slate-400">Length</span>
                    <Badge className="bg-cyan-400/10 text-cyan-300 border-cyan-400/20">
                      {aiConfig.response_length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-sm text-slate-400">Last Updated</span>
                    <span className="text-xs text-slate-300">
                      {new Date(aiConfig.updated_at).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "No config loaded"
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Heatmap Tab ── */}
      {activeTab === "heatmap" && (
        <motion.div
          key="heatmap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Platform usage analytics overview
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:border-amber-400/30"
              onClick={onRefreshHeatmap}
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="border-white/10 bg-slate-950/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 size={16} className="text-cyan-400" />
                  Project Views
                </CardTitle>
                <CardDescription>
                  Which projects recruiters clicked on most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={heatmapData?.project_views || []}
                  labelKey="name"
                  valueKey="count"
                  color="bg-cyan-400"
                />
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-950/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Gauge size={16} className="text-emerald-400" />
                  Section Views
                </CardTitle>
                <CardDescription>
                  Section engagement breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={heatmapData?.section_views || []}
                  labelKey="name"
                  valueKey="count"
                  color="bg-emerald-400"
                />
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-slate-950/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare size={16} className="text-amber-400" />
                Chatbot Usage (Last 7 Days)
              </CardTitle>
              <CardDescription>
                Daily message count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={heatmapData?.chatbot_usage || []}
                labelKey="day"
                valueKey="count"
                color="bg-amber-400"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── System Health Tab ── */}
      {activeTab === "health" && (
        <motion.div
          key="health"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Real-time system diagnostics
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 hover:border-amber-400/30"
              onClick={onRefreshHealth}
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* API Status */}
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="flex items-center gap-4 pt-6">
                <div
                  className={`rounded-xl p-3 ${
                    systemHealth?.api_status === "ok"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-rose-400/10 text-rose-400"
                  }`}
                >
                  <Server size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">API Status</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {systemHealth?.api_status === "ok" ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <XCircle size={14} className="text-rose-400" />
                    )}
                    <span className="font-semibold text-white">
                      {systemHealth?.api_status === "ok" ? "Healthy" : "Down"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DB Status */}
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="flex items-center gap-4 pt-6">
                <div
                  className={`rounded-xl p-3 ${
                    systemHealth?.db_status === "ok"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-rose-400/10 text-rose-400"
                  }`}
                >
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Database</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {systemHealth?.db_status === "ok" ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <XCircle size={14} className="text-rose-400" />
                    )}
                    <span className="font-semibold text-white">
                      {systemHealth?.db_status === "ok" ? "Connected" : "Error"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                  <Gauge size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg Response</p>
                  <span className="text-xl font-bold text-white">
                    {systemHealth?.avg_response_time_ms ?? "--"}
                    <span className="ml-0.5 text-sm font-normal text-slate-400">ms</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Total Conversations</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {systemHealth?.total_conversations ?? "--"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Total Messages</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {systemHealth?.total_messages ?? "--"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-slate-950/70">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Server Uptime</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {systemHealth?.uptime ?? "--"}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default SuperAdminPanel;

