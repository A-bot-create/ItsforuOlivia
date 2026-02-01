// script.js
// Interactive behaviour: button 'No' avoids the cursor on desktop.

(() => {
  const no = document.getElementById('no');
  const yes = document.getElementById('yes');
  const actions = document.getElementById('actions');
  const announce = document.getElementById('ariaAnnounce');
  const MOVE_THRESHOLD = 120; // px
  const MAX_MOVES = 8;

  // Ensure actions container is positioned and sized
  function getBounds(){
    return actions.getBoundingClientRect();
  }

  // Helper: compute distance between two points
  function dist(x1,y1,x2,y2){
    const dx = x1-x2; const dy = y1-y2; return Math.sqrt(dx*dx+dy*dy);
  }

  // Choose a new safe position for the 'No' button inside actions
  function pickNewPosition(btn){
    const bounds = getBounds();
    const btnRect = btn.getBoundingClientRect();
    const padding = 8; // keep inside
    const minX = padding;
    const maxX = bounds.width - btnRect.width - padding;
    const minY = bounds.height*0.15;
    const maxY = bounds.height - btnRect.height - padding;

    // Try a number of attempts to avoid overlap with Yes button
    const yesRect = yes.getBoundingClientRect();
    for(let i=0;i<12;i++){
      const x = Math.round(minX + Math.random()*(Math.max(0,maxX-minX)));
      const y = Math.round(minY + Math.random()*(Math.max(0,maxY-minY)));
      // translateX uses percentage of left style: we set in px via transform
      // Ensure it won't overlap YES
      const candidateRect = {left: bounds.left + x, right: bounds.left + x + btnRect.width, top: bounds.top + y, bottom: bounds.top + y + btnRect.height};
      const overlap = !(candidateRect.right < yesRect.left || candidateRect.left > yesRect.right || candidateRect.bottom < yesRect.top || candidateRect.top > yesRect.bottom);
      if(!overlap) return {x,y};
    }
    // fallback centre-left or centre-right
    return {x:Math.max(minX, Math.min(maxX, 12)), y:Math.max(minY, Math.min(maxY, 8))};
  }

  // Apply transform to move button to px (relative to actions)
  function moveButtonTo(btn, pos){
    btn.style.transition = `transform var(--anim-duration) cubic-bezier(.22,1,.36,1)`;
    btn.style.transform = `translate(${pos.x}px, ${pos.y - btn.offsetHeight/2}px)`; // keep vertical center
  }

  // Simple throttle using RAF
  let rafId = null;
  let lastMouse = null;
  function onMoveEvent(e){
    lastMouse = e;
    if(rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      handleProximity(lastMouse);
    });
  }

  function handleProximity(e){
    const btnRect = no.getBoundingClientRect();
    const bx = btnRect.left + btnRect.width/2;
    const by = btnRect.top + btnRect.height/2;
    const mx = e.clientX;
    const my = e.clientY;
    const d = dist(bx,by,mx,my);
    const moves = Number(no.dataset.moves || 0);
    if(d < MOVE_THRESHOLD){
      const pos = pickNewPosition(no);
      moveButtonTo(no,pos);
      no.dataset.moves = moves+1;
      announce.textContent = `Button moved ${moves+1} times`;
    }
  }

  // Keyboard accessibility: if 'No' receives focus, swap positions with Yes once
  function swapPositions(){
    const yesRect = yes.getBoundingClientRect();
    const noRect = no.getBoundingClientRect();
    const actionsRect = getBounds();
    const yesOffset = {x: yesRect.left - actionsRect.left, y: yesRect.top - actionsRect.top};
    const noOffset = {x: noRect.left - actionsRect.left, y: noRect.top - actionsRect.top};
    moveButtonTo(yes, noOffset);
    moveButtonTo(no, yesOffset);
    announce.textContent = 'Positions swapped';
  }

  // On small screens/touch: on first tap of No, swap or nudge
  function onTouchNo(e){
    e.preventDefault();
    swapPositions();
  }

  // Event listeners
  document.addEventListener('mousemove', onMoveEvent);
  no.addEventListener('mouseenter', (e)=>{ if(window.innerWidth>600) onMoveEvent(e); });
  no.addEventListener('focus', (e)=>{ swapPositions(); });
  no.addEventListener('touchstart', onTouchNo, {passive:false});

  // Keep 'No' always visible (ensure not moved off-screen on resize)
  window.addEventListener('resize', ()=>{
    no.style.transition = '';
    no.style.transform = '';
  });

  // Yes button click: simple confetti-ish visual via hearts
  yes.addEventListener('click', ()=>{
    announce.textContent = 'Yay! 💖';
    
    // Faire disparaître les boutons et le message hint
    actions.style.transition = 'opacity 500ms ease-out';
    actions.style.opacity = '0';
    const hintMessage = document.querySelector('.hint');
    hintMessage.style.transition = 'opacity 500ms ease-out';
    hintMessage.style.opacity = '0';
    setTimeout(() => {
      actions.style.display = 'none';
      hintMessage.style.display = 'none';
    }, 500);
    
    // Afficher le message de bonheur
    const messageYes = document.getElementById('messageYes');
    messageYes.textContent = 'Je suis heureux! 😊💖';
    messageYes.style.display = 'block';
    
    // Afficher l'image d'Olivia après un délai
    const oliviaImage = document.getElementById('oliviaImage');
    setTimeout(() => {
      oliviaImage.innerHTML = '<img src="gf.jpg" alt="Olivia" />';
      oliviaImage.style.display = 'block';
    }, 600);
    
    // Afficher le message en anglais après un délai
    const messageEnglish = document.getElementById('messageEnglish');
    setTimeout(() => {
      messageEnglish.innerHTML = '"You are the most beautiful thing<br/>that has ever happened to me.<br/>I want to spend every moment with you."';
      messageEnglish.style.display = 'block';
    }, 800);
    
    // Afficher le message captivant après un autre délai
    const messageCaptivating = document.getElementById('messageCaptivating');
    setTimeout(() => {
      messageCaptivating.innerHTML = '💝 I asked you this because you mean everything to me.<br/>You inspire me every day to be a better person.<br/>Thank you for saying yes to my heart. 💝';
      messageCaptivating.style.display = 'block';
    }, 2000);
    
    // Invisible/transparent heart burst
    for(let i=0;i<15;i++){
      const heart = document.createElement('div');
      heart.className = 'burst';
      heart.textContent = '💖';
      heart.style.opacity = '0.15';
      document.body.appendChild(heart);
      const x = yes.getBoundingClientRect().left + yes.offsetWidth/2 + (Math.random()-0.5)*150;
      const y = yes.getBoundingClientRect().top + yes.offsetHeight/2 + (Math.random()-0.5)*50;
      const angle = (Math.PI * 2 * i) / 15;
      const distance = 200;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--ty', `${ty}px`);
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      setTimeout(()=>heart.remove(),1200);
    }
  });

})();