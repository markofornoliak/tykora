# ADR-013 — Route-level code splitting before UI micro-optimizations (2026-10-25)
Context: v0.8.0 bundles Home plus all eight specialist routes into the initial JavaScript chunk (552.70 kB minified, 181.50 kB gzip, Linux CI build).
Decision: use React.lazy for nine route components and keep the shared Layout mounted with a nested Suspense/Outlet boundary.
Goal: download parsing costs for unopened pages do not affect the Home route; no new runtime dependency.
Alternative: manually memoize large screens first; rejected until network/parse costs are measured.
Risks: lazy route navigation and PWA offline precache may regress; existing Chromium/Firefox/WebKit and production-offline tests must pass.
Do not claim Lighthouse improvement until identical mobile/desktop measurements exist for v0.9.0.
