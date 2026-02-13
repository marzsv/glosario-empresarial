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

// Load terms from JSON and initialize
document.addEventListener('DOMContentLoaded', () => {
  fetch('./terms.json')
    .then(r => r.json())
    .then(data => {
      terms = mapTerms(data);
      init();
    })
    .catch(err => {
      console.error('Error loading terms:', err);
      document.getElementById('glossary').innerHTML = '<div class="no-results">❌ Error cargando los términos del glosario.</div>';
    });
});
