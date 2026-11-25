// Units throughout: km, seconds, radians (inclination input explicitly degrees).
// Constants: NASA JPL SSD, DE440 GM and mean spherical radius (see SOURCES.md).
export const MU = 398600.435507;
export const R = 6371.0084;
export const MIN_ALT = 200;
export const MAX_A = 60000;
export const TAU = 2 * Math.PI;
const finite = x => typeof x === 'number' && Number.isFinite(x);
export const maxE = a => Math.max(0, Math.min(0.8, 1 - (R + MIN_ALT) / a));
export function validate(a, e, i = 0) {
  if (![a,e,i].every(finite) || a < R + MIN_ALT || a > MAX_A || e < 0 || e > maxE(a) + 1e-12 || i < 0 || i > 180)
    throw new RangeError('Use a = 6571.0084–60000 km, e = 0–0.8, i = 0–180°, and perigee altitude ≥ 200 km.');
}
export function period(a) {
  if (!finite(a) || a <= 0) throw new RangeError('Semi-major axis must be positive kilometers.');
  return TAU * Math.sqrt(a ** 3 / MU);
}
export function eccentricAnomaly(M, e) {
  if (!finite(M) || !finite(e) || e < 0 || e >= 1) throw new RangeError('Finite mean anomaly and 0 ≤ e < 1 required.');
  M = ((M % TAU) + TAU) % TAU;
  // Monotonic bracketed solve: robust even at high eccentricity, deterministic tolerance.
  let lo = 0, hi = TAU;
  for (let j = 0; j < 52; j++) {
    const E = (lo + hi) / 2;
    if (E - e * Math.sin(E) < M) lo = E; else hi = E;
  }
  return (lo + hi) / 2;
}
export function stateAt(a, e, t) {
  validate(a,e);
  if (!finite(t)) throw new RangeError('Time must be finite seconds.');
  const n = Math.sqrt(MU / a ** 3), E = eccentricAnomaly(n * t,e);
  const c = Math.cos(E), s = Math.sin(E), b = Math.sqrt(1 - e * e), d = 1 - e * c;
  const x = a * (c - e), y = a * b * s;
  const vx = -a * n * s / d, vy = a * n * b * c / d;
  return {x,y,vx,vy,r: a*d, speed: Math.hypot(vx,vy),E};
}
export function metrics(a,e) {
  validate(a,e);
  const rp=a*(1-e), ra=a*(1+e);
  return {rp,ra,hp:rp-R,ha:ra-R,T:period(a),vp:Math.sqrt(MU*(2/rp-1/a)),va:Math.sqrt(MU*(2/ra-1/a)),energy:-MU/(2*a),h:Math.sqrt(MU*a*(1-e*e))};
}
export function project(x,y,inclination,view='plane') {
  if (!finite(inclination) || inclination<0 || inclination>180) throw new RangeError('Inclination must be 0–180 degrees.');
  const i=inclination*Math.PI/180;
  // Ω=ω=0. Orbit plane coordinates rotated about x (line of nodes), then XY projection.
  return view === 'equatorial' ? {x,y:y*Math.cos(i),z:y*Math.sin(i)} : {x,y,z:0};
}
export function speedBounds(rp) {
  if (!finite(rp) || rp < R+MIN_ALT-1e-8 || rp > MAX_A) throw new RangeError('Perigee outside supported range.');
  return {min:Math.sqrt(MU/rp),max:Math.sqrt(MU/rp*(1+Math.min(.8,1-rp/MAX_A)))};
}
export function fromPerigeeSpeed(rp,v) {
  const bounds=speedBounds(rp);
  if (!finite(v) || v < bounds.min-1e-10 || v > bounds.max+1e-10) throw new RangeError('Speed would leave the supported bound-orbit range.');
  const e=Math.max(0,rp*v*v/MU-1), a=rp/(1-e);
  validate(Math.min(a,MAX_A),e);
  return {a:Math.min(a,MAX_A),e};
}
