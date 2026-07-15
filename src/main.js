'use strict';
/* ---------------- loop ---------------- */
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);
  last=now;time+=dt;
  if(state==='play'){
    if(freezeT>0)freezeT-=dt;
    else update(dt);
  }
  else if(state==='dead'){deadT+=dt;if(deadT>2.6)respawn();}
  ctx.fillStyle='#26262c';ctx.fillRect(0,0,W,H);
  if(state==='title')drawTitle();
  else{
    drawWorld();drawHUD();
    if(state==='dead')drawDead();
    if(state==='win')drawWin();
    if(state==='pause')drawPause();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
