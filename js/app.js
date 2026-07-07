/* ============ NoteFlow v2 — sidebar + header interactions ============ */
const $ = (s) => document.querySelector(s);
const sidebar = $('#sidebar');

/* apply saved accent colour */
(function () { const a = localStorage.getItem('nf2.accent'); if (a) { const h = a.replace('#', ''); const s = document.documentElement.style; s.setProperty('--primary', a); s.setProperty('--primary-soft', 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',.15)'); } })();
/* apply saved profile (name / email / avatar) to the shell */
(function () { let p = {}; try { p = JSON.parse(localStorage.getItem('nf.profile')) || {}; } catch (e) {}
  const name = p.name || 'Ganesh', email = p.email || 'ganesh@noteflow.app', ini = (name.trim()[0] || 'G').toUpperCase();
  const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.textContent = v; };
  set('.uname', name); set('.pm-name', name); set('.pm-email', email); set('.pm-ava', ini);
  const sub = document.getElementById('pageSub'); if (sub && !new URLSearchParams(location.search).get('folder')) sub.textContent = 'Welcome back, ' + name + ' — pick up where you left off.';
})();

/* collapse / expand (panel toggle in header) — remembers state */
const ptoggle = $('#panelToggle');
const syncToggle = () => ptoggle.classList.toggle('active', sidebar.classList.contains('collapsed'));
if (localStorage.getItem('nf2.collapsed') === '1') sidebar.classList.add('collapsed');
syncToggle();
ptoggle.onclick = () => {
  if (window.innerWidth <= 600) {                 // phone: slide-in overlay
    sidebar.classList.toggle('open');
    $('#scrim').classList.toggle('show', sidebar.classList.contains('open'));
  } else {                                        // desktop/tablet: collapse to icon rail
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('nf2.collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
    syncToggle();
  }
};
$('#scrim').onclick = () => { sidebar.classList.remove('open'); $('#scrim').classList.remove('show'); };

/* nav active + page title */
document.querySelectorAll('.nav-item').forEach(item => item.onclick = () => {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  item.classList.add('active');
  const name = item.dataset.name;
  $('#pageTitle').textContent = name;
  sidebar.classList.remove('open'); $('#scrim').classList.remove('show');
});

/* open the editor for a given document title */
const openEditor = (title) => { location.href = 'editor-orange.html?title=' + encodeURIComponent(title || 'Untitled document'); };

/* click a document card -> open it in the editor */
document.querySelectorAll('.ncard').forEach(card => card.onclick = () => {
  const h = card.querySelector('h3');
  openEditor(h ? h.textContent.trim() : 'Untitled document');
});

/* "+ New" dropdown */
const newMenu = $('#newMenu');
$('#newBtn').onclick = (e) => { e.stopPropagation(); $('#profileMenu').hidden = true; newMenu.hidden = !newMenu.hidden; };
$('#newBtn').addEventListener('dblclick', () => { newMenu.hidden = true; if (window.__quickFocus) window.__quickFocus(); });  // double-tap = quick note
const newTitles = { text: 'Untitled document' };
document.querySelectorAll('.nm-item').forEach(b => b.onclick = () => {
  newMenu.hidden = true;
  const act = b.dataset.act;
  if (act === 'notebook') { location.href = 'notebook-demo.html'; return; }   // handwriting notebook
  if (act === 'whiteboard') { location.href = 'whiteboard-demo.html'; return; }  // infinite-canvas whiteboard
  if (act === 'quick') { if (window.__quickFocus) window.__quickFocus(); else openEditor('Quick note'); return; }  // quick note capture
  if (newTitles[act]) openEditor(newTitles[act]);   // text -> editor
  /* folder, gdrive, onedrive: hook up later */
});
document.addEventListener('click', (e) => { if (!newMenu.contains(e.target) && !$('#newBtn').contains(e.target)) newMenu.hidden = true; });

/* theme toggle (icon button + profile row) */
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('nf2.theme', t);
  $('#themeRowLabel').textContent = t === 'dark' ? 'Light theme' : 'Dark theme';
}
applyTheme(localStorage.getItem('nf2.theme') || 'dark');
const toggle = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
const themeBtn = $('#themeBtn'); if (themeBtn) themeBtn.onclick = toggle;   // optional (removed from header)
$('#themeRow').onclick = toggle;
const importTop = $('#importTop'); if (importTop) importTop.onclick = () => { /* import hook later */ };

