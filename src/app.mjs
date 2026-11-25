import {MU,R,TAU,MAX_A,MIN_ALT,maxE,period,stateAt,metrics,project,speedBounds,fromPerigeeSpeed} from './physics.mjs';
for(const form of document.querySelectorAll('.quiz')) {
 form.addEventListener('submit',event=>{event.preventDefault();const answer=new FormData(form).get('answer');const p=form.querySelector('.quiz-feedback');p.textContent=(answer===form.dataset.answer?'Correct. ':'Not quite. ')+p.dataset.explanation;});
 form.addEventListener('change',()=>form.querySelector('.quiz-feedback').textContent='');
}
const $=id=>document.getElementById(id);
if($('orbit')) init();
function init(){
 let a=12000,e=.4,i=0,t=0,running=false,view='plane',baseline=null,last=null,lastRead=0;
 const fmt=(v,d=1)=>v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
 const say=text=>$('message').textContent=text;
 function pause(){running=false;$('play').textContent='Play orbit';$('run-state').textContent='PAUSED';}
 function sync(){
  $('axis').value=String(Number(a.toFixed(7)));
  $('eccentricity').max=String(maxE(a));
  $('eccentricity').step='any';
  $('eccentricity').value=String(e);$('ecc-value').textContent=fmt(e,3);
  $('inclination').value=String(i);$('inc-value').textContent=`${i}°`;
  const m=metrics(a,e),b=speedBounds(m.rp);
  $('speed').min=String(b.min);$('speed').max=String(b.max);$('speed').value=String(m.vp);
  $('speed').disabled=Math.abs(b.max-b.min)<1e-10;
  $('speed-value').textContent=`${fmt(m.vp,3)} km/s`;
  $('view').value=view;
  $('view-label').textContent=view==='plane'?'ORBIT-PLANE VIEW':'EQUATORIAL PROJECTION';
  $('view-note').textContent=view==='plane'?'True orbit shape, viewed perpendicular to its plane. Inclination does not change this view.':'Looking along Earth’s north axis: X = x, Y = y cos i. Depth is flattened; crossing the Earth disk is not a collision. Ω = ω = 0. At 90°, this projection is a line.';
 }
 function changed(message='New orbit set. Time reset to perigee; playback paused.'){
  pause();t=0;$('preset').value='custom';sync();draw();readouts();say(message);
 }
 function preset(name){
  if(name==='circular'){a=R+400;e=0;i=0;view='plane';}
  else if(name==='inclined'){a=12000;e=.4;i=60;view='equatorial';}
  else {a=12000;e=.4;i=0;view='plane';name='ellipse';}
  changed();$('preset').value=name;
 }
 $('controls').addEventListener('submit',event=>event.preventDefault());
 $('axis').addEventListener('change',()=>{
  const next=$('axis').valueAsNumber;
  if(!Number.isFinite(next)||next<R+MIN_ALT||next>MAX_A){say('Enter a semi-major axis from 6,571.0084 to 60,000 km. The previous orbit is retained.');$('axis').setAttribute('aria-invalid','true');return;}
  $('axis').removeAttribute('aria-invalid');a=next;const old=e;e=Math.min(e,maxE(a));
  changed(e<old?'Eccentricity reduced to keep perigee at least 200 km above the model Earth. Time reset; playback paused.':undefined);
 });
 $('eccentricity').addEventListener('input',()=>{e=Number($('eccentricity').value);changed();});
 $('inclination').addEventListener('input',()=>{i=Number($('inclination').value);changed('Inclination changes orientation, not orbital period or true speed. Time reset; playback paused.');});
 $('speed').addEventListener('input',()=>{
  try{const next=fromPerigeeSpeed(a*(1-e),Number($('speed').value));a=next.a;e=next.e;changed('Perigee held fixed. Semi-major axis and eccentricity recalculated from physical speed.');}catch(error){say(error.message);sync();}
 });
 $('view').addEventListener('change',()=>{view=$('view').value;sync();draw();readouts();});
 $('preset').addEventListener('change',()=>{ $('axis').removeAttribute('aria-invalid');preset($('preset').value);});
 $('play').addEventListener('click',()=>{running=!running;$('play').textContent=running?'Pause orbit':'Play orbit';$('run-state').textContent=running?'RUNNING':'PAUSED';last=null;});
 $('step').addEventListener('click',()=>{pause();t+=60;draw();readouts();say(`Advanced to ${fmt(t,0)} simulated seconds.`);});
 $('reset').addEventListener('click',()=>{pause();t=0;draw();readouts();say('Returned to perigee at time zero. Orbit parameters retained.');});
 $('record').addEventListener('click',()=>{baseline={a,e,i,...metrics(a,e)};readouts();$('compare-note').textContent='Baseline recorded. Change one parameter and compare; recording again replaces it.';});
 $('download').addEventListener('click',()=>{
  const m=metrics(a,e),s=stateAt(a,e,t);
  const rows=[['quantity','unit','baseline','current'],['semi_major_axis','km',baseline?.a??'',a],['eccentricity','1',baseline?.e??'',e],['inclination','deg',baseline?.i??'',i],['perigee_altitude','km',baseline?.hp??'',m.hp],['apogee_altitude','km',baseline?.ha??'',m.ha],['period','s',baseline?.T??'',m.T],['perigee_speed','km/s',baseline?.vp??'',m.vp],['current_time','s','',t],['current_altitude','km','',s.r-R],['current_speed','km/s','',s.speed],['earth_mu','km^3/s^2','',MU],['earth_radius','km','',R]];
  const blob=new Blob([rows.map(row=>row.join(',')).join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='orbitlab-experiment.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 function drawing(){
  // Same scale on both axes; centered on the ellipse, Earth at its focus.
  const k=Math.min(290/a,190/(a*Math.sqrt(1-e*e))),cx=400+a*e*k,cy=260;
  const point=(x,y)=>{const p=project(x,y,i,view);return [cx+p.x*k,cy-p.y*k];};
  return {k,cx,cy,point};
 }
 function draw(){
  const {k,cx,cy,point}=drawing(),T=period(a),s=stateAt(a,e,t);
  const path=[];
  for(let n=0;n<=180;n++){const E=TAU*n/180;const p=point(a*(Math.cos(E)-e),a*Math.sqrt(1-e*e)*Math.sin(E));path.push(`${n?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`);}
  function sector(start){const vertices=[`M${cx},${cy}`];for(let n=0;n<=40;n++){const v=stateAt(a,e,(start+n*.05/40)*T),p=point(v.x,v.y);vertices.push(`L${p[0]},${p[1]}`);}return vertices.join(' ')+'Z';}
  const pos=point(s.x,s.y),pp=point(a*(1-e),0),ap=point(-a*(1+e),0);
  // Velocity direction is projected, arrow normalized to a fixed display length; not a magnitude scale.
  const pv=project(s.vx,s.vy,i,view),mag=Math.hypot(pv.x,pv.y),vx=mag>1e-9?pv.x/mag*32:0,vy=mag>1e-9?-pv.y/mag*32:0;
  $('geometry').innerHTML=`<path d="${sector(-.025)}" fill="#e4b675" fill-opacity=".25" stroke="#e4b675" stroke-width="1"/><path d="${sector(.475)}" fill="#e4b675" fill-opacity=".25" stroke="#e4b675" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${R*k}" fill="#3b4541" stroke="#8eaaa0" stroke-width="1"/><ellipse cx="${cx}" cy="${cy}" rx="${R*k*.38}" ry="${R*k}" fill="none" stroke="#81938c" stroke-opacity=".35"/><path d="M${cx-R*k} ${cy}H${cx+R*k}" stroke="#81938c" stroke-opacity=".35"/><text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#e3e7e0" font-size="14">EARTH</text><path d="${path.join(' ')}Z" fill="none" stroke="#b5d8bc" stroke-width="2"/><circle cx="${pp[0]}" cy="${pp[1]}" r="3" fill="#e4b675"/><text x="${pp[0]}" y="${cy+28}" text-anchor="middle" fill="#e4b675" font-size="14">P</text><circle cx="${ap[0]}" cy="${ap[1]}" r="3" fill="#e4b675"/><text x="${ap[0]}" y="${cy+28}" text-anchor="middle" fill="#e4b675" font-size="14">A</text><path d="M${pos[0]} ${pos[1]}l${vx} ${vy}" stroke="#f3f2eb" stroke-width="2"/><circle cx="${pos[0]}" cy="${pos[1]}" r="6" fill="#e7f3e9" stroke="#212923" stroke-width="2"/><text x="28" y="35" fill="#acb8b0" font-size="13">P: perigee · A: apogee</text><text x="28" y="490" fill="#acb8b0" font-size="13">${view==='plane'?'Equal-time sectors: each 5% of one period':'Projected sectors: not true physical areas'}</text>`;
 }
 function readouts(){
  const m=metrics(a,e),s=stateAt(a,e,t);
  $('altitude').textContent=fmt(s.r-R)+' km';$('velocity').textContent=fmt(s.speed,3)+' km/s';$('period').textContent=fmt(m.T/60,2)+' min';$('elapsed').textContent=fmt(t/60,2)+' min';
  $('summary').textContent=`At ${fmt(t,0)} s: altitude ${fmt(s.r-R)} km, speed ${fmt(s.speed,3)} km/s, inward acceleration ${fmt(MU/s.r**2*1000,3)} m/s². Perigee ${fmt(m.hp)} km; apogee ${fmt(m.ha)} km. ${view==='plane'?'Each shaded area is '+fmt(m.h*m.T*.05/2,0)+' km².':'Projected height z = '+fmt(project(s.x,s.y,i,view).z)+' km (not shown as depth).'} White tick: velocity direction, not magnitude.`;
  const rows=[['Semi-major axis',a,baseline?.a,'km',1],['Eccentricity',e,baseline?.e,'',3],['Inclination',i,baseline?.i,'°',0],['Perigee altitude',m.hp,baseline?.hp,'km',1],['Apogee altitude',m.ha,baseline?.ha,'km',1],['Period',m.T/60,baseline?baseline.T/60:null,'min',2],['Period ratio',baseline?m.T/baseline.T:null,baseline?1:null,'',3]];
  $('comparison').innerHTML=rows.map(([label,value,b,unit,d])=>`<tr><th scope="row">${label}</th><td>${b==null?'—':fmt(b,d)+' '+unit}</td><td>${value==null?'—':fmt(value,d)+' '+unit}</td></tr>`).join('');
 }
 document.addEventListener('visibilitychange',()=>{last=null;});
 function frame(now){
  if(running&&!document.hidden){if(last!==null)t+=Math.min((now-last)/1000,.1)*Number($('warp').value);draw();if(now-lastRead>250){readouts();lastRead=now;}}
  last=now;requestAnimationFrame(frame);
 }
 preset(new URLSearchParams(location.search).get('preset')||'ellipse');
 requestAnimationFrame(frame);
}
