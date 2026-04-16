/* app.js — StabilityQC v1.2 */

/* ============ ROLES & USERS ============ */
const ROLES = {
  viewer:     { label: 'Viewer',     color: '#888780', canEdit: false, canCreate: false, canApprove: false, canAdmin: false },
  analyst:    { label: 'Analista',   color: '#185FA5', canEdit: true,  canCreate: true,  canApprove: false, canAdmin: false },
  supervisor: { label: 'Supervisor', color: '#854F0B', canEdit: true,  canCreate: true,  canApprove: true,  canAdmin: false },
  admin:      { label: 'Admin',      color: '#3B6D11', canEdit: true,  canCreate: true,  canApprove: true,  canAdmin: true  },
};

const PERMISSIONS_MATRIX = [
  { action: 'Ver estudios y resultados',      viewer: true,  analyst: true,  supervisor: true,  admin: true  },
  { action: 'Buscar y filtrar',               viewer: true,  analyst: true,  supervisor: true,  admin: true  },
  { action: 'Exportar CSV / Excel',           viewer: true,  analyst: true,  supervisor: true,  admin: true  },
  { action: 'Crear nuevos estudios',          viewer: false, analyst: true,  supervisor: true,  admin: true  },
  { action: 'Editar campos en detalle',       viewer: false, analyst: true,  supervisor: true,  admin: true  },
  { action: 'Registrar resultados FQ / Micro',viewer: false, analyst: true,  supervisor: true,  admin: true  },
  { action: 'Aprobar estudios',               viewer: false, analyst: false, supervisor: true,  admin: true  },
  { action: 'Cancelar estudios',              viewer: false, analyst: false, supervisor: true,  admin: true  },
  { action: 'Ver auditoría',                  viewer: false, analyst: false, supervisor: true,  admin: true  },
  { action: 'Gestión de usuarios (Admin)',    viewer: false, analyst: false, supervisor: false, admin: true  },
  { action: 'Cambiar roles de usuarios',      viewer: false, analyst: false, supervisor: false, admin: true  },
];

let USERS_LIST = [
  { id: 1, nombre: 'M. García',    usuario: 'mgarcia',   email: 'mgarcia@lab.com',    rol: 'analyst',    planta: 'todas',    estado: 'activo',   lastLogin: '15/04/2026 09:12', initials: 'MG' },
  { id: 2, nombre: 'S. López',     usuario: 'slopez',    email: 'slopez@lab.com',     rol: 'analyst',    planta: 'Planta 2', estado: 'activo',   lastLogin: '15/04/2026 08:45', initials: 'SL' },
  { id: 3, nombre: 'R. Pérez',     usuario: 'rperez',    email: 'rperez@lab.com',     rol: 'supervisor', planta: 'todas',    estado: 'activo',   lastLogin: '14/04/2026 17:30', initials: 'RP' },
  { id: 4, nombre: 'Admin Sistema',usuario: 'admin',     email: 'admin@lab.com',      rol: 'admin',      planta: 'todas',    estado: 'activo',   lastLogin: '15/04/2026 07:00', initials: 'AS' },
  { id: 5, nombre: 'J. Fernández', usuario: 'jfernandez',email: 'jfernandez@lab.com', rol: 'viewer',     planta: 'Planta 1', estado: 'activo',   lastLogin: '13/04/2026 11:08', initials: 'JF' },
  { id: 6, nombre: 'L. Martínez', usuario: 'lmartinez', email: 'lmartinez@lab.com',  rol: 'analyst',    planta: 'Planta 1', estado: 'inactivo', lastLogin: '01/03/2026 09:00', initials: 'LM' },
];

let currentUser = USERS_LIST[0]; // Comienza como M. García (Analista)
let editingUserId = null;

/* ============ STATE ============ */
let dashLoc = 'todas';
let sortCol = null;
let sortDir = 1;

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  applyUserContext();
  bindNav();
  bindDashFilters();
  bindMultiFilters();
  bindFormEvents();
  bindExport();
  bindSearch();
  bindClearFilters();
  bindUserSwitcher();
  bindAdminModule();
  bindDetailSearch();
  closeDropdownsOnOutsideClick();
  renderDashboard();
  renderResults(applyFilters());
  renderAudit();
  renderUsersTable();
  renderPermissionsMatrix();
});

/* ============ USER CONTEXT ============ */
function applyUserContext() {
  const role = ROLES[currentUser.rol];

  // Topbar
  document.getElementById('topbar-avatar').textContent = currentUser.initials;
  document.getElementById('topbar-name').textContent   = currentUser.nombre;
  document.getElementById('topbar-role').textContent   = role.label;
  document.getElementById('topbar-role').style.background = role.color + '22';
  document.getElementById('topbar-role').style.color      = role.color;

  // Nav Admin
  const adminBtn = document.getElementById('nav-admin');
  if (role.canAdmin) adminBtn.classList.remove('hidden');
  else adminBtn.classList.add('hidden');

  // "Nuevo estudio"
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.style.display = role.canCreate ? '' : 'none';

  // Si está en detalle y cambia de rol, refrescar
  const fc = document.getElementById('full-content');
  if (fc && fc.dataset.studyId) showDetail(+fc.dataset.studyId);
}

/* ============ USER SWITCHER ============ */
function bindUserSwitcher() {
  document.getElementById('user-switcher-toggle')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('hidden');
  });
  renderUserList();
}

function renderUserList() {
  const el = document.getElementById('user-list');
  if (!el) return;
  el.innerHTML = USERS_LIST.filter(u => u.estado === 'activo').map(u => {
    const role  = ROLES[u.rol];
    const isMe  = u.id === currentUser.id;
    return `<div class="user-option ${isMe ? 'user-option-active' : ''}" onclick="switchUser(${u.id})">
      <div class="user-opt-avatar" style="background:${role.color}22;color:${role.color}">${u.initials}</div>
      <div class="user-opt-info">
        <div class="user-opt-name">${u.nombre} ${isMe ? '<span class="user-opt-you">tú</span>' : ''}</div>
        <div class="user-opt-role" style="color:${role.color}">${role.label}</div>
      </div>
    </div>`;
  }).join('');
}

