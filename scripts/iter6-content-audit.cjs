/** Full-corpus diagnostic. Prints failures; does not waive existing contentLint gates. */
const {writeFileSync,mkdirSync}=require('node:fs');
const {curriculum,lessonPrompt}=require('../.domain-check/domain/lessons/curriculum.js');
const {graphemes}=require('../.domain-check/domain/typing/graphemes.js');
const {overlapRatio}=require('../.domain-check/domain/lessons/contentLint.js');
const {passages}=require('../.domain-check/domain/content/library.js');
function validChars(text){
 return !Array.from(text).some(ch=>ch==='<'
  ||ch==='>'||(ch.charCodeAt(0)<32&&ch!=='\n'&&ch!=='\t'));
}
const records=[],issues=[],seenByLocale={ru:new Map(),en:new Map()};
for(const locale of ['ru','en']){
 for(const lesson of curriculum){
  const practice=lessonPrompt(lesson,locale),review=lessonPrompt(lesson,locale,undefined,'review');
  const focus=graphemes(locale==='ru'?lesson.focusRu:lesson.focusEn).filter(x=>x.trim());
  const focusSet=new Set(focus);
  const coverSet=new Set(graphemes(review.text));
  const missing=[...focusSet].filter(c=>!coverSet.has(c));
  const overlap=overlapRatio(practice.text,review.text,4);
  const lengths=[graphemes(practice.text).length,graphemes(review.text).length];
  const mismatch=practice.id===review.id||practice.text===review.text;
  const missingId=review.id===practice.id;
  const charsOkay=validChars(practice.text)&&validChars(review.text);
  const summary={id:lesson.id,index:lesson.index,locale,practiceId:practice.id,reviewId:review.id,
   overlap,practiceLength:lengths[0],reviewLength:lengths[1],focusMissing:missing,
   charsOkay,identical:mismatch,legacyReview:review.id.endsWith('-review')};
  records.push(summary);
  if(overlap>=0.10)issues.push({...summary,reason:'4-gram overlap >= 10%'});
  if(lengths.some(n=>n<30||n>800))issues.push({...summary,reason:'length outside 30..800'});
  if(missing.length)issues.push({...summary,reason:'missing focus characters'});
  if(mismatch||missingId)issues.push({...summary,reason:'practice and review identical'});
  if(!charsOkay)issues.push({...summary,reason:'forbidden characters'});
  for(const [label,text] of [['practice',practice.text],['review',review.text]]){
   const canonical=text.normalize('NFC');
   const key=label+':'+canonical;
   const previous=seenByLocale[locale].get(key);
   if(previous)issues.push({...summary,reason:'duplicate '+label+' content',duplicateOf:previous});
   else seenByLocale[locale].set(key,lesson.id);
  }
 }
}
if(curriculum.length!==124)throw Error('Course count must remain exactly 124, found '+curriculum.length);
const summary={sha:process.env.GITHUB_SHA??'unknown',courseLessons:curriculum.length,
  localePairs:records.length,issues:issues.length,overlapFailures:issues.filter(i=>i.reason.includes('overlap')).length,
  duplicateFailures:issues.filter(i=>i.reason.includes('duplicate')).length,
  focusFailures:issues.filter(i=>i.reason.includes('focus')).length,
  legacyReviewIds:records.filter(r=>r.legacyReview).length,
  worstOverlap:Math.max(...records.map(r=>r.overlap)),
  source:'Compiled domain-only TypeScript, full RU/EN 124-lesson corpus, all practice/review pairs',
  verdict:issues.length===0?'ALL PASS':'FAIL (audit only, not a green content gate)'};
const report={summary,records,issues};
mkdirSync('performance-artifacts/iter6-content',{recursive:true});
writeFileSync('performance-artifacts/iter6-content/full-corpus.json',JSON.stringify(report,null,2));
console.log('ITER6_CONTENT_AUDIT '+JSON.stringify(summary));
console.log('ITER6_CONTENT_EXAMPLES '+JSON.stringify(issues.slice(0,10).map(i=>({id:i.id,locale:i.locale,reason:i.reason,overlap:i.overlap}))));
