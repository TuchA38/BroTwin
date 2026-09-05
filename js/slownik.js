// =====================================
// SŁOWNIK – SPA SAFE
// =====================================

// -------------------------------------
// 1️⃣ GLOBALNY CACHE
// -------------------------------------
window.GLOSSARY = window.GLOSSARY || {
    data: null,
    loading: false,
    loaded: false
};

// -------------------------------------
// 2️⃣ LOADER – fetch tylko raz
// -------------------------------------
function loadGlossary() {
    if (GLOSSARY.loaded) {
        return Promise.resolve(GLOSSARY.data);
    }

    if (GLOSSARY.loading) {
        return GLOSSARY.loading;
    }

    GLOSSARY.loading = fetch("data/slownik.json")
        .then(r => r.json())
        .then(data => {
            GLOSSARY.data = data;
            GLOSSARY.loaded = true;
            return data;
        })
        .catch(err => {
            console.error("Błąd ładowania słownika:", err);
            GLOSSARY.loading = false;
        });

    return GLOSSARY.loading;
}

// -------------------------------------
// 3️⃣ INIT STRONY /SŁOWNIK
// -------------------------------------
(function initSlownikWhenReady() {

    const container = document.getElementById("slownik");
    const searchInput = document.getElementById("search");
    const resetBtn = document.getElementById("reset-btn"); // 🔥 Pobieramy przycisk
    const alphabetBar = document.getElementById("alphabet-bar");
    const filterBtn = document.getElementById("filter-btn");
    const filterPanel = document.getElementById("filter-panel");
    const contentArea = document.getElementById("content") || document.body;

    // ⏳ DOM jeszcze nie gotowy
    if (!container || !searchInput) {
        requestAnimationFrame(initSlownikWhenReady);
        return;
    }

    // Resetujemy efekt na start przy każdym wejściu
    contentArea.classList.remove("page-loaded");

    // -------------------------------------
    // OBSŁUGA PANELU FILTRÓW (MODALA)
    // -------------------------------------
    if (filterBtn && filterPanel) {
        const filterCloseBtn = filterPanel.querySelector(".version-modal-close");

        filterBtn.onclick = function(e) {
            e.stopPropagation();
            filterPanel.classList.toggle("open");
        };

        if (filterCloseBtn) {
            filterCloseBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                filterPanel.classList.remove("open");
            };
        }

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && filterPanel) {
                filterPanel.classList.remove("open");
            }
        });

        document.addEventListener("click", function(e) {
            if (filterPanel.classList.contains("open") &&
                !filterPanel.contains(e.target) &&
                e.target !== filterBtn &&
                !filterBtn.contains(e.target)) {
                filterPanel.classList.remove("open");
            }
        });
    }

    // Wykluczenia z głównej listy A-Z
    const excluded = [
        "NZDT", "AEDT", "AEST", "JST", "KST", "ICT", "IST", "GST", "MSK", "TRT",
        "EET", "SAST", "CET", "BST", "GMT", "UTC", "BRT", "EST", "CST", "MST", "PST", "PDT",
        "monogamia", "poligamia", "poliandria",
        "poligynia", "promiskuityzm", "samozaplodnienie", "partenogeneza"
    ];

    let glossaryData = {};

    loadGlossary().then(data => {
        glossaryData = data;
        renderTimezones(data);
        renderReproductionStrategies(data);
        renderGlossary(data);

        setTimeout(() => {
            requestAnimationFrame(() => {
                handleGlossaryScroll();
            });
        }, 180);
    });

    // -------------------------------------
    // OBSŁUGA PRZEWIJANIA I PODŚWIETLANIA
    // -------------------------------------
    function handleGlossaryScroll() {
        const urlParams = new URLSearchParams(window.location.search);
        const rawHash = window.location.hash ? window.location.hash.replace("#", "") : "";

        const targetKey = urlParams.get("key") ||
            urlParams.get("term") ||
            urlParams.get("haslo") ||
            rawHash ||
            window.targetGlossaryKey ||
            window.glossaryTermToOpen;

        let targetEl = null;

        if (targetKey) {
            const cleanKey = decodeURIComponent(targetKey)
                .replace(/^glossary-/, "")
                .toLowerCase();

            targetEl = document.getElementById("glossary-" + cleanKey) ||
                document.getElementById(cleanKey) ||
                document.querySelector(`[data-key="${cleanKey}"]`);

            if (!targetEl) {
                const hasla = document.querySelectorAll(".haslo");
                for (let h of hasla) {
                    if (h.textContent.trim().toLowerCase() === cleanKey) {
                        targetEl = h.closest("p, div, tr") || h;
                        break;
                    }
                }
            }
        }

        if (targetEl) {
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

                targetEl.classList.remove("highlight-term");
                void targetEl.offsetWidth;
                targetEl.classList.add("highlight-term");
            }, 100);

            delete window.targetGlossaryKey;
            delete window.glossaryTermToOpen;
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            const mainContent = document.querySelector(".content-container, main, #app");
            if (mainContent) mainContent.scrollTop = 0;
        }
    }

    // -------------------------------------
    // RENDER: STREFY CZASOWE
    // -------------------------------------
    function extractPolishTimes(definition) {
        if (!definition) return { winter: "—", summer: "—" };
        let winter = "—",
            summer = "—";

        const matches = [...definition.matchAll(
            /(?:12:00\s*)?naszego czasu (zimą|latem) to (\d{1,2}:\d{2})(?: .*?następnej doby)?/gi
        )];

        matches.forEach(m => {
            const season = m[1].toLowerCase();
            const time = m[2] + (/następnej doby/i.test(m[0]) ? "+1" : "");
            if (season === "zimą") winter = time;
            if (season === "latem") summer = time;
        });

        return { winter, summer };
    }

    function renderTimezones(data) {
        const tbody = document.querySelector(".glossary-timezones .hasla");
        if (!tbody) return;

        tbody.innerHTML = "";

        const order = [
            "PST", "PDT", "MST", "CST", "EST", "BRT", "UTC", "GMT", "BST", "CET", "SAST",
            "EET", "MSK", "TRT", "GST", "IST", "ICT", "JST", "KST", "AEST", "AEDT", "NZDT"
        ];

        order.forEach(key => {
            const tz = data[key];
            if (!tz) return;

            const { winter, summer } = extractPolishTimes(tz.definition);

            const tr = document.createElement("tr");
            tr.id = "glossary-" + key.toLowerCase();
            tr.setAttribute("data-key", key.toLowerCase());
            tr.innerHTML = `
                <th><b>${key}</b></th>
                <td title="${tz.definition}">${tz.title}</td>
                <td>${winter}</td>
                <td>${summer}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // -------------------------------------
    // RENDER: STRATEGIE ROZRODCZE
    // -------------------------------------
    function renderReproductionStrategies(data) {
        const c = document.querySelector(".glossary-reproduction .hasla");
        if (!c) return;

        c.innerHTML = "";
        const withBullet = ["poliandria", "poligynia"];

        [
            "monogamia", "poligamia", "poliandria", "poligynia",
            "promiskuityzm", "samozaplodnienie", "partenogeneza"
        ]
        .map(k => ({ key: k, item: data[k] }))
            .filter(obj => obj.item)
            .forEach(({ key, item }) => {
                const div = document.createElement("div");
                div.id = "glossary-" + key.toLowerCase();
                div.setAttribute("data-key", key.toLowerCase());
                const bullet = withBullet.includes(key) ? "• " : "";
                div.innerHTML = `<b class='haslo'>${bullet}${item.title}</b> – ${item.definition}`;
                c.appendChild(div);
            });

        if (window.addNonBreakingSpaces) window.addNonBreakingSpaces(c);
    }

    // -------------------------------------
    // RENDER: PASEK ALFABETU A-Z
    // -------------------------------------
    function renderAlphabetBar(availableLetters) {
        if (!alphabetBar) return;
        alphabetBar.innerHTML = "";

        // Jeśli brak dopasowań, pokarzmy komunikat z animacją
        if (availableLetters.length === 0) {
            alphabetBar.style.display = "block";
            alphabetBar.innerHTML = '<div class="no-alphabet-msg">Brak liter – podana fraza nie występuje w&nbsp;słowniku</div>';
            return;
        }

        alphabetBar.style.display = "grid";

        availableLetters.forEach((letter, index) => {
            const btn = document.createElement("button");
            btn.className = "alphabet-letter";
            btn.textContent = letter;

            // 🔥 Dodaje minimalne opóźnienie dla każdej kolejnej litery (efekt fali)
            btn.style.animationDelay = `${index * 15}ms`;

            btn.onclick = () => {
                const headers = container.querySelectorAll(".naglowek-litera");
                for (let h of headers) {
                    if (h.textContent.trim().toUpperCase() === letter) {
                        h.scrollIntoView({ behavior: "smooth", block: "start" });
                        break;
                    }
                }
            };

            alphabetBar.appendChild(btn);
        });
    }

    // -------------------------------------
    // RENDER: GŁÓWNY SŁOWNIK A-Z
    // -------------------------------------
    function renderGlossary(data) {
        container.innerHTML = "";

        const entries = Object.entries(data)
            .filter(([k]) => !excluded.includes(k))
            .sort((a, b) => a[1].title.localeCompare(b[1].title, "pl"));

        let currentLetter = "";
        const letters = [];

        entries.forEach(([key, item]) => {
            const letter = item.title[0].toUpperCase();
            if (letter !== currentLetter) {
                currentLetter = letter;
                letters.push(letter);

                const h2 = document.createElement("h2");
                h2.className = 'naglowek-litera';
                h2.textContent = letter;
                container.appendChild(h2);
            }

            const p = document.createElement("p");
            p.id = "glossary-" + key.toLowerCase();
            p.setAttribute("data-key", key.toLowerCase());
            p.innerHTML = `<b class='haslo'>${item.title}</b> – ${item.definition}`;
            container.appendChild(p);

            if (window.addNonBreakingSpaces) window.addNonBreakingSpaces(p);
        });

        renderAlphabetBar(letters);
    }

    if (resetBtn && searchInput) {
        resetBtn.onclick = function() {
            searchInput.value = "";
            // Wyzwalamy zdarzenie input, aby przefiltrować słownik na nowo (pokazać wszystko)
            searchInput.dispatchEvent(new Event("input"));
        };
    }

    // -------------------------------------
    // SEARCH
    // -------------------------------------
    searchInput.oninput = () => {
        const q = searchInput.value.toLowerCase();
        const noResults = document.getElementById("no-results");

        const filteredEntries = Object.entries(glossaryData).filter(([k, v]) =>
            !excluded.includes(k) && (
                v.title.toLowerCase().includes(q) ||
                v.definition.toLowerCase().includes(q)
            )
        );

        container.innerHTML = "";

        if (filteredEntries.length === 0) {
            if (noResults) noResults.classList.add("show");
            renderAlphabetBar([]); // 🔥 Przekazujemy pustą tablicę – wygeneruje komunikat w panelu
            return;
        } else {
            if (noResults) noResults.classList.remove("show");
        }

        let currentLetter = "";
        const letters = [];

        filteredEntries
            .sort((a, b) => a[1].title.localeCompare(b[1].title, "pl"))
            .forEach(([key, item]) => {
                const letter = item.title[0].toUpperCase();
                if (letter !== currentLetter) {
                    currentLetter = letter;
                    letters.push(letter);

                    const h2 = document.createElement("h2");
                    h2.className = 'naglowek-litera';
                    h2.textContent = letter;
                    container.appendChild(h2);
                }

                const p = document.createElement("p");
                p.id = "glossary-" + key.toLowerCase();
                p.setAttribute("data-key", key.toLowerCase());
                p.innerHTML = `<b class='haslo'>${item.title}</b> – ${item.definition}`;
                container.appendChild(p);

                if (window.addNonBreakingSpaces) window.addNonBreakingSpaces(p);
            });

        renderAlphabetBar(letters);
    };
})();