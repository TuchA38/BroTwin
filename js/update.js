window.UPDATES = window.UPDATES || {};


function versionSort(a, b) {
    // normalizujemy
    var A = a.toLowerCase();
    var B = b.toLowerCase();

    // Alpha zawsze na końcu
    if (A === "alpha") return 1;
    if (B === "alpha") return -1;

    // Beta tuż nad Alphą
    if (A === "beta") return 1;
    if (B === "beta") return -1;

    // normalne wersje – sort malejąco
    return b.localeCompare(a, undefined, { numeric: true });
}

function syncGalleryWithDOM() {
    // Pobieramy zarówno obrazy <img>, jak i elementy <video> z GIF-ów
    const mediaEls = document.querySelectorAll(
        "#update-intro img, #update-intro .update-gif video, #update-sections img, #update-sections .update-gif video"
    );

    window.galleryImages = [];
    window.galleryImageSet = new Set();

    mediaEls.forEach((el, idx) => {
        el.dataset.galleryIndex = idx;

        // Pobieramy adres URL w zależności od tego, czy to <img> czy <video>
        let src = el.src;
        if (el.tagName.toLowerCase() === "video" && !src) {
            const source = el.querySelector("source");
            if (source) src = source.src;
        }

        if (src && !window.galleryImageSet.has(src)) {
            window.galleryImageSet.add(src);
            window.galleryImages.push(src);
        }
    });

    window.currentGallery = window.galleryImages.slice();
    window.currentIndex = 0;
}

