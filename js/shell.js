/* Shared shell for the secondary pages (Recent / Favourites / Templates / Trash):
   applies theme + accent + profile, and wires the sidebar & profile menu. */
(function () {
  const root = document.documentElement;
  root.dataset.theme = localStorage.getItem('nf2.theme') || 'dark';
  const acc = localStorage.getItem('nf2.accent');
  if (acc) { const h = acc.replace('#', ''); root.style.setProperty('--primary', acc); root.style.setProperty('--primary-soft', 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',.15)'); }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    const sidebar = document.getElementById('sidebar'), scrim = document.getElementById('scrim'), pt = document.getElementById('panelToggle');
    if (sidebar && localStorage.getItem('nf2.collapsed') === '1') sidebar.classList.add('collapsed');
    if (pt) pt.onclick = function () {
      if (window.innerWidth <= 600) { sidebar.classList.toggle('open'); if (scrim) scrim.classList.toggle('show', sidebar.classList.contains('open')); }
      else { sidebar.classList.toggle('collapsed'); localStorage.setItem('nf2.collapsed', sidebar.classList.contains('collapsed') ? '1' : '0'); }
    };
    if (scrim) scrim.onclick = function () { sidebar.classList.remove('open'); scrim.classList.remove('show'); };
    const tb = document.getElementById('themeBtn');
    if (tb) tb.onclick = function () { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('nf2.theme', root.dataset.theme); };
    const av = document.getElementById('avatarBtn'), pm = document.getElementById('profileMenu');
    if (av && pm) { av.onclick = function (e) { e.stopPropagation(); pm.hidden = !pm.hidden; }; document.addEventListener('click', function (e) { if (!pm.contains(e.target) && !av.contains(e.target)) pm.hidden = true; }); }
    let p = {}; try { p = JSON.parse(localStorage.getItem('nf.profile')) || {}; } catch (e) {}
    const name = p.name || 'Ganesh', email = p.email || 'ganesh@noteflow.app', ini = (name.trim()[0] || 'G').toUpperCase();
    const set = function (sel, v) { const el = document.querySelector(sel); if (el) el.textContent = v; };
    set('.uname', name); set('.pm-name', name); set('.pm-email', email); set('.pm-ava', ini);
  });

  /* helpers shared by the pages */
  window.NF = {
    esc: function (s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    loadIdx: function (key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } },
    timeAgo: function (ts) {
      if (!ts) return '';
      const s = Math.floor((Date.now() - ts) / 1000);
      if (s < 60) return 'just now';
      const m = Math.floor(s / 60); if (m < 60) return m + ' min ago';
      const h = Math.floor(m / 60); if (h < 24) return h + ' h ago';
      const d = Math.floor(h / 24); if (d === 1) return 'yesterday';
      if (d < 7) return d + ' days ago';
      return new Date(ts).toLocaleDateString();
    },
    /* every saved file across the three libraries, newest first */
    allFiles: function () {
      const NF = window.NF;
      const out = [];
      NF.loadIdx('nf.nb.index').forEach(n => out.push({ id: n.id, type: 'notebook', title: n.title || 'Untitled Notebook', sub: (n.pages || 1) + ' page' + ((n.pages || 1) === 1 ? '' : 's'), updated: n.updated, icon: 'ic-book', cls: 'c-amber', open: 'notebook-demo.html?id=' + encodeURIComponent(n.id) }));
      NF.loadIdx('nf.wb.index').forEach(b => out.push({ id: b.id, type: 'whiteboard', title: b.title || 'Untitled Board', sub: (b.count || 0) + ' item' + ((b.count || 0) === 1 ? '' : 's'), updated: b.updated, icon: 'ic-board', cls: 'c-green', open: 'whiteboard-demo.html?id=' + encodeURIComponent(b.id) }));
      NF.loadIdx('nf.doc.index').forEach(d => out.push({ id: d.id, type: 'document', title: d.title || 'Untitled document', sub: (d.words || 0) + ' word' + ((d.words || 0) === 1 ? '' : 's'), updated: d.updated, icon: 'ic-doc', cls: 'c-blue', open: 'editor-orange.html?id=' + encodeURIComponent(d.id) }));
      return out.sort((a, b) => (b.updated || 0) - (a.updated || 0));
    },
    loadFav: function () { try { return JSON.parse(localStorage.getItem('nf.fav')) || []; } catch (e) { return []; } },
    saveFav: function (l) { localStorage.setItem('nf.fav', JSON.stringify(l)); },
    isFav: function (id) { return window.NF.loadFav().indexOf(id) !== -1; },
    toggleFav: function (id) { const l = window.NF.loadFav(); const i = l.indexOf(id); if (i === -1) l.push(id); else l.splice(i, 1); window.NF.saveFav(l); return i === -1; }
  };
})();
