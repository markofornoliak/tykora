# Contributing to TYKORA

Thank you for improving a free and accessible typing tutor.

## Setup

Node.js 24 LTS, npm. Fork, branch, `npm install`, `npm run dev`. Commits should describe one behavior change.

## Quality standard

- Keep the domain logic framework-agnostic. New metrics and generators require deterministic unit tests and documented formulas.
- Avoid collecting or transmitting practice history or identifiers; introduce no ads, paid features, profiling SDKs, or analytics.
- New exercises must have explicit license metadata (prefer original text or public domain with source and jurisdiction notes).
- UI must work via keyboard and with `prefers-reduced-motion`, maintain contrast and responsive layout, and avoid presenting simulations as real opponents.
- Add translations via `src/shared/i18n` and document which locales are incomplete.
- Run the full command suite in `docs/RELEASE.md` before pull requests. CI must be green before merge.
- Do not claim educational gains, anti-cheating certification, WCAG conformance, or performance scores without reproducible evidence.

No CLA is required. Contributions are offered under MIT.
