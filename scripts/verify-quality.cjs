const assert=require('node:assert/strict');
const fs=require('node:fs');
const {resources,uiLocales,verifyCatalog,translate}=require('../.quality-check/shared/i18n/catalog.js');
const {pageCopy}=require('../.quality-check/shared/i18n/pageCopy.js');
const {palettes}=require('../.quality-check/shared/theme/palettes.js');
const {contrastRatio}=require('../.quality-check/shared/theme/contrast.js');
const {validatePalette}=require('../.quality-check/shared/theme/applyTheme.js');
let passed=0;function check(label,fun){fun();passed++;console.log('✔ '+label)}
check('10 interface locales are present',()=>assert.equal(uiLocales.length,10));
check('No missing localized chrome keys',()=>assert.deepEqual(verifyCatalog(),[]));
check('No duplicate keys or locales',()=>assert.equal(new Set(uiLocales).size,uiLocales.length));
check('Each locale has its own string resources',()=>{
 for(const language of uiLocales){assert.ok(resources[language].translation.home);assert.ok(translate(language,'skip'));assert.notEqual(translate(language,'skip'),'skip')}
});
check('Translated home and practice page headings',()=>{
 for(const language of uiLocales){let p=pageCopy[language];assert.ok(p.homeTitle&&p.practiceTitle&&p.homeIntro&&p.practiceIntro)}
});
check('24 themes remain defined',()=>assert.equal(palettes.length,24));
check('Every theme meets 4.5:1 for normal text on body and surface',()=>{
 for(const p of palettes){assert.ok(contrastRatio(p.text,p.bg)>=4.5,`${p.name} body`);assert.ok(contrastRatio(p.text,p.surface)>=4.5,`${p.name} surface`)}
});
check('Palettes rejected on insufficient contrast',()=>{
 assert.ok(validatePalette({name:'Custom',bg:'#ffffff',surface:'#ffffff',text:'#b5b5b5',accent:'#ececec'}).length>0)
});
check('Accessible theme chooser uses native inputs',()=>{
 const s=fs.readFileSync('src/features/themes/Themes.tsx','utf8');
 for(const fragment of ['type="checkbox"','type="range"','type="color"','aria-pressed','validatePalette'])assert.ok(s.includes(fragment),fragment)
});
check('Keyboard has unobscured skip and navigation focus support',()=>{
 const s=fs.readFileSync('src/shared/ui/Layout.tsx','utf8');
 assert.ok(s.includes('e.preventDefault()'));assert.ok(s.includes('main-content'));assert.ok(s.includes('links.map'))
});
check('Native IME composition handlers remain in use',()=>{
 const s=fs.readFileSync('src/features/practice/Practice.tsx','utf8');
 for(const fragment of ['onCompositionStart','onCompositionEnd','onBeforeInput','onPaste','onInput'])assert.ok(s.includes(fragment),fragment)
});
console.log(`${passed} Stage 7 dependency-free quality checks passed. (Not a WCAG/Lighthouse certification.)`);
