import { graphemes } from './graphemes';
import type { TypingPrompt } from './contracts';

export const ENGINE_VERSION = '4.1.0';
export type InputSource = 'keyboard' | 'composition' | 'paste';
export interface TypingAttempt {
  readonly char: string;
  readonly expected: string | null;
  readonly position: number;
  readonly atMs: number;
  readonly correct: boolean;
  readonly source: Exclude<InputSource, 'paste'>;
}
export interface EngineState {
  readonly prompt: TypingPrompt;
  readonly typed: string;
  readonly attempts: readonly TypingAttempt[];
  readonly deletions: number;
  readonly correctedErrors: number;
  readonly startedAtMs: number | null;
  readonly endedAtMs: number | null;
}

// Immutable prompt/session objects make weak caching safe and avoid repeated
// expensive Unicode segmentation on every keystroke and timer refresh.
const targetCache=new WeakMap<TypingPrompt,readonly string[]>();
const typedCache=new WeakMap<EngineState,readonly string[]>();
export function targetGraphemes(prompt:TypingPrompt):readonly string[]{
 let chars=targetCache.get(prompt);
 if(!chars){chars=graphemes(prompt.text);targetCache.set(prompt,chars);}
 return chars;
}
export function typedGraphemes(state:EngineState):readonly string[]{
 let chars=typedCache.get(state);
 if(!chars){chars=graphemes(state.typed);typedCache.set(state,chars);}
 return chars;
}
export function createEngine(prompt: TypingPrompt): EngineState {
  if (targetGraphemes(prompt).length < 2) throw new Error('The prompt must contain at least two graphemes');
  return { prompt, typed: '', attempts: [], deletions: 0, correctedErrors: 0, startedAtMs: null, endedAtMs: null };
}

/**
 * Native textarea input is authoritative. keydown.code is *not* used to infer text.
 * Each input supplies an entire DOM value, so IME / dead keys / AltGr are kept intact.
 * Composition intermediates are ignored by UI, committed composition text is recorded here.
 * Never persist typed text or keystroke traces; they live only in this active session.
 */
export function acceptInput(state: EngineState, rawValue: string, atMs: number, source: InputSource = 'keyboard'): EngineState {
  if (source === 'paste' || state.endedAtMs !== null) return state;
  const target = targetGraphemes(state.prompt);
  const before = typedGraphemes(state);
  const after = graphemes(rawValue).slice(0, target.length);
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const removed = before.slice(prefix, before.length - suffix);
  const inserted = after.slice(prefix, after.length - suffix);
  if (!removed.length && !inserted.length) return state;

  const attempts: TypingAttempt[] = [...state.attempts];
  let correctedErrors = state.correctedErrors;
  for (let i = 0; i < removed.length; i++) {
    if (removed[i] !== target[prefix + i]) correctedErrors++;
  }
  for (let i = 0; i < inserted.length; i++) {
    const pos = prefix + i;
    attempts.push({ char: inserted[i], expected: target[pos] ?? null, position: pos,
      atMs, correct: inserted[i] === target[pos], source });
  }
  const startedAtMs = state.startedAtMs ?? (inserted.length ? atMs : null);
  const endedAtMs = after.length >= target.length && startedAtMs !== null ? atMs : null;
  const next:EngineState = {
    ...state,
    typed: after.join(''), attempts,
    deletions: state.deletions + removed.length, correctedErrors,
    startedAtMs, endedAtMs
  };
  typedCache.set(next,after);
  return next;
}

export function isFinished(state: EngineState): boolean { return state.endedAtMs !== null; }
export function currentPosition(state: EngineState): number { return typedGraphemes(state).length; }

/** Ends an open-ended/timed/hardcore session without fabricating the remaining characters. */
export function finishEngine(state:EngineState,atMs:number):EngineState {
 if(state.endedAtMs !== null || state.startedAtMs===null)return state;
 return {...state,endedAtMs:Math.max(atMs,state.startedAtMs)};
}
