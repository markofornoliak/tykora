import {afterEach,describe,expect,it,vi} from 'vitest';
import {createEngine,acceptInput,finishEngine} from '../../domain/typing/engine';
import {createSessionStore} from './SessionStore';

const prompt={id:'iter5-test',text:'abcdefghi',locale:'en',layoutId:'en-qwerty',mode:'lesson' as const,license:'original' as const};

describe('ephemeral typing session store',()=>{
 afterEach(()=>vi.useRealTimers());
 it('publishes immediate visual updates and coalesces ordinary React updates',()=>{
  vi.useFakeTimers();
  const store=createSessionStore(createEngine(prompt));
  let snapshots=0,visual=0;
  const unsub=store.subscribe(()=>snapshots++);
  const offVisual=store.subscribeVisual(()=>visual++);
  store.update(acceptInput(store.current,'a',1));
  expect(snapshots).toBe(1); // session start transition
  store.update(acceptInput(store.current,'ab',2));
  store.update(acceptInput(store.current,'abc',3));
  expect(visual).toBe(3);
  expect(snapshots).toBe(1);
  expect(store.getSnapshot().typed).toBe('a');
  expect(store.current.typed).toBe('abc');
  vi.advanceTimersByTime(250);
  expect(snapshots).toBe(2);
  expect(store.getSnapshot().typed).toBe('abc');
  unsub();offVisual();store.dispose();
 });
 it('flushes completion synchronously and keeps engine state intact',()=>{
  vi.useFakeTimers();
  const store=createSessionStore(createEngine(prompt));
  let observed=0;
  store.subscribe(()=>observed++);
  store.update(acceptInput(store.current,'abc',10));
  store.update(acceptInput(store.current,'abcd',20));
  store.update(finishEngine(store.current,30),true);
  expect(store.current.endedAtMs).toBe(30);
  expect(store.getSnapshot().typed).toBe('abcd');
  expect(store.getSnapshot().attempts).toHaveLength(4);
  expect(observed).toBe(2);
  vi.advanceTimersByTime(500);
  expect(observed).toBe(2);
  store.dispose();
 });
});
