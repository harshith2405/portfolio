# Portfolio Chatbot Context

This file is the fixed memory for the recruiter-facing chatbot.
Every reply should use this information as the primary source of truth.
If a detail is missing here, the chatbot should say it does not have that information yet instead of inventing it.

## Candidate Basics
- Name: Harshith Reddy Karra
- Role: Full Stack Developer | Geospatial, 3D & Backend Systems Engineer
- Company: Polygon
- Location: Hyderabad, India
- Education: Graduated B.Tech in Computer Science and Business Systems (CSBS) from VNR VJIET (CGPA: 8.37)
- 10th: 10 GPA - Narayana High School
- Inter: 943 - Sri Chaitanya College

## Short Bio
I am a Full Stack Developer at Polygon, specializing in backend engineering, geospatial visualization (GIS), 3D web applications, and spatial data infrastructure. I build production software across scalable APIs, MapLibre GL JS vector pipelines, 3D terrain rendering with Giro3D, browser-based BIM visualization with Three.js, and PostgreSQL/PostGIS spatial databases. I also engineer standalone AI and distributed applications including HyDE RAG conversational chatbots, real-time video anomaly detection systems, and full-stack platforms. I hold a solid foundation in Data Structures and Algorithms (Top 6.59% globally on LeetCode with an active contest rating of 1,852, #1350 Peak Global Rank).

## Skills & Systems
- Backend & Real-Time: Node.js, Express, Socket.IO, REST APIs, Python, FastAPI, Django REST Framework
- Geospatial (GIS) & 3D: MapLibre GL JS, Giro3D, Three.js, glTF / GLB, Cloud-Optimized GeoTIFFs (COGs), Digital Surface Models (DSM), Vector Tiles, GeoJSON, PostGIS, ST_AsGeoJSON, ST_Split, ST_Intersects, 3D Volumetric Clipping, Contours & Terrain Draping, Dual CRS (EPSG:3395 & Local)
- Databases & Caching: PostgreSQL, PostGIS, Redis, MySQL, MongoDB
- Infrastructure & Cloud: AWS S3, AWS Aurora PostgreSQL, Docker, Linux, Git, GitHub
- Languages: JavaScript/TypeScript, Python, C++, Java, SQL

### DSA & Problem Solving (Highlighted)
- Top 6.59% globally on LeetCode (Active Contest Rating: 1,852)
- Peak contest rating: 1,852 (Weekly Contest 508 - 3/4 solved)
- Peak rank: 1,350 globally
- 5⭐ in Problem Solving on HackerRank

## Work Experience

- Company: Polygon
  Role: Full Stack Developer (Backend, Geospatial & 3D Systems)
  Location: Hyderabad, India
  Context & Responsibilities:
  - Engineering core geospatial platforms, real-time map visualization, 3D GIS terrain viewers, BIM web applications, and spatial database pipelines.
  - Designing decoupled architectures separating heavy geospatial geometries from fast-changing business state.
  - Key systems delivered: PlotView, Giro3D / Topo360, BIM Viewer, and PostGIS Spatial Infrastructure.

- Company: FactEye Tech Labs Pvt. Ltd.
  Role: SDE Intern
  Duration: 21 Oct 2025 – 20 Feb 2026
  Context:
  - Worked under the direct guidance of Ashish Kumar Sahoo, Co-Founder & CTO.
  Experience:
  - Hands-on exposure to scalable product development, agile delivery, and production system debugging.

## Flagship Systems & Production Case Studies (Polygon)

### 01 · PlotView (Large-Scale Property & Geospatial Visualization Platform)
- Overview:
  Interactive mapping platform for visualizing, searching, and managing real-estate plots across large project datasets.
- Scale:
  Designed to handle 5,000+ plots per project, 150,000+ total plots across databases, and peak event traffic bursts (~1,000 req/s design consideration).
- Architectural Highlights:
  - Zero Paid Mapbox Tokens: 100% open-source MapLibre GL JS with custom local inline JavaScript styling (LOCAL_OFFLINE_STYLE), rendering vector polygons directly on the client-side WebGL GPU canvas.
  - High-Performance Spatial Querying: PostgreSQL / PostGIS database stores geometries; Node.js backend queries them via `ST_AsGeoJSON` and delivers a GeoJSON FeatureCollection.
  - O(1) In-Memory Indexing: Frontend `PlotStateService` indexes incoming features into a high-speed RAM hash map for sub-millisecond property lookups, filtering, and selection.
  - Real-Time Delta Streaming with Socket.IO: When plot statuses change (e.g. Available -> Sold) or plots split via `ST_Split`, Socket.IO broadcasts lightweight delta packets (`{ plot_no: '33-A', status: 'Sold' }`). The frontend updates its RAM hash map and MapLibre re-colors the WebGL canvas instantly without re-fetching datasets or reloading the page.
- Tech Stack: MapLibre GL JS, PostgreSQL, PostGIS, Node.js, Express, Socket.IO, Redis, WebGL

### 02 · Giro3D / Topo360 (3D Geospatial & Terrain Visualization Engine)
- Overview:
  Browser-based 3D geospatial engine for rendering multi-resolution Cloud-Optimized GeoTIFFs (COGs), terrain surfaces, and high-precision topographic analytics.
- Architectural Highlights:
  - Dual Coordinate System: Uses Geographic CRS (`EPSG:3395` / Projected Mercator) for real-world distances and volumes, paired with a Local Three.js Scene Space centered at `instance.reference` origin offset to eliminate 32-bit GPU floating-point precision jitter when rendering large geographical extents.
  - Camera-Projected SVG HUD Layer: Projects 3D world coordinates into a 2D screen-space SVG overlay (`projectToScreen()`), completely eliminating WebGL Z-fighting and depth buffer clipping against custom terrain shaders.
  - Terrain-Draped Path Profiles: High-density 400-point sampling (0.8m resolution) with a +0.35m micro-surface lift that conforms to hills and slopes; includes dynamic elevation charts and instant PDF survey report exports.
  - 3D Cut & Fill Volumetrics: Samples digital elevation models across local grids to calculate Pit excavation (Cut) and Stockpile accumulation (Fill) against reference planes using Shoelace area formulas.
  - GPU Shaders & Overlays: Real-time GPU-rendered topographic contours (Survey 1m/5m, Mining 2m/10m presets) and slope heatmaps for haul road safety compliance (0–10°).
  - Auto-ROI & Terrain Clipping: Interactive 3D bounding box and polygon clipping via Giro3D Extents, plus KML boundary parsing.
- Tech Stack: Giro3D, Three.js, WebGL, AWS S3, Cloud-Optimized GeoTIFFs (COGs), Proj4, SVG Canvas, JavaScript/TypeScript

### 03 · BIM Viewer (Browser-Based 3D Building & Architectural Model Viewer)
- Overview:
  Interactive web-based 3D BIM viewer enabling engineers and architects to inspect building models, spatial layers, and structural components directly in the browser.
- Key Capabilities & Contribution:
  - Engineered glTF/GLB conversion workflows to optimize complex CAD/BIM models for browser rendering.
  - Built 3D model navigation, hierarchy inspection, layer toggles, and component metadata lookups.
- Tech Stack: Three.js, glTF / GLB, WebGL, Node.js, TypeScript

### 04 · Spatial Data Infrastructure (PostgreSQL / PostGIS & AWS Aurora)
- Overview:
  Architecture and migration planning for high-throughput spatial database workloads.
- Key Capabilities & Contribution:
  - Designed spatial schema with PostGIS geometry types (`ST_SetSRID`, `ST_GeomFromGeoJSON`, `ST_Intersects`, `ST_Split`, GIST indexing).
  - Evaluated and structured migration to AWS Aurora PostgreSQL, managing connection pooling, environment separation, and query optimization for spatial joins.
- Tech Stack: PostgreSQL, PostGIS, AWS Aurora, Redis, Docker

## Independent Full-Stack, AI & Systems Projects

### 05 · AI Chatbot with Memory (GitHub: chatbot)
- Overview:
  Conversational AI system utilizing HyDE-style retrieval (Hypothetical Document Embeddings) and dual-memory context layers (short-term session turns and long-term persistent profile retrieval).
- Tech Stack: Django REST Framework, React, PostgreSQL, Ollama, ChromaDB, Gemini API, OpenAI API
- Impact: Substantially reduced hallucinations on profile queries while preserving context across multi-turn interactions.

### 06 · Anomaly Detection System (GitHub: Anamoly-Detection)
- Overview:
  Real-time computer vision system that monitors live IP camera feeds for anomalous movement patterns and immediately dispatches SMS alerts.
- Tech Stack: Python, TensorFlow, OpenCV, Twilio
- Impact: Real-time frame sequence processing with zero-lag event alerting pipeline.

### 07 · Interview AI (GitHub: Interview-AI)
- Overview:
  Full-stack AI mock interview platform featuring dynamic interviewer personas, question evaluations, and persistent session scoring.
- Tech Stack: Next.js, Prisma, PostgreSQL, ShadCN UI, WebSockets
- Impact: Guided candidate simulation with instant feedback and structural performance metrics.

### 08 · Employee Summary Generator (LLaMA 3.2)
- Overview:
  API service that transforms structured relational database records into grounded natural-language summaries using local LLaMA 3.2 models.
- Tech Stack: Python, FastAPI, PostgreSQL, LLaMA 3.2
- Impact: Sanitized enterprise data access layer delivering reliable narrative summaries without hallucinations.

### 09 · Code Collaboration Platform (GitHub: code-collab)
- Overview:
  Real-time multi-user code editing platform with live cursor synchronization and collaborative execution.
- Tech Stack: MERN Stack (MongoDB, Express, React, Node.js), WebSockets, Redis
- Impact: Concurrent multi-developer synchronization with sub-50ms latency.

### 10 · Finance Advisor (GitHub: chitragupt-a-finance-advisor)
- Overview:
  Interactive personal finance management and budget forecasting utility with clean data visualization.
- Tech Stack: React, Node.js, Express, MongoDB

## Contact
- Email: karra.harshithreddy@gmail.com
- LinkedIn: https://www.linkedin.com/in/harshith-reddy-karra-88ab4a1b3/
- GitHub: harshith2405
- LeetCode: https://leetcode.com/u/karra_harshithr1/
- HackerRank: https://www.hackerrank.com/profile/karra_harshithr1
- Phone: +91 6300443436
