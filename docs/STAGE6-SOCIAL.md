# TYKORA Stage 6 — Profile, Local Races, Manual P2P, Classroom

Status: **source milestone / beta**. Extends Stage 5 with no paid services or tracking. No independent proof of competitive results.

## Product behavior

- `/#/profile`: alias stored in Dexie v4, optional. Progression and 8 achievements computed from locally stored `SessionRecord`s. No cloud profile, email, friends list or remote ranking. Self-referenced tier depends on personal-best WPM. Missing a day does not subtract points, but the consecutive-day counter ends naturally. SVG achievement card has explicit self-issued / non-certified marking.
- `/#/race`: RU/EN race text deterministic by room code; three offline simulated bots with selectable difficulty. Human input uses the Stage 4 native textarea engine (including IME composition) and blocks paste. Local results saved to the existing `sessions` table, not any global ranking.
- Experimental one-to-one WebRTC: a room **link carries only room ID and locale**. The host makes an offer code and shares it separately; guest pastes it, generates answer; host pastes answer. All ICE candidates are gathered before one full SDP exchange (20s timeout); no proprietary signaling service. There is no automatic connection from the URL alone. Host starts race with a 5-second countdown; uses approximate wall-clock synchronisation (device clock drift and network latency affect fairness). Data channel transmits only fractional progress, finish flag, room ID and start time, not text or keystroke sequences. Peer can falsify values. Full authentication and leaderboard anti-cheat are out of scope.
- Default `iceServers: []` means **connections generally work only where host candidates are reachable**, commonly same LAN. Opt-in public Google STUN can help NAT discovery but reveals the connecting public IP address to the STUN provider; connections behind restrictive NAT/firewalls may require TURN, which is intentionally not included. Peers themselves can learn network addresses.
- `/#/classroom`: teachers create assignments as versioned JSON files, students import them, type inside the browser, and may voluntarily export versioned result JSON. Teachers import multiple reports into volatile page state, review rows and export UTF-8 CSV. Files are validated and size-bounded; CSV cells are quoted, spreadsheet formulas escaped. No identities are validated. School group is not synchronized; files are exchanged outside TYKORA. Unlike certified testing, these reports can be edited and are **not trustworthy evidence** of actual typing.

## Architecture

- Pure core `src/domain/social/{progression,race,classroom}.ts`: deterministic computations, input validation, CSV generation.
- Persistence: `src/infrastructure/persistence/IndexedDbProfileRepository.ts`, schema v4 preserving tables from v1–v3; `profiles` keyed by local ID. Session data uses existing Stage 4 schema.
- Optional peer adapter: `src/infrastructure/peer/manualWebRtc.ts`; independent of domain code.
- Screens: `src/features/{profile,race,classroom}/`; typography and tokens reuse Stage 2 CSS.
- No import of React or Dexie by pure domain functions. No server-side routes, mandatory account, external telemetry or ads.

## Privacy / limitations

- Pseudonyms and race results are kept in IndexedDB until voluntarily exported. Browser eviction or clearing site data can delete them. Full backup/restore of profile and progress is deferred to Stage 7/8.
- Manual SDP messages contain ICE candidates and may expose local/public addressing information. **Only exchange with trusted participants**, and do not publicly publish SDP codes.
- UI has user-facing disclosure of peer/STUN data exposure; no STUN access unless explicitly opted in.
- P2P and classroom data are self-reported, unverified and unsuitable for high-stakes certification.
- More than two human peers, verified certificates, global leagues and rankings, persistent classrooms and cross-device sync are not implemented.
- Mobile hardware keyboard and on-screen keyboard behavior, VoiceOver/NVDA, actual WebRTC connectivity across networks, responsive QA and WCAG 2.2 AA must be validated in Stage 7.

## Acceptance checks

Dependency-free `npm run check:domain`: 22 inherited Stage 5 cases + 10 Stage 6 independent behavior checks. `e2e/social.spec.ts` adds tests for profile persistence, offline bots, classroom file transfer and invalid input. Full React compile (`npm run check`), Vitest, Playwright and PWA build require npm dependencies and were not executable in the restricted authoring container.
