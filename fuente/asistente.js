/* SOS · Ángela, asistente virtual: responde las preguntas frecuentes y deja WhatsApp como última instancia */
(function () {
  const S = window.SOS; if (!S || !S.faq || !S.faq.length) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (n, c) => `<svg class="i ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const wa = t => `https://wa.me/${S.empresa.whatsapp}?text=${encodeURIComponent(t)}`;
  const FIRST = ['despacho', 'locales', 'pedido', 'pago', 'tono', 'salon'];
  const byId = id => S.faq.find(f => f.id === id);
  let asked = new Set(), opened = false, lastQ = '';

  const root = document.createElement('div'); root.className = 'ang';
  root.innerHTML = `<button class="ang__fab" id="angfab" type="button" aria-expanded="false" aria-controls="angp"><span class="ang__av"><img src="assets/logo/sos-isotipo.svg" alt="" width="26" height="26"></span><span class="ang__lb">Pregúntale a Ángela</span></button>
<div class="ang__tip" id="angtip" hidden><span>¿Dudas? Pregúntale a Ángela</span><button type="button" aria-label="Cerrar aviso" id="angtx">${ico('x')}</button></div>
<section class="ang__p" id="angp" role="dialog" aria-label="Ángela, asistente virtual de SOS" hidden><header class="ang__h"><span class="ang__av ang__av--l"><img src="assets/logo/sos-isotipo.svg" alt="" width="30" height="30"></span><div><b>Ángela</b><span>Asistente virtual de SOS</span></div><button type="button" class="ibtn" id="angx" aria-label="Cerrar chat">${ico('x')}</button></header><div class="ang__m" id="angm" role="log" aria-live="polite" aria-relevant="additions"></div><form class="ang__f" id="angf" autocomplete="off"><label class="sr" for="angi">Escribe tu pregunta</label><input id="angi" placeholder="Escribe tu pregunta…" maxlength="140"><button type="submit" aria-label="Enviar pregunta">${ico('send')}</button></form></section>`;
  document.body.appendChild(root);
  const fab = root.querySelector('#angfab'), panel = root.querySelector('#angp'), msgs = root.querySelector('#angm'), form = root.querySelector('#angf'), inp = root.querySelector('#angi'), tip = root.querySelector('#angtip');

  const down = () => { msgs.scrollTop = msgs.scrollHeight; };
  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'ang__b ' + cls; d.innerHTML = html; msgs.appendChild(d); down(); return d; };
  const user = t => add('ang__b--u', esc(t));
  const bot = (html, after) => {
    const ty = add('ang__b--a ang__ty', '<i></i><i></i><i></i>'); ty.setAttribute('aria-label', 'Ángela está escribiendo');
    const go = () => { ty.classList.remove('ang__ty'); ty.removeAttribute('aria-label'); ty.innerHTML = html; down(); if (after) after(); };
    reduce ? go() : setTimeout(go, 520);
  };
  const link = l => /^https?:/.test(l.h) ? `<a class="ang__l" href="${l.h}" target="_blank" rel="noopener">${esc(l.t)} ${ico('arrow')}</a>` : `<a class="ang__l" href="${l.h}">${esc(l.t)} ${ico('arrow')}</a>`;
  const chips = (ids, extra) => { const d = add('ang__c', ids.map(id => { const f = byId(id); return f ? `<button type="button" class="ang__ch" data-q="${id}">${esc(f.q)}</button>` : ''; }).join('') + (extra || '')); return d; };
  const waBtn = q => `<a class="ang__wa" href="${wa(q ? 'Hola, tengo una consulta: ' + q : 'Hola, tengo una consulta.')}" target="_blank" rel="noopener" title="Se abre WhatsApp">${ico('wa', 'i--f')} Aún tengo dudas: hablar por WhatsApp</a>`;
  const remaining = () => S.faq.map(f => f.id).filter(id => !asked.has(id));

  function more(q) {
    const r = remaining(), pick = r.slice(0, 4);
    bot(pick.length ? '¿Te ayudo con algo más?' : 'Eso es todo lo que tengo a mano. Si quedó algo pendiente, el equipo te responde por WhatsApp.', () => {
      if (pick.length) chips(pick, r.length > 4 ? '<button type="button" class="ang__ch ang__ch--m" data-all>Ver todas las preguntas</button>' : '');
      add('ang__c', waBtn(q));
    });
  }
  function answer(f, echo) {
    asked.add(f.id); if (echo) user(echo);
    const links = (f.links || []).map(link).join('') + (f.wa ? `<a class="ang__l ang__l--wa" href="${wa(f.wa)}" target="_blank" rel="noopener" title="Se abre WhatsApp">${ico('wa', 'i--f')} Escribir por WhatsApp</a>` : '');
    bot(`<p>${esc(f.a)}</p>${links ? `<div class="ang__ls">${links}</div>` : ''}`, () => more(f.q));
  }
  function find(q) {
    const n = ' ' + norm(q) + ' '; let best = null, sc = 0;
    S.faq.forEach(f => { let s = 0; f.k.forEach(k => { if (n.includes(k)) s += k.length >= 5 ? 2 : 1; }); norm(f.q).split(/[^a-z0-9]+/).filter(w => w.length > 4).forEach(w => { if (n.includes(w)) s += .5; }); if (s > sc) { sc = s; best = f; } });
    return sc >= 1 ? best : null;
  }
  function freeText(q) {
    user(q); const f = find(q);
    if (f) { asked.add(f.id); const links = (f.links || []).map(link).join('') + (f.wa ? `<a class="ang__l ang__l--wa" href="${wa(f.wa)}" target="_blank" rel="noopener" title="Se abre WhatsApp">${ico('wa', 'i--f')} Escribir por WhatsApp</a>` : ''); bot(`<p>Esto puede ayudarte: ${esc(f.a)}</p>${links ? `<div class="ang__ls">${links}</div>` : ''}`, () => more(q)); }
    else bot('<p>No encontré una respuesta exacta a eso. Mira si alguna de estas preguntas te sirve; si no, el equipo te responde por WhatsApp.</p>', () => { chips(remaining().slice(0, 4)); add('ang__c', waBtn(q)); });
  }
  function start() {
    opened = true;
    bot('<p>Hola, soy Ángela, la asistente virtual de SOS. Puedo resolver las dudas más comunes al instante. Elige una pregunta o escríbeme la tuya.</p>', () => chips(FIRST, '<button type="button" class="ang__ch ang__ch--m" data-all>Ver todas las preguntas</button>'));
  }
  function open() {
    const mn = document.getElementById('mnav'); if (mn) mn.classList.remove('on');
    panel.hidden = false; requestAnimationFrame(() => panel.classList.add('on')); fab.setAttribute('aria-expanded', 'true'); root.classList.add('is-open'); document.body.classList.add('ang-open'); tip.hidden = true;
    try { sessionStorage.setItem('sos_ang_tip', '1'); } catch (e) {}
    if (!opened) start(); setTimeout(() => inp.focus(), 60);
  }
  function close() { panel.classList.remove('on'); fab.setAttribute('aria-expanded', 'false'); root.classList.remove('is-open'); document.body.classList.remove('ang-open'); setTimeout(() => { if (!panel.classList.contains('on')) panel.hidden = true; }, 220); fab.focus(); }

  fab.addEventListener('click', () => panel.hidden || !panel.classList.contains('on') ? open() : close());
  root.querySelector('#angx').addEventListener('click', close);
  root.querySelector('#angtx').addEventListener('click', () => { tip.hidden = true; try { sessionStorage.setItem('sos_ang_tip', '1'); } catch (e) {} });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('on')) close(); });
  document.addEventListener('click', e => { const t = e.target.closest('[data-angela]'); if (t) { e.preventDefault(); if (!panel.classList.contains('on')) open(); else inp.focus(); } });
  msgs.addEventListener('click', e => {
    const c = e.target.closest('.ang__ch'); if (!c) return;
    if (c.hasAttribute('data-all')) { user('Ver todas las preguntas'); bot('<p>Estas son todas las preguntas que puedo responder:</p>', () => chips(S.faq.map(f => f.id))); return; }
    const f = byId(c.dataset.q); if (f) answer(f, f.q);
  });
  form.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = ''; freeText(v); });
  try { if (!sessionStorage.getItem('sos_ang_tip')) setTimeout(() => { if (!panel.classList.contains('on')) tip.hidden = false; }, 7000); } catch (e) {}
})();
