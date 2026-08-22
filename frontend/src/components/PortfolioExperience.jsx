import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  Box,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Command,
  Compass,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Filter,
  Flame,
  FolderGit2,
  Github,
  Globe,
  HardDrive,
  Layers,
  LineChart,
  MapPin,
  Maximize2,
  MessageSquare,
  Network,
  Radio,
  Rocket,
  Scissors,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// ── CODE SNIPPETS FOR HERO SYSTEM CONSOLE ──
const HERO_SYSTEM_SNIPPETS = [
  {
    id: "postgis",
    label: "PostGIS Spatial SQL",
    filename: "spatial_query.sql",
    language: "sql",
    code: `-- Query 5,000+ plot polygons with high-speed GeoJSON serialization
SELECT jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_agg(
    jsonb_build_object(
      'type', 'Feature',
      'id', p.id,
      'geometry', ST_AsGeoJSON(p.geom)::jsonb,
      'properties', jsonb_build_object(
        'plot_no', p.plot_no,
        'status', p.status,
        'area_sqft', ST_Area(p.geom)
      )
    )
  )
) FROM project_plots p WHERE p.project_id = $1;`,
  },
  {
    id: "giro3d",
    label: "Giro3D Dual CRS",
    filename: "dual_crs_engine.ts",
    language: "typescript",
    code: `// Geographic CRS (EPSG:3395) -> Local Three.js origin offset
// Cures 32-bit GPU floating-point precision jitter on terrain meshes
const instance = new Instance({
  target: domElement,
  crs: 'EPSG:3395',
  reference: new Vector3(centerLonMeters, centerLatMeters, 0),
});

// Stream Cloud-Optimized GeoTIFF (COG) directly from S3
const demSource = new CogSource({ url: 's3://terrain/dsm.tif' });
instance.add(new ElevationLayer({ source: demSource }));`,
  },
  {
    id: "socket",
    label: "Real-Time Delta Stream",
    filename: "socket_delta_stream.js",
    language: "javascript",
    code: `// Broadcast lightweight delta updates without reloading map datasets
io.to(projectId).emit('plot:delta_update', {
  plot_no: '33-A',
  status: 'Sold',
  updated_at: Date.now()
});

// Client PlotState RAM Hash Update (O(1) lookup)
plotState.updateProperty('33-A', { status: 'Sold' });
maplibreCanvas.setFeatureState({ id: '33-A' }, { status: 'Sold' });`,
  },
];

