import type { TypingPrompt } from '../typing/contracts';
import type { SupportedLocale } from '../content/library';
import {graphemes} from '../typing/graphemes';
import {recoverReviewLength} from './reviewIdentity';

export const COURSE_VERSION='tykora-curriculum-1.0';
export interface CourseLevel {id:string;number:number;titleRu:string;titleEn:string;count:number;goalRu:string;goalEn:string;}
export interface CourseLesson {
 id:string;index:number;level:number;step:number;titleRu:string;titleEn:string;
 focusRu:string;focusEn:string;objectiveRu:string;objectiveEn:string;
 durationMinutes:number;contentVersion:string;
}
export const levels:readonly CourseLevel[]=[
 {id:'foundations',number:1,titleRu:'Основы слепой печати',titleEn:'Foundations',count:14,goalRu:'Домашний ряд и техника.',goalEn:'Home row and posture.'},
 {id:'reach',number:2,titleRu:'Верхний и нижний ряды',titleEn:'Reach',count:16,goalRu:'Новые клавиши без взгляда вниз.',goalEn:'Reach without looking down.'},
 {id:'fluency',number:3,titleRu:'Точность и слова',titleEn:'Fluency',count:12,goalRu:'Частые слова и плавность.',goalEn:'Words and accuracy.'},
 {id:'control',number:4,titleRu:'Заглавные и пунктуация',titleEn:'Control',count:12,goalRu:'Shift и знаки препинания.',goalEn:'Shift and punctuation.'},
 {id:'precision',number:5,titleRu:'Числа и символы',titleEn:'Precision',count:12,goalRu:'Числа, символы и цифровой блок.',goalEn:'Numbers, symbols and numpad.'},
 {id:'language',number:6,titleRu:'Языки и раскладки',titleEn:'Language',count:12,goalRu:'Разные раскладки и переключения.',goalEn:'Layouts and switching.'},
 {id:'rhythm',number:7,titleRu:'Ритм',titleEn:'Rhythm',count:10,goalRu:'Ровные интервалы и концентрация.',goalEn:'Stable timing and focus.'},
 {id:'speed',number:8,titleRu:'Скорость',titleEn:'Speed',count:12,goalRu:'Короткие быстрые интервалы.',goalEn:'Controlled speed bursts.'},
 {id:'endurance',number:9,titleRu:'Выносливость',titleEn:'Endurance',count:12,goalRu:'Тексты без потери точности.',goalEn:'Sustained precision.'},
 {id:'mastery',number:10,titleRu:'Мастерство',titleEn:'Mastery',count:12,goalRu:'Смешанная сложность и рабочие тексты.',goalEn:'Complex practical text.'}
];
const patternsRu=[
 ['ф ы в а','о л д ж','фы ва ол дж','фыва прол','а в о л','п р а о','л д ж э','ф ы а в','р о л д','в а п р','фыва олдж','ао во фы','жд ло па','фывапр олджэ'],
 ['й ц у к','е н г ш','щ з х ъ','я ч с м','и т ь б','ю я ч с','ва рак','мак мама','рука море','окно дело','слово число','план урок','ветер поле','книга мир','кошка лодка','новое слово'],
 ['точность практика','работа время','человек книга','новая задача','внимание результат','тренировка привычка','система данные','развитие навык','грамотный текст','точный смысл','спокойная работа','светлый город'],
 ['Большая буква.','Точка, запятая.','Вопрос? Ответ!','Сегодня: новый план.','Начало и конец.','Пример (один).','Имя — важная деталь.','Первое; второе.','Это «цитата».','А, Б и В.','Короткий текст!','Я учусь печатать.'],
 ['12 24 36','2026 14 28','3.14 2.71','1500 2500','5% 15% 25%','(1) [2] {3}','+ - = / *','08:30 17:45','10,5 20,75','№ 5; № 12','100 / 4 = 25','123 456 789'],
 ['RU EN DE','латиница кириллица','QWERTY ЙЦУКЕН','hello привет','mail письмо','code код','2026 project','Berlin Киев','data данные','format формат','text текст','смена языка'],
 ['тихий ровный ритм','плавное движение','короткая пауза','три точных слова','осознанная печать','меньше случайных ошибок','точность важнее спешки','ритм и внимание','уверенность без рывков','ровная длинная строка'],
 ['быстрый ответ','точный выбор','новая задача','короткий рывок','правильный ввод','чистый результат','быстрая реакция','время имеет значение','знакомое движение','проверка точности','сохраняй ритм','стабильная скорость'],
 ['практика приносит устойчивый результат','каждый текст помогает освоить навык','сохраняй спокойный ритм в длинной строке','задача требует внимания и ясной мысли','проверяй результат после каждого подхода','новые сочетания требуют терпения','хорошая привычка развивается постепенно','план на день помогает найти время','короткий отдых улучшает внимание','точность важнее случайного рекорда','читай несколько слов перед курсором','тренировка заканчивается спокойно'],
 ['В отчёте указаны 24 проекта.','Проверь план: 12 задач за 30 дней.','Новый опыт требует ясного решения.','Сверьте данные до отправки письма.','Запиши наблюдение и сделай вывод.','Сложная строка: (A + B) / 2.','До 17:30 нужно проверить итог.','Точность в деталях создаёт доверие.','Письмо готово; проверь адрес.','В начале недели поставь цель.','Сделай перерыв и продолжай работу.','Настоящий навык устойчив к ошибкам.']
];
const patternsEn=[
 ['a s d f','j k l ;','as df jk l;','asdf jkl;','a s l k','f d j k','a d s f','j l k ;','dad sad fad','ask flask','lad fall','salad flask','fall dad','ask a lad'],
 ['q w e r','t y u i','o p q w','z x c v','b n m z','top row','zip zap','quick map','work out','make tea','quiet mind','new idea','typing goal','word game','open page','strong skill'],
 ['steady typing','smooth rhythm','clear thinking','small steps','better habits','careful practice','focused learning','natural words','honest results','daily progress','gentle pace','useful skills'],
 ['Capital Letters.','Comma, period.','Question? Answer!','Start: now.','First and last.','Example (one).','A simple note.','First; second.','A "quoted" word.','A, B, and C.','A short line!','I can improve.'],
 ['12 24 36','2026 14 28','3.14 2.71','1500 2500','5% 15% 25%','(1) [2] {3}','+ - = / *','08:30 17:45','10.5 20.75','#5 and #12','100 / 4 = 25','123 456 789'],
 ['EN RU DE','latin and cyrillic','QWERTY QWERTZ','hello привет','mail письмо','code код','2026 project','Berlin Kyiv','data данные','format формат','text текст','switch layout'],
 ['a steady pace','smooth movements','a short pause','three careful words','mindful typing','fewer small errors','accuracy before speed','rhythm and focus','confidence without rush','a long stable line'],
 ['rapid response','careful choice','fresh challenge','a short sprint','correct input','clean result','quick reaction','time is valuable','familiar motion','precision check','keep the rhythm','steady speed'],
 ['practice builds lasting improvement','every new text teaches a useful skill','maintain your rhythm across long lines','the task requires care and clear thinking','review your results after each attempt','unfamiliar patterns require patience','good habits grow through repeated practice','a daily plan helps you find enough time','a brief break can restore attention','accuracy matters more than a lucky record','read a few words ahead of the cursor','finish each session with calm focus'],
 ['The report lists 24 projects.','Check the plan: 12 tasks in 30 days.','New ideas require clear decisions.','Review the data before sending it.','Record the observation and its outcome.','Complex code: (A + B) / 2.','Review the result before 17:30.','Small details build lasting trust.','The email is ready; check the address.','Set a goal at the start of the week.','Take a break and return to the task.','A real skill survives small mistakes.']
];
const phases=['Знакомство','Контроль','Повторение','Уверенность','Переход','Применение'] as const;
const phaseEn=['Introduction','Control','Review','Confidence','Transition','Application'] as const;
export const curriculum:readonly CourseLesson[]=levels.flatMap((lvl)=>Array.from({length:lvl.count},(_,i)=>{
 const focusRu=patternsRu[lvl.number-1][i]; const focusEn=patternsEn[lvl.number-1][i];
 const phase=i%6;
 return {id:`L${String(lvl.number).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,index:levels.slice(0,lvl.number-1).reduce((s,l)=>s+l.count,0)+i+1,level:lvl.number,step:i+1,
 titleRu:`${phases[phase]} · ${focusRu}`,titleEn:`${phaseEn[phase]} · ${focusEn}`,
 focusRu,focusEn,objectiveRu:lvl.goalRu,objectiveEn:lvl.goalEn,durationMinutes:3+(i%4),contentVersion:COURSE_VERSION};
}));
function repeatFocus(focus:string,steps:number):string {return Array.from({length:steps},(_,i)=>`${focus}${i%3===2?' .':''}`).join(' ').replace(/ \./g,'.');}
const proseRu=['В начале тренировки сохраняйте ровную посадку и расслабленные плечи.','Следите за точностью, а не за случайным рекордом скорости.','Старайтесь не смотреть на руки и находить клавиши на ощупь.','После занятия проверьте ошибки и сделайте короткий перерыв.'];
const proseEn=['Sit comfortably and keep your shoulders relaxed while typing.','Focus on accuracy rather than chasing a lucky speed record.','Try not to look at your hands while you locate each key.','Review your mistakes after the session and take a short break.'];
/** Original holdout variants for the first three lessons. Do not overwrite
 * historical course-*-review IDs: old session scores must retain their original
 * expected text lengths. */
const firstThreeReviewV2:Record<SupportedLocale,readonly string[]>={"ru":["вафы афыв выфа ываф фавы вафы афыв выфа ываф фавы","лодж дожл жолд оджл лждо лодж дожл жолд оджл лждо","оадлфжвыоа длфжвыоадл фжвыоадлфж выоадлфжвы оадлфжвыоа длфжвыоадл"],"en":["fads dafs sfad fad asdf dasf fads dafs sfad fad asdf","ljk; ;lkj klj; j;lk ;jkl ljk; ;lkj klj; j;lk ;jkl","jflka;dsjf lka;dsjflk a;dsjflka; dsjflka;ds jflka;dsjf lka;dsjflk"]};
function legacyReviewText(lesson:CourseLesson,locale:SupportedLocale):string{
 const focus=locale==='ru'?lesson.focusRu:lesson.focusEn;
 const prose=locale==='ru'?proseRu:proseEn;
 const reversed=focus.split(' ').reverse().join(' ');
 return lesson.level<=2
  ? `${repeatFocus(reversed,4)} ${repeatFocus(focus,2)}`
  : `${repeatFocus(reversed,2)} ${prose[lesson.index%prose.length]} ${repeatFocus(focus,2)} ${repeatFocus(reversed,1)}`;
}


/** Generated original holdouts: letter drills in levels 1–2; independent
 * readable scenarios and focus-key drills for levels 3–10. The deterministic
 * v3 identifiers never rewrite or reinterpret historical review-v1/v2 IDs. */
const holdoutScenes:Record<SupportedLocale,readonly string[]>={
 ru:[
  'В мастерской инженер записал необычное наблюдение и повторил опыт. После проверки прибор снова работал ровно.',
  'Ранним утром на вокзале открыли новый зал ожидания. Пассажиры сверяли маршруты и готовились к поездке.',
  'После дождя в саду появились первые цветы. Садовник поправил дорожку и бережно осмотрел молодые растения.',
  'Редактор внимательно перечитал заметку и заменил неточную фразу. Статья стала понятнее без лишних слов.',
  'На заседании команды распределили задачи и уточнили сроки. Все решения аккуратно внесли в рабочий протокол.',
  'На столе лежала старая карта с небольшими пометками. Путешественник сверил маршрут и закрыл блокнот.',
  'Архитектор нарисовал светлую комнату с большим окном. За окном виднелись деревья и тихая площадь.',
  'В лаборатории сохранили результаты измерения и повторили испытание. Вывод сделали после второй проверки.',
  'Курьер принёс посылку в соседний дом. Получатель проверил адрес и оставил подпись в журнале.',
  'Учитель предложил сравнить несколько способов решения. Каждый ученик объяснил собственную мысль.',
  'Музыкант проверил инструмент перед началом репетиции. В концертном зале ещё было тихо.',
  'На берегу реки установили указатель для пешеходов. Новая дорожка проходила рядом с высоким деревом.'
 ],
 en:[
  'The engineer noticed an unusual sound in the workshop and recorded it. A second inspection confirmed the cause.',
  'Early in the morning the station opened a new waiting room. Travelers checked the routes before departure.',
  'After the rain bright flowers appeared in the garden. The gardener inspected the soil and cleared a narrow path.',
  'An editor carefully reviewed the article and replaced an unclear sentence. The final draft became easier to read.',
  'The team assigned the tasks and confirmed a clear schedule. Every decision was recorded in the meeting notes.',
  'An old map lay next to a small notebook. The traveler checked the route and packed the supplies before leaving.',
  'The architect sketched a room filled with daylight. A wide window overlooked the quiet square outside.',
  'The laboratory saved the observations and repeated the experiment. Only then did the researchers draw a conclusion.',
  'The courier delivered a small package to a nearby building. The recipient checked the address and signed the log.',
  'The teacher asked students to compare several solutions. Everyone explained a different way to solve the problem.',
  'A musician checked the instrument before rehearsal began. The concert hall was still quiet and cool.',
  'A new sign marked the walking route beside the river. The path turned near a tall tree and a wooden bridge.'
 ]
};
const v3ReviewCache=new Map<string,string>();
function seedReview(text:string):number{
 let h=2166136261;
 for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function fourGramOverlap(a:string,b:string):number{
 const set=(text:string)=>{const chars=graphemes(text),result=new Set<string>();
  for(let i=0;i+4<=chars.length;i++)result.add(chars.slice(i,i+4).join(''));
  return result;};
 const left=set(a),right=set(b);
 return right.size?[...right].filter(s=>left.has(s)).length/right.size:1;
}
function versionThreeReview(lesson:CourseLesson,locale:SupportedLocale,practice:string):string{
 const key=lesson.id+':'+locale;
 const cached=v3ReviewCache.get(key);if(cached)return cached;
 const chars=[...new Set(graphemes(locale==='ru'?lesson.focusRu:lesson.focusEn).filter(c=>c.trim()))];
 const alphabet=chars.filter(c=>!/[.,!?;:()[\]{}#+=/%«»"—–]/u.test(c));
 const pool=alphabet.length>=2?alphabet:chars;
 let best='',lowest=Infinity;
 for(let trial=0;trial<128;trial++){
  let state=seedReview(key+'v3:'+trial);
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state>>>8;};
  const coverage=[...chars];
  for(let i=coverage.length-1;i>0;i--){const j=random()%(i+1);[coverage[i],coverage[j]]=[coverage[j],coverage[i]];}
  const words=[coverage.join('')];
  for(let w=0;w<(lesson.level<=2?40:14);w++){
   let token='';const n=4+random()%5;
   for(let i=0;i<n;i++)token+=pool[random()%pool.length];
   words.push(token);
  }
  const scenes=holdoutScenes[locale];
  const prose=lesson.level<=2?'':[
   scenes[(lesson.index+trial*3)%scenes.length],
   scenes[(lesson.index*7+trial*5+1)%scenes.length],
   scenes[(lesson.index*11+trial*7+3)%scenes.length]
  ].join(' ');
  const candidate=(prose?prose+' ':'')+words.join(' ');
  const ratio=fourGramOverlap(practice,candidate);
  if(ratio<lowest){best=candidate;lowest=ratio;}
  if(lowest<0.10)break;
 }
 v3ReviewCache.set(key,best);
 return best;
}

/** Two stable original text variants. Legacy v0.8 prompts retain their original id. */
export type LessonVariant='practice'|'review';
export function lessonPrompt(lesson:CourseLesson,locale:SupportedLocale,layoutId?:string,variant:LessonVariant='practice'):TypingPrompt {
 const focus=locale==='ru'?lesson.focusRu:lesson.focusEn;
 const prose=locale==='ru'?proseRu:proseEn;
 const reversed=focus.split(' ').reverse().join(' ');
 const practiceText=lesson.level<=2
   ? `${repeatFocus(focus,5)} ${repeatFocus(reversed,3)}`
   : `${repeatFocus(focus,3)} ${prose[(lesson.index-1)%prose.length]} ${repeatFocus(focus,2)}`;
 const text=variant==='review'
   ? lesson.index<=3?firstThreeReviewV2[locale][lesson.index-1]:versionThreeReview(lesson,locale,practiceText)
   : practiceText;
 if(graphemes(text).length<30) throw new Error('Course exercise too short');
 return {id:`course-${lesson.id}-${locale}${variant==='review'?(lesson.index<=3?'-review-v2':'-review-v3'):''}`,text,mode:'lesson',locale,
  layoutId:layoutId??(locale==='ru'?'ru-jcuken':'en-qwerty'),license:'original',sourceAttribution:'TYKORA original course'};
}
export function findLesson(id:string):CourseLesson|undefined{return curriculum.find(l=>l.id===id);}

export const LESSON_REVIEW_DELAY_MS=2*60*60*1000;
/** A review is eligible after 2h or the next UTC calendar date, whichever comes first. */
export function nextReviewAt(firstMs:number):number {
 if(!Number.isFinite(firstMs))throw new Error('Invalid practice timestamp');
 const d=new Date(firstMs);
 return Math.min(firstMs+LESSON_REVIEW_DELAY_MS,Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()+1));
}
export function eligibleReviewPair(firstMs:number,secondMs:number):boolean {
 return Number.isFinite(firstMs)&&Number.isFinite(secondMs)&&secondMs>=nextReviewAt(firstMs);
}
export const LESSON_MASTERY_ACCURACY=0.95;
export const LESSON_MASTERY_MIN_GRAPHEMES=30;
/** Minimum attempt accuracy increases conservatively with course difficulty. */
export function lessonMinimumAccuracy(lesson:CourseLesson):number {
 return lesson.level<=2?LESSON_MASTERY_ACCURACY:lesson.level<=6?0.96:0.97;
}
export interface CourseResult {
 readonly id:string;
 readonly promptId:string;
 readonly endedAt?:string;
 readonly summary:{readonly accuracy:number;readonly netWpm:number|null;readonly typedCharacters:number};
}
export interface LessonProgress {
 readonly practice:boolean;
 readonly review:boolean;
 readonly mastered:boolean;
}
/** Historical sessions still count as the first practice, but never as both checks.
 * A separate successfully finished unseen variant is required to claim mastery.
 * Records are summaries only: personal typing text and keystroke events are not saved.
 */
export function lessonProgressFromScores(records:readonly CourseResult[],locale:SupportedLocale):Map<string,LessonProgress>{
 const attempts=new Map<string,{practice:Map<string,number>;review:Map<string,number>}>();
 for(const record of records){
  const match=/^course-(L\d\d-\d\d)-(ru|en)(-review(?:-v2|-v3)?|-review2-(\d+)-(\d+)(?:-model-[a-z0-9-]+)?(?:-v-[0-9a-z]+(?:\.[0-9a-z]+)*)?)?$/.exec(record.promptId);
  if(!match||match[2]!==locale||typeof record.id!=='string'||!record.id)continue;
  const lesson=findLesson(match[1]);if(!lesson)continue;
  const variant:LessonVariant=match[3]?'review':'practice';
  const finishedAt=typeof record.endedAt==='string'?Date.parse(record.endedAt):Number.NaN;
  const score=record.summary;
  if(!Number.isFinite(score.accuracy)||score.accuracy<lessonMinimumAccuracy(lesson)
   ||score.accuracy>1||score.netWpm===null||!Number.isFinite(score.netWpm)
   ||score.netWpm<=0||!Number.isFinite(score.typedCharacters))continue;
  const dynamicLength=match[4]?Number(match[4]):null;
  if(dynamicLength!==null&&(!Number.isSafeInteger(dynamicLength)||dynamicLength<30||dynamicLength>600))continue;
  if(record.promptId.includes('-model-')&&recoverReviewLength(record.promptId,locale)!==dynamicLength)continue;
  const historicReview=record.promptId.endsWith('-review');
  const expectedLength=dynamicLength??graphemes(historicReview
   ?legacyReviewText(lesson,locale)
   :lessonPrompt(lesson,locale,undefined,variant).text).length;
  if(score.typedCharacters<Math.max(LESSON_MASTERY_MIN_GRAPHEMES,expectedLength))continue;
  let current=attempts.get(lesson.id);
  if(!current){current={practice:new Map(),review:new Map()};attempts.set(lesson.id,current);}
  current[variant].set(record.id,finishedAt);
 }
 const progress=new Map<string,LessonProgress>();
 for(const [id,attempt] of attempts){
  const practice=attempt.practice.size>0,review=attempt.review.size>0;
  const mastered=practice&&review&&[...attempt.practice].some(([id,first])=>
   Number.isFinite(first)&&[...attempt.review].some(([other,second])=>other!==id&&Number.isFinite(second)&&eligibleReviewPair(first,second)));
  progress.set(id,{practice,review,mastered});
 }
 return progress;
}
export function completionFromScores(records:readonly CourseResult[],locale:SupportedLocale):Set<string>{
 return new Set([...lessonProgressFromScores(records,locale)].filter(([,status])=>status.mastered).map(([id])=>id));
}

/** Earliest delayed-check time from a validated first pass, without rewriting history. */
export function reviewAvailableAt(records:readonly CourseResult[],lesson:CourseLesson,locale:SupportedLocale):number|null{
 const required=graphemes(lessonPrompt(lesson,locale).text).length;
 const times=records.filter(r=>r.promptId===`course-${lesson.id}-${locale}` &&
  r.summary.accuracy>=lessonMinimumAccuracy(lesson) && r.summary.accuracy<=1 &&
  r.summary.netWpm!==null && Number.isFinite(r.summary.netWpm) && r.summary.netWpm>0 &&
  r.summary.typedCharacters>=required).map(r=>Date.parse(r.endedAt??'')).filter(Number.isFinite);
 return times.length?Math.min(...times.map(nextReviewAt)):null;
}
