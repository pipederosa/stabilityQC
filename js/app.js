/* app.js — StabilityQC v1.1 */

/* ============ STATE ============ */
let dashLoc    = 'todas';  // filtro del dashboard (solo por planta)
let sortCol    = null;
let sortDir    = 1;

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  bindNav();
  bindDashFilters();
  bindMultiFilters();
  bindFormEvents();
  bindExport();
  bindSearch();
  bindClearFilters();
  closeDropdownsOnOutsideClick();
  renderDashboard();
  renderResults(applyFilters());
  renderAudit();
});

/* ============ NAVIGATION ============ */
function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });
  document.getElementById('btn-new')?.addEventListener('click', () => showPage('form'));
  document.getElementById('btn-cancel-form')?.addEventListener('click', () => showPage('results'));
  document.getElementById('btn-cancel-form-2')?.addEventListener('click', () => showPage('results'));
  document.getElementById('btn-submit')?.addEventListener('click', submitForm);
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pg = document.getElementById('pg-' + id);
  if (pg) pg.classList.add('active');
  const map = { dashboard: 0, results: 1, full: 2, form: 3, audit: 4 };
  const btns = document.querySelectorAll('.nav-btn');
  if (map[id] !== undefined && btns[map[id]]) btns[map[id]].classList.add('active');
  if (id === 'results') renderResults(applyFilters());
  if (id === 'dashboard') renderDashboard();
}

/* ============ DASHBOARD FILTER (solo planta) ============ */
function bindDashFilters() {
  document.querySelectorAll('[data-dash-loc]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('[data-dash-loc]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      dashLoc = pill.dataset.dashLoc;
      renderDashboard();
    });
  });
}

function getDashStudies() {
  if (dashLoc === 'p1') return STUDIES.filter(s => s.planta === 'Planta 1');
  if (dashLoc === 'p2') return STUDIES.filter(s => s.planta === 'Planta 2');
  return [...STUDIES];
}

/* ============ MULTI-SELECT FILTERS (Resultados) ============ */
const FILTER_KEYS = ['estado', 'planta', 'ubic', 'div', 'oos'];

function toggleMultiFilter(key) {
  const drop = document.getElementById('mf-drop-' + key);
  if (!drop) return;
  const isOpen = !drop.classList.contains('hidden');
  // Cerrar todos
  FILTER_KEYS.forEach(k => {
    document.getElementById('mf-drop-' + k)?.classList.add('hidden');
  });
  document.getElementById('export-dropdown')?.classList.add('hidden');
  if (!isOpen) drop.classList.remove('hidden');
}

function closeDropdownsOnOutsideClick() {
  document.addEventListener('click', e => {
    const inside = e.target.closest('.multi-filter-wrap') || e.target.closest('.export-wrap');
    if (!inside) {
      FILTER_KEYS.forEach(k => document.getElementById('mf-drop-' + k)?.classList.add('hidden'));
      document.getElementById('export-dropdown')?.classList.add('hidden');
    }
  });
}

function bindMultiFilters() {
  FILTER_KEYS.forEach(key => {
    const drop = document.getElementById('mf-drop-' + key);
    if (!drop) return;
    drop.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        updateFilterButton(key);
        renderResults(applyFilters());
        renderActiveChips();
      });
    });
  });
}

function getCheckedValues(key) {
  const drop = document.getElementById('mf-drop-' + key);
  if (!drop) return [];
  return [...drop.querySelectorAll('input:checked')].map(cb => cb.value);
}

function updateFilterButton(key) {
  const vals = getCheckedValues(key);
  const btn  = document.getElementById('mf-btn-' + key);
  const cnt  = document.getElementById('mf-count-' + key);
  if (!btn || !cnt) return;
  if (vals.length) {
    btn.classList.add('has-selection');
    cnt.textContent = vals.length;
    cnt.classList.remove('hidden');
  } else {
    btn.classList.remove('has-selection');
    cnt.classList.add('hidden');
  }
}

