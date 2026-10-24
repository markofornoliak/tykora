# TYKORA · Stage 8 Release Guide

Version: **0.8.0** · Release quality: **source candidate; NOT verified for public production**.

## 1. Local prerequisites and full gate

Node.js 24 LTS + npm. An internet connection is needed once for `npm install` and Playwright's browser binary. Application runtime itself is intended to work offline after installing the service worker.

```bash
npm install --no-audit --no-fund
npm run check:domain
npm run check:backup
npm run check:quality
npm run check:workers
npm run check
npm run test
npm run build
npm run check:dist
npx playwright install chromium
npm run test:e2e
npm run test:e2e:production
npm run preview
```

**Gate:** All commands must exit 0 on a clean clone, including full TypeScript, Vitest, Playwright and production PWA smoke. If any fails, fix before publishing. The first three checks have been run successfully in the authoring container. The remainder need a network-enabled environment with dependencies.

Generate and commit `package-lock.json`; after committing change workflow install steps to `npm ci`. No lockfile has been fabricated in this offline source artifact.

## 2. GitHub Pages · zero infrastructure bill

1. Create a public GitHub repository, for example `tykora`. Copy the **contents** of this source folder to the repository root, including `.github/`.
2. Commit and push to `main`.
3. Navigate to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. `.github/workflows/deploy.yml` tests and builds using `VITE_BASE_PATH=/<repository-name>/` and publishes `dist` if gates pass.
5. Website URL follows `https://<user>.github.io/<repository-name>/` once deployment succeeds. Actual URL is not allocated by this artifact.
6. For a user site (`<user>.github.io`) or own-domain root deployment, use `VITE_BASE_PATH=/` instead of repository subpath.

`HashRouter` uses paths such as `/#/academy` and survives GitHub Pages refresh without rewrites. Asset URLs, PWA scope and precache must be tested at the **real repository subpath**, not only at `/`.

## 3. Cloudflare Pages · alternative free-tier host

1. In Cloudflare Pages, connect the same GitHub repository (Git integration).
2. Choose `React (Vite)` or custom: **Build command** `npm run build`, **Output directory** `dist`, **Root** `/`.
3. Set `NODE_VERSION=24` if needed by the build image, and `VITE_BASE_PATH=/` for domain-root hosting.
4. Deploy `main` and open the assigned `*.pages.dev` subdomain. No specific hostname is reserved by this deliverable.
5. `public/_headers` adds selected security headers on Cloudflare Pages (GitHub Pages ignores the file).

Actual cost is subject to the provider's changing free quotas. Avoid configuring a paid custom domain or external TURN service if zero expenses are mandatory.

## 4. Offline / PWA acceptance

In installed Chromium after deployment: open the site online, verify `manifest.webmanifest` and active service worker in DevTools → Application, reload to obtain a controlling worker, use **Network → Offline**, refresh, then complete a local typing test, switch to Academy and view Profile. Imported or exported progress must survive a reload. Confirm the app does not request unavailable assets after first precaching. Test on a phone; desktop simulation is insufficient.

## 5. Privacy and data recovery acceptance

1. Finish a test and note the WPM.
2. In Profile download `tykora-backup-YYYY-MM-DD.json`.
3. Import it on a separate fresh browser profile in **Merge** mode.
4. Ensure sessions and skill data reappear; verify zero outbound data transfers during import and use.
5. Run Replace mode only with a deliberately disposable test profile; confirmation must appear.
6. For invalid or future-schema JSON, import must fail without changing IndexedDB (transactional import).

There is no server-side backup or automatic multi-device synchronization. The user owns the only copies.

## 6. Test devices and targets still to measure

- Desktop: Chromium, Firefox, Safari; external keyboard QWERTY/QWERTZ/ЙЦУКЕН.
- Mobile: iOS Safari, Android Chrome; software keyboard, safe areas, no horizontal scroll.
- Input: IME, composition, dead keys, AltGr, paste rejection, Unicode graphemes, correcting errors.
- Accessibility: keyboard-only, VoiceOver, NVDA, 200% zoom, reduced motion, high contrast, WCAG 2.2 AA audit.
- Quality: no script errors, no broken routes, no synthetic demo results, network-off functioning.
- Performance: >=95 in each Lighthouse category, measured LCP <1 s on defined midrange hardware; typing-field response target <16ms under load; record device/test conditions.

**No measured passing result is claimed for these user-agent and performance criteria.**

## 7. Remaining work before claiming production

1. Install dependencies and generate the lockfile.
2. Run and repair full TypeScript/React build, unit, and browser tests until green.
3. Confirm app functions in production subpath and on Cloudflare root (including SW scope/offline).
4. Perform manual accessibility and multilingual review (the UI is not fully translated).
5. Resolve functional gaps and educational-content verification; validate the course with real learners.
6. Only then create a Git tag / public release and share a live deployment URL.
