import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PageHeader} from '../../shared/ui/Layout';
import {palettes,type Palette} from '../../shared/theme/palettes';
import {validatePalette} from '../../shared/theme/applyTheme';
import {useUiStore} from '../../app/store/uiStore';
import {contrastRatio} from '../../shared/theme/contrast';
const INITIAL:Palette={name:'Custom',bg:'#f7f7f3',surface:'#ffffff',text:'#19231f',accent:'#185f50'};
const colorNames=['bg','surface','text','accent'] as const;
export function Themes(){
 const {t}=useTranslation();const settings=useUiStore(s=>s.settings),updateSettings=useUiStore(s=>s.updateSettings);
 const [draft,setDraft]=useState<Palette>(()=>settings.customTheme??INITIAL);
 useEffect(()=>{if(settings.customTheme)setDraft(settings.customTheme);},[settings.customTheme]);
 const violations=validatePalette(draft);const ratio=contrastRatio(draft.text,draft.bg);
 const opt=(key:keyof typeof settings,label:string)=><label className="preference-control"><input type="checkbox" checked={Boolean(settings[key])} onChange={e=>void updateSettings({[key]:e.target.checked})}/><span>{label}</span></label>;
 return <section>
  <PageHeader kicker="TYKORA / Design" title={t('display')}>{t('a11yHeading')} · 24 themes · WCAG-conscious controls</PageHeader>
  <div className="theme-layout"><div>
   <div className="section-title" style={{marginTop:0}}><h2>{t('palette')}</h2><span className="chip">24</span></div>
   <div className="themes-grid">{palettes.map(p=><button type="button" key={p.name} className={`theme-choice ${settings.themeName===p.name?'chosen':''}`} aria-pressed={settings.themeName===p.name} aria-label={p.name} onClick={()=>void updateSettings({themeName:p.name})}>
    <span className="theme-preview" style={{background:p.bg,color:p.text}}><i style={{background:p.surface,border:`1px solid ${p.text}`}}/><i style={{background:p.accent}}/><span style={{font:'bold 12px ui-monospace,monospace'}}>Aa</span></span><span className="theme-name">{p.name}</span>
   </button>)}</div>
   <div className="surface card" style={{marginTop:20}}><h2>{t('customTheme')}</h2>
    <div className="color-inputs">{colorNames.map(name=><label key={name}><span>{name}</span><input type="color" value={draft[name]} onChange={e=>setDraft(v=>({...v,[name]:e.target.value}))}/><code>{draft[name]}</code></label>)}</div>
    <div className="custom-preview" style={{background:draft.bg,color:draft.text}}><span>TYKORA / The art and science of typing</span><div style={{background:draft.surface,padding:16,borderRadius:9}}>Aa — 123 · Precision</div><strong style={{color:draft.accent}}>● Focus</strong></div>
    <p className="small" aria-live="polite">Text / background: {ratio.toFixed(2)}:1. {violations.length?`${t('invalidTheme')}: ${violations.join(', ')}`:'Contrast check passed for main text.'}</p>
    <button className="btn primary" type="button" disabled={violations.length>0} onClick={()=>void updateSettings({themeName:'Custom',customTheme:draft})}>{t('saveTheme')}</button>
    <p className="small muted">The color checker covers text/background and basic accent contrast, not a full WCAG audit.</p>
   </div>
  </div><div className="surface card accessible-preferences">
   <h2>{t('a11yHeading')}</h2><p className="small muted">{t('settingsSaved')}</p>
   {opt('reduceMotion',t('motion'))}
   {opt('readableFont',t('readable'))}
   {opt('highContrast',t('contrast'))}
   {opt('oneHanded',t('oneHand'))}
   {opt('gentleMode',t('gentle'))}
   {opt('showKeyboard',t('showKeyboard'))}
   <label className="scale-control" htmlFor="text-scale"><span>{t('scale')}: {settings.textScale}%</span>
    <input id="text-scale" type="range" min="100" max="160" step="10" value={settings.textScale} onChange={e=>void updateSettings({textScale:Number(e.target.value)})}/>
   </label>
   <p className="small muted">Assisted practice keeps raw accuracy and timing unchanged; it never certifies a result. Readable-font mode uses locally installed system fonts, not a clinically validated dyslexia font.</p>
   <p className="small muted">Interface chrome: 10 locales. Long course descriptions and lessons remain Russian / English in this release.</p>
  </div></div>
 </section>;
}
