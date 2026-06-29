/* ============================================================
   GPI · Mock navegable de la plataforma
   - Arma el sidebar (módulos → pestañas) a partir de las vistas (.scene)
   - Navegación por CLIC en el sidebar o con las FLECHAS ← → (sin auto-play)
   - Cada vista es una captura full-size; se le pueden poner recuadros (editor, tecla E)
   - Expone window.GPIDeck para que el editor (recuadros/fotos/guardar) funcione igual
   ============================================================ */
(function(){
  if(window.__GPI_MOCK__) return; window.__GPI_MOCK__ = true;
  const SELF = document.currentScript;
  window.GPI_LOADER_SRC = '../engine/mock.js';   // lo usa el editor al exportar

  const ICON = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h13v14H6a2 2 0 0 1-2-2V5z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M8 9h6M8 13h6M8 17h4"/></svg>',
    cal:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c0-3 2.8-5 6.2-5s6.2 2 6.2 5"/><path d="M16.2 5.6a3.1 3.1 0 0 1 0 5.7M21.4 20c0-2.3-1.1-4-2.8-4.8"/></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><line x1="6" y1="20" x2="6" y2="11"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.6 6.3a1 1 0 0 0 0 1.4l1.7 1.7a1 1 0 0 0 1.4 0l3.6-3.6a6 6 0 0 1-7.9 7.9l-6.3 6.3a2.1 2.1 0 0 1-3-3l6.3-6.3a6 6 0 0 1 7.9-7.9l-3.7 3.5z"/></svg>'
  };

  let scenes = [...document.querySelectorAll('.scene')];
  let cur = -1, editMode = false;

  const avsa = (document.body.dataset && document.body.dataset.avsa) || '../assets/logo-avsa.png';
  const navEl = document.createElement('aside');
  navEl.className = 'gpi-mock-nav';
  document.body.appendChild(navEl);

  function buildSidebar(){
    scenes = [...document.querySelectorAll('.scene')];
    const order = [], map = {};
    scenes.forEach((s,i)=>{
      const k = s.dataset.mod || ('m'+i);
      if(!map[k]){ map[k] = { key:k, label:s.dataset.modLabel||k, icon:s.dataset.icon||'dash', tabs:[] }; order.push(k); }
      map[k].tabs.push({ idx:i, label:s.dataset.tabLabel||'' });
    });
    let html = '<div class="brand"><span class="dot"></span><b>GPI</b></div><div class="sep"></div>';
    order.forEach(k=>{
      const m = map[k];
      const ico = ICON[m.icon] || ICON.dash;
      const direct = m.tabs.length === 1 && !m.tabs[0].label;
      if(direct){
        html += '<div class="mod direct" data-mod="'+k+'" data-idx="'+m.tabs[0].idx+'">'+
                  '<div class="row"><span class="ico">'+ico+'</span><span class="lbl">'+m.label+'</span></div></div>';
      } else {
        html += '<div class="mod" data-mod="'+k+'">'+
                  '<div class="row"><span class="ico">'+ico+'</span><span class="lbl">'+m.label+'</span><span class="chev">▶</span></div>'+
                  '<div class="tabs">'+
                    m.tabs.map(t=>'<div class="tab" data-idx="'+t.idx+'">'+t.label+'</div>').join('')+
                  '</div></div>';
      }
    });
    html += '<div class="spacer"></div><div class="foot"><span class="av">hecho para</span><img src="'+avsa+'" alt="Argentina Valores"></div>';
    navEl.innerHTML = html;

    navEl.querySelectorAll('.mod.direct').forEach(mod=>{
      mod.querySelector('.row').onclick = ()=> go(parseInt(mod.dataset.idx,10));
    });
    navEl.querySelectorAll('.mod:not(.direct) > .row').forEach(row=>{
      row.onclick = ()=>{ const first = row.parentElement.querySelector('.tab'); if(first) go(parseInt(first.dataset.idx,10)); };
    });
    navEl.querySelectorAll('.tab').forEach(tb=>{ tb.onclick = ()=> go(parseInt(tb.dataset.idx,10)); });
  }

  function syncSidebar(){
    if(cur < 0 || !scenes[cur]) return;
    const modKey = scenes[cur].dataset.mod;
    navEl.querySelectorAll('.mod').forEach(m=>{
      const isCur = m.dataset.mod === modKey;
      m.classList.toggle('active-mod', isCur);
      if(m.classList.contains('direct')) m.classList.toggle('active', isCur);
      else m.classList.toggle('open', isCur);   // acordeón: abre el actual, cierra los demás
    });
    navEl.querySelectorAll('.tab').forEach(tb=>{
      tb.classList.toggle('active', parseInt(tb.dataset.idx,10) === cur);
    });
  }

  function show(i){
    if(i < 0 || i >= scenes.length) return;
    scenes.forEach(s=>{ s.classList.remove('active'); s.querySelectorAll('[data-anim]').forEach(e=>e.classList.remove('in')); });
    const s = scenes[i]; s.classList.add('active');
    s.querySelectorAll('[data-anim]').forEach((e,k)=> setTimeout(()=> e.classList.add('in'), 60 + 70*k));
    // cada vista arranca con las viñetas revelables ocultas
    s.querySelectorAll('.inset.reveal.is-on').forEach(v=> v.classList.remove('is-on'));
    s.querySelectorAll('.clickbox--btn.is-pressed').forEach(c=> c.classList.remove('is-pressed'));
    cur = i;
    syncSidebar();
  }
  // navegar desde el sidebar/flechas (y avisar al editor si está activo)
  function go(i){ show(i); if(window.__GPI_EDITOR_SYNC__) window.__GPI_EDITOR_SYNC__(i); }

  /* ---- API que usa el editor ---- */
  window.GPIDeck = {
    enter: show,
    next(){ go(Math.min(cur + 1, scenes.length - 1)); },
    prev(){ go(Math.max(cur - 1, 0)); },
    play(){}, pause(){},
    setEditMode(v){ editMode = !!v; },
    refresh(){ buildSidebar(); syncSidebar(); },
    get scenes(){ return scenes; },
    get current(){ return cur; },
    get total(){ return scenes.length; },
    get editMode(){ return editMode; }
  };
  // cuando el editor navega con sus ◀ ▶, mantener el sidebar en sync
  window.__GPI_NAV_SYNC__ = (i)=>{ cur = i; syncSidebar(); };

  /* ---- teclado: flechas (presentación) + E (editor) ---- */
  document.addEventListener('keydown', e=>{
    const t = e.target;
    if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if(e.key === 'e' || e.key === 'E'){ e.preventDefault(); loadEditor(); return; }
    if(editMode) return;   // en edición, las flechas las maneja el editor
    if(e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); go(Math.min(cur + 1, scenes.length - 1)); }
    else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); go(Math.max(cur - 1, 0)); }
    else if(e.key === 'Home'){ e.preventDefault(); go(0); }
    else if(e.key === 'End'){ e.preventDefault(); go(scenes.length - 1); }
  });

  /* ---- click → revela/oculta la viñeta vinculada (presentación) ---- */
  document.addEventListener('click', e=>{
    if(editMode || document.body.classList.contains('gpi-edit')) return;
    const cb = e.target.closest('.clickbox--btn[data-reveal]'); if(!cb) return;
    const scene = cb.closest('.scene'); if(!scene) return;
    scene.querySelectorAll('.inset[data-reveal-id="'+cb.dataset.reveal+'"]').forEach(v=> v.classList.toggle('is-on'));
    cb.classList.toggle('is-pressed');
  });

  /* ---- editor a demanda (tecla E) ---- */
  let editorLoaded = false;
  function loadEditor(){
    if(editorLoaded){ window.dispatchEvent(new CustomEvent('gpi-edit-toggle')); return; }
    editorLoaded = true;
    const base = ((SELF && SELF.src) ? SELF.src : '../engine/mock.js').replace(/mock\.js.*$/, '');
    const v = '?v=' + Date.now();
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = base + 'editor.css' + v; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = base + 'editor.js' + v; document.body.appendChild(js);
  }

  /* ---- arranque ---- */
  buildSidebar();
  show(0);
  const hint = document.createElement('div'); hint.className = 'gpi-mock-hint'; hint.innerHTML = '← →  navegar &nbsp;·&nbsp; <b>E</b>  editar';
  document.body.appendChild(hint);
})();
