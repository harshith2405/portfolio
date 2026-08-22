import { useState } from "react";
import { motion } from "framer-motion";

const ROLE_FIT_MATCHERS = {
  backend: ["backend", "python", "java", "django", "fastapi", "api", "postgresql", "sql"],
  full_stack: [],
  ai: ["ai", "llm", "prompt", "retrieval", "ml", "opencv", "tensorflow", "gemini"],
};

function Skills({ highlight, roleFit, sectionRef, skillGroups, strengths }) {
  const [selectedSkill, setSelectedSkill] = useState("");

  const isRoleFitMatch = (text) => {
    if (!text || roleFit === "full_stack") return false;
    const normalized = text.toLowerCase();
    return ROLE_FIT_MATCHERS[roleFit]?.some((keyword) => normalized.includes(keyword));
  };

  return (
    <section className="scroll-mt-24" data-section="skills" ref={sectionRef}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2rem] border p-7 transition-all duration-500 ${
          highlight
            ? "border-white/30 bg-white/[0.08] shadow-[0_0_60px_rgba(255,255,255,0.09)]"
            : "pro-surface"
        }`}
        initial={{ opacity: 0, y: 18 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <p className="pro-kicker">
          Skills
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Full-stack breadth with competitive problem-solving depth
        </h2>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {skillGroups.map((group) => (
            <div
              className="pro-card rounded-[1.5rem] p-6"
              key={group.label}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                {group.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedSkill === item
                        ? "border-white/35 bg-white/15 text-white"
                        : isRoleFitMatch(`${group.label} ${item}`)
                          ? "border-white/25 bg-white/[0.08] text-white"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                    }`}
                    key={item}
                    onClick={() => setSelectedSkill(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {strengths.length > 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">
              DSA & Problem Solving
            </div>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-200 md:grid-cols-2">
              {strengths.map((item) => (
                <li key={item}>
                  <button
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selectedSkill === item
                        ? "border-white/35 bg-white/15 text-white"
                        : isRoleFitMatch(item)
                          ? "border-white/25 bg-white/[0.08] text-white"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                    }`}
                    onClick={() => setSelectedSkill(item)}
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default Skills;
