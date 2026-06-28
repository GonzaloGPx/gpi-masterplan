/* ============================================================
   GPI · Motor de presentación — controlador de escenas
   Lee <section class="scene" data-dur="N">… y reproduce una
   línea de tiempo con auto-play, barra de progreso y teclado.
   Inyecta la "chrome" de marca (wordmark, badge AVSA, HUD).
   Config por <body data-section data-tag data-avsa>.
   ============================================================ */
(function(){
  const body = document.body;
  const SECTION = body.dataset.section || '';
  const TAG     = body.dataset.tag || 'Demo · capturas reales';
  const AVSA    = body.dataset.avsa || '../assets/logo-avsa.png';
  const HOME    = body.dataset.home || '';   // link opcional al índice

  /* ---- inyectar chrome de marca ---- */
  const chrome = `
    <div class="brandbar">
      ${HOME?`<a href="${HOME}" style="text-decoration:none">`:''}
      <span class="wordmark"><span class="dot"></span>GPI</span>
      ${HOME?`</a>`:''}
      ${SECTION?`<span class="sep"></span><span class="sec">${SECTION}</span>`:''}
    </div>
    <div class="forb">hecho para <img src="${AVSA}" alt="Argentina Valores"></div>
    <div class="hud">
      <div class="ctrl" id="cprev" title="Anterior">◀</div>
      <div class="ctrl" id="cplay" title="Pausar / reanudar">❚❚</div>
      <div class="ctrl" id="cnext" title="Siguiente">▶</div>
      <div class="progress"><div id="bar"></div></div>
      <div class="counter" id="counter">01 / 01</div>
    </div>
    <div class="tag">${TAG}</div>
    <div class="hint">Espacio: pausar · ← → : moverse</div>`;
  body.insertAdjacentHTML('beforeend', chrome);

  /* ---- timeline ---- */
  const scenes = [...document.querySelectorAll('.scene')];
  const DEFAULT = 15;
  const dur = scenes.map(s => parseFloat(s.dataset.dur) || DEFAULT);
  const bar = document.getElementById('bar');
  const counter = document.getElementById('counter');
  const cplay = document.getElementById('cplay');
  let cur = -1, playing = true, raf = null, t0 = 0, acc = 0;
  const total = scenes.length;

  function enter(i){
    if(cur >= 0){
      const p = scenes[cur];
      p.classList.remove('active');
      p.querySelectorAll('[data-anim]').forEach(e => e.classList.remove('in'));
    }
    cur = i;
    const s = scenes[i];
    s.classList.add('active');
    s.querySelectorAll('[data-anim]').forEach((e,k) => setTimeout(() => e.classList.add('in'), 90 + 85*k));
    counter.textContent = String(i+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
    acc = 0; t0 = performance.now();
  }
  function frame(now){
    if(!playing) return;
    const el = acc + (now - t0)/1000;
    const p = Math.min(el / dur[cur], 1);
    bar.style.width = (p*100) + '%';
    if(p >= 1){
      if(cur < total - 1){ enter(cur+1); }
      else { playing = false; cplay.textContent = '↻'; bar.style.width = '100%'; return; }
    }
    raf = requestAnimationFrame(frame);
  }
  function play(){ playing = true; cplay.textContent = '❚❚'; t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  function pause(){ playing = false; cplay.textContent = '▶'; cancelAnimationFrame(raf); acc += (performance.now() - t0)/1000; }
  function toggle(){ playing ? pause() : (cur >= total - 1 ? (enter(0), play()) : play()); }
  function next(){ if(cur < total - 1){ enter(cur+1); bar.style.width = '0'; if(playing) play(); } }
  function prev(){ if(cur > 0){ enter(cur-1); bar.style.width = '0'; if(playing) play(); } }

  document.getElementById('cnext').onclick = next;
  document.getElementById('cprev').onclick = prev;
  cplay.onclick = toggle;
  document.addEventListener('keydown', e => {
    if(e.code === 'Space'){ e.preventDefault(); toggle(); }
    else if(e.code === 'ArrowRight'){ e.preventDefault(); next(); }
    else if(e.code === 'ArrowLeft'){ e.preventDefault(); prev(); }
    else if(e.code === 'Home'){ e.preventDefault(); enter(0); if(playing) play(); }
  });

  enter(0); play();
})();
