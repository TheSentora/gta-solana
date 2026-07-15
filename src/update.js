'use strict';
/* ---------------- update ---------------- */
function update(dt){
  const justE=keys['e']&&!prevE;
  const frozen=outage>0;
  const camOx=cam.x,camOy=cam.y;
  player.aim=Math.atan2(mouse.y+camOy-player.y+30,mouse.x+camOx-player.x);

  /* outage clock */
  if(outage>0){
    outage-=dt;
    if(outage<=0)msg('MAINNET BACK ONLINE. NPCS RESUMED.');
  }else{
    outageT-=dt;
    if(outageT<=0)triggerOutage();
  }

  /* ------ player: drive or walk ------ */
  if(player.car){
    const c=player.car;
    let acc=0;
    if(keys['w']||keys['arrowup'])acc=1;
    else if(keys['s']||keys['arrowdown'])acc=-0.6;
    c.speed+=acc*400*(boostT>0?1.35:1)*dt;
    c.speed*=Math.max(0,1-1.1*dt);
    c.speed=Math.max(-170,Math.min(440,c.speed));
    let steer=0;
    if(keys['a']||keys['arrowleft'])steer=-1;
    if(keys['d']||keys['arrowright'])steer=1;
    if(steer!==0&&Math.abs(c.speed)>20)
      c.ang+=steer*2.6*dt*Math.min(1,Math.abs(c.speed)/170)*Math.sign(c.speed);
    if(steer!==0&&Math.abs(c.speed)>260){
      skids.push({x:c.x-Math.cos(c.ang)*22,y:c.y-Math.sin(c.ang)*22,ang:c.ang,t:0});
      if(skids.length>140)skids.shift();
    }
    const nx=c.x+Math.cos(c.ang)*c.speed*dt,ny=c.y+Math.sin(c.ang)*c.speed*dt;
    const fx=nx+Math.cos(c.ang)*32*Math.sign(c.speed||1),fy=ny+Math.sin(c.ang)*32*Math.sign(c.speed||1);
    let hitCar=false;
    for(const o of cars)if(o!==c&&dist(nx,ny,o.x,o.y)<56){hitCar=true;break;}
    if(!hitCar)for(const o of copcars)if(dist(nx,ny,o.x,o.y)<58){hitCar=true;break;}
    if(!hitCar)for(const o of traffic)if(dist(nx,ny,o.x,o.y)<56){hitCar=true;break;}
    if(solidAt(fx,fy)||hitCar){
      if(Math.abs(c.speed)>120){shake=Math.min(14,shake+5);noiseS(0.1,0.1);}
      c.speed*=-0.3;
    }else{
      c.x=Math.max(TILE+30,Math.min(MW*TILE-TILE-30,nx));
      c.y=Math.max(TILE+30,Math.min(MH*TILE-TILE-30,ny));
    }
    const ut=tileAt(Math.floor(c.x/TILE),Math.floor(c.y/TILE));
    if(ut===T_GRASS||ut===T_PARK)c.speed*=Math.max(0,1-1.6*dt);
    player.x=c.x;player.y=c.y;
    engineT-=dt;
    if(engineT<=0&&Math.abs(c.speed)>30){engineT=0.14;beep(80+Math.abs(c.speed)*0.35,0.1,'sawtooth',0.018);}
    if(justE){
      const offs=[[52,0],[-52,0],[0,56],[0,-56]];
      for(const o of offs){
        if(!solidAt(c.x+o[0],c.y+o[1])){
          player.car=null;c.drv=false;
          player.x=c.x+o[0];player.y=c.y+o[1];
          break;
        }
      }
    }
  }else{
    let ax=0,ay=0;
    if(keys['w']||keys['arrowup'])ay-=1;
    if(keys['s']||keys['arrowdown'])ay+=1;
    if(keys['a']||keys['arrowleft'])ax-=1;
    if(keys['d']||keys['arrowright'])ax+=1;
    player.moving=(ax!==0||ay!==0);
    if(player.moving){
      const sp=(keys['shift']?300:210)*(boostT>0?1.45:1)*dt,il=1/Math.sqrt(ax*ax+ay*ay);
      moveEnt(player,ax*il*sp,ay*il*sp,12);
      player.phase+=dt*(keys['shift']?14:11);
      if(Math.abs(ax)>=Math.abs(ay))player.dir=ax<0?'l':'r';
      else player.dir=ay<0?'u':'d';
      if(ax!==0)player.face=ax<0?-1:1;
    }
    /* cars are solid on foot */
    const solidCars=[cars,traffic,copcars];
    for(const list of solidCars)for(const o of list){
      const d=dist(player.x,player.y,o.x,o.y);
      if(d<42&&d>0){
        const nx2=player.x+(player.x-o.x)/d*(42-d),ny2=player.y+(player.y-o.y)/d*(42-d);
        if(!solidAt(nx2,ny2)){player.x=nx2;player.y=ny2;}
      }
    }
    /* bat */
    if(keys[' ']&&player.attackT<=0){player.attackT=0.3;player.hitDone=false;sndSwing();}
    if(player.attackT>0){
      player.attackT-=dt;
      if(!player.hitDone&&player.attackT<0.2){
        player.hitDone=true;
        const dv=DIRV[player.dir],hx=player.x+dv[0]*42,hy=player.y+dv[1]*42;
        meleeHit(hx,hy,dv);
      }
    }
    /* enter car */
    if(justE&&!nearAnyInteract()){
      let best=null,bd=64,bestT=-1;
      for(const c of cars){const d=dist(player.x,player.y,c.x,c.y);if(d<bd){bd=d;best=c;bestT=-1;}}
      for(let ti=0;ti<traffic.length;ti++){const d=dist(player.x,player.y,traffic[ti].x,traffic[ti].y);if(d<bd){bd=d;best=null;bestT=ti;}}
      if(best){player.car=best;best.drv=true;popAt(best.x,best.y-30,'JACKED','#f4f4f8',15);}
      else if(bestT>=0){
        const t=traffic[bestT];
        const nc={x:t.x,y:t.y,ang:t.ang,speed:t.speed,drv:true,type:t.type,color:t.color};
        cars.push(nc);traffic.splice(bestT,1);
        player.car=nc;crime(1);
        popAt(nc.x,nc.y-30,'CARJACKED','#ffd23e',15);
      }
    }
  }
  if(player.flash>0)player.flash-=dt;
  if(player.hp<100&&heatT>8)player.hp=Math.min(100,player.hp+2*dt);

  /* ------ gun ------ */
  player.gunCd-=dt;
  if(hasGun&&mouse.down&&player.gunCd<=0){
    const w=WEAPONS[curW];
    if(ammo>=w.use){
      ammo-=w.use;player.gunCd=w.cd;
      const gx=player.x+Math.cos(player.aim)*20,gy=player.y-26+Math.sin(player.aim)*20;
      for(let p=0;p<w.pellets;p++)
        shootBullet(gx,gy,player.aim+(Math.random()-0.5)*w.spread,true,w.dmg,560);
      parts.push({x:gx,y:gy,vx:0,vy:0,t:0,life:0.06,color:'#ffd23e',size:w.pellets>1?13:9});
      if(w.pellets>1){noiseS(0.12,0.2);beep(120,0.1,'square',0.06,50);shake=Math.min(14,shake+4);}
      else if(w.cd<0.15){beep(300,0.04,'square',0.04,120);noiseS(0.03,0.08);shake=Math.min(14,shake+0.6);}
      else{sndGun();shake=Math.min(14,shake+1);}
    }else{
      player.gunCd=0.4;
      popAt(player.x,player.y-52,'NO AMMO. GUN.FUN SELLS IT.','#9a9aa2',13);
    }
  }

  /* ------ interactions: missions, shops, vault ------ */
  const m=missionIdx<missions.length?missions[missionIdx]:null;
  if(m&&!missionActive&&m.manual&&!player.car){
    const mk=m.marker();
    if(mk&&dist(player.x,player.y,mk.x,mk.y)<50&&justE)startMission(missionIdx);
  }
  for(const s of specials){
    if(player.car)break;
    if(dist(player.x,player.y,s.doorX,s.doorY)<56&&justE){
      if(s.name==='PUMP.FUN'){
        if(missionIdx===1&&!missionActive)break; /* marker E handled above */
        if(missionIdx===1&&missionActive)break;
        if(player.sol>=10){
          player.sol-=10;
          if(Math.random()<0.42){player.sol+=20;popAt(player.x,player.y-52,'2X. FEW UNDERSTAND. +20 ◎','#14f195',15);sndJingle();}
          else{popAt(player.x,player.y-52,'RUGGED. DEV SOLD.','#e03c3c',15);sndRug();}
        }else popAt(player.x,player.y-52,'NEED 10 ◎ TO APE','#9a9aa2',13);
      }else if(s.name==='GUN.FUN'){
        if(player.sol>=5){player.sol-=5;ammo+=12;popAt(player.x,player.y-52,'+12 AMMO','#ffd23e',15);sndCoin();}
        else popAt(player.x,player.y-52,'AMMO COSTS 5 ◎','#9a9aa2',13);
      }else if(s.name==='JUP JUICE'){
        if(player.hp>=100)popAt(player.x,player.y-52,'ALREADY JUICED','#9a9aa2',13);
        else if(player.sol>=10){player.sol-=10;player.hp=100;popAt(player.x,player.y-52,'FULL HEALTH. GLASS CHEWED.','#14f195',15);sndHeal();}
        else popAt(player.x,player.y-52,'JUICE COSTS 10 ◎','#9a9aa2',13);
      }
    }
  }
  /* buy weapons at GUN.FUN with 1 / 2 */
  const just1=keys['1']&&!prev1,just2=keys['2']&&!prev2;
  if(!player.car&&(just1||just2))for(const s of specials){
    if(s.name==='GUN.FUN'&&dist(player.x,player.y,s.doorX,s.doorY)<56){
      const wi=just1?1:2,w=WEAPONS[wi];
      if(w.owned)popAt(player.x,player.y-52,'ALREADY OWNED','#9a9aa2',13);
      else if(player.sol>=w.price){
        player.sol-=w.price;w.owned=true;curW=wi;
        popAt(player.x,player.y-52,w.name+' ACQUIRED','#ffd23e',15);
        sndJingle();save();
      }else popAt(player.x,player.y-52,w.name+' COSTS '+w.price+' ◎','#9a9aa2',13);
    }
  }

  /* ------ robbery ------ */
  const nearVault=!player.car&&dist(player.x,player.y,vaultX,vaultY)<80;
  if(nearVault&&bankCd<=0&&keys['e']){
    robT+=dt;
    if(robT>0.25)for(const g of guards)g.aggro=true;
    if(robT>=3){
      robT=0;bankCd=75;heisted=true;
      if(missionIdx===0){missionActive=true;mst={robbed:true};}
      for(let i=0;i<26;i++)spawnCoinAt(vaultX,vaultY+10,3,true);
      popAt(vaultX,vaultY-70,'HEIST! THE VAULT IS OPEN','#14f195',20);
      msg('YOU CRACKED THE SOLANA BANK. NOW GET AWAY.');
      crime(3);sndAlarm();shake=Math.min(14,shake+8);
    }
  }else robT=Math.max(0,robT-dt*2);
  if(bankCd>0){
    bankCd-=dt;
    if(bankCd<=0){bankCd=0;while(guards.length<2)spawnGuard(guards.length);}
  }

  /* ------ wanted ------ */
  heatT+=dt;
  if(wanted>0&&heatT>6){
    starT+=dt;
    if(starT>4){
      starT=0;wanted--;
      if(wanted===0){
        msg(heisted?'YOU GOT AWAY WITH THE BAG':'HEAT LOST');
        heisted=false;
        for(const g of guards)g.aggro=false;
      }
    }
  }else starT=0;
  if(wanted>0&&!frozen){
    sirenT+=dt;
    if(sirenT>0.55){sirenT=0;sirenAlt=!sirenAlt;beep(sirenAlt?650:880,0.22,'triangle',0.03);}
  }

  /* music */
  if(!muted&&musicOn&&AC){
    musT+=dt;
    if(musT>0.25){
      musT-=0.25;musStep=(musStep+1)%16;
      if(musStep%4===0)beep(52,0.18,'sine',0.07);
      if(musStep%4===2)noiseS(0.015,0.03);
      const seq=[110,110,131,98];
      if(musStep%2===1)beep(seq[(musStep>>2)%4],0.2,'triangle',0.025);
    }
  }

  /* powerup pickups */
  pickT-=dt;
  if(pickups.length<2&&pickT<=0){
    pickT=14;
    const p=findWalkable();
    const hasBoost=pickups.some(function(q){return q.type==='boost';});
    pickups.push({x:p.x,y:p.y,type:hasBoost?'shield':'boost'});
  }
  for(let i=pickups.length-1;i>=0;i--){
    const pu=pickups[i];
    if(dist(pu.x,pu.y,player.x,player.y)<32){
      if(pu.type==='boost'){boostT=8;popAt(player.x,player.y-52,'JITO BOOST','#14f195',16);}
      else{shieldHp=50;popAt(player.x,player.y-52,'STAKED. 50 SHIELD.','#8247e5',16);}
      sndJingle();pickups.splice(i,1);
    }
  }
  if(boostT>0){
    boostT-=dt;
    parts.push({x:player.x+(Math.random()*16-8),y:player.y-4,vx:0,vy:24,t:0,life:0.25,color:'#14f195',size:5});
  }

  /* ------ mission update ------ */
  if(missionActive&&missionIdx<missions.length)missions[missionIdx].update(dt);

  /* ------ AI (frozen during outage) ------ */
  if(!frozen){
    updateCops(dt);
    updateCopCars(dt);
    updateGuards(dt);
    updateSharks(dt);
    updateBombers(dt);
    updateMevs(dt);
    updateJeet(dt);
    updateCivs(dt);
    updateTraffic(dt);
  }

  /* ------ run people over (works even on frozen NPCs) ------ */
  if(player.car&&Math.abs(player.car.speed)>130)runover();

  /* ------ bullets ------ */
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];
    if(!b.friendly&&frozen)continue;
    b.t+=dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.t>1.2||solidAt(b.x,b.y)){
      parts.push({x:b.x,y:b.y,vx:0,vy:0,t:0,life:0.1,color:'#d8d8de',size:4});
      bullets.splice(i,1);continue;
    }
    if(b.friendly){
      if(bulletHitEnemies(b)){bullets.splice(i,1);continue;}
    }else{
      if(dist(b.x,b.y,player.x,player.y-20)<16){
        dmgPlayer(b.dmg);bullets.splice(i,1);continue;
      }
    }
  }

  /* ------ bombs ------ */
  if(!frozen)for(let i=bombs.length-1;i>=0;i--){
    const b=bombs[i];
    b.t+=dt;
    if(b.t>=1){
      bombs.splice(i,1);
      sndBoom();shake=Math.min(16,shake+11);
      splat(b.x,b.y,'#ff8c1a',22);splat(b.x,b.y,'#ffd23e',14);
      stain(b.x,b.y,'#2a2a30',true);
      if(dist(b.x,b.y,player.x,player.y)<95)dmgPlayer(35);
      for(let k=cops.length-1;k>=0;k--)if(dist(b.x,b.y,cops[k].x,cops[k].y)<95){splat(cops[k].x,cops[k].y,'#e03c3c',8);stain(cops[k].x,cops[k].y,'#5e1414');cops.splice(k,1);}
      for(let k=civs.length-1;k>=0;k--)if(dist(b.x,b.y,civs[k].x,civs[k].y)<95){splat(civs[k].x,civs[k].y,'#e03c3c',8);stain(civs[k].x,civs[k].y,'#5e1414');civs.splice(k,1);}
    }
  }

  /* ------ spawners ------ */
  if(!frozen){
    const desired=wanted>0?Math.min(9,wanted*2):0;
    copSpawnT-=dt;
    if(cops.length<desired&&copSpawnT<=0){copSpawnT=1.4;spawnCop();}
    const carsDesired=wanted>=2?Math.min(3,wanted-1):0;
    carSpawnT-=dt;
    if(copcars.length<carsDesired&&carSpawnT<=0){carSpawnT=3;spawnCopCar();}
    if(wanted>=3&&sharks.length<1)spawnShark();
    if(wanted>=5&&bombers.length<1)spawnBomber();
    civT-=dt;
    if(civs.length<16&&civT<=0){civT=4;spawnCiv(true);}
  }
  coinT-=dt;
  if(coins.length<40&&coinT<=0){
    coinT=3;
    const p=findWalkable();
    if(Math.random()<0.1)spawnFart(p.x,p.y);else spawnCoinAt(p.x,p.y,1,false);
  }

  /* ------ coins ------ */
  const pickR=player.car?50:30;
  for(let i=coins.length-1;i>=0;i--){
    const c=coins[i];
    c.t+=dt;
    c.x+=c.vx*dt;c.y+=c.vy*dt;
    c.vx*=Math.max(0,1-4*dt);c.vy*=Math.max(0,1-4*dt);
    if(solidAt(c.x,c.y)){c.vx*=-0.5;c.vy*=-0.5;c.x-=c.vx*dt*2;c.y-=c.vy*dt*2;}
    const d=dist(c.x,c.y,player.x,player.y);
    if(d<70){c.x+=(player.x-c.x)*dt*6;c.y+=(player.y-c.y)*dt*6;}
    if(d<pickR){
      player.sol+=c.val;
      if(missionActive&&missionIdx===3)mst.count+=c.val;
      if(c.fart){popAt(player.x,player.y-46,'FARTCOIN +5 ◎','#b08432',15);sndFart();}
      else{popAt(player.x,player.y-46,'+'+c.val+' ◎','#14f195',14);sndCoin();}
      coins.splice(i,1);
      if(player.sol>=100&&player.sol-c.val<100)msg('100 ◎. WHALE STATUS.');
    }
  }
  /* ammo pickups */
  for(let i=ammos.length-1;i>=0;i--){
    const a=ammos[i];
    if(dist(a.x,a.y,player.x,player.y)<30){
      ammo+=a.amt;
      popAt(player.x,player.y-46,'+'+a.amt+' AMMO','#ffd23e',14);
      sndCoin();ammos.splice(i,1);
    }
  }

  /* ------ fx ------ */
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.t>=p.life)parts.splice(i,1);
  }
  for(let i=pops.length-1;i>=0;i--){
    const p=pops[i];
    p.t+=dt;p.y-=36*dt;
    if(p.t>1.1)pops.splice(i,1);
  }
  for(let i=msgs.length-1;i>=0;i--){
    msgs[i].t-=dt;
    if(msgs[i].t<=0)msgs.splice(i,1);
  }
  for(let i=stains.length-1;i>=0;i--){
    stains[i].t+=dt;
    if(stains[i].t>9)stains.splice(i,1);
  }
  for(let i=skids.length-1;i>=0;i--){
    skids[i].t+=dt;
    if(skids[i].t>6)skids.splice(i,1);
  }

  /* ------ camera ------ */
  const dv=DIRV[player.dir];
  let tx=player.x-W/2+dv[0]*30,ty=player.y-H/2+dv[1]*30;
  if(hasGun){tx+=(mouse.x-W/2)*0.08;ty+=(mouse.y-H/2)*0.08;}
  cam.x+=(tx-cam.x)*Math.min(1,dt*6);
  cam.y+=(ty-cam.y)*Math.min(1,dt*6);
  cam.x=Math.max(0,Math.min(MW*TILE-W,cam.x));
  cam.y=Math.max(0,Math.min(MH*TILE-H,cam.y));
  shake=Math.max(0,shake-26*dt);

  prevE=keys['e'];prev1=keys['1'];prev2=keys['2'];
}