function switchUser(id) {
  const u = USERS_LIST.find(x => x.id === id);
  if (!u) return;
  currentUser = u;
  document.getElementById('user-dropdown').classList.add('hidden');
  applyUserContext();
  renderUserList();
  renderUsersTable();
  // Si estaba en admin y ya no puede acceder, ir al dashboard
  if (!ROLES[currentUser.rol].canAdmin) {
    const adminPage = document.getElementById('pg-admin');
    if (adminPage?.classList.contains('active')) showPage('dashboard');
  }
}

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
  // Proteger Admin
  if (id === 'admin' && !ROLES[currentUser.rol].canAdmin) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pg = document.getElementById('pg-' + id);
  if (pg) pg.classList.add('active');
  const map = { dashboard: 0, results: 1, full: 2, form: 3, audit: 4, admin: 5 };
  const btns = document.querySelectorAll('.nav-btn');
  if (map[id] !== undefined && btns[map[id]]) btns[map[id]].classList.add('active');
  if (id === 'results')   renderResults(applyFilters());
  if (id === 'dashboard') renderDashboard();
  if (id === 'admin')     { renderUsersTable(); renderPermissionsMatrix(); }
}

/* ============ DASHBOARD ============ */
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
function renderDashboard() { updateKPIs(); renderTrend(); renderLegend(); renderExpiringTable(); }

function updateKPIs() {
  const d = getDashStudies();
  const active   = d.filter(s => s.estado === 'En proceso' || s.estado === 'Pendiente').length;
  const expired  = d.filter(isExpired).length;
  const soon     = d.filter(s => isExpiringSoon(s, 30)).length;
  const complied = d.filter(s => s.cumpl === 'Sí').length;
  const pct      = d.length ? Math.round(complied / d.length * 100) : 0;
  setEl('k-curso', active); setEl('k-venc', expired); setEl('k-prox', soon);
  setEl('k-cump', pct + '%');
  setEl('k-oos',   d.filter(s => s.oos).length);
  setEl('k-aprob', d.filter(s => s.aprob === 'Pendiente').length);
  const arc = document.getElementById('donut-arc');
  if (arc) { const c = 2*Math.PI*42; arc.style.strokeDasharray = (pct/100*c).toFixed(1)+' '+c.toFixed(1); arc.style.stroke = pct>=85?'#639922':pct>=70?'#EF9F27':'#E24B4A'; }
  setEl('donut-num', pct + '%');
}

function renderTrend() {
  const el = document.getElementById('trend-chart');
  const ti = document.getElementById('trend-title');
  if (!el) return;
  let quarters;
  if (dashLoc==='p1')      { quarters=QUARTERS_P1;    if(ti) ti.textContent='Tendencia de cumplimiento por quarter — Planta 1'; }
  else if (dashLoc==='p2') { quarters=QUARTERS_P2;    if(ti) ti.textContent='Tendencia de cumplimiento por quarter — Planta 2'; }
  else                     { quarters=QUARTERS_TODAS; if(ti) ti.textContent='Tendencia de cumplimiento por quarter — Todas las plantas'; }
  el.innerHTML = quarters.map(q => {
    const col = q.pct>=85?'#639922':q.pct>=75?'#EF9F27':'#E24B4A';
    return `<div class="bar-row"><div class="bar-label">${q.q}</div><div class="bar-track"><div class="bar-fill" style="width:${q.pct}%;background:${col}"></div></div><div class="bar-pct" style="color:${col}">${q.pct}%</div></div>`;
  }).join('');
}

function renderLegend() {
  const el = document.getElementById('legend-items'); const d = getDashStudies(); if(!el)return;
  const counts = {'Completos':d.filter(s=>s.estado==='Completo').length,'En proceso':d.filter(s=>s.estado==='En proceso').length,'Pendientes':d.filter(s=>s.estado==='Pendiente').length,'Cancelados':d.filter(s=>s.estado==='Cancelado').length,'Vencidos':d.filter(isExpired).length};
  const colors = {'Completos':'#27500A','En proceso':'#EF9F27','Pendientes':'#185FA5','Cancelados':'#888780','Vencidos':'#E24B4A'};
  el.innerHTML = Object.entries(counts).map(([label,count])=>`<div class="legend-item"><div class="legend-dot" style="background:${colors[label]}"></div>${label}: <strong>${count}</strong></div>`).join('');
}

function renderExpiringTable() {
  const body = document.getElementById('dash-expiring-body'); if(!body)return;
  const expiring = getDashStudies().filter(s=>isExpiringSoon(s,30)||isExpired(s)).sort((a,b)=>(daysLeft(a.limite)||9999)-(daysLeft(b.limite)||9999)).slice(0,8);
  body.innerHTML = expiring.map(s => {
    const dl=daysLeft(s.limite), rowCls=dl<0?'row-danger':dl<=15?'row-warning':'';
    const dt=dl<0?`<span style="color:var(--danger);font-weight:500">Vencido (${Math.abs(dl)}d)</span>`:dl<=15?`<span style="color:var(--warning);font-weight:500">${dl} días</span>`:`${dl} días`;
    return `<tr class="${rowCls}"><td title="${s.prod}">${s.prod}</td><td>${s.lote}</td><td>${s.cond}</td><td>${s.limite}</td><td>${dt}</td><td>${s.planta} · ${s.ubic}</td><td>${badgeHtml(s.estado)}</td></tr>`;
  }).join('');
}

