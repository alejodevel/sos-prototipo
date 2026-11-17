/* SOS · lógica común del sitio y del panel (prototipo) */
(function () {
  const S = window.SOS;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const J = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const fmt = n => '$' + Math.round(n).toLocaleString('es-CL');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (n, c) => `<svg class="i ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  S.util = { $, $$, J, W, fmt, esc, ico, slug };

  /* ---------- datos: ediciones hechas desde el panel (demo en este navegador) ---------- */
  const catName = {}; S.CATS.forEach(c => { catName[c.id] = c.nombre; c.hijos.forEach(h => catName[h.id] = h.nombre); }); S.catName = catName;
  function applyEdits() {
    const nuevos = J('sos_nuevos', []); const ed = J('sos_edits', {});
    S.productos = S.productos_base.concat(nuevos).filter(p => !(ed[p.id] && ed[p.id].eliminado)).map(p => ed[p.id] ? Object.assign({}, p, ed[p.id]) : p);
    S.productos.forEach(p => { if (!p.slug) p.slug = slug(p.nombre + '-' + p.id); p.marca_slug = slug(p.marca); });
    S.byId = {}; S.bySlug = {}; S.productos.forEach(p => { S.byId[p.id] = p; S.bySlug[p.slug] = p; });
    const lo = J('sos_locales', {}); S.locales.forEach(l => { if (lo[l.id]) Object.assign(l, lo[l.id]); });
  }
  S.productos_base = S.productos_base || S.productos; applyEdits(); S.applyEdits = applyEdits;
  S.marcasList = () => { const m = {}; S.productos.forEach(p => { m[p.marca_slug] = m[p.marca_slug] || { slug: p.marca_slug, nombre: p.marca, total: 0 }; m[p.marca_slug].total++; }); return Object.values(m).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre)); };
  S.portada = Object.assign({ avisos: ['Retira en tienda · Puerto Montt y Puerto Varas', 'Despacho a todo Chile', 'Arma tu selección y te confirmamos disponibilidad', 'Ofertas de la semana en uñas y color'], h1: 'Tu rescate de color y belleza', lead: 'Insumos profesionales de color, uñas y cuidado capilar. Para tu salón y para ti.' }, J('sos_portada', {}));

  /* ---------- ilustraciones de producto (marcadores hasta tener fotos reales) ---------- */
  const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const PAL = ['#d9cfc3', '#cdd6cf', '#cfd3de', '#e0cfd3', '#dfd8bd', '#c9dade'];
  function art(p, sm) {
    if (p.foto) { const src = sm && /assets\/fotos\/productos\/.+\.webp$/.test(p.foto) ? p.foto.replace(/\.webp$/, '-s.webp') : p.foto; return `<img src="${src}" alt="${sm ? '' : esc(p.nombre)}" width="${sm ? 440 : 800}" height="${sm ? 440 : 800}" loading="lazy" decoding="async">`; }
    const h = hash(p.marca || 'x'), body = PAL[h % 6], tone = p.tonos && p.tonos[0] ? p.tonos[0].hex : null;
    const lab = esc((p.marca || '').toUpperCase().replace('PROFESSIONALS', 'PROF.').replace('PROFESSIONNEL', 'PROF.').slice(0, 13)), linea = esc(((p.linea || p.nombre.split('·')[0]) + '').trim().slice(0, 17));
    const code = p.tonos && p.tonos[0] ? esc(p.tonos[0].codigo) : '';
    const g = '<rect fill="#fff" opacity=".16" ';
    const t = (x, y, s, w, sz, f, ls) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="inherit" font-weight="${w}" font-size="${sz}" letter-spacing="${ls || 1}" fill="${f}">${s}</text>`;
    let o = '';
    switch (p.ilustracion) {
      case 'tubo': o = `<rect x="68" y="24" width="64" height="12" fill="#d8d3ca"/><path d="M62 36h76l-6 130H68z" fill="#f6f3ee" stroke="rgba(0,0,0,.2)"/><rect x="76" y="166" width="48" height="18" fill="${tone || '#222'}" stroke="rgba(0,0,0,.25)"/>${t(100, 66, lab, 600, 8.5, '#111', 1.6)}${t(100, 80, linea, 400, 7, '#555', .6)}<rect x="78" y="96" width="44" height="5" fill="${tone || body}"/>${t(100, 134, code || '·', 300, 24, '#111', 0)}${g}x="66" y="38" width="10" height="126"/>`; break;
      case 'botella': o = `<rect x="62" y="88" width="76" height="102" fill="${body}" stroke="rgba(0,0,0,.18)"/><rect x="90" y="72" width="20" height="16" fill="#cfcac2"/><rect x="84" y="52" width="32" height="20" fill="#202020"/><rect x="112" y="57" width="20" height="6" fill="#202020"/><rect x="68" y="112" width="64" height="62" fill="#fff" opacity=".93"/>${t(100, 136, lab, 600, 8, '#111', 1.4)}${t(100, 150, linea, 400, 6.6, '#666', .5)}<rect x="86" y="160" width="28" height="3" fill="${tone || '#222'}"/>${g}x="64" y="90" width="9" height="98"/>`; break;
      case 'gotero': o = `<rect x="72" y="100" width="56" height="88" fill="#b78a52" stroke="rgba(0,0,0,.2)"/><rect x="88" y="84" width="24" height="16" fill="#202020"/><rect x="90" y="52" width="20" height="32" fill="#2c2c2c"/><rect x="77" y="122" width="46" height="46" fill="#fff" opacity=".93"/>${t(100, 142, lab, 600, 6.4, '#111', 1)}${t(100, 154, linea, 400, 5.4, '#666', .4)}${g}x="74" y="102" width="8" height="84"/>`; break;
      case 'spray': o = `<rect x="66" y="82" width="68" height="106" fill="${body}" stroke="rgba(0,0,0,.18)"/><rect x="88" y="66" width="24" height="16" fill="#cfcac2"/><rect x="84" y="46" width="32" height="20" fill="#202020"/><rect x="112" y="50" width="18" height="6" fill="#202020"/><rect x="72" y="108" width="56" height="56" fill="#fff" opacity=".93"/>${t(100, 130, lab, 600, 7.6, '#111', 1.2)}${t(100, 143, linea, 400, 6, '#666', .4)}${g}x="68" y="84" width="9" height="102"/>`; break;
      case 'esmalte': o = `<rect x="76" y="106" width="48" height="78" fill="${tone || body}" stroke="rgba(0,0,0,.28)"/><rect x="90" y="96" width="20" height="10" fill="#d0ccc4"/><rect x="85" y="38" width="30" height="58" fill="#161616"/>${g}x="79" y="109" width="7" height="72"/><rect x="80" y="140" width="40" height="22" fill="#fff" opacity=".85"/>${t(100, 154, lab.slice(0, 10), 600, 5.6, '#111', .8)}`; break;
      case 'lampara': o = `<path d="M38 150Q100 28 162 150z" fill="#f1eee9" stroke="rgba(0,0,0,.22)"/><path d="M62 150Q100 78 138 150z" fill="${tone || '#b36bd1'}" opacity=".35"/><rect x="32" y="150" width="136" height="16" fill="#202020"/>${t(100, 162, lab, 600, 7, '#fff', 1.6)}`; break;
      case 'secador': o = `<polygon points="36,62 140,54 140,108 36,100" fill="#262626"/><rect x="140" y="58" width="16" height="46" fill="#555"/><polygon points="76,102 108,104 100,176 72,176" fill="#262626"/><rect x="36" y="76" width="104" height="6" fill="${tone || '#d4a93c'}"/>${t(88, 94, lab.slice(0, 11), 600, 6.4, '#ddd', 1.2)}<rect x="40" y="62" width="100" height="10" fill="#fff" opacity=".1"/>`; break;
      case 'plancha': o = `<g transform="rotate(-18 100 104)"><rect x="66" y="28" width="30" height="148" fill="#1d1d1d"/><rect x="100" y="28" width="30" height="148" fill="#2b2b2b"/><rect x="70" y="28" width="22" height="70" fill="#7a7a7a"/><rect x="104" y="28" width="22" height="70" fill="#8a8a8a"/><rect x="66" y="130" width="64" height="6" fill="${tone || '#d4a93c'}"/></g>`; break;
      case 'labial': o = `<rect x="80" y="112" width="40" height="70" fill="#1a1a1a"/><rect x="80" y="92" width="40" height="20" fill="#c9a85a"/><polygon points="86,92 86,56 114,42 114,92" fill="${tone || '#b4172b'}"/>${g}x="82" y="114" width="6" height="66"/>`; break;
      case 'herramienta': o = `<rect x="86" y="34" width="28" height="96" fill="#3a2f2a"/><rect x="74" y="130" width="52" height="38" fill="#d7c9b5"/>` + [80, 86, 92, 98, 104, 110, 116, 122].map(x => `<line x1="${x}" y1="130" x2="${x}" y2="168" stroke="#a89a85"/>`).join('') + `<rect x="86" y="86" width="28" height="8" fill="${tone || '#c9a85a'}"/>${g}x="88" y="36" width="6" height="92"/>`; break;
      default: o = `<rect x="58" y="76" width="84" height="22" fill="#202020"/><rect x="62" y="98" width="76" height="88" fill="${body}" stroke="rgba(0,0,0,.18)"/><rect x="68" y="116" width="64" height="52" fill="#fff" opacity=".93"/>${t(100, 138, lab, 600, 7.6, '#111', 1.2)}${t(100, 151, linea, 400, 6, '#666', .4)}<rect x="86" y="158" width="28" height="3" fill="${tone || '#222'}"/>${g}x="64" y="100" width="9" height="84"/>`;
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(p.nombre)}" preserveAspectRatio="xMidYMid meet"><circle cx="100" cy="106" r="84" fill="${tone || body}" opacity=".16"/><ellipse cx="100" cy="188" rx="54" ry="5" fill="#000" opacity=".1"/>${o}</svg>`;
  }
  S.art = art;
  S.waLink = txt => `https://wa.me/${S.empresa.whatsapp}?text=${encodeURIComponent(txt)}`;
  const BADGE = { 'oferta': 'Oferta', 'nuevo': 'Nuevo', 'mas-vendido': 'Más vendido', 'salon': 'Para tu salón' };
  S.card = function (p) {
    const dots = p.tonos && p.tonos.length > 1 ? `<div class="dots">${p.tonos.slice(0, 6).map(t => `<i style="background:${t.hex}" title="${esc(t.nombre)}"></i>`).join('')}${p.tonos.length > 6 ? `<small>+${p.tonos.length - 6}</small>` : ''}</div>` : (p.tonos && p.tonos.length ? `<div class="dots"><i style="background:${p.tonos[0].hex}"></i><small>${esc(p.tonos[0].nombre)}</small></div>` : '<div class="dots"></div>');
    const bd = p.agotado ? '<span class="badge badge--agotado">Agotado</span>' : '';
    const bl = p.etiqueta ? `<span class="badge ${p.etiqueta === 'oferta' ? 'badge--oferta' : ''}">${BADGE[p.etiqueta]}</span>` : '';
    return `<article class="card" data-id="${p.id}"><a class="card__art" href="producto.html?p=${p.slug}" aria-label="${esc(p.nombre)}">${bl}${bd}${art(p, true)}</a><div class="card__b"><span class="card__brand">${esc(p.marca)}</span><a class="card__name" href="producto.html?p=${p.slug}">${esc(p.nombre)}</a><span class="card__meta">${esc(p.presentacion)}</span>${dots}<div class="price ${p.oferta ? 'price--o' : ''}">${fmt(p.precio)}${p.oferta && p.precio_antes ? `<s>${fmt(p.precio_antes)}</s>` : ''}</div><button class="btn btn--pri btn--blk" data-add="${p.id}" ${p.agotado ? 'disabled' : ''}>${ico('plus')}${p.agotado ? 'Agotado' : 'Agregar'}</button></div></article>`;
  };

  /* ---------- toast ---------- */
  let tt; S.toast = (msg, undo) => { let el = $('.toast'); if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); } el.innerHTML = `<span>${msg}</span>${undo ? '<button>Deshacer</button>' : ''}`; if (undo) el.querySelector('button').onclick = () => { undo(); el.classList.remove('on'); }; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), undo ? 6000 : 2400); };

  /* ---------- Mi selección (consulta por WhatsApp) ---------- */
  const sel = { get: () => J('sos_sel', []), set: v => { W('sos_sel', v); sel.ui(); } };
  sel.add = (id, qty, tono) => { const a = sel.get(); const k = a.find(x => x.id === id && x.tono === tono); if (k) k.qty += qty || 1; else a.push({ id, qty: qty || 1, tono }); sel.set(a); };
  sel.ui = () => {
    const a = sel.get().filter(x => S.byId[x.id]); const n = a.reduce((s, x) => s + x.qty, 0); $$('[data-selcount]').forEach(e => { e.textContent = n; e.dataset.z = n; });
    const b = $('#selb'); if (!b) return;
    if (!a.length) { b.innerHTML = `<div class="empty"><img class="iso spin" src="assets/logo/sos-isotipo.svg" alt="">Tu selección está vacía.<br>Agrega productos y envíanos tu consulta por WhatsApp.</div>`; $('#self').style.display = 'none'; return; }
    $('#self').style.display = '';
    b.innerHTML = a.map((x, i) => { const p = S.byId[x.id]; const tn = x.tono != null && p.tonos[x.tono] ? p.tonos[x.tono] : null; return `<div class="it"><div class="it__a">${art(tn ? Object.assign({}, p, { tonos: [tn] }) : p)}</div><div class="it__n">${esc(p.nombre)}<small>${esc(p.marca)}${tn ? ' · ' + esc(tn.nombre) : ''} · ${fmt(p.precio)}</small></div><div class="qty"><button data-q="${i}" data-d="-1" aria-label="Menos">−</button><span>${x.qty}</span><button data-q="${i}" data-d="1" aria-label="Más">+</button></div></div>`; }).join('');
    const tot = a.reduce((s, x) => s + S.byId[x.id].precio * x.qty, 0); $('#selt').textContent = fmt(tot);
    const nombre = ($('#selname') || {}).value || '';
    const lines = a.map(x => { const p = S.byId[x.id], tn = x.tono != null && p.tonos[x.tono] ? p.tonos[x.tono] : null; return `• ${x.qty} × ${p.nombre} (${p.marca}${tn ? ' · tono ' + tn.nombre : ''}) — ${fmt(p.precio)}`; }).join('\n');
    $('#selwa').href = S.waLink(`Hola, soy ${nombre.trim() || '[mi nombre]'}. Quiero consultar por estos productos:\n\n${lines}\n\nTotal referencial: ${fmt(tot)}\n\n¿Me confirman disponibilidad, precio final y cómo retirar o recibir? Gracias.`);
  };
  function drawer() {
    if ($('#sel')) return;
    document.body.insertAdjacentHTML('beforeend', `<div class="ov" id="selov"></div><aside class="drw" id="sel" aria-label="Mi selección"><div class="drw__h"><h3>Mi selección</h3><button class="ibtn" data-selclose aria-label="Cerrar">${ico('x')}</button></div><div class="drw__b" id="selb"></div><div class="drw__f" id="self"><label class="form" style="display:grid"><input class="fin" id="selname" placeholder="Tu nombre (opcional)"></label><div class="tot"><div>Total referencial<small>Te confirmamos disponibilidad, precio final y cómo retirar o recibir.</small></div><span id="selt"></span></div><a class="btn btn--wa btn--blk" id="selwa" target="_blank" rel="noopener" title="Se abre WhatsApp">${ico('wa', 'i--f')} Enviar consulta por WhatsApp</a></div></aside>`);
    const close = () => { $('#sel').classList.remove('on'); $('#selov').classList.remove('on'); };
    $('#selov').onclick = close; $('[data-selclose]').onclick = close; $('#selname').oninput = sel.ui;
    $('#selb').onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; const a = sel.get(); const it = a[+b.dataset.q]; it.qty += +b.dataset.d; sel.set(a.filter(x => x.qty > 0)); };
    sel.open = () => { sel.ui(); $('#sel').classList.add('on'); $('#selov').classList.add('on'); };
  }
  drawer(); sel.ui(); S.sel = sel;
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); const p = S.byId[a.dataset.add]; sel.add(a.dataset.add, 1, a.dataset.tono != null ? +a.dataset.tono : (p.tonos.length === 1 ? 0 : undefined)); S.toast(`${esc(p.nombre)} agregado a tu selección`); }
    if (e.target.closest('[data-selopen]')) { e.preventDefault(); sel.open(); }
  });

  /* ---------- botón Estilo ---------- */
  const ST0 = { forma: 'rectas', pal: 'mono', fuente: 'jost', dens: 'compacta', mov: 'on' };
  const stGet = () => Object.assign({}, ST0, J('sos_estilo', {}), { dens: 'compacta', mov: 'on' });
  const stApply = s => { Object.keys(s).forEach(k => document.documentElement.dataset[k] = s[k]); W('sos_estilo', s); };
  function estilo() {
    const o = [['Forma', 'forma', [['rectas', 'Ángulos rectos'], ['suave', 'Suave'], ['pildora', 'Píldora']]], ['Paleta', 'pal', [['mono', 'Monocromo', '#0c0c0c'], ['rosa', 'Rosa palo', '#b0174e'], ['salvia', 'Salvia', '#2f5d4a'], ['burdeos', 'Burdeos', '#6e1530'], ['noche', 'Noche', '#161618']]], ['Tipografía', 'fuente', [['jost', 'Jost'], ['outfit', 'Outfit'], ['urbanist', 'Urbanist'], ['questrial', 'Questrial']]]];
    document.body.insertAdjacentHTML('beforeend', `<button class="stbtn" id="stb" aria-expanded="false">${ico('brush')} Estilo</button><div class="stp" id="stp"><div class="stp__t"><span>Estilo del sitio</span><button class="ibtn" id="stx" aria-label="Cerrar" style="width:30px;height:30px;font-size:16px">${ico('x')}</button></div>${o.map(([t, k, v]) => `<h5>${t}</h5><div class="opts" data-k="${k}">${v.map(x => `<button class="opt" data-v="${x[0]}" ${k === 'fuente' ? `style="font-family:'${x[1]}'"` : ''}>${x[2] ? `<i style="background:${x[2]}"></i>` : ''}${x[1]}</button>`).join('')}</div>`).join('')}<button class="reset" id="str">Volver al estilo original</button></div>`);
    const mark = () => { const s = stGet(); $$('#stp .opts').forEach(g => $$('.opt', g).forEach(b => b.classList.toggle('on', s[g.dataset.k] === b.dataset.v))); };
    $('#stb').onclick = () => { const p = $('#stp'); p.classList.toggle('on'); $('#stb').setAttribute('aria-expanded', p.classList.contains('on')); };
    $('#stx').onclick = () => $('#stp').classList.remove('on');
    $('#stp').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; const s = stGet(); s[b.parentNode.dataset.k] = b.dataset.v; stApply(s); mark(); };
    $('#str').onclick = () => { stApply(Object.assign({}, ST0)); mark(); };
    stApply(stGet()); mark();
  }
  estilo();

  /* ---------- cabecera ---------- */
  const bar = $('.bar span'); if (bar) { const av = S.portada.avisos.filter(Boolean); let i = 0; bar.textContent = av[0] || ''; if (av.length > 1) setInterval(() => { bar.style.opacity = 0; setTimeout(() => { i = (i + 1) % av.length; bar.textContent = av[i]; bar.style.opacity = 1; }, 350); }, 4200); }
  const mn = $('#mnav'); if (mn) { $('#burger').onclick = () => mn.classList.add('on'); $('#mnx').onclick = () => mn.classList.remove('on'); }
  const sr = $('#srch'); if (sr) { $$('[data-srch]').forEach(b => b.onclick = () => { sr.classList.add('on'); $('input', sr).focus(); }); sr.onclick = e => { if (e.target === sr) sr.classList.remove('on'); }; document.addEventListener('keydown', e => { if (e.key === 'Escape') { sr.classList.remove('on'); $('#stp') && $('#stp').classList.remove('on'); } }); }

  /* ---------- rueda de color con el isotipo ---------- */
  function famCount(id) { return S.productos.filter(p => (p.familias || []).includes(id)).length; }
  S.wheel = function (el) {
    const P = S.petals, I = S.iso; let h = `<svg viewBox="0 0 ${I.w} ${I.h}" role="group" aria-label="Rueda de color SOS"><g class="rot">`;
    P.forEach((p, i) => { const a = p.angle * Math.PI / 180, f = S.FAM[i]; h += `<path class="petal" tabindex="0" role="link" aria-label="${f.nombre}" data-f="${f.id}" style="--tx:${(Math.cos(a) * 60).toFixed(1)}px;--ty:${(Math.sin(a) * 60).toFixed(1)}px" fill="${p.color}" d="${p.d}"/>`; });
    el.innerHTML = h + `</g></svg><div class="wheel__c"><div id="wc"><b>Encuentra tu color</b>Toca un pétalo</div></div>`;
    const wc = $('#wc', el);
    $$('.petal', el).forEach(pt => { const f = S.FAM.find(x => x.id === pt.dataset.f); const on = () => wc.innerHTML = `<b style="color:${f.hex}">${f.nombre}</b>${famCount(f.id)} productos`; pt.onmouseenter = on; pt.onfocus = on; pt.onclick = () => location.href = 'catalogo.html?tono=' + f.id; pt.onkeydown = e => { if (e.key === 'Enter') pt.onclick(); }; });
    el.onmouseleave = () => wc.innerHTML = '<b>Encuentra tu color</b>Toca un pétalo';
  };

  /* ---------- horarios (abierto ahora) ---------- */
  const DN = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const fh = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + String(m).padStart(2, '0'); };
  S.openState = function (l) {
    const pr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()); const g = t => pr.find(x => x.type === t).value;
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), now = +g('hour') + +g('minute') / 60, h = l.horario[wd];
    if (h && now >= h[0] && now < h[1]) return { on: true, txt: 'Abierto · hasta ' + fh(h[1]) };
    for (let k = 0; k < 8; k++) { const d = (wd + k) % 7, x = l.horario[d]; if (x && (k > 0 || now < x[0])) return { on: false, txt: 'Cerrado · abre ' + (k === 0 ? 'hoy' : k === 1 ? 'mañana' : DN[d]) + ' ' + fh(x[0]) }; }
    return { on: false, txt: 'Cerrado' };
  };
  const hrow = l => { const r = (a, b, k) => l.horario[k] ? `${fh(l.horario[k][0])} – ${fh(l.horario[k][1])}` : 'Cerrado'; return `<tr><td>Lunes a viernes</td><td>${r(0, 0, 1)}</td></tr><tr><td>Sábado</td><td>${r(0, 0, 6)}</td></tr><tr><td>Domingo</td><td>${r(0, 0, 0)}</td></tr>`; };
  S.locCard = l => { const os = S.openState(l); return `<article class="loc"><div class="loc__i"><div class="loc__h"><div><span class="eyebrow">${esc(l.ciudad)}</span><h3 style="margin-top:6px">${esc(l.nombre)}</h3></div><span class="open ${os.on ? 'on' : ''}">${os.txt}</span></div><p>${esc(l.direccion)}<br><span style="color:var(--ink2);font-size:13px">${esc(l.nota)}</span></p><table>${hrow(l)}</table><div class="btns"><a class="btn btn--sm" target="_blank" rel="noopener" href="${l.maps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.direccion + ', ' + l.ciudad)}">${ico('pin')} Cómo llegar</a><a class="btn btn--sm btn--wa" target="_blank" rel="noopener" title="Se abre WhatsApp" href="${S.waLink('Hola, quiero consultar por el local de ' + l.ciudad)}">${ico('wa', 'i--f')} WhatsApp</a></div></div><div class="loc__map" data-mapsrc="https://www.google.com/maps?q=${l.lat},${l.lng}&z=17&output=embed" data-maptitle="Mapa de ${esc(l.nombre)}, ${esc(l.ciudad)}"><div class="map__f"><img class="iso" src="assets/logo/sos-isotipo.svg" alt="" width="64" height="64"><p><b>${esc(l.nombre)}</b><br><span>${esc(l.direccion)}</span></p><button type="button" class="btn btn--sm" data-mapgo>${ico('pin')} Ver mapa</button><small>Al cargar el mapa se conecta con Google Maps.</small></div></div></article>`; };

  document.addEventListener('click', e => { const b = e.target.closest('[data-mapgo]'); if (!b) return; const w = b.closest('[data-mapsrc]'); w.innerHTML = `<iframe title="${w.dataset.maptitle}" referrerpolicy="no-referrer-when-downgrade" src="${w.dataset.mapsrc}"></iframe>`; });

  /* ---------- portadas de blog ---------- */
  S.cover = (p, i) => p.img ? `<img src="${p.img}" alt="" loading="lazy">` : `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="cg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.c[0]}"/><stop offset="1" stop-color="${p.c[1]}"/></linearGradient></defs><rect width="400" height="300" fill="url(#cg${i})"/><image href="assets/logo/sos-isotipo-mono.svg" x="${150 + (i % 3) * 30}" y="-30" width="330" height="330" opacity=".22"/><text x="24" y="270" font-family="inherit" font-size="13" letter-spacing="3" fill="#fff" opacity=".9">${esc(p.cat.toUpperCase())}</text></svg>`;

  /* ---------- bloques dinámicos (home, enlaces) ---------- */
  const pick = (k, n) => { const P = S.productos.filter(p => !p.agotado); if (k === 'ofertas') return P.filter(p => p.oferta).slice(0, n); if (k === 'nuevos') return P.filter(p => p.etiqueta === 'nuevo').slice(0, n); return P.filter(p => p.destacado || p.etiqueta === 'mas-vendido').slice(0, n); };
  $$('[data-prods]').forEach(el => { el.innerHTML = pick(el.dataset.prods, +el.dataset.n || 4).map(S.card).join(''); });
  $$('[data-locs]').forEach(el => { el.innerHTML = S.locales.map(S.locCard).join(''); });
  $$('[data-blog]').forEach(el => { el.innerHTML = S.blog.slice(0, +el.dataset.blog).map((p, i) => `<a class="post" href="articulo.html?a=${p.slug}"><div class="post__cov">${S.cover(p, i)}</div><div class="post__t"><span class="post__cat">${esc(p.cat)} · ${p.min} min</span><h3>${esc(p.titulo)}</h3><p>${esc(p.resumen)}</p></div></a>`).join(''); });
  $$('[data-cats]').forEach(el => { el.innerHTML = S.CATS.map(c => { const n = S.productos.filter(p => p.categorias.includes(c.id)).length; return `<a class="cat-card" href="catalogo.html?cat=${c.id}"><img src="${(S.catFoto || {})[c.id] || ''}" alt="" loading="lazy"><div class="cat-card__t"><span>${c.nombre}</span><small>${n} productos</small></div></a>`; }).join(''); });
  $$('[data-wheel]').forEach(S.wheel);
  $$('[data-nivel]').forEach(el => { el.innerHTML = S.niveles.map((h, i) => `<a href="catalogo.html?nivel=${i + 1}" style="background:${h}" title="Nivel ${i + 1}">${i + 1}</a>`).join(''); });
  $$('[data-slides]').forEach(el => {
    const sl = $$('.hs__s', el), dots = $$('.hs__dots button', el); let i = 0, t, hold = false;
    const show = n => { i = (n + sl.length) % sl.length; sl.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    let paused = matchMedia('(prefers-reduced-motion:reduce)').matches; const pb = $('[data-pause]', el); const syncP = () => { if (!pb) return; pb.setAttribute('aria-pressed', paused); pb.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel'); pb.classList.toggle('is-paused', paused); }; const auto = () => { clearInterval(t); if (paused) return; t = setInterval(() => { if (!hold) show(i + 1); }, 6500); }; if (pb) pb.addEventListener('click', () => { paused = !paused; syncP(); auto(); }); syncP();
    dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.i); auto(); }));
    $$('.hs__arr button', el).forEach(b => b.addEventListener('click', () => { show(i + +b.dataset.d); auto(); }));
    el.addEventListener('mouseenter', () => hold = true); el.addEventListener('mouseleave', () => hold = false);
    let x0 = null; el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; hold = true; }, { passive: true });
    el.addEventListener('touchend', e => { if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); auto(); } } x0 = null; hold = false; });
    auto();
  });
  $$('[data-hero]').forEach(el => { const h = $('h1', el), l = $('.lead', el); if (h) h.innerHTML = S.portada.h1.toUpperCase().replace(/(COLOR)/, '<span class="rb">$1</span>'); if (l) l.textContent = S.portada.lead; });
  $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
  const hd = $('.hdr'); if (hd) { const f = () => hd.classList.toggle('is-stuck', scrollY > 6); addEventListener('scroll', f, { passive: true }); f(); }
  /* ---------- aparición suave al hacer scroll (sin exagerar) ---------- */
  (function () {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const mob = matchMedia('(max-width:900px)').matches, tag = (el, i) => { el.classList.add('rv'); el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); };
    ['.sech', '.intro__img', '.intro > div:last-child', '.ofe__t', '.cta__in', '.faq', '.ig__x', '.legal__body > section', '.nfot'].forEach(q => $$(q).forEach(e => tag(e, 0)));
    ['.cats', '.grid', '.posts', '.locs', '.feats', '.bws', '.ig__g'].forEach(q => $$(q).forEach(c => {
      if (c.closest('#catalogo') || c.id === 'rel' || c.id === 'posts') return;
      if (mob && c.classList.contains('rail')) { tag(c, 0); return; }
      [...c.children].forEach((e, i) => tag(e, i));
    }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(() => { t.classList.remove('rv', 'in'); t.style.removeProperty('--d'); }, 1500); } }), { threshold: .06, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(e => io.observe(e));
  })();
  document.dispatchEvent(new Event('sos:ready'));
})();
