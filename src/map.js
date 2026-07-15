'use strict';
/* ---------------- map ---------------- */
const TILE=64,MW=46,MH=38;
const T_GRASS=0,T_ROAD=1,T_SIDE=2,T_BLD=3,T_BANK=4,T_TREE=5,T_PARK=6,T_PLAZA=7;
const grid=new Uint8Array(MW*MH);
const bcol=new Uint8Array(MW*MH);
const BCOLS=[
  ['#8a6f5c','#6e5849'],['#7d7f88','#63646c'],['#a3654f','#82503e'],
  ['#6f8577','#57695e'],['#95856a','#776a54'],['#78708f','#5f5872']
];
const BILLWORDS=['WAGMI','FEW UNDERSTAND','GM SER','PROBABLY NOTHING','NGMI','TPS 65000','JEETS OUT','DIAMOND HANDS','APE FIRST','DYOR LOL'];
function gi(x,y){return y*MW+x;}
function tileAt(x,y){if(x<0||y<0||x>=MW||y>=MH)return T_TREE;return grid[gi(x,y)];}
function walkTile(t){return t===T_ROAD||t===T_SIDE||t===T_PARK||t===T_GRASS||t===T_PLAZA;}
function solidAt(px,py){const t=tileAt(Math.floor(px/TILE),Math.floor(py/TILE));return t===T_BLD||t===T_BANK||t===T_TREE;}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

let bank=null,vaultX=0,vaultY=0;
let specials=[],parkBlocks=[];
function genMap(){
  const rand=mulberry(1337);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)grid[gi(x,y)]=(x%8<2||y%8<2)?T_ROAD:T_GRASS;
  const blocks=[];
  for(let y0=2;y0+6<=MH;y0+=8)for(let x0=2;x0+6<=MW;x0+=8){
    const r=rand(),ci=(rand()*BCOLS.length)|0;
    blocks.push({x0:x0,y0:y0,bld:r<0.62,park:r>=0.62&&r<0.85});
    for(let y=y0;y<y0+6;y++)for(let x=x0;x<x0+6;x++){
      const edge=(x===x0||y===y0||x===x0+5||y===y0+5);
      if(r<0.62){grid[gi(x,y)]=edge?T_SIDE:T_BLD;bcol[gi(x,y)]=ci;}
      else if(r<0.85){grid[gi(x,y)]=T_PARK;if(!edge&&rand()<0.16)grid[gi(x,y)]=T_TREE;}
      else grid[gi(x,y)]=T_PLAZA;
    }
  }
  parkBlocks=blocks.filter(function(b){return b.park;});
  let best=null,bd=1e9;
  for(const b of blocks){
    if(!b.bld)continue;
    const d=Math.abs(b.x0+3-MW/2)+Math.abs(b.y0+3-MH/2);
    if(d<bd){bd=d;best=b;}
  }
  if(!best)best=blocks[0];
  bank=best;
  for(let y=best.y0;y<best.y0+6;y++)for(let x=best.x0;x<best.x0+6;x++){
    const edge=(x===best.x0||y===best.y0||x===best.x0+5||y===best.y0+5);
    grid[gi(x,y)]=edge?T_SIDE:T_BANK;
  }
  vaultX=(best.x0+3)*TILE;
  vaultY=(best.y0+5.5)*TILE;
  /* special shops: pump.fun casino, gun.fun, jup juice */
  const cand=blocks.filter(function(b){return b.bld&&b!==bank;});
  cand.sort(function(a,b){
    const da=Math.abs(a.x0-bank.x0)+Math.abs(a.y0-bank.y0);
    const db=Math.abs(b.x0-bank.x0)+Math.abs(b.y0-bank.y0);
    return da-db;
  });
  function mkSpec(b,name,c1,c2){
    return{name:name,x0:b.x0,y0:b.y0,c1:c1,c2:c2,doorX:(b.x0+3)*TILE,doorY:(b.y0+5.5)*TILE};
  }
  specials=[];
  if(cand.length>=3){
    specials.push(mkSpec(cand[0],'PUMP.FUN','#b03fbf','#8c2f99'));
    specials.push(mkSpec(cand[Math.floor(cand.length/2)],'GUN.FUN','#b08432','#8c6825'));
    specials.push(mkSpec(cand[cand.length-1],'JUP JUICE','#2f8c74','#226b58'));
  }
  for(let x=0;x<MW;x++){grid[gi(x,0)]=T_TREE;grid[gi(x,MH-1)]=T_TREE;}
  for(let y=0;y<MH;y++){grid[gi(0,y)]=T_TREE;grid[gi(MW-1,y)]=T_TREE;}
}
function specialAt(tx,ty){
  for(const s of specials)
    if(tx>s.x0&&tx<s.x0+5&&ty>s.y0&&ty<s.y0+5)return s;
  return null;
}
function findWalkable(){
  for(let i=0;i<300;i++){
    const tx=2+Math.floor(Math.random()*(MW-4)),ty=2+Math.floor(Math.random()*(MH-4));
    if(walkTile(tileAt(tx,ty)))return{x:(tx+0.5)*TILE,y:(ty+0.5)*TILE};
  }
  return{x:9*TILE,y:9*TILE};
}
function findWalkableNear(px,py,spread){
  for(let i=0;i<80;i++){
    const x=px+(Math.random()*2-1)*spread,y=py+(Math.random()*2-1)*spread;
    if(x>TILE&&y>TILE&&x<(MW-1)*TILE&&y<(MH-1)*TILE&&!solidAt(x,y))return{x:x,y:y};
  }
  return findWalkable();
}
function moveEnt(e,dx,dy,r){
  if(dx!==0){
    const nx=e.x+dx,sx=nx+(dx>0?r:-r);
    if(!solidAt(sx,e.y-r*0.6)&&!solidAt(sx,e.y+r*0.6))e.x=nx;
  }
  if(dy!==0){
    const ny=e.y+dy,sy=ny+(dy>0?r:-r);
    if(!solidAt(e.x-r*0.6,sy)&&!solidAt(e.x+r*0.6,sy))e.y=ny;
  }
  e.x=Math.max(TILE+r,Math.min(MW*TILE-TILE-r,e.x));
  e.y=Math.max(TILE+r,Math.min(MH*TILE-TILE-r,e.y));
}
