/* data.js — Datos de ejemplo para StabilityQC demo */
/* En producción estos datos vienen de la API REST */

const UBICACIONES = {
  'Planta 1': ['Campana N°1','Campana N°2','Campana N°3','Campana N°4','Campana N°5','Refrigeración A'],
  'Planta 2': ['Campana N°3','Campana N°6','Campana N°7','Refrigeración B','Estufa 1','Zona controlada']
};

const LEGEND_DATA = [
  { label: 'Completos',  count: 18, color: '#27500A' },
  { label: 'En proceso', count: 10, color: '#EF9F27' },
  { label: 'Pendientes', count:  4, color: '#185FA5' },
  { label: 'Cancelados', count:  2, color: '#888780' },
  { label: 'Vencidos',   count:  5, color: '#E24B4A' },
];

const STUDIES = [
  {
    id: 1, cod: 'PRD-00421', prod: 'Amoxicilina 500mg', lote: 'L240118',
    cond: '25°C / 60%HR', tiempo: '12 meses',
    ingreso: '15/01/2024', teorica: '15/01/2025', limite: '18/04/2026',
    estado: 'En proceso', oos: true, oos_obs: 'pH fuera de rango superior en tiempo T=6m. Investigación en curso.',
    planta: 'Planta 1', ubic: 'Campana N°3', div: 'PH',
    analistFQ: 'M. García', analistMicro: 'T. Romero', micro: 'Sí',
    aprob: 'Pendiente', cumpl: 'No', elab: '10/01/2024', camara: '15/01/2024',
    fqi: '15/01/2025', fqf: '20/01/2025', fqv: '22/01/2025',
    msi: '15/01/2025', msf: '17/01/2025',
    contenido: '97.2%', deg1: '0.18%', deg2: '0.09%', deg3: 'ND', disol: 'Q = 85%',
    condsal: '', semana: '', status: 'En revisión QA',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: 'No',
    salida: '', libteor: '', lib: '', motivo: 'Estabilidad en curso 12 meses',
    empaque: 'Blíster PVC/PVDC', obs: 'Pendiente resolución OOS.'
  },
  {
    id: 2, cod: 'PRD-00318', prod: 'Ibuprofeno 400mg', lote: 'L240203',
    cond: '30°C / 75%HR', tiempo: '6 meses',
    ingreso: '03/02/2024', teorica: '03/08/2024', limite: '26/04/2026',
    estado: 'En proceso', oos: false, oos_obs: '',
    planta: 'Planta 2', ubic: 'Refrigeración A', div: 'CH',
    analistFQ: 'S. López', analistMicro: 'N/A', micro: 'No',
    aprob: 'Pendiente', cumpl: 'Sí', elab: '01/02/2024', camara: '03/02/2024',
    fqi: '03/08/2024', fqf: '08/08/2024', fqv: '10/08/2024',
    msi: 'N/A', msf: 'N/A',
    contenido: '99.1%', deg1: '0.07%', deg2: 'ND', deg3: 'ND', disol: 'Q = 91%',
    condsal: 'Conformes', semana: 'S08-2026', status: 'Aprobación pendiente',
    limInf: '95.0%', limSup: '105.0%', corredor: '±3%', cumplEst: 'Sí',
    salida: '10/08/2024', libteor: '15/08/2024', lib: '', motivo: 'Acelerado 6M',
    empaque: 'Frasco HDPE', obs: ''
  },
  {
    id: 3, cod: 'PRD-00512', prod: 'Metformina 850mg', lote: 'L240115',
    cond: '40°C / 75%HR', tiempo: '3 meses',
    ingreso: '15/01/2024', teorica: '15/04/2024', limite: '02/05/2026',
    estado: 'Pendiente', oos: false, oos_obs: '',
    planta: 'Planta 1', ubic: 'Campana N°5', div: 'PH',
    analistFQ: 'R. Pérez', analistMicro: 'N/A', micro: 'No',
    aprob: 'Pendiente', cumpl: '', elab: '10/01/2024', camara: '15/01/2024',
    fqi: '', fqf: '', fqv: '', msi: 'N/A', msf: 'N/A',
    contenido: '', deg1: '', deg2: '', deg3: '', disol: '',
    condsal: '', semana: '', status: 'Aguardando inicio',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: '',
    salida: '', libteor: '', lib: '', motivo: 'Acelerado 3M',
    empaque: 'Blíster aluminio', obs: 'Pendiente asignación analista.'
  },
  {
    id: 4, cod: 'PRD-00189', prod: 'Atorvastatina 10mg', lote: 'L240220',
    cond: '25°C / 60%HR', tiempo: '18 meses',
    ingreso: '20/02/2024', teorica: '20/08/2025', limite: '08/05/2026',
    estado: 'En proceso', oos: false, oos_obs: '',
    planta: 'Planta 2', ubic: 'Campana N°3', div: 'CH',
    analistFQ: 'M. García', analistMicro: 'T. Romero', micro: 'Sí',
    aprob: 'Pendiente', cumpl: 'Sí', elab: '18/02/2024', camara: '20/02/2024',
    fqi: '20/08/2025', fqf: '25/08/2025', fqv: '28/08/2025',
    msi: '20/08/2025', msf: '22/08/2025',
    contenido: '100.3%', deg1: '0.05%', deg2: 'ND', deg3: 'ND', disol: 'Q = 89%',
    condsal: 'Conformes', semana: '', status: 'En proceso',
    limInf: '92.0%', limSup: '108.0%', corredor: '±4%', cumplEst: 'Sí',
    salida: '28/08/2025', libteor: '05/09/2025', lib: '', motivo: 'Largo plazo 18M',
    empaque: 'Blíster PVC/PE/PVDC', obs: ''
  },
  {
    id: 5, cod: 'PRD-00634', prod: 'Losartán 50mg', lote: 'L240198',
    cond: '30°C / 65%HR', tiempo: '24 meses',
    ingreso: '18/01/2024', teorica: '18/01/2026', limite: '11/05/2026',
    estado: 'Pendiente', oos: false, oos_obs: '',
    planta: 'Planta 1', ubic: 'Refrigeración A', div: 'PH',
    analistFQ: 'S. López', analistMicro: 'N/A', micro: 'No',
    aprob: 'Pendiente', cumpl: '', elab: '15/01/2024', camara: '18/01/2024',
    fqi: '', fqf: '', fqv: '', msi: 'N/A', msf: 'N/A',
    contenido: '', deg1: '', deg2: '', deg3: '', disol: '',
    condsal: '', semana: '', status: 'Esperando tiempo T=24M',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: '',
    salida: '', libteor: '', lib: '', motivo: 'Largo plazo 24M',
    empaque: 'Blíster aluminio/aluminio', obs: ''
  },
  {
    id: 6, cod: 'PRD-00221', prod: 'Omeprazol 20mg', lote: 'L231198',
    cond: '25°C / 60%HR', tiempo: '24 meses',
    ingreso: '01/12/2023', teorica: '01/12/2025', limite: '15/03/2026',
    estado: 'Completo', oos: false, oos_obs: '',
    planta: 'Planta 1', ubic: 'Campana N°3', div: 'PH',
    analistFQ: 'R. Pérez', analistMicro: 'T. Romero', micro: 'Sí',
    aprob: 'Aprobado', cumpl: 'Sí', elab: '28/11/2023', camara: '01/12/2023',
    fqi: '01/12/2025', fqf: '05/12/2025', fqv: '08/12/2025',
    msi: '01/12/2025', msf: '03/12/2025',
    contenido: '98.9%', deg1: '0.11%', deg2: '0.04%', deg3: 'ND', disol: 'Q = 88%',
    condsal: 'Conformes', semana: 'S02-2026', status: 'Liberado',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: 'Sí',
    salida: '08/12/2025', libteor: '10/12/2025', lib: '12/12/2025',
    motivo: 'Largo plazo 24M', empaque: 'Blíster Al/Al',
    obs: 'Estudio finalizado satisfactoriamente.'
  },
  {
    id: 7, cod: 'PRD-00409', prod: 'Ciprofloxacino 500mg', lote: 'L231045',
    cond: '30°C / 75%HR', tiempo: '12 meses',
    ingreso: '15/10/2023', teorica: '15/10/2024', limite: '20/01/2026',
    estado: 'Completo', oos: false, oos_obs: '',
    planta: 'Planta 2', ubic: 'Campana N°6', div: 'CH',
    analistFQ: 'M. García', analistMicro: 'N/A', micro: 'No',
    aprob: 'Aprobado', cumpl: 'Sí', elab: '12/10/2023', camara: '15/10/2023',
    fqi: '15/10/2024', fqf: '18/10/2024', fqv: '21/10/2024',
    msi: 'N/A', msf: 'N/A',
    contenido: '101.1%', deg1: '0.06%', deg2: 'ND', deg3: 'ND', disol: 'Q = 92%',
    condsal: 'Conformes', semana: 'S45-2024', status: 'Liberado',
    limInf: '95.0%', limSup: '105.0%', corredor: '±3%', cumplEst: 'Sí',
    salida: '21/10/2024', libteor: '25/10/2024', lib: '28/10/2024',
    motivo: 'Estabilidad en curso 12M', empaque: 'Frasco vidrio tipo III', obs: ''
  },
  {
    id: 8, cod: 'PRD-00502', prod: 'Paracetamol 500mg', lote: 'L231201',
    cond: '40°C / 75%HR', tiempo: '6 meses',
    ingreso: '01/12/2023', teorica: '01/06/2024', limite: '10/02/2026',
    estado: 'Cancelado', oos: false, oos_obs: '',
    planta: 'Planta 1', ubic: 'Campana N°4', div: 'PH',
    analistFQ: 'S. López', analistMicro: 'N/A', micro: 'No',
    aprob: '—', cumpl: '', elab: '28/11/2023', camara: '01/12/2023',
    fqi: '', fqf: '', fqv: '', msi: 'N/A', msf: 'N/A',
    contenido: '', deg1: '', deg2: '', deg3: '', disol: '',
    condsal: '', semana: '', status: 'Cancelado',
    limInf: '', limSup: '', corredor: '', cumplEst: '',
    salida: '', libteor: '', lib: '',
    motivo: 'Falla en cámara de estabilidad. Condiciones no garantizadas.',
    empaque: 'Blíster PVC/Al', obs: 'Estudio cancelado por falla en equipo de almacenamiento.'
  },
  {
    id: 9, cod: 'PRD-00311', prod: 'Amlodipina 5mg', lote: 'L240089',
    cond: '25°C / 60%HR', tiempo: '18 meses',
    ingreso: '10/01/2024', teorica: '10/07/2025', limite: '05/04/2026',
    estado: 'En proceso', oos: true, oos_obs: 'Disolución por debajo del mínimo requerido (Q=72% vs Q≥80%).',
    planta: 'Planta 2', ubic: 'Campana N°7', div: 'CH',
    analistFQ: 'R. Pérez', analistMicro: 'T. Romero', micro: 'Sí',
    aprob: 'Pendiente', cumpl: 'No', elab: '05/01/2024', camara: '10/01/2024',
    fqi: '10/07/2025', fqf: '15/07/2025', fqv: '18/07/2025',
    msi: '10/07/2025', msf: '12/07/2025',
    contenido: '98.5%', deg1: '0.14%', deg2: '0.05%', deg3: 'ND', disol: 'Q = 72%',
    condsal: 'No conformes', semana: '', status: 'Investigación OOS',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: 'No',
    salida: '', libteor: '', lib: '', motivo: 'Largo plazo 18M',
    empaque: 'Blíster PVC/PVDC', obs: 'Abierta investigación OOS. Retesteo en curso.'
  },
  {
    id: 10, cod: 'PRD-00718', prod: 'Warfarina 5mg', lote: 'L240301',
    cond: '25°C / 60%HR', tiempo: '36 meses',
    ingreso: '01/03/2024', teorica: '01/03/2027', limite: '30/06/2027',
    estado: 'En proceso', oos: false, oos_obs: '',
    planta: 'Planta 2', ubic: 'Zona controlada', div: 'PH',
    analistFQ: 'M. García', analistMicro: 'T. Romero', micro: 'Sí',
    aprob: 'Pendiente', cumpl: 'Sí', elab: '28/02/2024', camara: '01/03/2024',
    fqi: '', fqf: '', fqv: '', msi: '', msf: '',
    contenido: '', deg1: '', deg2: '', deg3: '', disol: '',
    condsal: '', semana: '', status: 'T=0 completado',
    limInf: '90.0%', limSup: '110.0%', corredor: '±5%', cumplEst: '',
    salida: '', libteor: '', lib: '', motivo: 'Largo plazo 36M',
    empaque: 'Blíster aluminio/aluminio', obs: 'Próximo análisis: T=12M (03/2025)'
  },
];

