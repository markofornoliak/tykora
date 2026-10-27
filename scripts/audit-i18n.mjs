import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const root='src/features';
const pages=['academy','analytics','classroom','home','practice','profile','race','results','themes'];
function collect(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name);
  return entry.isDirectory()?collect(full):entry.isFile()&&/\.tsx$/.test(full)?[full]:[];
 });
}
const rows=pages.map(page=>{
 const files=collect(path.join(root,page));
 const result={page,files:files.length,jsxLiterals:0,translatedExpressions:0,examples:[]};
 for(const file of files){
  const code=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const hasPageCopy=code.includes('pageCopy[');
  function visit(n){
   if(ts.isJsxText(n)){
    const literal=n.getText(ast).trim();
    if(/[\p{L}]/u.test(literal)){
     result.jsxLiterals++;if(result.examples.length<4)result.examples.push({file,text:literal.slice(0,100)});
    }
   }
   if(ts.isJsxAttribute(n) && ['title','placeholder','aria-label','alt','label'].includes(n.name.text)
      && n.initializer && ts.isStringLiteral(n.initializer)
      && /[\p{L}]/u.test(n.initializer.text)){
    result.jsxLiterals++;if(result.examples.length<4)result.examples.push({file,text:n.initializer.text.slice(0,100)});
   }
   if(ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text==='t'
      && n.arguments.length>0 && ts.isStringLiteral(n.arguments[0]))result.translatedExpressions++;
   if(hasPageCopy && ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)
      && n.expression.text==='copy')result.translatedExpressions++;
   ts.forEachChild(n,visit);
  }
  visit(ast);
 }
 const all=result.jsxLiterals+result.translatedExpressions;
 return {...result,registeredUseShare:all?Number((result.translatedExpressions/all).toFixed(4)):null};
});
const totals={jsxLiterals:rows.reduce((n,r)=>n+r.jsxLiterals,0),
 translatedExpressions:rows.reduce((n,r)=>n+r.translatedExpressions,0)};
totals.registeredUseShare=totals.jsxLiterals+totals.translatedExpressions
 ?Number((totals.translatedExpressions/(totals.jsxLiterals+totals.translatedExpressions)).toFixed(4)):null;
const data={tool:'TypeScript JSX AST scan (lower bound, no dynamic strings or template interpolation coverage)',date:'2026-10-27',rows,totals,
 caveat:'JSX literals vs t(...) and pageCopy property references ONLY. Untranslated JS string variables, template literals, generated content, offscreen/error strings and duplicated key calls are not counted; percentage is not all UI copy.'};
const out='docs/iteration4/audit/i18n-coverage.json';
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
console.log('ITER4_I18N_AUDIT '+JSON.stringify({rows:rows.map(({page,jsxLiterals,translatedExpressions,registeredUseShare})=>({page,jsxLiterals,translatedExpressions,registeredUseShare})),totals}));
