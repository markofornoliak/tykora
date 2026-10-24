const assert=require('node:assert/strict');
const {createEngine,acceptInput,targetGraphemes,typedGraphemes,finishEngine}=require('../.domain-check/domain/typing/engine.js');
const {calculateScore}=require('../.domain-check/domain/metrics/metrics.js');
let passed=0;function check(label,fn){fn();passed++;console.log('✔',label)}
const prompt={id:'stage7',text:'café aa bb cc',locale:'en',layoutId:'en-qwerty',mode:'custom',license:'user-provided'};
check('Prompt segmentation cached by immutable prompt identity',()=>{
 const a=targetGraphemes(prompt);assert.strictEqual(a,targetGraphemes(prompt));assert.equal(a[3],'é');
});
check('Typed grapheme cache remains stable on immutable state',()=>{
 const a=acceptInput(createEngine(prompt),'café',1000);
 assert.strictEqual(typedGraphemes(a),typedGraphemes(a));assert.equal(typedGraphemes(a).length,4);
});
check('Backspace correction retains metric semantics',()=>{
 let s=createEngine(prompt);s=acceptInput(s,'cafx',1000);s=acceptInput(s,'caf',1500);s=acceptInput(s,prompt.text,10000);
 const score=calculateScore(s,10000);
 assert.equal(score.uncorrectedErrors,0);assert.equal(score.correctedErrors,1);assert.equal(score.typedCharacters,13);
});
check('Long final score computed accurately after a manual finish',()=>{
 const long={...prompt,text:'ab cd '.repeat(1000)};
 let s=acceptInput(createEngine(long),'ab cd '.repeat(1000),1000);
 s={...s,startedAtMs:0,endedAtMs:60000};
 const score=calculateScore(s,60000);
 assert.equal(score.typedCharacters,6000);assert.equal(score.uncorrectedErrors,0);
});
console.log(`${passed} Stage 7 domain cache/score checks passed.`);