(function(UPDATES) {

        UPDATES.data = UPDATES.data || [];
        UPDATES.loading = false;

        // 🔹 Wczytanie JSON
        function loadUpdates() {
            if (UPDATES.data.length) return Promise.resolve(UPDATES.data);
            if (UPDATES.loading) return UPDATES.loading;

            UPDATES.loading = fetch("data/update.json")
                .then(r => r.json())
                .then(data => {
                    UPDATES.data = data;
                    document.dispatchEvent(new CustomEvent("updatesReady"));
                    return data;
                });
            return UPDATES.loading;
        }

        // 🔹 Renderowanie listy aktualizacji dla bieżącej wersji
        function renderUpdateList() {
            const gameVersion = AppState.get();
            const container = document.getElementById("update-items");
            container.innerHTML = "";

            const updatesForVersion = UPDATES.data.filter(u => u.gameVersion && u.gameVersion.includes(gameVersion));

            const grouped = {};

            updatesForVersion.forEach(u => {
                const currentVersion = AppState.get();

                let version;
                if (currentVersion === "pz1console") {
                    version = u.consoleVersionTag || u.versionTag;
                } else if (currentVersion === "pz2") {
                    version = u.pz2VersionTag || u.versionTag;
                } else {
                    version = u.versionTag;
                }

                if (!grouped[version]) grouped[version] = [];
                grouped[version].push(u);
            });

            Object.keys(grouped)
                .sort(versionSort)
                .forEach((versionTag, idx) => {
                    const updates = grouped[versionTag];

                    const wrapper = document.createElement("div");
                    wrapper.className = "update-wrapper";

                    const versionHeader = document.createElement("div");
                    versionHeader.className = "update-title-header";
                    versionHeader.textContent = "Wersja " + versionTag;

                    const accordion = document.createElement("div");
                    accordion.className = "update-version-accordion";

                    const versionList = document.createElement("ul");
                    versionList.className = "update-version-list";

                    // ✅ PO ZMIANIE:
                    updates.forEach((update, i) => {
                        const li = document.createElement("li");
                        li.innerHTML = update.title; // 1. Używamy innerHTML, aby interpretować entje &nbsp;
                        addNonBreakingSpaces(li); // 2. Wstawiamy twarde spacje przed spójnikami (i/w/a itp.)

                        li.onclick = (e) => {
                            e.stopPropagation();
                            displayUpdate(update, li);
                        };
                        versionList.appendChild(li);

                        // Pierwszy element pierwszej wersji ładujemy na start
                        if (idx === 0 && i === 0) {
                            displayUpdate(update, li);
                        }
                    });

                    accordion.appendChild(versionList);
                    wrapper.appendChild(versionHeader);
                    wrapper.appendChild(accordion);
                    container.appendChild(wrapper);

                    // Obsługa ręcznego klikania w dowolną kategorię (rozwijanie/zwijanie)
                    versionHeader.onclick = () => {
                        const isOpen = accordion.classList.contains("is-open");
                        accordion.classList.toggle("is-open", !isOpen);
                        versionHeader.classList.toggle("is-open", !isOpen);
                    };
                });
        }

        // podświetlenie aktywnej wersji i rozwinięcie jej akordeonu
        function highlightActiveVersion(listEl, activeLi) {
            // 1. Czyszczenie starych klas aktywnych ze wszystkich elementów
            document.querySelectorAll(".update-version-list li")
                .forEach(li => li.classList.remove("active-version"));

            document.querySelectorAll(".update-title-header")
                .forEach(h => h.classList.remove("active-version"));

            if (!activeLi) return;

            // 2. Nadanie klasy podświetlenia klikniętemu elementowi
            activeLi.classList.add("active-version");

            // 3. Znalezienie rodzica i wymuszenie otwarcia akordeonu dla tej konkretnej wersji
            const wrapper = activeLi.closest(".update-wrapper");
            if (wrapper) {
                const header = wrapper.querySelector(".update-title-header");
                if (header) {
                    header.classList.add("active-version", "is-open");
                }

                const accordion = wrapper.querySelector(".update-version-accordion");
                if (accordion) {
                    accordion.classList.add("is-open");
                }
            }
        }

        function displayUpdate(update, element) {
            if (!update) return;

            const contentContainer = document.getElementById("update-content-container");

            // 1. Aktywujemy efekt blur i zniknięcia
            if (contentContainer) {
                contentContainer.classList.remove("update-loaded");
                contentContainer.classList.add("update-loading");
            }

            setTimeout(() => {
                // 🔹 TABLICA DLA GALERII – globalna
                window.galleryImages = [];
                window.galleryImageSet = new Set();

                const titleEl = document.getElementById("update-title");
                const metaEl = document.getElementById("update-meta");
                const introEl = document.getElementById("update-intro");
                const sectionsEl = document.getElementById("update-sections");

                titleEl.textContent = update.title;
                const currentVersion = AppState.get();

                let shownVersion;
                if (currentVersion === "pz1console") {
                    shownVersion =
                        update.consolePatchVersion ||
                        update.consoleVersionTag ||
                        update.patchVersion ||
                        update.versionTag;
                } else if (currentVersion === "pz2") {
                    shownVersion =
                        update.pz2PatchVersion ||
                        update.pz2VersionTag ||
                        update.patchVersion ||
                        update.versionTag;
                } else {
                    shownVersion =
                        update.patchVersion ||
                        update.versionTag;
                }

                metaEl.innerHTML = `<i>Wersja ${shownVersion} – ${update.date}</i>`;
                addNonBreakingSpaces(titleEl);

                introEl.innerHTML = update.intro && update.intro.length ?
                    update.intro.map(p => "<p>" + parseIntroText(p, update, update.videos, update.gifs, update.shortvideos, update.minishortvideos, update.images, update.shortimages, update.stackedimages, update.tables, update.minivideos, update.links) + "</p>").join("") :
                    "";

                sectionsEl.innerHTML = "";
                if (update.sections && update.sections.length) {
                    update.sections.forEach(sec => {
                        const block = document.createElement("div");
                        block.className = "update-section";
                        block.innerHTML = "<h4>" + (sec.title || "") + "</h4>" + (sec.items ? renderItems(sec.items, update) : "");
                        sectionsEl.appendChild(block);
                    });
                }

                // 🔹 Synchronizacja galerii z DOM
                syncGalleryWithDOM();

                if (update.facts && update.facts.length) {
                    const factsContainer = document.createElement("div");
                    factsContainer.className = "update-facts";
                    const ul = document.createElement("ul");
                    update.facts.forEach(f => {
                        const li = document.createElement("li");
                        li.textContent = f;
                        ul.appendChild(li);
                    });
                    factsContainer.appendChild(ul);
                    sectionsEl.appendChild(factsContainer);
                }

                if (update.outro) {
                    const outroContainer = document.createElement("div");
                    outroContainer.className = "update-outro";
                    outroContainer.innerHTML = parseIntroText(
                        update.outro,
                        update,
                        update.videos,
                        update.gifs,
                        update.shortvideos,
                        update.minishortvideos,
                        update.images,
                        update.shortimages,
                        update.stackedimages,
                        update.tables,
                        update.minivideos,
                        update.links
                    );
                    sectionsEl.appendChild(outroContainer);
                }

                // Zsynchronizuj currentGallery dla klawiszy
                window.currentGallery = window.galleryImages.slice();
                window.currentIndex = 0;

                // Rozwijamy listę i podświetlamy li (jeśli element istnieje)
                if (element) {
                    const listEl = element.closest(".update-version-list");
                    highlightActiveVersion(listEl, element);
                }

                // Powiązane DLC
                const relatedContainer = document.getElementById("update-related");
                if (relatedContainer) relatedContainer.innerHTML = "";

                // 🔹 Słownik i twarde spacje
                enrichTextWithGlossary(introEl);
                enrichTextWithGlossary(sectionsEl);

                introEl.querySelectorAll("p, b, li, span, div").forEach(el => {
                    enrichTextWithGlossary(el);
                });
                sectionsEl.querySelectorAll("p, b, li, span, div").forEach(el => {
                    enrichTextWithGlossary(el);
                });

                addNonBreakingSpaces(introEl);
                addNonBreakingSpaces(sectionsEl);

                introEl.querySelectorAll("p, li, span, div").forEach(el =>
                    addNonBreakingSpaces(el)
                );
                sectionsEl.querySelectorAll("p, li, span, div").forEach(el =>
                    addNonBreakingSpaces(el)
                );

                // 2. Usunięcie bluru i płynne wyłonienie nowej treści
                if (contentContainer) {
                    contentContainer.classList.remove("update-loading");
                    contentContainer.classList.add("update-loaded");
                }

                // 🔹 Płynne przewinięcie od razu z uwzględnieniem marginesu na górze (np. 100px)
                const updateTitleElement = document.getElementById("update-title");
                if (updateTitleElement) {
                    const elementPosition = updateTitleElement.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: elementPosition - 100, // 100px odstępu od góry ekranu
                        behavior: "smooth"
                    });
                }

                // 3. Zamknięcie panelu na urządzeniach mobilnych po kliknięciu
                if (typeof closeMobileSidebar === "function") {
                    closeMobileSidebar();
                }
            }, 150); // 150ms opóźnienia wystarczy na płynne wygaszenie starych danych
        }



        // 🔹 renderItems – rekurencyjne
        function renderItems(items, update) {
            if (!items || !items.length) return "";

            return "<ul>" + items.map(item => {
                const text = parseIntroText(
                    item.text,
                    update,
                    update.videos,
                    update.gifs,
                    update.shortvideos,
                    update.minishortvideos,
                    update.images,
                    update.shortimages,
                    update.stackedimages,
                    update.tables,
                    update.minivideos,
                    update.links
                );

                return "<li>" + text +
                    (item.children && item.children.length ?
                        renderItems(item.children, update) :
                        "") +
                    "</li>";
            }).join("") + "</ul>";
        }

        // 🔹 parseIntroText – obsługa video, image, linków
        function parseIntroText(text, update, videos, gifs, shortvideos, minishortvideos, images, shortimages, stackedimages, tables, minivideos, links) {
            let html = text
                .replace(/\{\{related-dlc:([^}]+)\}\}/g, function(_, dlcId) {
                    var label = dlcId;
                    if (update && update.related && update.related.dlc) {
                        var found = update.related.dlc.find(function(d) { return d.id === dlcId; });
                        if (found && found.label) {
                            label = found.label;
                        }
                    }
                    return '<a href="#" class="intro-related-dlc" data-dlc="' + dlcId + '">' + label + '</a>';
                })
                .replace(/\{\{update:([^}]+)\}\}/g, function(_, updateId) {
                    var label = updateId;
                    if (update && update.related && update.related.updates) {
                        var found = update.related.updates.find(function(d) { return d.id === updateId; });
                        if (found && found.label) {
                            label = found.label;
                        }
                    }
                    return '<a href="#" class="intro-related-update" data-update="' + updateId + '">' + label + '</a>';
                })
                .replace(/\{\{link:([^}]+)\}\}/g, function(_, linkId) {
                    if (!links || !links[linkId]) return "";
                    const l = links[linkId];
                    return `<a href="${l.url}" class="zalacznik" target="_blank" rel="noopener">${l.label}</a>`;
                })
                // 🔹 NOWE: Dynamiczna zmiana wersji gry z tekstu
                .replace(/\{\{change-version:([^|]+)\|([^}]+)\}\}/g, function(_, targetVersion, label) {
                    const currentVersion = AppState.get(); // Pobieramy aktualną wersję gry

                    // Jeśli użytkownik JUŻ JEST na docelowej wersji, zwracamy zwykły tekst, a nie link
                    if (currentVersion === targetVersion) {
                        return `<b>${label}</b>`;
                    }

                    // Jeśli jest na innej wersji, dajemy mu aktywny link
                    return `<a href="#" class="change-game-version" data-target-version="${targetVersion}">${label}</a>`;
                })
                // 🔹 NOWE: Zmiana podstrony (np. dlc, main) wraz ze zmianą wersji gry
                .replace(/\{\{change-page-version:([^|]+)\|([^|]+)\|([^}]+)\}\}/g, function(_, targetPage, targetVersion, label) {
                    return `<a href="#" class="change-page-version" data-target-page="${targetPage}" data-target-version="${targetVersion}">${label}</a>`;
                })
                // 🔹 NOWE: Otwieranie wydarzenia w kalendarzu
                .replace(/\{\{calendar-event:([^|]+)\|([^}]+)\}\}/g, function(_, eventTitle, label) {
                    return `<a href="#" class="open-calendar-event" data-event-title="${eventTitle}">${label}</a>`;
                });

            html = html.replace(/\[\[VIDEO:([^\]]+)\]\]/g, function(_, id) {
                        const v = videos && videos[id];
                        if (!v) return "";

                        return `
    <div class="update-video" style="max-width:95%; margin:0;">
        <div style="position:relative; width:100%; padding-top:56.25%;">
            <iframe
                src="${v.url}"
                loading="lazy"
                allowfullscreen
                style="
                    position:absolute;
                    inset:0;
                    width:100%;
                    height:100%;
                    border:0;
                    border-radius:8px;
                "
            ></iframe>
        </div>
        ${v.caption ? `<small>${v.caption}</small>` : ""}
    </div>`;
});

            html = html.replace(/\[\[SHORTVIDEO:([^\]]+)\]\]/g, function(_, id) {
                        const v = shortvideos && shortvideos[id];
                        if (!v) return "";

return `
<div class="update-short-video" style="width:280px; max-width:100%; margin:0 auto;">
    <div style="position:relative; width:100%; padding-top:177.78%;">
        <iframe
            src="${v.url}"
            loading="lazy"
            allowfullscreen
            style="
                position:absolute;
                inset:0;
                width:100%;
                height:100%;
                border:0;
                border-radius:8px;
            "
        ></iframe>
    </div>
    ${v.caption ? `<small>${v.caption}</small>` : ""}
</div>`;
});

