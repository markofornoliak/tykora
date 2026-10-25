import {create} from 'zustand';
import i18next from '../i18n';
import {palettes} from '../../shared/theme/palettes';
import {defaultSettings,type AppSettings} from '../../application/ports/SettingsRepository';
import {repositories} from '../../infrastructure/di/repositories';
import {applyTheme} from '../../shared/theme/applyTheme';
import {uiLocales,type InterfaceLocale} from '../../shared/i18n/catalog';
interface UiStore {settings:AppSettings;ready:boolean;storageNotice:string|null;initialize:(force?:boolean)=>Promise<void>;updateSettings:(partial:Partial<AppSettings>)=>Promise<void>}
function applySettings(settings:AppSettings){
 const palette=settings.themeName==='Custom'&&settings.customTheme?settings.customTheme:palettes.find(p=>p.name===settings.themeName)??palettes[0];
 applyTheme(palette);
 const root=document.documentElement;
 root.lang=uiLocales.includes(settings.uiLocale as InterfaceLocale)?settings.uiLocale:'ru';
 root.classList.toggle('reduce-motion',settings.reduceMotion);
 root.classList.toggle('readable-font',settings.readableFont);
 root.classList.toggle('high-contrast',settings.highContrast);
 root.classList.toggle('one-hand-mode',settings.oneHanded);
 root.style.setProperty('--text-scale',String(settings.textScale/100));
 void i18next.changeLanguage(root.lang);
}
let hydrationPromise:Promise<void>|null=null;
let saveQueue:Promise<void>=Promise.resolve();
export const useUiStore=create<UiStore>((set,get)=>({
 settings:defaultSettings,ready:false,storageNotice:null,
 initialize:async(force=false)=>{
  if(get().ready&&!force)return;
  if(hydrationPromise)return hydrationPromise;
  const operation=(async()=>{
   try{
    const loaded=await repositories.settings.load();
    const valid=loaded.themeName==='Custom'&&loaded.customTheme||palettes.some(p=>p.name===loaded.themeName);
    const settings=valid?loaded:{...loaded,themeName:'Daylight'};
    applySettings(settings);set({settings,ready:true});
   }catch{
    applySettings(defaultSettings);
    set({settings:defaultSettings,ready:true,storageNotice:'IndexedDB is unavailable. Settings may not persist.'});
   }
  })();
  hydrationPromise=operation;
  try{await operation;}finally{if(hydrationPromise===operation)hydrationPromise=null;}
 },
 updateSettings:async(partial)=>{
  if(!get().ready)await get().initialize();
  const settings={...get().settings,...partial};applySettings(settings);set({settings});
  saveQueue=saveQueue.catch(()=>{}).then(()=>repositories.settings.save(settings));
  try{await saveQueue;}catch{set({storageNotice:'Unable to save settings to IndexedDB.'});}
 }
}));
