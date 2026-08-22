import { motion } from "framer-motion";
import { ArrowRight, Award, Github, Linkedin, Mail, MapPin, SquareCode } from "lucide-react";

const candidateResumeUrl =
  import.meta.env.VITE_CANDIDATE_RESUME_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/api/portfolio/candidate-resume/`
    : "/api/portfolio/candidate-resume/");

function normalizeUrl(value, fallbackPrefix = "") {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return fallbackPrefix ? `${fallbackPrefix}${value}` : value;
}

function parseSnapshotContent(snapshotContent) {
  const sections = { education: [], links: [], details: [], positioning: "" };
  let currentSection = "details";

  (snapshotContent || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const normalized = line.toLowerCase();

      if (normalized === "education:") {
        currentSection = "education";
        return;
      }
      if (normalized === "links:") {
        currentSection = "links";
        return;
      }
      if (normalized === "details:") {
        currentSection = "details";
        return;
      }
      if (normalized === "positioning:") {
        currentSection = "positioning";
        return;
      }

      if (currentSection === "positioning") {
        sections.positioning = sections.positioning
          ? `${sections.positioning} ${line}`
          : line;
        return;
      }

      const parts = line.split("|").map((part) => part.trim());
      if (parts.length < 2) return;

      if (currentSection === "education") {
        const [label, score, institution, years] = parts;
        sections.education.push({ label, score, institution, years });
        return;
      }

      if (currentSection === "links") {
        const [label, href, text] = parts;
        sections.links.push({ label, href, text: text || label });
        return;
      }

      if (currentSection === "details") {
        const [label, value] = parts;
        sections.details.push({ label, value });
      }
    });

  return sections;
}

function getLinkIcon(label) {
  if (label === "Email") return Mail;
  if (label === "GitHub") return Github;
  if (label === "LinkedIn") return Linkedin;
  if (label === "LeetCode") return SquareCode;
  if (label === "HackerRank") return Award;
  return null;
}

function Hero({ basics, bio, contact, internshipSummary, onResumeDownload, snapshotContent }) {
  const snapshot = parseSnapshotContent(snapshotContent);

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="pro-surface overflow-hidden rounded-[2rem] p-8 md:p-10"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.55 }}
    >
      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <div className="pro-kicker inline-flex rounded-full border border-white/15 bg-white/[0.06] px-4 py-2">
            Portfolio · 2026
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white md:text-7xl">
              {basics.name || "Your Name"}
            </h1>
            <p className="text-lg font-medium tracking-[-0.02em] text-zinc-300 md:text-2xl">
              {basics.role || ""}
            </p>
          </div>
          <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            {bio ||
              "Production-minded engineer building practical systems across backend, frontend, and AI."}
          </p>
          <div className="pro-card rounded-[1.5rem] p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Internship Experience
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {internshipSummary || "Add internship information in portfolio context"}
            </div>
          </div>
        </div>

        <div className="pro-card rounded-[1.75rem] p-6">
          <p className="pro-kicker">
            Candidate Snapshot
          </p>
          <div className="mt-6 grid gap-3">
            {snapshot.education.map((item) => (
                <div
                  className="grid grid-cols-[110px_1fr] items-start gap-4 rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-3"
                  key={item.label}
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium leading-6 text-slate-100">
                    <span>{item.score}</span>
                    {item.institution ? (
                      <span className="text-slate-400"> {" "} {item.institution}</span>
                    ) : null}
                    {item.years ? (
                      <span className="text-slate-500"> {" "} {item.years}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            {snapshot.links.length ? (
              <div className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  {snapshot.links.map((item) => {
                    const Icon = getLinkIcon(item.label);
                    return (
                      <a
                        className="pro-outline inline-flex items-center gap-2 px-3 py-2 text-sm"
                        href={item.href}
                        key={item.label}
                        rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                      >
                        {Icon ? <Icon size={14} className="text-zinc-300" /> : null}
                        <span>{item.text}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {snapshot.details.map((item) => (
              <div
                className="grid grid-cols-[110px_1fr] items-start gap-4 rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-3"
                key={item.label}
              >
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {item.label}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium leading-6 text-slate-100">
                  {item.label === "Location" ? (
                    <MapPin size={14} className="shrink-0 text-zinc-300" />
                  ) : null}
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Positioning
              </div>
              <div className="mt-2 text-lg leading-8 text-slate-300">
                {snapshot.positioning ||
                  "Full-stack product builder with AI system design instincts and strong problem-solving fundamentals."}
              </div>
            </div>
            <a
              className="pro-outline inline-flex w-fit items-center gap-2 px-4 py-2 text-sm font-semibold"
              href={candidateResumeUrl}
              onClick={onResumeDownload}
              rel="noreferrer"
              target="_blank"
            >
              Download Candidate Resume
            </a>
            <div className="pro-button inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
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
