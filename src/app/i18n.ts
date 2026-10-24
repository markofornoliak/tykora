import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, uiLocales, type InterfaceLocale } from '../shared/i18n/catalog';
export { uiLocales, type InterfaceLocale } from '../shared/i18n/catalog';
export const supportedLocales = uiLocales;
const navigatorLocale = typeof navigator === 'undefined' ? 'ru' : navigator.language.split('-')[0];
const initialLocale: InterfaceLocale = uiLocales.includes(navigatorLocale as InterfaceLocale) ? navigatorLocale as InterfaceLocale : 'ru';
void i18next.use(initReactI18next).init({lng:initialLocale, fallbackLng:'ru', resources, interpolation:{escapeValue:false}, returnNull:false });
export default i18next;
