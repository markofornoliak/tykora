import {readFileSync,readdirSync} from 'node:fs';
const files=['src/styles/app.css',...readdirSync('src/shared/theme')
 .filter(f=>f.endsWith('.css')&&f!=='tokens.css')
 .map(f=>'src/shared/theme/'+f)];
for(const file of files){
 const value=readFileSync(file,'utf8');
 const matches=[...value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(v=>v[0]);
 if(matches.length)throw new Error(file+' has non-token hex colors '+matches.join(','));
}
console.log('TYKORA_STYLE_TOKENS PASS: no color hex outside tokens.css');
