import type { TypingPrompt } from '../typing/contracts';
import {sqlExamples} from './sql';

/** All samples below were written for TYKORA. No scraped/third-party text. */
export type SupportedLocale = 'ru' | 'en';
export type TrackId = 'general'|'code-python'|'code-cpp'|'code-js'|'code-sql'|'finance'|'business'|'medical'|'legal';
export interface Passage { id:string; locale:SupportedLocale; title:string; text:string; license:'original'; track:TrackId; }

const entries:readonly [TrackId,string,string,string,string][] = [
 ['general','Спокойный ритм','Calm rhythm','Точность рождает скорость. Спокойные движения помогают сохранять ритм даже тогда, когда текст становится сложнее.','Accuracy creates speed. Smooth movements help maintain rhythm even when the next sentence becomes more demanding.'],
 ['general','Новая привычка','A new habit','Пальцы находят клавиши постепенно. Важно смотреть на текст, сохранять ровную осанку и делать небольшие перерывы.','Your fingers find their way gradually. Look at the text, keep a comfortable posture, and take short breaks.'],
 ['general','Ясная мысль','Clear thinking','Утром город просыпается. В окнах появляется свет, на улицах слышны шаги, а новый день приносит интересные задачи.','The city wakes in the morning. Light appears in the windows, footsteps echo outside, and a new day brings interesting work.'],
 ['general','Письмо другу','A letter to a friend','Сегодня я узнал много нового и хочу рассказать тебе об этом. Маленькое открытие иногда меняет взгляд на привычные вещи.','Today I learned something new and wanted to tell you about it. A small discovery can change the way we see familiar things.'],
 ['general','Тихая библиотека','The quiet library','На верхней полке стояла старая карта. Рядом лежал блокнот с заметками, вопросами и планом будущего путешествия.','An old map rested on the upper shelf. Beside it was a notebook filled with questions, ideas, and a plan for the next journey.'],
 ['general','Рабочий день','A working day','Хороший план не обязан быть сложным. Определи важную задачу, выдели время на неё и спокойно проверь результат.','A good plan does not need to be complicated. Choose one important task, make time for it, and review the result carefully.'],
 ['general','Небольшой эксперимент','A small experiment','Учёный записал условия опыта, изменил только один параметр и повторил измерения, чтобы проверить первую гипотезу.','The scientist recorded the conditions, changed one variable, and repeated the measurements to test the first hypothesis.'],
 ['general','Точность и время','Time and precision','Минуты проходят одинаково, но мы используем их по-разному. Иногда медленное начало помогает завершить дело быстрее.','Minutes pass at the same pace, yet we use them differently. Sometimes a slower start helps us finish a task sooner.'],
 ['business','Деловое письмо','Business email','Здравствуйте! Отправляю краткое резюме встречи. Пожалуйста, подтвердите сроки и сообщите, нужны ли дополнительные документы.','Hello, I am sending a brief summary of our meeting. Please confirm the dates and let me know if any additional documents are required.'],
 ['business','План проекта','Project plan','Команда согласовала три этапа работы: подготовку, тестирование и запуск. Каждый этап имеет понятные сроки и критерии качества.','The team agreed on three phases: preparation, testing, and launch. Each phase has clear deadlines and quality criteria.'],
 ['finance','Числа и проценты','Numbers and percentages','Выручка составила 125 400 рублей, расходы — 82 700 рублей. Плановый рост на следующий квартал равен 12,5%.','Revenue reached 125,400 units while costs were 82,700 units. The planned increase for next quarter is 12.5%.'],
 ['finance','Бюджет','Budget review','Бюджет проекта: 24 000,00 евро. Резерв: 8%. Оплата разделена на три части: 30%, 40% и 30%.','Project budget: EUR 24,000.00. Contingency: 8%. Payment is split into three portions: 30%, 40%, and 30%.'],
 ['medical','Приём пациента','Patient visit','Пациент сообщил о симптомах. Врач уточнил историю наблюдений, объяснил план обследования и назначил контрольный визит.','The patient described the symptoms. The clinician reviewed the history, explained the assessment plan, and arranged a follow-up visit.'],
 ['medical','Лаборатория','Laboratory note','Образец получил уникальный номер. Специалист проверил маркировку, температуру хранения и полноту сопроводительных данных.','The sample received a unique identifier. The specialist checked its label, storage temperature, and accompanying documentation.'],
 ['legal','Условия соглашения','Agreement terms','Стороны подтверждают получение проекта договора. Изменения оформляются письменно и вступают в силу после согласования.','The parties acknowledge receipt of the draft agreement. Changes must be made in writing and take effect after approval.'],
 ['legal','Протокол встречи','Meeting record','В протокол внесены дата, участники, повестка и принятые решения. Ответственные лица подтвердят выполнение задач письменно.','The minutes record the date, attendees, agenda, and decisions. Responsible parties will confirm completion of their tasks in writing.'],
 ['code-python','Python: функции','Python: functions','def total(items):\n    return sum(items)\n\nvalues = [3, 7, 11]\nprint(total(values))','def total(items):\n    return sum(items)\n\nvalues = [3, 7, 11]\nprint(total(values))'],
 ['code-python','Python: словари','Python: dictionaries','settings = {"theme": "dark", "speed": 60}\nfor key, value in settings.items():\n    print(key, value)','settings = {"theme": "dark", "speed": 60}\nfor key, value in settings.items():\n    print(key, value)'],
 ['code-cpp','C++: поток вывода','C++: output stream','#include <iostream>\nint main() {\n    int n = 42;\n    std::cout << n << "\\n";\n}','#include <iostream>\nint main() {\n    int n = 42;\n    std::cout << n << "\\n";\n}'],
 ['code-cpp','C++: вектор','C++: vector','std::vector<int> data = {2, 4, 8};\nfor (int item : data) {\n    std::cout << item;\n}','std::vector<int> data = {2, 4, 8};\nfor (int item : data) {\n    std::cout << item;\n}'],
 ['code-js','JavaScript: объекты','JavaScript: objects','const user = { name: "Alex", level: 4 };\nconst next = { ...user, level: 5 };\nconsole.log(next.level);','const user = { name: "Alex", level: 4 };\nconst next = { ...user, level: 5 };\nconsole.log(next.level);'],
 ['code-js','JavaScript: фильтр','JavaScript: filter','const values = [1, 2, 3, 4];\nconst even = values.filter(n => n % 2 === 0);\nconsole.log(even);','const values = [1, 2, 3, 4];\nconst even = values.filter(n => n % 2 === 0);\nconsole.log(even);']
];
export const passages:readonly Passage[] = [...entries.map(([track,titleRu,,ru],i)=>
  ({id:`tykora-original-${String(i+1).padStart(3,'0')}`, locale:'ru' as const,title:titleRu,text:ru,license:'original' as const,track})
), ...entries.map(([track,,titleEn,,en],i)=>
  ({id:`tykora-original-${String(i+1).padStart(3,'0')}-en`, locale:'en' as const,title:titleEn,text:en,license:'original' as const,track})),
 ...sqlExamples.flatMap((entry,i)=>['ru','en'].map(locale=>({
   id:`tykora-sql-${String(i+1).padStart(3,'0')}-${locale}`,
   locale:locale as SupportedLocale,title:locale==='ru'?entry.titleRu:entry.titleEn,
   text:entry.text,license:'original' as const,track:'code-sql' as const
 })))];

export function passagePrompt(p:Passage,layoutId:string):TypingPrompt {
 return {id:p.id,text:p.text,locale:p.locale,layoutId,mode:'quote',license:p.license,sourceAttribution:'TYKORA original content (MIT)'};
}
export function getPassages(locale:SupportedLocale,track:TrackId='general') {return passages.filter(p=>p.locale===locale&&p.track===track);}
