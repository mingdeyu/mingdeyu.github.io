/* Count published pages only; local previews never load the tracking service. */
(()=>{
 if(location.origin!=='https://mingdeyu.github.io')return;
 window.goatcounter={no_onload:true};
 const pending=[];
 let lastPath=null,failed=false;
 function send(view){try{window.goatcounter.count(view);}catch{/* Analytics must not interrupt the website. */}}
 function pageview(){
  const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
  const path=new URL(canonical).pathname;
  if(path===lastPath)return;
  const view={path,title:document.title,referrer:lastPath===null?document.referrer:location.origin+lastPath};
  lastPath=path;
  if(failed)return;
  if(typeof window.goatcounter.count==='function')send(view);
  else pending.push(view);
 }
 // The router finishes updating the title and canonical URL after this event.
 document.getElementById('dm-current-prototype')?.addEventListener('dm:page-changed',()=>queueMicrotask(pageview));
 const script=document.createElement('script');
 script.dataset.goatcounter='https://mingdeyu.goatcounter.com/count';
 script.async=true;
 script.src='https://gc.zgo.at/count.js';
 script.addEventListener('load',()=>{
  if(typeof window.goatcounter.count!=='function'){failed=true;pending.length=0;return;}
  pending.splice(0).forEach(send);
 });
 script.addEventListener('error',()=>{failed=true;pending.length=0;});
 pageview();
 document.head.appendChild(script);
})();
