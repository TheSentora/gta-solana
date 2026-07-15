# GRAND THEFT SOLANA

A top-down GTA style crime game set in a Solana-themed city. Pure JavaScript on HTML5 canvas, zero dependencies, zero build steps.

## Play

Clone the repo and open `index.html` in any browser. That's the whole install.

## What you do

Rob the Solana Bank, lose the heat, ape into $RETARDIO at the PUMP.FUN casino and chase down the dev when it rugs, outrun SOL PD cruisers, destroy MEV sandwich bots, and survive max wanted level to earn validator status.

Seven missions:

1. **THE SOLANA BANK JOB** — crack the vault, escape the heat
2. **PUMP AND DUMP** — get rugged, catch the jeet, take the bag back
3. **BONK'S DELIVERY** — timed cross-city package run
4. **AIRDROP SEASON** — 20 coins in 60 seconds
5. **MEV SANDWICH** — destroy both bots before they sandwich you
6. **DEGEN RALLY** — five checkpoints, 75 seconds, steal something fast
7. **BECOME A VALIDATOR** — survive 60 seconds at five stars

## The city

- Living traffic you can carjack mid-drive
- Tung Tung Tung Sahur guards the bank with a bat
- Tralalero Tralala hunts you at three stars
- Bombardiro Crocodilo carpet bombs you at five
- BONK, Popcat, dogwifhat and Chill Guy walk the streets
- Random Solana mainnet outages freeze every NPC in the city. Your transactions still go through
- Three shops: PUMP.FUN (gamble), GUN.FUN (weapons), JUP JUICE (heal)
- Powerups: JITO BOOST speed and STAKED SOL shield
- Fartcoin. It's worth 5

## Weapons

| Weapon | How to get |
|---|---|
| Bat | Always in hand, press SPACE |
| PHANTOM PIECE pistol | Yours from the start |
| BONK-9 SMG | 40 ◎ at GUN.FUN |
| JEET SWEEPER shotgun | 60 ◎ at GUN.FUN |

## Controls

| Key | Action |
|---|---|
| WASD / Arrows | Move / drive |
| Shift | Sprint |
| Space | Swing bat |
| Mouse + Click | Aim and shoot |
| E | Talk, rob, jack cars, shop |
| Q | Swap weapon |
| P | Pause |
| M / N | Mute / music toggle |
| R | Reset save (title screen) |

Progress saves automatically in your browser.

## Tech

Pure JavaScript, HTML5 canvas, no frameworks, no build step, no external requests. All characters are drawn and animated procedurally in code, no sprites and no assets. Everything from the walk cycles to the synthwave beat is generated at runtime.

```
index.html            thin shell, loads the sources
src/boot.js           canvas + resize
src/audio.js          WebAudio synth: sfx and music notes
src/input.js          keyboard + mouse
src/map.js            city generation, tiles, collision
src/state.js          globals, player, weapons, helpers
src/save.js           localStorage save/load
src/spawn.js          entity spawners + traffic AI
src/missions.js       the seven-mission campaign
src/world-init.js     world setup, startGame, respawn
src/update.js         game logic: combat, AI, physics
src/render.js         draw helpers + all characters
src/render-world.js   tiles, world pass, HUD
src/screens.js        title / wasted / win / pause
src/main.js           the loop
```

Parody project. Not affiliated with Solana Labs or anyone else. NFA DYOR etc.
