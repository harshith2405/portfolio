import { motion } from "framer-motion";
import { ArrowRight, Github, Mail, MapPin } from "lucide-react";

function Hero({ basics, bio, contact }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-indigo-500/10 p-8 shadow-[0_0_80px_rgba(14,165,233,0.08)]"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.55 }}
    >
      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
            AI-powered recruiter walkthrough
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              {basics.name || "Your Name"}
            </h1>
            <p className="text-lg font-medium text-cyan-200 md:text-2xl">
              {basics.role || ""}
            </p>
          </div>
          <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            {bio ||
              "Production-minded engineer building practical systems across backend, frontend, and AI."}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            {basics.location && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <MapPin size={16} className="text-cyan-300" />
                {basics.location}
              </span>
            )}
            {contact.email && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Mail size={16} className="text-cyan-300" />
                {contact.email}
              </span>
            )}
            {contact.github && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Github size={16} className="text-cyan-300" />
                {contact.github}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Candidate Snapshot
          </p>
          <div className="mt-6 space-y-5">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Experience
              </div>
              <div className="mt-2 text-lg text-slate-100">
                {basics.experience || "Add experience in portfolio context"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Positioning
              </div>
              <div className="mt-2 text-lg leading-8 text-slate-300">
                Full-stack product builder with AI system design instincts and strong
                problem-solving fundamentals.
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
              Explore with the chatbot
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Hero;
