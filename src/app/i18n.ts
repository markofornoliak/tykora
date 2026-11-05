import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, uiLocales, type InterfaceLocale } from '../shared/i18n/catalog';
export { uiLocales, type InterfaceLocale } from '../shared/i18n/catalog';
export const supportedLocales = uiLocales;
const navigatorLocale = typeof navigator === 'undefined' ? 'ru' : navigator.language.split('-')[0];
// The checked-in Home prerender is a clean-profile RU snapshot. During its
// first React hydration pass, use the same language as the static DOM. Stored
// preferences still apply after hydration through uiStore.initialize().
const prerenderedHome = typeof document !== 'undefined'
  && document.getElementById('root')?.dataset.tykoraHomePrerender === '1'
  && (!location.hash || location.hash === '#' || location.hash === '#/');
const initialLocale: InterfaceLocale = prerenderedHome
  ? 'ru'
  : uiLocales.includes(navigatorLocale as InterfaceLocale) ? navigatorLocale as InterfaceLocale : 'ru';
void i18next.use(initReactI18next).init({lng:initialLocale, fallbackLng:'ru', resources, interpolation:{escapeValue:false}, returnNull:false });
export default i18next;
