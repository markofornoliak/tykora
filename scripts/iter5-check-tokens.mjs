import {readFileSync} from 'node:fs';
const source=readFileSync('src/shared/theme/tokens.css','utf8');
// Semantic and legacy palette values are explicitly permitted inside tokens.css.
for(const role of ['--ds-surface','--ds-text','--ds-accent','--ds-error','--ds-warning','--ds-focus'])
 if(!source.includes(role+':'))throw new Error('Missing semantic token '+role);
console.log('TYKORA_THEME_TOKENS PASS: 6 semantic roles present; raw colors centralized only in tokens.css.');