/* ============ MULTI FILTERS ============ */
const FILTER_KEYS = ['estado','planta','ubic','div','oos'];
function toggleMultiFilter(key) {
  const drop = document.getElementById('mf-drop-'+key); if(!drop)return;
  const isOpen = !drop.classList.contains('hidden');
  FILTER_KEYS.forEach(k=>document.getElementById('mf-drop-'+k)?.classList.add('hidden'));
  document.getElementById('export-dropdown')?.classList.add('hidden');
  document.getElementById('user-dropdown')?.classList.add('hidden');
  if(!isOpen) drop.classList.remove('hidden');
}
function closeDropdownsOnOutsideClick() {
  document.addEventListener('click', e => {
    const inside = e.target.closest('.multi-filter-wrap')||e.target.closest('.export-wrap')||e.target.closest('.user-switcher-wrap');
    if(!inside){ FILTER_KEYS.forEach(k=>document.getElementById('mf-drop-'+k)?.classList.add('hidden')); document.getElementById('export-dropdown')?.classList.add('hidden'); document.getElementById('user-dropdown')?.classList.add('hidden'); }
  });
}
function bindMultiFilters() {
  FILTER_KEYS.forEach(key => {
    document.getElementById('mf-drop-'+key)?.querySelectorAll('input').forEach(cb => {
      cb.addEventListener('change', ()=>{ updateFilterButton(key); renderResults(applyFilters()); renderActiveChips(); });
    });
  });
}
function getCheckedValues(key) { return [...(document.getElementById('mf-drop-'+key)?.querySelectorAll('input:checked')||[])].map(cb=>cb.value); }
function updateFilterButton(key) {
  const vals=getCheckedValues(key), btn=document.getElementById('mf-btn-'+key), cnt=document.getElementById('mf-count-'+key); if(!btn||!cnt)return;
  if(vals.length){ btn.classList.add('has-selection'); cnt.textContent=vals.length; cnt.classList.remove('hidden'); } else { btn.classList.remove('has-selection'); cnt.classList.add('hidden'); }
}
function renderActiveChips() {
  const c=document.getElementById('active-filters'); if(!c)return;
  const labels={estado:'Estado',planta:'Planta',ubic:'Ubicación',div:'División',oos:'OOS'}, oosL={si:'Con OOS',no:'Sin OOS'};
  c.innerHTML = FILTER_KEYS.flatMap(key=>getCheckedValues(key).map(val=>`<div class="filter-chip"><span>${labels[key]}: ${key==='oos'?oosL[val]||val:val}</span><button class="chip-remove" onclick="removeChip('${key}','${val}')">×</button></div>`)).join('');
}
function removeChip(key, val) {
  const cb=document.getElementById('mf-drop-'+key)?.querySelector(`input[value="${val}"]`); if(cb)cb.checked=false;
  updateFilterButton(key); renderResults(applyFilters()); renderActiveChips();
}
function bindClearFilters() {
  document.getElementById('btn-clear-filters')?.addEventListener('click', ()=>{
    FILTER_KEYS.forEach(key=>{ document.getElementById('mf-drop-'+key)?.querySelectorAll('input').forEach(cb=>cb.checked=false); updateFilterButton(key); });
    const s=document.getElementById('f-search'); if(s)s.value='';
    renderResults(applyFilters()); renderActiveChips();
  });
}
function bindSearch() { document.getElementById('f-search')?.addEventListener('input', ()=>renderResults(applyFilters())); }
function applyFilters() {
  const estados=getCheckedValues('estado'), plantas=getCheckedValues('planta'), ubics=getCheckedValues('ubic'), divs=getCheckedValues('div'), oosVals=getCheckedValues('oos');
  const q=(document.getElementById('f-search')?.value||'').toLowerCase();
  return STUDIES.filter(s=>{
    if(estados.length&&!estados.includes(s.estado))return false;
    if(plantas.length&&!plantas.includes(s.planta))return false;
    if(ubics.length&&!ubics.includes(s.ubic))return false;
    if(divs.length&&!divs.includes(s.div))return false;
    if(oosVals.includes('si')&&!oosVals.includes('no')&&!s.oos)return false;
    if(oosVals.includes('no')&&!oosVals.includes('si')&&s.oos)return false;
    if(q&&!s.prod.toLowerCase().includes(q)&&!s.lote.toLowerCase().includes(q))return false;
    return true;
  });
}

/* ============ DATE UTILS ============ */
function parseDate(str) { if(!str||str==='N/A'||str==='—')return null; const p=str.split('/'); if(p.length===3)return new Date(+p[2],+p[1]-1,+p[0]); return new Date(str); }
function daysLeft(d) { const dt=parseDate(d); if(!dt)return null; return Math.round((dt-new Date())/86400000); }
function isExpired(s) { const dl=daysLeft(s.limite); return dl!==null&&dl<0&&s.estado!=='Completo'&&s.estado!=='Cancelado'; }
function isExpiringSoon(s,days=30) { const dl=daysLeft(s.limite); return dl!==null&&dl>=0&&dl<=days&&s.estado!=='Completo'&&s.estado!=='Cancelado'; }

/* ============ RESULTS TABLE ============ */
function renderResults(data) {
  const tbody=document.getElementById('res-tbody'), noRes=document.getElementById('no-results'), footer=document.getElementById('table-footer'); if(!tbody)return;
  if(!data.length){ tbody.innerHTML=''; noRes?.classList.remove('hidden'); if(footer)footer.textContent='0 registros'; return; }
  noRes?.classList.add('hidden'); if(footer)footer.textContent=`${data.length} registro${data.length!==1?'s':''}`;
  tbody.innerHTML=data.map(s=>{
    const dl=daysLeft(s.limite), rowCls=isExpired(s)?'row-danger':isExpiringSoon(s,15)?'row-warning':'';
    const lS=dl<0?'color:var(--danger);font-weight:500':dl<=15?'color:var(--warning);font-weight:500':'';
    return `<tr class="${rowCls}"><td title="${s.prod}">${s.prod}</td><td>${s.lote}</td><td title="${s.cond}">${s.cond}</td><td>${s.tiempo}</td><td>${s.ingreso}</td><td>${s.teorica}</td><td style="${lS}">${s.limite}</td><td>${badgeHtml(s.estado)}</td><td>${s.oos?'<span class="badge badge-oos">OOS</span>':'<span class="badge badge-ok">No</span>'}</td><td>${s.planta}</td><td title="${s.ubic}">${s.ubic}</td><td><button class="link-btn" onclick="showDetail(${s.id})">Ver detalle</button></td></tr>`;
  }).join('');
  bindSortHeaders();
}
function bindSortHeaders() {
  document.querySelectorAll('#res-table th[data-sort]').forEach(th=>{
    th.addEventListener('click',()=>{ const col=th.dataset.sort; if(sortCol===col)sortDir*=-1; else{sortCol=col;sortDir=1;} renderResults(applyFilters().sort((a,b)=>(a[col]||'').localeCompare(b[col]||'')*sortDir)); });
  });
}