html = html.replace(/\[\[MINISHORTVIDEOS:([^\]]+)\]\]/g, function(_, id) {
    const group = minishortvideos && minishortvideos[id];
    if (!group || !group.items || !group.items.length) return "";

    return `
<div class="mini-short-video-grid">
    ${group.items.map(item => `
        <div class="mini-short-video-item">
            <div class="mini-short-video-text">${item.text}</div>
            <div class="mini-short-video-frame">
                <iframe
                    src="${item.url}"
                    loading="lazy"
                    allowfullscreen
                ></iframe>
            </div>
        </div>
    `).join("")}
</div>
`;
});

html = html.replace(/\[\[MINIVIDEOS:([^\]]+)\]\]/g, function(_, id) {
    const group = minivideos && minivideos[id];
    if (!group || !group.items || !group.items.length) return "";

    return `
<div class="mini-video-grid">
    ${group.items.map(item => `
        <div class="mini-video-item" style="max-width:95%; margin:0;">
            <div class="mini-video-text">${parseIntroText(item.text, update, videos, gifs, shortvideos, minishortvideos, images, shortimages, stackedimages, tables, minivideos, links)}</div>
            <div class="mini-video-frame">
                <iframe
                    src="${item.url}"
                    loading="lazy"
                    allowfullscreen
                    style="
                    position:absolute;
                    inset:0;
                    width:100%;
                    height:100%;
                    border:0;
                    border-radius:8px;
                "
                ></iframe>
            </div>
        </div>
    `).join("")}
</div>
`;
});

            html = html.replace(/\[\[GIF:([^\]]+)\]\]/g, function(_, id) {
    const v = gifs && gifs[id];
    if (!v) return "";

    let index = window.galleryImages.length;
    if (!window.galleryImageSet.has(v.url)) {
        window.galleryImageSet.add(v.url);
        window.galleryImages.push(v.url);
        index = window.galleryImages.length - 1;
    } else {
        index = window.galleryImages.indexOf(v.url);
    }

    return `
<div class="update-gif" style="border-radius:8px; overflow:hidden; cursor:pointer;" onclick="openGallery(${index}, galleryImages)">
    <video
        autoplay
        loop
        muted
        playsinline
        preload="metadata"
        style="width:100%; height:auto; display:block;"
    >
        <source src="${v.url}" type="video/mp4">
    </video>
    ${v.caption ? `<small>${v.caption}</small>` : ""}
</div>`;
});

