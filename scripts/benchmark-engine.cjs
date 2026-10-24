/* Reproducible Node-only input+metric microbenchmark. NOT a browser interaction latency test. */
const {performance}=require('node:perf_hooks');
const {createEngine,acceptInput}=require('../.domain-check/domain/typing/engine.js');
const {calculateScore}=require('../.domain-check/domain/metrics/metrics.js');
for(const n of [700,1500,4000,6000]){
 const prompt={id:'synthetic',text:'a'.repeat(n),locale:'en',layoutId:'en-qwerty',mode:'custom',license:'user-provided'};
 const prev='a'.repeat(n-1),state={...createEngine(prompt),typed:prev,startedAtMs:0,
  attempts:Array.from({length:n-1},(_,i)=>({char:'a',expected:'a',position:i,atMs:i*85,correct:true,source:'keyboard'})),endedAtMs:null};
 // Warm-up JIT, then measure appending the final character and calculating live metrics.
 for(let i=0;i<5;i++){const s=acceptInput(state,prev+'a',n*85);calculateScore(s,n*85)}
 const times=[];
 for(let i=0;i<40;i++){
  const start=performance.now();const s=acceptInput(state,prev+'a',n*85);calculateScore(s,n*85);
  times.push(performance.now()-start);
 }
 times.sort((a,b)=>a-b);
 console.log(`${n} graphemes: median ${times[20].toFixed(2)} ms, p95 ${times[37].toFixed(2)} ms (Node only)`);
}
