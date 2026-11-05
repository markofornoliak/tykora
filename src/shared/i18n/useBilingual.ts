import {useUiStore} from '../../app/store/uiStore';
/** RU/EN authored page copy. Other locales currently keep the RU body fallback. */
export function useBilingual(){
 const english=useUiStore(s=>s.settings.uiLocale==='en');
 return (ru:string,en:string)=>english?en:ru;
}
