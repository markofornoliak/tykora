import type { Palette } from '../../shared/theme/palettes';
export interface AppSettings {
  themeName: string;
  customTheme?: Palette;
  uiLocale: string;
  reduceMotion: boolean;
  showKeyboard: boolean;
  readableFont: boolean;
  textScale: number;
  highContrast: boolean;
  oneHanded: boolean;
  gentleMode: boolean;
}
export interface SettingsRepository { load(): Promise<AppSettings>; save(settings:AppSettings):Promise<void>; }
export const defaultSettings: AppSettings = {
  themeName:'Daylight', uiLocale:'ru', reduceMotion:false, showKeyboard:true,
  readableFont:false, textScale:100, highContrast:false, oneHanded:false, gentleMode:false
};
