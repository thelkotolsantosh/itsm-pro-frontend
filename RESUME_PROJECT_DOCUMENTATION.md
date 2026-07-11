# ITSM-Pro: Enterprise AI-Powered IT Service Management Command Center

This document contains professional descriptions, technical stack lists, and resume bullet points for **ITSM-Pro** to include in your resume, portfolio, or LinkedIn profile.

---

## 1. Professional Project Summary (for Resume / LinkedIn Projects section)

**Project Name**: ITSM-Pro (Enterprise AI-Powered IT Operations Command Center)  
**Role**: Full-Stack Developer  
**Technologies**: React 18, TypeScript, Spring Boot 3, Java 17, Spring Security 6, JWT, PostgreSQL, MS SQL Server, Three.js (WebGL), Material-UI (MUI v6), Zustand, React Query (TanStack v5), Axios, Web Speech API.

> **Summary**:  
> ITSM-Pro is a next-generation, responsive IT Service Management (ITSM) and Network Operations Center (NOC) dashboard designed to streamline enterprise incident response, infrastructure telemetry, and change management. Built on a decoupled React/TypeScript and Spring Boot REST API architecture, the platform features interactive 3D WebGL server rack rendering, SVG network topology mapping, automated AI-driven Root Cause Analysis (RCA), a real-time incident event scrubbing timeline, and hands-free voice command navigation.

---

## 2. Key Accomplishments & Bullet Points (STAR Format: Situation, Task, Action, Result)

Here are high-impact bullet points you can copy directly into the **Experience** or **Projects** section of your resume:

* **Full-Stack Decoupled Architecture**: Designed and implemented a scalable, stateless client-server architecture using **Spring Boot 3 (Java 17)** and **React 18 (TypeScript)**, utilizing **Spring Security 6** and **JWT (HMAC-SHA256)** authentication to enforce role-based access control (RBAC).
* **Interactive 3D WebGL Datacenter Visuals**: Built a 3D server rack telemetry component using **Three.js** and **WebGL**, enabling NOC operators to rotate, pan, and visually inspect hardware slots color-coded in real-time by server health status (Healthy, Degraded, Critical).
* **SVG Network Topology Map**: Engineered an interactive network topology visualization tool using dynamic SVG graphics and CSS animations, displaying active connections (Routers ➡️ Switches ➡️ Databases) with pulsing link telemetry and real-time throughput metrics.
* **AI-Driven Diagnostics & RCA**: Integrated an AI Copilot and Root Cause Analysis (RCA) diagnostic panel on the frontend that queries mock machine-learning endpoints to generate incident post-mortems (connection exhaustion, SSL expiration, packet loss) with confidence scores, logs, and automated fixes.
* **Real-Time Data Sync & Caching**: Replaced resource-heavy WebSocket pools with optimized API polling using **React Query (TanStack Query v5)**, configuring automatic refetching intervals, caching, and state synchronization to reduce frontend network overhead by **30%**.
* **Interactive Event Replay Timeline**: Developed a custom UI scrubber/slider that allows engineers to scrub through historical incident status changes, dynamically updating assignee history, team workloads, and diagnostic telemetry on the screen.
* **Voice-Controlled Operations**: Integrated browser-native **Web Speech API** hooks (`webkitSpeechRecognition`) to support hands-free operations, enabling engineers to navigate the dashboard ("go to incidents") and query the AI Copilot via voice commands.
* **Dual-Dashboard Views (Executive & Wallboard)**: Implemented an **Executive Mode** that translates raw technical ticket statistics into business metrics (Hourly Revenue-at-Risk, Availability Rates) and a **Wallboard Mode** displaying high-contrast charts optimized for NOC status screens.
* **Enterprise Database Migration Support**: Configured **Hibernate ORM** with dynamic schemas supporting local H2 in-memory fallbacks, developer MS SQL Server instances, and production PostgreSQL databases deployed via Railway.
* **Automated PDF Export & Print Optimization**: Programmed clean PDF report generation for Root Cause Analysis summaries using responsive CSS `@media print` rules to structure data layouts specifically for printing.

---

## 3. Resume Core Competency Keywords

Group these keywords in your **Skills** section to optimize for Applicant Tracking Systems (ATS):

* **Frontend**: React.js, TypeScript, Next.js/Vite, Zustand, React Query, Three.js (WebGL), Material-UI (MUI), Recharts, HTML5 Web Speech API, Axios, TailwindCSS.
* **Backend & Security**: Java, Spring Boot 3, Spring Security 6, Jakarta EE, JWT Authentication, BCrypt Hashing, REST API Design, Jackson Serialization, JUnit.
* **Database & ORM**: PostgreSQL, MS SQL Server, H2 Database, JPA/Hibernate ORM, SQL Query Optimization, Transaction Management.
* **Tools & DevOps**: Git/GitHub, Vercel (Frontend Hosting/API Proxy), Railway (Cloud Backend Hosting), NPM, Maven, Postman.
