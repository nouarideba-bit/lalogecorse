/* Animations (Motion, la bibliothèque de Framer Motion pour sites sans React).
   Tout est facultatif : sans JS ou avec « réduire les animations », le site s'affiche normalement. */
(function () {
  var M = window.Motion;
  if (!M || !M.animate) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var animate = M.animate, inView = M.inView, stagger = M.stagger, ease = [0.22, 1, 0.36, 1];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clean = function (els) { return function () { els.forEach(function (e) { e.style.opacity = e.style.transform = e.style.filter = ''; }); }; };

  /* Entrée du hero */
  var hero = $$('.hero-copy > *, .stats > div');
  hero.forEach(function (e) { e.style.opacity = 0; });
  animate(hero, { opacity: [0, 1], y: [28, 0] }, { duration: 0.8, delay: stagger(0.09), ease: ease }).finished.then(clean(hero));
  var img = $('.hero-img');
  if (img) animate(img, { scale: [1.08, 1] }, { duration: 1.8, ease: ease }).finished.then(function () { img.style.transform = ''; });

  /* Apparition au défilement, en cascade */
  function reveal(groupSel, itemSel) {
    $$(groupSel).forEach(function (g) {
      var items = itemSel ? $$(itemSel, g) : [g];
      if (!items.length) return;
      items.forEach(function (e) { e.style.opacity = 0; });
      inView(g, function () {
        animate(items, { opacity: [0, 1], y: [34, 0] }, { duration: 0.7, delay: stagger(0.1), ease: ease }).finished.then(clean(items));
      }, { amount: 0.1 });
    });
  }
  reveal('.table-sec .intro', ':scope > *');
  reveal('.story .col', ':scope > *');
  reveal('.story .photo');
  reveal('.videos .duo', ':scope > *');
  reveal('.plans .grid', '.plan');
  reveal('.infos .wrap', ':scope > *');

  /* Les sièges de la table arrivent un par un (ils sont créés après chargement des données) */
  var round = $('#round'), seated = false;
  function seatsIn() {
    var discs = $$('.seat .disc', round);
    if (seated || !discs.length) return;
    seated = true;
    discs.forEach(function (d) { d.style.opacity = 0; });
    inView(round, function () {
      animate(discs, { opacity: [0, 1], scale: [0.4, 1] }, { duration: 0.6, delay: stagger(0.06), ease: ease }).finished.then(clean(discs));
    }, { amount: 0.3 });
  }
  if (round) {
    seatsIn();
    if (!seated) new MutationObserver(function (_, o) { seatsIn(); if (seated) o.disconnect(); }).observe(round, { childList: true });
  }

  /* Changement de partenaire : la fiche glisse doucement */
  var panel = $('.panel'), name = $('#p-name'), first = true;
  if (panel && name) new MutationObserver(function () {
    if (first) { first = false; return; }
    var parts = $$('.logo, h3, #p-desc, .who, .acts', panel);
    animate(parts, { opacity: [0, 1], x: [18, 0] }, { duration: 0.45, delay: stagger(0.05), ease: ease }).finished.then(clean(parts));
  }).observe(name, { childList: true, characterData: true, subtree: true });

  /* Boutons : léger effet au survol / au clic */
  $$('.btn').forEach(function (b) {
    b.addEventListener('pointerenter', function () { animate(b, { scale: 1.04 }, { duration: 0.2 }); });
    b.addEventListener('pointerleave', function () { animate(b, { scale: 1 }, { duration: 0.2 }); });
    b.addEventListener('pointerdown', function () { animate(b, { scale: 0.97 }, { duration: 0.1 }); });
  });
})();
