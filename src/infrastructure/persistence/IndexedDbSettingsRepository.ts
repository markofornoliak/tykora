import { db } from './db';
import { defaultSettings, type AppSettings, type SettingsRepository } from '../../application/ports/SettingsRepository';
import { validatePalette } from '../../shared/theme/applyTheme';
import { uiLocales } from '../../shared/i18n/catalog';
import type { Palette } from '../../shared/theme/palettes';
export class IndexedDbSettingsRepository implements SettingsRepository {
  async load():Promise<AppSettings> {
    const row=await db.settings.get('app');
    if(!row||typeof row.value!=='object'||row.value===null)return {...defaultSettings};
    const value=row.value as Partial<AppSettings>;
    const candidate=value.customTheme as Partial<Palette> | undefined;
    const custom=(candidate&&candidate.name==='Custom'&&(['bg','surface','text','accent'] as const).every(k=>typeof candidate[k]==='string'&&/^#[0-9a-fA-F]{6}$/.test(candidate[k]!))&&validatePalette(candidate as Palette).length===0)?candidate as Palette:undefined;
    return {
      themeName:typeof value.themeName==='string'?value.themeName:defaultSettings.themeName,
      customTheme:custom,
      uiLocale:uiLocales.includes(value.uiLocale as typeof uiLocales[number])?value.uiLocale!:defaultSettings.uiLocale,
      reduceMotion:typeof value.reduceMotion==='boolean'?value.reduceMotion:false,
      showKeyboard:typeof value.showKeyboard==='boolean'?value.showKeyboard:true,
      readableFont:typeof value.readableFont==='boolean'?value.readableFont:false,
      textScale:Number.isFinite(value.textScale)?Math.max(100,Math.min(160,Math.round(value.textScale!))):100,
      highContrast:typeof value.highContrast==='boolean'?value.highContrast:false,
      oneHanded:typeof value.oneHanded==='boolean'?value.oneHanded:false,
      gentleMode:typeof value.gentleMode==='boolean'?value.gentleMode:false
    };
  }
  async save(value:AppSettings):Promise<void>{await db.settings.put({key:'app',value});}
}
