/** Optional manually signaled one-to-one WebRTC. No account, relay, or app server.
 * With default host-only ICE it typically works on the same LAN. Optional public
 * STUN is opt-in; the STUN provider can see the connecting IP address.
 */
export type Role='host'|'guest';
export interface PeerProgress {kind:'progress';room:string;fraction:number;finished:boolean;}
export interface PeerStart {kind:'start';room:string;epochMs:number;}
export interface SignalEnvelope {v:1;room:string;description:{type:'offer'|'answer';sdp:string};}
export function readSignal(value:string,room:string,kind:'offer'|'answer'):RTCSessionDescriptionInit {
 if(value.length>80_000)throw new Error('Код подключения слишком длинный.');
 let o:unknown;
 try{o=JSON.parse(value);}catch{throw new Error('Неверный JSON кода подключения.');}
 const data=o as Partial<SignalEnvelope> | null;
 if(!data || data.v!==1 || data.room!==room || !data.description || data.description.type!==kind || typeof data.description.sdp!=='string' || data.description.sdp.length>75000 || !data.description.sdp.startsWith('v=0'))throw new Error('Код не подходит к этой комнате.');
 return {type:kind,sdp:data.description.sdp};
}
function waitIceComplete(pc:RTCPeerConnection):Promise<void>{
 if(pc.iceGatheringState==='complete')return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const timeout=window.setTimeout(()=>{cleanup();reject(new Error('Время сбора ICE-кандидатов истекло.'))},20000);
  const onState=()=>{if(pc.iceGatheringState==='complete'){cleanup();resolve();}};
  const cleanup=()=>{window.clearTimeout(timeout);pc.removeEventListener('icegatheringstatechange',onState);};
  pc.addEventListener('icegatheringstatechange',onState);
 });
}
export class ManualPeer {
 private readonly pc:RTCPeerConnection;
 private channel:RTCDataChannel|null=null;
 private readonly room:string;
 private readonly onStatus:(value:string)=>void;
 private readonly onProgress:(progress:PeerProgress)=>void;
 private readonly onStart:(start:PeerStart)=>void;
 constructor(room:string,stun:boolean,onStatus:(v:string)=>void,onProgress:(p:PeerProgress)=>void,onStart:(s:PeerStart)=>void){
  this.room=room;this.onStatus=onStatus;this.onProgress=onProgress;this.onStart=onStart;
  this.pc=new RTCPeerConnection({iceServers:stun?[{urls:'stun:stun.l.google.com:19302'}]:[]});
  this.pc.addEventListener('connectionstatechange',()=>this.onStatus(this.pc.connectionState));
  this.pc.addEventListener('datachannel',event=>this.attach(event.channel));
 }
 private attach(channel:RTCDataChannel){
  this.channel=channel;
  channel.onopen=()=>this.onStatus('connected');
  channel.onclose=()=>this.onStatus('disconnected');
  channel.onmessage=(event:MessageEvent)=>{
   if(typeof event.data!=='string'||event.data.length>1000)return;
   try{const m=JSON.parse(event.data) as Record<string,unknown>;
    if(m.kind==='progress'&&m.room===this.room&&typeof m.fraction==='number'&&Number.isFinite(m.fraction)&&m.fraction>=0&&m.fraction<=1&&typeof m.finished==='boolean')this.onProgress(m as unknown as PeerProgress);
    if(m.kind==='start'&&m.room===this.room&&typeof m.epochMs==='number'&&Number.isFinite(m.epochMs)&&Math.abs(m.epochMs-Date.now())<60_000)this.onStart(m as unknown as PeerStart);
   }catch{/* Ignore invalid peer data. */}
  };
 }
 private signal(type:'offer'|'answer'):string{
  const desc=this.pc.localDescription;
  if(!desc?.sdp||desc.type!==type)throw new Error('SDP не создан.');
  return JSON.stringify({v:1,room:this.room,description:{type,sdp:desc.sdp}} satisfies SignalEnvelope);
 }
 async offer():Promise<string>{
  const channel=this.pc.createDataChannel('tykora-progress',{ordered:true});this.attach(channel);
  await this.pc.setLocalDescription(await this.pc.createOffer());await waitIceComplete(this.pc);
  return this.signal('offer');
 }
 async answer(offerJson:string):Promise<string>{
  await this.pc.setRemoteDescription(readSignal(offerJson,this.room,'offer'));
  await this.pc.setLocalDescription(await this.pc.createAnswer());await waitIceComplete(this.pc);
  return this.signal('answer');
 }
 async applyAnswer(json:string):Promise<void>{await this.pc.setRemoteDescription(readSignal(json,this.room,'answer'));}
 start(epochMs:number):void{
  if(this.channel?.readyState!=='open')throw new Error('Нет соединения с другом.');
  this.channel.send(JSON.stringify({kind:'start',room:this.room,epochMs} satisfies PeerStart));
 }
 send(fraction:number,finished:boolean):void{
  if(this.channel?.readyState==='open')this.channel.send(JSON.stringify({kind:'progress',room:this.room,fraction:Math.max(0,Math.min(1,fraction)),finished} satisfies PeerProgress));
 }
 close():void{this.channel?.close();this.pc.close();}
 get connected():boolean{return this.channel?.readyState==='open';}
}
