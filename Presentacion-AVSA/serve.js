/* ============================================================
   GPI · Servidor local de edición de demos
   - Sirve la carpeta Presentacion-AVSA en http://localhost:8123
   - Endpoint POST /__save?path=/demos/xx.html → sobrescribe ESE .html
   Así el botón "Guardar en archivo" del editor actualiza el demo real
   (cosa que file:// no permite). Sin dependencias: node serve.js
   ============================================================ */
const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// IPs de esta máquina en la red local (para abrir desde otra compu)
function lanIPs(){
  const out = [];
  const ifaces = os.networkInterfaces();
  for(const name in ifaces){
    for(const i of ifaces[name]){ if(i.family === 'IPv4' && !i.internal) out.push(i.address); }
  }
  return out;
}

const ROOT = __dirname;                 // carpeta Presentacion-AVSA
const PORT = process.env.PORT || 8123;
const TYPES = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif':'image/gif', '.svg':'image/svg+xml', '.webp':'image/webp', '.ico':'image/x-icon'
};

// resuelve una ruta web a un archivo dentro de ROOT (bloquea path traversal)
function safe(webPath){
  const fp = path.normalize(path.join(ROOT, decodeURIComponent(webPath)));
  if(fp !== ROOT && !fp.startsWith(ROOT + path.sep)) return null;
  return fp;
}

const server = http.createServer((req, res)=>{
  const u = new URL(req.url, 'http://localhost');

  // --- guardar: sobrescribe el .html real ---
  if(req.method === 'POST' && u.pathname === '/__save'){
    const fp = safe(u.searchParams.get('path') || '');
    if(!fp || path.extname(fp).toLowerCase() !== '.html'){
      res.writeHead(400); res.end('ruta inválida'); return;
    }
    let body = '';
    req.on('data', c => { body += c; if(body.length > 50 * 1024 * 1024) req.destroy(); });
    req.on('end', ()=>{
      fs.writeFile(fp, body, 'utf8', err=>{
        if(err){ console.error('save error', err); res.writeHead(500); res.end('error'); }
        else { console.log('guardado →', path.relative(ROOT, fp)); res.writeHead(200, {'Access-Control-Allow-Origin':'*'}); res.end('ok'); }
      });
    });
    return;
  }

  // --- estáticos ---
  let webPath = u.pathname === '/' ? '/demos/index.html' : u.pathname;
  const fp = safe(webPath);
  if(!fp){ res.writeHead(403); res.end('prohibido'); return; }
  fs.readFile(fp, (err, data)=>{
    if(err){ res.writeHead(404); res.end('no encontrado: ' + webPath); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'   // siempre la última versión del archivo
    });
    res.end(data);
  });
});

// chequeo de cordura: ¿está la carpeta de demos donde esperamos?
if(!fs.existsSync(path.join(ROOT, 'demos', 'index.html'))){
  console.error('\n  ⚠ No encuentro "demos/index.html" en:\n    ' + ROOT +
    '\n  Asegurate de que serve.js esté dentro de la carpeta "Presentacion-AVSA".\n');
}

server.listen(PORT, '0.0.0.0', ()=>{
  console.log('\n  GPI · editor de demos corriendo');
  console.log('  Sirviendo:         ' + ROOT);
  console.log('  En ESTA compu:     http://localhost:' + PORT + '/demos/index.html');
  lanIPs().forEach(ip => console.log('  Desde otra compu:  http://' + ip + ':' + PORT + '/demos/index.html'));
  console.log('  (Ctrl+C para detener · firewall: permitir Node en la red local)\n');
});
