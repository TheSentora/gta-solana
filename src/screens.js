'use strict';
/* ---------------- screens ---------------- */
const tTung={x:0,y:0,face:1,phase:0,moving:true,flash:0,wind:0,attackT:0};
const tShark={x:0,y:0,face:-1,phase:0,moving:true,flash:0,lungeT:0};
const tPlayer={x:0,y:0,dir:'d',face:1,phase:0,moving:true,flash:0,attackT:0,car:null,aim:0};
const tChill={x:0,y:0,face:1,phase:0,moving:true,flash:0,fleeT:0,type:'chill'};
const tBonk={x:0,y:0,face:-1,phase:0,moving:true,flash:0,fleeT:0,type:'bonk'};
function drawTitle(){
  ctx.fillStyle='#101014';ctx.fillRect(0,0,W,H);
  /* skyline */
  ctx.fillStyle='#17171d';
  for(let i=0;i<14;i++){
    const bw=60+((i*73)%90),bh=90+((i*131)%180),bx=i*(W/13)-30;
    ctx.fillRect(bx,H-bh-90,bw,bh);
  }
  ctx.fillStyle='#1f1f26';
  for(let i=0;i<14;i++){
    const bx=i*(W/13)-30;
    for(let wy=0;wy<3;wy++)for(let wx=0;wx<3;wx++)
      if((i+wx+wy)%3===0)ctx.fillRect(bx+12+wx*16,H-160+wy*22,8,10);
  }
  ctx.fillStyle='#1a1a20';ctx.fillRect(0,H-96,W,96);
  ctx.textAlign='center';
  ctx.font='bold 58px Arial';
  ctx.fillStyle='#f4f4f8';
  ctx.fillText('GRAND THEFT',W/2,H*0.22);
  ctx.font='bold 96px Arial';
  ctx.fillStyle='#8247e5';
  ctx.fillText('SOLANA',W/2,H*0.22+96);
  ctx.fillStyle='#14f195';
  ctx.fillRect(W/2-220,H*0.22+116,440,8);
  ctx.font='bold 17px Arial';
  ctx.fillStyle='#9a9aa2';
  ctx.fillText('SEVEN MISSIONS. ONE BANK. ZERO REFUNDS.',W/2,H*0.22+152);
  tTung.phase=time*9;tTung.x=W*0.16;tTung.y=H-52;tTung.face=1;
  tTung.attackT=(time%2)<0.22?(time%2):0;
  tShark.phase=time*11;tShark.x=W*0.84;tShark.y=H-52;
  tShark.lungeT=(time%3)<0.4?0.3:0;
  tPlayer.phase=time*11;tPlayer.x=W*0.5;tPlayer.y=H-46;
  tPlayer.attackT=(time%1.6)<0.3?(0.3-(time%1.6)):0;
  tChill.phase=time*7;tChill.x=W*0.34;tChill.y=H-48;
  tBonk.phase=time*8;tBonk.x=W*0.66;tBonk.y=H-48;
  drawTung(tTung);drawShark(tShark);drawCiv(tChill);drawCiv(tBonk);drawPlayer(tPlayer);
  ctx.font='bold 15px Arial';
  ctx.fillStyle='#9a9aa2';
  const lines=[
    'WASD MOVE      SHIFT SPRINT      SPACE BAT      MOUSE AIM + CLICK SHOOT',
    'E TALK / ROB / JACK CARS / SHOP      Q SWAP WEAPON      P PAUSE',
    'M MUTE      N MUSIC      R RESET SAVE'
  ];
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],W/2,H*0.6+i*24);
  if(time%1<0.6){
    ctx.font='bold 26px Arial';
    ctx.fillStyle='#14f195';
    ctx.fillText('PRESS ENTER TO PLAY',W/2,H*0.52);
  }
}
function drawDead(){
  ctx.fillStyle='#101014';
  ctx.fillRect(0,H/2-80,W,160);
  ctx.fillStyle='#3a3a44';
  ctx.fillRect(0,H/2-80,W,4);ctx.fillRect(0,H/2+76,W,4);
  ctx.textAlign='center';
  ctx.font='bold 72px Arial';
  ctx.fillStyle='#e03c3c';
  ctx.fillText('WASTED',W/2,H/2+12);
  ctx.font='bold 16px Arial';
  ctx.fillStyle='#9a9aa2';
  ctx.fillText('THE STREETS KEEP 30% OF YOUR BAG',W/2,H/2+48);
}
function drawWin(){
  ctx.fillStyle='#101014';
  ctx.fillRect(0,H/2-110,W,220);
  ctx.fillStyle='#14f195';
  ctx.fillRect(0,H/2-110,W,5);ctx.fillRect(0,H/2+105,W,5);
  ctx.textAlign='center';
  ctx.font='bold 54px Arial';
  ctx.fillStyle='#14f195';
  ctx.fillText('VALIDATOR STATUS ACHIEVED',W/2,H/2-24);
  ctx.font='bold 22px Arial';
  ctx.fillStyle='#8247e5';
  ctx.fillText('THE CITY VALIDATES YOU. WAGMI.',W/2,H/2+16);
  ctx.font='bold 16px Arial';
  ctx.fillStyle='#9a9aa2';
  ctx.fillText('BAG: '+player.sol+' ◎        PRESS ENTER FOR FREE ROAM',W/2,H/2+58);
}
function drawPause(){
  panel(W/2-160,H/2-50,320,100);
  outText('PAUSED',W/2,H/2-6,32,'#f4f4f8');
  outText('P TO RESUME',W/2,H/2+30,14,'#9a9aa2');
}
