'use strict';
/* ============ GRAND THEFT SOLANA v2 ============ */
const cv=document.getElementById('g'),ctx=cv.getContext('2d');
let W=1280,H=720;
function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
window.addEventListener('resize',resize);resize();