// ── PART 1: POLYGON STARTUP PRODUCTION SYSTEMS ──
const POLYGON_SYSTEMS = [
  {
    id: "plotview",
    number: "01",
    name: "PlotView",
    tagline: "Large-Scale Property & Geospatial Visualization Platform",
    badge: "Flagship GIS Engine",
    description:
      "A high-performance map-based visualization platform for exploring, searching, and managing real-estate plot layouts across massive project datasets. Designed to render thousands of dynamic vector polygons with zero Mapbox paid token dependencies.",
    scaleStats: [
      { label: "Plots / Project", value: "5,000+" },
      { label: "Total Plots Handled", value: "150,000+" },
      { label: "Peak Load Design", value: "~1,000 req/s" },
      { label: "Commercial Tokens", value: "0 (100% Free)" },
    ],
    techStack: [
      "MapLibre GL JS",
      "PostgreSQL",
      "PostGIS",
      "Node.js",
      "Express",
      "Socket.IO",
      "Redis",
      "WebGL GPU",
    ],
    nodes: [
      { id: "db", label: "PostgreSQL / PostGIS", sub: "Spatial Table Storage", type: "db" },
      { id: "api", label: "Node.js REST Server", sub: "ST_AsGeoJSON Execution", type: "api" },
      { id: "ram", label: "PlotState Service", sub: "O(1) In-Memory RAM Index", type: "ram" },
      { id: "gpu", label: "MapLibre GL JS", sub: "Client WebGL GPU Canvas", type: "gpu" },
      { id: "socket", label: "Socket.IO Broadcast", sub: "Real-Time Delta Stream", type: "socket" },
    ],
    problem:
      "Property layouts contain thousands of complex spatial geometries, while plot statuses (Available, Reserved, Sold) and dimensions change frequently during sales events. Repeatedly re-fetching or re-generating large GIS datasets caused network bottlenecks and client lag.",
    architectureSteps: [
      {
        step: "01. Spatial Geometry Storage",
        desc: "PostgreSQL / PostGIS holds spatial polygon geometries, plot boundaries, numbers, and status flags.",
      },
      {
        step: "02. High-Speed PostGIS Ingestion",
        desc: "Node.js backend executes ST_AsGeoJSON spatial queries and delivers full GeoJSON FeatureCollections.",
      },
      {
        step: "03. O(1) RAM Hash Indexing",
        desc: "Frontend PlotStateService indexes incoming geometries into an in-memory hash map for sub-millisecond lookups.",
      },
      {
        step: "04. Token-Free WebGL GPU Rendering",
        desc: "MapLibre GL JS renders vector polygons with a custom inline style (LOCAL_OFFLINE_STYLE) directly on the browser's graphics card.",
      },
      {
        step: "05. Real-Time Socket.IO Delta Streaming",
        desc: "Status updates and ST_Split geometry changes broadcast lightweight delta packets ({ plot_no: '33-A', status: 'Sold' }) to re-color plots instantly without page reloads.",
      },
    ],
    highlights: [
      "Zero Mapbox API or paid token dependencies using custom MapLibre GL JS offline style.",
      "O(1) in-memory RAM hash map indexing for sub-millisecond search, hover, and multi-polygon filtering.",
      "Real-time Socket.IO delta stream for instant plot status changes without re-downloading datasets.",
      "Dynamic spatial geometry splitting support via PostGIS ST_Split.",
    ],
    outcome:
      "Eliminated 100% of commercial map token costs while achieving instant 60fps WebGL rendering across 150K+ total property plots.",
  },
  {
    id: "giro3d",
    number: "02",
    name: "Giro3D / Topo360",
    tagline: "3D GIS, Terrain Elevation & Volumetric Analytics Engine",
    badge: "3D Terrain Engine",
    description:
      "A browser-based 3D geospatial engine engineered for streaming Cloud-Optimized GeoTIFFs (COGs), multi-resolution digital elevation models, terrain-draped survey profiles, and real-time volumetric cut/fill analytics.",
    scaleStats: [
      { label: "Profile Sampling", value: "400 Points (0.8m)" },
      { label: "Surface Lift", value: "+0.35m Anti-Clip" },
      { label: "Coordinate Systems", value: "Dual (EPSG:3395)" },
      { label: "HUD Layer", value: "SVG 2D Projection" },
    ],
    techStack: [
      "Giro3D",
      "Three.js",
      "Cloud-Optimized GeoTIFFs (COGs)",
      "AWS S3",
      "Custom Terrain Shaders",
      "SVG HUD Projection",
      "WebGL GPU",
      "Proj4",
    ],
    nodes: [
      { id: "s3", label: "AWS S3 / Storage", sub: "COG GeoTIFF Elevation Rasters", type: "db" },
      { id: "crs", label: "Dual CRS Engine", sub: "EPSG:3395 to Local Three.js", type: "api" },
      { id: "giro", label: "Giro3D Map Instance", sub: "Dynamic LOD & DEM Sampling", type: "ram" },
      { id: "hud", label: "Projected SVG HUD", sub: "Zero Z-Fighting Canvas", type: "gpu" },
      { id: "analytics", label: "3D Volumetric Tools", sub: "Cut/Fill & 400pt Profiles", type: "socket" },
    ],
    problem:
      "Rendering geographic-scale 3D terrain in standard WebGL causes 32-bit GPU floating-point precision jitter at GPS distances. Furthermore, rendering measurement tools directly in 3D WebGL scenes causes severe Z-fighting and clipping against terrain shaders.",
    architectureSteps: [
      {
        step: "01. Dual Coordinate System Architecture",
        desc: "Real-world calculations execute in Geographic CRS (EPSG:3395), while Three.js renders in a local coordinate space centered on instance.reference to eliminate GPU floating-point precision jitter.",
      },
      {
        step: "02. Cloud-Optimized GeoTIFF (COG) Streaming",
        desc: "Streams Orthophoto RGB imagery and Elevation DSM datasets directly from AWS S3 via Giro3D Map instances.",
      },
      {
        step: "03. Screen-Space Projected SVG HUD",
        desc: "Projects 3D world coordinates into a 2D screen-space SVG overlay (projectToScreen()), eliminating WebGL depth-buffer Z-fighting for drawing tools, polygons, and 3D floating badges.",
      },
      {
        step: "04. Terrain-Draped Path Profiles & PDF Reports",
        desc: "Dynamic 400-point elevation sampling (0.8m res) with a +0.35m micro-surface lift, accompanied by elevation charts and PDF survey exports.",
      },
      {
        step: "05. 3D Cut & Fill Volumetric Integration",
        desc: "Calculates Pit excavation (Cut) and Stockpile accumulation (Fill) across local grid samples against reference elevations using the Shoelace area formula.",
      },
    ],
    highlights: [
      "Dual coordinate architecture: EPSG:3395 for real-world metrics + local offset Three.js space to cure 32-bit GPU float jitter.",
      "Camera-projected SVG HUD layer: 100% immune to WebGL depth buffer Z-fighting with custom terrain shaders.",
      "Terrain-draped path profiling: 400-point sampling at 0.8m resolution with +0.35m anti-clipping surface lift and PDF exports.",
      "3D Cut & Fill analysis: real-time volumetric grid integration for mining, quarry, and construction earthwork.",
      "GPU shaders & analytical overlays: dynamic topographic contours (1m/5m/10m) and haul road safety slope heatmaps (0–10°).",
      "Interactive 3D Auto-ROI clipping & polygon boundary isolation using Giro3D Extents and KML parsers.",
    ],
    outcome:
      "Delivered a production-grade 3D topographic viewer capable of millimeter-level survey profiling and earthwork volumetric analytics directly in the browser.",
  },
  {
    id: "bim-viewer",
    number: "03",
    name: "BIM Viewer",
    tagline: "Interactive Web-Based 3D Architectural & Building Viewer",
    badge: "Web 3D CAD",
    description:
      "A browser-based 3D BIM visualization tool that enables architects, engineers, and real-estate stakeholders to inspect complex building models, spatial structural hierarchies, and component metadata directly in the web browser.",
    scaleStats: [
      { label: "3D Engine", value: "Three.js / WebGL" },
      { label: "Model Format", value: "Optimized glTF/GLB" },
      { label: "Hierarchy", value: "Element Tree" },
      { label: "Inspection", value: "Component Slicing" },
    ],
    techStack: [
      "Three.js",
      "glTF / GLB",
      "WebGL",
      "Node.js",
      "TypeScript",
      "HTML5 Canvas",
    ],
    nodes: [
      { id: "cad", label: "Raw CAD / BIM Data", sub: "Architectural Source Files", type: "db" },
      { id: "gltf", label: "glTF Conversion Pipeline", sub: "LOD & Mesh Compression", type: "api" },
      { id: "three", label: "Three.js WebGL Scene", sub: "Hardware GPU Rendering", type: "gpu" },
      { id: "ray", label: "Raycast Inspection", sub: "Floor Slicing & Metadata", type: "ram" },
    ],
    problem:
      "Raw architectural BIM files are massive and incompatible with browser rendering. Converting and streaming them without losing structural hierarchy or component metadata required a specialized pipeline.",
    architectureSteps: [
      {
        step: "01. BIM Processing & Conversion",
        desc: "Pre-processes complex CAD models into lightweight, web-optimized glTF/GLB formats with preserved node trees.",
      },
      {
        step: "02. Three.js Scene Optimization",
        desc: "Loads geometry meshes with instancing and LOD (Level of Detail) algorithms.",
      },
      {
        step: "03. Interactive Inspection & Metadata",
        desc: "Enables floor-by-floor isolation, component raycasting, and real-time attribute inspection.",
      },
    ],
    highlights: [
      "Built a web-friendly 3D model conversion and loading pipeline using optimized glTF/GLB.",
      "Implemented component-level raycasting to inspect structural metadata and spatial hierarchies.",
      "Created smooth 3D orbit, pan, and first-person camera navigation controls.",
    ],
    outcome:
      "Enabled instantaneous 3D model exploration of multi-story architectural buildings in standard web browsers.",
  },
  {
    id: "spatial-infra",
    number: "04",
    name: "Spatial Data Infrastructure",
    tagline: "PostgreSQL / PostGIS & AWS Aurora Spatial Architecture",
    badge: "Cloud DB Architecture",
    description:
      "High-throughput spatial database architecture and migration strategy for managing large-scale GIS datasets, spatial indexing, connection pooling, and multi-environment deployment.",
    scaleStats: [
      { label: "Spatial Engine", value: "PostGIS 3.x" },
      { label: "Cloud DB", value: "AWS Aurora" },
      { label: "Spatial Index", value: "GIST R-Tree" },
      { label: "Operations", value: "ST_Split / Joins" },
    ],
    techStack: [
      "PostgreSQL",
      "PostGIS",
      "AWS Aurora",
      "Redis",
      "Docker",
      "SQL Optimization",
    ],
    nodes: [
      { id: "app", label: "App & GIS Services", sub: "High-Throughput Clients", type: "api" },
      { id: "cache", label: "Redis Caching Layer", sub: "Spatial Query Result Cache", type: "ram" },
      { id: "gist", label: "GIST Spatial Index", sub: "Sub-10ms Bounding Lookups", type: "gpu" },
      { id: "aurora", label: "AWS Aurora PostgreSQL", sub: "Clustered Read Replicas", type: "db" },
    ],
    problem:
      "Spatial queries like polygon intersections and dynamic geometry splitting become CPU-intensive at scale, causing latency spikes if indexing and schema design are not carefully tuned.",
    architectureSteps: [
      {
        step: "01. PostGIS Schema & GIST Indexing",
        desc: "Applied spatial GIST indexing on geometry columns for fast spatial search and bounding-box queries.",
      },
      {
        step: "02. Spatial Function Optimization",
        desc: "Tuned ST_AsGeoJSON, ST_Intersects, and ST_Split queries to execute with minimal CPU overhead.",
      },
      {
        step: "03. AWS Aurora Migration Planning",
        desc: "Evaluated connection pooling, read replicas, and staging-to-production isolation for GIS workloads.",
      },
    ],
    highlights: [
      "Architected PostGIS spatial schemas with optimized GIST indexes for sub-10ms geometric queries.",
      "Engineered backend integration with Redis caching to eliminate redundant spatial queries.",
      "Formulated production migration blueprints for AWS Aurora PostgreSQL.",
    ],
    outcome:
      "Ensured rock-solid spatial data integrity and sub-second query performance for 150K+ geospatial entities.",
  },
];