function renderActiveChips() {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const labels = {
    estado: 'Estado', planta: 'Planta', ubic: 'Ubicación',
    div: 'División', oos: 'OOS'
  };
  const oosLabels = { si: 'Con OOS', no: 'Sin OOS' };
  let html = '';
  FILTER_KEYS.forEach(key => {
    getCheckedValues(key).forEach(val => {
      const display = key === 'oos' ? oosLabels[val] || val : val;
      html += `<div class="filter-chip">
        <span>${labels[key]}: ${display}</span>
        <button class="chip-remove" onclick="removeChip('${key}','${val}')" title="Quitar filtro">×</button>
      </div>`;
    });
  });
  container.innerHTML = html;
}

function removeChip(key, val) {
  const drop = document.getElementById('mf-drop-' + key);
  if (!drop) return;
  const cb = drop.querySelector(`input[value="${val}"]`);
  if (cb) cb.checked = false;
  updateFilterButton(key);
  renderResults(applyFilters());
  renderActiveChips();
}

function bindClearFilters() {
  document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    FILTER_KEYS.forEach(key => {
      const drop = document.getElementById('mf-drop-' + key);
      drop?.querySelectorAll('input').forEach(cb => cb.checked = false);
      updateFilterButton(key);
    });
    const search = document.getElementById('f-search');
    if (search) search.value = '';
    renderResults(applyFilters());
    renderActiveChips();
  });
}

function bindSearch() {
  document.getElementById('f-search')?.addEventListener('input', () => renderResults(applyFilters()));
}

