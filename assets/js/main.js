/* La Loge Corse · scripts du site (version 2, octobre 2026) */

/* ---------- Menu mobile ---------- */
(function(){
  var b = document.getElementById('burger'), nav = document.getElementById('mobileNav');
  if (!b || !nav) return;
  b.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ nav.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
  });
})();

/* ---------- Calendrier : matchs passés, prochaine affiche, onglets ---------- */
(function(){
  var now = new Date();
  var today = new Date(); today.setHours(0,0,0,0);
  var next = null;

  function day(tr){ var d = new Date(tr.getAttribute('data-date') + 'T00:00:00'); return d; }

  document.querySelectorAll('.cal-panel').forEach(function(panel){
    var first = null;
    panel.querySelectorAll('tbody tr[data-date]').forEach(function(tr){
      var d = day(tr);
      if (d < today) { tr.classList.add('is-past'); return; }
      if (!first) { first = tr; tr.classList.add('is-next'); }
      if (!next || d < day(next)) next = tr;
    });
    var past = panel.querySelectorAll('tr.is-past').length;
    var t = panel.querySelector('.past-toggle');
    if (t) {
      if (!past) { t.hidden = true; }
      else {
        t.textContent = 'Afficher les ' + past + ' match' + (past > 1 ? 's' : '') + ' déjà joué' + (past > 1 ? 's' : '');
        t.addEventListener('click', function(){
          var on = panel.classList.toggle('show-past');
          t.textContent = on ? 'Masquer les matchs joués' : 'Afficher les ' + past + ' match' + (past > 1 ? 's' : '') + ' déjà joué' + (past > 1 ? 's' : '');
        });
      }
    }
  });

  // Prochaine affiche (toutes compétitions confondues à Jean-Bouin)
  if (next) {
    var set = function(id, v){ var el = document.getElementById(id); if (el && v) el.textContent = v; };
    set('nextClub', next.getAttribute('data-club'));
    set('nextOpponent', 'vs ' + next.getAttribute('data-opponent'));
    set('nextDay', next.getAttribute('data-matchday'));
    var when = document.getElementById('nextWhen');
    if (when) {
      when.textContent = '';
      when.appendChild(document.createTextNode(next.getAttribute('data-day')));
      when.appendChild(document.createElement('br'));
      when.appendChild(document.createTextNode(next.getAttribute('data-time')));
    }
    set('nextIni', next.getAttribute('data-ini'));
    var nc = document.getElementById('nextCrest');
    if (nc) {
      if (next.getAttribute('data-crest')) nc.setAttribute('data-crest', next.getAttribute('data-crest'));
      else { nc.removeAttribute('data-crest'); nc.hidden = true; var ni2 = document.getElementById('nextIni'); if (ni2) ni2.hidden = false; }
    }
    var ni = document.getElementById('nextHomeCrest');
    if (ni && next.getAttribute('data-home-img')) ni.src = next.getAttribute('data-home-img');
  }

  // Formulaire : retirer les matchs déjà joués
  document.querySelectorAll('#matchSelect option[data-date]').forEach(function(o){
    if (new Date(o.getAttribute('data-date') + 'T00:00:00') < today) o.remove();
  });
  document.querySelectorAll('#matchSelect optgroup').forEach(function(g){ if (!g.children.length) g.remove(); });

  // Onglets Paris FC / Stade Français
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected', x === tab ? 'true' : 'false'); });
      document.querySelectorAll('.cal-panel').forEach(function(p){ p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    });
  });
})();