// specjalny przypadek dla konkretnego ID
html = html.replace(/\[\[IMAGE:([^\]]+)\]\]/g, function(_, id) {
    // jeśli to nasze wyjątkowe zdjęcie
    if (id === "hero-special") {
        const desktopSrc = shortimages && shortimages[id]; // PC pokazuje shortimage
        const mobileSrc = images && images[id];            // mobile pokazuje normalne

        if (!desktopSrc && !mobileSrc) return "";

        // dodaj do galerii, zachowując kolejność
        const index = window.galleryImages.length;
        window.galleryImages.push(desktopSrc || mobileSrc);

        return `
<div class="update-image">
  <picture>
    ${mobileSrc ? `<source media="(max-width:768px)" srcset="${mobileSrc}">` : ""}
    ${desktopSrc ? `<source media="(min-width:769px)" srcset="${desktopSrc}">` : ""}
    <img src="${desktopSrc || mobileSrc}" loading="lazy" alt="" style="width:100%; height:auto; border-radius:8px; cursor:pointer"
         onclick="openGallery(${index}, galleryImages)">
  </picture>
</div>`;
    }

    // standardowa obsługa pozostałych zdjęć
   const src = images && images[id];
if (!src) return "";

let index = window.galleryImages.length;
if (!window.galleryImageSet.has(src)) {
    window.galleryImageSet.add(src);
    window.galleryImages.push(src);
    index = window.galleryImages.length - 1; // index dla nowego obrazka
}

return `<div class="update-image">
    <img src="${src}" loading="lazy" alt="" style="max-width:95%; height:auto; border-radius:8px; cursor:pointer"
         onclick="openGallery(${index}, galleryImages)">
</div>`;

});

