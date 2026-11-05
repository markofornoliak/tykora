import {readFileSync} from 'node:fs';
const source=readFileSync('src/shared/theme/tokens.css','utf8');
if(/#[\da-fA-F]{3,8}\b/.test(source))throw new Error('Hardcoded hex in new token stylesheet');
for(const role of ['--ds-surface','--ds-text','--ds-accent','--ds-error','--ds-warning','--ds-focus'])
 if(!source.includes(role+':'))throw new Error('Missing semantic token '+role);
console.log('TYKORA_THEME_TOKENS PASS: 6 required semantic roles present; no hex color outside palette resolver in tokens.css.');
console.log('Legacy CSS hex literals not yet migrated: not a repository-wide stylelint gate.');