/* ---------- Écussons et effectifs (source : TheSportsDB) ---------- */
(function(){
  var API = 'https://www.thesportsdb.com/api/v1/json/3/';
  var TTL = 30 * 864e5;   // cache local 30 jours
  var badges = {}, squads = {};

  function jget(url){ return fetch(url).then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }

  function badgeFor(id){
    if (!id) return Promise.resolve('');
    if (badges[id] !== undefined) return Promise.resolve(badges[id]);
    try {
      var hit = JSON.parse(localStorage.getItem('lc_badge_' + id) || 'null');
      if (hit && (Date.now() - hit.t) < TTL) { badges[id] = hit.u; return Promise.resolve(hit.u); }
    } catch(e){}
    return jget(API + 'lookupteam.php?id=' + id).then(function(j){
      var t = (j.teams || [])[0] || {}; var u = t.strBadge || '';
      badges[id] = u;
      try { localStorage.setItem('lc_badge_' + id, JSON.stringify({u:u, t:Date.now()})); } catch(e){}
      return u;
    }).catch(function(){ return ''; });
  }

  // Écusson : image distante si disponible, sinon pastille avec les initiales (déjà dans la page).
  document.querySelectorAll('img.crest[data-crest]').forEach(function(img){
    var id = img.getAttribute('data-crest');
    badgeFor(id).then(function(u){
      if (!u) return;
      img.onload = function(){ img.hidden = false; var fb = img.nextElementSibling; if (fb && fb.classList.contains('crest-txt')) fb.hidden = true; };
      img.src = u;
    });
  });

  var panel = document.getElementById('squads'), body = document.getElementById('squadsBody');
  var title = document.getElementById('squadsTitle'), closeB = document.getElementById('squadsClose');
  var PFC = '135465';
  if (!panel) return;

  function squadFor(id){
    if (squads[id]) return Promise.resolve(squads[id]);
    return jget(API + 'lookup_all_players.php?id=' + id).then(function(j){
      var list = (j.player || []).map(function(p){ return { n:p.strPlayer, num:p.strNumber || '', pos:p.strPosition || '', img:p.strCutout || p.strThumb || '' }; });
      squads[id] = list; return list;
    });
  }

  function col(name, id, list){
    var wrap = document.createElement('div'); wrap.className = 'squad-col';
    var h = document.createElement('h4');
    var bi = document.createElement('img'); bi.alt = ''; if (badges[id]) bi.src = badges[id]; h.appendChild(bi);
    h.appendChild(document.createTextNode(name));
    var c = document.createElement('span'); c.className = 'cnt'; c.textContent = list.length ? list.length + ' joueurs' : ''; h.appendChild(c);
    wrap.appendChild(h);
    if (!list.length){ var none = document.createElement('p'); none.className = 'squads-status'; none.textContent = 'Effectif non disponible pour ce club.'; wrap.appendChild(none); return wrap; }
    var ul = document.createElement('ul'); ul.className = 'squad';
    list.forEach(function(p){
      var li = document.createElement('li');
      var num = document.createElement('span'); num.className = 'pl-num'; num.textContent = p.num;
      var ph = document.createElement('img'); ph.className = 'pl-photo'; ph.alt = ''; ph.loading = 'lazy'; if (p.img) ph.src = p.img;
      var nm = document.createElement('span'); nm.className = 'pl-name'; nm.textContent = p.n;
      var po = document.createElement('span'); po.className = 'pl-pos'; po.textContent = p.pos;
      li.appendChild(num); li.appendChild(ph); li.appendChild(nm); li.appendChild(po); ul.appendChild(li);
    });
    wrap.appendChild(ul); return wrap;
  }

  document.querySelectorAll('.squads-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-team'), nm = btn.getAttribute('data-name');
      panel.hidden = false; title.textContent = 'Paris FC · ' + nm; body.innerHTML = '';
      var st = document.createElement('p'); st.className = 'squads-status'; st.textContent = 'Chargement des effectifs…'; body.appendChild(st);
      panel.scrollIntoView({behavior:'smooth', block:'start'});
      Promise.all([badgeFor(PFC), badgeFor(id), squadFor(PFC), squadFor(id)]).then(function(res){
        body.innerHTML = ''; body.appendChild(col('Paris FC', PFC, res[2])); body.appendChild(col(nm, id, res[3]));
      }).catch(function(){
        body.innerHTML = ''; var e = document.createElement('p'); e.className = 'squads-status';
        e.textContent = 'Les effectifs ne sont pas accessibles pour le moment. Réessayez plus tard.'; body.appendChild(e);
      });
    });
  });
  if (closeB) closeB.addEventListener('click', function(){ panel.hidden = true; });
})();

/* ---------- Formulaire d'invitation ---------- */
(function(){
  var form = document.getElementById('inviteForm');
  if (!form) return;
  var wrap = document.getElementById('guests'), add = document.getElementById('addGuest');
  var sel = document.getElementById('matchSelect'), err = document.getElementById('formError');
  var MAX = parseInt(form.getAttribute('data-max') || '6', 10), n = 0;

  var ts = form.querySelector('input[name="ts"]');
  if (ts) ts.value = String(Math.floor(Date.now() / 1000));

  function field(label, type, name, i, extra){
    var l = document.createElement('label');
    var lb = document.createElement('span'); lb.className = 'lbl'; lb.appendChild(document.createTextNode(label + ' '));
    var r = document.createElement('span'); r.className = 'req'; r.textContent = '*'; lb.appendChild(r); l.appendChild(lb);
    var inp = document.createElement('input'); inp.type = type; inp.name = 'invite' + i + '_' + name; inp.required = true;
    if (extra) inp.autocomplete = extra;
    l.appendChild(inp); return l;
  }
  function render(){
    wrap.querySelectorAll('.guest').forEach(function(g, i){ g.querySelector('.gt').textContent = 'Invité ' + (i + 1); });
    add.disabled = wrap.querySelectorAll('.guest').length >= MAX; add.style.opacity = add.disabled ? 0.45 : 1;
  }
  function addGuest(){
    if (wrap.querySelectorAll('.guest').length >= MAX) return;
    n++;
    var g = document.createElement('div'); g.className = 'guest';
    var head = document.createElement('div'); head.className = 'guest-head';
    var t = document.createElement('span'); t.className = 'gt'; head.appendChild(t);
    var del = document.createElement('button'); del.type = 'button'; del.className = 'guest-del'; del.textContent = 'Retirer';
    del.addEventListener('click', function(){ if (wrap.querySelectorAll('.guest').length > 1){ g.remove(); render(); } });
    head.appendChild(del); g.appendChild(head);
    var grid = document.createElement('div'); grid.className = 'fgrid';
    grid.appendChild(field('Nom', 'text', 'nom', n, 'off'));
    grid.appendChild(field('Prénom', 'text', 'prenom', n, 'off'));
    grid.appendChild(field('E-mail', 'email', 'email', n, 'off'));
    grid.appendChild(field('Téléphone', 'tel', 'tel', n, 'off'));
    g.appendChild(grid); wrap.appendChild(g); render();
  }
  add.addEventListener('click', addGuest);
  addGuest();

  // Tous les boutons « Réserver » mènent au formulaire, match présélectionné.
  document.querySelectorAll('[data-fix]').forEach(function(b){
    b.addEventListener('click', function(){
      var key = b.getAttribute('data-fix');
      for (var i = 0; i < sel.options.length; i++){ if (sel.options[i].getAttribute('data-key') === key){ sel.selectedIndex = i; break; } }
    });
  });

  form.addEventListener('submit', function(e){
    err.hidden = true;
    if (!form.checkValidity()){
      e.preventDefault(); err.hidden = false;
      err.textContent = 'Merci de compléter tous les champs obligatoires : pour chaque invité, le nom, le prénom, l’e-mail et le téléphone sont requis.';
      var bad = form.querySelector(':invalid'); if (bad){ bad.focus(); bad.scrollIntoView({behavior:'smooth', block:'center'}); }
    }
  });
})();
