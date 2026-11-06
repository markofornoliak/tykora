import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import {fileURLToPath} from 'node:url';
import type {Plugin} from 'vite';

// At HTML parse time, before React and the HashRouter have executed, preload
// only the build's actual chunk for the requested hash route. Never invent
// hashed asset names or preload non-active routes on Home.
function hashRoutePreload():Plugin{
 const paths:Record<string,string>={
  academy:'/src/features/academy/Academy.tsx',
  practice:'/src/features/practice/Practice.tsx',
  analytics:'/src/features/analytics/Analytics.tsx',
  profile:'/src/features/profile/Profile.tsx',
  result:'/src/features/results/Results.tsx',
  themes:'/src/features/themes/Themes.tsx',
  race:'/src/features/race/Race.tsx',
  classroom:'/src/features/classroom/Classroom.tsx'
 };
 return{
  name:'tykora-initial-hash-route-modulepreload',apply:'build',
  transformIndexHtml:{
   order:'post',
   handler(html,context){
    if(!context.bundle)throw new Error('Missing production bundle during route modulepreload generation');
    const mapping:Record<string,string>={};
    for(const item of Object.values(context.bundle)){
     if(item.type!=='chunk'||!item.facadeModuleId)continue;
     const normalized=item.facadeModuleId.replaceAll('\\','/');
     for(const [route,suffix] of Object.entries(paths)){
      if(normalized.endsWith(suffix))mapping[route]=base+item.fileName;
     }
    }
    const missing=Object.keys(paths).filter(route=>!mapping[route]);
    if(missing.length)throw new Error('Missing built dynamic route chunks: '+missing.join(','));
    const anchor='<script data-tykora-deep-link-guard>';
    if(!html.includes(anchor))throw new Error('Expected early deep-link script');
    const script='<script data-tykora-route-preload>(function(){'+
     'var route=location.hash.slice(2).split(/[/?#]/)[0];'+
     'var chunks='+JSON.stringify(mapping)+';'+
     'var asset=Object.prototype.hasOwnProperty.call(chunks,route)?chunks[route]:null;'+
     'if(asset){var link=document.createElement("link");link.rel="modulepreload";link.href=asset;document.head.appendChild(link);}' +
     '})();</script>\n';
    return html.replace(anchor,script+anchor);
   }
  }
 };
}


const base = process.env.VITE_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9._-]+\/)?$/.test(base)) throw new Error('Invalid VITE_BASE_PATH. Use / or /repository/.');

export default defineConfig({
  base,
  // Opt-in instrumented production-style build; never enabled for published site.
  resolve: { alias: process.env.TYKORA_PREACT_EXPERIMENT==='1'
    ? [
      {find:'react-dom/client',replacement:'preact/compat/client'},
      {find:'react/jsx-runtime',replacement:'preact/jsx-runtime'},
      {find:'react/jsx-dev-runtime',replacement:'preact/jsx-dev-runtime'},
      {find:'react-dom',replacement:'preact/compat'},
      {find:'react',replacement:fileURLToPath(new URL('./scripts/iter6-preact-compat.mjs',import.meta.url))}
    ]
    : process.env.TYKORA_PROFILE==='1' ? {'react-dom/client':'react-dom/profiling'} : {} },
  plugins: [
    react(),
    hashRoutePreload(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg','apple-touch-icon.png'],
      manifest: {
        name: 'TYKORA — The art and science of typing',
        short_name: 'TYKORA',
        description: 'Free, private, local-first typing education',
        theme_color: '#f7f7f3',
        background_color: '#f7f7f3',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,woff2,json}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] }
});
