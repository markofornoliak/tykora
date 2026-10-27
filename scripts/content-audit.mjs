import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

const require=createRequire(import.meta.url);
const {curriculum,lessonPrompt}=require('../.domain-check/domain/lessons/curriculum.js');
const {passages}=require('../.domain-check/domain/content/library.js');
const {sqlExamples}=require('../.domain-check/domain/content/sql.js');
const locales=['ru','en'];
const tokenize=text=>(text.toLocaleLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu)??[]);
const segmenter=new Intl.Segmenter('en',{granularity:'grapheme'});
const length=text=>[...segmenter.segment(text)].length;
const round=n=>Number(n.toFixed(4));
const wordsOf=text=>new Set(tokenize(text));
function metrics(text){
 const words=tokenize(text),counts=new Map();
 for(const w of words)counts.set(w,(counts.get(w)??0)+1);
 const ngrams=words.slice(0,-1).map((w,i)=>w+' '+words[i+1]);
 const adjacentRepeat=words.slice(1).filter((w,i)=>w===words[i]).length;
 const seen=new Set(),repeatNgrams=ngrams.filter(n=>seen.has(n)||!seen.add(n)).length;
 return {graphemes:length(text),tokens:words.length,uniqueWords:counts.size,
  ttr:words.length?round(counts.size/words.length):0,
  topWordShare:words.length?round(Math.max(...counts.values())/words.length):0,
  adjacentRepeat,repeatBigramShare:ngrams.length?round(repeatNgrams/ngrams.length):0};
}
const lessons=locales.flatMap(locale=>curriculum.map(lesson=>{
 const practice=lessonPrompt(lesson,locale,undefined,'practice');
 const review=lessonPrompt(lesson,locale,undefined,'review');
 const a=wordsOf(practice.text),b=wordsOf(review.text);
 return {id:lesson.id,locale,level:lesson.level,practice:metrics(practice.text),
  review:metrics(review.text),sharedWords:[...a].filter(w=>b.has(w)).length,
  sharedWordRatio:a.size?round([...a].filter(w=>b.has(w)).length/a.size):0,
  practiceId:practice.id,reviewId:review.id};
}));
const library=passages.map(p=>({id:p.id,locale:p.locale,track:p.track,license:p.license,...metrics(p.text)}));
const groups=locales.flatMap(locale=>Array.from({length:10},(_,n)=>{
 const items=lessons.filter(x=>x.locale===locale&&x.level===n+1);
 const mean=k=>round(items.reduce((sum,x)=>sum+x.practice[k],0)/items.length);
 return {locale,level:n+1,lessons:items.length,avgPracticeTtr:mean('ttr'),
  avgPracticeTopWordShare:mean('topWordShare'),
  avgRepeatedBigramShare:mean('repeatBigramShare'),
  avgSharedWordRatio:round(items.reduce((s,x)=>s+x.sharedWordRatio,0)/items.length)};
}));
const byTrack=locales.flatMap(locale=>[...new Set(library.map(p=>p.track))].sort().map(track=>{
 const entries=library.filter(p=>p.locale===locale&&p.track===track);
 return {locale,track,passages:entries.length,averageTtr:round(entries.reduce((s,x)=>s+x.ttr,0)/entries.length)};
}));
const report={base:'0a7d167bc320b503a03dfe1247c96687526ca28b',tool:'scripts/content-audit.mjs',
 lessons:lessons.length,passages:library.length,groups,byTrack,lessonMetrics:lessons,passageMetrics:library};
if(process.argv.includes('--check')){
 assert.equal(curriculum.length,124,'course ids must stay stable');
 assert.equal(new Set(curriculum.map(l=>l.id)).size,124);
 for(const locale of locales){
  const entries=passages.filter(p=>p.locale===locale&&p.track==='code-sql');
  assert.equal(entries.length,24,'24 SQL examples per locale');
  assert.equal(new Set(entries.map(p=>p.id)).size,24);
  assert.ok(entries.every(p=>p.license==='original'));
 }
 assert.equal(sqlExamples.length,24);
 assert.ok(passages.every(p=>p.license==='original'&&p.text===p.text.normalize('NFC')));
 assert.ok(passages.every(p=>!p.text.split('\n').some(line=>/[\t ]+$/.test(line))));
 const python=`import json, sqlite3, sys
db=sqlite3.connect(':memory:')
for i,sql in enumerate(json.load(sys.stdin),1):
 try:
  db.execute(sql).fetchall()
 except sqlite3.Error as e:
  print(f'SQL example {i}: {e}',file=sys.stderr)
  sys.exit(1)
print('24 self-contained SQLite snippets passed',file=sys.stderr)
`;
 const result=spawnSync('python3',['-c',python],{input:JSON.stringify(sqlExamples.map(x=>x.text)),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.error?.message||'SQLite unavailable');
 console.log('Content structural / SQL syntax checks passed. Curriculum diversity thresholds are AUDIT-ONLY, not passed.');
}
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else {
 console.log('CONTENT_AUDIT '+JSON.stringify({lessons:report.lessons,passages:report.passages,groups,byTrack}));
 console.log('NOTE: legacy practice/review overlap is measured, NOT silently exempted or fixed.');
}