/* ============ DETAIL SEARCH ============ */
function bindDetailSearch() {
  const inp = document.getElementById('detail-search');
  const res = document.getElementById('detail-search-results');
  if (!inp || !res) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { res.classList.add('hidden'); return; }
    const matches = STUDIES.filter(s => s.prod.toLowerCase().includes(q) || s.lote.toLowerCase().includes(q) || s.cod.toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length) { res.innerHTML='<div class="ds-no-result">Sin resultados</div>'; res.classList.remove('hidden'); return; }
    res.innerHTML = matches.map(s => `<div class="ds-item" onclick="showDetail(${s.id});document.getElementById('detail-search').value='';document.getElementById('detail-search-results').classList.add('hidden')">
      <div class="ds-item-name">${s.prod}</div>
      <div class="ds-item-meta">${s.lote} · ${s.planta} · ${badgeHtml(s.estado)}</div>
    </div>`).join('');
    res.classList.remove('hidden');
  });
  document.addEventListener('click', e => { if (!e.target.closest('.detail-search-bar')) res.classList.add('hidden'); });
}

/* ============ DETAIL VIEW ============ */
function showDetail(id) {
  const s = STUDIES.find(x => x.id === id); if (!s) return;
  const canEdit = ROLES[currentUser.rol].canEdit;
  const dl = daysLeft(s.limite);
  const limitStyle = dl<0?'color:var(--danger);font-weight:500':dl<=15?'color:var(--warning);font-weight:500':'';
  const studyAudit = AUDIT_LOG.filter(a => a.study === id).slice(0, 6);

  // Helper: render a field as editable or read-only
  const field = (label, key, type='text', opts=null) => {
    const val = s[key] !== undefined ? s[key] : '';
    if (!canEdit) {
      const display = key==='oos' ? (val?'Sí':'No') : (val||'—');
      return `<tr><td>${label}</td><td>${display}</td></tr>`;
    }
    if (type==='bool') {
      return `<tr><td>${label}</td><td><select class="detail-inline-select" onchange="saveField(${id},'${key}',this.value==='Sí')"><option ${val?'selected':''}>Sí</option><option ${!val?'selected':''}>No</option></select></td></tr>`;
    }
    if (type==='select' && opts) {
      const optsHtml = opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('');
      return `<tr><td>${label}</td><td><select class="detail-inline-select" onchange="saveField(${id},'${key}',this.value)">${optsHtml}</select></td></tr>`;
    }
    if (type==='date') {
      const isoVal = val ? val.split('/').reverse().join('-') : '';
      return `<tr><td>${label}</td><td><input type="date" class="detail-inline-input" value="${isoVal}" onchange="saveField(${id},'${key}',fmtDate(this.value))"></td></tr>`;
    }
    if (type==='textarea') {
      return `<tr><td>${label}</td><td><textarea class="detail-inline-textarea" onblur="saveField(${id},'${key}',this.value)">${val||''}</textarea></td></tr>`;
    }
    return `<tr><td>${label}</td><td><input type="text" class="detail-inline-input" value="${val||''}" onblur="saveField(${id},'${key}',this.value)"></td></tr>`;
  };

  const ESTADOS = ['Pendiente','En proceso','Completo','Cancelado'];
  const APROBACIONES = ['—','Aprobado','Rechazado','Pendiente'];
  const CUMPL = ['—','Sí','No'];

  const fc = document.getElementById('full-content');
  fc.dataset.studyId = id;
  fc.innerHTML = `
    <div class="detail-header">
      <button class="btn btn-ghost btn-sm" onclick="showPage('results')">← Volver</button>
      <span class="detail-title">${s.prod} — Lote ${s.lote}</span>
      ${badgeHtml(s.estado)}
      ${s.oos?'<span class="badge badge-oos">OOS</span>':''}
      ${canEdit?`<span class="detail-edit-badge">Modo edición</span>`:`<span class="detail-readonly-badge">Solo lectura</span>`}
      <span style="margin-left:auto;font-size:11px;color:var(--text3);font-family:var(--font-mono)">${s.cod} · ${s.div}</span>
    </div>
    ${canEdit?'<div class="detail-edit-notice">Los campos son editables directamente. Los cambios se guardan al hacer clic fuera del campo y se registran en auditoría.</div>':''}
    <div class="detail-grid">
      <div class="card">
        <div class="card-title">Identificación y ubicación</div>
        <table class="detail-table"><tbody>
          ${field('Código','cod')}
          ${field('Producto','prod')}
          ${field('Lote','lote')}
          ${field('División','div','select',['CH','PH'])}
          ${field('Material de empaque','empaque')}
          ${field('Planta','planta','select',['Planta 1','Planta 2'])}
          ${field('Ubicación física','ubic','select',UBICACIONES[s.planta]||[])}
          ${field('Motivo del ensayo','motivo')}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Fechas y condiciones</div>
        <table class="detail-table"><tbody>
          ${field('Condiciones','cond')}
          ${field('Tiempo de estabilidad','tiempo','select',['3 meses','6 meses','9 meses','12 meses','18 meses','24 meses','36 meses'])}
          ${field('Fecha de elaboración','elab','date')}
          ${field('Fecha entrada a cámara','camara','date')}
          ${field('Fecha de ingreso','ingreso','date')}
          ${field('F. teórica de análisis','teorica','date')}
          <tr><td>F. límite de análisis</td><td>${canEdit?`<input type="date" class="detail-inline-input" value="${s.limite?s.limite.split('/').reverse().join('-'):''}" onchange="saveField(${id},'limite',fmtDate(this.value))" style="${limitStyle}">`:  `<span style="${limitStyle}">${s.limite||'—'}</span>`}</td></tr>
          ${field('F. teórica de salida','salida','date')}
          ${field('F. teórica de liberación','libteor','date')}
          ${field('Fecha de liberación','lib','date')}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Estado y resultado</div>
        <table class="detail-table"><tbody>
          ${field('Estado','estado','select',ESTADOS)}
          ${field('Cumplió','cumpl','select',CUMPL)}
          ${field('Cumpl. estabilidad','cumplEst','select',CUMPL)}
          ${field('Aprobación final','aprob','select',APROBACIONES)}
          ${field('Semana de aprobación','semana')}
          ${field('Condiciones de salida','condsal')}
          ${field('Status','status')}
          ${s.estado==='Cancelado'?field('Motivo cancelación','motivo','textarea'):''}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Análisis fisicoquímico (FQ)</div>
        <table class="detail-table"><tbody>
          ${field('Analista FQ','analistFQ')}
          ${field('F. análisis FQ inicio','fqi','date')}
          ${field('F. análisis FQ fin','fqf','date')}
          ${field('F. validación FQ','fqv','date')}
          ${field('Lleva microbiología','micro','select',['Sí','No'])}
          ${field('Analista microbiología','analistMicro')}
          ${field('F. muestreo micro inicio','msi','date')}
          ${field('F. muestreo micro fin','msf','date')}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Resultados de análisis</div>
        <table class="detail-table"><tbody>
          ${field('Contenido','contenido')}
          ${field('Prod. degradación 1','deg1')}
          ${field('Prod. degradación 2','deg2')}
          ${field('Prod. degradación 3','deg3')}
          ${field('Disolución','disol')}
        </tbody></table>
      </div>
      <div class="card">
        <div class="card-title">Muestreo</div>
        <table class="detail-table"><tbody>
          ${field('Límite inferior','limInf')}
          ${field('Límite superior','limSup')}
          ${field('Corredor','corredor')}
          ${field('Observaciones','obs','textarea')}
        </tbody></table>
      </div>
      ${s.oos?`<div class="card oos-card" style="grid-column:1/-1">
        <div class="card-title oos-title">OOS — Fuera de especificación</div>
        ${canEdit?`<textarea class="detail-inline-textarea" style="width:100%;min-height:60px" onblur="saveField(${id},'oos_obs',this.value)">${s.oos_obs||''}</textarea>`:`<p style="font-size:13px;line-height:1.5">${s.oos_obs||''}</p>`}
      </div>`:''}
      <div class="card" style="grid-column:1/-1">
        <div class="card-title">Historial de auditoría de este estudio</div>
        ${studyAudit.length?studyAudit.map(auditRowHtml).join(''):'<p style="font-size:12px;color:var(--text3)">Sin cambios registrados.</p>'}
      </div>
    </div>`;
  showPage('full');
}

