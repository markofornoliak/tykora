const layouts:Record<string,readonly string[]>={
 'ru-jcuken':['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'],
 'ru-phonetic':['qwertyuiop','asdfghjkl','zxcvbnm'],
 'en-qwerty':['qwertyuiop','asdfghjkl','zxcvbnm'],
 'en-qwertz':['qwertzuiop','asdfghjkl','yxcvbnm'],
 'en-azerty':['azertyuiop','qsdfghjklm','wxcvbn'],
 'en-dvorak':[`',.pyfgcrl`,'aoeuidhtns',';qjkxbmwvz'],
 'en-colemak':['qwfpgjluy;','arstdhneio','zxcvbkm'],
 'en-workman':['qdrwbjfup;','ashtgyneoi','zxmcvkl']
};
export function KeyboardPreview({next,locale,layoutId,code}:{next:string;locale:'ru'|'en';layoutId:string;code:string}){
 const rows=layouts[layoutId]??layouts[locale==='ru'?'ru-jcuken':'en-qwerty'];
 return <div className="keyboard" aria-label={`Следующий символ: ${next}`}>
  {rows.map((r,i)=><div className="keys" key={i} aria-hidden="true">{[...r].map((key,j)=><span key={`${i}-${j}`} className={`key ${key===next.toLowerCase()?'hot':''}`}>{key}</span>)}</div>)}
  <div className="keys"><span className={`key space ${next===' '?'hot':''}`}>Пробел</span></div>
  <p className="small muted" style={{marginTop:12}}>Макет: {layoutId}. Клавиши только показывают выбранную схему; фактическую системную раскладку браузер не переключает. Последний code: {code||'—'}.</p>
 </div>;
}
