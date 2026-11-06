# TYKORA — privacy and local data

*Last revised: 5 November 2026 · Applies to experimental Beta v0.9.0 features, not a promise of zero risk.*

TYKORA is a typing practice application that stores your sessions, progress, settings and optional nickname **on the device in the browser**, using IndexedDB. You do not need to create an account to practice. The project does not include an advertising SDK, usage analytics service or account-based tracking.

## What stays on your device?

Typing attempts, scores, practice history, keyboard learning statistics and choices such as theme and language are stored locally. Other users of the same browser profile may be able to access them. Private or incognito mode may delete them automatically. Browser storage can also be evicted, especially when space is low.

## What is a backup?

In **Profile → My data**, you can download a JSON copy of your learning data and import it on another browser. Backups are **not encrypted** and may include your pseudonym and detailed learning history. Keep your backup in a private folder and do not share it accidentally. Replace import can overwrite local data, but the app asks for confirmation and a pre-replace backup. Import files are limited to 25 MiB; corrupted CRC checksums are rejected.

## Does the app connect to other people?

Standard practice does not need a server account. **Optional experimental friend races** use WebRTC when you explicitly choose to connect and manually share a connection code. WebRTC peers can learn your network address. If you opt into Google's STUN service, your connection metadata and public IP can reach Google. This is an internet interaction despite the app's local-first design. P2P sessions are not appropriate for securely identifying participants and have no independent anti-cheating guarantee. Do not use your real name in a public or untrusted race code.

## Are there external requests?

The default first-load code is intended to fetch only assets from the same origin; an automated browser request test is included in the iteration 6 draft, but this is not a substitute for inspecting a released website. The web host itself receives normal HTTP requests (and can see IP addresses, user agents and access times) when you load the site. The project team does not control all retention policies of third-party hosts such as GitHub Pages.

## How do I remove my data?

Use the app's Profile controls to delete local progress if available, or remove this site's stored data from your browser settings. This does not delete copies that you exported, shared with someone else or stored in backups. TYKORA does not have an account server holding a synchronized copy to erase for you.

Questions and bugs can be raised in the project's GitHub issue tracker. Avoid posting real backup files or private connection codes in public issues.

*Source license: MIT. Read [Terms](TERMS.md) for prototype limitations.*
