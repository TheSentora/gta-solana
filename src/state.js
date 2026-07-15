'use strict';
/* ---------------- state ---------------- */
let state='title',time=0,deadT=0;
const player={x:0,y:0,dir:'d',phase:0,moving:false,hp:100,sol:0,attackT:0,hitDone:false,flash:0,car:null,face:1,aim:0,gunCd:0};
let hasGun=false,ammo=0;
const cam={x:0,y:0};
let shake=0;
let coins=[],civs=[],cops=[],guards=[],sharks=[],bombers=[],bombs=[],cars=[],copcars=[],mevs=[],bullets=[],ammos=[],parts=[],pops=[],msgs=[],stains=[],skids=[];
let jeet=null;
let traffic=[],trafSpawnT=0,pickups=[],pickT=10;
let boostT=0,shieldHp=0,freezeT=0;
let musicOn=true,musT=0,musStep=0;
let prev1=false,prev2=false,curW=0;
const WEAPONS=[
  {name:'PHANTOM PIECE',cd:0.22,dmg:26,use:1,pellets:1,spread:0.06,owned:true,price:0},
  {name:'BONK-9',cd:0.09,dmg:14,use:1,pellets:1,spread:0.16,owned:false,price:40},
  {name:'JEET SWEEPER',cd:0.8,dmg:16,use:3,pellets:5,spread:0.5,owned:false,price:60}
];
function cycleWeapon(){
  for(let i=1;i<=WEAPONS.length;i++){
    const n=(curW+i)%WEAPONS.length;
    if(WEAPONS[n].owned){curW=n;break;}
  }
  popAt(player.x,player.y-56,WEAPONS[curW].name,'#ffd23e',14);
}
let wanted=0,heatT=99,starT=0,copSpawnT=0,civT=0,coinT=0,carSpawnT=0;
let robT=0,bankCd=0,heisted=false,prevE=false;
let sirenT=0,sirenAlt=false,engineT=0;
let outage=0,outageT=80;
let missionIdx=0,missionActive=false,mst={};
let tolyPos={x:10.5*TILE,y:19.5*TILE},bonkPos={x:0,y:0};

const DIRV={d:[0,1],u:[0,-1],l:[-1,0],r:[1,0]};
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function dist(ax,ay,bx,by){const dx=ax-bx,dy=ay-by;return Math.sqrt(dx*dx+dy*dy);}
function msg(t){msgs.push({txt:t,t:4});if(msgs.length>3)msgs.shift();}
function popAt(x,y,txt,color,size){pops.push({x:x,y:y,txt:txt,t:0,color:color||'#f4f4f8',size:size||15});}
function splat(x,y,color,n){
  freezeT=Math.max(freezeT,0.05);
  for(let i=0;i<(n||10);i++){
    const a=Math.random()*Math.PI*2,s=40+Math.random()*140;
    parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,life:0.35+Math.random()*0.3,color:color,size:3+Math.random()*4});
  }
}
function stain(x,y,color,big){
  stains.push({x:x,y:y,color:color,t:0,r:big?16:10,seed:Math.random()*10});
  if(stains.length>60)stains.shift();
}
function crime(n){
  const before=wanted;
  wanted=Math.min(5,wanted+n);heatT=0;
  if(wanted>before)popAt(player.x,player.y-60,'WANTED '+'★'.repeat(wanted),'#ffd23e',18);
}
function dmgPlayer(n){
  if(state!=='play')return;
  if(shieldHp>0){
    const a=Math.min(shieldHp,n);
    shieldHp-=a;n-=a;
    popAt(player.x,player.y-64,'STAKE ABSORBED','#8247e5',13);
    if(n<=0){player.flash=0.1;return;}
  }
  player.hp-=n;player.flash=0.25;shake=Math.min(14,shake+4);sndHit();
  if(player.hp<=0){player.hp=0;state='dead';deadT=0;sndDie();}
}
function dmgPop(x,y,d){popAt(x,y-30,'-'+d,'#f4f4f8',11);}