/* Datos de tendencia por quarter — separados por planta */
const QUARTERS_TODAS = [
  { q: 'Q1 2025', pct: 82 },
  { q: 'Q2 2025', pct: 85 },
  { q: 'Q3 2025', pct: 79 },
  { q: 'Q4 2025', pct: 88 },
  { q: 'Q1 2026', pct: 87 },
];

const QUARTERS_P1 = [
  { q: 'Q1 2025', pct: 78 },
  { q: 'Q2 2025', pct: 83 },
  { q: 'Q3 2025', pct: 75 },
  { q: 'Q4 2025', pct: 90 },
  { q: 'Q1 2026', pct: 85 },
];

const QUARTERS_P2 = [
  { q: 'Q1 2025', pct: 86 },
  { q: 'Q2 2025', pct: 88 },
  { q: 'Q3 2025', pct: 83 },
  { q: 'Q4 2025', pct: 86 },
  { q: 'Q1 2026', pct: 89 },
];

const AUDIT_LOG = [
  { who: 'M. García',  what: 'Cambió estado de Amoxicilina 500mg (L240118): "Pendiente" → "En proceso"', when: '14/04/2026 09:12', field: 'estado', old: 'Pendiente', new: 'En proceso', study: 1 },
  { who: 'S. López',   what: 'Registró OOS en Amlodipina 5mg (L240089): Disolución por debajo del mínimo', when: '13/04/2026 16:45', field: 'oos', old: 'No', new: 'Sí', study: 9 },
  { who: 'R. Pérez',   what: 'Actualizó fecha análisis FQ fin en Omeprazol 20mg (L231198): "" → "05/12/2025"', when: '13/04/2026 14:22', field: 'fqf', old: '', new: '05/12/2025', study: 6 },
  { who: 'Admin',      what: 'Creó nuevo usuario: J. Fernández · rol Viewer · Planta 2', when: '12/04/2026 11:08', field: 'usuario', old: '', new: 'J. Fernández', study: null },
  { who: 'M. García',  what: 'Completó estudio Ciprofloxacino 500mg (L231045): aprobación final = Aprobado', when: '11/04/2026 10:31', field: 'aprob', old: 'Pendiente', new: 'Aprobado', study: 7 },
  { who: 'S. López',   what: 'Editó observaciones en Losartán 50mg (L240198)', when: '10/04/2026 15:55', field: 'obs', old: '', new: 'Esperando tiempo T=24M', study: 5 },
  { who: 'R. Pérez',   what: 'Canceló estudio Paracetamol 500mg (L231201): motivo ingresado', when: '09/04/2026 13:40', field: 'estado', old: 'En proceso', new: 'Cancelado', study: 8 },
  { who: 'M. García',  what: 'Cargó resultados FQ en Ibuprofeno 400mg (L240203): Contenido 99.1%, Disol. Q=91%', when: '08/04/2026 08:27', field: 'resultados', old: '', new: 'Cargados', study: 2 },
  { who: 'Admin',      what: 'Exportó tabla completa a CSV (10 registros, sin filtros activos)', when: '07/04/2026 16:00', field: 'export', old: '', new: 'CSV', study: null },
  { who: 'S. López',   what: 'Creó estudio: Warfarina 5mg (L240301) · Planta 2 · Zona controlada', when: '01/03/2024 09:05', field: 'creación', old: '', new: 'L240301', study: 10 },
  { who: 'R. Pérez',   what: 'Actualizó analista FQ de Metformina 850mg (L240115): "" → "R. Pérez"', when: '16/01/2024 10:20', field: 'analistFQ', old: '', new: 'R. Pérez', study: 3 },
  { who: 'M. García',  what: 'Creó estudio: Amoxicilina 500mg (L240118) · Planta 1 · Campana N°3', when: '15/01/2024 08:30', field: 'creación', old: '', new: 'L240118', study: 1 },
];
