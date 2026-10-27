import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {passages}=require('../.domain-check/domain/content/library.js');
const groups=[
 ['code-python','python3',['-c','import ast,sys;ast.parse(sys.stdin.read())']],
 ['code-js','node',['--check','--input-type=module','-']],
 ['code-cpp','g++',['-std=c++14','-fsyntax-only','-x','c++','-']],
 ['code-sql','python3',['-c','import sqlite3,sys;sqlite3.connect(":memory:").execute(sys.stdin.read()).fetchall()']]
];
const results=[];
for(const [track,cmd,args] of groups){
 const sources=[...new Set(passages.filter(x=>x.track===track).map(x=>x.text))];
 assert.ok(sources.length>0,track+' has no code');
 for(const [i,snippet] of sources.entries()){
  const code=track==='code-cpp'
   ? (/\bint\s+main\s*\(/.test(snippet)?snippet:'#include <vector>\n#include <iostream>\nint main(){\n'+snippet+'\nreturn 0;\n}\n')
   :snippet;
  const r=spawnSync(cmd,args,{input:code,encoding:'utf8'});
  assert.equal(r.status,0,`${track} example ${i+1}: ${r.stderr||r.error?.message||'compiler failure'}`);
 }
 results.push({track,uniqueExamples:sources.length,passed:sources.length});
}
console.log('ITER4_CODE_SYNTAX '+JSON.stringify({
 tool:'Python 3 ast.parse, Node --check, g++ -std=c++14 -fsyntax-only, Python sqlite3',results,
 cppNote:'The second legacy C++ fragment compiles in a synthetic main with standard headers; not claimed standalone.'
}));
