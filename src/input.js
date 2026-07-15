'use strict';
/* ---------------- input ---------------- */
const keys={};
const mouse={x:640,y:360,down:false};
window.addEventListener('keydown',e=>{
  initAudio();
  const k=e.key.toLowerCase();
  keys[k]=true;
  if(k==='m'){muted=!muted;msg(muted?'SOUND OFF':'SOUND ON');}
  if(k==='q'&&state==='play')cycleWeapon();
  if(k==='n'){musicOn=!musicOn;msg(musicOn?'MUSIC ON':'MUSIC OFF');}
  if(k==='p'&&(state==='play'||state==='pause'))state=state==='play'?'pause':'play';
  if(k==='enter'){
    if(state==='title')startGame();
    else if(state==='win')state='play';
  }
  if(k==='r'&&state==='title'){wipeSave();msg('SAVE WIPED');}
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].indexOf(k)>=0)e.preventDefault();
});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
window.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
window.addEventListener('mousedown',e=>{initAudio();if(e.button===0)mouse.down=true;});
window.addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
window.addEventListener('contextmenu',e=>e.preventDefault());
