import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

function Projects({ focusedProject, highlight, onProjectClick, projects, sectionRef }) {
  return (
    <section className="scroll-mt-24" data-section="projects" ref={sectionRef}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[2rem] border p-7 transition-all duration-500 ${
          highlight
            ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_60px_rgba(34,211,238,0.18)]"
            : "border-white/10 bg-white/5"
        }`}
        initial={{ opacity: 0, y: 18 }}
        transition={{ delay: 0.08, duration: 0.45 }}
      >
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Projects
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Systems that prove engineering depth
            </h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 lg:block">
            Ask the chatbot to walk through any project
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <motion.article
              className={`rounded-[1.5rem] border p-6 transition-all duration-300 ${
                focusedProject
                  ? focusedProject === project.name
                    ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_55px_rgba(34,211,238,0.25)]"
                    : "border-white/5 bg-slate-950/30 opacity-45"
                  : "border-white/10 bg-slate-950/60"
              }`}
              key={project.name}
              onClick={() => onProjectClick(project.name)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                <ArrowUpRight className="mt-1 text-cyan-300" size={18} />
              </div>
              {project.stack && (
                <p className="mt-3 text-sm font-medium text-cyan-200">
                  {project.stack}
                </p>
              )}
              {project.description && (
                <p className="mt-4 leading-7 text-slate-300">{project.description}</p>
              )}
              {project.contribution && (
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Contribution
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {project.contribution.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.outcome && (
                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
                  {project.outcome}
                </div>
              )}
              {focusedProject === project.name && (
                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  Project focus mode is active for this system.
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default Projects;
