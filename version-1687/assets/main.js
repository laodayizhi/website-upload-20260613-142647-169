(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const isOpen = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        let current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.slide || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    const filterPanels = document.querySelectorAll(".filter-panel");

    filterPanels.forEach(function (panel) {
        const section = panel.closest(".section-block") || document;
        const cards = Array.from(section.querySelectorAll(".movie-card"));
        const emptyState = section.querySelector(".empty-state");
        const searchInput = panel.querySelector(".card-search-input");
        const regionSelect = panel.querySelector(".filter-region");
        const typeSelect = panel.querySelector(".filter-type");
        const yearSelect = panel.querySelector(".filter-year");

        function applyFilters() {
            const keyword = (searchInput && searchInput.value || "").trim().toLowerCase();
            const region = regionSelect && regionSelect.value || "";
            const type = typeSelect && typeSelect.value || "";
            const year = yearSelect && yearSelect.value || "";
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" ").toLowerCase();
                const matched = (!keyword || haystack.includes(keyword)) &&
                    (!region || (card.dataset.region || "").includes(region)) &&
                    (!type || (card.dataset.type || "").includes(type)) &&
                    (!year || card.dataset.year === year);

                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });

    const searchResults = document.getElementById("search-results");
    const searchInput = document.getElementById("search-page-input");
    const searchForm = document.getElementById("search-page-form");
    const searchEmpty = document.getElementById("search-empty");

    if (searchResults && searchInput && window.SearchMovies) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;

        function escapeText(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#39;"
                }[char];
            });
        }

        function cardTemplate(movie) {
            const tagHtml = movie.tags.slice(0, 4).map(function (tag) {
                return "<span>" + escapeText(tag) + "</span>";
            }).join("");

            return "<article class=\"movie-card card card-hover\">" +
                "<a class=\"movie-cover\" href=\"./" + movie.file + "\">" +
                    "<img src=\"" + movie.cover + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"cover-type\">" + escapeText(movie.type) + "</span>" +
                    "<span class=\"cover-year\">" + escapeText(movie.year) + "</span>" +
                    "<span class=\"cover-play\">▶</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\">" + escapeText(movie.region) + " · " + escapeText(movie.genre) + "</div>" +
                    "<h2 class=\"movie-title\"><a href=\"./" + movie.file + "\">" + escapeText(movie.title) + "</a></h2>" +
                    "<p>" + escapeText(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tagHtml + "</div>" +
                "</div>" +
            "</article>";
        }

        function renderSearch() {
            const keyword = searchInput.value.trim().toLowerCase();
            const items = window.SearchMovies.filter(function (movie) {
                const haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags.join(" ")
                ].join(" ").toLowerCase();
                return !keyword || haystack.includes(keyword);
            }).slice(0, 240);

            searchResults.innerHTML = items.map(cardTemplate).join("");
            if (searchEmpty) {
                searchEmpty.hidden = items.length !== 0;
            }
        }

        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const params = new URLSearchParams(window.location.search);
            if (searchInput.value.trim()) {
                params.set("q", searchInput.value.trim());
            } else {
                params.delete("q");
            }
            const nextUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
            window.history.replaceState(null, "", nextUrl);
            renderSearch();
        });

        searchInput.addEventListener("input", renderSearch);
        renderSearch();
    }
})();
