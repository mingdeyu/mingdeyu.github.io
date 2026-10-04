const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../static/assets/site-runtime.js'),'utf8');
const env={};
for(const [name,end] of [['DmChunkNext','DmStepChunks'],['DmStepChunks','DmStepExplorer'],['DmIrisChunks','DmIrisExplorer']]){
 const start=source.indexOf(`globalThis.${name}=`);
 if(start>=0)vm.runInNewContext(source.slice(start,source.indexOf(`globalThis.${end}=`,start)),env);
}

for(const name of ['DmStepChunks','DmIrisChunks'])for(const language of ['r','python']){
 test(`${name}: ${language} advances only completed chunks, ending at Validate`,()=>{
  const model=env[name].create();model.select({language});
  const next=()=>env.DmChunkNext.view(model.snapshot(),true);
  assert.equal(next(),null);
  for(const [stage,target] of [['prepare','fit'],['fit','predict'],['predict','validate'],['validate',null]]){
   model.select({view:stage});assert.equal(next(),null);
   assert.equal(model.start(),true);assert.equal(next(),null,'No Next while running');
   model.advance(100000);assert.equal(next(),target);
   assert.equal(env.DmChunkNext.view(model.snapshot(),false),null,'No Next when results cannot load');
  }
 });

 test(`${name}: ${language} reruns and edits hide Next without deleting recorded output`,()=>{
  const model=env[name].create();model.select({language});model.start(true);
  model.select({view:'fit'});model.start(true);
  assert.equal(env.DmChunkNext.view(model.snapshot()),'predict');
  model.start();assert.equal(env.DmChunkNext.view(model.snapshot()),null);
  model.advance(100000);assert.equal(env.DmChunkNext.view(model.snapshot()),'predict');
  const depth=model.snapshot().depth===2?3:2;
  model.select({depth});assert.equal(env.DmChunkNext.view(model.snapshot()),null);
  assert.ok(model.snapshot().output,'Keep the previous result until rerunning');
 });
}

for(const name of ['DmStepChunks','DmIrisChunks']){
 test(`${name}: language switching preserves Next and background training`,()=>{
  const model=env[name].create();model.start(true);model.select({view:'fit'});model.start();
  model.select({language:'python'});assert.equal(env.DmChunkNext.view(model.snapshot()),null);
  model.start(true);assert.equal(env.DmChunkNext.view(model.snapshot()),'fit');
  model.advance(100000);model.select({language:'r'});
  assert.equal(model.snapshot().view,'fit');
  assert.equal(env.DmChunkNext.view(model.snapshot()),'predict');
  model.select({language:'python'});
  assert.equal(model.snapshot().view,'prepare');
  assert.equal(env.DmChunkNext.view(model.snapshot()),'fit');
 });
}
