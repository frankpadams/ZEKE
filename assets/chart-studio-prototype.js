/* ZEKE chart exploration prototype. Read-only, opt-in; does not touch saved records. */
(function(){
  function open({title='Health trend',unit='',points=[]}={}){
    const data=points.map(p=>({date:new Date(p.date),value:Number(p.value)})).filter(p=>Number.isFinite(p.value)&&!isNaN(p.date)).sort((a,b)=>a.date-b.date);
    const shade=document.createElement('div');
    shade.style.cssText='position:fixed;inset:0;z-index:99999;background:#07182ecc;display:grid;place-items:center;padding:16px';
    const box=document.createElement('section');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);
    box.style.cssText='width:min(900px,100%);max-height:90vh;overflow:auto;background:white;color:#19324b;border-radius:22px;padding:24px;font-family:system-ui';
    box.innerHTML='<header style="display:flex;justify-content:space-between;gap:12px;align-items:center"><h2></h2><button type="button">Close</button></header><nav aria-label="Time range" style="display:flex;gap:8px;flex-wrap:wrap;margin:20px 0"></nav><div class="zeke-chart"></div><p aria-live="polite" class="zeke-reading"></p><p style="color:#607287;font-size:13px">Missing values are not zero. Patterns alone do not establish causation.</p>';
    box.querySelector('h2').textContent=title;
    const nav=box.querySelector('nav'),plot=box.querySelector('.zeke-chart'),reading=box.querySelector('.zeke-reading');
    let range=Infinity,chosen=-1;const previous=document.activeElement;
    const close=()=>{document.removeEventListener('keydown',keys);shade.remove();previous?.focus?.()};
    const keys=e=>{if(e.key==='Escape')close()};
    box.querySelector('button').addEventListener('click',close);
    document.addEventListener('keydown',keys);
    [['1M',31],['3M',93],['6M',186],['1Y',366],['All',Infinity]].forEach(([label,days])=>{
      const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='padding:10px 14px;border-radius:10px;border:1px solid #ccd8e5;cursor:pointer';
      b.addEventListener('click',()=>{range=days;chosen=-1;draw()});nav.append(b);
    });
    function draw(){
      const last=data.at(-1)?.date.getTime()||0,subset=data.filter(p=>last-p.date.getTime()<=range*86400000);
      [...nav.children].forEach((b,i)=>{b.setAttribute('aria-pressed',String([31,93,186,366,Infinity][i]===range));b.style.background=[31,93,186,366,Infinity][i]===range?'#dcecfb':'#fff'});
      plot.replaceChildren();
      if(!subset.length){plot.textContent='No measurements in this range.';reading.textContent='';return}
      if(chosen<0||chosen>=subset.length)chosen=subset.length-1;
      const selected=subset[chosen];reading.textContent=selected.date.toLocaleDateString()+' · '+selected.value.toLocaleString()+' '+unit;
      if(subset.length===1){plot.textContent='One measurement recorded. At least two are needed for a trend.';return}
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 760 310');svg.style.cssText='width:100%;height:auto';
      const min=Math.min(...subset.map(p=>p.value)),max=Math.max(...subset.map(p=>p.value)),padding=Math.max((max-min)*.15,.1);
      const low=min-padding,high=max+padding,t0=subset[0].date.getTime(),t1=subset.at(-1).date.getTime();
      const x=p=>45+670*(p.date.getTime()-t0)/Math.max(1,t1-t0),y=p=>265-220*(p.value-low)/(high-low);
      const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
      for(let i=0;i<5;i++)svg.append(make('line',{x1:45,x2:715,y1:45+55*i,y2:45+55*i,stroke:'#e4edf5'}));
      svg.append(make('polyline',{points:subset.map(p=>x(p)+','+y(p)).join(' '),fill:'none',stroke:'#1679b7','stroke-width':3,'stroke-linejoin':'round'}));
      subset.forEach((p,i)=>{const c=make('circle',{cx:x(p),cy:y(p),r:i===chosen?7:5,fill:i===chosen?'#143b64':'#1679b7',stroke:'#fff','stroke-width':2,tabindex:0,role:'button','aria-label':p.date.toLocaleDateString()+' '+p.value});
        const pick=()=>{chosen=i;draw()};c.addEventListener('click',pick);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});svg.append(c)});
      plot.append(svg);
    }
    shade.append(box);document.body.append(shade);box.querySelector('button').focus();draw();
  }
  window.ZEKEChartStudio={open};
})();