function nearAnyInteract(){
  if(dist(player.x,player.y,vaultX,vaultY)<80)return true;
  const m=missionIdx<missions.length?missions[missionIdx]:null;
  if(m&&!missionActive&&m.manual){
    const mk=m.marker();
    if(mk&&dist(player.x,player.y,mk.x,mk.y)<50)return true;
  }
  for(const s of specials)if(dist(player.x,player.y,s.doorX,s.doorY)<56)return true;
  return false;
}

/* ------ melee ------ */
function meleeHit(hx,hy,dv){
  let landed=false;
  for(let i=civs.length-1;i>=0;i--){
    const c=civs[i];
    if(dist(hx,hy,c.x,c.y-14)<38){
      landed=true;c.hp-=30;c.flash=0.2;
      if(c.type!=='chill')c.fleeT=5;
      for(const o of civs)if(o.type!=='chill'&&dist(o.x,o.y,c.x,c.y)<220)o.fleeT=4;
      if(c.hp<=0){
        const label=c.type==='popcat'?'POP!':(c.type==='bonk'?'BONKED':(c.type==='chill'?'NOT CHILL ANYMORE':'HAT SNATCHED'));
        popAt(c.x,c.y-30,label,'#ffd23e',16);
        splat(c.x,c.y-10,'#e03c3c',8);stain(c.x,c.y,'#5e1414');
        spawnCoinAt(c.x,c.y,1,true);spawnCoinAt(c.x,c.y,1,true);
        civs.splice(i,1);crime(1);
      }else if(c.type==='chill'){
        popAt(c.x,c.y-30,'STILL CHILL','#9a9aa2',14);c.hp=10;
      }
    }
  }
  for(let i=cops.length-1;i>=0;i--){
    const c=cops[i];
    if(dist(hx,hy,c.x,c.y-14)<40){
      landed=true;c.hp-=34;c.flash=0.2;
      moveEnt(c,dv[0]*20,dv[1]*20,12);
      if(c.hp<=0)killCop(i);
    }
  }
  for(let i=guards.length-1;i>=0;i--){
    const g=guards[i];
    if(dist(hx,hy,g.x,g.y-20)<44){
      landed=true;g.hp-=34;g.flash=0.2;g.aggro=true;
      if(g.hp<=0)killGuard(i);
    }
  }
  for(let i=sharks.length-1;i>=0;i--){
    const s=sharks[i];
    if(dist(hx,hy,s.x,s.y-14)<48){
      landed=true;s.hp-=34;s.flash=0.2;
      if(s.hp<=0)killShark(i);
    }
  }
  for(let i=mevs.length-1;i>=0;i--){
    const mv=mevs[i];
    if(dist(hx,hy,mv.x,mv.y-18)<44){
      landed=true;mv.hp-=34;mv.flash=0.2;
      if(mv.hp<=0)killMev(i);
    }
  }
  if(jeet&&dist(hx,hy,jeet.x,jeet.y-14)<40){
    landed=true;jeet.hp-=34;jeet.flash=0.2;
    if(jeet.hp<=0)killJeet();
  }
  for(let i=copcars.length-1;i>=0;i--){
    const cc=copcars[i];
    if(dist(hx,hy,cc.x,cc.y)<48){
      landed=true;cc.hp-=34;cc.flash=0.2;
      if(cc.hp<=0)killCopCar(i);
    }
  }
  if(landed)sndHit();
}
function bulletHitEnemies(b){
  for(let i=cops.length-1;i>=0;i--)if(dist(b.x,b.y,cops[i].x,cops[i].y-14)<16){cops[i].hp-=b.dmg;cops[i].flash=0.2;dmgPop(cops[i].x,cops[i].y,b.dmg);if(cops[i].hp<=0)killCop(i);return true;}
  for(let i=guards.length-1;i>=0;i--)if(dist(b.x,b.y,guards[i].x,guards[i].y-24)<20){guards[i].hp-=b.dmg;guards[i].flash=0.2;guards[i].aggro=true;dmgPop(guards[i].x,guards[i].y-14,b.dmg);if(guards[i].hp<=0)killGuard(i);return true;}
  for(let i=sharks.length-1;i>=0;i--)if(dist(b.x,b.y,sharks[i].x,sharks[i].y-16)<22){sharks[i].hp-=b.dmg;sharks[i].flash=0.2;dmgPop(sharks[i].x,sharks[i].y,b.dmg);if(sharks[i].hp<=0)killShark(i);return true;}
  for(let i=mevs.length-1;i>=0;i--)if(dist(b.x,b.y,mevs[i].x,mevs[i].y-18)<20){mevs[i].hp-=b.dmg;mevs[i].flash=0.2;dmgPop(mevs[i].x,mevs[i].y-10,b.dmg);if(mevs[i].hp<=0)killMev(i);return true;}
  if(jeet&&dist(b.x,b.y,jeet.x,jeet.y-14)<16){jeet.hp-=b.dmg;jeet.flash=0.2;dmgPop(jeet.x,jeet.y,b.dmg);if(jeet.hp<=0)killJeet();return true;}
  for(let i=copcars.length-1;i>=0;i--)if(dist(b.x,b.y,copcars[i].x,copcars[i].y)<30){copcars[i].hp-=b.dmg;copcars[i].flash=0.2;dmgPop(copcars[i].x,copcars[i].y,b.dmg);if(copcars[i].hp<=0)killCopCar(i);return true;}
  for(let i=civs.length-1;i>=0;i--)if(dist(b.x,b.y,civs[i].x,civs[i].y-14)<14){
    civs[i].hp-=b.dmg;civs[i].flash=0.2;dmgPop(civs[i].x,civs[i].y,b.dmg);
    if(civs[i].hp<=0){splat(civs[i].x,civs[i].y,'#e03c3c',8);stain(civs[i].x,civs[i].y,'#5e1414');popAt(civs[i].x,civs[i].y-24,'DOWN','#e03c3c',14);civs.splice(i,1);crime(1);}
    return true;
  }
  return false;
}
function killCop(i){
  const c=cops[i];
  popAt(c.x,c.y-30,'COP DOWN','#e03c3c',16);
  splat(c.x,c.y-10,'#e03c3c',10);stain(c.x,c.y,'#5e1414');
  spawnCoinAt(c.x,c.y,1,true);
  if(hasGun&&Math.random()<0.6)ammos.push({x:c.x+10,y:c.y,amt:4});
  cops.splice(i,1);crime(1);
}
function killGuard(i){
  const g=guards[i];
  popAt(g.x,g.y-40,'SAHUR DOWN','#ffd23e',17);
  splat(g.x,g.y-20,'#a4713d',14);stain(g.x,g.y,'#4a3115');
  for(let k=0;k<5;k++)spawnCoinAt(g.x,g.y,1,true);
  guards.splice(i,1);crime(1);
}
function killShark(i){
  const s=sharks[i];
  popAt(s.x,s.y-36,'TRALALERO DELETED','#14f195',17);
  splat(s.x,s.y-14,'#3f6fd8',14);stain(s.x,s.y,'#22355e');
  for(let k=0;k<6;k++)spawnCoinAt(s.x,s.y,1,true);
  sharks.splice(i,1);
}
function killMev(i){
  const mv=mevs[i];
  popAt(mv.x,mv.y-40,'MEV BOT SCRAPPED','#14f195',17);
  splat(mv.x,mv.y-18,'#9aa0ac',16);sndBoom();
  for(let k=0;k<10;k++)spawnCoinAt(mv.x,mv.y,1,true);
  mevs.splice(i,1);
}
function killJeet(){
  popAt(jeet.x,jeet.y-36,'DEV CAUGHT. BAG RECOVERED.','#14f195',17);
  splat(jeet.x,jeet.y-14,'#e03c3c',10);stain(jeet.x,jeet.y,'#5e1414');
  for(let k=0;k<8;k++)spawnCoinAt(jeet.x,jeet.y,5,true);
  jeet=null;
}
function killCopCar(i){
  const cc=copcars[i];
  popAt(cc.x,cc.y-30,'UNIT DOWN','#e03c3c',16);
  splat(cc.x,cc.y,'#ff8c1a',20);stain(cc.x,cc.y,'#2a2a30',true);
  sndBoom();shake=Math.min(14,shake+6);
  for(let k=0;k<3;k++)spawnCoinAt(cc.x,cc.y,1,true);
  copcars.splice(i,1);crime(1);
}

