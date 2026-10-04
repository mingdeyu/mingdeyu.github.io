/* First-load feedback stays visible until the canvases have actually drawn. */
globalThis.DmPlotLoading={mount(panel){
 const region=panel.querySelector('[data-plot-results]');
 const indicators=[...panel.querySelectorAll('[data-plot-loading]')];
 function layout(){
  for(const indicator of indicators){
   const canvas=indicator.previousElementSibling;
   if(!canvas?.getClientRects().length)continue;
   Object.assign(indicator.style,{left:canvas.offsetLeft+'px',top:canvas.offsetTop+'px',width:canvas.clientWidth+'px',height:canvas.clientHeight+'px'});
  }
 }
 function set(state){
  if(panel.dataset.plotState!==state){
   panel.dataset.plotState=state;
   if(state==='loading')region.setAttribute('aria-busy','true');else region.removeAttribute('aria-busy');
  }
  layout();
 }
 new ResizeObserver(layout).observe(panel);
 return {loading:()=>set('loading'),ready:()=>set('ready'),error:()=>set('error')};
}};
