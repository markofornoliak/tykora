// Source-only parse checks, useful if npm cannot be installed; requires global TypeScript.
const fs=require('node:fs'),path=require('node:path');
let ts;
try{ts=require('typescript');}catch{console.error('TypeScript not found; install dependencies first.');process.exit(1);}
let checked=0;const problems=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const pathname=path.join(dir,entry.name);
 if(entry.isDirectory()){walk(pathname);continue;}
 if(!/\.(ts|tsx)$/.test(entry.name))continue;
 const ast=ts.createSourceFile(pathname,fs.readFileSync(pathname,'utf8'),ts.ScriptTarget.Latest,true,entry.name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 checked++;
 problems.push(...ast.parseDiagnostics.map(e=>`${pathname}: ${String(e.messageText)}`));
 function inspect(n){if(ts.isImportDeclaration(n)&&ts.isStringLiteral(n.moduleSpecifier)&&n.moduleSpecifier.text.startsWith('.')){
 const dest=path.resolve(path.dirname(pathname),n.moduleSpecifier.text);
 if(!['.ts','.tsx','.json','.js',''].some(ext=>fs.existsSync(dest+ext)))problems.push(`${pathname}: unresolved ${n.moduleSpecifier.text}`);
 }ts.forEachChild(n,inspect)}
 ts.forEachChild(ast,inspect);
}}
walk(path.resolve(__dirname,'../src'));
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(`${checked} TypeScript/TSX files parsed; relative imports resolved (syntax check only).`);