function saveField(studyId, key, newVal) {
  const s = STUDIES.find(x => x.id === studyId); if (!s) return;
  const oldVal = s[key];
  if (String(oldVal) === String(newVal)) return; // sin cambios
  s[key] = newVal;
  AUDIT_LOG.unshift({
    who: currentUser.nombre,
    what: `Editó "${key}" en ${s.prod} (${s.lote}): "${oldVal||'—'}" → "${newVal||'—'}"`,
    when: nowStr(), field: key, old: String(oldVal||''), new: String(newVal||''), study: studyId
  });
  renderAudit();
  // Refrescar el badge de estado en el header del detalle sin re-renderizar todo
  const headerBadges = document.querySelector('.detail-header');
  if (headerBadges && key === 'estado') {
    const badgeEl = headerBadges.querySelector('.badge:not(.badge-oos)');
    if (badgeEl) badgeEl.outerHTML = badgeHtml(newVal);
  }
}

/* ============ AUDIT ============ */
function renderAudit() { const el=document.getElementById('audit-list'); if(el)el.innerHTML=AUDIT_LOG.map(auditRowHtml).join(''); }
function auditRowHtml(a) { return `<div class="audit-row"><div class="audit-who">${a.who}</div><div class="audit-what">${a.what}</div><div class="audit-when">${a.when}</div></div>`; }

/* ============ COND BUILDER ============ */
function updateCondPreview() {
  const tt=document.getElementById('fp-temp-tipo')?.value, ht=document.getElementById('fp-hr-tipo')?.value;
  document.getElementById('cond-temp-exacta')?.classList.toggle('hidden',tt!=='exacta');
  document.getElementById('cond-temp-rango')?.classList.toggle('hidden',tt!=='rango');
  document.getElementById('cond-hr-exacta')?.classList.toggle('hidden',ht!=='exacta');
  document.getElementById('cond-hr-rango')?.classList.toggle('hidden',ht!=='rango');
  let ts='', hs='';
  if(tt==='exacta'){const v=document.getElementById('fp-temp-val')?.value;if(v!=='')ts=`${v}°C`;}
  else if(tt==='rango'){const mn=document.getElementById('fp-temp-min')?.value,mx=document.getElementById('fp-temp-max')?.value;if(mn!==''||mx!=='')ts=`${mn||'?'}–${mx||'?'}°C`;}
  if(ht==='na')hs='N/A';
  else if(ht==='exacta'){const v=document.getElementById('fp-hr-val')?.value;if(v!=='')hs=`${v}% HR`;}
  else if(ht==='rango'){const mn=document.getElementById('fp-hr-min')?.value,mx=document.getElementById('fp-hr-max')?.value;if(mn!==''||mx!=='')hs=`${mn||'?'}–${mx||'?'}% HR`;}
  const prev=document.getElementById('cond-preview');
  if(prev)prev.textContent=(ts&&hs)?`${ts} / ${hs}`:ts||hs||'—';
}
function buildCondString() { const p=document.getElementById('cond-preview')?.textContent||''; return p==='—'?'':p; }