html = html.replace(/\[\[SHORTIMAGE:([^\]]+)\]\]/g, function(_, id) {
    const src = shortimages && shortimages[id];
    if (!src) return "";

    let index = window.galleryImages.length;
    if (!window.galleryImageSet.has(src)) {
        window.galleryImageSet.add(src);
        window.galleryImages.push(src);
        index = window.galleryImages.length - 1;
    }

    return `<div class="update-shortimage">
        <img src="${src}" loading="lazy" alt="" style="max-width:55%; height:auto; border-radius:8px; cursor:pointer"
             onclick="openGallery(${index}, galleryImages)">
    </div>`;
});


html = html.replace(/\[\[STACKEDIMAGES:([^\]]+)\]\]/g, function(_, id) {
    const stack = stackedimages && stackedimages[id];
    if (!stack || !stack.images || !stack.images.length) return "";

    return `<div class="stacked-images stacked-${id}">
        ${stack.images.map((src, i) => {
            let index;
            if (!window.galleryImageSet.has(src)) {
                window.galleryImageSet.add(src);
                window.galleryImages.push(src);
                index = window.galleryImages.length - 1;
            } else {
                index = window.galleryImages.indexOf(src);
            }

            return `
                <img 
                    src="${src}" 
                    class="stack-img img-${i + 1}" 
                    loading="lazy" 
                    alt="" 
                    style="cursor:pointer"
                    onclick="openGallery(${index}, galleryImages)"
                >
            `;
        }).join("")}
    </div>`;
});