/* profile menu (header avatar + sidebar profile card) */
const pMenu = $('#profileMenu');
$('#avatarBtn').onclick = (e) => { e.stopPropagation(); pMenu.hidden = !pMenu.hidden; };
document.addEventListener('click', (e) => {
  if (!pMenu.contains(e.target) && !$('#avatarBtn').contains(e.target)) pMenu.hidden = true;
});

/* ===== Home libraries: saved notebooks, whiteboards & documents ===== */
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60); if (h < 24) return h + ' h ago';
  const d = Math.floor(h / 24); if (d === 1) return 'yesterday';
  if (d < 7) return d + ' days ago';
  return new Date(ts).toLocaleDateString();
}
function loadIdx(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
const NB_COVERS = { kraft:'linear-gradient(135deg,#cdb993,#b39a72)', charcoal:'linear-gradient(135deg,#3a3f4b,#23262e)', blue:'linear-gradient(135deg,#3b6fd4,#2b4f9e)', plum:'linear-gradient(135deg,#7c4f9e,#5a3678)', green:'linear-gradient(135deg,#2f9e6f,#1f7a54)', coral:'linear-gradient(135deg,#e57a5a,#c8553d)' };
const PAPER_NAMES = { blank:'Blank', dotted:'Dotted', 'ruled-narrow':'Ruled narrow', 'ruled-wide':'Ruled wide', squared:'Squared', cornell:'Cornell', legal:'Legal', 'single-column':'Single column', 'single-mix':'Single column mix', 'three-column':'Three column', accounting:'Accounting', 'monthly-b':'Monthly planner', 'monthly-c':'Monthly planner', todos:'Todos', 'weekly-a':'Weekly planner', 'guitar-score':'Guitar score', 'guitar-tab':'Guitar tab', music:'Music' };

let libView = localStorage.getItem('nf2.libview') || 'card';
const PAGE = { card: 8, table: 8 };
const libPage = {};   // wrapperId -> current page (1-based)

const CFG = {
  notebook: {
    noun: 'notebook', newHref: 'notebook-demo.html', newLabel: 'New notebook',
    open: (id) => 'notebook-demo.html?id=' + encodeURIComponent(id),
    remove: (id) => { localStorage.removeItem('nf.nb.' + id); localStorage.removeItem('nf.nb.audio.' + id); },
    title: (n) => n.title || 'Untitled Notebook',
    sub: (n) => { const pages = n.pages || 1; return (PAPER_NAMES[n.paper] || 'Blank') + ' · ' + pages + ' page' + (pages === 1 ? '' : 's'); },
    updated: (n) => n.updated,
    coverCard: (n) => '<span class="nb-cover-mini" style="background:' + (NB_COVERS[n.cover] || NB_COVERS.kraft) + '"></span>',
    coverTable: (n) => '<span class="lt-cover" style="background:' + (NB_COVERS[n.cover] || NB_COVERS.kraft) + '"></span>',
  },
  whiteboard: {
    noun: 'whiteboard', newHref: 'whiteboard-demo.html', newLabel: 'New whiteboard',
    open: (id) => 'whiteboard-demo.html?id=' + encodeURIComponent(id),
    remove: (id) => { localStorage.removeItem('nf.wb.' + id); },
    title: (b) => b.title || 'Untitled Board',
    sub: (b) => { const n = b.count || 0; return n + ' item' + (n === 1 ? '' : 's'); },
    updated: (b) => b.updated,
    coverCard: () => '<span class="nc-ico c-green"><svg class="i"><use href="#ic-board"/></svg></span>',
    coverTable: () => '<span class="lt-ico c-green"><svg class="i"><use href="#ic-board"/></svg></span>',
  },
  document: {
    noun: 'document', newHref: 'editor-orange.html?title=Untitled+document', newLabel: 'New document',
    open: (id) => 'editor-orange.html?id=' + encodeURIComponent(id),
    remove: (id) => { localStorage.removeItem('nf.doc.' + id); },
    title: (d) => d.title || 'Untitled document',
    sub: (d) => { const w = d.words || 0; return w + ' word' + (w === 1 ? '' : 's'); },
    updated: (d) => d.updated,
    coverCard: () => '<span class="nc-ico c-blue"><svg class="i"><use href="#ic-doc"/></svg></span>',
    coverTable: () => '<span class="lt-ico c-blue"><svg class="i"><use href="#ic-doc"/></svg></span>',
  },
};
const LIBS = [
  { wrap: 'notebookLib', key: 'nf.nb.index', cfg: CFG.notebook },
  { wrap: 'whiteboardLib', key: 'nf.wb.index', cfg: CFG.whiteboard },
  { wrap: 'documentLib', key: 'nf.doc.index', cfg: CFG.document },
];

function renderLib(wrapId, key, cfg) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const list = loadIdx(key);
  const size = PAGE[libView];
  const pages = Math.max(1, Math.ceil(list.length / size));
  const page = Math.min(Math.max(1, libPage[wrapId] || 1), pages); libPage[wrapId] = page;
  const slice = list.slice((page - 1) * size, (page - 1) * size + size);
  let html = '';

  if (libView === 'card') {
    html += '<div class="card-grid">';
    if (page === 1) html += '<a class="nbcard-new" href="' + cfg.newHref + '"><span class="nb-plus">+</span> ' + cfg.newLabel + '</a>';
    slice.forEach(it => {
      html += '<div class="ncard nbcard libcard" data-id="' + escapeHtml(it.id) + '">' +
        '<div class="nc-top">' + cfg.coverCard(it) + '<span class="nc-time">' + timeAgo(cfg.updated(it)) + '</span></div>' +
        '<h3>' + escapeHtml(cfg.title(it)) + '</h3>' +
        '<p>' + escapeHtml(cfg.sub(it)) + '</p>' +
        '<button class="nb-del" title="Delete ' + cfg.noun + '">×</button></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="lib-new-row"><a class="lib-new-btn" href="' + cfg.newHref + '"><svg class="i"><use href="#ic-plus"/></svg> ' + cfg.newLabel + '</a></div>';
    if (!list.length) {
      html += '<div class="lib-empty">No ' + cfg.noun + 's saved yet.</div>';
    } else {
      html += '<table class="lib-table"><thead><tr><th>Name</th><th>Details</th><th>Updated</th><th></th></tr></thead><tbody>';
      slice.forEach(it => {
        html += '<tr class="librow" data-id="' + escapeHtml(it.id) + '">' +
          '<td><div class="lt-title">' + cfg.coverTable(it) + escapeHtml(cfg.title(it)) + '</div></td>' +
          '<td>' + escapeHtml(cfg.sub(it)) + '</td>' +
          '<td>' + timeAgo(cfg.updated(it)) + '</td>' +
          '<td style="text-align:right"><button class="lt-del" title="Delete">×</button></td></tr>';
      });
      html += '</tbody></table>';
    }
  }

  if (pages > 1) {
    html += '<div class="pager">';
    html += '<button data-pg="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>‹</button>';
    for (let p = 1; p <= pages; p++) html += '<button class="' + (p === page ? 'active' : '') + '" data-pg="' + p + '">' + p + '</button>';
    html += '<button data-pg="' + (page + 1) + '"' + (page === pages ? ' disabled' : '') + '>›</button>';
    html += '</div>';
  }

  wrap.innerHTML = html;

  const doDelete = (id) => {
    if (!confirm('Delete this ' + cfg.noun + '? This cannot be undone.')) return;
    cfg.remove(id);
    localStorage.setItem(key, JSON.stringify(loadIdx(key).filter(x => x.id !== id)));
    renderLib(wrapId, key, cfg);
  };
  wrap.querySelectorAll('.libcard').forEach(el => {
    const id = el.dataset.id;
    el.onclick = () => { location.href = cfg.open(id); };
    const del = el.querySelector('.nb-del'); if (del) del.onclick = (e) => { e.stopPropagation(); doDelete(id); };
  });
  wrap.querySelectorAll('.librow').forEach(row => {
    const id = row.dataset.id;
    row.onclick = () => { location.href = cfg.open(id); };
    const del = row.querySelector('.lt-del'); if (del) del.onclick = (e) => { e.stopPropagation(); doDelete(id); };
  });
  wrap.querySelectorAll('.pager button[data-pg]').forEach(b => {
    b.onclick = () => { const p = parseInt(b.dataset.pg, 10); if (p >= 1 && p <= pages) { libPage[wrapId] = p; renderLib(wrapId, key, cfg); } };
  });
}
function renderAllLibs() { LIBS.forEach(l => renderLib(l.wrap, l.key, l.cfg)); }

const viewToggle = document.getElementById('viewToggle');
if (viewToggle) {
  const sync = () => viewToggle.querySelectorAll('.vt').forEach(x => x.classList.toggle('active', x.dataset.view === libView));
  viewToggle.querySelectorAll('.vt').forEach(b => b.onclick = () => {
    libView = b.dataset.view; localStorage.setItem('nf2.libview', libView); sync(); renderAllLibs();
  });
  sync();
}
renderAllLibs();

/* ===== Quick notes (Keep-style board + capture) ===== */
const QUICK_COLORS = ['#ffffff', '#ffe066', '#ffd8a8', '#b9f6ca', '#90cdf4', '#f6a6c1', '#d6bcfa', '#c7f9cc'];
function loadQuick() { try { return JSON.parse(localStorage.getItem('nf.quick.index')) || []; } catch (e) { return []; } }
function saveQuick(list) { localStorage.setItem('nf.quick.index', JSON.stringify(list)); }
function qid() { return 'q-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36); }

function quickCardHtml(n) {
  let inner = '';
  if (n.title) inner += '<div class="qn-title">' + escapeHtml(n.title) + '</div>';
  if (n.kind === 'checklist') {
    inner += '<div class="qn-list">' + (n.items || []).map(it =>
      '<div class="qn-item' + (it.done ? ' done' : '') + '"><span class="qn-check">' + (it.done ? '✓' : '') + '</span><span>' + escapeHtml(it.text) + '</span></div>').join('') + '</div>';
  } else if (n.body) {
    inner += '<div class="qn-text">' + escapeHtml(n.body) + '</div>';
  }
  if (!inner) inner = '<div class="qn-text muted">Empty note</div>';
  const colorsRow = QUICK_COLORS.map(c => '<button class="qn-color" data-c="' + c + '" style="background:' + c + '"></button>').join('');
  return '<div class="qnote is-' + (n.kind || 'text') + '" data-id="' + escapeHtml(n.id) + '" style="background:' + n.color + '">' +
    '<div class="qn-body">' + inner + '</div>' +
    '<div class="qn-bar">' +
      '<button class="qn-ico qn-pin' + (n.pinned ? ' on' : '') + '" title="Pin"><svg class="i"><use href="#ic-pin"/></svg></button>' +
      '<div class="qn-colors">' + colorsRow + '</div>' +
      '<button class="qn-ico qn-edit" title="Edit"><svg class="i"><use href="#ic-edit"/></svg></button>' +
      '<button class="qn-ico qn-del" title="Delete"><svg class="i"><use href="#ic-trash"/></svg></button>' +
    '</div></div>';
}
function renderQuick() {
  const board = document.getElementById('quickBoard'); if (!board) return;
  const list = loadQuick();
  if (!list.length) { board.innerHTML = '<div class="quick-empty">No quick notes yet — jot something above ✏️</div>'; return; }
  const pinned = list.filter(n => n.pinned), others = list.filter(n => !n.pinned);
  let html = '';
  if (pinned.length) html += '<div class="quick-group-label">Pinned</div><div class="quick-cols">' + pinned.map(quickCardHtml).join('') + '</div>';
  if (others.length) { if (pinned.length) html += '<div class="quick-group-label">Others</div>'; html += '<div class="quick-cols">' + others.map(quickCardHtml).join('') + '</div>'; }
  board.innerHTML = html;

  const upd = (id, fn) => { const l = loadQuick(); const n = l.find(x => x.id === id); if (!n) return; fn(n); n.updated = Date.now(); saveQuick(l); renderQuick(); };
  board.querySelectorAll('.qnote').forEach(el => {
    const id = el.dataset.id;
    el.querySelectorAll('.qn-item').forEach((row, idx) => row.onclick = (e) => { e.stopPropagation(); upd(id, n => { if (n.items[idx]) n.items[idx].done = !n.items[idx].done; }); });
    const editOpen = () => { const n = loadQuick().find(x => x.id === id); if (n && window.__quickStartEdit) window.__quickStartEdit(n); };
    el.querySelector('.qn-edit').onclick = (e) => { e.stopPropagation(); editOpen(); };
    const txt = el.querySelector('.qn-text'); if (txt && !txt.classList.contains('muted')) txt.onclick = editOpen;
    el.querySelector('.qn-pin').onclick = (e) => { e.stopPropagation(); upd(id, n => { n.pinned = !n.pinned; }); };
    el.querySelector('.qn-del').onclick = (e) => { e.stopPropagation(); if (confirm('Delete this quick note?')) { saveQuick(loadQuick().filter(x => x.id !== id)); renderQuick(); } };
    el.querySelectorAll('.qn-color').forEach(dot => dot.onclick = (e) => { e.stopPropagation(); upd(id, n => { n.color = dot.dataset.c; }); });
  });
}

(function initQuick() {
  const qc = document.getElementById('qc'); if (!qc) return;
  const line = document.getElementById('qcLine'), more = document.getElementById('qcMore'), body = document.getElementById('qcBody'),
        colors = document.getElementById('qcColors'), checkBtn = document.getElementById('qcCheck'),
        saveBtn = document.getElementById('qcSave'), cancelBtn = document.getElementById('qcCancel');
  let color = QUICK_COLORS[1], checkMode = false, editingId = null;

  QUICK_COLORS.forEach(c => { const b = document.createElement('button'); b.className = 'qc-dot'; b.style.background = c; b.dataset.c = c;
    b.onclick = () => { color = c; syncDots(); }; colors.appendChild(b); });
  function syncDots() { colors.querySelectorAll('.qc-dot').forEach(d => d.classList.toggle('sel', d.dataset.c === color)); }
  syncDots();

  function expand() { more.hidden = false; qc.classList.add('open'); }
  function collapse() { more.hidden = true; qc.classList.remove('open'); line.value = ''; body.value = ''; color = QUICK_COLORS[1]; checkMode = false; checkBtn.classList.remove('active'); body.placeholder = 'Take a note…'; editingId = null; saveBtn.textContent = 'Add'; syncDots(); }
  line.addEventListener('focus', expand);
  checkBtn.onclick = () => { checkMode = !checkMode; checkBtn.classList.toggle('active', checkMode); body.placeholder = checkMode ? 'One item per line…' : 'Take a note…'; };
  cancelBtn.onclick = collapse;
  saveBtn.onclick = commit;
  line.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); body.focus(); } });
  body.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); commit(); } });

  function commit() {
    const title = (line.value || '').trim(), text = (body.value || '').trim();
    if (!title && !text) { collapse(); return; }
    const list = loadQuick();
    const base = { title, color, kind: checkMode ? 'checklist' : 'text', updated: Date.now() };
    if (checkMode) { base.items = text ? text.split('\n').map(t => ({ text: t.trim(), done: false })).filter(i => i.text) : []; base.body = ''; }
    else { base.body = text; base.items = []; }
    if (editingId) { const n = list.find(x => x.id === editingId); if (n) Object.assign(n, base); }
    else { list.unshift({ id: qid(), pinned: false, created: Date.now(), ...base }); }
    saveQuick(list); collapse(); renderQuick();
  }

  window.__quickStartEdit = (n) => {
    editingId = n.id; expand(); line.value = n.title || ''; color = n.color || QUICK_COLORS[1];
    checkMode = n.kind === 'checklist'; checkBtn.classList.toggle('active', checkMode);
    body.placeholder = checkMode ? 'One item per line…' : 'Take a note…';
    body.value = n.kind === 'checklist' ? (n.items || []).map(i => i.text).join('\n') : (n.body || '');
    saveBtn.textContent = 'Save'; syncDots(); qc.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); body.focus();
  };
  window.__quickFocus = () => { expand(); qc.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); line.focus(); };

  renderQuick();
})();
