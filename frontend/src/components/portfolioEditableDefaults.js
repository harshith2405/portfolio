export const DEFAULT_ACHIEVEMENTS = [
  "LeetCode|Top 6.59%|Global leaderboard percentile|Verified Ranking|https://leetcode.com/u/karra_harshithr1/",
  "Contest Rating|1,852|Weekly Contest 508 (3/4 Solved)|Active Competitor|",
  "Global Rank|#1,350|Peak contest rank|Competitive Performance|",
  "HackerRank|5 Stars|Problem Solving Gold Badge|Algorithms & Data Structures|https://www.hackerrank.com/profile/karra_harshithr1",
].join("\n");

export const DEFAULT_PROFESSIONAL_TIMELINE = `Role: Full Stack Developer (Backend, Geospatial & 3D Systems)
Company: Polygon
Location: Hyderabad, India
Duration: Present
Badge: Active Role · Core Systems
Status: active
Summary: Engineering core geospatial platforms, real-time map visualization, 3D terrain viewers, and spatial database pipelines. Built decoupled architectures separating static spatial geometry from rapid business updates.
Highlights:
- PlotView: Token-free MapLibre + PostGIS + Socket.IO vector engine handling 150K+ plots.
- Giro3D / Topo360: 3D WebGL terrain viewer with real-time volumetric cuboid clipping.
- BIM Viewer & PostGIS Infra: 3D glTF building viewer & spatial DB migration strategy.

Role: SDE Intern
Company: FactEye Tech Labs Pvt. Ltd.
Location: Hyderabad, India
Duration: 21 Oct 2025 – 20 Feb 2026
Badge: Completed
Status: completed
Summary: Worked under the direct guidance of Ashish Kumar Sahoo, Co-Founder & CTO, collaborating on production-level features and agile product delivery.
Highlights:
- Hands-on exposure to scalable product development and team engineering workflows.
- Shipped robust, testable software features in a structured production pipeline.

Role: Graduated B.Tech in Computer Science & Business Systems (CSBS)
Company: VNR VJIET
Location: Hyderabad, India
Duration: 2022 – 2026
Badge: 8.37 CGPA
Status: completed
Summary: Graduated with strong foundations in distributed computing, data structures, relational database systems, and algorithm analysis.
Highlights:
- 1st Place Winner at Webathon 2.0 (2024) & Webathon 3.0 (2025).
- Organized a National Level Hackathon at VNR VJIET.`;

export function parseAchievementRows(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", valueText = "", description = "", caption = "", url = ""] = line
        .split("|")
        .map((part) => part.trim());
      return { title, value: valueText, description, caption, url };
    })
    .filter((item) => item.title && item.value);
}

export function parseProfessionalTimeline(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map((block, index) => {
      const item = { id: `timeline-${index}`, deliverables: [] };
      let collectingHighlights = false;

      block.split("\n").forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) return;
        if (/^highlights:\s*$/i.test(line)) {
          collectingHighlights = true;
          return;
        }
        if (collectingHighlights && line.startsWith("- ")) {
          item.deliverables.push(line.slice(2).trim());
          return;
        }
        const match = line.match(/^([\w ]+):\s*(.*)$/);
        if (!match) return;
        collectingHighlights = match[1].toLowerCase() === "highlights";
        const key = match[1].trim().toLowerCase();
        if (key === "highlights") {
          if (match[2]) item.deliverables.push(match[2].trim());
          return;
        }
        item[key === "status" ? "status" : key] = match[2].trim();
      });

      return item;
    })
    .filter((item) => item.role && item.company);
}
