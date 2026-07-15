'use strict';
/* ---------------- drawing helpers ---------------- */
function rrect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function body(x,y,w,h,r,fill){
  ctx.fillStyle=fill;
  rrect(x,y,w,h,r);ctx.fill();
  ctx.lineWidth=2.5;ctx.strokeStyle='#101014';ctx.stroke();
}
function fillR(x,y,w,h,r,fill){ctx.fillStyle=fill;rrect(x,y,w,h,r);ctx.fill();}
function shadow(x,y,w){
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath();ctx.ellipse(x,y,w,w*0.4,0,0,Math.PI*2);ctx.fill();
}
function star(cx,cy,r,color){
  ctx.fillStyle=color;
  ctx.beginPath();
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5,rr=i%2===0?r:r*0.45;
    if(i===0)ctx.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);
    else ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);
  }
  ctx.closePath();ctx.fill();
}
function outText(txt,x,y,size,color,align){
  ctx.font='bold '+size+'px Arial';
  ctx.textAlign=align||'center';
  ctx.lineWidth=Math.max(3,size*0.22);
  ctx.strokeStyle='#101014';
  ctx.strokeText(txt,x,y);
  ctx.fillStyle=color;
  ctx.fillText(txt,x,y);
}

/* ---------------- characters ---------------- */
function legs(e,color,spread,len){
  const ls=e.moving?Math.sin(e.phase)*5:0;
  fillR(-spread-4,-len-2+ls*0.7,8,len,3,color);
  fillR(spread-4,-len-2-ls*0.7,8,len,3,color);
}
function drawPlayer(e){
  const b=e.moving?Math.sin(e.phase*2)*1.5:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,14);
  if(e===player&&shieldHp>0){
    ctx.strokeStyle='#8247e5';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,-24,26+Math.sin(time*6)*2,0,Math.PI*2);ctx.stroke();
  }
  if(e===player&&boostT>0){
    ctx.strokeStyle='#14f195';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,0,20,9,0,0,Math.PI*2);ctx.stroke();
  }
  const gunMode=hasGun&&!e.car;
  const flip=gunMode?(Math.cos(e.aim)<0):(e.dir==='l');
  if(flip)ctx.scale(-1,1);
  legs(e,'#23233a',6,14);
  body(-11,-34+b,22,22,5,e.flash>0?'#ff6b6b':'#8247e5');
  ctx.fillStyle='#5c2fae';ctx.fillRect(-11,-16+b,22,4);
  fillR(-15,-31+b,5,14,2,'#8247e5');
  if(e.attackT>0){
    const prog=1-e.attackT/0.3;
    ctx.save();ctx.translate(11,-27+b);ctx.rotate(-1.9+prog*3.1);
    fillR(0,-3,13,6,2,'#8247e5');
    fillR(11,-3.5,22,7,3,'#8a5a2b');
    fillR(26,-3.5,7,7,3,'#a8763f');
    ctx.restore();
  }else if(gunMode){
    let a=e.aim;
    if(flip)a=Math.PI-a;
    ctx.save();ctx.translate(6,-26+b);ctx.rotate(a);
    fillR(0,-3,15,6,2,'#8247e5');
    fillR(13,-4,11,7,2,'#3a3a44');
    fillR(21,-1,5,5,1,'#3a3a44');
    ctx.restore();
  }else{
    fillR(10,-31+b,5,14,2,'#8247e5');
    ctx.save();ctx.translate(13,-18+b);ctx.rotate(0.5);
    fillR(-2,0,6,20,3,'#8a5a2b');
    ctx.restore();
  }
  body(-10,-52+b,20,20,9,'#8247e5');
  ctx.fillStyle='#5c2fae';ctx.fillRect(-10,-36+b,20,4);
  if(e.dir!=='u'||gunMode){
    fillR(-7,-48+b,14,12,5,'#2c2c34');
    ctx.fillStyle='#d9a06b';
    ctx.fillRect(-5,-45+b,10,4);
    ctx.fillStyle='#101014';
    ctx.fillRect(-4,-44+b,3,3);ctx.fillRect(1,-44+b,3,3);
  }
  ctx.restore();
}
function drawCop(e){
  const b=e.moving?Math.sin(e.phase*2)*1.5:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,14);
  if(e.face<0)ctx.scale(-1,1);
  legs(e,'#1c1c26',6,14);
  body(-11,-34+b,22,22,5,e.flash>0?'#ff6b6b':'#2b4d9e');
  ctx.fillStyle='#ffd23e';ctx.fillRect(-4,-30+b,5,6);
  fillR(-15,-31+b,5,13,2,'#2b4d9e');fillR(10,-31+b,5,13,2,'#2b4d9e');
  fillR(13,-20+b,4,14,2,'#888890');
  body(-8,-50+b,16,16,8,'#d9a06b');
  fillR(-9,-52+b,18,6,2,'#1d3a7a');
  ctx.fillStyle='#1d3a7a';ctx.fillRect(-11,-47+b,22,3);
  ctx.fillStyle='#101014';
  ctx.fillRect(-4,-42+b,3,3);ctx.fillRect(2,-42+b,3,3);
  ctx.restore();
}
function drawTung(e){
  const b=e.moving?Math.sin(e.phase*2)*1.5:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,16);
  if(e.face<0)ctx.scale(-1,1);
  const ls=e.moving?Math.sin(e.phase)*5:0;
  fillR(-9,-12+ls*0.6,7,12,3,'#5e3d1e');fillR(2,-12-ls*0.6,7,12,3,'#5e3d1e');
  body(-14,-56+b,28,48,11,e.flash>0?'#ff6b6b':'#a4713d');
  ctx.fillStyle='#7c5227';
  ctx.fillRect(-14,-42+b,28,5);ctx.fillRect(-14,-24+b,28,5);
  ctx.fillStyle='#8a5f30';
  ctx.beginPath();ctx.ellipse(0,-54+b,13,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f4f4f8';
  ctx.beginPath();ctx.arc(-5,-46+b,4.5,0,Math.PI*2);ctx.arc(6,-46+b,4.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#101014';
  ctx.beginPath();ctx.arc(-5,-46+b,2,0,Math.PI*2);ctx.arc(6,-46+b,2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#101014';ctx.fillRect(-3,-36+b,7,3);
  let batA=0.5;
  if(e.wind>0)batA=-2.1;
  else if(e.attackT>0)batA=-2.1+(1-e.attackT/0.22)*3.2;
  ctx.save();ctx.translate(14,-34+b);ctx.rotate(batA);
  fillR(0,-3,10,6,2,'#a4713d');
  fillR(8,-4,26,8,4,'#c9a26a');
  fillR(28,-4.5,8,9,4,'#b08648');
  ctx.restore();
  ctx.restore();
}
function drawShark(e){
  const b=e.moving?Math.sin(e.phase*2)*2:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,20);
  if(e.face<0)ctx.scale(-1,1);
  const p=e.phase;
  for(let i=0;i<3;i++){
    const lx=-16+i*14,ls=Math.sin(p+i*2.1)*5;
    fillR(lx-3,-14+ls*0.5,6,12,2,'#365ec0');
    fillR(lx-7,-6+ls*0.5,15,7,3,'#f4f4f8');
    ctx.fillStyle='#e03c3c';ctx.fillRect(lx-7,-3+ls*0.5,15,2);
  }
  body(-32,-34+b,58,22,11,e.flash>0?'#ff6b6b':'#3f6fd8');
  ctx.fillStyle=e.flash>0?'#ff6b6b':'#3f6fd8';
  ctx.beginPath();
  ctx.moveTo(-30,-24+b);ctx.lineTo(-46,-36+b);ctx.lineTo(-42,-20+b);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6,-33+b);ctx.lineTo(2,-48+b);ctx.lineTo(10,-33+b);ctx.closePath();ctx.fill();
  fillR(-24,-19+b,44,7,4,'#dfe8f8');
  const open=e.lungeT>0?7:2;
  ctx.fillStyle='#7a1f2b';
  ctx.beginPath();ctx.moveTo(26,-22+b);ctx.lineTo(14,-22-open+b);ctx.lineTo(14,-22+open+b);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f4f4f8';
  ctx.fillRect(14,-24-open*0.4+b,8,2);ctx.fillRect(14,-20+open*0.4+b,8,2);
  ctx.fillStyle='#101014';
  ctx.beginPath();ctx.arc(12,-28+b,2.4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawBomber(e){
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,96,26);
  const fl=Math.sin(time*7)*3;
  if(e.vx<0)ctx.scale(-1,1);
  ctx.fillStyle='#8f8f9c';
  ctx.beginPath();
  ctx.moveTo(-6,-4+fl);ctx.lineTo(-30,20+fl);ctx.lineTo(2,8+fl);ctx.closePath();ctx.fill();
  body(-40,-12+fl,74,22,10,'#5d9c46');
  ctx.fillStyle='#487a36';fillR(-40,0+fl,74,6,3,'#487a36');
  body(28,-8+fl,22,12,5,'#5d9c46');
  ctx.fillStyle='#f4f4f8';ctx.fillRect(30,-2+fl,16,3);
  ctx.fillStyle='#9a9aa6';
  ctx.beginPath();
  ctx.moveTo(-2,-10+fl);ctx.lineTo(-34,-30+fl);ctx.lineTo(-14,-8+fl);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-38,-10+fl);ctx.lineTo(-48,-26+fl);ctx.lineTo(-40,-6+fl);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f4f4f8';
  ctx.beginPath();ctx.arc(22,-8+fl,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#101014';
  ctx.beginPath();ctx.arc(23,-8+fl,2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawCiv(e){
  const b=e.moving?Math.sin(e.phase*2)*1.5:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,12);
  if(e.face<0)ctx.scale(-1,1);
  const ls=e.moving?Math.sin(e.phase)*4:0;
  if(e.type==='popcat'){
    fillR(-7,-10+ls*0.5,5,9,2,'#6f6f7a');fillR(3,-10-ls*0.5,5,9,2,'#6f6f7a');
    body(-10,-22+b,20,15,6,e.flash>0?'#ff6b6b':'#8d8d99');
    ctx.fillStyle=e.flash>0?'#ff6b6b':'#8d8d99';
    ctx.beginPath();ctx.arc(0,-30+b,13,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=2.5;ctx.strokeStyle='#101014';ctx.stroke();
    ctx.fillStyle=e.flash>0?'#ff6b6b':'#8d8d99';
    ctx.beginPath();
    ctx.moveTo(-11,-38+b);ctx.lineTo(-7,-46+b);ctx.lineTo(-3,-38+b);ctx.closePath();
    ctx.moveTo(3,-38+b);ctx.lineTo(7,-46+b);ctx.lineTo(11,-38+b);ctx.closePath();ctx.fill();
    ctx.fillStyle='#101014';
    ctx.fillRect(-7,-33+b,3,3);ctx.fillRect(4,-33+b,3,3);
    if(e.fleeT>0){
      ctx.fillStyle='#101014';
      ctx.beginPath();ctx.ellipse(0,-24+b,6,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e88a8a';
      ctx.beginPath();ctx.ellipse(0,-22+b,4,4,0,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle='#101014';ctx.fillRect(-3,-25+b,7,2);
    }
  }else if(e.type==='chill'){
    fillR(-8,-10+ls*0.4,5,9,2,'#8c7a5e');fillR(3,-10-ls*0.4,5,9,2,'#8c7a5e');
    body(-11,-26+b,22,20,6,e.flash>0?'#ff6b6b':'#6f6f78');
    ctx.fillStyle='#5c5c64';ctx.fillRect(-11,-14+b,22,4);
    body(-8,-42+b,20,17,7,'#c9a878');
    ctx.fillStyle='#c9a878';
    ctx.beginPath();
    ctx.moveTo(-8,-40+b);ctx.lineTo(-13,-33+b);ctx.lineTo(-7,-32+b);ctx.closePath();ctx.fill();
    fillR(8,-36+b,8,6,2,'#b5946a');
    ctx.fillStyle='#101014';
    ctx.fillRect(1,-37+b,2.5,2.5);ctx.fillRect(7,-37+b,2.5,2.5);
    ctx.fillStyle='#101014';ctx.fillRect(3,-30+b,7,1.6);
  }else{
    const bd=e.type==='bonk'?'#e8963c':'#e6d3b3';
    const dark=e.type==='bonk'?'#c47a2b':'#c9b493';
    fillR(-12,-9+ls*0.5,5,8,2,dark);fillR(-2,-9-ls*0.5,5,8,2,dark);fillR(8,-9+ls*0.5,5,8,2,dark);
    body(-16,-22+b,32,15,7,e.flash>0?'#ff6b6b':bd);
    ctx.fillStyle=e.flash>0?'#ff6b6b':bd;
    ctx.beginPath();ctx.arc(13,-28+b,10,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=2.5;ctx.strokeStyle='#101014';ctx.stroke();
    ctx.fillStyle=dark;
    ctx.beginPath();ctx.arc(-16,-24+b,5,0,Math.PI*2);ctx.fill();
    fillR(17,-27+b,9,7,3,'#f4e9d8');
    ctx.fillStyle='#101014';
    ctx.fillRect(24,-25+b,2.5,2.5);
    ctx.fillRect(11,-31+b,3,3);
    if(e.type==='wif'){
      body(5,-42+b,17,9,4,'#e05fa0');
      ctx.fillStyle='#c2427f';ctx.fillRect(5,-35+b,17,3);
    }else{
      ctx.fillStyle=dark;
      ctx.beginPath();
      ctx.moveTo(6,-35+b);ctx.lineTo(9,-43+b);ctx.lineTo(13,-35+b);ctx.closePath();
      ctx.moveTo(14,-35+b);ctx.lineTo(18,-43+b);ctx.lineTo(21,-35+b);ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();
}
function drawToly(x,y){
  ctx.save();ctx.translate(x,y);
  shadow(0,0,13);
  const b=Math.sin(time*2)*1;
  fillR(-9,-14,7,13,3,'#2b3a55');fillR(2,-14,7,13,3,'#2b3a55');
  body(-11,-34+b,22,21,5,'#2c2c34');
  ctx.fillStyle='#14f195';
  ctx.font='bold 9px Arial';ctx.textAlign='center';
  ctx.fillText('gm',0,-20+b);
  fillR(-15,-31+b,5,13,2,'#2c2c34');
  ctx.save();ctx.translate(13,-26+b);ctx.rotate(-0.5+Math.sin(time*3)*0.15);
  fillR(0,-3,12,6,2,'#2c2c34');
  fillR(10,-6,7,10,2,'#3a3a44');
  ctx.restore();
  body(-8,-50+b,16,16,8,'#d9a06b');
  fillR(-9,-52+b,18,6,2,'#0e7c5e');
  ctx.fillStyle='#101014';
  ctx.fillRect(-4,-42+b,3,3);ctx.fillRect(2,-42+b,3,3);
  ctx.restore();
}
function drawJeet(e){
  const b=Math.sin(e.phase*2)*2;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,13);
  if(e.face<0)ctx.scale(-1,1);
  const ls=Math.sin(e.phase)*7;
  fillR(-9,-15+ls*0.8,7,14,3,'#23233a');fillR(2,-15-ls*0.8,7,14,3,'#23233a');
  body(-10,-34+b,20,21,5,e.flash>0?'#ff6b6b':'#c0392b');
  fillR(-2,-30+b,14,10,2,'#9aa0ac');
  ctx.fillStyle='#3a3a44';ctx.fillRect(0,-28+b,10,6);
  body(-8,-49+b,16,15,7,'#c98d5a');
  ctx.fillStyle='#c0392b';ctx.fillRect(-9,-51+b,18,5);
  ctx.fillStyle='#f4f4f8';
  ctx.fillRect(-5,-43+b,4,4);ctx.fillRect(2,-43+b,4,4);
  ctx.fillStyle='#101014';
  ctx.fillRect(-4,-42+b,2,2);ctx.fillRect(3,-42+b,2,2);
  ctx.restore();
}
function drawMev(e){
  const b=e.moving?Math.sin(e.phase*2)*1.5:0;
  ctx.save();ctx.translate(e.x,e.y);
  shadow(0,0,16);
  if(e.face<0)ctx.scale(-1,1);
  const ls=e.moving?Math.sin(e.phase)*4:0;
  fillR(-11,-12+ls*0.5,8,11,2,'#4a4e58');fillR(3,-12-ls*0.5,8,11,2,'#4a4e58');
  body(-15,-40+b,30,28,4,e.flash>0?'#ff6b6b':'#7d828c');
  ctx.fillStyle='#f4f4f8';
  ctx.font='bold 10px Arial';ctx.textAlign='center';
  ctx.fillText('MEV',0,-21+b);
  fillR(-19,-36+b,5,16,2,'#5a5e68');fillR(14,-36+b,5,16,2,'#5a5e68');
  body(-10,-54+b,20,15,3,'#5a5e68');
  ctx.fillStyle='#e03c3c';
  const scan=-8+((time*40)%16);
  ctx.fillRect(-8,-50+b,16,4);
  ctx.fillStyle='#ffd23e';ctx.fillRect(scan,-50+b,3,4);
  ctx.strokeStyle='#9aa0ac';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-54+b);ctx.lineTo(0,-62+b);ctx.stroke();
  ctx.fillStyle='#e03c3c';
  ctx.beginPath();ctx.arc(0,-63+b,2.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawCar(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.ang);
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath();ctx.ellipse(0,4,36,20,0,0,Math.PI*2);ctx.fill();
  const van=c.type==='van',sport=c.type==='sport';
  const L=van?38:34,Ht=van?18:16;
  ctx.fillStyle='#1c1c22';
  ctx.fillRect(-L+8,-Ht-4,12,7);ctx.fillRect(L-20,-Ht-4,12,7);
  ctx.fillRect(-L+8,Ht-3,12,7);ctx.fillRect(L-20,Ht-3,12,7);
  body(-L,-Ht,L*2,Ht*2,sport?9:7,c.type==='taxi'?'#e8c33b':c.color);
  fillR(4,-Ht+4,van?10:14,Ht*2-8,3,'#1d2530');
  fillR(-16,-Ht+4,12,Ht*2-8,3,'#1d2530');
  if(c.type==='taxi'){
    fillR(-6,-6,12,12,2,'#101014');
    ctx.fillStyle='#e8c33b';
    ctx.font='bold 8px Arial';ctx.textAlign='center';
    ctx.save();ctx.rotate(Math.PI/2);ctx.fillText('TAXI',0,3);ctx.restore();
  }
  if(sport){fillR(-L-2,-12,6,24,2,'#1c1c22');}
  ctx.fillStyle='#ffd23e';
  ctx.fillRect(L-4,-Ht+3,4,7);ctx.fillRect(L-4,Ht-10,4,7);
  ctx.fillStyle='#e03c3c';
  ctx.fillRect(-L,-Ht+3,3,7);ctx.fillRect(-L,Ht-10,3,7);
  ctx.restore();
}
function drawCopCar(c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.ang);
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath();ctx.ellipse(0,4,36,20,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1c1c22';
  ctx.fillRect(-26,-20,12,7);ctx.fillRect(14,-20,12,7);
  ctx.fillRect(-26,13,12,7);ctx.fillRect(14,13,12,7);
  body(-34,-16,68,32,7,c.flash>0?'#ff6b6b':'#e8e8ee');
  fillR(-14,-16,26,32,2,'#1c1c22');
  fillR(4,-12,14,24,3,'#1d2530');
  fillR(-16,-12,12,24,3,'#1d2530');
  const blink=Math.floor(time*6)%2===0;
  fillR(-4,-9,6,7,1,blink?'#e03c3c':'#5a1420');
  fillR(-4,2,6,7,1,blink?'#1a2c66':'#3b7bc2');
  ctx.fillStyle='#f4f4f8';
  ctx.font='bold 8px Arial';ctx.textAlign='center';
  ctx.save();ctx.rotate(Math.PI/2);ctx.fillText('SOL PD',0,-22);ctx.restore();
  ctx.fillStyle='#ffd23e';
  ctx.fillRect(30,-13,4,7);ctx.fillRect(30,6,4,7);
  ctx.restore();
}
function drawCoin(c){
  ctx.save();ctx.translate(c.x,c.y);
  const sx=Math.abs(Math.cos(c.t*5))*0.7+0.3;
  ctx.scale(sx,1);
  const r=c.fart?11:(c.val>1?11:9);
  const main=c.fart?'#a4713d':(c.val>1?'#ffd23e':'#14f195');
  const dark=c.fart?'#7c5227':(c.val>1?'#d9a900':'#0ea86a');
  const lite=c.fart?'#d9b98a':(c.val>1?'#fff3c4':'#d9fff0');
  ctx.fillStyle=main;
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.lineWidth=2;ctx.strokeStyle='#101014';ctx.stroke();
  ctx.fillStyle=dark;
  ctx.beginPath();ctx.arc(0,0,r-3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=lite;
  ctx.fillRect(-3,-4,7,2);ctx.fillRect(-4,-1,7,2);ctx.fillRect(-3,2,7,2);
  ctx.restore();
}
