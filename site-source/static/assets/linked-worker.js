/* Decode only the requested batch, with at most four resident native batches. */
importScripts('./linked-explorer-predictor.js');
let base;const chunks=new Map();
async function chunk(counts){
 const key=counts.slice(0,2).join('-');let promise=chunks.get(key);
 if(promise){chunks.delete(key);chunks.set(key,promise);return promise;}
 promise=(async()=>{
  const response=await fetch(new URL(key+'.bin',base));if(!response.ok)throw new Error('Prediction download failed');
  const decoded=await new Response(response.body.pipeThrough(new DecompressionStream('deflate'))).json();
  if(decoded.chunkCounts?.join('-')!==key||decoded.systemCurves?.width!==1025||decoded.systemCurves.curves!==16)throw new Error('Invalid native prediction batch');
  return DmLinkedPredictor.create(decoded);
 })();chunks.set(key,promise);while(chunks.size>4)chunks.delete(chunks.keys().next().value);
 try{return await promise;}catch(error){if(chunks.get(key)===promise)chunks.delete(key);throw error;}
}
onmessage=async({data})=>{
 if(data.base){base=data.base;return;}
 try{const engine=await chunk(data.counts);postMessage({id:data.id,curve:engine.predict(data.counts)});}
 catch(error){postMessage({id:data.id,error:error.message});}
};
