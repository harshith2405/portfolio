import AdminConsole from "./AdminConsole";
import Hero from "./Hero";
import MetricsPanel from "./MetricsPanel";
import Navbar from "./Navbar";
import Projects from "./Projects";
import Skills from "./Skills";
import SuperAdminPanel from "./SuperAdminPanel";

function parseKeyValueLines(sectionText) {
  return Object.fromEntries(
    (sectionText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- ") && line.includes(":"))
      .map((line) => {
        const [label, ...valueParts] = line.slice(2).split(":");
        return [label.trim().toLowerCase(), valueParts.join(":").trim()];
      })
  );
}

function parseProjectBlocks(sectionText) {
  const lines = (sectionText || "").split("\n");
  const projects = [];
  let currentProject = null;
  let currentMode = "";

  const pushCurrent = () => {
    if (currentProject?.name) {
      projects.push({
        ...currentProject,
        contribution: currentProject.contribution || [],
      });
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    if (line.startsWith("- Project name:")) {
      pushCurrent();
      currentProject = {
        name: line.replace("- Project name:", "").trim(),
        contribution: [],
      };
      currentMode = "";
      return;
    }

    if (!currentProject) return;

    if (line.startsWith("What it does:")) {
      currentProject.description = line.replace("What it does:", "").trim();
      currentMode = "";
      return;
    }

    if (line.startsWith("Tech stack:")) {
      currentProject.stack = line.replace("Tech stack:", "").trim();
      currentMode = "";
      return;
    }

    if (line.startsWith("Your contribution:")) {
      currentMode = "contribution";
      return;
    }

    if (line.startsWith("Outcome:")) {
      currentProject.outcome = line.replace("Outcome:", "").trim();
      currentMode = "outcome";
      return;
    }

    if (line.startsWith("- ") && currentMode === "contribution") {
      currentProject.contribution.push(line.slice(2).trim());
      return;
    }

    if (currentMode === "outcome" && !line.startsWith("- ")) {
      currentProject.outcome = `${currentProject.outcome || ""} ${line}`.trim();
    }
  });

  pushCurrent();
  return projects;
}

function parseSkills(sectionText) {
  const skillLines = (sectionText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const groups = [];
  const strengths = [];
  let inHighlighted = false;

  skillLines.forEach((line) => {
    if (line.startsWith("###")) {
      inHighlighted = true;
      return;
    }

    if (line.startsWith("- ") && line.includes(":") && !inHighlighted) {
      const [label, ...items] = line.slice(2).split(":");
      groups.push({
        label: label.trim(),
        items: items
          .join(":")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      return;
    }

    if (inHighlighted && line.startsWith("- ")) {
      strengths.push(line.slice(2).trim());
    }
  });

  return { groups, strengths };
}

function Dashboard({
  activeSection,
  adminConsoleTab,
  adminAnalytics,
  adminHistory,
  adminJourney,
  adminReplay,
  adminSessions,
  adminUsers,
  aiConfig,
  contentDrafts,
  focusedProject,
  heatmapData,
  loadingAdminTools,
  onAddAdmin,
  onChangeContent,
  onLoadAdminHistory,
  metrics,
  onProjectClick,
  onRefreshHeatmap,
  onRefreshHealth,
  onRemoveAdmin,
  onReplayChat,
  onResetVisitor,
  onSearchAdmin,
  onSearchInputChange,
  onSelectAdminTab,
  onToggleRecruiterMode,
  onUpdateAIConfig,
  onUpdateContent,
  portfolio,
  presence,
  projectsRef,
  role,
  recruiterMode,
  replayingAdminChat,
  skillsRef,
  searchQuery,
  searchResults,
  systemHealth,
  visitorName,
}) {
  const sections = portfolio.sections || {};
  const basics = parseKeyValueLines(sections["candidate basics"]);
  const contact = parseKeyValueLines(sections.contact);
  const projects = parseProjectBlocks(sections.projects);
  const { groups: skillGroups, strengths } = parseSkills(sections.skills);
  const internshipSummary = sections.internships || "";
  const achievements = (sections["resume highlights"] || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));

  return (
    <div className="space-y-6">
      <Navbar
        isAdmin={role === "admin" || role === "super_admin"}
        onResetVisitor={onResetVisitor}
        onToggleRecruiterMode={onToggleRecruiterMode}
        recruiterMode={recruiterMode}
        role={role}
        visitorName={visitorName}
      />
      <MetricsPanel metrics={metrics} presence={presence} />
      <Hero basics={basics} bio={sections["short bio"]} contact={contact} />
      <Projects
        focusedProject={focusedProject}
        highlight={activeSection === "projects"}
        onProjectClick={onProjectClick}
        projects={projects}
        sectionRef={projectsRef}
      />
      <Skills
        highlight={activeSection === "skills"}
        sectionRef={skillsRef}
        skillGroups={skillGroups}
        strengths={strengths}
      />
      {(role === "admin" || role === "super_admin") && (
        <AdminConsole
          activeTab={adminConsoleTab}
          adminAnalytics={adminAnalytics}
          adminHistory={adminHistory}
          adminJourney={adminJourney}
          adminReplay={adminReplay}
          admins={adminUsers}
          adminSessions={adminSessions}
          contentDrafts={contentDrafts}
          loading={loadingAdminTools}
          onAddAdmin={onAddAdmin}
          onChangeContent={onChangeContent}
          onLoadHistory={onLoadAdminHistory}
          onRemoveAdmin={onRemoveAdmin}
          onReplayChat={onReplayChat}
          onSearch={onSearchAdmin}
          onSearchInputChange={onSearchInputChange}
          onSelectTab={onSelectAdminTab}
          onUpdateContent={onUpdateContent}
          replaying={replayingAdminChat}
          role={role}
          searchQuery={searchQuery}
          searchResults={searchResults}
        />
      )}
      {role === "super_admin" && (
        <SuperAdminPanel
          aiConfig={aiConfig}
          heatmapData={heatmapData}
          loading={loadingAdminTools}
          onRefreshHeatmap={onRefreshHeatmap}
          onRefreshHealth={onRefreshHealth}
          onUpdateAIConfig={onUpdateAIConfig}
          systemHealth={systemHealth}
        />
      )}
      {recruiterMode && (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/5 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Recruiter Highlights
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Fast-read summary of strengths, achievements, and internships
            </h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Internship
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                  {internshipSummary || "Add internship information in portfolio_context.md"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Achievements
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  {achievements.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Quick Actions
            </p>
            <div className="mt-5 grid gap-3">
              <a
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-sm font-semibold text-white transition hover:border-cyan-400/40"
                href="http://127.0.0.1:8000/api/portfolio/resume/"
                target="_blank"
                rel="noreferrer"
              >
                Download Resume Snapshot
              </a>
              <a
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-sm font-semibold text-white transition hover:border-cyan-400/40"
                href={`mailto:${contact.email || ""}`}
              >
                Contact Candidate
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
