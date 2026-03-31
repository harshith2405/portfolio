import { motion } from "framer-motion";

function Skills({ highlight, sectionRef, skillGroups, strengths }) {
  return (
    <section className="scroll-mt-24" data-section="skills" ref={sectionRef}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2rem] border p-7 transition-all duration-500 ${
          highlight
            ? "border-fuchsia-300 bg-fuchsia-400/10 shadow-[0_0_60px_rgba(232,121,249,0.15)]"
            : "border-white/10 bg-white/5"
        }`}
        initial={{ opacity: 0, y: 18 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-300">
          Skills
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Full-stack breadth with competitive problem-solving depth
        </h2>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {skillGroups.map((group) => (
            <div
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-6"
              key={group.label}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                {group.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {strengths.length > 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-fuchsia-400/10 bg-fuchsia-400/5 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-200">
              DSA & Problem Solving
            </div>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-200 md:grid-cols-2">
              {strengths.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </section>
  );
}

export default Skills;