/* ============ FORM ============ */
function bindFormEvents() {
  document.getElementById('fp-planta')?.addEventListener('change',updateFormConditional);
  document.getElementById('fp-estado')?.addEventListener('change',updateFormConditional);
  document.getElementById('fp-oos')?.addEventListener('change',updateFormConditional);
  document.getElementById('fp-micro')?.addEventListener('change',updateFormConditional);
  document.getElementById('fp-temp-tipo')?.addEventListener('change',updateCondPreview);
  document.getElementById('fp-hr-tipo')?.addEventListener('change',updateCondPreview);
  ['fp-ingreso','fp-teorica','fp-limite'].forEach(id=>document.getElementById(id)?.addEventListener('change',validateDates));
}
function updateFormConditional() {
  const planta=document.getElementById('fp-planta')?.value, sel=document.getElementById('fp-ubicfis');
  if(sel)sel.innerHTML=planta?(UBICACIONES[planta]||[]).map(u=>`<option>${u}</option>`).join(''):'<option value="">— seleccione planta primero —</option>';
  document.getElementById('cancel-block').style.display=document.getElementById('fp-estado')?.value==='Cancelado'?'flex':'none';
  document.getElementById('oos-block').style.display=document.getElementById('fp-oos')?.value==='Sí'?'flex':'none';
  const micro=document.getElementById('fp-micro')?.value;
  ['micro-ini','micro-fin','micro-na'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=micro==='Sí'?'':'none';});
  const am=document.getElementById('fp-anmicro');if(am)am.disabled=micro!=='Sí';
}
function validateDates() {
  const ing=document.getElementById('fp-ingreso')?.value, teo=document.getElementById('fp-teorica')?.value, lim=document.getElementById('fp-limite')?.value; let ok=true;
  const errIng=document.getElementById('err-ingreso'),inpIng=document.getElementById('fp-ingreso');
  if(!ing){errIng?.classList.remove('hidden');inpIng?.classList.add('error');ok=false;}else{errIng?.classList.add('hidden');inpIng?.classList.remove('error');}
  const errTeo=document.getElementById('err-teorica'),inpTeo=document.getElementById('fp-teorica');
  if(!teo||(ing&&teo<=ing)){errTeo?.classList.remove('hidden');inpTeo?.classList.add('error');ok=false;}else{errTeo?.classList.add('hidden');inpTeo?.classList.remove('error');}
  const errLim=document.getElementById('err-limite'),inpLim=document.getElementById('fp-limite');
  if(!lim||(teo&&lim<=teo)){errLim?.classList.remove('hidden');inpLim?.classList.add('error');ok=false;}else{errLim?.classList.add('hidden');inpLim?.classList.remove('error');}
  return ok;
}
function submitForm() {
  const prod=document.getElementById('fp-prod')?.value.trim(), planta=document.getElementById('fp-planta')?.value, lote=document.getElementById('fp-lote')?.value.trim(), cod=document.getElementById('fp-cod')?.value.trim(), cond=buildCondString();
  const missing=[]; if(!planta)missing.push('Planta'); if(!cod)missing.push('Código'); if(!prod)missing.push('Producto'); if(!lote)missing.push('Lote'); if(!cond)missing.push('Condiciones (temperatura)');
  if(missing.length){alert('Complete los campos obligatorios:\n• '+missing.join('\n• '));return;}
  if(!validateDates()){alert('Corrija los errores de fechas.');return;}
  const ns={id:STUDIES.length+1,cod,prod,lote,planta,cond,ubic:document.getElementById('fp-ubicfis')?.value||'',div:document.getElementById('fp-div')?.value||'',tiempo:document.getElementById('fp-tiempo')?.value||'',ingreso:fmtDate(document.getElementById('fp-ingreso')?.value),teorica:fmtDate(document.getElementById('fp-teorica')?.value),limite:fmtDate(document.getElementById('fp-limite')?.value),estado:document.getElementById('fp-estado')?.value||'Pendiente',oos:document.getElementById('fp-oos')?.value==='Sí',oos_obs:document.getElementById('fp-oos-obs')?.value||'',cumpl:document.getElementById('fp-cumplio')?.value||'',aprob:document.getElementById('fp-aprob')?.value||'Pendiente',analistFQ:document.getElementById('fp-anfq')?.value||'',analistMicro:document.getElementById('fp-anmicro')?.value||'',micro:document.getElementById('fp-micro')?.value||'No',contenido:document.getElementById('fp-contenido')?.value||'',deg1:document.getElementById('fp-deg1')?.value||'',deg2:document.getElementById('fp-deg2')?.value||'',deg3:document.getElementById('fp-deg3')?.value||'',disol:document.getElementById('fp-disol')?.value||'',obs:document.getElementById('fp-obs')?.value||'',elab:fmtDate(document.getElementById('fp-elab')?.value),camara:fmtDate(document.getElementById('fp-camara')?.value),fqi:fmtDate(document.getElementById('fp-fqi')?.value),fqf:fmtDate(document.getElementById('fp-fqf')?.value),fqv:fmtDate(document.getElementById('fp-fqv')?.value),msi:fmtDate(document.getElementById('fp-msi')?.value)||'N/A',msf:fmtDate(document.getElementById('fp-msf')?.value)||'N/A',motivo:document.getElementById('fp-motivo')?.value||'',empaque:document.getElementById('fp-empaque')?.value||'',condsal:document.getElementById('fp-condsal')?.value||'',semana:document.getElementById('fp-semana')?.value||'',status:'Pendiente',limInf:document.getElementById('fp-lim-inf')?.value||'',limSup:document.getElementById('fp-lim-sup')?.value||'',corredor:document.getElementById('fp-corredor')?.value||'',cumplEst:document.getElementById('fp-cumpl')?.value||'',salida:fmtDate(document.getElementById('fp-salida')?.value),libteor:fmtDate(document.getElementById('fp-libteor')?.value),lib:fmtDate(document.getElementById('fp-lib')?.value)};
  STUDIES.push(ns);
  AUDIT_LOG.unshift({who:currentUser.nombre,what:`Creó estudio: ${prod} (${lote}) · ${planta}`,when:nowStr(),field:'creación',old:'',new:lote,study:ns.id});
  renderDashboard(); renderAudit();
  alert(`Estudio guardado.\n\nProducto: ${prod}\nLote: ${lote}\nCondiciones: ${cond}`);
  showPage('results');
}

/* ============ ADMIN MODULE ============ */
function bindAdminModule() {
  document.getElementById('btn-new-user')?.addEventListener('click', ()=>{
    editingUserId = null;
    document.getElementById('user-form-title').textContent = 'Nuevo usuario';
    ['uf-nombre','uf-usuario','uf-email'].forEach(id=>{ const el=document.getElementById(id); if(el)el.value=''; });
    document.getElementById('uf-rol').value='';
    document.getElementById('uf-planta').value='todas';
    document.getElementById('uf-estado').value='activo';
    document.getElementById('user-form-card').style.display='';
  });
  document.getElementById('btn-cancel-user')?.addEventListener('click', ()=>{ document.getElementById('user-form-card').style.display='none'; editingUserId=null; });
  document.getElementById('btn-save-user')?.addEventListener('click', saveUser);
}

