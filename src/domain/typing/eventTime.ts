/** Translate browser Event.timeStamp to performance.now()'s monotonic clock.
 * Most browsers use a relative DOMHighResTimeStamp; older browsers could return epoch ms.
 * A missing, negative, future or implausible timestamp falls back to the receipt time.
 * This function is pure and never estimates a physical key or human finger.
 */
export function normalizedEventTimestamp(eventTimestampMs:number,receivedAtMs:number,timeOriginMs:number):number {
 if(!Number.isFinite(receivedAtMs)||receivedAtMs<0)throw new Error('Invalid current clock');
 if(!Number.isFinite(eventTimestampMs)||eventTimestampMs<=0)return receivedAtMs;
 let candidate=eventTimestampMs;
 if(candidate>1e11){
  if(!Number.isFinite(timeOriginMs)||timeOriginMs<=0)return receivedAtMs;
  candidate-=timeOriginMs;
 }
 // Events can arrive later than their generation (e.g. a busy main thread).
 // Allow up to 8ms future jitter and clamp that jitter to receipt time.
 if(candidate<0 || candidate>receivedAtMs+8 || !Number.isFinite(candidate))return receivedAtMs;
 return Math.min(candidate,receivedAtMs);
}
