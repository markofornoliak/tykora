# ADR-010 — Reproducible CI and production browser matrix (2026-10-25)
Context: v0.8 CI used npm install without a lockfile and dev-server E2E in Chromium only.
Decision: commit npm-generated package-lock.json; use npm ci, test built Vite output across Chromium/Firefox/WebKit.
Reason: detect dependency drift and issues that differ by engine before a release.
Alternative: keep npm install and Chromium; rejected because it masks lock/version and browser regressions.
Costs: higher CI runtime and browser dependencies; do not weaken flaky tests.
Release is blocked until these new gates pass and baseline perf is captured.
The temporary lockfile generation workflow must be removed before final release.
