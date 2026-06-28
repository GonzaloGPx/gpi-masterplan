/* ============================================================
   GPI · Sidebar de navegación entre módulos
   Lo carga deck.js. Construye el menú estilo plataforma GPI,
   resalta el demo actual y permite saltar de uno a otro.
   ============================================================ */
(function(){
  if(window.__GPI_NAV__) return; window.__GPI_NAV__ = true;

  const ICON = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h13v14H6a2 2 0 0 1-2-2V5z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M8 9h6M8 13h6M8 17h4"/></svg>',
    cal:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c0-3 2.8-5 6.2-5s6.2 2 6.2 5"/><path d="M16.2 5.6a3.1 3.1 0 0 1 0 5.7M21.4 20c0-2.3-1.1-4-2.8-4.8"/></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><line x1="6" y1="20" x2="6" y2="11"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="14"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.6 6.3a1 1 0 0 0 0 1.4l1.7 1.7a1 1 0 0 0 1.4 0l3.6-3.6a6 6 0 0 1-7.9 7.9l-6.3 6.3a2.1 2.1 0 0 1-3-3l6.3-6.3a6 6 0 0 1 7.9-7.9l-3.7 3.5z"/></svg>'
  };

  // [etiqueta, archivo, icono] — el orden y los nombres siguen la plataforma GPI
  const MODS = [
    ['Dashboard',             '01-dashboard.html',             ICON.dash],
    ['Novedades',             '02-novedades.html',             ICON.news],
    ['Agenda',                '03-agenda.html',                ICON.cal],
    ['Clientes 360',          '04-clientes-360.html',          ICON.users],
    ['Practice Intelligence', '05-business-intelligence.html', ICON.bars],
    ['Herramientas',          '06-herramientas.html',          ICON.tool]
  ];

  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const avsa = (document.body.dataset && document.body.dataset.avsa) || '../assets/logo-avsa.png';

  const nav = document.createElement('aside');
  nav.className = 'gpi-nav';
  nav.innerHTML =
    '<div class="brand"><span class="dot"></span><b>GPI</b></div>' +
    '<div class="sep"></div>' +
    '<div class="items">' +
      MODS.map(([label, file, ico])=>{
        const active = (file.toLowerCase() === here) ? ' active' : '';
        return '<a class="item' + active + '" href="./' + file + '">' +
                 '<span class="ico">' + ico + '</span>' +
                 '<span class="lbl">' + label + '</span>' +
                 '<span class="chev">›</span>' +
               '</a>';
      }).join('') +
    '</div>' +
    '<div class="spacer"></div>' +
    '<div class="foot"><span class="av">hecho para</span><img src="' + avsa + '" alt="Argentina Valores"></div>';
  document.body.appendChild(nav);
  document.body.classList.add('gpi-nav-on');

  // colapsar / expandir (recordado por sesión)
  const tog = document.createElement('button');
  tog.className = 'gpi-nav-toggle'; tog.title = 'Mostrar / ocultar menú';
  document.body.appendChild(tog);
  const KEY = 'gpi-nav-collapsed';
  function read(){ try{ return localStorage.getItem(KEY) === '1'; }catch(e){ return false; } }
  function apply(c){ document.body.classList.toggle('gpi-nav-collapsed', c); tog.textContent = c ? '»' : '«'; }
  apply(read());
  tog.onclick = ()=>{
    const c = !document.body.classList.contains('gpi-nav-collapsed');
    apply(c);
    try{ localStorage.setItem(KEY, c ? '1' : '0'); }catch(e){}
  };
})();
