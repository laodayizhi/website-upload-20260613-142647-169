(function () {
  const qs = (selector, root) => (root || document).querySelector(selector);
  const qsa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const mobileButton = qs('[data-mobile-toggle]');
  const mainNav = qs('[data-main-nav]');

  if (mobileButton && mainNav) {
    mobileButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  const sliders = qsa('[data-hero-slider]');
  sliders.forEach(function (slider) {
    const slides = qsa('.hero-slide', slider);
    const dots = qsa('[data-hero-dot]', slider);
    let active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  });

  function renderSearch(panel, query) {
    const value = query.trim().toLowerCase();
    if (!value) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }

    const source = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
    const results = source.filter(function (item) {
      return [item.title, item.region, item.genre, item.type, item.year, item.category]
        .join(' ')
        .toLowerCase()
        .includes(value);
    }).slice(0, 10);

    panel.classList.add('is-open');

    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">未找到相关影片</div>';
      return;
    }

    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeAttr(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  qsa('[data-global-search]').forEach(function (form) {
    const input = qs('[data-global-search-input]', form);
    const panel = qs('[data-search-panel]', form);
    if (!input || !panel) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearch(panel, input.value);
    });

    input.addEventListener('focus', function () {
      renderSearch(panel, input.value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(panel, input.value);
      const first = qs('.search-result', panel);
      if (first) {
        window.location.href = first.getAttribute('href');
      }
    });
  });

  document.addEventListener('click', function (event) {
    qsa('[data-global-search]').forEach(function (form) {
      if (!form.contains(event.target)) {
        const panel = qs('[data-search-panel]', form);
        if (panel) {
          panel.classList.remove('is-open');
        }
      }
    });
  });

  const filterInput = qs('[data-page-filter]');
  const yearFilter = qs('[data-year-filter]');
  const typeFilter = qs('[data-type-filter]');
  const list = qs('[data-filter-list]');

  function applyPageFilter() {
    if (!list) {
      return;
    }

    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';

    qsa('.searchable-card', list).forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type')
      ].join(' ').toLowerCase();
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesYear = !year || card.getAttribute('data-year') === year;
      const matchesType = !type || card.getAttribute('data-type') === type;
      card.classList.toggle('is-filter-hidden', !(matchesKeyword && matchesYear && matchesType));
    });
  }

  [filterInput, yearFilter, typeFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', applyPageFilter);
      node.addEventListener('change', applyPageFilter);
    }
  });
})();
