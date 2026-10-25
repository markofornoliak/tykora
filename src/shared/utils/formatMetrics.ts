/** Display a speed only when enough input has been observed. Never show null as 0 WPM. */
export function displayWpm(value:number|null|undefined,digits=1):string {
 return typeof value==='number' && Number.isFinite(value) && value>=0 ? value.toFixed(digits) : '—';
}
