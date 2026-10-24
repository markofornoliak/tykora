# Privacy · TYKORA v0.8.0

**Default operation:** no account, advertisement, analytics SDK, or telemetry endpoint. Practice results and keyboard skill statistics are stored in the browser's IndexedDB. A local alias is optional.

**Backups:** profile exports the local five-table database snapshot to a JSON file. The file contains your learning history and may include a pseudonym. Export, parse and import run locally; there is no automatic cloud synchronization. Backups are not encrypted: keep them private. The browser can evict IndexedDB.

**Multiplayer:** opt-in experimental WebRTC P2P racing exchanges connection codes directly between participants. A remote participant can see the IP address used for peer traffic. Optional Google STUN leaks connection metadata and IP information to its operator; enabling it is explicitly requested. No TURN relay is bundled. This experimental mode is not appropriate for sensitive identity requirements.

**External links:** links to GitHub and third-party documentation may be used to install or deploy the source; such sites apply their own policies. Avoid assuming optional build/deploy services are privacy-neutral.
