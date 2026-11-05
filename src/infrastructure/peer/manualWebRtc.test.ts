import {describe,it,expect} from 'vitest';
import {PeerRateGate,readSignal} from './manualWebRtc';

describe('manual peer security boundary',()=>{
 it('caps inbound messages at 40 per second independently for each connection',()=>{
  const first=new PeerRateGate(),second=new PeerRateGate();
  for(let i=0;i<40;i++)expect(first.allow(5000)).toBe(true);
  expect(first.allow(5000)).toBe(false);
  expect(second.allow(5000)).toBe(true);
  expect(first.allow(5999)).toBe(false);
  expect(first.allow(6000)).toBe(true);
  expect(first.allow(Number.NaN)).toBe(false);
  // Explicit handling of a backwards/adjusted system clock.
  expect(first.allow(1000)).toBe(true);
 });
 it('requires a matching room and SDP role and rejects large or malformed signaling',()=>{
  const offer=JSON.stringify({v:1,room:'safe-room',description:{type:'offer',sdp:'v=0\r\n'}});
  expect(readSignal(offer,'safe-room','offer')).toEqual({type:'offer',sdp:'v=0\r\n'});
  expect(()=>readSignal(offer,'other-room','offer')).toThrow();
  expect(()=>readSignal(offer,'safe-room','answer')).toThrow();
  expect(()=>readSignal('not json','safe-room','offer')).toThrow();
  expect(()=>readSignal('x'.repeat(80001),'safe-room','offer')).toThrow();
 });
});