function saveUser() {
  const nombre  = document.getElementById('uf-nombre')?.value.trim();
  const usuario = document.getElementById('uf-usuario')?.value.trim();
  const email   = document.getElementById('uf-email')?.value.trim();
  const rol     = document.getElementById('uf-rol')?.value;
  if (!nombre||!usuario||!email||!rol) { alert('Complete todos los campos obligatorios.'); return; }
  if (editingUserId) {
    const u = USERS_LIST.find(x=>x.id===editingUserId);
    if (u) { const oldRol=u.rol; Object.assign(u,{nombre,usuario,email,rol,planta:document.getElementById('uf-planta')?.value||'todas',estado:document.getElementById('uf-estado')?.value||'activo'});
      AUDIT_LOG.unshift({who:currentUser.nombre,what:`Editó usuario ${usuario}: rol "${oldRol}" → "${rol}"`,when:nowStr(),field:'usuario',old:oldRol,new:rol,study:null});
    }
  } else {
    const initials = nombre.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    USERS_LIST.push({id:USERS_LIST.length+1,nombre,usuario,email,rol,planta:document.getElementById('uf-planta')?.value||'todas',estado:document.getElementById('uf-estado')?.value||'activo',lastLogin:'Nunca',initials});
    AUDIT_LOG.unshift({who:currentUser.nombre,what:`Creó usuario ${usuario} con rol ${rol}`,when:nowStr(),field:'usuario',old:'',new:usuario,study:null});
  }
  document.getElementById('user-form-card').style.display='none';
  editingUserId=null;
  renderUsersTable(); renderUserList(); renderAudit();
}

function editUser(id) {
  const u=USERS_LIST.find(x=>x.id===id); if(!u)return;
  editingUserId=id;
  document.getElementById('user-form-title').textContent='Editar usuario';
  document.getElementById('uf-nombre').value=u.nombre;
  document.getElementById('uf-usuario').value=u.usuario;
  document.getElementById('uf-email').value=u.email;
  document.getElementById('uf-rol').value=u.rol;
  document.getElementById('uf-planta').value=u.planta;
  document.getElementById('uf-estado').value=u.estado;
  document.getElementById('user-form-card').style.display='';
  document.getElementById('user-form-card').scrollIntoView({behavior:'smooth'});
}

function toggleUserStatus(id) {
  const u=USERS_LIST.find(x=>x.id===id); if(!u)return;
  if(u.id===currentUser.id){alert('No podés desactivar tu propio usuario.');return;}
  u.estado=u.estado==='activo'?'inactivo':'activo';
  AUDIT_LOG.unshift({who:currentUser.nombre,what:`${u.estado==='activo'?'Activó':'Desactivó'} usuario ${u.usuario}`,when:nowStr(),field:'estado',old:u.estado==='activo'?'inactivo':'activo',new:u.estado,study:null});
  renderUsersTable(); renderUserList(); renderAudit();
}

function renderUsersTable() {
  const tbody=document.getElementById('users-tbody'); if(!tbody)return;
  const isAdmin=ROLES[currentUser.rol].canAdmin;
  const ROLE_COLORS={'viewer':'#888780','analyst':'#185FA5','supervisor':'#854F0B','admin':'#3B6D11'};
  tbody.innerHTML=USERS_LIST.map(u=>{
    const role=ROLES[u.rol]||{}; const isMe=u.id===currentUser.id;
    return `<tr style="${isMe?'background:var(--accent-light)':''}">
      <td><div style="display:flex;align-items:center;gap:8px"><div style="width:26px;height:26px;border-radius:50%;background:${ROLE_COLORS[u.rol]||'#888'}22;color:${ROLE_COLORS[u.rol]||'#888'};font-size:10px;font-weight:500;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono)">${u.initials}</div>${u.nombre}${isMe?' <span style="font-size:10px;color:var(--accent);font-family:var(--font-mono)">(tú)</span>':''}</div></td>
      <td style="font-family:var(--font-mono);font-size:11px">${u.usuario}</td>
      <td style="font-size:11px;color:var(--text2)">${u.email}</td>
      <td><span style="background:${ROLE_COLORS[u.rol]||'#888'}22;color:${ROLE_COLORS[u.rol]||'#888'};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:500;font-family:var(--font-mono)">${role.label||u.rol}</span></td>
      <td style="font-size:12px">${u.planta==='todas'?'Todas':u.planta}</td>
      <td><span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;background:${u.estado==='activo'?'var(--success-light)':'var(--surface2)'};color:${u.estado==='activo'?'var(--success-text)':'var(--text3)'}">${u.estado==='activo'?'Activo':'Inactivo'}</span></td>
      <td style="font-size:11px;color:var(--text3);font-family:var(--font-mono)">${u.lastLogin}</td>
      <td>${isAdmin?`<div style="display:flex;gap:6px"><button class="btn btn-sm btn-ghost" onclick="editUser(${u.id})">Editar</button><button class="btn btn-sm btn-ghost" style="color:${u.estado==='activo'?'var(--danger)':'var(--success)'}" onclick="toggleUserStatus(${u.id})">${u.estado==='activo'?'Desactivar':'Activar'}</button></div>`:'—'}</td>
    </tr>`;
  }).join('');
}

function renderPermissionsMatrix() {
  const tbody=document.getElementById('perms-tbody'); if(!tbody)return;
  const check='<span style="color:var(--success);font-size:14px">✓</span>', cross='<span style="color:var(--text3);font-size:13px">—</span>';
  tbody.innerHTML=PERMISSIONS_MATRIX.map((p,i)=>`<tr style="${i%2===0?'background:var(--surface2)':''}">
    <td style="padding:7px 12px;color:var(--text2)">${p.action}</td>
    <td style="text-align:center;padding:7px 12px">${p.viewer?check:cross}</td>
    <td style="text-align:center;padding:7px 12px">${p.analyst?check:cross}</td>
    <td style="text-align:center;padding:7px 12px">${p.supervisor?check:cross}</td>
    <td style="text-align:center;padding:7px 12px">${p.admin?check:cross}</td>
  </tr>`).join('');
}

/* ============ EXPORT ============ */
function bindExport() {
  document.getElementById('btn-export-toggle')?.addEventListener('click',e=>{e.stopPropagation();document.getElementById('export-dropdown')?.classList.toggle('hidden');});
  document.getElementById('btn-export-csv')?.addEventListener('click',()=>{document.getElementById('export-dropdown')?.classList.add('hidden');exportCSV(applyFilters(),'estudios_estabilidad');});
  document.getElementById('btn-export-xlsx')?.addEventListener('click',()=>{document.getElementById('export-dropdown')?.classList.add('hidden');exportXLSX(applyFilters(),'estudios_estabilidad');});
  document.getElementById('btn-export-audit')?.addEventListener('click',exportAuditCSV);
}

