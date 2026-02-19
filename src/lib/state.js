export const LS_PROFILE = "ctf_profile_v1";
export const LS_SOLVED = "ctf_solved_v1";
export const LS_POINTS = "ctf_points_v1";

// challenge 1 time
export const LS_CH1_TIME_MS = "ctf_ch1_time_ms_v1";
export const LS_CH1_TIME_RECORDED = "ctf_ch1_time_recorded_v1";

export function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{
    return fallback;
  }
}
export function saveJSON(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}
export function getPoints(){
  return Number(localStorage.getItem(LS_POINTS) || "0");
}
export function setPoints(n){
  localStorage.setItem(LS_POINTS, String(n));
}
export function getSolvedSet(){
  return new Set(loadJSON(LS_SOLVED, []));
}
export function setSolvedSet(set){
  saveJSON(LS_SOLVED, [...set]);
}
export function formatHMS(ms){
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (x) => String(x).padStart(2,"0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
export function getCh1TimeLabel(){
  if(localStorage.getItem(LS_CH1_TIME_RECORDED) !== "1") return null;
  const ms = Number(localStorage.getItem(LS_CH1_TIME_MS) || "0");
  if(!ms) return null;
  return formatHMS(ms);
}
