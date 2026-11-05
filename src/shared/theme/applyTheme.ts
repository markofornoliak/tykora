import type {Palette} from './palettes';
import {contrastRatio,luminance} from './contrast';
function mixHex(from:string,to:string,t:number):string{
 const channels=[1,3,5].map(i=>Math.round(parseInt(from.slice(i,i+2),16)*(1-t)+parseInt(to.slice(i,i+2),16)*t));
 return '#'+channels.map(v=>v.toString(16).padStart(2,'0')).join('');
}
function readable(base:string,anchor:string,backgrounds:readonly string[],minimum:number):string{
 for(let i=0;i<=100;i++){
  const candidate=mixHex(base,anchor,i/100);
  if(backgrounds.every(bg=>contrastRatio(candidate,bg)>=minimum))return candidate;
 }
 return anchor;
}
/** Deterministic, browser-independent semantic role colors. */
export function resolvePalette(p:Palette){
 const dark=luminance(p.bg)<.18;
 const panel=dark?'#27342f':'#f0f2ed';
 const backgrounds=[p.bg,p.surface,panel];
 const muted=readable(dark?'#c4cec9':'#52625b',p.text,backgrounds,4.5);
 const border=readable(p.surface,p.text,backgrounds,3);
 const focus=readable(p.accent,p.text,backgrounds,3);
 const success=readable(p.accent,p.text,backgrounds,3);
 const error=readable(dark?'#ffd5d8':'#a63139',p.text,backgrounds,3);
 const warning=readable(dark?'#ffdb7b':'#74400c',p.text,backgrounds,3);
 const onAccent=contrastRatio('#ffffff',p.accent)>=4.5?'#ffffff':'#101815';
 return {bg:p.bg,surface:p.surface,surface2:panel,text:p.text,textMuted:muted,
  accent:p.accent,onAccent,border,focus,success,error,warning,
  accentSoft:dark?'#253e36':'#e6f2ed',errorSoft:dark?'#5b2c33':'#f9e8e8',dark} as const;
}
export function validatePalette(p:Palette):string[]{
 const errors:string[]=[];
 if(contrastRatio(p.text,p.bg)<4.5)errors.push('Text/background contrast is below 4.5:1');
 if(contrastRatio(p.text,p.surface)<4.5)errors.push('Text/surface contrast is below 4.5:1');
 if(Math.max(contrastRatio(p.accent,p.bg),contrastRatio(p.accent,p.surface))<3)errors.push('Accent not visibly distinct');
 return errors;
}
export function applyTheme(p:Palette){
 const root=document.documentElement;
 const c=resolvePalette(p);
 const vars:Record<string,string>={
  '--bg':c.bg,'--surface':c.surface,'--panel':c.surface2,'--text':c.text,
  '--muted':c.textMuted,'--border':c.border,'--accent':c.accent,
  '--accent-soft':c.accentSoft,'--on-accent':c.onAccent,
  '--ring':c.focus,'--danger':c.error,'--danger-soft':c.errorSoft,
  '--success':c.success,'--warning':c.warning
 };
 for(const [key,value] of Object.entries(vars))root.style.setProperty(key,value);
 root.style.colorScheme=c.dark?'dark':'light';
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',c.bg);
}
