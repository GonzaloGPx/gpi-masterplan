/* ============================================================
   GPI · Motor de presentación — controlador de escenas
   Lee <section class="scene" data-dur="N">… y reproduce una
   línea de tiempo con auto-play, barra de progreso y teclado.
   Inyecta la "chrome" de marca (wordmark, badge AVSA, HUD).
   Config por <body data-section data-tag data-avsa>.

   Modo editor (tecla "E"): carga engine/editor.js para acomodar
   recuadros, textos y fotos con el mouse y exportar el HTML.
   ============================================================ */
(function(){
  const SELF = document.currentScript;   // válido sólo durante la ejecución inicial
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
    <div class="hint">Espacio: pausar · ← → : moverse · <b>E</b>: editar</div>`;
  body.insertAdjacentHTML('beforeend', chrome);

  /* ---- timeline ---- */
  let scenes = [...document.querySelectorAll('.scene')];
  const DEFAULT = 15;
  let dur = scenes.map(s => parseFloat(s.dataset.dur) || DEFAULT);
  function refresh(){ scenes = [...document.querySelectorAll('.scene')]; dur = scenes.map(s => parseFloat(s.dataset.dur) || DEFAULT); }
  const bar = document.getElementById('bar');
  const counter = document.getElementById('counter');
  const cplay = document.getElementById('cplay');
  let cur = -1, playing = true, raf = null, t0 = 0, acc = 0;
  let editMode = false;          // cuando true, el motor no auto-avanza

  function enter(i){
    if(i < 0 || i >= scenes.length) return;
    if(cur >= 0 && cur !== i){
      const p = scenes[cur];
      p.classList.remove('active');
      p.querySelectorAll('[data-anim]').forEach(e => e.classList.remove('in'));
    }
    cur = i;
    const s = scenes[i];
    s.classList.add('active');
    s.querySelectorAll('[data-anim]').forEach((e,k) => setTimeout(() => e.classList.add('in'), 90 + 85*k));
    counter.textContent = String(i+1).padStart(2,'0') + ' / ' + String(scenes.length).padStart(2,'0');
    acc = 0; t0 = performance.now();
  }
  function frame(now){
    if(!playing || editMode) return;
    const el = acc + (now - t0)/1000;
    const p = Math.min(el / dur[cur], 1);
    bar.style.width = (p*100) + '%';
    if(p >= 1){
      if(cur < scenes.length - 1){ enter(cur+1); }
      else { playing = false; cplay.textContent = '↻'; bar.style.width = '100%'; return; }
    }
    raf = requestAnimationFrame(frame);
  }
  function play(){ if(editMode) return; playing = true; cplay.textContent = '❚❚'; t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  function pause(){ playing = false; cplay.textContent = '▶'; cancelAnimationFrame(raf); acc += (performance.now() - t0)/1000; }
  function toggle(){ playing ? pause() : (cur >= total - 1 ? (enter(0), play()) : play()); }
  function next(){ if(cur < scenes.length - 1){ enter(cur+1); bar.style.width = '0'; if(playing && !editMode) play(); } }
  function prev(){ if(cur > 0){ enter(cur-1); bar.style.width = '0'; if(playing && !editMode) play(); } }

  document.getElementById('cnext').onclick = next;
  document.getElementById('cprev').onclick = prev;
  cplay.onclick = toggle;
  document.addEventListener('keydown', e => {
    const t = e.target;
    if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    // la tecla E entra/sale del editor — la maneja SOLO el motor (evita doble toggle)
    if(e.key === 'e' || e.key === 'E'){ e.preventDefault(); loadEditor(); return; }
    if(editMode) return;   // en edición, el editor maneja el resto del teclado
    if(e.code === 'Space'){ e.preventDefault(); toggle(); }
    else if(e.code === 'ArrowRight'){ e.preventDefault(); next(); }
    else if(e.code === 'ArrowLeft'){ e.preventDefault(); prev(); }
    else if(e.code === 'Home'){ e.preventDefault(); enter(0); if(playing) play(); }
  });

  /* ---- API pública (la usa el editor) ---- */
  window.GPIDeck = {
    enter, next, prev, play, pause,
    setEditMode(v){ editMode = !!v; if(editMode){ playing = false; cancelAnimationFrame(raf); cplay.textContent = '▶'; } },
    refresh,
    get scenes(){ return scenes; },
    get current(){ return cur; },
    get total(){ return scenes.length; },
    get editMode(){ return editMode; }
  };

  /* ---- cargador del editor (perezoso, una sola vez) ---- */
  let editorLoaded = false;
  function loadEditor(){
    if(editorLoaded){ window.dispatchEvent(new CustomEvent('gpi-edit-toggle')); return; }
    editorLoaded = true;
    const base = ((SELF && SELF.src) ? SELF.src : '../engine/deck.js').replace(/deck\.js.*$/,'');
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = base + 'editor.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = base + 'editor.js';
    document.body.appendChild(js);
  }

  enter(0); play();

  /* permitir abrir el editor directo con ?edit=1 */
  if(/[?&]edit=1\b/.test(location.search)) loadEditor();
})();
