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
      className="pro-surface sticky top-4 z-20 mb-6 flex items-center justify-between rounded-3xl px-5 py-4"
      initial={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="pro-kicker">
            Selected work
          </div>
          <div className="text-sm text-slate-400">
            Welcome, {visitorName || "Guest"}
            {role ? ` • ${role}` : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            recruiterMode
              ? "pro-button"
              : "pro-outline"
          }`}
          onClick={onToggleRecruiterMode}
          type="button"
        >
          Recruiter Mode
        </button>
        {isAdmin && (
          <button
            className="pro-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
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
