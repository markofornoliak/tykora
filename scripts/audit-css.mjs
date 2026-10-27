import fs from 'node:fs';
const source=fs.readFileSync('src/styles/app.css','utf8');
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const css=stripComments(source);
const vals=property=>[...css.matchAll(new RegExp('(?:^|[;{}])\\s*'+property+'\\s*:\\s*([^;}]*)','g'))].map(m=>m[1].trim());
const size=vals('font-size').filter(s=>!s.includes('var('));
const spacing=['padding','padding-top','padding-bottom','padding-left','padding-right','margin','margin-top','margin-bottom','margin-left','margin-right','gap','row-gap','column-gap']
 .flatMap(k=>vals(k)).filter(s=>!s.includes('var('));
const hex=[...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m=>m[0].toLowerCase());
const unique=xs=>[...new Set(xs)].sort();
const tokens=[...css.matchAll(/--[a-z][\w-]*\s*:/g)].map(m=>m[0].slice(0,-1).trim());
const result={tool:'scripts/audit-css.mjs (static textual scan, not computed styles)',cssBytes:Buffer.byteLength(source),
 uniqueTokenNames:unique(tokens).length,rawFontSizes:unique(size),rawFontSizeCount:unique(size).length,
 rawSpacingValues:unique(spacing),rawSpacingCount:unique(spacing).length,
 rawHexColors:unique(hex),rawHexColorCount:unique(hex).length,
 limitation:'Includes CSS token declarations and media rules; static text cannot prove active/computed colors or WCAG.'};
const out=process.env.TYKORA_CSS_AUDIT_OUT??'docs/iteration4/audit/css-metrics.json';
fs.mkdirSync('docs/iteration4/audit',{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log('ITER4_CSS_AUDIT '+JSON.stringify({cssBytes:result.cssBytes,uniqueTokenNames:result.uniqueTokenNames,
 rawFontSizeCount:result.rawFontSizeCount,rawSpacingCount:result.rawSpacingCount,rawHexColorCount:result.rawHexColorCount}));
