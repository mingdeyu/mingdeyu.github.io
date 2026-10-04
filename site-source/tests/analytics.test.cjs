const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const file=path.join(__dirname,'../static/assets/analytics.js');
const source=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
const flush=()=>new Promise(resolve=>setImmediate(resolve));

function site(url='https://mingdeyu.github.io/'){
 const root=new EventTarget(),scripts=[],views=[];
 let canonical='https://mingdeyu.github.io/';
 const document={title:'Deyu Ming',referrer:'https://www.ucl.ac.uk/',
  getElementById:()=>root,
  querySelector:()=>({get href(){return canonical;}}),
  createElement:()=>Object.assign(new EventTarget(),{dataset:{}}),
  head:{appendChild:script=>scripts.push(script)}};
 const env={document,location:new URL(url),URL,queueMicrotask};env.window=env;
 vm.runInNewContext(source,env,{filename:file});
 return {env,root,scripts,views,
  async navigate(url,title){
   env.location=new URL(url);
   root.dispatchEvent(new Event('dm:page-changed'));
   // The existing router updates metadata immediately after this event.
   canonical=url;document.title=title;await flush();
  },
  load(){
   assert.equal(scripts.length,1,'The production page must request one tracking script');
   assert.equal(env.goatcounter.no_onload,true,'Manual routing must disable automatic duplicate views');
   env.goatcounter.count=view=>views.push(JSON.parse(JSON.stringify(view)));
   scripts[0].dispatchEvent(new Event('load'));
  }};
}

test('local files, previews and copied sites never request analytics',async()=>{
 for(const url of ['http://127.0.0.1:63267/software.html','http://localhost:8000/',
  'file:///tmp/index.html','https://preview.example.com/','http://mingdeyu.github.io/']){
  const s=site(url);await s.navigate('https://mingdeyu.github.io/research.html','Research · Deyu Ming');
  assert.equal(s.scripts.length,0,url);assert.equal(s.env.goatcounter,undefined,url);
 }
});

test('the first production page counts once using the provided account',()=>{
 const s=site();s.load();
 assert.equal(s.scripts[0].src,'https://gc.zgo.at/count.js');
 assert.equal(s.scripts[0].dataset.goatcounter,'https://mingdeyu.goatcounter.com/count');
 assert.equal(s.scripts[0].async,true);
 assert.deepEqual(s.views,[{path:'/',title:'Deyu Ming',referrer:'https://www.ucl.ac.uk/'}]);
});

test('slow script loading preserves page views and final router metadata',async()=>{
 const s=site();
 await s.navigate('https://mingdeyu.github.io/research.html','Research · Deyu Ming');
 await s.navigate('https://mingdeyu.github.io/education.html','Education · Deyu Ming');
 s.load();
 assert.deepEqual(s.views,[
  {path:'/',title:'Deyu Ming',referrer:'https://www.ucl.ac.uk/'},
  {path:'/research.html',title:'Research · Deyu Ming',referrer:'https://mingdeyu.github.io/'},
  {path:'/education.html',title:'Education · Deyu Ming',referrer:'https://mingdeyu.github.io/research.html'}
 ]);
});

test('same-page events do not duplicate views and back navigation counts',async()=>{
 const s=site();s.load();
 await s.navigate('https://mingdeyu.github.io/','Deyu Ming');
 await s.navigate('https://mingdeyu.github.io/research.html','Research · Deyu Ming');
 await s.navigate('https://mingdeyu.github.io/research.html#grants','Research · Deyu Ming');
 await s.navigate('https://mingdeyu.github.io/software.html','Software · Deyu Ming');
 await s.navigate('https://mingdeyu.github.io/research.html','Research · Deyu Ming');
 assert.deepEqual(s.views.map(v=>v.path),['/','/research.html','/software.html','/research.html']);
});

test('a blocked tracking script does not interfere with navigation',async()=>{
 const s=site();assert.equal(s.scripts.length,1);
 s.scripts[0].dispatchEvent(new Event('error'));
 await s.navigate('https://mingdeyu.github.io/contact.html','Contact · Deyu Ming');
 assert.equal(s.env.document.title,'Contact · Deyu Ming');
 assert.equal(s.views.length,0);
});
