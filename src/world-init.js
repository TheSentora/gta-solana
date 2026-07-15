'use strict';
/* ---------------- game start ---------------- */
genMap();
if(parkBlocks.length>0){
  bonkPos={x:(parkBlocks[0].x0+3)*TILE,y:(parkBlocks[0].y0+5.5)*TILE};
}else{
  bonkPos={x:tolyPos.x+3*TILE,y:tolyPos.y};
}
let mmc=null;
function prerenderMinimap(){
  mmc=document.createElement('canvas');
  mmc.width=MW*3;mmc.height=MH*3;
  const m=mmc.getContext('2d');
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const t=grid[gi(x,y)];
    let c='#3b3b43';
    if(t===T_GRASS||t===T_PARK)c='#3d6b39';
    else if(t===T_SIDE||t===T_PLAZA)c='#77777f';
    else if(t===T_BLD)c=specialAt(x,y)?specialAt(x,y).c1:'#55565f';
    else if(t===T_BANK)c='#8247e5';
    else if(t===T_TREE)c='#2c522a';
    m.fillStyle=c;m.fillRect(x*3,y*3,3,3);
  }
}
prerenderMinimap();

function startGame(){
  state='play';
  missionIdx=0;missionActive=false;hasGun=true;ammo=24;
  WEAPONS[1].owned=false;WEAPONS[2].owned=false;curW=0;
  boostT=0;shieldHp=0;freezeT=0;
  player.sol=0;
  loadSave();
  player.x=8.5*TILE;player.y=19.5*TILE;
  player.hp=100;player.car=null;player.attackT=0;player.flash=0;player.gunCd=0;
  wanted=0;heatT=99;starT=0;robT=0;bankCd=0;heisted=false;
  outage=0;outageT=80;
  coins=[];civs=[];cops=[];guards=[];sharks=[];bombers=[];bombs=[];copcars=[];mevs=[];bullets=[];ammos=[];parts=[];pops=[];msgs=[];stains=[];skids=[];
  traffic=[];pickups=[];pickT=10;
  jeet=null;
  for(let i=0;i<70;i++){const p=findWalkable();spawnCoinAt(p.x,p.y,1,false);}
  for(let i=0;i<6;i++){const p=findWalkable();spawnFart(p.x,p.y);}
  for(let i=0;i<16;i++)spawnCiv(false);
  spawnGuard(0);spawnGuard(1);
  spawnCars();
  cam.x=player.x-W/2;cam.y=player.y-H/2;
  if(missionIdx===0)msg('JOB ONE: ROB THE SOLANA BANK. YELLOW MARKER.');
  else msg('WELCOME BACK. YELLOW MARKER FOR YOUR NEXT JOB.');
}
function respawn(){
  state='play';
  const lost=player.sol-Math.floor(player.sol*0.7);
  player.sol=Math.floor(player.sol*0.7);
  player.hp=100;player.car=null;player.flash=0;player.attackT=0;
  player.x=8.5*TILE;player.y=19.5*TILE;
  wanted=0;heatT=99;heisted=false;robT=0;
  boostT=0;shieldHp=0;freezeT=0;
  cops=[];sharks=[];bombers=[];bombs=[];copcars=[];mevs=[];bullets=[];
  jeet=null;
  for(const c of cars)c.drv=false;
  if(missionActive){missionActive=false;msg('JOB FAILED. HIT THE MARKER TO RETRY.');}
  msg(lost>0?('THE STREETS KEPT '+lost+' ◎'):'BACK ON THE GRIND');
}
