/* ===================================================
   Letija Ceramics · script.js
   Menú móvil, dropdown, animaciones y lightbox
   =================================================== */
(function () {
  'use strict';

  /* ---------- Año dinámico ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Cerrar menú al pulsar un enlace (que no sea el toggle del submenú)
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        // No cerrar si es el toggle del dropdown en móvil
        if (a.classList.contains('dropdown-toggle') && window.innerWidth <= 900) return;
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Dropdown "Obras Disponibles" (acordeón en móvil) ---------- */
  var dropParent = document.querySelector('.has-dropdown');
  var dropToggle = document.querySelector('.dropdown-toggle');
  if (dropParent && dropToggle) {
    dropToggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault(); // en móvil, primer toque abre el submenú
        var open = dropParent.classList.toggle('open-sub');
        dropToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Header con sombra al hacer scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===================================================
     Galería de categorías en "Obras Disponibles"
     (al inicio solo se ven las categorías; al elegir una
     se muestran todas sus piezas con precio y medidas)
     =================================================== */
  var catalog = document.getElementById('obras');
  if (catalog) {
    var catBlocks = Array.prototype.slice.call(catalog.querySelectorAll('.category-block'));
    var catCards = Array.prototype.slice.call(catalog.querySelectorAll('.cat-card'));
    var showcase = catalog.querySelector('.category-showcase');
    var catIds = ['floreros', 'bowls', 'tazas', 'esculturas', 'otros'];

    if (catBlocks.length && catCards.length) {
      catalog.classList.add('js-catalog');

      var scrollToEl = function (el) {
        if (!el) return;
        var y = el.getBoundingClientRect().top + window.pageYOffset - 76;
        window.scrollTo({ top: y, behavior: 'smooth' });
      };

      var showAllCats = function () {
        catBlocks.forEach(function (b) { b.classList.remove('show'); });
        catalog.classList.remove('cat-open');
        scrollToEl(showcase);
      };

      var showCategory = function (id, doScroll) {
        var found = false;
        catBlocks.forEach(function (b) {
          var match = (b.id === id);
          b.classList.toggle('show', match);
          if (match) found = true;
        });
        if (!found) return false;
        catalog.classList.add('cat-open');
        if (doScroll) scrollToEl(document.getElementById(id));
        return true;
      };

      // Botón "volver a las categorías": uno arriba y otro al final de cada categoría
      var makeBack = function (extraClass) {
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'cat-back' + (extraClass ? ' ' + extraClass : '');
        back.innerHTML = '← Ver todas las categorías';
        back.addEventListener('click', showAllCats);
        return back;
      };
      catBlocks.forEach(function (b) {
        b.insertBefore(makeBack(), b.firstChild);
        b.appendChild(makeBack('cat-back-bottom'));
      });

      catCards.forEach(function (card) {
        card.addEventListener('click', function (e) {
          e.preventDefault();
          var id = (card.getAttribute('href') || '').replace('#', '');
          if (showCategory(id, true) && history.replaceState) {
            history.replaceState(null, '', '#' + id);
          }
        });
      });

      var handleCatHash = function () {
        var h = (location.hash || '').replace('#', '');
        if (catIds.indexOf(h) !== -1) showCategory(h, true);
      };
      window.addEventListener('hashchange', handleCatHash);
      handleCatHash(); // por si llegan con #categoria en la URL
    }
  }

  /* ===================================================
     Lightbox / galería secuencial
     =================================================== */
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  var lbImg = lb.querySelector('.lb-img');
  var lbCaption = lb.querySelector('.lb-caption');
  var lbCounter = lb.querySelector('.lb-counter');
  var btnPrev = lb.querySelector('.lb-prev');
  var btnNext = lb.querySelector('.lb-next');
  var btnClose = lb.querySelector('.lb-close');

  var images = [];
  var index = 0;
  var title = '';
  var lastFocused = null;

  function render() {
    var src = images[index];
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', title + ' — imagen ' + (index + 1) + ' de ' + images.length);
    lbCaption.textContent = title;
    lbCounter.textContent = (index + 1) + ' / ' + images.length;
    lb.classList.toggle('lb-single', images.length <= 1);
  }

  function open(imgList, name, startIndex) {
    images = imgList;
    title = name || '';
    index = startIndex || 0;
    lastFocused = document.activeElement;
    render();
    lb.hidden = false;
    // forzar reflow para la transición
    void lb.offsetWidth;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () { lb.hidden = true; }, 260);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function next() {
    if (images.length < 2) return;
    index = (index + 1) % images.length;
    render();
  }
  function prev() {
    if (images.length < 2) return;
    index = (index - 1 + images.length) % images.length;
    render();
  }

  // Abrir desde cada tarjeta
  document.querySelectorAll('.product-card').forEach(function (card) {
    var trigger = card.querySelector('.product-media');
    if (!trigger) return;
    var data = card.getAttribute('data-images') || '';
    var list = data.split('|').filter(function (s) { return s.trim() !== ''; });
    var name = card.getAttribute('data-title') || '';
    if (list.length === 0) return;
    trigger.addEventListener('click', function () { open(list, name, 0); });
  });

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnClose.addEventListener('click', close);

  // Clic fuera de la imagen cierra
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-figure')) close();
  });

  // Teclado
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });

  // Swipe en móvil
  var touchX = null;
  lb.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); }
    touchX = null;
  }, { passive: true });

})();
