/* ============================================================
   GPI · Editor visual de demos
   Se carga al presionar "E" (lo hace deck.js). Permite:
   1) cargar / cambiar la foto de cada escena
   2) dibujar y mover recuadros (verde / rojo / amarillo)
   3) escribir las descripciones (caption) y títulos
   4) escribir los títulos de los recuadros (etiquetas)
   5) agregar viñetas laterales (insets) y conectores
   y exportar el HTML ya terminado (descargar / copiar).
   No toca nada del modo presentación.
   ============================================================ */
(function(){
  if(!window.GPIDeck){ console.warn('GPIDeck no disponible'); return; }
  if(window.__GPI_EDITOR__) return; window.__GPI_EDITOR__ = true;

  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const scenesList = ()=>[...document.querySelectorAll('.scene')];
  let editing = false, curIdx = 0, sel = null;

  /* ---------------- UI: barra superior + panel + toast ---------------- */
  const bar = document.createElement('div');
  bar.className = 'gpi-ed-bar';
  bar.innerHTML = `
    <span class="ttl"><span class="d"></span>MODO EDICIÓN</span>
    <button class="gpi-ed-btn" data-act="prev">◀</button>
    <span class="nav" id="gpiEdNav">01 / 01</span>
    <button class="gpi-ed-btn" data-act="next">▶</button>
    <span class="gpi-ed-sepv"></span>
    <button class="gpi-ed-btn" data-act="add-green">+ Recuadro</button>
    <button class="gpi-ed-btn" data-act="add-alert">+ Alerta</button>
    <button class="gpi-ed-btn" data-act="add-warn">+ Aviso</button>
    <button class="gpi-ed-btn" data-act="add-click">+ Click</button>
    <span class="gpi-ed-sepv"></span>
    <button class="gpi-ed-btn" data-act="add-inset">+ Viñeta</button>
    <button class="gpi-ed-btn" data-act="add-conn">+ Conector</button>
    <span class="gpi-ed-sepv"></span>
    <button class="gpi-ed-btn" data-act="photo">Cambiar foto</button>
    <button class="gpi-ed-btn" data-act="del-photo">Quitar foto</button>
    <button class="gpi-ed-btn" data-act="add-scene">+ Escena</button>
    <span class="sp"></span>
    <span class="paste-hint">Ctrl+V pega imagen · autoguardado activo</span>
    <button class="gpi-ed-btn" data-act="copy">Copiar escena</button>
    <button class="gpi-ed-btn" data-act="download">Descargar copia</button>
    <button class="gpi-ed-btn pri" data-act="save">Guardar en archivo</button>
    <button class="gpi-ed-btn gho" data-act="exit">Salir (E)</button>`;
  bar.style.display = 'none';
  document.body.appendChild(bar);

  // barra de restauración (cambios sin guardar de una sesión anterior)
  const restoreBar = document.createElement('div');
  restoreBar.className = 'gpi-ed-restore'; restoreBar.style.display = 'none';
  restoreBar.innerHTML = '<span id="gpiRestoreTxt"></span>'+
    '<button class="gpi-ed-btn pri" id="gpiRestoreYes">Restaurar</button>'+
    '<button class="gpi-ed-btn gho" id="gpiRestoreNo">Descartar</button>';
  document.body.appendChild(restoreBar);

  const panel = document.createElement('div');
  panel.className = 'gpi-ed-panel';
  document.body.appendChild(panel);

  const toastEl = document.createElement('div');
  toastEl.className = 'gpi-ed-toast';
  document.body.appendChild(toastEl);
  let toastT = null;
  function toast(msg){
    toastEl.innerHTML = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(()=>toastEl.classList.remove('show'), 3200);
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.className = 'gpi-ed-file';
  document.body.appendChild(fileInput);
  let fileTarget = null;
  fileInput.addEventListener('change', ()=>{
    const f = fileInput.files && fileInput.files[0];
    if(!f || !fileTarget){ return; }
    fileTarget.src = URL.createObjectURL(f);
    fileTarget.dataset.edExportSrc = '../assets/real/' + f.name;
    toast('Foto cargada · <b>guardá el archivo en assets/real/ como “'+f.name+'”</b>');
    fileInput.value = '';
  });
  function pickPhoto(img){ if(!img){ toast('Esta escena no tiene foto'); return; } fileTarget = img; fileInput.click(); }

  /* ---------------- geometría ---------------- */
  function parentOf(el){
    if(el.classList.contains('inset') || el.classList.contains('conn')) return el.closest('.stage') || el.parentElement;
    return el.closest('.frame') || el.parentElement;
  }
  function geom(el){
    const p = parentOf(el); if(!p) return null;
    const pr = p.getBoundingClientRect(), er = el.getBoundingClientRect();
    return { left:(er.left-pr.left)/pr.width*100, top:(er.top-pr.top)/pr.height*100,
             width:er.width/pr.width*100, height:er.height/pr.height*100, pr };
  }

  /* ---- conectores: ángulo + geometría desde el estilo inline (no el bbox rotado) ---- */
  const CONN_ANGLES = [[0,'→  0°'],[45,'↘  45°'],[90,'↓  90°'],[135,'↙  135°'],[180,'←  180°'],[225,'↖  225°'],[270,'↑  270°'],[315,'↗  315°']];
  function connAngle(el){ const m = /rotate\(\s*([-\d.]+)deg\s*\)/.exec(el.style.transform || ''); return m ? parseFloat(m[1]) : 0; }
  function setConnAngle(el, deg){ el.style.transformOrigin = 'left center'; el.style.transform = 'rotate(' + deg + 'deg)'; }
  function connGeom(el){
    let width = parseFloat(el.style.width);
    if(isNaN(width)){ const g = geom(el); width = g ? g.width : 0; }  // p.ej. width:calc(...): usar bbox (válido a 0°)
    return { left: parseFloat(el.style.left) || 0, top: parseFloat(el.style.top) || 0, width: width || 0, angle: connAngle(el) };
  }
  function gBase(el){ return el.classList.contains('conn') ? connGeom(el) : geom(el); }

  /* ---------------- selección + handle + lectura ---------------- */
  function select(el){
    if(sel === el){ return; }
    deselect();
    sel = el; el.classList.add('gpi-ed-sel');
    const h = document.createElement('div'); h.className = 'gpi-ed-handle';
    h.addEventListener('pointerdown', ev=>{ ev.stopPropagation(); ev.preventDefault(); startDrag(el, ev, 'resize'); });
    el.appendChild(h); el._h = h;
    const ro = document.createElement('div'); ro.className = 'gpi-ed-readout';
    el.appendChild(ro); el._ro = ro;
    readout(el);
    buildPanel(el);
  }
  function deselect(){
    if(!sel) return;
    sel.classList.remove('gpi-ed-sel');
    sel._h && sel._h.remove(); sel._ro && sel._ro.remove();
    sel._h = sel._ro = null; sel = null;
    panel.classList.remove('show');
  }
  function readout(el){
    if(!el._ro) return;
    if(el.classList.contains('conn')){ const c = connGeom(el); el._ro.textContent = 'L '+c.left.toFixed(1)+' · T '+c.top.toFixed(1)+' · '+c.width.toFixed(1)+' · '+c.angle+'°'; return; }
    const g = geom(el); if(!g) return;
    if(el.classList.contains('inset')) el._ro.textContent = 'L ' + g.left.toFixed(1) + ' · T ' + g.top.toFixed(1);
    else el._ro.textContent = g.left.toFixed(1)+' · '+g.top.toFixed(1)+' · '+g.width.toFixed(1)+'×'+g.height.toFixed(1);
  }

  /* ---------------- arrastre / resize ---------------- */
  function startDrag(el, e, mode){
    const p = parentOf(el); if(!p) return;
    const pr = p.getBoundingClientRect();
    const g = gBase(el);
    const sx = e.clientX, sy = e.clientY;
    const isInset = el.classList.contains('inset');
    const isConn  = el.classList.contains('conn');
    const w0 = el.getBoundingClientRect().width;
    function mv(ev){
      const dxp = (ev.clientX - sx)/pr.width*100;
      const dyp = (ev.clientY - sy)/pr.height*100;
      if(mode === 'move'){
        if(isInset){
          el.classList.remove('lft','rgt');     // pasa a posición libre
          el.style.left = clamp(g.left+dxp,-160,260).toFixed(2)+'%';
          el.style.top  = clamp(g.top+dyp,-160,260).toFixed(2)+'%';
        } else if(isConn){
          el.style.left = clamp(g.left+dxp,-160,260).toFixed(2)+'%';
          el.style.top  = clamp(g.top+dyp,-160,260).toFixed(2)+'%';
        } else {
          el.style.left = clamp(g.left+dxp,-40,100).toFixed(2)+'%';
          el.style.top  = clamp(g.top+dyp,-40,100).toFixed(2)+'%';
        }
      } else { // resize
        if(isInset){ el.style.width = Math.max(140, w0 + (ev.clientX - sx)) + 'px'; }
        else if(isConn){
          // el largo sigue al puntero: distancia desde el origen (left,top) del conector
          const ox = pr.left + g.left/100*pr.width;
          const oy = pr.top  + g.top /100*pr.height;
          const dist = Math.hypot(ev.clientX - ox, ev.clientY - oy);
          el.style.width = Math.max(0.5, dist/pr.width*100).toFixed(2)+'%';
        }
        else { el.style.width = Math.max(1, g.width+dxp).toFixed(2)+'%';
               el.style.height = Math.max(1, g.height+dyp).toFixed(2)+'%'; }
      }
      readout(el); syncNums(el);
    }
    function up(){ window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  /* ---------------- helpers de tipo / etiqueta ---------------- */
  function ensureLab(el, txt){
    let lab = el.querySelector(':scope > .lab');
    if(!lab){ lab = document.createElement('span'); lab.className = 'lab'; lab.textContent = txt||'Texto'; el.insertBefore(lab, el.firstChild); }
    return lab;
  }
  function setType(el, type){
    el.classList.remove('callout','callout--alert','callout--warn','clickbox');
    if(type === 'click'){
      el.classList.add('clickbox');
      const lab = el.querySelector(':scope > .lab'); if(lab) lab.remove();
    } else {
      el.classList.add('callout');
      if(type === 'alert') el.classList.add('callout--alert');
      if(type === 'warn')  el.classList.add('callout--warn');
      ensureLab(el, 'Texto');
    }
  }
  function typeOf(el){
    if(el.classList.contains('clickbox')) return 'click';
    if(el.classList.contains('callout--alert')) return 'alert';
    if(el.classList.contains('callout--warn')) return 'warn';
    return 'green';
  }
  const LABPOS = [
    ['lab','Arriba ↖'],['lab rgt','Arriba ↗'],['lab bot','Abajo ↙'],['lab bot rgt','Abajo ↘'],
    ['lab in','Dentro ↖'],['lab in-rgt','Dentro ↗'],['lab in-bot','Dentro ↙'],['lab in-botrgt','Dentro ↘']
  ];
  function labPosOf(lab){
    const c = ' '+lab.className+' ';
    if(/in-botrgt/.test(c)) return 'lab in-botrgt';
    if(/in-bot/.test(c)) return 'lab in-bot';
    if(/in-rgt/.test(c)) return 'lab in-rgt';
    if(/\bin\b/.test(c)) return 'lab in';
    const bot = /\bbot\b/.test(c), rgt = /\brgt\b/.test(c);
    return 'lab' + (bot?' bot':'') + (rgt?' rgt':'');
  }

  /* ---------------- panel de propiedades ---------------- */
  function buildPanel(el){
    const t = typeOf(el);
    if(el.classList.contains('inset')){ buildInsetPanel(el); return; }
    if(el.classList.contains('conn')){ buildConnPanel(el); return; }
    const lab = el.querySelector(':scope > .lab');
    const g = geom(el);
    panel.innerHTML = `
      <h4>Recuadro</h4>
      <div class="grp"><div class="seg" id="pType">
        <button data-t="green" class="${t==='green'?'on':''}">Verde</button>
        <button data-t="alert" class="${t==='alert'?'on red':''}">Alerta</button>
        <button data-t="warn"  class="${t==='warn'?'on yel':''}">Aviso</button>
        <button data-t="click" class="${t==='click'?'on':''}">Click</button>
      </div></div>
      <div class="grp" id="pLabWrap" style="${t==='click'?'display:none':''}">
        <label>Título del recuadro</label>
        <input type="text" id="pLab" value="${lab?escAttr(lab.textContent):''}">
        <button class="gpi-ed-btn gho" id="pLabDel" style="width:100%;margin-top:6px">Quitar título</button>
      </div>
      <div class="grp" id="pPosWrap" style="${t==='click'?'display:none':''}">
        <label>Posición del título</label>
        <select id="pPos">${LABPOS.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>
      </div>
      <div class="grp"><label>Posición y tamaño (%)</label>
        <div class="nums">
          <div><label>Izq</label><input type="text" id="nL" value="${g.left.toFixed(1)}"></div>
          <div><label>Arriba</label><input type="text" id="nT" value="${g.top.toFixed(1)}"></div>
          <div><label>Ancho</label><input type="text" id="nW" value="${g.width.toFixed(1)}"></div>
          <div><label>Alto</label><input type="text" id="nH" value="${g.height.toFixed(1)}"></div>
        </div>
      </div>
      <div class="grp"><button class="gpi-ed-btn danger" id="pDel" style="width:100%">Borrar recuadro</button></div>
      <div class="hintln">Arrastrá la caja para moverla · esquina ▸ para el tamaño · flechas para ajuste fino.</div>`;
    if(lab) document.getElementById('pPos').value = labPosOf(lab);

    panel.querySelector('#pType').onclick = ev=>{
      const b = ev.target.closest('button'); if(!b) return;
      setType(el, b.dataset.t); buildPanel(el); // rebuild para reflejar
      reselectHandles(el);
    };
    const labEl = ()=>el.querySelector(':scope > .lab');
    const pLab = document.getElementById('pLab');
    if(pLab) pLab.oninput = ()=>{ ensureLab(el).textContent = pLab.value; };
    const pPos = document.getElementById('pPos');
    if(pPos) pPos.onchange = ()=>{ const l = labEl(); if(l) l.className = pPos.value; };
    const pLabDel = document.getElementById('pLabDel');
    if(pLabDel) pLabDel.onclick = ()=>{ const l = labEl(); if(l) l.remove(); if(pLab) pLab.value=''; toast('Título quitado · escribí en el campo para volver a ponerlo'); };
    bindNums(el);
    document.getElementById('pDel').onclick = ()=>{ el.remove(); deselect(); };
    panel.classList.add('show');
  }
  function buildInsetPanel(el){
    const ilab = el.querySelector('.ilab');
    const img  = el.querySelector('img');
    const side = el.classList.contains('lft') ? 'lft' : 'rgt';
    const g = geom(el);
    const wpx = Math.round(el.getBoundingClientRect().width);
    panel.innerHTML = `
      <h4>Viñeta lateral</h4>
      <div class="grp"><label>Etiqueta</label><input type="text" id="iLab" value="${ilab?escAttr(ilab.textContent):''}"></div>
      <div class="grp"><label>Pegar al borde</label><div class="seg" id="iSide">
        <button data-s="lft" class="${side==='lft'?'on':''}">Izquierda</button>
        <button data-s="rgt" class="${side==='rgt'?'on':''}">Derecha</button>
      </div></div>
      <div class="grp"><div class="nums">
        <div><label>Izq (%)</label><input type="text" id="iL" value="${g.left.toFixed(1)}"></div>
        <div><label>Top (%)</label><input type="text" id="iT" value="${g.top.toFixed(1)}"></div>
        <div><label>Ancho (px)</label><input type="text" id="iW" value="${wpx}"></div>
      </div></div>
      <div class="grp"><button class="gpi-ed-btn" id="iPhoto" style="width:100%">Cambiar foto de la viñeta</button></div>
      <div class="grp"><button class="gpi-ed-btn danger" id="iDel" style="width:100%">Borrar viñeta</button></div>
      <div class="hintln">Arrastrala libremente por toda la pantalla · esquina ▸ para el ancho · “Pegar al borde” la fija al costado.</div>`;
    document.getElementById('iLab').oninput = e=>{ if(ilab) ilab.textContent = e.target.value; };
    document.getElementById('iSide').onclick = e=>{ const b = e.target.closest('button'); if(!b) return; el.classList.remove('lft','rgt'); el.classList.add(b.dataset.s); el.style.left=''; buildInsetPanel(el); };
    document.getElementById('iL').oninput = e=>{ const v = parseFloat(e.target.value); if(!isNaN(v)){ el.classList.remove('lft','rgt'); el.style.left = v+'%'; } readout(el); };
    document.getElementById('iW').oninput = e=>{ const v = parseFloat(e.target.value); if(!isNaN(v)) el.style.width = Math.max(140,v)+'px'; readout(el); };
    document.getElementById('iT').oninput = e=>{ const v = parseFloat(e.target.value); if(!isNaN(v)) el.style.top = v+'%'; readout(el); };
    document.getElementById('iPhoto').onclick = ()=>pickPhoto(img);
    document.getElementById('iDel').onclick = ()=>{ el.remove(); deselect(); };
    panel.classList.add('show');
  }
  function buildConnPanel(el){
    const c = connGeom(el);
    panel.innerHTML = `
      <h4>Conector</h4>
      <div class="grp"><label>Dirección</label>
        <select id="cAng">${CONN_ANGLES.map(([d,n])=>`<option value="${d}">${n}</option>`).join('')}</select>
      </div>
      <div class="grp"><div class="nums">
        <div><label>Izq (%)</label><input type="text" id="nL" value="${c.left.toFixed(1)}"></div>
        <div><label>Arriba (%)</label><input type="text" id="nT" value="${c.top.toFixed(1)}"></div>
        <div><label>Largo (%)</label><input type="text" id="nW" value="${c.width.toFixed(1)}"></div>
      </div></div>
      <div class="grp"><button class="gpi-ed-btn danger" id="pDel" style="width:100%">Borrar conector</button></div>
      <div class="hintln">Arrastrá para mover · esquina ▸ estira hacia el puntero · “Dirección” elige el ángulo.</div>`;
    const ca = document.getElementById('cAng'); ca.value = String(c.angle);
    ca.onchange = ()=>{ setConnAngle(el, parseFloat(ca.value)); readout(el); };
    bindNums(el, true);
    document.getElementById('pDel').onclick = ()=>{ el.remove(); deselect(); };
    panel.classList.add('show');
  }
  function bindNums(el, noHeight){
    const L = document.getElementById('nL'), T = document.getElementById('nT'),
          W = document.getElementById('nW'), H = document.getElementById('nH');
    const set = ()=>{
      if(L && L.value!=='') el.style.left = parseFloat(L.value)+'%';
      if(T && T.value!=='') el.style.top  = parseFloat(T.value)+'%';
      if(W && W.value!=='') el.style.width = parseFloat(W.value)+'%';
      if(!noHeight && H && H.value!=='') el.style.height = parseFloat(H.value)+'%';
      readout(el);
    };
    [L,T,W,H].forEach(i=>i && (i.oninput = set));
  }
  function syncNums(el){
    if(el.classList.contains('conn')){
      const c = connGeom(el), mc = {nL:c.left,nT:c.top,nW:c.width};
      Object.keys(mc).forEach(id=>{ const i = document.getElementById(id); if(i && document.activeElement!==i) i.value = mc[id].toFixed(1); });
      return;
    }
    const g = geom(el); if(!g) return;
    const m = {nL:g.left,nT:g.top,nW:g.width,nH:g.height};
    Object.keys(m).forEach(id=>{ const i = document.getElementById(id); if(i && document.activeElement!==i) i.value = m[id].toFixed(1); });
    if(el.classList.contains('inset')){
      const iT = document.getElementById('iT'); if(iT && document.activeElement!==iT) iT.value = g.top.toFixed(1);
      const iL = document.getElementById('iL'); if(iL && document.activeElement!==iL) iL.value = g.left.toFixed(1);
    }
  }
  function reselectHandles(el){ // re-agregar handle/readout tras rebuild de clases
    if(el._h && !el.contains(el._h)) el.appendChild(el._h);
    if(el._ro && !el.contains(el._ro)) el.appendChild(el._ro);
    readout(el);
  }

  /* ---------------- crear elementos ---------------- */
  function curFrame(){ return scenesList()[curIdx].querySelector('.frame'); }
  function curImg(){ const f = curFrame(); return f ? f.querySelector('img') : null; }
  // ruta relativa para exportar (no la URL absoluta que devuelve img.src)
  function imgRef(img){ return img ? (img.dataset.edExportSrc || img.getAttribute('src') || '') : ''; }
  // asegura que la escena actual tenga un .frame con <img> (lo crea si falta) y lo devuelve
  function ensureFrameImg(){
    const scene = scenesList()[curIdx];
    let frame = scene.querySelector('.frame');
    if(!frame){
      frame = document.createElement('div'); frame.className = 'frame'; frame.setAttribute('data-anim','');
      const cap = scene.querySelector('.cap');
      cap ? scene.insertBefore(frame, cap) : scene.appendChild(frame);
    }
    let img = frame.querySelector('img');
    if(!img){ img = document.createElement('img'); img.alt = ''; frame.insertBefore(img, frame.firstChild); }
    return img;
  }
  function delPhoto(){
    const img = curImg();
    if(!img){ toast('Esta escena no tiene foto'); return; }
    img.remove();
    toast('Foto quitada · “Cambiar foto” o Ctrl+V para poner otra');
  }
  // aplica un Blob de imagen (de archivo o del portapapeles) a un <img>, incrustándolo en base64
  function applyImageBlob(blob, img){
    if(!blob || !img) return;
    img.src = URL.createObjectURL(blob);
    const r = new FileReader();
    r.onload = ()=>{ img.dataset.edExportSrc = r.result; toast('Imagen pegada e incrustada en el HTML'); };
    r.readAsDataURL(blob);
  }
  function addBox(type){
    const f = curFrame(); if(!f){ toast('Esta escena no tiene foto para marcar'); return; }
    const el = document.createElement('div');
    el.setAttribute('data-anim','');
    el.style.cssText = 'left:35%;top:35%;width:24%;height:18%';
    f.appendChild(el);
    setType(el, type);
    select(el);
    toast('Recuadro agregado · arrastralo a su lugar');
  }
  function ensureStage(){
    const scene = scenesList()[curIdx];
    let frame = scene.querySelector('.frame'); if(!frame) return null;
    let stage = frame.closest('.stage');
    if(!stage){
      stage = document.createElement('div'); stage.className = 'stage';
      frame.parentNode.insertBefore(stage, frame); stage.appendChild(frame);
    }
    return stage;
  }
  function addInset(){
    const stage = ensureStage(); if(!stage){ toast('Esta escena no tiene foto'); return; }
    const img = curImg();
    const ins = document.createElement('div'); ins.className = 'inset rgt'; ins.setAttribute('data-anim','');
    ins.style.cssText = 'top:30%;width:300px';
    const ilab = document.createElement('span'); ilab.className = 'ilab'; ilab.textContent = 'Etiqueta';
    const im = document.createElement('img');
    if(img){ im.src = img.src; const ref = imgRef(img); if(ref) im.dataset.edExportSrc = ref; }
    ins.appendChild(ilab); ins.appendChild(im);
    stage.appendChild(ins);
    applyEditable(ins, true);
    select(ins);
    toast('Viñeta agregada · cambiale la foto desde el panel');
  }
  function addConn(){
    const stage = ensureStage(); if(!stage){ toast('Esta escena no tiene foto'); return; }
    const c = document.createElement('div'); c.className = 'conn'; c.setAttribute('data-anim','');
    c.style.cssText = 'left:60%;top:40%;width:30%';
    setConnAngle(c, 0);
    stage.appendChild(c);
    select(c);
    toast('Conector agregado · elegí la dirección en el panel');
  }
  function addScene(){
    const list = scenesList();
    const ref = list[curIdx];
    const img = curImg();
    const sec = document.createElement('section');
    sec.className = 'scene'; sec.setAttribute('data-dur','15');
    sec.innerHTML =
      '<div class="eyebrow" data-anim>Título corto</div>'+
      '<div class="frame" data-anim><img alt="">'+
      '<div class="callout" data-anim style="left:32%;top:32%;width:28%;height:22%"><span class="lab">Texto</span></div></div>'+
      '<p class="cap" data-anim>Descripción de la escena.</p>';
    const nimg = sec.querySelector('img');
    if(img){ nimg.src = img.src; const r = imgRef(img); if(r) nimg.dataset.edExportSrc = r; }
    ref.after(sec);
    applyEditable(sec, true);
    if(window.GPIDeck && GPIDeck.refresh) GPIDeck.refresh();
    showScene(curIdx + 1);
    toast('Escena nueva agregada después de la actual');
  }

  /* ---------------- texto editable (caption, títulos) ---------------- */
  const EDITABLE_SEL = '.cap, .scene--title .sub, .scene--title h1, .eyebrow, .chip, .ilab';
  function applyEditable(root, on){
    root.querySelectorAll(EDITABLE_SEL).forEach(n=>{
      if(on) n.setAttribute('contenteditable','true'); else n.removeAttribute('contenteditable');
    });
    // si root mismo matchea
    if(root.matches && root.matches(EDITABLE_SEL)){ on ? root.setAttribute('contenteditable','true') : root.removeAttribute('contenteditable'); }
  }
  function setEditableAll(on){ scenesList().forEach(s=>applyEditable(s,on)); }

  /* ---------------- navegación de escenas ---------------- */
  function showScene(i){
    const list = scenesList(); if(i<0 || i>=list.length) return;
    list.forEach(s=>s.classList.remove('active'));
    list[i].classList.add('active');
    curIdx = i; deselect(); updateNav();
    window.scrollTo({top:0});
  }
  function updateNav(){
    const n = document.getElementById('gpiEdNav');
    if(n) n.textContent = String(curIdx+1).padStart(2,'0') + ' / ' + String(scenesList().length).padStart(2,'0');
  }

  /* ---------------- exportar ---------------- */
  function escAttr(s){ return (s||'').replace(/"/g,'&quot;'); }
  function cleanHead(){
    return [...document.head.children].filter(n=>{
      const ref = (n.getAttribute && (n.getAttribute('href')||n.getAttribute('src'))) || '';
      return !/editor\.(css|js)/.test(ref);
    }).map(n=>n.outerHTML).join('\n');
  }
  function bodyAttrs(){
    const b = document.body, keep = ['data-section','data-tag','data-home','data-avsa'];
    return keep.filter(a=>b.hasAttribute(a)).map(a=>`${a}="${escAttr(b.getAttribute(a))}"`).join(' ');
  }
  function cleanScene(scene){
    const c = scene.cloneNode(true);
    c.classList.remove('active','gpi-ed-sel');
    c.querySelectorAll('.gpi-ed-handle,.gpi-ed-readout').forEach(n=>n.remove());
    c.querySelectorAll('.in,.active,.gpi-ed-sel').forEach(n=>n.classList.remove('in','active','gpi-ed-sel'));
    c.querySelectorAll('[contenteditable]').forEach(n=>n.removeAttribute('contenteditable'));
    c.querySelectorAll('img').forEach(img=>{ if(img.dataset.edExportSrc) img.setAttribute('src', img.dataset.edExportSrc); });
    c.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{ if(a.name.indexOf('data-ed')===0) n.removeAttribute(a.name); }));
    return c.outerHTML;
  }
  function buildDoc(){
    const scenes = scenesList().map(cleanScene).join('\n\n');
    return '<!DOCTYPE html><html lang="es"><head>\n'+cleanHead()+'\n</head>\n<body '+bodyAttrs()+'>\n\n'+
           scenes+'\n\n<script src="../engine/deck.js"><\/script>\n</body></html>\n';
  }
  function download(){
    const blob = new Blob([buildDoc()], {type:'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (location.pathname.split('/').pop() || 'demo.html');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 3000);
    toast('HTML descargado · reemplazá con él el archivo del demo');
  }
  /* ---------------- persistencia: autoguardado + guardar en archivo ---------------- */
  const LSKEY = 'gpi-edit:' + location.pathname;
  function snapshot(){ return scenesList().map(cleanScene).join('\n\n'); }
  let autosaveOn = false, mo = null, saveT = null, quotaWarned = false;
  function autosave(){
    if(!autosaveOn) return;
    try{ localStorage.setItem(LSKEY, JSON.stringify({ when: Date.now(), html: snapshot() })); }
    catch(e){ if(!quotaWarned){ quotaWarned = true; toast('Autoguardado lleno (imágenes pesadas) · usá “Guardar en archivo”'); } }
  }
  function startAutosave(){
    autosaveOn = true;
    if(!mo) mo = new MutationObserver(()=>{ if(!autosaveOn) return; clearTimeout(saveT); saveT = setTimeout(autosave, 700); });
    mo.observe(document.body, { subtree:true, childList:true, attributes:true, characterData:true, attributeFilter:['style','class'] });
  }
  function stopAutosave(){ autosaveOn = false; if(mo) mo.disconnect(); clearTimeout(saveT); }
  function readSaved(){ try{ return JSON.parse(localStorage.getItem(LSKEY) || 'null'); }catch(e){ return null; } }
  function restoreSnapshot(html){
    deselect();
    const cont = document.createElement('div'); cont.innerHTML = html;
    const fresh = [...cont.querySelectorAll('.scene')]; if(!fresh.length) return;
    const old = scenesList(), ref = old[0];
    fresh.forEach(s=>ref.parentNode.insertBefore(s, ref));
    old.forEach(s=>s.remove());
    if(window.GPIDeck && GPIDeck.refresh) GPIDeck.refresh();
    setEditableAll(true);
    showScene(0);
    toast('Cambios restaurados');
  }
  function maybeOfferRestore(){
    const saved = readSaved();
    if(saved && saved.html && saved.html !== snapshot()){
      const dt = new Date(saved.when);
      document.getElementById('gpiRestoreTxt').textContent =
        'Hay cambios sin guardar de las ' + dt.toLocaleTimeString() + '. ¿Restaurar?';
      restoreBar.style.display = 'flex';
      // no arrancar el autoguardado hasta resolver, para no pisar el snapshot
    } else { startAutosave(); }
  }
  document.getElementById('gpiRestoreYes').onclick = ()=>{
    const s = readSaved(); restoreBar.style.display = 'none';
    if(s && s.html) restoreSnapshot(s.html);
    startAutosave();
  };
  document.getElementById('gpiRestoreNo').onclick = ()=>{
    restoreBar.style.display = 'none';
    try{ localStorage.removeItem(LSKEY); }catch(e){}
    startAutosave();
  };

  let fileHandle = null;
  async function saveToFile(){
    const html = buildDoc();
    if(window.showSaveFilePicker){
      try{
        if(!fileHandle){
          fileHandle = await window.showSaveFilePicker({
            suggestedName: location.pathname.split('/').pop() || 'demo.html',
            types: [{ description:'HTML', accept:{ 'text/html':['.html'] } }]
          });
        }
        const w = await fileHandle.createWritable(); await w.write(html); await w.close();
        try{ localStorage.removeItem(LSKEY); }catch(e){}
        toast('Guardado en el archivo ✓ — ya es definitivo');
        return;
      }catch(e){
        if(e && e.name === 'AbortError') return;        // canceló el diálogo
        toast('El navegador no deja escribir el archivo · te descargo una copia');
      }
    } else {
      toast('Tu navegador no soporta guardado directo · te descargo una copia');
    }
    download();   // fallback: descargás y reemplazás el archivo a mano
  }

  function copyScene(){
    const txt = cleanScene(scenesList()[curIdx]);
    const done = ()=>toast('Escena copiada al portapapeles');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done).catch(()=>fallbackCopy(txt,done));
    } else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done){
    const ta = document.createElement('textarea'); ta.value = txt;
    ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('No pude copiar — usá Descargar HTML'); }
    ta.remove();
  }

  /* ---------------- barra: acciones ---------------- */
  bar.addEventListener('click', e=>{
    const b = e.target.closest('[data-act]'); if(!b) return;
    switch(b.dataset.act){
      case 'prev': showScene(curIdx-1); break;
      case 'next': showScene(curIdx+1); break;
      case 'add-green': addBox('green'); break;
      case 'add-alert': addBox('alert'); break;
      case 'add-warn':  addBox('warn'); break;
      case 'add-click': addBox('click'); break;
      case 'add-inset': addInset(); break;
      case 'add-conn':  addConn(); break;
      case 'photo': pickPhoto(ensureFrameImg()); break;
      case 'del-photo': delPhoto(); break;
      case 'add-scene': addScene(); break;
      case 'copy': copyScene(); break;
      case 'download': download(); break;
      case 'save': saveToFile(); break;
      case 'exit': exitEdit(); break;
    }
  });

  /* ---------------- interacción global (seleccionar / arrastrar) ---------------- */
  document.addEventListener('pointerdown', e=>{
    if(!editing) return;
    if(e.target.closest('.gpi-ed-bar, .gpi-ed-panel')) return;
    if(e.target.classList && e.target.classList.contains('gpi-ed-handle')) return; // su propio listener
    const el = e.target.closest('.callout, .clickbox, .inset, .conn');
    if(el){
      select(el);
      if(e.target.closest('.lab, .ilab')) return; // editar texto, no arrastrar
      startDrag(el, e, 'move');
    } else if(!e.target.closest('[contenteditable]')){
      deselect();
    }
  });

  window.addEventListener('keydown', e=>{
    if(!editing) return;
    const t = e.target;
    const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if(typing) return;   // la tecla E la maneja el motor (deck.js)
    if(!sel){
      if(e.key === 'ArrowRight'){ e.preventDefault(); showScene(curIdx+1); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); showScene(curIdx-1); }
      return;
    }
    const step = e.shiftKey ? 1 : 0.2;
    const g = gBase(sel); if(!g) return;
    const isInset = sel.classList.contains('inset');
    if(e.key === 'ArrowLeft'){ e.preventDefault(); if(!isInset) sel.style.left = (g.left-step).toFixed(2)+'%'; }
    else if(e.key === 'ArrowRight'){ e.preventDefault(); if(!isInset) sel.style.left = (g.left+step).toFixed(2)+'%'; }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sel.style.top = (g.top-step).toFixed(2)+'%'; }
    else if(e.key === 'ArrowDown'){ e.preventDefault(); sel.style.top = (g.top+step).toFixed(2)+'%'; }
    else if(e.key === 'Delete'){ e.preventDefault(); sel.remove(); deselect(); }
    else if(e.key === 'Escape'){ e.preventDefault(); deselect(); }
    readout(sel); syncNums(sel);
  });

  /* ---------------- pegar imagen (Ctrl+V) ---------------- */
  window.addEventListener('paste', e=>{
    if(!editing) return;
    const items = e.clipboardData && e.clipboardData.items; if(!items) return;
    for(const it of items){
      if(it.type && it.type.indexOf('image') === 0){
        const blob = it.getAsFile(); if(!blob) continue;
        const target = (sel && sel.classList.contains('inset')) ? sel.querySelector('img') : ensureFrameImg();
        applyImageBlob(blob, target);
        e.preventDefault();
        return;
      }
    }
  });

  /* ---------------- entrar / salir ---------------- */
  function enterEdit(){
    editing = true;
    document.body.classList.add('gpi-edit');
    GPIDeck.setEditMode(true);
    curIdx = Math.max(0, GPIDeck.current);
    setEditableAll(true);
    showScene(curIdx);
    bar.style.display = 'flex';
    maybeOfferRestore();   // ofrece recuperar cambios sin guardar y arranca el autoguardado
    toast('Modo editor · arrastrá los recuadros, editá los textos. <b>E</b> para salir.');
  }
  function exitEdit(){
    editing = false; deselect();
    stopAutosave(); restoreBar.style.display = 'none';
    setEditableAll(false);
    document.body.classList.remove('gpi-edit');
    bar.style.display = 'none';
    GPIDeck.setEditMode(false);
    GPIDeck.enter(Math.min(curIdx, GPIDeck.total - 1));
    toast('Saliste del editor');
  }
  window.addEventListener('gpi-edit-toggle', ()=>{ editing ? exitEdit() : enterEdit(); });

  enterEdit(); // al cargarse por primera vez, entra directo
})();
