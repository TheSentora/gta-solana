'use strict';
/* ---------------- audio ---------------- */
let AC=null,muted=false;
function initAudio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}}
function beep(f,d,type,vol,slide,delay){
  if(!AC||muted)return;
  try{
    const t0=AC.currentTime+(delay||0);
    const o=AC.createOscillator(),g=AC.createGain();
    o.type=type||'square';
    o.frequency.setValueAtTime(f,t0);
    if(slide)o.frequency.linearRampToValueAtTime(slide,t0+d);
    g.gain.setValueAtTime(vol||0.05,t0);
    g.gain.linearRampToValueAtTime(0.0001,t0+d);
    o.connect(g);g.connect(AC.destination);
    o.start(t0);o.stop(t0+d);
  }catch(e){}
}
function noiseS(d,vol){
  if(!AC||muted)return;
  try{
    const n=Math.floor(AC.sampleRate*d),buf=AC.createBuffer(1,n,AC.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);
    const s=AC.createBufferSource(),g=AC.createGain();
    g.gain.value=vol||0.1;
    s.buffer=buf;s.connect(g);g.connect(AC.destination);s.start();
  }catch(e){}
}
function sndCoin(){beep(950,0.09,'square',0.05,1500);}
function sndSwing(){beep(320,0.08,'triangle',0.04,120);}
function sndHit(){noiseS(0.08,0.12);}
function sndTung(){beep(150,0.09,'square',0.09);beep(150,0.09,'square',0.09,null,0.13);beep(150,0.12,'square',0.09,null,0.26);}
function sndAlarm(){for(let i=0;i<4;i++)beep(1100,0.22,'square',0.05,700,i*0.28);}
function sndBoom(){noiseS(0.4,0.22);beep(70,0.4,'sawtooth',0.12,40);}
function sndDie(){beep(300,0.7,'sawtooth',0.08,60);}
function sndGun(){noiseS(0.05,0.14);beep(210,0.06,'square',0.05,70);}
function sndFart(){beep(95,0.32,'sawtooth',0.09,45);beep(72,0.26,'sawtooth',0.07,38,null,0.09);}
function sndJingle(){beep(520,0.12,'square',0.05);beep(660,0.12,'square',0.05,null,0.13);beep(880,0.2,'square',0.06,null,0.26);}
function sndRug(){beep(660,0.14,'square',0.05);beep(440,0.14,'square',0.05,null,0.15);beep(220,0.3,'square',0.06,null,0.3);}
function sndOutage(){beep(600,0.2,'triangle',0.06,300);beep(300,0.3,'triangle',0.06,120,0.22);}
function sndHeal(){beep(440,0.1,'triangle',0.05);beep(660,0.14,'triangle',0.05,null,0.11);}