// ── PART 2: INDEPENDENT & OPEN-SOURCE PROJECTS ──
const INDEPENDENT_PROJECTS = [
  {
    id: "chatbot-memory",
    name: "AI Chatbot with Memory",
    tagline: "Context-Aware System with HyDE Retrieval",
    category: "AI & RAG",
    github: "chatbot",
    description:
      "Conversational AI platform featuring HyDE retrieval (Hypothetical Document Embeddings) and a dual-memory system for persistent profile factual grounding.",
    techStack: ["Django REST", "React", "PostgreSQL", "ChromaDB", "Ollama", "Gemini API"],
    problem: "Standard LLMs hallucinate on complex candidate context across extended conversations.",
    outcome: "Zero hallucinations on profile inquiries with grounded citation verification.",
  },
  {
    id: "anomaly-detection",
    name: "Real-Time Video Anomaly Detection",
    tagline: "Live IP Camera Video Processing & Twilio SMS",
    category: "Computer Vision",
    github: "Anamoly-Detection",
    description:
      "Continuous IP camera video stream ingestion pipeline with 16-frame temporal sequence analysis and automated Twilio alert dispatch.",
    techStack: ["Python", "TensorFlow", "OpenCV", "Twilio API", "Multithreading"],
    problem: "Offline detection lacks urgency; real-time streaming requires sub-2s alert latency.",
    outcome: "Sub-2 second alert delivery with automatic anomalous frame snapshot archival.",
  },
  {
    id: "interview-ai",
    name: "Interview AI",
    tagline: "Interactive Technical Mock Interview Simulator",
    category: "Full-Stack AI",
    github: "Interview-AI",
    description:
      "Full-stack simulation platform providing structured technical & behavioral interviews with instant rubric scoring and progress analytics.",
    techStack: ["Next.js 14", "Prisma", "PostgreSQL", "ShadCN UI", "WebSockets"],
    problem: "Candidates lack repeatable, realistic technical mock interview environments.",
    outcome: "Structured candidate practice with quantitative scorecards.",
  },
  {
    id: "employee-summary",
    name: "Employee Summary Generator",
    tagline: "Enterprise Relational Data to LLaMA 3.2 Summaries",
    category: "LLM Backend",
    github: null,
    description:
      "Async FastAPI service transforming structured relational employee records into grounded natural language executive reports via local LLaMA 3.2.",
    techStack: ["FastAPI", "Python", "LLaMA 3.2", "PostgreSQL", "Pydantic"],
    problem: "Relational database tables are difficult to digest quickly without structured summarization.",
    outcome: "Automated executive summary generation with zero database hallucination.",
  },
  {
    id: "code-collab",
    name: "Code Collaboration Platform",
    tagline: "Real-Time Multi-User Code Editor",
    category: "Distributed Web",
    github: "code-collab",
    description:
      "Collaborative coding environment supporting live document synchronization, remote user cursors, and syntax-highlighted code execution.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "WebSockets", "Redis"],
    problem: "Concurrent code editing causes race conditions without granular delta synchronization.",
    outcome: "Multi-developer pair programming with sub-50ms sync latency.",
  },
  {
    id: "finance-advisor",
    name: "Finance Advisor",
    tagline: "Personal Finance Management & Budget Visualizer",
    category: "Full-Stack Utility",
    github: "chitragupt-a-finance-advisor",
    description:
      "Personal finance tracking tool with dynamic cash-flow analytics, category spending forecasting, and visual expense breakdown charts.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Recharts"],
    problem: "Extracting actionable spending patterns from static transaction logs is tedious.",
    outcome: "Interactive cash-flow forecasting and budget threshold alerting.",
  },
];

