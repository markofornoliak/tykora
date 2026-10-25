import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
 {ignores:['dist/**','.domain-check/**','.quality-check/**','.worker-check/**','node_modules/**','coverage/**','test-results/**','playwright-report/**']},
 {
  files:['src/**/*.{ts,tsx}','e2e/**/*.{ts,tsx}','e2e-production/**/*.{ts,tsx}','scripts/**/*.mjs'],
  languageOptions:{parser:tseslint.parser,parserOptions:{ecmaFeatures:{jsx:true}}},
  plugins:{'@typescript-eslint':tseslint.plugin},
  rules:{
   ...js.configs.recommended.rules,
   'no-undef':'off', // TypeScript resolves identifiers via tsc
   'no-unused-vars':'off', // TypeScript runs separately with strict project checks
   'no-control-regex':'error',
   'no-debugger':'error',
   'no-eval':'error',
   'no-implied-eval':'error',
   'no-new-func':'error',
   'no-unsafe-finally':'error',
   'no-unreachable':'error',
   'no-duplicate-imports':'error',
   'no-constant-condition':['error',{checkLoops:false}]
  }
 }
);
