const CACHE_NAME = 'project-zeke-v0.40.0-20260803.1';
const RUNTIME = [
  './','./index.html','./manifest.webmanifest','./version.js','./zeke-config.js','./xlsx-bundle.js',
  './assets/styles.css','./assets/data-layer.js','./assets/parser.js','./assets/ai-router.js',
  './assets/workflow-engine.js','./assets/exercise-guides.js','./assets/knowledge-base.js',
  './assets/integrity-engine.js','./assets/app.js','./assets/branding/zeke-mark-provisional.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(RUNTIME)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('project-zeke-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    const network=fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response}).catch(()=>cached);
    return cached||network;
  }));
});