// ── CONNECTED VERTICAL TIMELINE FOR WORK HISTORY ──
const WORK_TIMELINE = [
  {
    id: "polygon",
    role: "Full Stack Developer (Backend, Geospatial & 3D Systems)",
    company: "Polygon",
    location: "Hyderabad, India",
    duration: "Present",
    badge: "Active Role · Core Systems",
    status: "active",
    summary:
      "Engineering core geospatial platforms, real-time map visualization, 3D terrain viewers, and spatial database pipelines. Built decoupled architectures separating static spatial geometry from rapid business updates.",
    deliverables: [
      "PlotView: Token-free MapLibre + PostGIS + Socket.IO vector engine handling 150K+ plots.",
      "Giro3D / Topo360: 3D WebGL terrain viewer with real-time volumetric cuboid clipping.",
      "BIM Viewer & PostGIS Infra: 3D glTF building viewer & spatial DB migration strategy.",
    ],
  },
  {
    id: "facteye",
    role: "SDE Intern",
    company: "FactEye Tech Labs Pvt. Ltd.",
    location: "Hyderabad, India",
    duration: "21 Oct 2025 – 20 Feb 2026",
    badge: "Completed",
    status: "completed",
    summary:
      "Worked under the direct guidance of Ashish Kumar Sahoo, Co-Founder & CTO, collaborating on production-level features and agile product delivery.",
    deliverables: [
      "Hands-on exposure to scalable product development and team engineering workflows.",
      "Shipped robust, testable software features in a structured production pipeline.",
    ],
  },
  {
    id: "education",
    role: "Graduated B.Tech in Computer Science & Business Systems (CSBS)",
    company: "VNR VJIET",
    location: "Hyderabad, India",
    duration: "2022 – 2026",
    badge: "8.37 CGPA",
    status: "completed",
    summary:
      "Graduated with strong foundations in distributed computing, data structures, relational database systems, and algorithm analysis.",
    deliverables: [
      "1st Place Winner at Webathon 2.0 (2024) & Webathon 3.0 (2025).",
      "Organized a National Level Hackathon at VNR VJIET.",
    ],
  },
];

const ENGINEERING_PRINCIPLES = [
  {
    icon: <Workflow size={20} className="text-cyan-400" />,
    title: "Architecture Before Implementation",
    description:
      "Define spatial coordinate projections, data contracts, and memory bounds before writing code to prevent costly refactors.",
  },
  {
    icon: <Radio size={20} className="text-emerald-400" />,
    title: "Separate Data Responsibilities",
    description:
      "Static geospatial geometry stays cached and hardware-accelerated, while dynamic business states stream over lightweight delta protocols.",
  },
  {
    icon: <Activity size={20} className="text-amber-400" />,
    title: "Design for Real-World Scale",
    description:
      "Architect systems around burst traffic (1,000 req/s launches), dual coordinate spaces to cure GPU float jitter, and sub-second caching.",
  },
  {
    icon: <Shield size={20} className="text-indigo-400" />,
    title: "Pragmatic Open Standards",
    description:
      "Zero proprietary token lock-in: adopt 100% open standards (MapLibre GL JS, Giro3D, Three.js, PostGIS, COGs) tailored to exact constraints.",
  },
];

