// ONLY used when TYKORA_PREACT_EXPERIMENT=1. The production React build never imports this.
import * as Compat from 'preact/compat';
export * from 'preact/compat';
export default Compat.default ?? Compat;
// Preact lacks React Profiler. Keep the subtree, without lying about profiler events.
// This makes the opt-in compatibility experiment buildable; profiling correctness
// must NOT be claimed for Preact while this shim is active.
export const Profiler=({children})=>children;
