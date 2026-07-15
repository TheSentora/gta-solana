'use strict';
/* ---------------- save ---------------- */
function save(){
  try{localStorage.setItem('gts_save3',JSON.stringify({mi:missionIdx,sol:player.sol,ammo:ammo,w1:WEAPONS[1].owned,w2:WEAPONS[2].owned}));}catch(e){}
}
function loadSave(){
  try{
    const s=JSON.parse(localStorage.getItem('gts_save3'));
    if(s&&typeof s.mi==='number'){
      missionIdx=Math.min(missions.length,s.mi);
      player.sol=s.sol|0;ammo=Math.max(ammo,s.ammo|0);
      WEAPONS[1].owned=!!s.w1;WEAPONS[2].owned=!!s.w2;
    }
  }catch(e){}
}
function wipeSave(){try{localStorage.removeItem('gts_save3');localStorage.removeItem('gts_save2');localStorage.removeItem('gts_save');}catch(e){}}