/* ------ AI updates ------ */
function updateCops(dt){
  for(let i=cops.length-1;i>=0;i--){
    const c=cops[i];
    if(c.flash>0)c.flash-=dt;
    if(wanted===0&&!c.leave){c.leave=true;c.leaveT=3;}
    if(c.leave&&wanted>0)c.leave=false;
    if(c.leave){
      c.leaveT-=dt;
      const dx=c.x-player.x,dy=c.y-player.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      moveEnt(c,dx/l*120*dt,dy/l*120*dt,12);
      c.phase+=dt*9;c.moving=true;
      if(c.leaveT<=0){cops.splice(i,1);continue;}
    }else{
      const dx=player.x-c.x,dy=player.y-c.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      if(l>30){moveEnt(c,dx/l*175*dt,dy/l*175*dt,12);c.phase+=dt*10;c.moving=true;}
      else c.moving=false;
      if(Math.abs(dx)>=Math.abs(dy)){c.dir=dx<0?'l':'r';c.face=dx<0?-1:1;}
      else c.dir=dy<0?'u':'d';
      c.cd-=dt;c.gcd-=dt;
      if(l<36&&c.cd<=0){c.cd=0.9;dmgPlayer(player.car?4:8);popAt(player.x,player.y-50,'BATON','#e03c3c',13);}
      if(wanted>=3&&l<430&&l>60&&c.gcd<=0){
        c.gcd=1.7;
        shootBullet(c.x,c.y-20,Math.atan2(dy,dx)+(Math.random()*0.14-0.07),false,7,360);
        sndGun();
      }
    }
    for(const o of cops)if(o!==c){
      const d=dist(c.x,c.y,o.x,o.y);
      if(d>0&&d<24){const px=(c.x-o.x)/d,py=(c.y-o.y)/d;c.x+=px*20*dt;c.y+=py*20*dt;}
    }
  }
}
function updateCopCars(dt){
  for(let i=copcars.length-1;i>=0;i--){
    const c=copcars[i];
    if(c.flash>0)c.flash-=dt;
    if(wanted<2&&!c.leave){c.leave=true;c.leaveT=4;}
    if(c.leave&&wanted>=2)c.leave=false;
    const dx=player.x-c.x,dy=player.y-c.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
    let des=Math.atan2(dy,dx);
    if(c.leave){
      des=Math.atan2(-dy,-dx);
      c.leaveT-=dt;
      if(c.leaveT<=0){copcars.splice(i,1);continue;}
    }
    let da=des-c.ang;
    while(da>Math.PI)da-=Math.PI*2;
    while(da<-Math.PI)da+=Math.PI*2;
    c.ang+=Math.max(-2.2*dt,Math.min(2.2*dt,da));
    const target=l<140&&!c.leave?200:300;
    c.speed+=(target-c.speed)*Math.min(1,dt*2);
    const nx=c.x+Math.cos(c.ang)*c.speed*dt,ny=c.y+Math.sin(c.ang)*c.speed*dt;
    let ccHit=solidAt(nx+Math.cos(c.ang)*30,ny+Math.sin(c.ang)*30);
    if(!ccHit)for(const o of cars)if(dist(nx,ny,o.x,o.y)<56){ccHit=true;break;}
    if(!ccHit)for(const o of copcars)if(o!==c&&dist(nx,ny,o.x,o.y)<58){ccHit=true;break;}
    if(!ccHit)for(const o of traffic)if(dist(nx,ny,o.x,o.y)<56){ccHit=true;break;}
    if(ccHit){c.speed*=-0.4;}
    else{c.x=nx;c.y=ny;}
    c.cd-=dt;
    if(l<52&&c.cd<=0&&!c.leave){
      c.cd=1;
      dmgPlayer(player.car?8:12);
      if(player.car)player.car.speed*=0.6;
      shake=Math.min(14,shake+5);noiseS(0.1,0.12);
      popAt(player.x,player.y-50,'RAMMED','#e03c3c',14);
    }
  }
}
function updateGuards(dt){
  const wps=[
    [(bank.x0+0.5)*TILE,(bank.y0+0.5)*TILE],[(bank.x0+5.5)*TILE,(bank.y0+0.5)*TILE],
    [(bank.x0+5.5)*TILE,(bank.y0+5.5)*TILE],[(bank.x0+0.5)*TILE,(bank.y0+5.5)*TILE]
  ];
  for(const g of guards){
    if(g.flash>0)g.flash-=dt;
    const dp=dist(g.x,g.y,player.x,player.y);
    const hunting=(g.aggro||dp<70)&&(!player.car||dp<200);
    if(hunting){
      const dx=player.x-g.x,dy=player.y-g.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      if(l>34){moveEnt(g,dx/l*150*dt,dy/l*150*dt,13);g.phase+=dt*9;g.moving=true;}
      else g.moving=false;
      g.face=dx<0?-1:1;
      g.cd-=dt;
      if(l<50&&g.cd<=0&&g.wind<=0&&g.attackT<=0)g.wind=0.35;
      if(g.wind>0){
        g.wind-=dt;
        if(g.wind<=0){
          g.attackT=0.22;g.cd=1.4;sndTung();
          if(dist(g.x,g.y,player.x,player.y)<58){
            dmgPlayer(20);
            popAt(player.x,player.y-56,'TUNG TUNG TUNG','#ffd23e',17);
            const kx=player.x-g.x,ky=player.y-g.y,kl=Math.max(1,Math.sqrt(kx*kx+ky*ky));
            moveEnt(player,kx/kl*34,ky/kl*34,12);
          }
        }
      }
      if(g.attackT>0)g.attackT-=dt;
    }else{
      g.wind=0;
      const wp=wps[g.wp],dx=wp[0]-g.x,dy=wp[1]-g.y,l=Math.sqrt(dx*dx+dy*dy);
      if(l<10)g.wp=(g.wp+1)%4;
      else{moveEnt(g,dx/l*70*dt,dy/l*70*dt,13);g.phase+=dt*6;g.moving=true;g.face=dx<0?-1:1;}
    }
  }
}
function updateSharks(dt){
  for(let i=sharks.length-1;i>=0;i--){
    const s=sharks[i];
    if(s.flash>0)s.flash-=dt;
    if(wanted<3){splat(s.x,s.y,'#3f6fd8',6);sharks.splice(i,1);continue;}
    const dx=player.x-s.x,dy=player.y-s.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
    s.face=dx<0?-1:1;
    s.lungeCd-=dt;s.cd-=dt;
    if(s.lungeT>0){
      s.lungeT-=dt;
      moveEnt(s,s.ldx*480*dt,s.ldy*480*dt,14);
      s.phase+=dt*16;
    }else{
      if(l<220&&s.lungeCd<=0){s.lungeCd=1.6;s.lungeT=0.35;s.ldx=dx/l;s.ldy=dy/l;}
      moveEnt(s,dx/l*220*dt,dy/l*220*dt,14);
      s.phase+=dt*11;
    }
    s.moving=true;
    if(l<40&&s.cd<=0){
      s.cd=1.1;dmgPlayer(player.car?8:15);
      popAt(player.x,player.y-52,'CHOMP','#3f6fd8',16);
      moveEnt(player,dx/l*26,dy/l*26,12);
    }
  }
}
function updateBombers(dt){
  for(let i=bombers.length-1;i>=0;i--){
    const b=bombers[i];
    if(wanted<5){
      b.x+=b.vx*3*dt;
      if(Math.abs(b.x-player.x)>1500)bombers.splice(i,1);
      continue;
    }
    b.vx=(player.x>b.x?1:-1)*280;
    b.x+=b.vx*dt;
    b.y+=(player.y-120-b.y)*Math.min(1,dt*1.2);
    b.dropCd-=dt;
    if(Math.abs(b.x-player.x)<240&&b.dropCd<=0){b.dropCd=2.4;bombs.push({x:b.x,y:b.y+90,t:0});}
  }
}
function updateMevs(dt){
  for(let i=mevs.length-1;i>=0;i--){
    const mv=mevs[i];
    if(mv.flash>0)mv.flash-=dt;
    const dx=player.x-mv.x,dy=player.y-mv.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
    mv.face=dx<0?-1:1;
    mv.pickT-=dt;mv.cd-=dt;mv.gcd-=dt;
    if(mv.dashT>0){
      mv.dashT-=dt;
      moveEnt(mv,mv.ddx*380*dt,mv.ddy*380*dt,14);
      mv.phase+=dt*18;
      parts.push({x:mv.x,y:mv.y-10,vx:0,vy:0,t:0,life:0.15,color:'#9aa0ac',size:5});
    }else{
      if(mv.pickT<=0){
        mv.pickT=1;
        if(l<420){mv.dashT=0.3;mv.ddx=dx/l;mv.ddy=dy/l;}
      }
      moveEnt(mv,dx/l*120*dt,dy/l*120*dt,14);
      mv.phase+=dt*8;
    }
    mv.moving=true;
    if(l<40&&mv.cd<=0){
      mv.cd=1.2;dmgPlayer(18);
      popAt(player.x,player.y-52,'SANDWICHED','#e03c3c',16);
      const kl=Math.max(1,l);
      moveEnt(player,dx/kl*30,dy/kl*30,12);
    }
    if(l<430&&l>80&&mv.gcd<=0){
      mv.gcd=2.2;
      shootBullet(mv.x,mv.y-18,Math.atan2(dy,dx),false,10,340);
      beep(500,0.08,'square',0.04,200);
    }
  }
}
function updateJeet(dt){
  if(!jeet)return;
  if(jeet.flash>0)jeet.flash-=dt;
  jeet.t-=dt;
  const dx=jeet.x-player.x,dy=jeet.y-player.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
  if(jeet.t<=0){
    jeet.t=0.5+Math.random();
    const fa=Math.atan2(dy,dx)+(Math.random()*1.2-0.6);
    jeet.wx=Math.cos(fa);jeet.wy=Math.sin(fa);
  }
  const sp=l<500?235:120;
  moveEnt(jeet,jeet.wx*sp*dt,jeet.wy*sp*dt,10);
  jeet.phase+=dt*13;jeet.moving=true;
  jeet.face=jeet.wx<0?-1:1;
  if(Math.random()<dt*0.7)popAt(jeet.x,jeet.y-40,pick(['CANT CATCH ME SER','ITS JUST A RUG','DYOR NEXT TIME']),'#e03c3c',12);
}
function updateCivs(dt){
  for(const c of civs){
    if(c.flash>0)c.flash-=dt;
    c.t-=dt;
    if(c.fleeT>0&&c.type!=='chill'){
      c.fleeT-=dt;
      const dx=c.x-player.x,dy=c.y-player.y,l=Math.max(1,Math.sqrt(dx*dx+dy*dy));
      moveEnt(c,dx/l*150*dt,dy/l*150*dt,10);
      c.phase+=dt*12;c.moving=true;c.face=dx<0?-1:1;
    }else{
      if(c.t<=0){
        c.t=1+Math.random()*2.5;
        if(Math.random()<0.3){c.wx=0;c.wy=0;}
        else{const a=Math.random()*Math.PI*2;c.wx=Math.cos(a);c.wy=Math.sin(a);}
      }
      if(c.wx!==0||c.wy!==0){
        moveEnt(c,c.wx*60*dt,c.wy*60*dt,10);
        c.phase+=dt*7;c.moving=true;
        if(c.wx!==0)c.face=c.wx<0?-1:1;
      }else c.moving=false;
    }
  }
}
function runover(){
  const c=player.car;
  for(let i=civs.length-1;i>=0;i--)if(dist(c.x,c.y,civs[i].x,civs[i].y)<36){
    popAt(civs[i].x,civs[i].y-24,'SPLAT','#e03c3c',15);
    splat(civs[i].x,civs[i].y,'#e03c3c',10);stain(civs[i].x,civs[i].y,'#5e1414');
    civs.splice(i,1);crime(1);sndHit();
  }
  for(let i=cops.length-1;i>=0;i--)if(dist(c.x,c.y,cops[i].x,cops[i].y)<36){
    popAt(cops[i].x,cops[i].y-24,'COP DOWN','#e03c3c',15);
    splat(cops[i].x,cops[i].y,'#e03c3c',10);stain(cops[i].x,cops[i].y,'#5e1414');
    cops.splice(i,1);crime(1);sndHit();
  }
  for(let i=sharks.length-1;i>=0;i--)if(dist(c.x,c.y,sharks[i].x,sharks[i].y)<40){
    sharks[i].hp-=60;sharks[i].flash=0.2;sndHit();
    if(sharks[i].hp<=0)killShark(i);
  }
  for(let i=guards.length-1;i>=0;i--)if(dist(c.x,c.y,guards[i].x,guards[i].y)<40){
    guards[i].hp-=60;guards[i].flash=0.2;guards[i].aggro=true;sndHit();
    if(guards[i].hp<=0)killGuard(i);
  }
  for(let i=mevs.length-1;i>=0;i--)if(dist(c.x,c.y,mevs[i].x,mevs[i].y)<42){
    mevs[i].hp-=50;mevs[i].flash=0.2;sndHit();
    if(mevs[i].hp<=0)killMev(i);
  }
  if(jeet&&dist(c.x,c.y,jeet.x,jeet.y)<36){
    jeet.hp-=60;jeet.flash=0.2;sndHit();
    if(jeet.hp<=0)killJeet();
  }
}
