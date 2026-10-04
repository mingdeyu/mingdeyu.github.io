/* Versioned standalone state; unavailable/corrupt storage falls back to defaults. */
globalThis.DmSiteStore=(()=>{
 const key='dgpsi-academic-site-v1';
 function read(){try{const state=JSON.parse(localStorage.getItem(key));return state&&typeof state==='object'&&!Array.isArray(state)?state:null;}catch{return null;}}
 function write(state){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
 if(new URLSearchParams(location.search).get('reset')==='1'){
  try{localStorage.removeItem(key);for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith('dgpsi-')&&k.includes('guide'))localStorage.removeItem(k);}}catch{}
  const url=new URL(location.href);url.searchParams.delete('reset');history.replaceState(null,'',url);
 }
 return {read,write};
})();
globalThis.DmSiteRouter=(()=>{
 const routes={about:'index.html',research:'research.html',teaching:'education.html',talks:'talks.html',software:'software.html',contact:'contact.html'};
 const names={about:'Deyu Ming',research:'Research',teaching:'Education',talks:'Talks',software:'Software',contact:'Contact'};
 function page(){const path=location.pathname.split('/').pop();return path==='about.html'?'about':path==='teaching.html'?'teaching':Object.keys(routes).find(k=>routes[k]===path)||'about';}
 function metadata(p){document.title=p==='about'?'Deyu Ming':names[p]+' · Deyu Ming';document.querySelector('link[rel="canonical"]')?.setAttribute('href','https://mingdeyu.github.io/'+(p==='about'?'':routes[p]));document.querySelector('.dm-skip-link')?.setAttribute('href','#dm-main-'+p);}
 function mount(root,showPage){
  let current=page();metadata(current);history.scrollRestoration='manual';
  document.querySelector('.dm-skip-link')?.addEventListener('click',e=>{const main=document.getElementById('dm-main-'+current);if(main){e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({block:'start'});}});
  const anchor=()=>{if(location.hash){const node=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(node&&!node.closest('[hidden]'))node.scrollIntoView();}};
  root.addEventListener('click',e=>{
   const a=e.target.closest('a[data-page]');if(!a||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
   e.preventDefault();const p=a.dataset.page;if(!routes[p]||p===current)return;
   history.replaceState({...history.state,top:scrollY},'',location.href);
   history.pushState({page:p,top:0},'',routes[p]);current=p;showPage(p,true);metadata(p);scrollTo({top:0,behavior:'instant'});
  });
  addEventListener('popstate',()=>{current=page();showPage(current,false);metadata(current);requestAnimationFrame(()=>{scrollTo({top:history.state?.top||0,behavior:'instant'});anchor();});});
  addEventListener('hashchange',anchor);requestAnimationFrame(anchor);
 }
 return {page,mount,routes};
})();
