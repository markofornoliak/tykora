import type { TypingPrompt } from '../typing/contracts';
import type { SupportedLocale } from '../content/library';
import {graphemes} from '../typing/graphemes';

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
/** Two stable original text variants. Legacy v0.8 prompts retain their original id. */
export type LessonVariant='practice'|'review';
export function lessonPrompt(lesson:CourseLesson,locale:SupportedLocale,layoutId?:string,variant:LessonVariant='practice'):TypingPrompt {
 const focus=locale==='ru'?lesson.focusRu:lesson.focusEn;
 const prose=locale==='ru'?proseRu:proseEn;
 const reversed=focus.split(' ').reverse().join(' ');
 const text=variant==='review'
   ? lesson.level<=2
     ? `${repeatFocus(reversed,4)} ${repeatFocus(focus,2)}`
     : `${repeatFocus(reversed,2)} ${prose[lesson.index%prose.length]} ${repeatFocus(focus,2)} ${repeatFocus(reversed,1)}`
   : lesson.level<=2
     ? `${repeatFocus(focus,5)} ${repeatFocus(reversed,3)}`
     : `${repeatFocus(focus,3)} ${prose[(lesson.index-1)%prose.length]} ${repeatFocus(focus,2)}`;
 if(graphemes(text).length<30) throw new Error('Course exercise too short');
 return {id:`course-${lesson.id}-${locale}${variant==='review'?'-review':''}`,text,mode:'lesson',locale,
  layoutId:layoutId??(locale==='ru'?'ru-jcuken':'en-qwerty'),license:'original',sourceAttribution:'TYKORA original course'};
}
export function findLesson(id:string):CourseLesson|undefined{return curriculum.find(l=>l.id===id);}

export const LESSON_MASTERY_ACCURACY=0.95;
export const LESSON_MASTERY_MIN_GRAPHEMES=30;
export interface CourseResult {
 readonly id:string;
 readonly promptId:string;
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
 const attempts=new Map<string,{practice:Set<string>;review:Set<string>}>();
 for(const record of records){
  const match=/^course-(L\d\d-\d\d)-(ru|en)(-review)?$/.exec(record.promptId);
  if(!match||match[2]!==locale||typeof record.id!=='string'||!record.id)continue;
  const lesson=findLesson(match[1]);if(!lesson)continue;
  const variant:LessonVariant=match[3]?'review':'practice';
  const score=record.summary;
  if(!Number.isFinite(score.accuracy)||score.accuracy<LESSON_MASTERY_ACCURACY
   ||score.accuracy>1||score.netWpm===null||!Number.isFinite(score.netWpm)
   ||score.netWpm<=0||!Number.isFinite(score.typedCharacters))continue;
  const expectedLength=graphemes(lessonPrompt(lesson,locale,undefined,variant).text).length;
  if(score.typedCharacters<Math.max(LESSON_MASTERY_MIN_GRAPHEMES,expectedLength))continue;
  let current=attempts.get(lesson.id);
  if(!current){current={practice:new Set(),review:new Set()};attempts.set(lesson.id,current);}
  current[variant].add(record.id);
 }
 const progress=new Map<string,LessonProgress>();
 for(const [id,attempt] of attempts){
  const practice=attempt.practice.size>0,review=attempt.review.size>0;
  const mastered=practice&&review&&[...attempt.practice].some(id=>[...attempt.review].some(other=>other!==id));
  progress.set(id,{practice,review,mastered});
 }
 return progress;
}
export function completionFromScores(records:readonly CourseResult[],locale:SupportedLocale):Set<string>{
 return new Set([...lessonProgressFromScores(records,locale)].filter(([,status])=>status.mastered).map(([id])=>id));
}
