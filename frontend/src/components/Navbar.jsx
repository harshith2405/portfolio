import { motion } from "framer-motion";
import { BriefcaseBusiness, Sparkles } from "lucide-react";

function Navbar({
  isAdmin,
  onResetVisitor,
  onToggleRecruiterMode,
  recruiterMode,
  role,
  visitorName,
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-20 mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl"
      initial={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            AI Portfolio
          </div>
          <div className="text-sm text-slate-400">
            Recruiter session: {visitorName || "Guest"}
            {role ? ` • ${role}` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            recruiterMode
              ? "bg-cyan-400 text-slate-950"
              : "border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40"
          }`}
          onClick={onToggleRecruiterMode}
          type="button"
        >
          Recruiter Mode
        </button>
        {isAdmin && (
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            onClick={onResetVisitor}
            type="button"
          >
            <BriefcaseBusiness size={16} />
            Change visitor
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default Navbar;

