// Replay curves computed by public R lgp()/predict() for all slider budgets.
// Full native double-precision results remain in the reproducibility output.
globalThis.DmLinkedPredictor={create:function(data){
 if(data.systems)return {predict:counts=>data.systems[counts.join('-')]};
 const packed=data.systemCurves;
 if(!['native-curves-u16-delta','native-curves-u16-second-delta'].includes(packed?.codec))throw new Error('Native linked predictions required');
 const secondDifference=packed.codec==='native-curves-u16-second-delta';
 const raw=Uint8Array.from(atob(packed.values),c=>c.charCodeAt(0));
 const boundBytes=Uint8Array.from(atob(packed.bounds),c=>c.charCodeAt(0)),bounds=new Float64Array(boundBytes.buffer);
 const words=new Uint16Array(packed.curves*4*packed.width);
 let i=0,previous=0,previousDelta=0,number=0,shift=0;
 for(const byte of raw){
  number|=(byte&127)<<shift;
  if(byte&128)shift+=7;
  else{
   const difference=number&1?-(number+1)/2:number/2;
   previousDelta=secondDifference?previousDelta+difference:difference;
   previous+=previousDelta;
   if(previous<0||previous>65535||i>=words.length)throw new Error('Invalid native curve data');
   words[i++]=previous;number=shift=0;
   if(i%packed.width===0)previous=previousDelta=0;
  }
 }
 if(i!==words.length||shift)throw new Error('Incomplete native curve data');
 function predict(counts){
  if(counts.length!==3||counts.some(n=>!Number.isInteger(n)||n<5||n>20))throw new Error('Training size outside native results');
  if(data.chunkCounts&&(counts[0]!==data.chunkCounts[0]||counts[1]!==data.chunkCounts[1]))throw new Error('Prediction outside this native chunk');
  const index=data.chunkCounts?counts[2]-5:(counts[0]-5)*256+(counts[1]-5)*16+counts[2]-5;
  const curves=[];
  for(let c=0;c<4;c++){
   const curve=index*4+c,low=bounds[curve*2],scale=(bounds[curve*2+1]-low)/65535;
   curves.push(Array.from(words.subarray(curve*packed.width,(curve+1)*packed.width),q=>low+q*scale));
  }
  return {mean:curves[0],sd:curves[1],inputMeans:curves.slice(2)};
 }
 return {predict};
}};
