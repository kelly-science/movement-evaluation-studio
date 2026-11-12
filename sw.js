// Kinetica Studio v46: offline-first launch, verified optional lessons.
// A failure to fetch one guide or clip must never disable offline app startup.
const CACHE_NAME='movement-evaluation-studio-shell-v47';
const CORE=['./index.html','./rom-guides-v30.css?v=41','./rom-guides-v30.js?v=41'];
const EXTRAS=[
 './manifest.webmanifest?v=29','./icon-192.png?v=29','./icon-512.png?v=29',
 './icon-maskable-512.png?v=29','./apple-touch-icon.png?v=29',
 ...Array.from({length:20},(_,i)=>'./rom-guides/guide-'+String(i).padStart(2,'0')+'.png'),
 ...Array.from({length:11},(_,i)=>'./joint-actions/exercise-'+String(i).padStart(2,'0')+'.jpg'),
 ...Array.from({length:11},(_,i)=>'./joint-actions/exercise-'+String(i).padStart(2,'0')+'.mp4')
];
const ALL=[...CORE,...EXTRAS];
const base=new URL(self.registration.scope);
const assetUrl=name=>new URL(name,base).href;
const assetType=url=>{if(/\.mp4(?:\?|$)/.test(url))return 'video/';if(/\.(png|jpg)(?:\?|$)/.test(url))return 'image/';if(/\.css(?:\?|$)/.test(url))return 'text/css';if(/\.js(?:\?|$)/.test(url))return 'javascript';if(/\.html(?:\?|$)/.test(url))return 'text/html';return ''};
async function verifiedResponse(res,path){
 if(!res||!res.ok||res.type==='opaque')return false;
 const kind=assetType(path);const type=(res.headers.get('content-type')||'').toLowerCase();
 if(kind==='javascript')return type.includes('javascript')||type.includes('ecmascript');
 if(kind&&!type.includes(kind))return false;
 if(path.endsWith('.webmanifest?v=29')&&type.includes('text/html'))return false;
 return true;
}
async function ensure(cache,path){
 const key=assetUrl(path);const existing=await cache.match(key);
 if(existing&&await verifiedResponse(existing,path))return true;
 let response;
 try{response=await fetch(key,{credentials:'same-origin',cache:'reload'})}catch{return false}
 if(!await verifiedResponse(response,path))return false;
 try{await cache.put(key,response.clone());return true}catch{return false}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 for(const file of CORE){if(!await ensure(cache,file))throw Error('Required offline file unavailable: '+file)}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(name=>name.startsWith('movement-evaluation-studio-shell-')&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
async function readiness(){
 const cache=await caches.open(CACHE_NAME);let count=0,coreCount=0;
 for(const file of ALL){const response=await cache.match(assetUrl(file));const ok=await verifiedResponse(response,file);if(ok){count++;if(CORE.includes(file))coreCount++}}
 return {count,total:ALL.length,shellReady:coreCount===CORE.length,ready:count===ALL.length};
}
let downloadTask=null;
self.addEventListener('message',event=>{
 const type=event.data&&event.data.type;
 if(type!=='KINETICA_OFFLINE_PREPARE'&&type!=='KINETICA_OFFLINE_STATUS')return;
 const port=event.ports&&event.ports[0];if(!port)return;
 const reply=(type,data)=>{try{port.postMessage({type,...data})}catch{}};
 event.waitUntil((async()=>{
  if(type==='KINETICA_OFFLINE_STATUS'){reply('KINETICA_OFFLINE_STATUS',await readiness());return}
  // Only one download at a time per SW. Repeat clicks can query status independently.
  if(!downloadTask)downloadTask=(async()=>{
   const cache=await caches.open(CACHE_NAME);
   let done=CORE.length;
   for(const file of EXTRAS){
    if(await ensure(cache,file))done++;
    reply('KINETICA_OFFLINE_PROGRESS',{done,total:ALL.length});
   }
  })().finally(()=>{downloadTask=null});
  await downloadTask;
  reply('KINETICA_OFFLINE_COMPLETE',await readiness());
 })().catch(e=>reply('KINETICA_OFFLINE_ERROR',{error:String(e.message||e)})));
});
async function navResponse(event){
 const cache=await caches.open(CACHE_NAME),fallback=await cache.match(assetUrl('./index.html'));
 // A short network deadline avoids hanging on an installed iPhone in airplane mode.
 let timer;
 try{
  const controller=new AbortController();
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('offline'))},1600)});
  const res=await Promise.race([fetch(event.request,{signal:controller.signal}),timeout]);
  if(await verifiedResponse(res,'./index.html')){
   event.waitUntil(cache.put(assetUrl('./index.html'),res.clone()).catch(()=>{}));
   return res;
  }
 }catch{}finally{clearTimeout(timer)}
 return fallback||new Response('<!doctype html><html><body><h2>Kinetica Studio is not yet saved for offline use</h2><p>Connect to Wi-Fi and open the PWA once, then use File → Make Available Offline.</p></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith(base.pathname))return;
 if(request.mode==='navigate'){event.respondWith(navResponse(event));return}
 if(/\/joint-actions\/exercise-\d{2}\.mp4$/.test(url.pathname)&&request.headers.has('range')){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);const cached=await cache.match(url.href);
   if(!cached)return fetch(request);
   const blob=await cached.blob();const match=/^bytes=(\d+)-(\d*)$/i.exec(request.headers.get('range')||'');
   if(!match)return cached;
   const start=Number(match[1]),end=Math.min(blob.size-1,match[2]?Number(match[2]):blob.size-1);
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=blob.size||end<start)
    return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+blob.size}});
   return new Response(blob.slice(start,end+1,'video/mp4'),{status:206,headers:{'Content-Type':'video/mp4','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${blob.size}`,'Accept-Ranges':'bytes'}});
  })());return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const hit=await cache.match(request);
  if(hit)return hit;
  const res=await fetch(request);
  return res;
 })());
});
