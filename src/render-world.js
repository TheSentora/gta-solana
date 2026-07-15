'use strict';
/* ---------------- world draw ---------------- */
function drawTiles(ox,oy){
  const x0=Math.max(0,Math.floor(ox/TILE)),y0=Math.max(0,Math.floor(oy/TILE));
  const x1=Math.min(MW-1,Math.ceil((ox+W)/TILE)),y1=Math.min(MH-1,Math.ceil((oy+H)/TILE));
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const t=grid[gi(tx,ty)],px=tx*TILE,py=ty*TILE;
    if(t===T_ROAD){
      ctx.fillStyle='#35353d';ctx.fillRect(px,py,TILE,TILE);
      const h=(tx*31+ty*17)%23;
      if(h===0){
        ctx.fillStyle='#2c2c33';
        ctx.beginPath();ctx.arc(px+32,py+32,9,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#44444d';ctx.lineWidth=2;ctx.stroke();
      }
      ctx.fillStyle='#d8d8de';
      const vRoad=tx%8<2,hRoad=ty%8<2;
      if(vRoad&&!hRoad){
        if(tx%8===1)for(let d=0;d<2;d++)ctx.fillRect(px-2,py+8+d*32,4,18);
        if(ty%8===2||ty%8===7)for(let d=0;d<7;d++)ctx.fillRect(px+4+d*9,py+(ty%8===2?6:TILE-18),6,12);
      }
      if(hRoad&&!vRoad){
        if(ty%8===1)for(let d=0;d<2;d++)ctx.fillRect(px+8+d*32,py-2,18,4);
        if(tx%8===2||tx%8===7)for(let d=0;d<7;d++)ctx.fillRect(px+(tx%8===2?6:TILE-18),py+4+d*9,12,6);
      }
    }else if(t===T_SIDE||t===T_PLAZA){
      ctx.fillStyle=t===T_SIDE?'#9a9aa2':'#a8a8b0';
      ctx.fillRect(px,py,TILE,TILE);
      ctx.strokeStyle='#88888f';ctx.lineWidth=2;
      ctx.strokeRect(px+1,py+1,TILE-2,TILE-2);
      if((tx*13+ty*7)%11===0){
        ctx.fillStyle='#7c7c85';
        for(let d=0;d<4;d++)ctx.fillRect(px+20,py+18+d*8,24,3);
      }
    }else if(t===T_GRASS||t===T_PARK||t===T_TREE){
      ctx.fillStyle=t===T_GRASS?'#4c8f46':'#54a04c';
      ctx.fillRect(px,py,TILE,TILE);
      const h=(tx*7+ty*13)%9;
      if(h===0){
        ctx.fillStyle='#448a3e';
        ctx.fillRect(px+18,py+30,8,4);ctx.fillRect(px+40,py+12,8,4);
      }else if(h===1&&t===T_PARK){
        ctx.fillStyle='#e05fa0';ctx.fillRect(px+20,py+20,5,5);
        ctx.fillStyle='#ffd23e';ctx.fillRect(px+40,py+38,5,5);
      }
      if(t===T_TREE){
        ctx.fillStyle='#6b4a2c';ctx.fillRect(px+27,py+30,10,22);
        ctx.fillStyle='#2e6b2a';
        ctx.beginPath();ctx.arc(px+32,py+24,22,0,Math.PI*2);ctx.fill();
        ctx.lineWidth=2.5;ctx.strokeStyle='#22521f';ctx.stroke();
        ctx.fillStyle='#387f33';
        ctx.beginPath();ctx.arc(px+27,py+19,12,0,Math.PI*2);ctx.fill();
      }
    }else if(t===T_BLD){
      const sp=specialAt(tx,ty);
      const cp=sp?[sp.c1,sp.c2]:BCOLS[bcol[gi(tx,ty)]];
      ctx.fillStyle=cp[0];ctx.fillRect(px,py,TILE,TILE);
      if(tileAt(tx,ty+1)!==T_BLD){
        ctx.fillStyle=cp[1];ctx.fillRect(px,py+TILE-14,TILE,14);
      }else{
        const h=(tx*31+ty*17)%14;
        if(h===0){
          ctx.fillStyle='#6e6e78';
          ctx.fillRect(px+14,py+16,26,20);
          ctx.fillStyle='#5a5a64';
          ctx.fillRect(px+16,py+18,22,4);ctx.fillRect(px+16,py+26,22,4);
        }else if(h===1){
          ctx.fillStyle=cp[1];
          ctx.beginPath();ctx.arc(px+32,py+32,10,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#101014';ctx.lineWidth=2;ctx.stroke();
        }else if(h===2){
          ctx.fillStyle='#20304a';
          ctx.fillRect(px+16,py+16,32,26);
          ctx.strokeStyle=cp[1];ctx.lineWidth=3;
          ctx.strokeRect(px+16,py+16,32,26);
        }else if(h===3){
          ctx.fillStyle='#1a1a20';
          ctx.fillRect(px+6,py+14,52,30);
          ctx.fillStyle='#14f195';
          ctx.font='bold 10px Arial';ctx.textAlign='center';
          ctx.fillText(BILLWORDS[(tx*7+ty)%BILLWORDS.length],px+32,py+33);
        }else if((tx*5+ty*9)%3!==0){
          ctx.fillStyle=cp[1];
          ctx.fillRect(px+12,py+12,14,14);ctx.fillRect(px+38,py+12,14,14);
          ctx.fillRect(px+12,py+38,14,14);ctx.fillRect(px+38,py+38,14,14);
        }
      }
    }else if(t===T_BANK){
      ctx.fillStyle='#8247e5';ctx.fillRect(px,py,TILE,TILE);
      if(tileAt(tx,ty+1)!==T_BANK){
        ctx.fillStyle='#5c2fae';ctx.fillRect(px,py+TILE-14,TILE,14);
      }
    }
  }
  /* bank dressing */
  const bx=(bank.x0+1)*TILE,by=(bank.y0+1)*TILE,bw=4*TILE,bh=4*TILE;
  if(bx+bw>ox&&bx<ox+W+TILE&&by+bh>oy&&by<oy+H+TILE){
    ctx.strokeStyle='#14f195';ctx.lineWidth=5;
    ctx.strokeRect(bx+4,by+4,bw-8,bh-8);
    outText('◎ SOLANA BANK',bx+bw/2,by+52,26,'#14f195');
    ctx.fillStyle='#231a3a';
    ctx.fillRect(vaultX-22,by+bh-30,44,30);
    ctx.strokeStyle='#14f195';ctx.lineWidth=3;
    ctx.strokeRect(vaultX-22,by+bh-30,44,30);
  }
  /* special shop dressing */
  for(const s of specials){
    const sx=(s.x0+1)*TILE,sy=(s.y0+1)*TILE,sw=4*TILE,sh=4*TILE;
    if(sx+sw<ox||sx>ox+W+TILE||sy+sh<oy||sy>oy+H+TILE)continue;
    outText(s.name,sx+sw/2,sy+50,24,'#f4f4f8');
    ctx.fillStyle='#1a1a20';
    ctx.fillRect(s.doorX-20,sy+sh-28,40,28);
    ctx.strokeStyle='#f4f4f8';ctx.lineWidth=3;
    ctx.strokeRect(s.doorX-20,sy+sh-28,40,28);
  }
  /* vault marker */
  const bob=Math.sin(time*4)*5;
  if(bankCd<=0){
    ctx.fillStyle='#14f195';
    ctx.beginPath();
    ctx.moveTo(vaultX,vaultY-34+bob);
    ctx.lineTo(vaultX-11,vaultY-52+bob);
    ctx.lineTo(vaultX+11,vaultY-52+bob);
    ctx.closePath();ctx.fill();
  }else{
    outText('BANK RE-OPENS '+Math.ceil(bankCd)+'S',vaultX,vaultY-40,14,'#9a9aa2');
  }
  /* mission marker */
  const m=missionIdx<missions.length?missions[missionIdx]:null;
  let mk=null;
  if(m){
    if(!missionActive)mk=m.marker();
    else if(m.target)mk=m.target();
  }
  if(mk){
    const pu=1+Math.sin(time*5)*0.15;
    ctx.strokeStyle='#ffd23e';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(mk.x,mk.y,26*pu,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ffd23e';
    ctx.beginPath();
    ctx.moveTo(mk.x,mk.y-38+bob);
    ctx.lineTo(mk.x-10,mk.y-54+bob);
    ctx.lineTo(mk.x+10,mk.y-54+bob);
    ctx.closePath();ctx.fill();
  }
}

function drawWorld(){
  const ox=Math.round(cam.x+(Math.random()*2-1)*shake);
  const oy=Math.round(cam.y+(Math.random()*2-1)*shake);
  ctx.save();ctx.translate(-ox,-oy);
  drawTiles(ox,oy);
  /* stains and skids */
  for(const s of skids){
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.ang);
    ctx.fillStyle='#26262c';
    ctx.fillRect(-3,-14,5,8);ctx.fillRect(-3,7,5,8);
    ctx.restore();
  }
  for(const s of stains){
    ctx.fillStyle=s.color;
    ctx.beginPath();ctx.ellipse(s.x,s.y,s.r,s.r*0.6,s.seed,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(s.x+s.r*0.8,s.y+3,s.r*0.4,s.r*0.25,0,0,Math.PI*2);ctx.fill();
  }
  for(const c of coins)drawCoin(c);
  for(const a of ammos){
    fillR(a.x-8,a.y-8,16,12,2,'#5a5e68');
    ctx.fillStyle='#ffd23e';
    ctx.fillRect(a.x-5,a.y-5,3,6);ctx.fillRect(a.x,a.y-5,3,6);
  }
  /* powerups */
  for(const pu of pickups){
    ctx.save();ctx.translate(pu.x,pu.y);
    const bo=Math.sin(time*4)*3;
    if(pu.type==='boost'){
      ctx.fillStyle='#0e3d2a';ctx.beginPath();ctx.arc(0,bo,13,0,Math.PI*2);ctx.fill();
      ctx.lineWidth=2.5;ctx.strokeStyle='#14f195';ctx.stroke();
      ctx.fillStyle='#14f195';
      ctx.beginPath();
      ctx.moveTo(2,-8+bo);ctx.lineTo(-5,1+bo);ctx.lineTo(-1,1+bo);
      ctx.lineTo(-2,8+bo);ctx.lineTo(5,-1+bo);ctx.lineTo(1,-1+bo);
      ctx.closePath();ctx.fill();
    }else{
      ctx.fillStyle='#2a1a4d';ctx.beginPath();ctx.arc(0,bo,13,0,Math.PI*2);ctx.fill();
      ctx.lineWidth=2.5;ctx.strokeStyle='#8247e5';ctx.stroke();
      ctx.fillStyle='#8247e5';
      ctx.beginPath();
      ctx.moveTo(0,-7+bo);ctx.lineTo(7,-3+bo);ctx.lineTo(7,2+bo);
      ctx.lineTo(0,8+bo);ctx.lineTo(-7,2+bo);ctx.lineTo(-7,-3+bo);
      ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
  /* depth sort */
  const dr=[];
  for(const c of cars)dr.push([c.y,drawCar,c]);
  for(const c of traffic)dr.push([c.y,drawCar,c]);
  for(const c of copcars)dr.push([c.y,drawCopCar,c]);
  for(const c of civs)dr.push([c.y,drawCiv,c]);
  for(const c of cops)dr.push([c.y,drawCop,c]);
  for(const g of guards)dr.push([g.y,drawTung,g]);
  for(const s of sharks)dr.push([s.y,drawShark,s]);
  for(const mv of mevs)dr.push([mv.y,drawMev,mv]);
  if(jeet)dr.push([jeet.y,drawJeet,jeet]);
  dr.push([tolyPos.y,function(){drawToly(tolyPos.x,tolyPos.y);},null]);
  if(!player.car)dr.push([player.y,drawPlayer,player]);
  dr.sort(function(a,b){return a[0]-b[0];});
  for(const d of dr)d[1](d[2]);
  /* bullets */
  for(const b of bullets){
    ctx.strokeStyle=b.friendly?'#ffd23e':'#ff5a5a';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(b.x,b.y);
    ctx.lineTo(b.x-b.vx*0.03,b.y-b.vy*0.03);
    ctx.stroke();
  }
  /* bombs */
  for(const b of bombs){
    ctx.strokeStyle='#e03c3c';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(b.x,b.y,20+b.t*70,0,Math.PI*2);ctx.stroke();
    const fh=(1-b.t)*130;
    ctx.fillStyle='#26262c';
    ctx.beginPath();ctx.ellipse(b.x,b.y-fh,8,11,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=Math.floor(b.t*10)%2===0?'#ffd23e':'#e03c3c';
    ctx.fillRect(b.x-2,b.y-fh-16,4,6);
  }
  for(const b of bombers)drawBomber(b);
  /* particles */
  for(const p of parts){
    ctx.fillStyle=p.color;
    const s=p.size*(1-p.t/p.life);
    ctx.fillRect(p.x-s/2,p.y-s/2,s,s);
  }
  /* rob progress */
  if(robT>0){
    ctx.fillStyle='#101014';
    ctx.fillRect(player.x-32,player.y-72,64,12);
    ctx.fillStyle='#14f195';
    ctx.fillRect(player.x-29,player.y-69,58*Math.min(1,robT/3),6);
  }
  /* popups */
  for(const p of pops)outText(p.txt,p.x,p.y,p.size,p.color);
  ctx.restore();
}

/* ---------------- HUD ---------------- */
function panel(x,y,w,h){
  ctx.fillStyle='#101014';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#3a3a44';ctx.lineWidth=3;
  ctx.strokeRect(x,y,w,h);
}
function drawHUD(){
  panel(14,14,200,hasGun?118:96);
  ctx.font='bold 26px Arial';ctx.textAlign='left';
  ctx.fillStyle='#14f195';
  ctx.fillText('◎ '+player.sol,28,46);
  ctx.fillStyle='#3a1010';ctx.fillRect(28,58,172,12);
  ctx.fillStyle='#e03c3c';ctx.fillRect(28,58,172*Math.max(0,player.hp)/100,12);
  for(let i=0;i<5;i++)star(38+i*24,90,9,i<wanted?'#ffd23e':'#3a3a44');
  if(hasGun){
    ctx.font='bold 13px Arial';ctx.textAlign='left';
    ctx.fillStyle=ammo>0?'#ffd23e':'#e03c3c';
    ctx.fillText(WEAPONS[curW].name+'  '+ammo,28,112);
  }
  /* minimap */
  const mw=MW*3,mh=MH*3,mx=W-mw-18,my=14;
  panel(mx-4,my-4,mw+8,mh+8);
  if(wanted>0&&time%0.5<0.25){
    ctx.strokeStyle='#e03c3c';ctx.lineWidth=3;
    ctx.strokeRect(mx-4,my-4,mw+8,mh+8);
  }
  if(mmc)ctx.drawImage(mmc,mx,my);
  ctx.fillStyle='#14f195';
  ctx.fillRect(mx+(vaultX/TILE)*3-3,my+(vaultY/TILE)*3-3,6,6);
  const m=missionIdx<missions.length?missions[missionIdx]:null;
  let mk=null;
  if(m){
    if(!missionActive)mk=m.marker();
    else if(m.target)mk=m.target();
  }
  if(mk&&time%0.6<0.35){
    ctx.fillStyle='#ffd23e';
    ctx.fillRect(mx+(mk.x/TILE)*3-3,my+(mk.y/TILE)*3-3,7,7);
  }
  if(wanted>0){
    ctx.fillStyle='#e03c3c';
    for(const c of cops)ctx.fillRect(mx+(c.x/TILE)*3-2,my+(c.y/TILE)*3-2,4,4);
    for(const c of copcars)ctx.fillRect(mx+(c.x/TILE)*3-3,my+(c.y/TILE)*3-3,6,6);
    for(const s of sharks)ctx.fillRect(mx+(s.x/TILE)*3-3,my+(s.y/TILE)*3-3,6,6);
  }
  ctx.fillStyle='#f4f4f8';
  ctx.fillRect(mx+(player.x/TILE)*3-2,my+(player.y/TILE)*3-2,5,5);
  /* objective */
  let objTxt;
  if(missionActive&&missionIdx<missions.length)objTxt=missions[missionIdx].obj();
  else if(missionIdx<missions.length)objTxt='NEXT JOB: '+missions[missionIdx].name+'  (YELLOW MARKER)';
  else objTxt='FREE ROAM. THE CITY IS YOURS. THE BANK STILL HAS MONEY.';
  panel(W/2-280,14,560,36);
  outText(objTxt,W/2,39,15,'#ffd23e');
  /* outage banner */
  if(outage>0){
    panel(W/2-260,58,520,40);
    outText('SOLANA MAINNET OUTAGE  '+Math.ceil(outage)+'S   TPS: 0',W/2,85,16,'#8247e5');
  }
  /* messages */
  for(let i=0;i<msgs.length;i++)outText(msgs[i].txt,W/2,(outage>0?126:76)+i*28,16,'#f4f4f8');
  /* contextual prompt */
  let prompt='';
  if(player.car)prompt='PRESS E TO GET OUT';
  else if(dist(player.x,player.y,vaultX,vaultY)<80)
    prompt=bankCd<=0?'HOLD E TO ROB THE SOLANA BANK':'THE BANK IS LOCKED DOWN';
  else{
    const mm=missionIdx<missions.length?missions[missionIdx]:null;
    if(mm&&!missionActive&&mm.manual){
      const mkk=mm.marker();
      if(mkk&&dist(player.x,player.y,mkk.x,mkk.y)<50)prompt='PRESS E TO START: '+mm.name;
    }
    if(!prompt)for(const s of specials){
      if(dist(player.x,player.y,s.doorX,s.doorY)<56){
        if(s.name==='PUMP.FUN')prompt='PRESS E TO APE 10 ◎ AT PUMP.FUN';
        else if(s.name==='GUN.FUN')prompt='E AMMO 5◎    1 BONK-9 40◎    2 JEET SWEEPER 60◎';
        else prompt='PRESS E FOR FULL HEALTH  (10 ◎)';
        break;
      }
    }
    if(!prompt)for(const c of cars)if(dist(player.x,player.y,c.x,c.y)<64){prompt='PRESS E TO JACK THE CAR';break;}
    if(!prompt)for(const c of traffic)if(dist(player.x,player.y,c.x,c.y)<64){prompt='PRESS E TO CARJACK';break;}
  }
  if(prompt){
    panel(W/2-230,H-64,460,40);
    outText(prompt,W/2,H-37,17,'#f4f4f8');
  }
}
