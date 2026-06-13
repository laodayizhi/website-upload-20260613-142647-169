(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-index')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  var applyFilter = function () {
    var term = normalize(searchInputs[0] ? searchInputs[0].value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');
    var category = normalize(categoryFilter ? categoryFilter.value : '');
    var region = normalize(regionFilter ? regionFilter.value : '');
    var type = normalize(typeFilter ? typeFilter.value : '');
    cards.forEach(function (card) {
      var hay = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-category') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
      var ok = true;
      if (term && hay.indexOf(term) === -1) ok = false;
      if (year && normalize(card.getAttribute('data-year')) !== year) ok = false;
      if (category && normalize(card.getAttribute('data-category')) !== category) ok = false;
      if (region && normalize(card.getAttribute('data-region')) !== region) ok = false;
      if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) ok = false;
      card.classList.toggle('hidden-by-filter', !ok);
    });
  };

  if (q && searchInputs.length) {
    searchInputs.forEach(function (input) {
      input.value = q;
    });
  }
  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });
  [yearFilter, categoryFilter, regionFilter, typeFilter].forEach(function (control) {
    if (control) control.addEventListener('change', applyFilter);
  });
  if (cards.length) applyFilter();
})();
