/* Metadata and curves are requested only on first opening Linked emulation. */
globalThis.DmLinkedLoader={create({base,workerUrl}){
 const url=new URL(base,document.baseURI),pending=new Map(),cache=new Map();let metadata=null,worker=null,id=0;
 const read=async(path)=>{const r=await fetch(new URL(path,url));if(!r.ok)throw new Error('Linked predictions unavailable');return new Response(r.body.pipeThrough(new DecompressionStream('deflate'))).json();};
 async function load(){
  if(metadata)return metadata;
  const next=await read('meta.bin');if(next.format!==4||next.grid?.length!==1025)throw new Error('Invalid linked metadata');metadata=next;
  try{
   worker=new Worker(new URL(workerUrl,document.baseURI));worker.postMessage({base:url.href});
   worker.onmessage=({data})=>{const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(new Error(data.error)):job.resolve(data.curve);};
   worker.onerror=()=>{worker.terminate();worker=null;for(const job of pending.values())job.reject(new Error('Prediction worker unavailable'));pending.clear();};
  }catch{worker=null;}
  return metadata;
 }
 async function predict(counts){
  if(counts.length!==3||counts.some(n=>!Number.isInteger(n)||n<5||n>20))throw new Error('Invalid training size');
  if(worker)return new Promise((resolve,reject)=>{const request=++id;pending.set(request,{resolve,reject});worker.postMessage({id:request,counts});});
  const key=counts.slice(0,2).join('-');let promise=cache.get(key);
  if(!promise){promise=read(key+'.bin').then(DmLinkedPredictor.create);cache.set(key,promise);while(cache.size>4)cache.delete(cache.keys().next().value);}
  else{cache.delete(key);cache.set(key,promise);}
  try{return (await promise).predict(counts);}catch(error){cache.delete(key);throw error;}
 }
 return {load,predict,engine:()=>worker?'worker':'main'};
}};
