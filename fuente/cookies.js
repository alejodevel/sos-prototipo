/* SOS · consentimiento de cookies (Ley 19.628 modificada por la Ley 21.719): sin casillas premarcadas, aceptar y rechazar con el mismo peso, revocable */
(function () {
  const KEY = 'sos_cookies', V = 1, YEAR = 365 * 864e5;
  const ico = (n, c) => `<svg class="i ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const get = () => { try { const c = JSON.parse(localStorage.getItem(KEY)); return c && c.v === V && Date.now() - c.t < YEAR ? c : null; } catch (e) { return null; } };
  const save = (analitica, marketing) => { const c = { v: V, analitica: !!analitica, marketing: !!marketing, t: Date.now() }; try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} document.dispatchEvent(new CustomEvent('sos:consent', { detail: c })); return c; };
  if (window.SOS) window.SOS.consent = get;

  const el = document.createElement('div'); el.className = 'ck'; el.id = 'ck'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-labelledby', 'ckt'); el.setAttribute('aria-describedby', 'ckd');
  el.innerHTML = `<div class="ck__in"><div class="ck__t"><span class="ck__ic">${ico('shield')}</span><div><h2 id="ckt">Tu privacidad</h2><p id="ckd">Usamos cookies necesarias para que el sitio funcione y, solo si tú lo permites, de analítica y marketing para mejorarlo. Puedes elegir qué aceptar. Más información en la <a href="politica-de-privacidad.html">política de privacidad</a>.</p></div></div>
<div class="ck__c" id="ckc" hidden><label class="ck__r"><span><b>Necesarias</b><small>Hacen que el sitio funcione y recuerdan tus preferencias. Siempre activas.</small></span><span class="sw"><input type="checkbox" checked disabled aria-label="Necesarias (siempre activas)"><i></i></span></label><label class="ck__r"><span><b>Analítica</b><small>Nos ayudan a entender cómo se usa el sitio, de forma agregada.</small></span><span class="sw"><input type="checkbox" id="cka" aria-label="Analítica"><i></i></span></label><label class="ck__r"><span><b>Marketing</b><small>Miden y mejoran nuestras campañas publicitarias.</small></span><span class="sw"><input type="checkbox" id="ckm" aria-label="Marketing"><i></i></span></label></div>
<div class="ck__b" id="ckb1"><button type="button" class="btn btn--pri" data-ck="no">Solo necesarias</button><button type="button" class="btn btn--pri" data-ck="all">Aceptar todas</button><button type="button" class="btn" data-ck="cfg">Configurar</button></div>
<div class="ck__b" id="ckb2" hidden><button type="button" class="btn btn--pri" data-ck="save">Guardar mi elección</button><button type="button" class="btn btn--pri" data-ck="all">Aceptar todas</button></div></div>`;
  document.body.appendChild(el);
  const root = document.documentElement, A = el.querySelector('#cka'), M = el.querySelector('#ckm');
  const size = () => root.style.setProperty('--cb', el.hidden ? '0px' : el.offsetHeight + 'px');
  const show = (cfg, focus) => { const c = get(); A.checked = !!(c && c.analitica); M.checked = !!(c && c.marketing); el.hidden = false; setCfg(cfg); requestAnimationFrame(() => { el.classList.add('on'); size(); }); if (focus) el.querySelector('.btn').focus(); };
  const setCfg = on => { el.querySelector('#ckc').hidden = !on; el.querySelector('#ckb1').hidden = on; el.querySelector('#ckb2').hidden = !on; size(); };
  const hide = () => { el.classList.remove('on'); setTimeout(() => { el.hidden = true; size(); }, 250); root.style.setProperty('--cb', '0px'); if (window.SOS && SOS.toast) SOS.toast('Preferencias de cookies guardadas'); };
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-ck]'); if (!b) return; const k = b.dataset.ck;
    if (k === 'cfg') { setCfg(true); el.querySelector('#cka').focus(); return; }
    if (k === 'all') save(true, true); else if (k === 'no') save(false, false); else save(A.checked, M.checked);
    hide();
  });
  document.addEventListener('click', e => { if (e.target.closest('[data-cookies]')) { e.preventDefault(); show(true, true); } });
  window.addEventListener('resize', size);
  if (!get()) setTimeout(() => show(false, false), 900);
})();
