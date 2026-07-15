'use strict';
/* ---------------- spawning ---------------- */
function spawnCoinAt(x,y,val,burst){
  const a=Math.random()*Math.PI*2,s=burst?(60+Math.random()*160):0;
  coins.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,val:val,t:Math.random()*10,fart:false});
}
function spawnFart(x,y){coins.push({x:x,y:y,vx:0,vy:0,val:5,t:Math.random()*10,fart:true});}
function spawnCiv(farFromPlayer){
  let p=findWalkable();
  if(farFromPlayer){let tries=0;while(dist(p.x,p.y,player.x,player.y)<500&&tries<20){p=findWalkable();tries++;}}
  civs.push({type:pick(['bonk','popcat','wif','chill']),x:p.x,y:p.y,dir:'d',face:1,phase:0,moving:false,t:0,fleeT:0,hp:20,flash:0,wx:0,wy:0});
}
function spawnCop(){
  const a=Math.random()*Math.PI*2,d=600+Math.random()*250;
  const p=findWalkableNear(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,200);
  cops.push({x:p.x,y:p.y,dir:'d',face:1,phase:0,moving:true,hp:50,cd:0,gcd:1+Math.random(),flash:0,leave:false,leaveT:0});
}
function spawnCopCar(){
  const a=Math.random()*Math.PI*2,d=800+Math.random()*300;
  const p=findWalkableNear(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,250);
  copcars.push({x:p.x,y:p.y,ang:Math.random()*Math.PI*2,speed:0,hp:120,cd:0,flash:0,leave:false,leaveT:0});
}
function spawnGuard(i){
  guards.push({
    x:(bank.x0+(i===0?0.7:5.3))*TILE,y:(bank.y0+5.5)*TILE,
    dir:'d',face:1,phase:0,moving:false,hp:120,cd:0,wind:0,attackT:0,flash:0,aggro:false,wp:i===0?0:2
  });
}
function spawnShark(){
  const a=Math.random()*Math.PI*2;
  const p=findWalkableNear(player.x+Math.cos(a)*900,player.y+Math.sin(a)*900,250);
  sharks.push({x:p.x,y:p.y,face:1,phase:0,moving:true,hp:140,cd:0,flash:0,lungeT:0,lungeCd:0,ldx:0,ldy:0});
  msg('TRALALERO TRALALA IS HUNTING YOU');
}
function spawnBomber(){
  bombers.push({x:player.x-1000,y:player.y-200,vx:280,dropCd:1.5});
  msg('BOMBARDIRO CROCODILO INBOUND');
}
function spawnMev(side){
  const p=findWalkableNear(player.x+side*320,player.y,160);
  mevs.push({x:p.x,y:p.y,face:1,phase:0,moving:true,hp:220,cd:0,gcd:1.5,flash:0,dashT:0,ddx:0,ddy:0,pickT:0});
}
function spawnJeet(x,y){
  jeet={x:x,y:y,face:1,phase:0,moving:true,hp:60,flash:0,t:0,wx:1,wy:0};
}
function spawnCars(){
  cars=[];
  let tries=0;
  while(cars.length<14&&tries<600){
    tries++;
    const tx=2+Math.floor(Math.random()*(MW-4)),ty=2+Math.floor(Math.random()*(MH-4));
    if(tileAt(tx,ty)!==T_ROAD)continue;
    let crowded=false;
    for(const o of cars)if(dist((tx+0.5)*TILE,(ty+0.5)*TILE,o.x,o.y)<110){crowded=true;break;}
    if(crowded)continue;
    const vert=tx%8<2&&!(ty%8<2);
    cars.push({
      x:(tx+0.5)*TILE,y:(ty+0.5)*TILE,
      ang:vert?(Math.random()<0.5?Math.PI/2:-Math.PI/2):(Math.random()<0.5?0:Math.PI),
      speed:0,drv:false,
      type:pick(['sedan','sedan','taxi','van','sport']),
      color:pick(['#c23b3b','#3b7bc2','#c2a53b','#3bc27f','#b8b8c0','#8a56c9'])
    });
  }
}
const TDIR=[[1,0],[0,1],[-1,0],[0,-1]];
function roadDirOptions(tx,ty,exDir){
  const res=[];
  for(let i=0;i<4;i++){
    if(exDir!==null&&i===(exDir+2)%4)continue;
    if(tileAt(tx+TDIR[i][0],ty+TDIR[i][1])===T_ROAD)res.push(i);
  }
  return res;
}
function spawnTraffic(){
  for(let t=0;t<40;t++){
    const a=Math.random()*Math.PI*2,d=550+Math.random()*400;
    const px=player.x+Math.cos(a)*d,py=player.y+Math.sin(a)*d;
    const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
    if(tx<2||ty<2||tx>=MW-2||ty>=MH-2)continue;
    if(tileAt(tx,ty)!==T_ROAD)continue;
    const opts=roadDirOptions(tx,ty,null);
    if(!opts.length)continue;
    const dir=pick(opts);
    traffic.push({
      x:(tx+0.5)*TILE,y:(ty+0.5)*TILE,dir:dir,ang:dir*Math.PI/2,speed:0,
      tx:tx+TDIR[dir][0],ty:ty+TDIR[dir][1],
      type:pick(['sedan','sedan','taxi','van']),
      color:pick(['#c23b3b','#3b7bc2','#c2a53b','#3bc27f','#b8b8c0','#8a56c9'])
    });
    return;
  }
}
function updateTraffic(dt){
  trafSpawnT-=dt;
  if(traffic.length<10&&trafSpawnT<=0){trafSpawnT=0.8;spawnTraffic();}
  for(let i=traffic.length-1;i>=0;i--){
    const c=traffic[i];
    if(dist(c.x,c.y,player.x,player.y)>1500){traffic.splice(i,1);continue;}
    const gx=(c.tx+0.5)*TILE,gy=(c.ty+0.5)*TILE;
    const dxg=gx-c.x,dyg=gy-c.y,lg=Math.sqrt(dxg*dxg+dyg*dyg);
    if(lg<8){
      const opts=roadDirOptions(c.tx,c.ty,c.dir);
      let nd;
      if(opts.indexOf(c.dir)>=0&&Math.random()<0.7)nd=c.dir;
      else if(opts.length)nd=pick(opts);
      else nd=(c.dir+2)%4;
      c.dir=nd;c.ang=nd*Math.PI/2;
      c.tx+=TDIR[nd][0];c.ty+=TDIR[nd][1];
      continue;
    }
    const ax=c.x+TDIR[c.dir][0]*70,ay=c.y+TDIR[c.dir][1]*70;
    let block=false;
    for(const o of cars)if(dist(ax,ay,o.x,o.y)<52){block=true;break;}
    if(!block)for(const o of traffic)if(o!==c&&dist(ax,ay,o.x,o.y)<48){block=true;break;}
    if(!block)for(const o of copcars)if(dist(ax,ay,o.x,o.y)<52){block=true;break;}
    if(!block)if(dist(ax,ay,player.x,player.y)<(player.car?60:36))block=true;
    c.speed=block?Math.max(0,c.speed-500*dt):Math.min(150,c.speed+220*dt);
    const mv=Math.min(c.speed*dt,lg);
    if(mv>0){c.x+=dxg/lg*mv;c.y+=dyg/lg*mv;}
  }
}
function shootBullet(x,y,ang,friendly,dmg,speed){
  bullets.push({x:x,y:y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,friendly:friendly,dmg:dmg,t:0});
}