function PortfolioExperience({
  onOpenChat,
  onProjectClick,
  onRoleFitChange,
  onToggleRecruiterMode,
  portfolio,
  projectInfo,
  recruiterMode,
  roleFit,
}) {
  const [activePolygonIndex, setActivePolygonIndex] = useState(0);
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
  const [caseStudyModal, setCaseStudyModal] = useState(null);
  const [quickCopilotHover, setQuickCopilotHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const heroRef = useRef(null);

  const activePolygonProject = POLYGON_SYSTEMS[activePolygonIndex];
  const activeSnippet = HERO_SYSTEM_SNIPPETS[activeSnippetIndex];

  // ── Keyboard shortcut Ctrl+K / Cmd+K to open AI Copilot ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChat]);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleSelectPolygon = (index) => {
    setActivePolygonIndex(index);
    setSelectedNodeIndex(null);
    if (POLYGON_SYSTEMS[index]?.name) {
      onProjectClick?.(POLYGON_SYSTEMS[index].name);
    }
  };

  const handleOpenCaseStudy = (project) => {
    setCaseStudyModal(project);
    if (project?.name) {
      onProjectClick?.(project.name);
    }
  };

  const resumeDownloadUrl =
    import.meta.env.VITE_CANDIDATE_RESUME_URL || "/api/portfolio/candidate-resume/";

  return (
    <div className="engineer-portfolio min-h-screen bg-[#070709] text-[#ededef] font-sans selection:bg-[#f3f3f5] selection:text-[#0a0a0c]">
      
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070709]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#hero" className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight text-white transition hover:opacity-80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-sm text-[#e2e2e6] border border-white/10">
              HK
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span>Harshith Reddy Karra</span>
              <span className="text-xs font-mono text-cyan-400 font-normal hidden md:inline">
                · Polygon
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9d9da4]">
            <a href="#polygon-systems" className="transition hover:text-white flex items-center gap-1.5">
              <Building2 size={14} className="text-cyan-400" />
              Polygon Systems
            </a>
            <a href="#independent-work" className="transition hover:text-white flex items-center gap-1.5">
              <Code2 size={14} className="text-indigo-400" />
              Independent Projects
            </a>
            <a href="#dsa" className="transition hover:text-white flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" />
              DSA (Top 6.59%)
            </a>
            <a href="#experience" className="transition hover:text-white">Experience</a>
            <a href="#skills" className="transition hover:text-white">Technologies</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={resumeDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-medium text-[#f0f0f3] transition hover:bg-white/10 hover:border-white/25"
            >
              <Download size={13} />
              <span>Resume</span>
            </a>

            <button
              onClick={onOpenChat}
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-[#e4e4e7] hover:scale-105 active:scale-95"
            >
              <Sparkles size={13} />
              <span>Ask Copilot</span>
              <kbd className="hidden sm:inline-block rounded bg-black/10 px-1.5 py-0.5 text-[9px] font-mono text-neutral-800">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Live System Console & Cursor Aura ── */}
      <section
        id="hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden border-b border-white/[0.06] py-20 md:py-28"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.055), transparent 70%), #070709`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            
            {/* Hero Left Column */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Full Stack Developer @ Polygon · Backend, Geospatial & 3D Systems</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:leading-[1.1]"
              >
                Building production systems across{" "}
                <span className="bg-gradient-to-r from-white via-[#dcdce0] to-[#8d8d94] bg-clip-text text-transparent">
                  backend, GIS & 3D data.
                </span>
              </motion.h1>

              {/* Comprehensive Professional Bio */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-2xl text-base leading-relaxed text-[#a5a5ad] sm:text-lg"
              >
                I am <strong className="text-white font-medium">Harshith Reddy Karra</strong>, a Full Stack Developer at <strong className="text-white font-medium">Polygon</strong> specializing in scalable backend architecture, geospatial visualization (GIS), 3D applications, BIM viewers, and spatial data infrastructure. With a solid competitive programming foundation (<strong className="text-white font-medium">Top 6.59% LeetCode</strong>, 1,852 contest rating), I engineer high-performance systems from PostGIS vector pipelines to real-time WebGL engines.
              </motion.p>

              {/* Minimalist Focus Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.25 }}
                className="mt-6 flex flex-wrap gap-2 font-mono text-xs text-[#8c8c94]"
              >
                {["Backend", "GIS", "3D", "BIM", "MapLibre", "Giro3D", "PostgreSQL", "PostGIS", "Redis", "AWS", "AI / RAG"].map((tag) => (
                  <span key={tag} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#dcdce0]">
                    {tag}
                  </span>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <a
                  href="#polygon-systems"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black shadow-md shadow-white/10 transition hover:bg-[#e4e4e7] hover:translate-y-[-1px]"
                >
                  <Building2 size={16} />
                  <span>Explore Polygon Systems</span>
                  <ArrowDown size={16} />
                </a>

                <a
                  href="#independent-work"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 hover:border-white/30"
                >
                  <Code2 size={16} className="text-indigo-400" />
                  <span>Independent Projects</span>
                </a>

                <a
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-[#b0b0b8] transition hover:bg-white/10 hover:text-white"
                >
                  <Download size={16} />
                  <span>Resume</span>
                </a>
              </motion.div>

              {/* Proof Counters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.4 }}
                className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.08]"
              >
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="text-xl font-bold text-white">Top 6.59%</div>
                  <div className="text-xs text-[#8e8e96] mt-0.5">LeetCode (1852 Rating)</div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="text-xl font-bold text-cyan-300">Polygon</div>
                  <div className="text-xs text-[#8e8e96] mt-0.5">Full Stack Developer</div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="text-xl font-bold text-white">150K+</div>
                  <div className="text-xs text-[#8e8e96] mt-0.5">Spatial Plots Handled</div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="text-xl font-bold text-white">8.37 CGPA</div>
                  <div className="text-xs text-[#8e8e96] mt-0.5">VNR VJIET (CSBS)</div>
                </div>
              </motion.div>
            </div>

            {/* Hero Right Column: Interactive Live System Console */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="rounded-3xl border border-white/[0.12] bg-[#0d0d12] p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-xs text-[#8c8c94] ml-2">
                    {activeSnippet.filename}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  Live System Code
                </span>
              </div>

              {/* Snippet Tabs */}
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                {HERO_SYSTEM_SNIPPETS.map((snip, idx) => (
                  <button
                    key={snip.id}
                    onClick={() => setActiveSnippetIndex(idx)}
                    type="button"
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition ${
                      activeSnippetIndex === idx
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-[#71717a] hover:text-white"
                    }`}
                  >
                    {snip.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="mt-3 overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#07070a] p-4 font-mono text-xs leading-relaxed text-[#c4c4cc]">
                <pre className="text-[11px]">{activeSnippet.code}</pre>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#71717a] font-mono">
                  Production architecture verified
                </span>
                <button
                  onClick={() => handleOpenCaseStudy(POLYGON_SYSTEMS[0])}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-white transition"
                >
                  <span>Explore PlotView Blueprint</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── PART 1: PRODUCTION SYSTEMS @ POLYGON (WITH INTERACTIVE ARCHITECTURE FLOW) ── */}
      <section id="polygon-systems" className="py-20 border-b border-white/[0.06] bg-[#08080c]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
                <Building2 size={14} />
                <span>Part 01</span>
                <span>/</span>
                <span>Production Systems @ Polygon (Startup)</span>
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Core Systems Engineered at Polygon
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#9e9ea6]">
              Real-world systems engineered with live databases (PostGIS, AWS), real user traffic, and custom WebGL visualization pipelines.
            </p>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            
            {/* Left Column: Selectable Polygon Systems */}
            <div className="space-y-3.5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#71717a] px-2 flex items-center justify-between">
                <span>Select Production System</span>
                <span className="text-cyan-400">4 Systems</span>
              </div>
              {POLYGON_SYSTEMS.map((project, idx) => {
                const isSelected = idx === activePolygonIndex;
                return (
                  <motion.button
                    key={project.id}
                    onClick={() => handleSelectPolygon(idx)}
                    type="button"
                    whileHover={{ x: 4 }}
                    className={`group flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-cyan-500/50 bg-cyan-500/[0.08] shadow-2xl"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono text-xs ${isSelected ? "text-cyan-300 font-bold" : "text-[#71717a]"}`}>
                          {project.number}
                        </span>
                        <h3 className={`text-lg font-bold truncate ${isSelected ? "text-white" : "text-[#dcdce0] group-hover:text-white"}`}>
                          {project.name}
                        </h3>
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300 hidden sm:inline">
                          {project.badge}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#8c8c94] line-clamp-1">
                        {project.tagline}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span key={tech} className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[#a0a0a8]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`shrink-0 transition ${isSelected ? "text-cyan-400 translate-x-1" : "text-[#52525b] group-hover:text-white"}`}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Right Column: Active Polygon System Detail */}
            {activePolygonProject && (
              <motion.article
                key={activePolygonProject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-24 rounded-3xl border border-white/[0.12] bg-[#0e0e14] p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 font-mono text-xs font-bold text-cyan-300">
                      {activePolygonProject.number}
                    </span>
                    <span className="font-mono text-xs text-[#9e9ea6] uppercase">Polygon Production System</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-medium">Active Deployment</span>
                </div>

                <h3 className="mt-5 text-3xl font-extrabold text-white">
                  {activePolygonProject.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-cyan-300">
                  {activePolygonProject.tagline}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-[#b0b0b8]">
                  {activePolygonProject.description}
                </p>

                {/* Scale Stats Grid */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activePolygonProject.scaleStats.map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                      <div className="text-base font-bold text-white">{stat.value}</div>
                      <div className="text-[10px] font-mono text-[#8c8c94] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Interactive Animated Node Flow */}
                {activePolygonProject.nodes && (
                  <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-4">
                    <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Workflow size={13} />
                        <span>Interactive Data Pipeline Flow</span>
                      </span>
                      <span className="text-[10px] text-[#71717a]">Click node to inspect</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {activePolygonProject.nodes.map((node, nIdx) => {
                        const isNodeSelected = selectedNodeIndex === nIdx;
                        return (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNodeIndex(isNodeSelected ? null : nIdx)}
                            type="button"
                            className={`rounded-xl p-2.5 text-left border transition ${
                              isNodeSelected
                                ? "border-cyan-400 bg-cyan-400/20 text-white"
                                : "border-white/[0.08] bg-white/[0.02] text-[#b0b0b8] hover:border-white/20"
                            }`}
                          >
                            <div className="font-mono text-[11px] font-bold text-white truncate">{node.label}</div>
                            <div className="text-[10px] text-[#8c8c94] truncate mt-0.5">{node.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* The Problem */}
                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-1">
                    The Engineering Challenge:
                  </div>
                  <p className="text-xs leading-relaxed text-[#c4c4cc]">
                    {activePolygonProject.problem}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex items-center gap-3 pt-6 border-t border-white/[0.08]">
                  <button
                    onClick={() => handleOpenCaseStudy(activePolygonProject)}
                    type="button"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-bold text-black transition hover:bg-[#e4e4e7]"
                  >
                    <span>Read Full Architecture Case Study</span>
                    <ArrowUpRight size={15} />
                  </button>

                  <button
                    onClick={onOpenChat}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    <MessageSquare size={14} />
                    <span>Ask in Chat</span>
                  </button>
                </div>
              </motion.article>
            )}

          </div>

        </div>
      </section>

      {/* ── PART 2: INDEPENDENT & OPEN-SOURCE PROJECTS (GITHUB BUILDS) ── */}
      <section id="independent-work" className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-indigo-400">
                <Code2 size={14} />
                <span>Part 02</span>
                <span>/</span>
                <span>Independent & AI Projects</span>
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Open-Source Systems & AI Exploration
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#9e9ea6]">
              Independent projects demonstrating full-stack versatility, conversational AI retrieval (HyDE RAG), real-time computer vision, and pair-programming infrastructure.
            </p>
          </div>

          {/* 3-Column Interactive Grid */}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {INDEPENDENT_PROJECTS.map((proj, idx) => (
              <motion.div
                key={proj.id}
                whileHover={{ y: -4 }}
                className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 transition hover:border-white/20 hover:bg-[#0e0e15]"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="font-mono text-xs text-[#71717a]">0{idx + 1}</span>
                    <span className="rounded-full bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 text-[10px] font-mono text-[#c4c4cc]">
                      {proj.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-300 transition">
                    {proj.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#8e8e96]">
                    {proj.tagline}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#a5a5ad]">
                    {proj.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {proj.techStack.map((tech) => (
                      <span key={tech} className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[#9e9ea6]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  {proj.github ? (
                    <a
                      href={`https://github.com/harshith2405/${proj.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition hover:text-cyan-300"
                    >
                      <Github size={14} />
                      <span>Code Repository</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-[#71717a]">API Service</span>
                  )}

                  <button
                    onClick={onOpenChat}
                    type="button"
                    className="text-xs text-[#8c8c94] hover:text-white transition inline-flex items-center gap-1"
                  >
                    <MessageSquare size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 2: ENGINEERING PRINCIPLES (HOW I APPROACH PROBLEMS) ── */}
      <section id="principles" className="py-20 border-b border-white/[0.06] bg-[#09090d]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="pb-12 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#9d9da6]">
              <span>03</span>
              <span>/</span>
              <span>Methodology</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How I Approach Engineering Problems
            </h2>
            <p className="mt-2 text-sm text-[#9e9ea6]">
              Core architectural tenets applied across geospatial systems, 3D WebGL renderers, and backend services.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ENGINEERING_PRINCIPLES.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#0e0e14] p-6 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10">
                    {item.icon}
                  </div>
                  <span className="font-mono text-xs text-[#71717a]">0{idx + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#9e9ea6]">{item.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: COMPETITIVE PROGRAMMING & DSA SHOWCASE ── */}
      <section id="dsa" className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-12 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#9d9da6]">
                <span>04</span>
                <span>/</span>
                <span>Algorithmic Depth</span>
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Competitive Programming & Problem Solving
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://leetcode.com/u/karra_harshithr1/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
              >
                <span>LeetCode Profile</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://www.hackerrank.com/profile/karra_harshithr1"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <span>HackerRank 5⭐</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-6">
              <div className="flex items-center justify-between text-amber-400">
                <Trophy size={24} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">LeetCode</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-white">Top 6.59%</div>
              <p className="mt-1 text-xs text-[#a0a0a8]">Global leaderboard percentile</p>
              <div className="mt-4 text-xs font-mono text-amber-300">Verified Ranking</div>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between text-cyan-400">
                <Zap size={24} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Contest Rating</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-white">1,852 ↗</div>
              <p className="mt-1 text-xs text-[#a0a0a8]">Weekly Contest 508 (3/4 Solved)</p>
              <div className="mt-4 text-xs font-mono text-cyan-300">Active Competitor</div>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.02] p-6">
              <div className="flex items-center justify-between text-indigo-400">
                <Award size={24} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">Global Rank</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-white">#1,350</div>
              <p className="mt-1 text-xs text-[#a0a0a8]">Peak contest rank</p>
              <div className="mt-4 text-xs font-mono text-indigo-300">Competitive Performance</div>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-6">
              <div className="flex items-center justify-between text-emerald-400">
                <Code2 size={24} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">HackerRank</span>
              </div>
              <div className="mt-4 text-3xl font-extrabold text-white">5 ⭐ Stars</div>
              <p className="mt-1 text-xs text-[#a0a0a8]">Problem Solving Gold Badge</p>
              <div className="mt-4 text-xs font-mono text-emerald-300">Algorithms & Data Structures</div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 4: CONNECTED VERTICAL TIMELINE FOR WORK HISTORY ── */}
      <section id="experience" className="py-20 border-b border-white/[0.06] bg-[#09090d]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="pb-12 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#9d9da6]">
              <span>05</span>
              <span>/</span>
              <span>Career Roadmap</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Professional Work & Education Timeline
            </h2>
          </div>

          <div className="mt-12 relative pl-6 sm:pl-8 border-l border-white/15 space-y-12">
            {WORK_TIMELINE.map((item, idx) => (
              <div key={item.id} className="relative group">
                
                {/* Pulsing Timeline Node Dot */}
                <span className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-[#070709] ${
                  item.status === "active"
                    ? "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                    : "border-white/40"
                }`}>
                  {item.status === "active" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </span>

                <div className="rounded-3xl border border-white/[0.08] bg-[#0e0e14] p-7 transition hover:border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{item.role}</h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mt-1">
                        <span>{item.company}</span>
                        <span>·</span>
                        <span className="text-[#8c8c94]">{item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#8c8c94]">{item.duration}</span>
                      <span className="rounded-full bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 text-[10px] font-mono text-[#c4c4cc]">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[#b5b5be]">
                    {item.summary}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {item.deliverables.map((del, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-[#9d9da6]">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 5: TECHNOLOGIES & TECHNICAL RANGE ── */}
      <section id="skills" className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="pb-12 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#9d9da6]">
              <span>06</span>
              <span>/</span>
              <span>Tooling</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Technologies & Spatial Stack
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Server size={16} className="text-cyan-400" />
                <span>Backend & APIs</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#c8c8cf]">
                {["Node.js", "Express", "Socket.IO", "Python", "FastAPI", "Django REST", "REST APIs"].map((s) => (
                  <span key={s} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Compass size={16} className="text-emerald-400" />
                <span>Geospatial (GIS)</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#c8c8cf]">
                {["MapLibre GL JS", "PostGIS", "GeoJSON", "Vector Tiles", "ST_AsGeoJSON", "ST_Split", "Giro3D", "COGs"].map((s) => (
                  <span key={s} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Box size={16} className="text-indigo-400" />
                <span>3D & BIM</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#c8c8cf]">
                {["Three.js", "glTF / GLB", "WebGL", "3D Volumetric Clipping", "Contours", "Terrain DEM", "SVG HUD"].map((s) => (
                  <span key={s} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Database size={16} className="text-amber-400" />
                <span>Databases & Cloud</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-[#c8c8cf]">
                {["PostgreSQL", "PostGIS", "Redis", "AWS S3", "AWS Aurora", "MySQL", "Docker", "Git"].map((s) => (
                  <span key={s} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 6: RECRUITER SUMMARY & CONTACT ── */}
      <section id="recruiter" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="pb-12 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#9d9da6]">
              <span>07</span>
              <span>/</span>
              <span>Fast-Read Summary</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Recruiter Quick Brief
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e13] p-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#71717a]">Academic & Competitive Proof</h3>
              <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#c4c4cc]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>B.Tech CSBS Graduate from VNR VJIET (8.37 CGPA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>LeetCode Top 6.59% (1,852 Active Contest Rating)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>1st Place Winner at Webathon 2.0 & Webathon 3.0</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e13] p-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#71717a]">Why Hire Harshith</h3>
              <p className="mt-4 text-xs leading-relaxed text-[#c4c4cc]">
                A full-stack engineer with rare specialized expertise across scalable backend APIs, GIS mapping (MapLibre, PostGIS), 3D WebGL viewers (Giro3D, Three.js), and competitive algorithmic problem solving.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e13] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#71717a]">Connect & Resume</h3>
                <p className="mt-2 text-xs text-[#9d9da4]">Download official resume snapshot or test technical questions with the AI copilot.</p>
              </div>

              <div className="mt-6 space-y-2">
                <a
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-black transition hover:bg-[#e4e4e7]"
                >
                  <Download size={14} />
                  <span>Download Resume PDF</span>
                </a>
                <button
                  onClick={onOpenChat}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
                >
                  <MessageSquare size={14} />
                  <span>Ask Recruiter Q&A</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] py-10 bg-[#050507]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
          <div>
            © {new Date().getFullYear()} Harshith Reddy Karra · Full Stack Developer @ Polygon
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/harshith2405" target="_blank" rel="noreferrer" className="hover:text-white transition">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/harshith-reddy-karra-88ab4a1b3/" target="_blank" rel="noreferrer" className="hover:text-white transition">
              LinkedIn
            </a>
            <a href="https://leetcode.com/u/karra_harshithr1/" target="_blank" rel="noreferrer" className="hover:text-white transition">
              LeetCode (Top 6.59%)
            </a>
            <a href="mailto:karra.harshithreddy@gmail.com" className="hover:text-white transition">
              Email
            </a>
          </div>
        </div>
      </footer>

      {/* ── Centered Full-Screen Architecture Case Study Modal ── */}
      <AnimatePresence>
        {caseStudyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCaseStudyModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/[0.14] bg-[#0c0c12] p-8 sm:p-10 shadow-2xl"
            >
              <button
                onClick={() => setCaseStudyModal(null)}
                type="button"
                className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[#9e9ea6] transition hover:bg-white hover:text-black"
                aria-label="Close Modal"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-wider">
                <Layers size={14} />
                <span>Architecture Blueprint · Case Study {caseStudyModal.number}</span>
              </div>

              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
                {caseStudyModal.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {caseStudyModal.tagline}
              </p>

              {/* Scale Stats Pills */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {caseStudyModal.scaleStats.map((stat, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <div className="text-base font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] font-mono text-[#8c8c94] mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-6 border-t border-white/[0.08] pt-6 text-sm text-[#b8b8c2]">
                
                {/* 1. Overview */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#71717a] mb-2">Overview</h4>
                  <p className="leading-relaxed">{caseStudyModal.description}</p>
                </div>

                {/* 2. The Problem */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 mb-2">The Engineering Problem</h4>
                  <p className="text-xs leading-relaxed text-[#c4c4cc]">{caseStudyModal.problem}</p>
                </div>

                {/* 3. Architecture Breakdown Flow */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-3">Architectural Data Pipeline</h4>
                  <div className="space-y-3">
                    {caseStudyModal.architectureSteps.map((step, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-[#121218] p-3.5">
                        <div className="font-mono text-xs font-bold text-white mb-1">{step.step}</div>
                        <p className="text-xs text-[#9d9da6] leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. What I Worked On / Contributions */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#71717a] mb-2">Key Engineering Deliverables</h4>
                  <ul className="space-y-2">
                    {caseStudyModal.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                        <span className="text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Measured Outcome */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-300 mb-1">Measured Outcome & Impact</h4>
                  <p className="text-xs text-[#e4e4e7] leading-relaxed">{caseStudyModal.outcome}</p>
                </div>

              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-6">
                {caseStudyModal.github ? (
                  <a
                    href={`https://github.com/harshith2405/${caseStudyModal.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:bg-[#e4e4e7]"
                  >
                    <Github size={15} />
                    <span>View Repository ({caseStudyModal.github})</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setCaseStudyModal(null);
                      onOpenChat();
                    }}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:bg-[#e4e4e7]"
                  >
                    <MessageSquare size={14} />
                    <span>Discuss This System With AI Copilot</span>
                  </button>
                )}

                <button
                  onClick={() => setCaseStudyModal(null)}
                  type="button"
                  className="text-xs text-[#8c8c94] hover:text-white transition font-mono"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Floating AI Copilot Trigger Pill with Hover Popout ── */}
      <aside aria-label="Interactive guide" className="fixed bottom-6 right-6 z-30">
        <div
          onMouseEnter={() => setQuickCopilotHover(true)}
          onMouseLeave={() => setQuickCopilotHover(false)}
          className="relative"
        >
          {/* Quick Click Prompts Popout */}
          <AnimatePresence>
            {quickCopilotHover && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-14 right-0 w-64 rounded-2xl border border-white/[0.14] bg-[#0e0e14] p-3 shadow-2xl backdrop-blur-xl"
              >
                <div className="text-[10px] font-mono uppercase text-[#71717a] mb-2 px-1">
                  Quick Questions for Copilot
                </div>
                <div className="space-y-1">
                  {[
                    "What did you engineer at Polygon?",
                    "How does PlotView handle 150K plots?",
                    "Why hire Harshith?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => onOpenChat()}
                      type="button"
                      className="w-full rounded-lg p-2 text-left text-xs text-[#c4c4cc] hover:bg-white/10 hover:text-white transition truncate block"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={onOpenChat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            className="flex items-center gap-3 rounded-full border border-white/20 bg-[#121217]/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl transition hover:border-white/40"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Ask Harshith's Copilot</span>
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[#a0a0a8]">
              ⌘K
            </kbd>
          </motion.button>
        </div>
      </aside>

    </div>
  );
}

export default PortfolioExperience;
