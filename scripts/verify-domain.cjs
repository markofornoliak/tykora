/* Dependency-free smoke suite; Vitest tests are also included for npm CI. */
const assert=require('node:assert/strict');
const {createEngine,acceptInput}=require('../.domain-check/domain/typing/engine.js');
const {calculateScore}=require('../.domain-check/domain/metrics/metrics.js');
const {alignText}=require('../.domain-check/domain/metrics/alignment.js');
const {updateSkillProfile,skillId}=require('../.domain-check/domain/skills/model.js');
const {generateDrill}=require('../.domain-check/domain/skills/generator.js');
const {diagnostics,words}=require('../.domain-check/domain/content/prompts.js');
const en={...diagnostics.en,text:'abcdefghij'};
let passed=0;
function check(name,fn){fn();passed++;console.log('✔',name);}
check('Unicode graphemes and NFC',()=>{
 const s=acceptInput(createEngine({...en,text:'café!'}),'cafe\u0301!',100);
 assert.equal(s.typed,'café!');assert.equal(s.attempts.length,5);
});
check('Pasting rejected',()=>assert.deepEqual(acceptInput(createEngine(en),'abcdefghij',100,'paste'),createEngine(en)));
check('Corrected errors counted',()=>{
 let s=createEngine(en);s=acceptInput(s,'abx',1000);s=acceptInput(s,'ab',2000);s=acceptInput(s,'abcdefghij',10000);
 assert.equal(s.correctedErrors,1);assert.equal(s.deletions,1);assert.equal(calculateScore(s,10000).uncorrectedErrors,0);
});
check('Adjacent transpose',()=>assert.equal(alignText('abcd','acbd').errors[0]?.kind,'transposition'));
check('Insertion',()=>assert.equal(alignText('abcd','abxcd').errors[0]?.kind,'insertion'));
check('Omission',()=>assert.equal(alignText('abcd','acd').errors[0]?.kind,'omission'));
check('Substitution',()=>assert.equal(alignText('abcd','abxd').errors[0]?.kind,'substitution'));
check('Gross/net WPM at 60 seconds',()=>{
 let s=acceptInput(createEngine(en),'abcdefghij',60000);s={...s,startedAtMs:0,endedAtMs:60000};const m=calculateScore(s,60000);
 assert.equal(m.rawWpm,2);assert.equal(m.netWpm,2);assert.equal(m.accuracy,1);
});
check('IME composition commit once',()=>{
 const p={...en,text:'日本abc'};
 let s=acceptInput(createEngine(p),'日本',1000,'composition');s=acceptInput(s,'日本',1500,'composition');assert.equal(s.attempts.length,2);
});
check('No skill changes on short session',()=>{
 const s=acceptInput(createEngine(en),'abcdefghij',1000);assert.equal(Object.keys(updateSkillProfile({},s,10000)).length,0);
});
check('Per-key and n-gram learning',()=>{
 const prompt={...en,text:'abcdefghijklmnopqrstuvwxy'};
 let s=acceptInput(createEngine(prompt),prompt.text,9000);s={...s,startedAtMs:0,endedAtMs:9000};
 const p=updateSkillProfile({},s,Date.now());
 assert.equal(p[skillId('en-qwerty','en','key','a')].samples,1);
 assert.equal(p[skillId('en-qwerty','en','bigram','ab')].samples,1);
 assert.equal(p[skillId('en-qwerty','en','trigram','abc')].samples,1);
});
check('Adaptive drills are deterministic and unique',()=>{
 const opts={locale:'en',layoutId:'en-qwerty',seed:314159,wordCount:20};
 const a=generateDrill({},words.en,opts),b=generateDrill({},words.en,opts);
 assert.equal(a,b);const tokens=a.split(' ');assert.equal(new Set(tokens).size,tokens.length);
});
console.log(`${passed} domain checks passed.`);
const {curriculum,levels,lessonPrompt,completionFromScores}=require('../.domain-check/domain/lessons/curriculum.js');
const {passages}=require('../.domain-check/domain/content/library.js');
const {seedFromDate,promptForMode}=require('../.domain-check/domain/modes/modes.js');
const {finishEngine}=require('../.domain-check/domain/typing/engine.js');
check('Curriculum: 124 unique lessons in 10 levels',()=>{
 assert.equal(levels.reduce((s,l)=>s+l.count,0),124);
 assert.equal(curriculum.length,124);assert.equal(new Set(curriculum.map(l=>l.id)).size,124);
});
check('Localized lesson content: 124 unique exercises per language',()=>{
 for(const locale of ['ru','en']) {
  const prompts=curriculum.map(l=>lessonPrompt(l,locale));
  assert.equal(new Set(prompts.map(p=>p.text)).size,124);
  assert.ok(prompts.every(p=>p.license==='original'&&p.text.length>=30));
 }
});
check('Licensed source library contains 44 passages',()=>{
 assert.equal(passages.length,44);
 assert.ok(passages.every(p=>p.license==='original'&&p.text.length>20));
});
check('Daily challenge is deterministic',()=>{
 const seed=seedFromDate('2026-10-25','en');const opts={mode:'daily',locale:'en',layoutId:'en-qwerty',seed};
 assert.deepEqual(promptForMode(opts),promptForMode(opts));
});
check('Custom text does not misrepresent licensing',()=>{
 const p=promptForMode({mode:'custom',locale:'en',layoutId:'en-qwerty',seed:1,customText:'cafe\u0301 greeting'});
 assert.equal(p.text,'café greeting');assert.equal(p.license,'user-provided');
});
check('Timed finish does not count unseen text as omissions',()=>{
 const p=promptForMode({mode:'time',locale:'en',layoutId:'en-qwerty',seed:1});
 let s=createEngine(p);s=acceptInput(s,p.text.slice(0,22),1000);s=finishEngine(s,16000);
 assert.equal(calculateScore(s,16000).uncorrectedErrors,0);
 assert.equal(calculateScore(s,16000).durationMs,15000);
});
check('Lesson mastery requires a completed practice and distinct review text',()=>{
 const l=curriculum[0],p=lessonPrompt(l,'ru'),r=lessonPrompt(l,'ru',undefined,'review');
 const base={id:'old-session',endedAt:'2026-10-21T00:00:00.000Z',promptId:p.id,summary:{accuracy:1,netWpm:30,typedCharacters:p.text.length}};
 assert.equal(completionFromScores([{...base,summary:{...base.summary,typedCharacters:1}}],'ru').size,0);
 assert.equal(completionFromScores([base],'ru').size,0);
 assert.equal(completionFromScores([base,{...base,id:'again'}],'ru').size,0);
 assert.equal(completionFromScores([base,{...base,id:'review',endedAt:'2026-10-23T00:00:00.000Z',promptId:r.id,summary:{...base.summary,typedCharacters:r.text.length}}],'ru').size,1);
});
console.log(`${passed} total independent domain checks passed.`);
const {dailyRoutine}=require('../.domain-check/domain/plans/plan.js');
check('Local training plan divides 10, 15, 20 minute schedule exactly',()=>{
 for(const dailyMinutes of [10,15,20]) {
  const routine=dailyRoutine({id:'current',targetWpm:80,horizonDays:60,dailyMinutes,createdAt:'2026-10-25T00:00:00Z',locale:'ru'});
  assert.equal(routine.reduce((sum,item)=>sum+item.minutes,0),dailyMinutes);
 }
});
console.log(`${passed} final domain checks passed.`);

check('Long marathon scoring handles texts above 1,200 graphemes',()=>{
 const value='typing practice '.repeat(310);
 const typo=value.slice(0,1400)+'z'+value.slice(1401);
 const alignment=alignText(value,typo);
 assert.equal(alignment.distance,1);
 assert.equal(alignment.correct,value.length-1);
});
check('Long custom text remains bounded by grapheme count',()=>{
 const {graphemes}=require('../.domain-check/domain/typing/graphemes.js');
 const content='🙂'.repeat(6000);
 assert.equal(graphemes(promptForMode({mode:'custom',locale:'ru',layoutId:'ru-jcuken',seed:2,customText:content}).text).length,6000);
 assert.throws(()=>promptForMode({mode:'custom',locale:'ru',layoutId:'ru-jcuken',seed:2,customText:content+'🙂'}));
});
console.log(`${passed} final Stage 5 domain checks passed.`);
