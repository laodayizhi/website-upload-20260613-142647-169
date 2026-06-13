(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            toggle.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = qs('.js-card-search', panel);
            var type = qs('.js-card-type', panel);
            var year = qs('.js-card-year', panel);
            var cards = qsa('.movie-card', scope);
            var urlQuery = new URLSearchParams(window.location.search).get('q') || '';

            if (input && urlQuery) {
                input.value = urlQuery;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                cards.forEach(function (card) {
                    var search = card.getAttribute('data-search') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var visible = true;
                    if (query && search.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        visible = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        visible = false;
                    }
                    card.hidden = !visible;
                });
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupAnchorPlay() {
        qsa('a[href="#watch"]').forEach(function (link) {
            link.addEventListener('click', function () {
                setTimeout(function () {
                    var player = qs('.player-box');
                    if (player) {
                        player.classList.add('focus-glow');
                        setTimeout(function () {
                            player.classList.remove('focus-glow');
                        }, 1000);
                    }
                }, 200);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupAnchorPlay();
    });
})();