/* ============ APPLY FILTERS ============ */
function applyFilters() {
  const estados  = getCheckedValues('estado');
  const plantas  = getCheckedValues('planta');
  const ubics    = getCheckedValues('ubic');
  const divs     = getCheckedValues('div');
  const oosVals  = getCheckedValues('oos');
  const q        = (document.getElementById('f-search')?.value || '').toLowerCase();

  return STUDIES.filter(s => {
    if (estados.length && !estados.includes(s.estado)) return false;
    if (plantas.length && !plantas.includes(s.planta)) return false;
    if (ubics.length  && !ubics.includes(s.ubic))      return false;
    if (divs.length   && !divs.includes(s.div))        return false;
    if (oosVals.includes('si') && !oosVals.includes('no') && !s.oos) return false;
    if (oosVals.includes('no') && !oosVals.includes('si') && s.oos)  return false;
    if (q && !s.prod.toLowerCase().includes(q) && !s.lote.toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ============ DATE UTILS ============ */
function parseDate(str) {
  if (!str || str === 'N/A' || str === '—') return null;
  const parts = str.split('/');
  if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  return new Date(str);
}
function daysLeft(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  return Math.round((d - new Date()) / 86400000);
}
function isExpired(s)               { const dl = daysLeft(s.limite); return dl !== null && dl < 0  && s.estado !== 'Completo' && s.estado !== 'Cancelado'; }
function isExpiringSoon(s, days=30) { const dl = daysLeft(s.limite); return dl !== null && dl >= 0 && dl <= days && s.estado !== 'Completo' && s.estado !== 'Cancelado'; }

/* ============ DASHBOARD ============ */
function renderDashboard() {
  updateKPIs();
  renderTrend();
  renderLegend();
  renderExpiringTable();
}

function updateKPIs() {
  const d = getDashStudies();
  const active   = d.filter(s => s.estado === 'En proceso' || s.estado === 'Pendiente').length;
  const expired  = d.filter(isExpired).length;
  const soon     = d.filter(s => isExpiringSoon(s, 30)).length;
  const complied = d.filter(s => s.cumpl === 'Sí').length;
  const pct      = d.length ? Math.round(complied / d.length * 100) : 0;
  const oos      = d.filter(s => s.oos).length;
  const pending  = d.filter(s => s.aprob === 'Pendiente').length;

  setEl('k-curso', active);
  setEl('k-venc', expired);
  setEl('k-prox', soon);
  setEl('k-cump', pct + '%');
  setEl('k-oos', oos);
  setEl('k-aprob', pending);

  const arc   = document.getElementById('donut-arc');
  const numEl = document.getElementById('donut-num');
  if (arc) {
    const circ = 2 * Math.PI * 42;
    arc.style.strokeDasharray = (pct / 100 * circ).toFixed(1) + ' ' + circ.toFixed(1);
    arc.style.stroke = pct >= 85 ? '#639922' : pct >= 70 ? '#EF9F27' : '#E24B4A';
  }
  if (numEl) numEl.textContent = pct + '%';
}

function renderTrend() {
  const el        = document.getElementById('trend-chart');
  const titleEl   = document.getElementById('trend-title');
  if (!el) return;

  // Seleccionar datos de quarters según planta activa
  let quarters;
  if (dashLoc === 'p1')      { quarters = QUARTERS_P1;    if (titleEl) titleEl.textContent = 'Tendencia de cumplimiento por quarter — Planta 1'; }
  else if (dashLoc === 'p2') { quarters = QUARTERS_P2;    if (titleEl) titleEl.textContent = 'Tendencia de cumplimiento por quarter — Planta 2'; }
  else                       { quarters = QUARTERS_TODAS; if (titleEl) titleEl.textContent = 'Tendencia de cumplimiento por quarter — Todas las plantas'; }

  el.innerHTML = quarters.map(q => {
    const col = q.pct >= 85 ? '#639922' : q.pct >= 75 ? '#EF9F27' : '#E24B4A';
    return `<div class="bar-row">
      <div class="bar-label">${q.q}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${q.pct}%;background:${col}"></div></div>
      <div class="bar-pct" style="color:${col}">${q.pct}%</div>
    </div>`;
  }).join('');
}

function renderLegend() {
  const el = document.getElementById('legend-items');
  const d  = getDashStudies();
  if (!el) return;
  const counts = {
    'Completos':  d.filter(s => s.estado === 'Completo').length,
    'En proceso': d.filter(s => s.estado === 'En proceso').length,
    'Pendientes': d.filter(s => s.estado === 'Pendiente').length,
    'Cancelados': d.filter(s => s.estado === 'Cancelado').length,
    'Vencidos':   d.filter(isExpired).length,
  };
  const colors = { 'Completos':'#27500A','En proceso':'#EF9F27','Pendientes':'#185FA5','Cancelados':'#888780','Vencidos':'#E24B4A' };
  el.innerHTML = Object.entries(counts).map(([label, count]) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${colors[label]}"></div>${label}: <strong>${count}</strong></div>`
  ).join('');
}

function renderExpiringTable() {
  const body = document.getElementById('dash-expiring-body');
  if (!body) return;
  const src = getDashStudies();
  const expiring = src
    .filter(s => isExpiringSoon(s, 30) || isExpired(s))
    .sort((a, b) => (daysLeft(a.limite) || 9999) - (daysLeft(b.limite) || 9999))
    .slice(0, 8);

  body.innerHTML = expiring.map(s => {
    const dl = daysLeft(s.limite);
    const rowCls = dl < 0 ? 'row-danger' : dl <= 15 ? 'row-warning' : '';
    const daysTxt = dl < 0
      ? `<span style="color:var(--danger);font-weight:500">Vencido (${Math.abs(dl)}d)</span>`
      : dl <= 15 ? `<span style="color:var(--warning);font-weight:500">${dl} días</span>`
      : `${dl} días`;
    return `<tr class="${rowCls}">
      <td title="${s.prod}">${s.prod}</td><td>${s.lote}</td><td>${s.cond}</td>
      <td>${s.limite}</td><td>${daysTxt}</td>
      <td>${s.planta} · ${s.ubic}</td><td>${badgeHtml(s.estado)}</td>
    </tr>`;
  }).join('');
}

/* ============ RESULTS TABLE ============ */
function renderResults(data) {
  const tbody  = document.getElementById('res-tbody');
  const noRes  = document.getElementById('no-results');
  const footer = document.getElementById('table-footer');
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = '';
    noRes?.classList.remove('hidden');
    if (footer) footer.textContent = '0 registros';
    return;
  }
  noRes?.classList.add('hidden');
  if (footer) footer.textContent = `${data.length} registro${data.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = data.map(s => {
    const dl       = daysLeft(s.limite);
    const rowCls   = isExpired(s) ? 'row-danger' : isExpiringSoon(s, 15) ? 'row-warning' : '';
    const limStyle = dl < 0 ? 'color:var(--danger);font-weight:500' : dl <= 15 ? 'color:var(--warning);font-weight:500' : '';
    return `<tr class="${rowCls}">
      <td title="${s.prod}">${s.prod}</td>
      <td>${s.lote}</td>
      <td title="${s.cond}">${s.cond}</td>
      <td>${s.tiempo}</td>
      <td>${s.ingreso}</td>
      <td>${s.teorica}</td>
      <td style="${limStyle}">${s.limite}</td>
      <td>${badgeHtml(s.estado)}</td>
      <td>${s.oos ? '<span class="badge badge-oos">OOS</span>' : '<span class="badge badge-ok">No</span>'}</td>
      <td>${s.planta}</td>
      <td title="${s.ubic}">${s.ubic}</td>
      <td><button class="link-btn" onclick="showDetail(${s.id})">Ver detalle</button></td>
    </tr>`;
  }).join('');

  bindSortHeaders();
}

function bindSortHeaders() {
  document.querySelectorAll('#res-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = 1; }
      const data = applyFilters().sort((a, b) => (a[col] || '').localeCompare(b[col] || '') * sortDir);
      renderResults(data);
    });
  });
}

/* ============ DETAIL VIEW ============ */
function showDetail(id) {
  const s = STUDIES.find(x => x.id === id);
  if (!s) return;
  const dl         = daysLeft(s.limite);
  const limitStyle = dl < 0 ? 'color:var(--danger);font-weight:500' : dl <= 15 ? 'color:var(--warning);font-weight:500' : '';
  const studyAudit = AUDIT_LOG.filter(a => a.study === id).slice(0, 5);

  document.getElementById('full-content').innerHTML = `
    <div class="detail-header">
      <button class="btn btn-ghost btn-sm" onclick="showPage('results')">← Volver</button>
      <span class="detail-title">${s.prod} — Lote ${s.lote}</span>
      ${badgeHtml(s.estado)}
      ${s.oos ? '<span class="badge badge-oos">OOS</span>' : ''}
      <span style="margin-left:auto;font-size:11px;color:var(--text3);font-family:var(--font-mono)">${s.cod} · ${s.div}</span>
    </div>
    <div class="detail-grid">
      <div class="card">
        <div class="card-title">Identificación y ubicación</div>
        <table class="detail-table"><tbody>
          <tr><td>Código</td><td>${s.cod}</td></tr>
          <tr><td>Producto</td><td>${s.prod}</td></tr>
          <tr><td>Lote</td><td>${s.lote}</td></tr>
          <tr><td>División</td><td>${s.div}</td></tr>
          <tr><td>Material de empaque</td><td>${s.empaque||'—'}</td></tr>
          <tr><td>Planta</td><td>${s.planta}</td></tr>
          <tr><td>Ubicación física</td><td>${s.ubic}</td></tr>
          <tr><td>Motivo del ensayo</td><td>${s.motivo||'—'}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Fechas y condiciones</div>
        <table class="detail-table"><tbody>
          <tr><td>Condiciones</td><td>${s.cond}</td></tr>
          <tr><td>Tiempo de estabilidad</td><td>${s.tiempo}</td></tr>
          <tr><td>Fecha de elaboración</td><td>${s.elab||'—'}</td></tr>
          <tr><td>Fecha entrada a cámara</td><td>${s.camara||'—'}</td></tr>
          <tr><td>Fecha de ingreso</td><td>${s.ingreso}</td></tr>
          <tr><td>F. teórica de análisis</td><td>${s.teorica}</td></tr>
          <tr><td>F. límite de análisis</td><td><span style="${limitStyle}">${s.limite}</span></td></tr>
          <tr><td>F. teórica de salida</td><td>${s.salida||'—'}</td></tr>
          <tr><td>F. teórica de liberación</td><td>${s.libteor||'—'}</td></tr>
          <tr><td>Fecha de liberación</td><td>${s.lib||'—'}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Estado y resultado</div>
        <table class="detail-table"><tbody>
          <tr><td>Estado</td><td>${badgeHtml(s.estado)}</td></tr>
          <tr><td>Cumplió</td><td>${s.cumpl||'—'}</td></tr>
          <tr><td>Cumplimiento estabilidad</td><td>${s.cumplEst||'—'}</td></tr>
          <tr><td>Aprobación final</td><td>${s.aprob||'—'}</td></tr>
          <tr><td>Semana de aprobación</td><td>${s.semana||'—'}</td></tr>
          <tr><td>Condiciones de salida</td><td>${s.condsal||'—'}</td></tr>
          <tr><td>Status</td><td>${s.status||'—'}</td></tr>
          ${s.estado==='Cancelado'?`<tr><td>Motivo cancelación</td><td style="color:var(--danger)">${s.motivo}</td></tr>`:''}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Análisis fisicoquímico (FQ)</div>
        <table class="detail-table"><tbody>
          <tr><td>Analista FQ</td><td>${s.analistFQ||'—'}</td></tr>
          <tr><td>F. análisis FQ inicio</td><td>${s.fqi||'—'}</td></tr>
          <tr><td>F. análisis FQ fin</td><td>${s.fqf||'—'}</td></tr>
          <tr><td>F. validación FQ</td><td>${s.fqv||'—'}</td></tr>
          <tr><td>Lleva microbiología</td><td>${s.micro}</td></tr>
          <tr><td>Analista microbiología</td><td>${s.analistMicro||'—'}</td></tr>
          <tr><td>F. muestreo micro inicio</td><td>${s.msi||'—'}</td></tr>
          <tr><td>F. muestreo micro fin</td><td>${s.msf||'—'}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Resultados de análisis</div>
        <table class="detail-table"><tbody>
          <tr><td>Contenido</td><td>${s.contenido||'—'}</td></tr>
          <tr><td>Prod. degradación 1</td><td>${s.deg1||'—'}</td></tr>
          <tr><td>Prod. degradación 2</td><td>${s.deg2||'—'}</td></tr>
          <tr><td>Prod. degradación 3</td><td>${s.deg3||'—'}</td></tr>
          <tr><td>Disolución</td><td>${s.disol||'—'}</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Muestreo</div>
        <table class="detail-table"><tbody>
          <tr><td>Límite inferior</td><td>${s.limInf||'—'}</td></tr>
          <tr><td>Límite superior</td><td>${s.limSup||'—'}</td></tr>
          <tr><td>Corredor</td><td>${s.corredor||'—'}</td></tr>
          ${s.obs?`<tr><td colspan="2" style="color:var(--text2);padding-top:8px;font-size:11px">${s.obs}</td></tr>`:''}
        </tbody></table>
      </div>
      ${s.oos?`<div class="card oos-card" style="grid-column:1/-1">
        <div class="card-title oos-title">OOS — Fuera de especificación</div>
        <p style="font-size:13px;line-height:1.5">${s.oos_obs}</p>
      </div>`:''}
      <div class="card" style="grid-column:1/-1">
        <div class="card-title">Historial de auditoría de este estudio</div>
        ${studyAudit.length ? studyAudit.map(auditRowHtml).join('') : '<p style="font-size:12px;color:var(--text3)">Sin cambios registrados.</p>'}
      </div>
    </div>`;
  showPage('full');
}

/* ============ AUDIT ============ */
function renderAudit() {
  const el = document.getElementById('audit-list');
  if (el) el.innerHTML = AUDIT_LOG.map(auditRowHtml).join('');
}
function auditRowHtml(a) {
  return `<div class="audit-row">
    <div class="audit-who">${a.who}</div>
    <div class="audit-what">${a.what}</div>
    <div class="audit-when">${a.when}</div>
  </div>`;
}

/* ============ COND BUILDER ============ */
function updateCondPreview() {
  const tempTipo = document.getElementById('fp-temp-tipo')?.value;
  const hrTipo   = document.getElementById('fp-hr-tipo')?.value;

  // Mostrar/ocultar campos de temp
  const te = document.getElementById('cond-temp-exacta');
  const tr = document.getElementById('cond-temp-rango');
  if (te) te.classList.toggle('hidden', tempTipo !== 'exacta');
  if (tr) tr.classList.toggle('hidden', tempTipo !== 'rango');

  // Mostrar/ocultar campos de HR
  const he = document.getElementById('cond-hr-exacta');
  const hr = document.getElementById('cond-hr-rango');
  if (he) he.classList.toggle('hidden', hrTipo !== 'exacta');
  if (hr) hr.classList.toggle('hidden', hrTipo !== 'rango');

  // Construir texto de temperatura
  let tempStr = '';
  if (tempTipo === 'exacta') {
    const v = document.getElementById('fp-temp-val')?.value;
    if (v !== '') tempStr = `${v}°C`;
  } else if (tempTipo === 'rango') {
    const mn = document.getElementById('fp-temp-min')?.value;
    const mx = document.getElementById('fp-temp-max')?.value;
    if (mn !== '' || mx !== '') tempStr = `${mn||'?'}–${mx||'?'}°C`;
  }

  // Construir texto de HR
  let hrStr = '';
  if (hrTipo === 'na') {
    hrStr = 'N/A';
  } else if (hrTipo === 'exacta') {
    const v = document.getElementById('fp-hr-val')?.value;
    if (v !== '') hrStr = `${v}% HR`;
  } else if (hrTipo === 'rango') {
    const mn = document.getElementById('fp-hr-min')?.value;
    const mx = document.getElementById('fp-hr-max')?.value;
    if (mn !== '' || mx !== '') hrStr = `${mn||'?'}–${mx||'?'}% HR`;
  }

  // Previsualización
  const prev = document.getElementById('cond-preview');
  if (prev) {
    if (tempStr && hrStr)       prev.textContent = `${tempStr} / ${hrStr}`;
    else if (tempStr)           prev.textContent = tempStr;
    else if (hrStr)             prev.textContent = hrStr;
    else                        prev.textContent = '—';
  }
}

function buildCondString() {
  const prev = document.getElementById('cond-preview')?.textContent || '';
  return prev === '—' ? '' : prev;
}

/* ============ FORM ============ */
function bindFormEvents() {
  document.getElementById('fp-planta')?.addEventListener('change', updateFormConditional);
  document.getElementById('fp-estado')?.addEventListener('change', updateFormConditional);
  document.getElementById('fp-oos')?.addEventListener('change', updateFormConditional);
  document.getElementById('fp-micro')?.addEventListener('change', updateFormConditional);
  document.getElementById('fp-temp-tipo')?.addEventListener('change', updateCondPreview);
  document.getElementById('fp-hr-tipo')?.addEventListener('change', updateCondPreview);
  ['fp-ingreso','fp-teorica','fp-limite'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', validateDates);
  });
}

function updateFormConditional() {
  const planta = document.getElementById('fp-planta')?.value;
  const sel    = document.getElementById('fp-ubicfis');
  if (sel) {
    const ubics = UBICACIONES[planta] || [];
    sel.innerHTML = planta
      ? ubics.map(u => `<option>${u}</option>`).join('')
      : '<option value="">— seleccione planta primero —</option>';
  }
  const estado = document.getElementById('fp-estado')?.value;
  document.getElementById('cancel-block').style.display = estado === 'Cancelado' ? 'flex' : 'none';
  const oos = document.getElementById('fp-oos')?.value;
  document.getElementById('oos-block').style.display = oos === 'Sí' ? 'flex' : 'none';
  const micro    = document.getElementById('fp-micro')?.value;
  const anMicro  = document.getElementById('fp-anmicro');
  ['micro-ini','micro-fin','micro-na'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = micro === 'Sí' ? '' : 'none';
  });
  if (anMicro) anMicro.disabled = micro !== 'Sí';
}

function validateDates() {
  const ing = document.getElementById('fp-ingreso')?.value;
  const teo = document.getElementById('fp-teorica')?.value;
  const lim = document.getElementById('fp-limite')?.value;
  let ok = true;

  // Ingreso obligatorio
  const errIng = document.getElementById('err-ingreso');
  const inpIng = document.getElementById('fp-ingreso');
  if (!ing) {
    errIng?.classList.remove('hidden'); inpIng?.classList.add('error'); ok = false;
  } else {
    errIng?.classList.add('hidden'); inpIng?.classList.remove('error');
  }

  const errTeo = document.getElementById('err-teorica');
  const inpTeo = document.getElementById('fp-teorica');
  if (!teo || (ing && teo <= ing)) {
    errTeo?.classList.remove('hidden'); inpTeo?.classList.add('error'); ok = false;
  } else {
    errTeo?.classList.add('hidden'); inpTeo?.classList.remove('error');
  }

  const errLim = document.getElementById('err-limite');
  const inpLim = document.getElementById('fp-limite');
  if (!lim || (teo && lim <= teo)) {
    errLim?.classList.remove('hidden'); inpLim?.classList.add('error'); ok = false;
  } else {
    errLim?.classList.add('hidden'); inpLim?.classList.remove('error');
  }
  return ok;
}

function submitForm() {
  const prod   = document.getElementById('fp-prod')?.value.trim();
  const planta = document.getElementById('fp-planta')?.value;
  const lote   = document.getElementById('fp-lote')?.value.trim();
  const cod    = document.getElementById('fp-cod')?.value.trim();
  const cond   = buildCondString();

  const missingFields = [];
  if (!planta)  missingFields.push('Planta');
  if (!cod)     missingFields.push('Código de producto');
  if (!prod)    missingFields.push('Producto');
  if (!lote)    missingFields.push('Lote');
  if (!cond)    missingFields.push('Condiciones de almacenamiento (temperatura)');

  if (missingFields.length) {
    alert('Complete los campos obligatorios:\n• ' + missingFields.join('\n• '));
    return;
  }
  if (!validateDates()) {
    alert('Corrija los errores de fechas antes de guardar.');
    return;
  }

  const newStudy = {
    id: STUDIES.length + 1,
    cod, prod, lote, planta, cond,
    ubic:      document.getElementById('fp-ubicfis')?.value || '',
    div:       document.getElementById('fp-div')?.value || '',
    tiempo:    document.getElementById('fp-tiempo')?.value || '',
    ingreso:   fmtDate(document.getElementById('fp-ingreso')?.value),
    teorica:   fmtDate(document.getElementById('fp-teorica')?.value),
    limite:    fmtDate(document.getElementById('fp-limite')?.value),
    estado:    document.getElementById('fp-estado')?.value || 'Pendiente',
    oos:       document.getElementById('fp-oos')?.value === 'Sí',
    oos_obs:   document.getElementById('fp-oos-obs')?.value || '',
    cumpl:     document.getElementById('fp-cumplio')?.value || '',
    aprob:     document.getElementById('fp-aprob')?.value || 'Pendiente',
    analistFQ: document.getElementById('fp-anfq')?.value || '',
    analistMicro: document.getElementById('fp-anmicro')?.value || '',
    micro:     document.getElementById('fp-micro')?.value || 'No',
    contenido: document.getElementById('fp-contenido')?.value || '',
    deg1:      document.getElementById('fp-deg1')?.value || '',
    deg2:      document.getElementById('fp-deg2')?.value || '',
    deg3:      document.getElementById('fp-deg3')?.value || '',
    disol:     document.getElementById('fp-disol')?.value || '',
    obs:       document.getElementById('fp-obs')?.value || '',
    elab:      fmtDate(document.getElementById('fp-elab')?.value),
    camara:    fmtDate(document.getElementById('fp-camara')?.value),
    fqi:       fmtDate(document.getElementById('fp-fqi')?.value),
    fqf:       fmtDate(document.getElementById('fp-fqf')?.value),
    fqv:       fmtDate(document.getElementById('fp-fqv')?.value),
    msi:       fmtDate(document.getElementById('fp-msi')?.value) || 'N/A',
    msf:       fmtDate(document.getElementById('fp-msf')?.value) || 'N/A',
    motivo:    document.getElementById('fp-motivo')?.value || '',
    empaque:   document.getElementById('fp-empaque')?.value || '',
    condsal:   document.getElementById('fp-condsal')?.value || '',
    semana:    document.getElementById('fp-semana')?.value || '',
    status:    'Pendiente',
    limInf:    document.getElementById('fp-lim-inf')?.value || '',
    limSup:    document.getElementById('fp-lim-sup')?.value || '',
    corredor:  document.getElementById('fp-corredor')?.value || '',
    cumplEst:  document.getElementById('fp-cumpl')?.value || '',
    salida:    fmtDate(document.getElementById('fp-salida')?.value),
    libteor:   fmtDate(document.getElementById('fp-libteor')?.value),
    lib:       fmtDate(document.getElementById('fp-lib')?.value),
  };

  STUDIES.push(newStudy);
  AUDIT_LOG.unshift({
    who: 'M. García', what: `Creó estudio: ${prod} (${lote}) · ${planta}`,
    when: nowStr(), field: 'creación', old: '', new: lote, study: newStudy.id
  });

  renderDashboard();
  renderAudit();
  alert(`Estudio guardado correctamente.\n\nProducto: ${prod}\nLote: ${lote}\nCondiciones: ${cond}\nPlanta: ${planta}\n\nEl registro de auditoría fue generado automáticamente.`);
  showPage('results');
}

/* ============ EXPORT ============ */
function bindExport() {
  // Toggle del dropdown de exportar
  document.getElementById('btn-export-toggle')?.addEventListener('click', e => {
    e.stopPropagation();
    const dd = document.getElementById('export-dropdown');
    dd?.classList.toggle('hidden');
  });
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    document.getElementById('export-dropdown')?.classList.add('hidden');
    exportCSV(applyFilters(), 'estudios_estabilidad');
  });
  document.getElementById('btn-export-xlsx')?.addEventListener('click', () => {
    document.getElementById('export-dropdown')?.classList.add('hidden');
    exportXLSX(applyFilters(), 'estudios_estabilidad');
  });
  document.getElementById('btn-export-audit')?.addEventListener('click', exportAuditCSV);
}

function getExportRows(data) {
  const headers = ['ID','Código','Producto','Lote','División','Planta','Ubicación física','Condiciones','Tiempo','Fecha ingreso','F. teórica','F. límite','Estado','OOS','OOS Obs.','Cumplió','Aprobación','Analista FQ','Analista Micro','Contenido','Deg.1','Deg.2','Deg.3','Disolución','Límite inf.','Límite sup.','Corredor','Observaciones'];
  const rows = data.map(s => [
    s.id, s.cod, s.prod, s.lote, s.div, s.planta, s.ubic, s.cond, s.tiempo,
    s.ingreso, s.teorica, s.limite, s.estado,
    s.oos ? 'Sí' : 'No', s.oos_obs || '',
    s.cumpl || '', s.aprob || '', s.analistFQ || '', s.analistMicro || '',
    s.contenido || '', s.deg1 || '', s.deg2 || '', s.deg3 || '', s.disol || '',
    s.limInf || '', s.limSup || '', s.corredor || '', s.obs || ''
  ]);
  return { headers, rows };
}

function exportCSV(data, filename) {
  const { headers, rows } = getExportRows(data);
  const allRows = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  const bom  = '\uFEFF';
  const blob = new Blob([bom + allRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename + '_' + dateStamp() + '.csv');
}

function exportXLSX(data, filename) {
  if (typeof XLSX === 'undefined') {
    alert('La librería de Excel no está disponible. Revise la conexión a internet.'); return;
  }
  const { headers, rows } = getExportRows(data);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Ancho de columnas automático
  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || '').length));
    return { wch: Math.min(maxLen + 2, 40) };
  });
  // Estilo de encabezado (negrita)
  headers.forEach((_, i) => {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: i })];
    if (cell) cell.s = { font: { bold: true } };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estudios de Estabilidad');
  XLSX.writeFile(wb, filename + '_' + dateStamp() + '.xlsx');
}

function exportAuditCSV() {
  const headers = ['Usuario','Acción','Valor anterior','Valor nuevo','Fecha y hora','Estudio ID'];
  const rows = AUDIT_LOG.map(a => [a.who, a.what, a.old||'', a.new||'', a.when, a.study||'']);
  const allRows = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  const blob = new Blob(['\uFEFF' + allRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'auditoria_stabilityqc_' + dateStamp() + '.csv');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ============ HELPERS ============ */
function badgeHtml(estado) {
  const map = { 'Pendiente':'badge-pendiente','En proceso':'badge-proceso','Completo':'badge-completo','Cancelado':'badge-cancelado' };
  return `<span class="badge ${map[estado]||''}">${estado}</span>`;
}
function setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function fmtDate(val) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  return `${d}/${m}/${y}`;
}
function nowStr() {
  const n = new Date();
  return `${pad(n.getDate())}/${pad(n.getMonth()+1)}/${n.getFullYear()} ${pad(n.getHours())}:${pad(n.getMinutes())}`;
}
function dateStamp() {
  const n = new Date();
  return `${n.getFullYear()}${pad(n.getMonth()+1)}${pad(n.getDate())}`;
}
function pad(v) { return String(v).padStart(2, '0'); }
