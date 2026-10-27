import fs from 'node:fs';
function load(folder){
 const rows=Array.from({length:10},(_,i)=>JSON.parse(fs.readFileSync(`${folder}/run-${i+1}.json`,'utf8')));
 if(rows.some(r=>r.actualCharacters!==500||r.inputEvents<475))
  throw new Error(folder+': invalid inputs; samples not comparable');
 return rows;
}
const baseline=load(process.argv[2]||'performance-artifacts/baseline');
const candidate=load(process.argv[3]||'performance-artifacts/candidate');
const sort=xs=>xs.slice().sort((a,b)=>a-b);
const median=xs=>{const s=sort(xs);return (s[4]+s[5])/2};
const stats=(rows,key)=>{
 const values=rows.map(r=>r[key]);if(values.some(v=>!Number.isFinite(v)))return {verified:false,reason:'missing measurements'};
 const sorted=sort(values);
 return {verified:true,n:values.length,median:median(values),min:sorted[0],max:sorted.at(-1),q1:sorted[2],q3:sorted[7]};
};
const old=stats(baseline,'eventTimingP95ms'),next=stats(candidate,'eventTimingP95ms');
const report={source:'scripts/benchmark-input.mjs',protocol:'Chromium CDP CPUx4, 500 inputs, 1280x900, 10 independent runs each',
 baselineSha:baseline[0].sha,candidateSha:candidate[0].sha,
 baseline:{eventTimingP95:old,twoRafUpperBoundP95:stats(baseline,'manualTwoRafUpperBoundP95ms')},
 candidate:{eventTimingP95:next,twoRafUpperBoundP95:stats(candidate,'manualTwoRafUpperBoundP95ms')},
 sameBrowser:baseline.every(r=>r.browser===baseline[0].browser)&&candidate.every(r=>r.browser===baseline[0].browser),
 regressionRatio:old.verified&&next.verified&&old.median>0?Number((next.median/old.median).toFixed(4)):null};
fs.writeFileSync('performance-artifacts/iter4-comparison.json',JSON.stringify(report,null,2)+'\n');
console.log('ITER4_INPUT_COMPARISON '+JSON.stringify(report));
if(!report.sameBrowser||report.regressionRatio===null||report.regressionRatio>1.10){
 console.error('Input latency acceptance FAIL/unverified; do not claim no regression.');
 process.exitCode=1;
}
