import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

function normalizeProjectKey(name) {
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("interview ai") || normalized.includes("interview trainer")) {
    return "interview-ai";
  }
  return normalized
    .replace(/\(github:.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findProjectDetail(project, projectInfo) {
  if (!project) return null;

  const targetKey = normalizeProjectKey(project.name);
  const targetBaseName = (project.name || "").split(" (")[0].trim().toLowerCase();

  return (
    (projectInfo || []).find((entry) => {
      const entryName = (entry.project_name || "").trim().toLowerCase();
      const entrySlug = (entry.slug || "").trim().toLowerCase();
      return (
        normalizeProjectKey(entry.project_name || entry.slug) === targetKey ||
        entrySlug === targetKey ||
        entryName === targetBaseName
      );
    }) || null
  );
}

function DetailList({ items, label }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Projects({
  focusedProject,
  highlight,
  onProjectClick,
  projectInfo,
  projects,
  sectionRef,
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const selectedIndex = useMemo(() => {
    if (activeIndex !== null && projects[activeIndex]) return activeIndex;
    if (!focusedProject) return null;
    const nextIndex = projects.findIndex((project) => project.name === focusedProject);
    return nextIndex >= 0 ? nextIndex : null;
  }, [activeIndex, focusedProject, projects]);

  const activeProject = selectedIndex !== null ? projects[selectedIndex] : null;
  const activeProjectDetail = useMemo(
    () => findProjectDetail(activeProject, projectInfo),
    [activeProject, projectInfo]
  );

  useEffect(() => {
    if (!focusedProject) return;
    const nextIndex = projects.findIndex((project) => project.name === focusedProject);
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    }
  }, [focusedProject, projects]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const nextIndex = (selectedIndex - 1 + projects.length) % projects.length;
        setActiveIndex(nextIndex);
        onProjectClick(projects[nextIndex].name);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = (selectedIndex + 1) % projects.length;
        setActiveIndex(nextIndex);
        onProjectClick(projects[nextIndex].name);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onProjectClick, projects, selectedIndex]);

  const openProject = (index) => {
    setActiveIndex(index);
    onProjectClick(projects[index].name);
  };

  const closeProject = () => {
    setActiveIndex(null);
    onProjectClick("");
  };

  const stepProject = (direction) => {
    if (selectedIndex === null) return;
    const nextIndex = (selectedIndex + direction + projects.length) % projects.length;
    setActiveIndex(nextIndex);
    onProjectClick(projects[nextIndex].name);
  };

  return (
    <>
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
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {projects.map((project, index) => {
              const isActive = selectedIndex === index;

              return (
                <motion.article
                  className={`cursor-pointer rounded-[1.5rem] border p-6 transition-all duration-300 ${
                    isActive
                      ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_55px_rgba(34,211,238,0.25)]"
                      : focusedProject
                        ? "border-white/5 bg-slate-950/30 opacity-55"
                        : "border-white/10 bg-slate-950/60"
                  }`}
                  key={project.name}
                  onClick={() => openProject(index)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <ArrowUpRight className="mt-1 text-cyan-300" size={18} />
                  </div>
                  {project.stack && (
                    <p className="mt-3 line-clamp-2 text-sm font-medium text-cyan-200">
                      {project.stack}
                    </p>
                  )}
                  {project.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-300">
                      {project.description}
                    </p>
                  )}
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={closeProject}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative h-[72vh] w-[48vw] min-w-[720px] max-w-[920px] overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_35%),linear-gradient(160deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] shadow-[0_0_120px_rgba(34,211,238,0.16)]"
              exit={{ opacity: 0, scale: 0.97, y: 22 }}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.24 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                      Project
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {activeProject.name}
                    </h3>
                    {activeProject.stack && (
                      <p className="mt-3 text-sm font-medium text-cyan-200">
                        {activeProject.stack}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40"
                      onClick={() => stepProject(-1)}
                      type="button"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40"
                      onClick={() => stepProject(1)}
                      type="button"
                    >
                      <ArrowRight size={16} />
                    </button>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-100"
                      onClick={closeProject}
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {activeProjectDetail?.summary && (
                    <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        What It Does
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {activeProjectDetail.summary}
                      </p>
                    </div>
                  )}

                  {!activeProjectDetail && (
                    <div className="rounded-[1.1rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                      Detailed popup data for this project is not in the DB yet.
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <DetailList
                      items={activeProjectDetail?.why_matters}
                      label="Why This Project Matters"
                    />
                    <DetailList
                      items={activeProjectDetail?.design_choices}
                      label="Design Choices"
                    />
                    <DetailList
                      items={activeProjectDetail?.contribution}
                      label="Contribution"
                    />
                    <DetailList
                      items={activeProjectDetail?.constraints}
                      label="Constraints / Trade-offs"
                    />
                  </div>

                  {activeProjectDetail?.outcome && (
                    <div className="mt-4 rounded-[1.1rem] border border-cyan-400/15 bg-cyan-400/5 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        Outcome / Impact
                      </div>
                      <p className="mt-3 text-sm leading-7 text-cyan-100">
                        {activeProjectDetail.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Projects;
