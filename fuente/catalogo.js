/* SOS · catálogo con filtros por facetas y ficha de producto (prototipo) */
(function () {
  const S = window.SOS, { $, $$, fmt, esc, ico } = S.util;
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  /* ===================== CATÁLOGO ===================== */
  const root = $('#catalogo');
  if (root) {
    const qs = new URLSearchParams(location.search), PER = 24;
    const st = { q: qs.get('q') || '', cat: qs.get('cat') || '', tipo: qs.get('tipo') || '', marcas: new Set((qs.get('marca') || '').split(',').filter(Boolean)), tono: qs.get('tono') || '', nivel: +qs.get('nivel') || 0, estado: new Set((qs.get('estado') || '').split(',').filter(Boolean)), min: qs.get('min') || '', max: qs.get('max') || '', orden: qs.get('orden') || 'rel', pag: +qs.get('pag') || 1 };
    const ESTADOS = [['oferta', 'En oferta'], ['nuevo', 'Nuevos'], ['mas-vendido', 'Más vendidos'], ['disp', 'Solo disponibles']];
    const idx = S.productos.map(p => ({ p, hay: norm([p.nombre, p.marca, p.presentacion, S.catName[p.tipo], (p.tonos || []).map(t => t.nombre + ' ' + t.codigo).join(' ')].join(' ')) }));
    const nivelDe = p => { const t = p.tonos && p.tonos[0]; return t ? parseInt(t.codigo, 10) || 0 : 0; };
    function list(skip) {
      const words = norm(st.q).split(/\s+/).filter(Boolean);
      return idx.filter(({ p, hay }) => {
        if (words.length && !words.every(w => hay.includes(w))) return false;
        if (skip !== 'cat' && st.cat && !p.categorias.includes(st.cat)) return false;
        if (skip !== 'cat' && st.tipo && p.tipo !== st.tipo) return false;
        if (skip !== 'marca' && st.marcas.size && !st.marcas.has(p.marca_slug)) return false;
        if (skip !== 'tono' && st.tono && !(p.familias || []).includes(st.tono)) return false;
        if (skip !== 'tono' && st.nivel && !((p.familias || []).includes('natural') && p.tipo === 'tintes' && nivelDe(p) === st.nivel)) return false;
        if (skip !== 'estado') for (const e of st.estado) { if (e === 'disp' ? p.agotado : p.etiqueta !== e) return false; }
        if (skip !== 'precio') { if (st.min && p.precio < +st.min) return false; if (st.max && p.precio > +st.max) return false; }
        return true;
      }).map(x => x.p);
    }
    const sorters = { rel: (a, b) => (b.destacado - a.destacado) || (S.productos.indexOf(a) - S.productos.indexOf(b)), asc: (a, b) => a.precio - b.precio, desc: (a, b) => b.precio - a.precio, az: (a, b) => a.nombre.localeCompare(b.nombre) };
    function url() { const p = new URLSearchParams(); if (st.q) p.set('q', st.q); if (st.cat) p.set('cat', st.cat); if (st.tipo) p.set('tipo', st.tipo); if (st.marcas.size) p.set('marca', [...st.marcas].join(',')); if (st.tono) p.set('tono', st.tono); if (st.nivel) p.set('nivel', st.nivel); if (st.estado.size) p.set('estado', [...st.estado].join(',')); if (st.min) p.set('min', st.min); if (st.max) p.set('max', st.max); if (st.orden !== 'rel') p.set('orden', st.orden); if (st.pag > 1) p.set('pag', st.pag); const s = p.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); }
    let showAllBrands = false;
    function side() {
      const base = list('cat'), cnt = id => base.filter(p => p.categorias.includes(id)).length, cnt2 = id => base.filter(p => p.tipo === id).length;
      const cats = S.CATS.map(c => `<a class="fo ${st.cat === c.id && !st.tipo ? 'on' : ''}" href="#" data-cat="${c.id}">${c.nombre}<em>${cnt(c.id)}</em></a>` + (st.cat === c.id ? c.hijos.map(h => `<a class="fo sub ${st.tipo === h.id ? 'on' : ''} ${cnt2(h.id) ? '' : 'z'}" href="#" data-cat="${c.id}" data-tipo="${h.id}">${h.nombre}<em>${cnt2(h.id)}</em></a>`).join('') : '')).join('');
      const bb = list('marca'), ms = S.marcasList().map(m => Object.assign({}, m, { n: bb.filter(p => p.marca_slug === m.slug).length })).sort((a, b) => (st.marcas.has(b.slug) - st.marcas.has(a.slug)) || b.n - a.n || a.nombre.localeCompare(b.nombre));
      const msv = showAllBrands ? ms : ms.slice(0, 10);
      const tb = list('tono'), famN = id => tb.filter(p => (p.familias || []).includes(id)).length;
      const eb = list('estado'), estN = k => eb.filter(p => k === 'disp' ? !p.agotado : p.etiqueta === k).length;
      $('#fgroups').innerHTML = `<div class="fg"><h4 aria-level="2">Categoría</h4><div class="fl">${cats}</div></div>
      <div class="fg"><h4 aria-level="2">Marca ${st.marcas.size ? `<a href="#" data-clr="marca" style="font-weight:400;letter-spacing:0;text-transform:none;text-decoration:underline">Limpiar</a>` : ''}</h4><div class="fl">${msv.map(m => `<label class="fo ${m.n ? '' : 'z'}"><input type="checkbox" data-marca="${m.slug}" ${st.marcas.has(m.slug) ? 'checked' : ''}>${esc(m.nombre)}<em>${m.n}</em></label>`).join('')}</div>${ms.length > 10 ? `<a href="#" class="lnk" data-allb style="margin-top:10px">${showAllBrands ? 'Ver menos' : 'Ver todas (' + ms.length + ')'}</a>` : ''}</div>
      <div class="fg"><h4 aria-level="2">Tono</h4><div class="mini">${S.FAM.map(f => `<a href="#" class="${st.tono === f.id ? 'on' : ''}" data-tono="${f.id}" style="background:${f.hex};${famN(f.id) ? '' : 'opacity:.25'}" title="${f.nombre} (${famN(f.id)})" aria-label="${f.nombre}"></a>`).join('')}</div><div class="mini mini--n" style="margin-top:10px">${S.niveles.map((h, i) => `<a href="#" class="${st.nivel === i + 1 ? 'on' : ''}" data-nivel="${i + 1}" style="background:${h}" title="Nivel ${i + 1}"></a>`).join('')}</div><small style="color:var(--ink2);font-size:11.5px;display:block;margin-top:6px">Arriba colores de fantasía y esmaltes. Abajo, nivel del 1 (negro) al 10 (rubio platino).</small></div>
      <div class="fg"><h4 aria-level="2">Estado</h4><div class="fl">${ESTADOS.map(([k, n]) => `<label class="fo"><input type="checkbox" data-est="${k}" ${st.estado.has(k) ? 'checked' : ''}>${n}<em>${estN(k)}</em></label>`).join('')}</div></div>
      <div class="fg"><h4 aria-level="2">Precio</h4><div class="frow"><input class="fin" type="number" inputmode="numeric" placeholder="Mín." data-pr="min" value="${st.min}"><input class="fin" type="number" inputmode="numeric" placeholder="Máx." data-pr="max" value="${st.max}"></div></div>`;
    }
    function results() {
      document.body.classList.toggle('cat-home', !(st.q || st.cat || st.tipo || st.marcas.size || st.tono || st.nivel || st.estado.size || st.min || st.max));
      const L = list().sort(sorters[st.orden]); const pages = Math.max(1, Math.ceil(L.length / PER)); if (st.pag > pages) st.pag = pages;
      const cat = S.CATS.find(c => c.id === st.cat), tipoN = st.tipo && S.catName[st.tipo];
      $('#ctit').textContent = st.q ? `Resultados para “${st.q}”` : (tipoN || (cat && cat.nombre) || 'Catálogo');
      const hasF = !!(st.q || st.cat || st.tipo || st.marcas.size || st.tono || st.nivel || st.estado.size || st.min || st.max);
      $('#ccr').innerHTML = `<ol class="trail__l"><li><a href="index.html">Inicio</a></li><li><a href="catalogo.html" ${hasF ? '' : 'aria-current="page"'}>Catálogo</a></li>${cat ? `<li><a href="catalogo.html?cat=${cat.id}" ${tipoN ? '' : 'aria-current="page"'}>${cat.nombre}</a></li>` : ''}${tipoN ? `<li><span aria-current="page">${tipoN}</span></li>` : ''}</ol>${hasF ? `<a class="trail__back" href="catalogo.html">${ico('arrow', 'i--l')} Volver al catálogo completo</a>` : ''}`;
      $('#cn').textContent = L.length + (L.length === 1 ? ' producto' : ' productos');
      const chips = []; if (st.q) chips.push(['q', `Búsqueda: ${esc(st.q)}`]); st.marcas.forEach(m => chips.push(['m:' + m, (S.marcasList().find(x => x.slug === m) || { nombre: m }).nombre])); if (st.tono) chips.push(['tono', 'Tono: ' + (S.FAM.find(f => f.id === st.tono) || { nombre: 'Natural' }).nombre]); if (st.nivel) chips.push(['nivel', 'Nivel ' + st.nivel]); st.estado.forEach(e => chips.push(['e:' + e, ESTADOS.find(x => x[0] === e)[1]])); if (st.min || st.max) chips.push(['precio', `Precio ${st.min ? fmt(st.min) : ''}–${st.max ? fmt(st.max) : ''}`]);
      $('#chips').innerHTML = chips.map(([k, t]) => `<button class="chip" data-chip="${k}">${t} ${ico('x')}</button>`).join('') + (chips.length ? '<button class="chip" data-chip="all" style="border-color:var(--line)">Limpiar todo</button>' : '');
      const page = L.slice((st.pag - 1) * PER, st.pag * PER);
      $('#cgrid').innerHTML = page.length ? page.map(S.card).join('') : `<div class="empty" style="grid-column:1/-1"><img class="iso spin" src="assets/logo/sos-isotipo.svg" alt="">No encontramos productos con esos filtros.<br><a class="lnk" href="#" data-chip="all" style="margin-top:14px">Limpiar filtros</a></div>`;
      let pg = ''; if (pages > 1) { const nums = []; for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - st.pag) <= 1) nums.push(i); let last = 0; pg += st.pag > 1 ? `<a href="#" data-pag="${st.pag - 1}" aria-label="Anterior">‹</a>` : ''; nums.forEach(n => { if (n - last > 1) pg += '<span>…</span>'; pg += n === st.pag ? `<span class="on">${n}</span>` : `<a href="#" data-pag="${n}">${n}</a>`; last = n; }); pg += st.pag < pages ? `<a href="#" data-pag="${st.pag + 1}" aria-label="Siguiente">›</a>` : ''; }
      $('#pager').innerHTML = pg; $('#cs').value = st.orden; url();
    }
    const all = () => { side(); results(); };
    const go = (fn, keepTop) => { fn(); st.pag = 1; all(); if (!keepTop) window.scrollTo({ top: 0, behavior: 'smooth' }); };
    root.addEventListener('click', e => {
      const t = e.target;
      let a;
      if ((a = t.closest('[data-cat]'))) { e.preventDefault(); go(() => { const c = a.dataset.cat, ti = a.dataset.tipo || ''; if (!ti && st.cat === c && !st.tipo) { st.cat = ''; } else { st.cat = c; st.tipo = ti; } }, true); }
      else if (t.closest('[data-allb]')) { e.preventDefault(); showAllBrands = !showAllBrands; side(); }
      else if ((a = t.closest('[data-tono]'))) { e.preventDefault(); go(() => { st.tono = st.tono === a.dataset.tono ? '' : a.dataset.tono; st.nivel = 0; }, true); }
      else if ((a = t.closest('[data-nivel]'))) { e.preventDefault(); go(() => { st.nivel = st.nivel === +a.dataset.nivel ? 0 : +a.dataset.nivel; st.tono = ''; if (st.nivel) { st.cat = 'coloracion'; st.tipo = 'tintes'; } }, true); }
      else if ((a = t.closest('[data-clr]'))) { e.preventDefault(); go(() => st.marcas.clear(), true); }
      else if ((a = t.closest('[data-pag]'))) { e.preventDefault(); st.pag = +a.dataset.pag; results(); $('#cgrid').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if ((a = t.closest('[data-chip]'))) { e.preventDefault(); const k = a.dataset.chip; go(() => { if (k === 'all') { st.q = ''; st.cat = ''; st.tipo = ''; st.marcas.clear(); st.tono = ''; st.nivel = 0; st.estado.clear(); st.min = st.max = ''; $('#cq').value = ''; } else if (k === 'q') { st.q = ''; $('#cq').value = ''; } else if (k === 'tono') st.tono = ''; else if (k === 'nivel') st.nivel = 0; else if (k === 'precio') st.min = st.max = ''; else if (k.startsWith('m:')) st.marcas.delete(k.slice(2)); else if (k.startsWith('e:')) st.estado.delete(k.slice(2)); }, true); }
    });
    root.addEventListener('change', e => { const t = e.target; if (t.dataset.marca) go(() => { t.checked ? st.marcas.add(t.dataset.marca) : st.marcas.delete(t.dataset.marca); }, true); else if (t.dataset.est) go(() => { t.checked ? st.estado.add(t.dataset.est) : st.estado.delete(t.dataset.est); }, true); else if (t.dataset.pr) go(() => { st[t.dataset.pr] = t.value; }, true); else if (t.id === 'cs') go(() => { st.orden = t.value; }, true); });
    let dt; $('#cq').value = st.q; $('#cq').addEventListener('input', e => { clearTimeout(dt); dt = setTimeout(() => { st.q = e.target.value.trim(); st.pag = 1; all(); }, 220); });
    const fb = $('#fbtn'), fl = $('#filters'), ov = $('#fov'); const tog = on => { fl.classList.toggle('on', on); ov.classList.toggle('on', on); };
    fb.onclick = () => tog(true); ov.onclick = () => tog(false); $('#fclose').onclick = () => tog(false); $('#fshow').onclick = () => tog(false);
    all();
  }
  /* ===================== FICHA ===================== */
  const fic = $('#ficha');
  if (fic) {
    const p = S.bySlug[new URLSearchParams(location.search).get('p')];
    if (!p) { fic.innerHTML = `<div class="empty wrap"><img class="iso spin" src="assets/logo/sos-isotipo.svg" alt="">No encontramos este producto.<br><a class="lnk" href="catalogo.html" style="margin-top:14px">Volver al catálogo</a></div>`; return; }
    document.title = p.nombre + ' · SOS Color y Belleza';
    let ti = p.tonos && p.tonos.length ? 0 : -1, qty = 1;
    const cat = S.CATS.find(c => p.categorias[0] === c.id);
    const view = () => {
      const tn = ti >= 0 ? p.tonos[ti] : null, pa = tn ? Object.assign({}, p, { tonos: [tn] }) : p;
      const txt = () => `Hola, quiero consultar por: ${qty} × ${p.nombre} (${p.marca})${tn ? ' · tono ' + tn.nombre : ''} — ${fmt(p.precio)} c/u. ¿Está disponible? ¿Cómo puedo retirarlo o recibirlo?`;
      fic.innerHTML = `<div class="wrap"><div class="crumbs" style="padding-top:22px"><a href="index.html">Inicio</a> › <a href="catalogo.html">Catálogo</a> › <a href="catalogo.html?cat=${cat.id}">${cat.nombre}</a> › <a href="catalogo.html?cat=${cat.id}&tipo=${p.tipo}">${S.catName[p.tipo]}</a></div><div class="fic"><div class="fic__art">${p.oferta ? '<span class="badge badge--oferta">Oferta</span>' : ''}${S.art(pa)}</div><div class="fic__i"><span class="eyebrow">${esc(p.marca)}</span><h1>${esc(p.nombre)}</h1><div class="card__meta" style="white-space:normal">${esc(p.presentacion)} · SKU ${p.id}</div><div class="fic__p">${fmt(p.precio)}${p.oferta && p.precio_antes ? `<s>${fmt(p.precio_antes)}</s>` : ''}</div>${tn ? `<div><div class="eyebrow" style="margin-bottom:8px">Tono · <b style="color:var(--ink);font-weight:500">${esc(tn.nombre)}</b></div><div class="tonos">${p.tonos.map((t, i) => `<button class="tono ${i === ti ? 'on' : ''}" data-t="${i}" style="background:${t.hex}" title="${esc(t.nombre)}" aria-label="${esc(t.nombre)}"></button>`).join('')}</div></div>` : ''}<div class="btns"><div class="qty"><button id="qm" aria-label="Menos">−</button><span>${qty}</span><button id="qp" aria-label="Más">+</button></div><button class="btn btn--pri" id="fadd" style="flex:1" ${p.agotado ? 'disabled' : ''}>${ico('plus')} ${p.agotado ? 'Agotado' : 'Agregar a mi selección'}</button></div><a class="btn btn--wa btn--blk" target="_blank" rel="noopener" title="Se abre WhatsApp" href="${S.waLink(txt())}">${ico('wa', 'i--f')} Consultar por WhatsApp</a><p class="nota">Precio referencial. Te confirmamos disponibilidad, precio final y cómo retirar o recibir tu pedido.</p><div class="tabs-i"><details open><summary>Descripción</summary><p>${esc(p.descripcion)}</p></details><details><summary>Detalle</summary><p>Marca: ${esc(p.marca)}<br>Categoría: ${cat.nombre} · ${S.catName[p.tipo]}<br>Presentación: ${esc(p.presentacion)}</p></details><details><summary>Retiro y envío</summary><p>Retira en Puerto Montt o Puerto Varas, o coordinamos el envío por WhatsApp al confirmar tu consulta.</p></details></div></div></div></div>`;
      $$('[data-t]', fic).forEach(b => b.onclick = () => { ti = +b.dataset.t; view(); });
      $('#qm', fic).onclick = () => { qty = Math.max(1, qty - 1); view(); }; $('#qp', fic).onclick = () => { qty++; view(); };
      const ad = $('#fadd', fic); if (ad) ad.onclick = () => { S.sel.add(p.id, qty, ti >= 0 ? ti : undefined); S.toast(`${esc(p.nombre)} agregado a tu selección`); S.sel.open(); };
    };
    view();
    const rel = S.productos.filter(x => x.tipo === p.tipo && x.id !== p.id).slice(0, 4); const rg = $('#rel'); if (rg) rg.innerHTML = rel.map(S.card).join('');
  }
  /* ===================== BLOG: artículo ===================== */
  const ar = $('#articulo');
  if (ar) {
    const i = S.blog.findIndex(x => x.slug === new URLSearchParams(location.search).get('a')), a = S.blog[i < 0 ? 0 : i], k = i < 0 ? 0 : i; document.title = a.titulo + ' · SOS Color y Belleza';
    ar.innerHTML = `<div class="wrap"><div class="art-h"><span class="post__cat">${esc(a.cat)} · ${a.min} min de lectura</span><h1 style="margin-top:14px">${esc(a.titulo)}</h1></div><div class="art-cov">${S.cover(a, k)}</div><div class="art-b">${a.cuerpo.map(b => b.h ? `<h3>${esc(b.h)}</h3>` : `<p>${esc(b.p)}</p>`).join('')}<div class="btns" style="margin-top:30px"><a class="btn btn--pri" href="catalogo.html?cat=${a.link}">Ver productos relacionados ${ico('arrow')}</a><a class="btn btn--wa" target="_blank" rel="noopener" title="Se abre WhatsApp" href="${S.waLink('Hola, leí el artículo «' + a.titulo + '» y quiero una recomendación.')}">${ico('wa', 'i--f')} Pregúntanos</a></div></div></div>`;
    const more = $('#mas'); if (more) more.innerHTML = S.blog.filter((_, j) => j !== k).slice(0, 3).map((p, j) => `<a class="post" href="articulo.html?a=${p.slug}"><div class="post__cov">${S.cover(p, j + 10)}</div><span class="post__cat">${esc(p.cat)} · ${p.min} min</span><h3>${esc(p.titulo)}</h3></a>`).join('');
  }
})();
