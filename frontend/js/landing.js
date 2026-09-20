 // Neural network ambient background
 const canvas = document.getElementById('neural-canvas');
 const ctx = canvas.getContext('2d');
 let W, H, nodes = [];
 const NODE_COUNT_BASE = 60;

 function resize(){
   W = canvas.width = canvas.offsetWidth * devicePixelRatio;
   H = canvas.height = canvas.offsetHeight * devicePixelRatio;
 }
 function initNodes(){
   const count = Math.min(NODE_COUNT_BASE, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 18000));
   nodes = Array.from({length: count}, () => ({
     x: Math.random() * W,
     y: Math.random() * H,
     vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
     vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
     r: (Math.random() * 1.6 + 0.8) * devicePixelRatio
   }));
 }
 function step(){
   ctx.clearRect(0,0,W,H);
   for(const n of nodes){
     n.x += n.vx; n.y += n.vy;
     if(n.x < 0 || n.x > W) n.vx *= -1;
     if(n.y < 0 || n.y > H) n.vy *= -1;
   }
   const maxDist = 150 * devicePixelRatio;
   for(let i=0;i<nodes.length;i++){
     for(let j=i+1;j<nodes.length;j++){
       const a = nodes[i], b = nodes[j];
       const dx = a.x-b.x, dy = a.y-b.y;
       const dist = Math.sqrt(dx*dx+dy*dy);
       if(dist < maxDist){
         const op = (1 - dist/maxDist) * 0.35;
         ctx.strokeStyle = `rgba(56,189,248,${op})`;
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
         ctx.stroke();
       }
     }
   }
   for(const n of nodes){
     ctx.beginPath();
     ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
     ctx.fillStyle = 'rgba(147,197,253,0.85)';
     ctx.fill();
   }
   requestAnimationFrame(step);
 }
 function boot(){
   resize(); initNodes(); step();
 }
 window.addEventListener('resize', () => { resize(); initNodes(); });
 boot();

 // Sticky nav shadow on scroll
 const navEl = document.querySelector('header.nav');
 window.addEventListener('scroll', () => {
   if(window.scrollY > 20){ navEl.style.boxShadow = '0 8px 30px -12px rgba(0,0,0,0.5)'; }
   else{ navEl.style.boxShadow = 'none'; }
 });