html = html.replace(/\[\[TABLE:([^\]]+)\]\]/g, function(_, id) {
    const table = update.tables && update.tables[id];
    if (!table) return "";
    let htmlTable = `<table class="update-table">`;

    // nagłówki
    if (table.headers) {
        htmlTable += "<thead><tr>";
        table.headers.forEach(h => {
            htmlTable += `<th>${h}</th>`;
        });
        htmlTable += "</tr></thead>";
    }

    // wiersze
    htmlTable += "<tbody>";
    table.rows.forEach(row => {
        htmlTable += `
        <tr>
            <td>
                <img src="${row.logo}" loading="lazy" class="table-icon">
            </td>
            <td style="text-align:left;">
                <b>${row.title}</b><br>
                ${row.description}
            </td>
            <td>
                ${row.points}
            </td>
            <td>
                <img src="${row.trophy}" loading="lazy" style="width:50%;">
            </td>
        </tr>
        `;
    });
    htmlTable += "</tbody></table>";
    return `<div class="update-table-wrapper">${htmlTable}</div>`;
});

        return html;
    }

    // 🔹 Obsługa linków do DLC
    function openRelatedDLC(dlcId) {
        if (!window.loadPage) return;

        window.loadPage("dlc").then(() => {

            const openDlcModal = () => {
                let version = AppState.get();
                let dlcItem = window.DLC.data.find(d => d.id === dlcId && d.version === version);

                // 🔹 jeśli DLC nie pasuje do aktualnej wersji gry, ustaw wersję odpowiednią
                if (!dlcItem) {
                    const dlcVersions = window.DLC.data.filter(d => d.id === dlcId).map(d => d.version);
                    if (dlcVersions.length) {
                        version = dlcVersions[0]; // wybierz pierwszą wersję DLC
                        AppState.set(version);
                        document.dispatchEvent(new CustomEvent("versionChanged"));

                        // 🔹 zaktualizuj ikonki przycisku i menu
                        if (window.syncIconWithState) {
                            window.syncIconWithState();
                        }

                        dlcItem = window.DLC.data.find(d => d.id === dlcId && d.version === version);
                    }

                }

                if (dlcItem) {
                    window.DLC.openModal(dlcItem);
                } else {
                    console.warn("Nie znaleziono DLC:", dlcId);
                }
            };

            if (window.DLC && window.DLC.data && window.DLC.data.length) {
                openDlcModal();
            } else {
                // jeśli DLC jeszcze się nie wczytało, poczekaj na event
                const handler = () => {
                    document.removeEventListener("dlcReady", handler);
                    openDlcModal();
                };
                document.addEventListener("dlcReady", handler);
            }
        });
    }


    // 🔹 Obsługa kliknięć w linki w tekście
    document.addEventListener("click", function(e) {
        const dlcLink = e.target.closest(".intro-related-dlc");
        if (dlcLink) {
            e.preventDefault();
            openRelatedDLC(dlcLink.dataset.dlc);
            return;
        }

        const updateLink = e.target.closest(".intro-related-update");
        if (updateLink) {
            e.preventDefault();
            const target = UPDATES.data.find(u => u.id === updateLink.dataset.update);
            if (target) {
                // ustaw wersję jeśli nie pasuje
                if (target.gameVersion) {
                    const currentVersion = AppState.get();
                    const matchesCurrent = Array.isArray(target.gameVersion) ?
                        target.gameVersion.includes(currentVersion) :
                        target.gameVersion === currentVersion;

                    if (!matchesCurrent) {
                        const newVersion = Array.isArray(target.gameVersion) ? target.gameVersion[0] : target.gameVersion;
                        AppState.set(newVersion);
                        document.dispatchEvent(new CustomEvent("versionChanged"));
                        if (window.syncIconWithState) window.syncIconWithState();
                        if (window.renderFooter) window.renderFooter();

                    }
                }

                // znajdź li odpowiadające tej aktualizacji
                const listEl = document.getElementById("update-items");
                let li = null;
                listEl.querySelectorAll("li").forEach(item => {
                    if (item.textContent.trim() === target.title) li = item;
                });

                // wyświetl wpis
                displayUpdate(target, li || null);
            }
        }

        const versionLink = e.target.closest(".change-game-version");
        if (versionLink) {
            e.preventDefault();
            const targetVersion = versionLink.dataset.targetVersion; // np. "pz2"
            
            if (targetVersion) {
                // Ustawienie nowej wersji w aplikacji
                AppState.set(targetVersion);
                
                // Wywołanie eventów informujących resztę aplikacji o zmianie
                document.dispatchEvent(new CustomEvent("versionChanged"));
                
                if (window.syncIconWithState) window.syncIconWithState();
                if (window.renderFooter) window.renderFooter();
                
                // Opcjonalnie: Przewiń ekran na górę strony aktualizacji, żeby użytkownik widział nową listę
                const container = document.getElementById("update-items");
                if (container) {
                    container.scrollIntoView({ behavior: "smooth" });
                }
            }
            return;
        }

        // 🔹 NOWE: Obsługa przechodzenia na dlc.html / main itp. ze zmianą wersji gry
        const pageVersionLink = e.target.closest(".change-page-version");
        if (pageVersionLink) {
            e.preventDefault();
            const targetPage = pageVersionLink.dataset.targetPage;       // np. "dlc"
            const targetVersion = pageVersionLink.dataset.targetVersion;   // np. "pz1pc"

            if (window.loadPage && targetPage) {
                // Najpierw bezpiecznie ładujemy nową podstronę (zwraca Promise)
                window.loadPage(targetPage).then(() => {
                    if (targetVersion) {
                        // Po załadowaniu strony zmieniamy stan gry
                        AppState.set(targetVersion);
                        document.dispatchEvent(new CustomEvent("versionChanged"));
                        
                        if (window.syncIconWithState) window.syncIconWithState();
                        if (window.renderFooter) window.renderFooter();
                    }
                });
            }
            return;
        }

        const calendarEventLink = e.target.closest(".open-calendar-event");
if (calendarEventLink) {
    e.preventDefault();
    const eventTitle = calendarEventLink.dataset.eventTitle;
    if (window.CALENDAR && typeof window.CALENDAR.openEventByTitle === "function") {
        window.CALENDAR.openEventByTitle(eventTitle);
    }
    return;
}

    });

    // 🔹 inicjalizacja
function init() {
        loadUpdates().then(renderUpdateList);
        document.addEventListener("versionChanged", renderUpdateList);
        initMobileMenu(); // Wywołujemy od razu przy inicjalizacji modułu
    }

    init();

    // 🔹 Obsługa mobilnego menu wyboru wersji
function initMobileMenu() {
    const toggleBtn = document.getElementById("update-mobile-toggle");
    const sidebar = document.getElementById("updates-list-container");
    const overlay = document.getElementById("update-sidebar-overlay");

    if (!toggleBtn || !sidebar || !overlay) return;

    toggleBtn.onclick = () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    };

    overlay.onclick = closeMobileSidebar;
}

function closeMobileSidebar() {
    const sidebar = document.getElementById("updates-list-container");
    const overlay = document.getElementById("update-sidebar-overlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
}

// Wywołaj inicjalizację menu przy starcie
document.addEventListener("DOMContentLoaded", initMobileMenu);

})(window.UPDATES);