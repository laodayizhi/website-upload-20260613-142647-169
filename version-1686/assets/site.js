(function () {
  function pageRoot() {
    return document.body.getAttribute("data-page-root") || "./";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    var data = window.MOVIE_SEARCH_INDEX || [];
    var root = pageRoot();
    forms.forEach(function (form) {
      var input = form.querySelector("input");
      var panel = form.querySelector(".search-panel");
      if (!input || !panel) {
        return;
      }
      function render() {
        var q = normalize(input.value);
        panel.innerHTML = "";
        if (!q) {
          panel.classList.remove("is-open");
          return;
        }
        var results = data.filter(function (item) {
          return normalize(item.title + item.year + item.genre + item.type + item.category).indexOf(q) !== -1;
        }).slice(0, 12);
        if (!results.length) {
          panel.innerHTML = '<div class="search-result"><strong>暂无匹配结果</strong><span>请尝试其他片名、年份或类型</span></div>';
          panel.classList.add("is-open");
          return;
        }
        results.forEach(function (item) {
          var a = document.createElement("a");
          a.className = "search-result";
          a.href = root + item.url;
          a.innerHTML = "<strong>" + item.title + "</strong><span>" + item.year + " · " + item.category + " · " + item.genre + "</span>";
          panel.appendChild(a);
        });
        panel.classList.add("is-open");
      }
      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector(".local-filter input");
    var grid = document.querySelector(".searchable-grid");
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-row"));
    input.addEventListener("input", function () {
      var q = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category")
        ].join(" "));
        card.classList.toggle("is-filtered-out", q && text.indexOf(q) === -1);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilter();
  });
})();
