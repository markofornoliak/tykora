import type {SkillNode} from '../../domain/skills/model';
const layouts={
 ru:['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'],
 en:['qwertyuiop','asdfghjkl','zxcvbnm']
} as const;
// Viridis, low to high observed error rate; sequential and color-vision-friendly.
// No per-key data is invented; missing keys are labeled "no observations".
const ramp=['rgb(68 1 84)','rgb(58 82 139)','rgb(32 144 140)','rgb(94 201 97)','rgb(253 231 37)'] as const;
export function heatBin(node:Pick<SkillNode,'failures'|'samples'>):number|null{
 if(node.samples<=0||!Number.isFinite(node.samples)||!Number.isFinite(node.failures))return null;
 const p=Math.max(0,Math.min(1,node.failures/node.samples));
 return Math.min(4,Math.floor(p*5));
}
export function KeyboardHeatmap({nodes,locale}:{nodes:readonly SkillNode[];locale:'ru'|'en'}){
 const observed=new Map(nodes.filter(x=>x.unit==='key'&&x.samples>0).map(x=>[x.sequence.toLowerCase(),x]));
 const rows=layouts[locale];
 const keys=[...new Set(rows.join(''))].map(key=>({key,node:observed.get(key)}));
 return <section className="surface card" aria-labelledby="heatmap-title">
  <h2 id="heatmap-title">Карта наблюдаемых ошибок клавиш</h2>
  <p className="small muted">Цвет — доля ошибок в завершённых сессиях, а не оценка интеллекта или положения пальцев. Нет наблюдений — нет цвета.</p>
  <div className="heatmap-keyboard" aria-hidden="true">{rows.map((row,i)=><div className="heatmap-row" key={i}>{[...row].map(key=>{
   const node=observed.get(key),bin=node?heatBin(node):null;
   return <span key={key} className="heatmap-key" style={{background:bin===null?'var(--panel)':ramp[bin],color:bin===null?'var(--text)':bin<2?'white':'#101815'}}
    title={node?key+': '+node.failures+' errors out of '+node.samples:'Нет наблюдений'}>{key}</span>;
  })}</div>)}</div>
  <div className="heatmap-legend" aria-hidden="true">Меньше ошибок {ramp.map(color=><i key={color} style={{background:color}}/>)} Больше ошибок</div>
  <details><summary>Таблица ошибок клавиатуры ({keys.length} клавиш)</summary>
   <div className="social-table-scroll"><table className="social-table">
    <caption>Реальные наблюдения по клавишам выбранной раскладки. Прочерк означает отсутствие данных.</caption>
    <thead><tr><th scope="col">Клавиша</th><th scope="col">Попыток</th><th scope="col">Ошибок</th><th scope="col">Доля ошибок</th></tr></thead>
    <tbody>{keys.map(({key,node})=><tr key={key}><th scope="row">{key}</th>
     <td>{node?.samples??'—'}</td><td>{node?.failures??'—'}</td>
     <td>{node?(node.failures/node.samples*100).toFixed(1)+'%':'Нет данных'}</td></tr>)}</tbody>
   </table></div>
  </details>
 </section>;
}
