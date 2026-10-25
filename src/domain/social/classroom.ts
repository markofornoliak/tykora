import type { Score } from '../metrics/metrics';
import { graphemes } from '../typing/graphemes';
export interface Assignment {kind:'tykora-assignment';version:1;id:string;title:string;text:string;locale:'ru'|'en';issuedAt:string;minAccuracy:number;}
export interface ClassReport {kind:'tykora-report';version:1;assignmentId:string;assignmentTitle:string;alias:string;completedAt:string;complete:boolean;score:Score;}
export function makeAssignment(title:string,text:string,locale:'ru'|'en',minAccuracy:number):Assignment{
 const cleanTitle=title.trim().slice(0,70),cleanText=text.normalize('NFC').trim();
 if(cleanTitle.length<2)throw new Error('Название должно содержать минимум 2 символа.');
 if(graphemes(cleanText).length<25||graphemes(cleanText).length>1500)throw new Error('Текст задания: 25–1500 символов.');
 if(minAccuracy<0.5||minAccuracy>1)throw new Error('Недопустимый порог точности.');
 return {kind:'tykora-assignment',version:1,id:crypto.randomUUID(),title:cleanTitle,text:cleanText,locale,issuedAt:new Date().toISOString(),minAccuracy};
}
export function readAssignment(input:unknown):Assignment {
 if(typeof input!=='object'||!input)throw new Error('Неверный формат задания.');
 const a=input as Partial<Assignment>;
 if(a.kind!=='tykora-assignment'||a.version!==1||typeof a.id!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(a.id)||typeof a.title!=='string'||typeof a.text!=='string'||(a.locale!=='ru'&&a.locale!=='en')||typeof a.minAccuracy!=='number'||!Number.isFinite(a.minAccuracy)||a.minAccuracy<0.5||a.minAccuracy>1)throw new Error('Файл не является заданием TYKORA v1.');
 const title=a.title.trim(),text=a.text.normalize('NFC').trim();
 if(title.length<2||title.length>70||graphemes(text).length<25||graphemes(text).length>1500)throw new Error('Содержимое задания не соответствует ограничениям.');
 return {...a,title,text} as Assignment;
}
export function readReport(input:unknown):ClassReport {
 if(typeof input!=='object'||!input)throw new Error('Неверный формат отчёта.');
 const r=input as Partial<ClassReport>;
 const s=r.score as Partial<Score>|undefined;
 if(r.kind!=='tykora-report'||r.version!==1||typeof r.assignmentId!=='string'||r.assignmentId.length>80||typeof r.alias!=='string'||r.alias.length>40||!r.alias.trim()||typeof r.assignmentTitle!=='string'||r.assignmentTitle.length>70||typeof r.completedAt!=='string'||Number.isNaN(new Date(r.completedAt).getTime())||typeof r.complete!=='boolean'||!s||!Number.isFinite(s.netWpm)||!Number.isFinite(s.accuracy)||!Number.isFinite(s.durationMs)||s.netWpm!<0||s.netWpm!>500||s.accuracy!<0||s.accuracy!>1||s.durationMs!<0)throw new Error('Неверный формат отчёта TYKORA.');
 return r as ClassReport;
}
export function csvReports(reports:readonly ClassReport[]):string {
 const escape=(x:unknown)=>`"${String(x).replace(/^[=+@\t\r-]/,'\u0027$&').replace(/"/g,'""')}\"`;
 const rows=[['Assignment','Alias','Completed At','WPM','Accuracy %','Completed'],...reports.map(r=>[r.assignmentTitle,r.alias,r.completedAt,r.score.netWpm.toFixed(1),(r.score.accuracy*100).toFixed(1),r.complete?'yes':'no'])];
 return '\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n');
}
