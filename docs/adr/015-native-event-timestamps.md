# ADR-015 — Native input timestamps (2026-10-25)
Context: Practice formerly timed all characters at React handler execution using performance.now(), hiding input-handler delays.
Decision: derive timestamps from native Event.timeStamp; convert legacy epoch-millisecond values using performance.timeOrigin.
Reject impossible/future/negative timestamps and fall back to current monotonic time; preserve original received event time when plausible.
Guarantee nondecreasing event chronology at the engine boundary without inferring characters from keyboard codes.
IME composition commits use native compositionend timestamps; character text is still read from textarea.value.
Alternative: keep handler performance.now(); rejected because latency analyses would confuse event generation with handler dispatch.
Limit: one IME event may commit multiple graphemes at the same timestamp; per-character latency is not measurable there.
Evidence: eventTime.test.ts, production browser regression. Input-to-paint p95 remains not confirmed.
