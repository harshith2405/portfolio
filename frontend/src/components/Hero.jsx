import { motion } from "framer-motion";
import { ArrowRight, Award, Github, Linkedin, Mail, MapPin, SquareCode } from "lucide-react";

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

function Hero({ basics, bio, contact, internshipSummary, snapshotContent }) {
  const snapshot = parseSnapshotContent(snapshotContent);

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
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Internship Experience
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {internshipSummary || "Add internship information in portfolio context"}
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
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
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-100"
                        href={item.href}
                        key={item.label}
                        rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                        target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                      >
                        {Icon ? <Icon size={14} className="text-cyan-300" /> : null}
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
                    <MapPin size={14} className="shrink-0 text-cyan-300" />
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
