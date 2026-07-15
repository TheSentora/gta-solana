'use strict';
/* ---------------- missions ---------------- */
const missions=[
  { name:'THE SOLANA BANK JOB',
    marker:function(){return{x:vaultX,y:vaultY};},
    manual:false,
    start:function(){mst={};},
    obj:function(){
      if(!heisted)return 'BANK JOB: HOLD E AT THE VAULT';
      return 'BANK JOB: LOSE THE HEAT';
    },
    update:function(){ if(mst.robbed&&wanted===0)completeMission(50,'CLEAN GETAWAY. THE BANK JOB IS DONE.'); }
  },
  { name:'PUMP AND DUMP',
    marker:function(){return specials.length?{x:specials[0].doorX,y:specials[0].doorY}:tolyPos;},
    manual:true,
    start:function(){
      if(player.sol<20){msg('YOU NEED 20 ◎ TO APE. COME BACK.');return false;}
      player.sol-=20;
      mst={phase:0,t:3};
      msg('YOU APED 20 ◎ INTO $RETARDIO');
      sndJingle();
    },
    obj:function(){
      if(mst.phase===0)return 'PUMP AND DUMP: $RETARDIO IS PUMPING';
      return 'PUMP AND DUMP: BONK THE DEV, GET THE BAG  '+Math.ceil(mst.t)+'S';
    },
    target:function(){return jeet?{x:jeet.x,y:jeet.y}:null;},
    update:function(dt){
      mst.t-=dt;
      if(mst.phase===0){
        if(mst.t<=0){
          mst.phase=1;mst.t=45;
          const s=specials[0];
          spawnJeet(s?s.doorX:player.x+100,s?s.doorY+20:player.y);
          msg('DEV SOLD. RUGGED. HE IS RUNNING WITH YOUR BAG.');
          sndRug();
        }else if(Math.random()<dt*2){
          popAt(player.x+(Math.random()*160-80),player.y-70-Math.random()*40,'+'+(50+Math.floor(Math.random()*500))+'%','#14f195',13);
        }
      }else{
        if(!jeet){completeMission(10,'BAG SECURED. NEVER TRUST A DEV.');return;}
        if(mst.t<=0){jeet=null;failMission('HE JEETED INTO THE SUNSET. TRY AGAIN.');}
      }
    }
  },
  { name:'BONKS DELIVERY',
    marker:function(){return bonkPos;},
    manual:true,
    start:function(){
      mst={t:50,tx:41.5*TILE,ty:4.5*TILE};
      msg('BONK: DELIVER THIS BAG. DONT ASK WHATS INSIDE.');
      msg('JACK A CAR. YELLOW MARKER. 50 SECONDS.');
    },
    obj:function(){return 'DELIVERY: REACH THE MARKER  '+Math.ceil(mst.t)+'S';},
    target:function(){return{x:mst.tx,y:mst.ty};},
    update:function(dt){
      mst.t-=dt;
      if(mst.t<=0){failMission('BONK: TOO SLOW. NGMI. COME BACK.');return;}
      if(dist(player.x,player.y,mst.tx,mst.ty)<70){
        ammo+=60;
        completeMission(30,'PACKAGE DROPPED. BONK THREW IN 60 ROUNDS.');
      }
    }
  },
  { name:'AIRDROP SEASON',
    marker:function(){return tolyPos;},
    manual:true,
    start:function(){
      mst={count:0,t:60};
      msg('TOLY: AIRDROP SEASON. GRAB 20 ◎ IN 60 SECONDS.');
      msg('COINS ARE EVERYWHERE. MOVE.');
    },
    obj:function(){return 'AIRDROP: COLLECT ◎  '+mst.count+' / 20   '+Math.ceil(mst.t)+'S';},
    update:function(dt){
      mst.t-=dt;
      if(mst.count>=20){completeMission(25,'TOLY: CLAIMED. WAGMI.');return;}
      if(mst.t<=0)failMission('TOLY: AIRDROP EXPIRED. NGMI.');
    }
  },
  { name:'MEV SANDWICH',
    marker:function(){return{x:(bank.x0+3)*TILE,y:(bank.y0-0.5)*TILE};},
    manual:true,
    start:function(){
      mst={};
      spawnMev(-1);spawnMev(1);
      msg('TWO MEV BOTS ARE SANDWICHING YOU');
      msg('DESTROY BOTH. DODGE THE DASHES.');
    },
    obj:function(){return 'MEV SANDWICH: DESTROY THE BOTS  '+mevs.length+' LEFT';},
    update:function(){ if(mevs.length===0)completeMission(60,'SANDWICH REVERSED. THE MEMPOOL FEARS YOU.'); }
  },
  { name:'DEGEN RALLY',
    marker:function(){return specials.length>1?{x:specials[1].doorX,y:specials[1].doorY}:bonkPos;},
    manual:true,
    start:function(){
      mst={idx:0,t:75,cps:[]};
      let last={x:player.x,y:player.y},guard=0;
      while(mst.cps.length<5&&guard++<400){
        const p=findWalkable();
        if(tileAt(Math.floor(p.x/TILE),Math.floor(p.y/TILE))!==T_ROAD)continue;
        if(dist(p.x,p.y,last.x,last.y)<450)continue;
        mst.cps.push(p);last=p;
      }
      while(mst.cps.length<5)mst.cps.push(findWalkable());
      msg('GUN.FUN GUY: FIVE CHECKPOINTS. 75 SECONDS.');
      msg('STEAL SOMETHING FAST.');
    },
    obj:function(){return 'RALLY: CHECKPOINT '+(mst.idx+1)+' / 5   '+Math.ceil(mst.t)+'S';},
    target:function(){return mst.cps[mst.idx];},
    update:function(dt){
      mst.t-=dt;
      if(mst.t<=0){failMission('RALLY OVER. TOO SLOW. NGMI.');return;}
      const cp=mst.cps[mst.idx];
      if(dist(player.x,player.y,cp.x,cp.y)<70){
        mst.idx++;sndCoin();
        popAt(player.x,player.y-60,'CHECKPOINT '+mst.idx+'/5','#ffd23e',16);
        if(mst.idx>=5)completeMission(60,'RALLY CHAMP. DEGEN CERTIFIED.');
      }
    }
  },
  { name:'BECOME A VALIDATOR',
    marker:function(){return tolyPos;},
    manual:true,
    start:function(){
      mst={t:60};
      wanted=5;heatT=0;
      msg('TOLY: SURVIVE 60 SECONDS AT MAX HEAT.');
      msg('DO THAT AND THE CITY VALIDATES YOU.');
      sndAlarm();
    },
    obj:function(){return 'VALIDATOR: SURVIVE  '+Math.ceil(mst.t)+'S';},
    update:function(dt){
      wanted=5;heatT=0;
      mst.t-=dt;
      if(mst.t<=0){
        wanted=0;heatT=99;
        for(const g of guards)g.aggro=false;
        missionActive=false;missionIdx++;save();
        state='win';sndJingle();
      }
    }
  }
];
function startMission(i){
  if(i!==missionIdx||missionActive||i>=missions.length)return;
  if(missions[i].start()===false)return;
  missionActive=true;
}
function completeMission(reward,text){
  player.sol+=reward;
  popAt(player.x,player.y-70,'MISSION PASSED  +'+reward+' ◎','#14f195',20);
  msg(text);
  missionActive=false;missionIdx++;
  sndJingle();save();
}
function failMission(text){
  msg(text);
  popAt(player.x,player.y-70,'MISSION FAILED','#e03c3c',20);
  missionActive=false;
  sndRug();
}
function triggerOutage(){
  outage=6;
  outageT=75+Math.random()*60;
  msg('SOLANA MAINNET OUTAGE. EVERY NPC HALTED.');
  sndOutage();
}
