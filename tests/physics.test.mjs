import test from 'node:test';
import assert from 'node:assert/strict';
import {MU,R,TAU,MAX_A,MIN_ALT,maxE,validate,period,eccentricAnomaly,stateAt,metrics,project,speedBounds,fromPerigeeSpeed} from '../src/physics.mjs';
const close=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<=tol,`${actual} vs ${expected}, tolerance ${tol}`);

test('400 km circular reference: independent rounded calculator values',()=>{
 const s=stateAt(R+400,0,0),m=metrics(R+400,0);
 close(s.speed,7.67259,0.00001);close(m.T/60,92.414,0.002);close(MU/s.r**2*1000,8.694,0.002);
 close(m.hp,400,1e-9);close(m.ha,400,1e-9);
});
test('Kepler residual across eccentricities, negative time and multiple revolutions',()=>{
 for(const e of [0,.001,.4,.8,.99])for(const M of [-100,-TAU,-.1,0,.00001,.1,Math.PI,6.2,100]){
  const E=eccentricAnomaly(M,e),normalized=((M%TAU)+TAU)%TAU;
  close(E-e*Math.sin(E),normalized,3e-14);
 }
});
test('position closes after a period; apsides and speeds match analytic relations',()=>{
 for(const [a,e] of [[R+400,0],[12000,.4],[40000,.8]]){
  const T=period(a),p=stateAt(a,e,0),end=stateAt(a,e,T),apo=stateAt(a,e,T/2);
  close(end.x,p.x,1e-8);close(end.y,p.y,1e-8);
  close(p.r,a*(1-e));close(apo.r,a*(1+e));close(p.speed/apo.speed,(1+e)/(1-e));
 }
});
test('energy and angular momentum remain constant at 101 orbital phases',()=>{
 for(const [a,e] of [[7000,0],[12000,.4],[40000,.8]]){
  const m=metrics(a,e);
  for(let k=0;k<=100;k++){
   const s=stateAt(a,e,k*m.T/100);
   close(s.speed**2/2-MU/s.r,m.energy,1e-10);
   close(s.x*s.vy-s.y*s.vx,m.h,1e-8);
  }
 }
});
test('equal swept areas independently integrated from polygon cross products',()=>{
 const a=12000,e=.4,T=period(a),N=2000;
 function area(start){let total=0;for(let j=0;j<N;j++){const p=stateAt(a,e,(start+j*.05/N)*T),q=stateAt(a,e,(start+(j+1)*.05/N)*T);total+=(p.x*q.y-p.y*q.x)/2;}return total;}
 const near=area(-.025),far=area(.475),expected=metrics(a,e).h*T*.05/2;
 close(near/expected,1,1e-7);close(far/expected,1,1e-7);close(near/far,1,1e-7);
});
test('Kepler third law: doubling a multiplies T by sqrt(8), independent of e',()=>{
 close(period(24000)/period(12000),Math.sqrt(8));
 close(metrics(12000,0).T,metrics(12000,.4).T);
});
test('inclination projection preserves 3D radius and has correct polar/retrograde limits',()=>{
 for(const i of [0,30,60,90,120,180]){const p=project(4000,9000,i,'equatorial');close(Math.hypot(p.x,p.y,p.z),Math.hypot(4000,9000),1e-9);}
 close(project(4,9,90,'equatorial').y,0);close(project(4,9,180,'equatorial').y,-9);
 assert.deepEqual(project(4,9,90,'plane'),{x:4,y:9,z:0});
});
test('physical perigee speed reconstruction keeps rp fixed across supported boundaries',()=>{
 for(const rp of [R+MIN_ALT,R+400,7200,12000,30000,MAX_A]){
  const {min,max}=speedBounds(rp);
  for(const v of [min,(min+max)/2,max]){const {a,e}=fromPerigeeSpeed(rp,v);validate(a,e);close(a*(1-e),rp,1e-7);close(metrics(a,e).vp,v,1e-10);}
 }
});
test('guardrails reject unsafe, unbound, nonfinite, and unit-confused inputs',()=>{
 for(const args of [[R,0],[12000,-.1],[12000,.8],[12000,1],[60001,0],[6771008,0],[NaN,0],[12000,Infinity],[12000,0,181]])assert.throws(()=>validate(...args),RangeError);
 for(const x of [NaN,Infinity,-1,0])assert.throws(()=>period(x),RangeError);
 assert.throws(()=>stateAt(12000,.4,NaN),RangeError);
 assert.throws(()=>eccentricAnomaly(0,1),RangeError);
 assert.throws(()=>fromPerigeeSpeed(7200,0),RangeError);
 assert.throws(()=>fromPerigeeSpeed(7200,Math.sqrt(2*MU/7200)),RangeError);
 validate(R+MIN_ALT,0);validate(MAX_A,.8);close(maxE(R+MIN_ALT),0);
});
// Independently integrate Cartesian acceleration, without calling the Kepler solver.
function derivative([x,y,vx,vy]){const r=Math.hypot(x,y),f=-MU/r**3;return [vx,vy,f*x,f*y];}
function rk4(s,dt){const k1=derivative(s),k2=derivative(s.map((x,j)=>x+dt*k1[j]/2)),k3=derivative(s.map((x,j)=>x+dt*k2[j]/2)),k4=derivative(s.map((x,j)=>x+dt*k3[j]));return s.map((x,j)=>x+dt*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);}
test('independent RK4 trajectory agrees with Kepler propagation over a full orbit',t=>{
 for(const [a,e] of [[R+400,0],[12000,.4],[40000,.8]]){
  const rp=a*(1-e),vp=Math.sqrt(MU*(1+e)/rp),T=period(a),N=16000,dt=T/N;
  let s=[rp,0,0,vp],maxPosition=0,maxVelocity=0;
  for(let j=1;j<=N;j++){s=rk4(s,dt);if(j%100===0){const q=stateAt(a,e,j*dt);maxPosition=Math.max(maxPosition,Math.hypot(s[0]-q.x,s[1]-q.y));maxVelocity=Math.max(maxVelocity,Math.hypot(s[2]-q.vx,s[3]-q.vy));}}
  assert.ok(maxPosition<.001,`position error ${maxPosition} km`);assert.ok(maxVelocity<1e-6,`velocity error ${maxVelocity} km/s`);
  t.diagnostic(`a=${a} km e=${e}: max position error ${maxPosition.toExponential(4)} km; velocity ${maxVelocity.toExponential(4)} km/s`);
 }
});
