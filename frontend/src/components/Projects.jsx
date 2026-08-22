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

const PROJECT_ROLE_FIT_MATCHERS = {
  backend: ["django", "fastapi", "api", "postgres", "backend", "sql"],
  full_stack: [],
  ai: ["ai", "llm", "chatbot", "retrieval", "opencv", "tensorflow", "gemini", "summary"],
};

const DEFAULT_ARCHITECTURE = {
  "ai-chatbot-with-memory": [
    { label: "Frontend", detail: "React recruiter-facing chat widget with session-aware conversation history." },
    { label: "Backend", detail: "Django REST + prompt orchestration layer that prepares context and routes model calls." },
    { label: "Data", detail: "PostgreSQL for sessions and messages, plus structured portfolio context and project detail storage." },
    { label: "AI Flow", detail: "Gemini primary model with OpenRouter fallbacks, short-term memory, fixed context, and evidence-aware replies." },
  ],
  "anomaly-detection-system": [
    { label: "Video Input", detail: "Frames are streamed from the source feed and prepared with OpenCV preprocessing." },
    { label: "Model Layer", detail: "A trained anomaly detection model evaluates frame patterns for suspicious behavior." },
    { label: "Backend Logic", detail: "Detection results are filtered into actionable alerts instead of raw frame noise." },
    { label: "Notification Path", detail: "Alert events trigger downstream messaging or operator response flows." },
  ],
  "employee-summary-generator": [
    { label: "API Layer", detail: "FastAPI endpoint receives structured employee data and validates request shape." },
    { label: "Transformation", detail: "Input records are normalized into a summary-friendly prompt structure." },
    { label: "LLM Step", detail: "The summarization model converts structured data into clear natural-language output." },
    { label: "Response", detail: "A concise summary is returned through the API for direct use in products or dashboards." },
  ],
  "interview-ai": [
    { label: "Frontend", detail: "Next.js guided interface keeps the interview flow structured and easy to navigate." },
    { label: "Backend", detail: "Server-side logic controls question flow, answer capture, and session progression." },
    { label: "Persistence", detail: "Interview state and user progress are stored so sessions can stay consistent." },
    { label: "AI Layer", detail: "The model tailors interview responses and follow-up prompts to the ongoing session." },
  ],
  "code-collaboration-platform": [
    { label: "Client", detail: "Collaborative editor UI manages active files, room state, and user presence." },
    { label: "Realtime Layer", detail: "WebSocket-style sync keeps code changes aligned across participants." },
    { label: "Session Logic", detail: "Backend session management coordinates rooms and participant lifecycle." },
    { label: "Persistence", detail: "Saved code and collaboration metadata support continuity beyond a live room." },
  ],
  "finance-advisor": [
    { label: "Input Layer", detail: "User financial questions or records are captured through a guided advisory interface." },
    { label: "Advisory Logic", detail: "Backend prompt shaping turns raw inputs into focused financial analysis tasks." },
    { label: "Model Layer", detail: "The LLM produces advice summaries with an emphasis on readable recommendations." },
    { label: "Presentation", detail: "Results are returned in a structured format suitable for dashboards or reports." },
  ],
};

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

function ArchitectureView({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mt-4 rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
        Architecture
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <div
            className="rounded-[1rem] border border-white/10 bg-slate-950/60 p-4"
            key={`${item.label}-${item.detail}`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Projects({
  focusedProject,
  highlight,
  onProjectClick,
  projectInfo,
  projects,
  roleFit,
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
  const architectureItems = useMemo(() => {
    if (!activeProject) return [];
    return activeProjectDetail?.architecture?.length
      ? activeProjectDetail.architecture
      : DEFAULT_ARCHITECTURE[normalizeProjectKey(activeProject.name)] || [];
  }, [activeProject, activeProjectDetail]);

  const isRoleFitMatch = (project) => {
    if (!project || roleFit === "full_stack") return false;
    const normalized = `${project.name} ${project.stack || ""} ${project.description || ""}`.toLowerCase();
    return PROJECT_ROLE_FIT_MATCHERS[roleFit]?.some((keyword) => normalized.includes(keyword));
  };

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
              ? "border-white/30 bg-white/[0.08] shadow-[0_0_60px_rgba(255,255,255,0.09)]"
              : "pro-surface"
          }`}
          initial={{ opacity: 0, y: 18 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="pro-kicker">
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
                      ? "border-white/35 bg-white/[0.1] shadow-[0_0_55px_rgba(255,255,255,0.1)]"
                      : isRoleFitMatch(project)
                        ? "border-white/25 bg-white/[0.07]"
                      : focusedProject
                        ? "border-white/5 bg-slate-950/30 opacity-55"
                        : "pro-card"
                  }`}
                  key={project.name}
                  onClick={() => openProject(index)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <ArrowUpRight className="mt-1 text-zinc-300" size={18} />
                  </div>
                  {project.stack && (
                    <p className="mt-3 line-clamp-2 text-sm font-medium text-zinc-300">
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
              className="relative h-[72vh] w-[48vw] min-w-[720px] max-w-[920px] overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(160deg,rgba(23,23,23,0.98),rgba(2,2,2,0.98))] shadow-[0_0_120px_rgba(0,0,0,0.5)]"
              exit={{ opacity: 0, scale: 0.97, y: 22 }}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.24 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                  <div className="min-w-0">
                    <p className="pro-kicker">
                      Project
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {activeProject.name}
                    </h3>
                    {activeProject.stack && (
                      <p className="mt-3 text-sm font-medium text-zinc-300">
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

                  <ArchitectureView items={architectureItems} />

                  {activeProjectDetail?.outcome && (
                    <div className="mt-4 rounded-[1.1rem] border border-white/15 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-300">
                        Outcome / Impact
                      </div>
                      <p className="mt-3 text-sm leading-7 text-zinc-200">
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
