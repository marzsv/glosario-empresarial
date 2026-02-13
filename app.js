// ===== GLOSSARY DATA (loaded from terms.json) =====
let terms = [];

// Map JSON format to internal format
function mapTerms(data) {
  return data.map(t => ({
    term: t.term,
    cat: t.category,
    desc: t.description,
    ex: t.examples
  }));
}

// ===== RENDER =====
const cats = ['Todos','Legal','Contable','Fiscal','Registral','Laboral','Institucional'];
const catColors = {Legal:'#7c3aed',Contable:'#0891b2',Fiscal:'#dc2626',Registral:'#ea580c',Laboral:'#16a34a',Institucional:'#6366f1'};
let activeCat = 'Todos';
let searchQuery = '';

function init(){
  // stats
  document.getElementById('total-count').textContent = terms.length;
  document.getElementById('cat-count').textContent = cats.length - 1;

  // tabs
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = '';
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (c === 'Todos' ? ' active' : '');
    btn.dataset.cat = c;
    btn.textContent = c;
    btn.onclick = () => {
      activeCat = c;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      render();
    };
    tabsEl.appendChild(btn);
  });

  // search
  document.getElementById('search').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  // nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.nav-tab').forEach(n => n.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(t.dataset.view).classList.add('active');
    };
  });

  render();
  animateBars();
}

function render(){
  const container = document.getElementById('glossary');
  const filtered = terms.filter(t => {
    const matchCat = activeCat === 'Todos' || t.cat === activeCat;
    const matchSearch = !searchQuery || t.term.toLowerCase().includes(searchQuery) || t.desc.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if(!filtered.length){
    container.innerHTML = '<div class="no-results">🔍 No se encontraron términos. Intentá con otra búsqueda.</div>';
    return;
  }

  // Group by category
  const groups = {};
  filtered.forEach(t => {
    if(!groups[t.cat]) groups[t.cat] = [];
    groups[t.cat].push(t);
  });

  let html = '';
  for(const cat of cats.slice(1)){
    if(!groups[cat]) continue;
    html += `<div class="section-title">${cat} <span class="count-badge">${groups[cat].length}</span></div>`;
    groups[cat].forEach(t => {
      html += `<div class="card cat-${t.cat}" onclick="this.classList.toggle('open')">
        <div class="card-header">
          <span class="arrow">▶</span>
          <span class="cat-dot"></span>
          <h3>${highlight(t.term)}</h3>
          <span class="cat-label">${t.cat}</span>
        </div>
        <div class="card-body">
          <p class="desc">${highlight(t.desc)}</p>
          <div class="examples">
            <h4>📌 Ejemplos prácticos</h4>
            ${t.ex.map(e => `<div class="example">${highlight(e)}</div>`).join('')}
          </div>
        </div>
      </div>`;
    });
  }
  container.innerHTML = html;
}

function highlight(text){
  if(!searchQuery) return text;
  const re = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');
  return text.replace(re,'<mark style="background:#fef08a;padding:0 2px;border-radius:2px">$1</mark>');
}

function animateBars(){
  setTimeout(()=>{
    document.querySelectorAll('.bar-fill').forEach(b=>{
      b.style.width = b.dataset.width;
    });
  },500);
}

// ===== TERM MODAL =====
let termsRaw = []; // raw terms.json data

function findTermData(termName) {
  const lower = termName.toLowerCase();
  return termsRaw.find(t => t.term.toLowerCase() === lower);
}

function getCatColor(cat) {
  return catColors[cat] || '#64748b';
}

function openTermModal(termName) {
  const t = findTermData(termName);
  if (!t) return;
  const modal = document.getElementById('term-modal');
  const body = document.getElementById('modal-body');

  let html = `<div class="modal-term-name">${t.term}</div>`;
  html += `<span class="modal-cat-badge" style="background:${getCatColor(t.category)}">${t.category}</span>`;
  html += `<p class="modal-desc">${t.description}</p>`;
  if (t.examples && t.examples.length) {
    html += `<div class="modal-examples"><h4>📌 Ejemplos prácticos</h4>`;
    t.examples.forEach(e => { html += `<div class="modal-example">${e}</div>`; });
    html += `</div>`;
  }
  // Check if term is related to a diagram section
  const diagramTerms = {
    'Comerciante Individual': true, 'EIRL (Empresa Individual de Responsabilidad Limitada)': true,
    'SAS (Sociedad por Acciones Simplificada)': true, 'Ecuación Contable': true,
    'Capital Social': true, 'Capital Suscrito': true, 'Capital Pagado': true,
    'Activo': true, 'Pasivo': true, 'Patrimonio': true, 'Balance General': true,
    'ISSS (Instituto Salvadoreño del Seguro Social)': true, 'AFP (Administradora de Fondos de Pensiones)': true,
    'INSAFORP (Instituto Salvadoreño de Formación Profesional)': true, 'Cargas Patronales': true,
    'NIT (Número de Identificación Tributaria)': true, 'NRC (Número de Registro de Contribuyente)': true,
    'Matrícula de Comercio': true, 'Solvencia Estadística': true
  };
  if (diagramTerms[t.term]) {
    html += `<button class="modal-diagram-btn" onclick="goToDiagrams()">📊 Ver diagrama relacionado</button>`;
  }

  body.innerHTML = html;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTermModal() {
  document.getElementById('term-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function goToDiagrams() {
  closeTermModal();
  document.querySelectorAll('.nav-tab').forEach(n => n.classList.remove('active'));
  document.querySelector('.nav-tab[data-view="view-diagrams"]').classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-diagrams').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup modal close handlers
function setupModal() {
  document.getElementById('modal-close').onclick = closeTermModal;
  document.getElementById('term-modal').onclick = (e) => {
    if (e.target === document.getElementById('term-modal')) closeTermModal();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTermModal();
  });
}

// ===== GUIDE LOADING =====
function loadGuide() {
  // Guide content is already inline in HTML
  // Just attach click handlers to term links
  document.querySelectorAll('.term-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openTermModal(el.dataset.term);
    });
  });
}

// Load terms and initialize
document.addEventListener('DOMContentLoaded', () => {
  termsRaw = TERMS_DATA;
  terms = mapTerms(TERMS_DATA);
  init();
  setupModal();
  loadGuide();
});

// Font size controls
let currentFontStep = 0;
const FONT_STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.4];
const DEFAULT_STEP = 2; // index of 1 (100%)

(function initFontSize() {
  const saved = localStorage.getItem('glossary-font-step');
  currentFontStep = saved !== null ? parseInt(saved) : DEFAULT_STEP;
  applyFontSize();
})();

function applyFontSize() {
  document.documentElement.style.fontSize = (FONT_STEPS[currentFontStep] * 100) + '%';
  localStorage.setItem('glossary-font-step', currentFontStep);
}

function adjustFontSize(dir) {
  if (dir === 0) {
    currentFontStep = DEFAULT_STEP;
  } else {
    currentFontStep = Math.max(0, Math.min(FONT_STEPS.length - 1, currentFontStep + dir));
  }
  applyFontSize();
}
