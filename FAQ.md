# Technical FAQs - ITSM-Pro IT Operations Command Center

This document provides a comprehensive technical FAQ reference detailing the architecture, backend configuration, database schema, frontend rendering systems, AI models, and deployment configurations of the upgraded ITSM-Pro application.

---

## Section 1: Architecture & Design Patterns

### Q1: What architectural pattern does the overall application stack implement?
The application implements a decoupled client-server architecture with a React-TypeScript Single Page Application (SPA) frontend and a Spring Boot REST API backend.

### Q2: How is session state managed across the application?
Session state is stateless on the server, using JWT (JSON Web Tokens) for authentication. The frontend maintains token state in memory and session storage using Zustand.

### Q3: Why was Zustand chosen over Redux for frontend state management?
Zustand is lighter, has less boilerplate, and uses clean hooks that integrate seamlessly with React's concurrency features without requiring context providers.

### Q4: How is data fetching managed on the frontend?
It is managed using React Query (TanStack Query v5), which automates cache management, refetching on window focus, loading/error states, and request duplication.

### Q5: How are security permissions structured on the backend?
Security is handled via Spring Security 6, leveraging a filter chain that intercepts requests, validates JWT tokens, and grants role-based access control (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_USER`).

### Q6: How does the application avoid circular dependency problems on Jackson serialization?
It uses `@JsonBackReference` and `@JsonManagedReference` on relational JPA model properties, such as between `ChangeRequest` and `Approval` entities.

### Q7: What strategy is used to handle cross-origin requests (CORS)?
CORS is handled via a configured filter or reverse proxy routing (e.g. Vercel rewrites or Vite dev proxy), ensuring that frontend requests to `/api/*` are securely forwarded to the backend without cross-origin blocks.

### Q8: What database migration or ORM strategy is configured?
Hibernate ORM is configured with `spring.jpa.hibernate.ddl-auto=update` to automatically generate and extend database schemas on startup.

### Q9: How are P1 and P2 incidents isolated from standard tickets?
They are filtered programmatically by the Priority attribute (`P1` or `P2`) to dynamically mount the Incident War Room bridge module.

### Q10: How are environment variables injected into the Vite frontend build?
Through `.env` files prefixed with `VITE_` (e.g., `VITE_API_BASE_URL`), which are compiled statically into the build bundle.

### Q11: What is the build target of the React frontend?
The Vite build target is set to `esnext` to support modern JavaScript features like top-level await and dynamic imports.

### Q12: How are API services structured on the frontend?
They are grouped into a service namespace (`src/api/services.ts`) wrapping an Axios instance (`src/api/client.ts`).

### Q13: What layout system is used for page responsiveness?
Material-UI (MUI v6) Grid v2 component is used, providing fluid layouts using breakpoints (`xs`, `sm`, `md`, `lg`, `xl`).

### Q14: How does the application implement the glassmorphism aesthetic?
Through custom utility classes in `index.css` applying `backdrop-filter: blur(12px)` and translucent background HSL alphas.

### Q15: How does the app handle API polling for real-time telemetry?
Instead of heavy web sockets, it uses React Query's `refetchInterval` configuration to poll telemetry endpoints every 10 seconds.

### Q16: How is code splitting optimized in the production bundle?
Rollup chunk options are configured to split React, Material-UI, and Recharts libraries into separate vendor files to minimize page load times.

### Q17: What logging framework is used on the backend?
SLF4J with Logback configuration, which outputs formatted NOC/SOC-style logs to the console and log files.

### Q18: What is the purpose of the AppLayout wrapper component?
It manages drawer collapse states, global navigation, active route highlights, user session headers, and voice command activations.

### Q19: What is the risk level priority matrix used for changes?
It maps Change Type (Standard, Normal, Emergency) against Risk Level (Low, Medium, High, Critical) to route approvals.

### Q20: How are validation schemas managed on forms?
Using Yup validation schemas linked to `react-hook-form` via the `@hookform/resolvers/yup` adapter.

---

## Section 2: Backend Spring Boot Implementation

### Q21: Which version of Spring Boot is utilized?
The backend runs on Spring Boot 3.3.x, requiring Java 17 or higher.

### Q22: How is password security implemented during user registration?
Passwords are hashed using a cryptographically secure strength of BCryptPasswordEncoder with a salt workload of 10.

### Q23: How does the JwtUtils class generate token signatures?
It uses HMAC SHA-256 algorithm with a base64-encoded secret key configured in `application.properties`.

### Q24: How does token refresh logic work when access tokens expire?
The client intercepts 401 errors, queries `/api/auth/refresh` with a valid refresh token, updates session storage, and replays failed requests.

### Q25: Where is the refresh token stored?
In the database alongside the user account record, and in browser session storage for active session handling.

### Q26: How are controller exceptions caught and mapped to JSON payloads?
Through a `@ControllerAdvice` class extending `ResponseEntityExceptionHandler` to catch exceptions globally and map them to `ApiError` structures.

### Q27: How does the UserController implement CRUD operations?
Using REST HTTP verbs: `GET /admin/users` (list), `POST /admin/users` (create), `PUT /admin/users/{id}` (edit), and `DELETE /admin/users/{id}` (deactivate).

### Q28: How is the soft delete logic implemented in UserController?
Instead of executing a hard SQL `DELETE`, the `DELETE` route updates the user's status column to `INACTIVE`.

### Q29: How does the priority calculation work on Incident creation?
It uses a matrix lookup mapping Impact (High, Medium, Low) and Urgency (High, Medium, Low) to output P1, P2, P3, or P4.

### Q30: What is the purpose of the AiController class?
It exposes predictive mock APIs that simulate machine-learning RCA diagnostics and SLA breach predictions.

### Q31: How are incident updates and audits tracked?
Using JPA lifecycle annotations `@PrePersist` and `@PreUpdate` to maintain `createdAt` and `updatedAt` timestamps.

### Q32: What JPA repository pattern is used?
It extends `JpaRepository` and `PagingAndSortingRepository` to support paginated user and incident grids.

### Q33: How is access restricted to the User Management page?
The endpoint is secured using `@PreAuthorize("hasRole('ADMIN')")` on `UserController` methods.

### Q34: What authentication filter intercepts incoming HTTP requests?
`AuthTokenFilter`, which checks the `Authorization` header for a `Bearer ` prefix, parses the JWT token, and sets the user context.

### Q35: How is Lombok configured in the backend project?
Lombok annotations (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`) are processed at compile time by the compiler plugin.

### Q36: How does the app handle Jackson infinite loops in parent-child relationships?
Using `@JsonIgnore` on the child side to prevent infinite recursive serialization.

### Q37: How is the H2 Console enabled for testing?
By setting `spring.h2.console.enabled=true` and setting the frame options header to `sameorigin` in SecurityConfig.

### Q38: What port does the Spring Boot server bind to?
Port `8080` (configured via `server.port=8080` in properties).

### Q39: What class acts as the main execution entrypoint?
`ItsmBackendApplication.java` inside the root backend package.

### Q40: How are Spring Security filters chain defined?
Inside `SecurityConfig.java` using a `SecurityFilterChain` bean with httpBasic and csrf disabled.

### Q41: How are JPA queries written to get pending approvals?
Using custom JPQL queries in `ChangeRequestRepository`: `@Query("SELECT c FROM ChangeRequest c JOIN c.approvals a WHERE a.approver.id = :userId AND a.decision = 'PENDING'")`.

### Q42: What payload does the `/api/dashboard` controller endpoint return?
Counts of open tickets, breach rates, MTTR tracking, daily volume trends, and SLA metrics.

### Q43: How is MTTR calculated in the Dashboard Controller?
It computes the average difference in minutes between `createdAt` and `resolvedAt` timestamps for all resolved incidents.

### Q44: What security strategy is used on password validation?
Validations are done in the frontend schema first, then validated on user creation in the backend to ensure length limits.

### Q45: How does TopologyController return mock network data?
It compiles nodes (representing physical assets) and links (representing connection paths) in a structured JSON graph.

### Q46: How is the JPA entity relation mapped between Incident and User?
Using `@ManyToOne` with `@JoinColumn(name = "assigned_to_id")` and `assigned_to_id` key references.

### Q47: How does the server handle transactions?
Using `@Transactional` annotations on service methods to roll back database changes in case of failures.

### Q48: How is pagination configured on incident lists?
Using `PageRequest.of(page, size, Sort.by("createdAt").descending())` inside controller mappings.

### Q49: What is the maximum size of JWT tokens in this project?
They are standard HMAC-SHA256 signatures, keeping headers, payloads, and signatures within a compact 150-250 character string.

### Q50: How is standard cross-origin policy bypass configured during development?
Using a CORS config bean in the security settings permitting headers, methods, and credentials.

---

## Section 3: Database & Seeding Configuration

### Q51: Which local database engine does the production build support?
Microsoft SQL Server (supporting local developer instances and corporate installations) and PostgreSQL (for Railway production).

### Q52: What is the backup database engine configured for local offline testing?
An in-memory H2 database.

### Q53: How does the backend toggle between SQL Server and H2?
By toggling comments on active datasource connection properties in `application.properties` or using environment variables.

### Q54: What JDBC driver is required for SQL Server connection?
`com.microsoft.sqlserver.jdbc.SQLServerDriver` (loaded via Maven dependency).

### Q55: What SQL Server connection string parameters enable secure local connections?
`encrypt=true;trustServerCertificate=true;` to bypass SSL certificate checks on local developer installations.

### Q56: How is the SQL Server database user authenticated locally?
Through SQL Server Authentication using `itsm_user` and `ITSM@Secure2024!`.

### Q57: How many users does DatabaseSeeder.java generate?
It seeds exactly 103 users: 3 administrative/manager roles, and 100 IT Specialist specialist accounts.

### Q58: How are the 100 specialist usernames formatted by the seeder?
They are generated in a loop from `it_user_1` to `it_user_100`.

### Q59: How are shifts distributed among the 100 specialists?
They are distributed evenly across "Day", "Night", and "Swing" shifts using modulo operators during seeding.

### Q60: How does the seeder allocate specialists to teams?
Specialists are assigned to teams (L1, L2, L3, Database, Network, Security, Cloud) using indexed array offsets.

### Q61: What is the default password assigned to seeded users?
`defaultPassword123` (hashed with BCrypt on seeding execution).

### Q62: How are incident ticket numbers formatted?
`INC` followed by an 8-digit zero-padded sequence (e.g. `INC0000100`).

### Q63: How are duplicate key constraint issues avoided during seeder runs?
By starting the seeder incident loop at index 1005 to avoid collisions with default test entries.

### Q64: What relational tables are created in the local database schema?
`users`, `user_groups`, `incidents`, `change_requests`, and `approvals`.

### Q65: What column represents the relationship between users and groups?
A join table representing assignment group memberships.

### Q66: How is the SLA countdown target calculated on seeder incidents?
By adding the priority target duration (1 hour for P1, 4 hours for P2, 8 hours for P3, 24 hours for P4) to the creation timestamp.

### Q67: What default values does the seeder assign to SLA compliance states?
Tickets are flagged as `ON_TRACK`, `AT_RISK`, or `BREACHED` depending on simulated time differences.

### Q68: What columns are added to the users table to support the Command Center features?
`team`, `shift`, and `status`.

### Q69: What default status value is set on the users table?
`ACTIVE` (representing availability for work routing).

### Q70: How does the seeder initialize change request records?
It creates standard, normal, and emergency changes, and seeds approvals linked to managers.

### Q71: What happens to SQL Server connections if the database service is offline?
Spring Boot will throw connection exceptions and shut down during initialization.

### Q72: How are SQL Server transactional logs managed?
They are managed by the SQL Server engine, utilizing auto-growth configurations inside the `itsmdb` database.

### Q73: What index fields are automatically created by Hibernate?
Primary key indexes on `id` columns and unique key indexes on `username` and `ticket_number`.

### Q74: How are H2 database memory allocations managed?
H2 runs entirely inside the JVM heap space allocated to the Spring Boot running process.

### Q75: How can a developer clear the seeded database schema?
By setting `spring.jpa.hibernate.ddl-auto=create-drop` once, running the server, and then reverting to `update`.

### Q76: What database collation is used in SQL Server?
The default server collation (typically `SQL_Latin1_General_CP1_CI_AS`).

### Q77: How are dates and times stored in the database?
They are stored as SQL `datetime2` columns (which map to `LocalDateTime` in Java).

### Q78: How are incident notes and descriptions stored?
As `VARCHAR(MAX)` or `nvarchar(max)` columns to support large log files.

### Q79: How are role names structured in the database?
They are stored as strings (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_USER`) in the `role` column of the `users` table.

### Q80: How does SQL Server track change approvals?
Through the `approvals` table, which holds foreign keys linking to both `change_requests` and `users`.

---

## Section 4: Frontend Vite, React & TypeScript Stack

### Q81: What frontend framework and build tool is implemented?
Vite is used as the build tool, compiling React 18 and TypeScript.

### Q82: What is the main configuration file for Vite?
`vite.config.ts`, which sets alias paths (`@` mapping to `/src`) and configures proxy routings.

### Q83: How does the proxy routing work during development?
Vite dev server proxies requests from `/api` directly to `http://localhost:8080/api` to bypass CORS issues.

### Q84: What is the package manager configured?
NPM (Node Package Manager).

### Q85: What Material UI components compile the typography and charts?
MUI Core components, with custom chart rendering provided by Recharts.

### Q86: How does the custom theme handle dark/light transitions?
Through custom variables defined in `:root` and `@media (prefers-color-scheme: dark)` inside `index.css`.

### Q87: How are routing paths mapped?
Using `react-router-dom` v6 with `<Routes>` and `<Route>` wrappers nested in `App.tsx`.

### Q88: How are protected routes structured?
Through a `<ProtectedRoute>` component that checks Zustand's `accessToken` state and redirects to `/login` if empty.

### Q89: What libraries render form validations?
`react-hook-form` manages form states, while `yup` is used for validation schemas.

### Q90: How does the user profile store access details?
`useAuthStore` stores current user details and provides standard login, logout, and token refresh interfaces.

### Q91: How are notifications handled?
Using `notistack` to provide snackbars for API success and error states.

### Q92: What build outputs are created inside the `dist/` directory?
Minified Javascript bundles, compiled stylesheets, assets (icons), and a single `index.html` file.

### Q93: What CSS framework is used for custom styling?
Vanilla CSS and CSS Variables paired with Material UI's `sx` styling prop.

### Q94: How does the app prevent TypeScript compiler errors during build?
By using `tsc` to verify type safety prior to executing Vite's build bundle stage.

### Q95: How is custom scrollbar styling applied to charts and lists?
Via Webkit vendor properties (`::-webkit-scrollbar` etc.) defined in the global `index.css`.

### Q96: What icon pack is used?
`@mui/icons-material` (providing SVG icons).

### Q97: How are API request parameters typed?
Using TypeScript interfaces inside `src/types/index.ts`.

### Q98: How is the base URL configured for production builds?
Vite compiles relative URLs, directing requests to the host domain where the index.html is loaded.

### Q99: What is the purpose of the `main.tsx` file?
It bootstraps the React application by mounting the `<App />` root component to the DOM.

### Q100: How are Axios interceptors configured?
Inside `client.ts` to attach bearer tokens to request headers and handle 401 token refresh retry queues.

### Q101: How is the dev server port customized?
In `vite.config.ts` by setting the `server.port` option to `3000`.

### Q102: What package provides date formatting?
`date-fns` (used for calculating SLA countdowns and formatting timestamps).

### Q103: How does the app load custom fonts?
By loading typography stylesheet references from Google Fonts in the main template head.

### Q104: How is local network access configured for testing on devices?
Vite is run with the `--host` flag to bind the server to the local network IP.

### Q105: How does the frontend handle loading skeletons?
Using MUI's `<Skeleton>` component configured to match the layouts of page sections.

---

## Section 5: 3D Server Racks & Network Telemetry

### Q106: What library renders the 3D Server Racks?
Three.js (a WebGL rendering library).

### Q107: Where is the WebGL rendering canvas initialized?
Inside `ThreeJsRackView.tsx` within a standard container `div`.

### Q108: How are physical server boxes represented in Three.js?
As custom `THREE.BoxGeometry` meshes arranged in a vertical stack to resemble server slots.

### Q109: How is the camera controlled in the 3D space?
Using OrbitControls to allow users to zoom, pan, and rotate the rack in 3D.

### Q110: How are server health states reflected in 3D?
By modifying the color of emissive slot led meshes: green (healthy), yellow (degraded), and red (warning).

### Q111: How is the rendering loop managed?
Via a standard requestAnimationFrame callback: `requestAnimationFrame(animate)`.

### Q112: How are web events handled inside the Three.js canvas?
Mouse positions are mapped using a `THREE.Raycaster` to detect hovered and clicked server boxes.

### Q113: What happens to the WebGL rendering engine on component unmount?
The rendering loop is canceled, and geometries, materials, and textures are disposed of to prevent memory leaks.

### Q114: How is the SVG Network Topology rendered?
As a vector canvas in `NetworkTopology.tsx`, using SVG tags to draw responsive boxes, text, and connector lines.

### Q115: How are pulsing connection lines drawn in the topology view?
Using the SVG `stroke-dasharray` attribute paired with a CSS animation that animates offset values.

### Q116: How is the blast-radius dependency graph structured?
Using a tree hierarchy in `ServiceDependencyGraph.tsx` to map service relationships.

### Q117: What does the blast-radius visualization help identify?
Which backend services (RDS, EC2, Lambda) are affected when a core host goes offline.

### Q118: How does the Global Latency Map load the world outline?
Using SVG path layouts mapping regional outlines, without relying on heavy external mapping API libraries.

### Q119: How are regional pins rendered on the global map?
As pulsing status circle coordinates positioned relative to the map background wrapper.

### Q120: How are latency metrics displayed for each location?
As data label badges showing round-trip times (RTT) in milliseconds.

---

## Section 6: Next-Generation ITSM Upgrades

### Q121: What is the purpose of the AI Copilot component?
To act as a floating conversational interface that processes NLP-style queries about system states.

### Q122: How is the AI Copilot component mounted?
Globally in `AppLayout.tsx`, rendering as a floating icon in the bottom right corner of the screen.

### Q123: What does the Timeline Replay slider allow users to do?
Technicians can scrub through historical ticket updates to inspect past telemetry and system configurations.

### Q124: How does scrubbing the timeline slider update other page elements?
It triggers state updates in the parent component, updating the incident status, owners, queues, and diagnostic feeds.

### Q125: How does the RCA Report generator compile the PDF report?
By rendering the data into a print-friendly dialog layout that formats cleanly for paper or PDF export.

### Q126: What CSS directives optimize the RCA report for printing?
`@media print` rules that set target elements to `visibility: visible` and hide all other app elements.

### Q127: Where is the Incident War Room bridge rendered?
Directly under the incident details page layout when priority is evaluated as P1 or P2.

### Q128: What real-time features does the Incident War Room bridge provide?
A chat thread, participant list, and decision logger to track actions taken during outages.

### Q129: What speech command api is used for voice control?
The browser's native `webkitSpeechRecognition` API (part of the Web Speech API standard).

### Q130: How is voice command listening toggled?
Using a microphone button next to notifications in the header toolbar.

### Q131: What visual indicator shows that voice control is active?
The microphone icon turns red and triggers a pulsing border animation.

### Q132: How are spoken commands mapped to page actions?
Speech results are parsed into strings to match navigation paths (e.g., "go to dashboard").

### Q133: How does the voice control system pass queries to the AI Copilot?
By listening for "ask copilot [query]" and dispatching a custom event carrying the query string.

### Q134: How does the Executive Mode dashboard format KPIs?
It converts technical metrics like count values and resolution times into business KPIs like revenue losses and SLA compliance.

### Q135: What styling updates does Wallboard Mode apply?
It updates the dashboard to a high-contrast dark theme optimized for large NOC wall screens.

---

## Section 7: Operations & Troubleshooting

### Q136: What local environment setup is required to run the portal?
A system running Node.js (v18+) and Java JDK (v17+) with local network access.

### Q137: How is the Vite server started in development?
By running `npm run dev` in the terminal from the frontend project directory.

### Q138: What port does the dev server run on by default?
`http://localhost:3000`.

### Q139: How do you build the frontend for production?
By running `npm run build` from the frontend directory.

### Q140: What maven target compiles the Spring Boot backend?
`mvn clean package` (generating a runnable JAR file in the target folder).

### Q141: How do you run the backend from the command line?
`mvn spring-boot:run` or `java -jar target/backend-1.0.0.jar`.

### Q142: How do you fix Lombok compilation errors?
Enable annotation processors in your IDE compiler preferences and ensure Lombok v1.18.46+ is declared.

### Q143: What database configuration is required in SSMS?
Create a blank database named `itsmdb` and configure the database user credentials.

### Q144: What port does local SQL Server listen on?
Port `1433` (the default port).

### Q145: How can a developer inspect seeded database tables?
Connect to the database engine in SSMS and run SQL queries against the target tables (e.g. `SELECT * FROM incidents`).

### Q146: What does the error `TypeTag :: UNKNOWN` indicate?
It indicates an annotation processing conflict. This is resolved by upgrading Lombok and reloading Maven dependencies.

### Q147: How does Netlify deploy the React portal?
It pulls the code from GitHub, executes `npm run build`, and hosts the static dist assets on its CDN.

### Q148: What build options should be configured in Netlify?
Set the build command to `npm run build` and the publish directory to `dist`.

### Q149: How is client-side routing handled on Netlify?
By adding a `_redirects` file containing `/* /index.html 200` to prevent 404 errors on page reloads.

### Q150: What command launches the database seeder manually?
The seeder runs automatically on Spring Boot startup, using check validations to seed initial data.