function getExportRows(data) {
  const headers=['ID','Código','Producto','Lote','División','Planta','Ubicación física','Condiciones','Tiempo','Fecha ingreso','F. teórica','F. límite','Estado','OOS','OOS Obs.','Cumplió','Aprobación','Analista FQ','Analista Micro','Contenido','Deg.1','Deg.2','Deg.3','Disolución','Límite inf.','Límite sup.','Corredor','Observaciones'];
  const rows=data.map(s=>[s.id,s.cod,s.prod,s.lote,s.div,s.planta,s.ubic,s.cond,s.tiempo,s.ingreso,s.teorica,s.limite,s.estado,s.oos?'Sí':'No',s.oos_obs||'',s.cumpl||'',s.aprob||'',s.analistFQ||'',s.analistMicro||'',s.contenido||'',s.deg1||'',s.deg2||'',s.deg3||'',s.disol||'',s.limInf||'',s.limSup||'',s.corredor||'',s.obs||'']);
  return {headers,rows};
}

function exportCSV(data,filename) {
  const {headers,rows}=getExportRows(data);
  const all=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
  triggerDownload(new Blob(['\uFEFF'+all.join('\n')],{type:'text/csv;charset=utf-8;'}),filename+'_'+dateStamp()+'.csv');
}

function exportXLSX(data, filename) {
  if (typeof XLSX === 'undefined') { alert('SheetJS no disponible. Verifique conexión a internet.'); return; }
  const { headers, rows } = getExportRows(data);

  // Colores por estado
  const STATUS_FILL = { 'Completo':'C6EFCE', 'En proceso':'FFEB9C', 'Pendiente':'BDD7EE', 'Cancelado':'D9D9D9' };
  const OOS_FILL    = 'FFC7CE';
  const HEADER_FILL = '1F5FA5';

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Anchos de columna
  ws['!cols'] = headers.map((h,i) => ({ wch: Math.min(Math.max(h.length, ...rows.map(r=>String(r[i]||'').length))+2, 40) }));

  // Altura de fila del header
  ws['!rows'] = [{ hpt: 20 }];

  // Estilos de encabezado
  headers.forEach((_, i) => {
    const ref = XLSX.utils.encode_cell({ r:0, c:i });
    if (!ws[ref]) return;
    ws[ref].s = {
      font:    { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill:    { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border:  { bottom: { style: 'medium', color: { rgb: 'FFFFFF' } } }
    };
  });

  // Estilos de filas de datos
  rows.forEach((row, ri) => {
    const estadoIdx  = headers.indexOf('Estado');
    const oosIdx     = headers.indexOf('OOS');
    const estado     = row[estadoIdx];
    const esOOS      = row[oosIdx] === 'Sí';
    const rowFill    = esOOS ? OOS_FILL : (STATUS_FILL[estado] || null);
    const isEven     = ri % 2 === 0;

    row.forEach((_, ci) => {
      const ref = XLSX.utils.encode_cell({ r: ri+1, c: ci });
      if (!ws[ref]) return;
      const baseFill = rowFill || (isEven ? 'F5F4F0' : 'FFFFFF');
      ws[ref].s = {
        fill:      { fgColor: { rgb: baseFill } },
        font:      { sz: 10 },
        alignment: { vertical: 'center', wrapText: false },
        border: {
          top:    { style: 'thin', color: { rgb: 'E2E0D8' } },
          bottom: { style: 'thin', color: { rgb: 'E2E0D8' } },
          left:   { style: 'thin', color: { rgb: 'E2E0D8' } },
          right:  { style: 'thin', color: { rgb: 'E2E0D8' } }
        }
      };
      // Negrita en columnas clave
      if (['Producto','Lote','Estado'].includes(headers[ci])) ws[ref].s.font.bold = true;
      // Rojo para OOS = Sí
      if (headers[ci]==='OOS' && esOOS) ws[ref].s.font.color = { rgb: 'A32D2D' };
    });
  });

  // Segunda hoja: auditoría
  const auditHeaders = ['Usuario','Acción','Campo','Valor anterior','Valor nuevo','Fecha y hora','Estudio ID'];
  const auditRows    = AUDIT_LOG.map(a=>[a.who,a.what,a.field||'',a.old||'',a.new||'',a.when,a.study||'']);
  const ws2 = XLSX.utils.aoa_to_sheet([auditHeaders,...auditRows]);
  ws2['!cols'] = auditHeaders.map((_,i)=>({wch:Math.min(Math.max(auditHeaders[i].length,...auditRows.map(r=>String(r[i]||'').length))+2,50)}));
  auditHeaders.forEach((_,i)=>{ const ref=XLSX.utils.encode_cell({r:0,c:i}); if(ws2[ref])ws2[ref].s={font:{bold:true,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:HEADER_FILL}},alignment:{horizontal:'center'}}; });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws,  'Estudios de Estabilidad');
  XLSX.utils.book_append_sheet(wb, ws2, 'Auditoría');
  XLSX.writeFile(wb, filename + '_' + dateStamp() + '.xlsx');
}

function exportAuditCSV() {
  const h=['Usuario','Acción','Valor anterior','Valor nuevo','Fecha y hora','Estudio ID'];
  const r=AUDIT_LOG.map(a=>[a.who,a.what,a.old||'',a.new||'',a.when,a.study||'']);
  triggerDownload(new Blob(['\uFEFF'+[h,...r].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv;charset=utf-8;'}),'auditoria_stabilityqc_'+dateStamp()+'.csv');
}

function triggerDownload(blob, filename) { const url=URL.createObjectURL(blob),a=document.createElement('a'); a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url); }

/* ============ HELPERS ============ */
function badgeHtml(estado) { const m={'Pendiente':'badge-pendiente','En proceso':'badge-proceso','Completo':'badge-completo','Cancelado':'badge-cancelado'}; return `<span class="badge ${m[estado]||''}">${estado}</span>`; }
function setEl(id,val) { const el=document.getElementById(id);if(el)el.textContent=val; }
function fmtDate(val) { if(!val)return''; const [y,m,d]=val.split('-'); return`${d}/${m}/${y}`; }
function nowStr() { const n=new Date(); return`${pad(n.getDate())}/${pad(n.getMonth()+1)}/${n.getFullYear()} ${pad(n.getHours())}:${pad(n.getMinutes())}`; }
function dateStamp() { const n=new Date(); return`${n.getFullYear()}${pad(n.getMonth()+1)}${pad(n.getDate())}`; }
function pad(v) { return String(v).padStart(2,'0'); }
