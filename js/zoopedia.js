/* ===============================
   ZOOPEDIA – SPA SAFE MODULE
================================ */

window.ZOOPEDIA = window.ZOOPEDIA || {};

(function(Z) {

        // Obserwator ekranu – odpala animację dopiero po dojechaniu scrollem
        const cardScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodajemy klasę, która włącza animację CSS
                    entry.target.classList.add("in-view");
                    // Przestajemy obserwować ten element, żeby nie animował się w kółko
                    cardScrollObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "0px 0px -50px 0px", // Flaga: odpal tuż przed wejściem na ekran
            threshold: 0.1
        });

        const REGION_OVERRIDES = {
            "Australia": {
                "Dziobak": ["Australia6", "Australia7"],
                "Emu zwyczajne": ["Australia2", "Australia3", "Australia4", "Australia6", "Australia7"],
                "Kangur rdzawoszyi": ["Australia6"],
                "Kangur rudy": ["Australia2"],
                "Karaluch nosorożec": ["Australia5"],
                "Kazuar hełmiasty": ["Australia5"],
                "Koala": ["Australia4", "Australia6", "Australia7"],
                "Krokodyl różańcowy": ["Australia3", "Australia5"],
                "Kuoka": ["Australia1"],
                "Pingwin mały": ["Australia1", "Australia4", "Australia6", "Australia7"],
                "Rudawka okularowa": ["Australia5"],
                "Tilikwa scynkowa": ["Australia3", "Australia4", "Australia5", "Australia6", "Australia7"],
                "Wombat tasmański": ["Australia7"],
                "Zdradnica śmiercionośna": ["Australia4", "Australia5", "Australia6"],
            },
            "Argentyna": {
                "Pingwin królewski": ["ARG1"]
            },
            "Chile": {
                "Pingwin królewski": ["CHI1"]
            },
            "Indonezja": {
                "Kazuar hełmiasty": ["Indonezja6", "Indonezja8", "Indonezja9"]
            },
            "Kanada": {
                "Bizon amerykański": ["CA11"],
                "Foka szara": ["CA1", "CA2", "CA4"]
            },
            "Stany Zjednoczone": {
                "Bizon amerykański": ["USA6", "USA7"],
                "Grzechotnik teksaski": ["US-MX"],
                "Heloderma arizońska": ["US-MX"],
                "Widłoróg amerykański": ["USA6", "USA7"],
                "Żółw diamentowy": ["USA7"]
            },
            "Meksyk": {
                "Grzechotnik teksaski": ["US-MX"],
                "Heloderma arizońska": ["US-MX"],
                "Aksolotl meksykański": ["Xochimilco"]
            },
            "Francja": {
                "Foka szara": ["BRAK"]
            },
            "Niemcy": {
                "Foka szara": ["BRAK"]
            },
            "Norwegia": {
                "Jeleń szlachetny": ["NO1"]
            }
        };

        const animalMigrationMap = {
            "lew_zachodnioafrykanski": "lew",
            // Tutaj w przyszłości dopisujesz kolejne pary
        };

        function switchGameVersion(targetVersion, currentAnimalId, fullAnimalList) {
            let nextAnimalId = null;

            // Jeśli chcemy iść do PZ2, szukamy czy obecne ID z PZ1 ma odpowiednika w PZ2
            if (targetVersion === "pz2") {
                if (animalMigrationMap[currentAnimalId]) {
                    nextAnimalId = animalMigrationMap[currentAnimalId];
                } else if (Object.values(animalMigrationMap).includes(currentAnimalId)) {
                    // Jesteśmy już w PZ2
                    nextAnimalId = currentAnimalId;
                }
            }
            // Jeśli chcemy wrócić do PZ1, szukamy klucza (PZ1) na podstawie wartości (PZ2)
            else if (targetVersion === "pz1pc" || targetVersion === "pz1console") {
                const reverseKey = Object.keys(animalMigrationMap).find(
                    key => animalMigrationMap[key] === currentAnimalId
                );
                if (reverseKey) {
                    nextAnimalId = reverseKey;
                } else if (animalMigrationMap[currentAnimalId]) {
                    // Jesteśmy już w PZ1
                    nextAnimalId = currentAnimalId;
                }
            }

            if (!nextAnimalId) return null;

            const newAnimalData = fullAnimalList.find(animal => animal.id === nextAnimalId);
            return newAnimalData || null;
        }

        /* ===============================
           GUARD – nie inicjalizuj 2x
        ================================ */
        if (Z.initialized) {
            Z.render();
            return;
        }

        Z.initialized = true;
        Z.data = [];

        /* ===============================
UI – PRZYCISKI & MODALE
================================ */
        Z.initUI = function() {

            const filterBtn = document.getElementById("filter-btn");
            const filterPanel = document.getElementById("filter-panel");
            const modal = document.getElementById("species-modal");
            const closeModal = document.getElementById("close-modal");

            let filterCloseBtn = null;

            if (filterPanel) {
                filterCloseBtn = filterPanel.querySelector(".version-modal-close");
            }

            // =========================
            // TOGGLE PANELU FILTRÓW
            // =========================
            if (filterBtn && filterPanel) {
                filterBtn.onclick = function() {
                    filterPanel.classList.toggle("open");
                };
            }

            // =========================
            // ZAMYKANIE PANELU FILTRÓW (X)
            // =========================
            if (filterCloseBtn && filterPanel) {
                filterCloseBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation(); // 🔥 kluczowe
                    filterPanel.classList.remove("open");
                };
            }

            // =========================
            // ZAMYKANIE MODALA GATUNKU
            // =========================
            if (closeModal && modal) {
                closeModal.onclick = function() {
                    modal.classList.remove("show");
                    setTimeout(function() {
                        modal.classList.add("hidden");
                    }, 250);
                };
            }

            // =========================
            // ESC – zamykanie panelu filtrów
            // =========================
            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape" && filterPanel) {
                    filterPanel.classList.remove("open");
                }
            });

            // zamykanie modala kliknięciem poza treść
            if (modal) {
                modal.addEventListener("click", e => {
                    if (e.target === modal) {
                        modal.classList.remove("show");
                        setTimeout(() => modal.classList.add("hidden"), 250);
                    }
                });
            }
        };

        /* ===============================
           INIT
        ================================ */
        function initZoopedia() {
            const container = document.getElementById("zoopedia");
            if (!container) return; // element jeszcze nie w DOM → render czeka

            // jeśli dane już są, renderujemy od razu
            if (Z.data.length) {
                Z.render();
                return;
            }

            // fetch JSON tylko raz
            if (!Z.loading) {
                Z.loading = true;
                fetch("data/zoopedia.json")
                    .then(res => res.json())
                    .then(data => {
                        Z.data = data;
                        Z.render(); // render sprawdzi, czy element istnieje
                        document.dispatchEvent(new CustomEvent("zoopediaReady"));

                    })
                    .catch(err => console.error("Błąd ładowania Zoopedii:", err))
                    .finally(() => Z.loading = false);
            }
            Z.initUI();
        }

        /* ===============================
           RENDER LISTY
        ================================ */
        Z.render = function() {
            const zoopedia = document.getElementById("zoopedia");
            if (!zoopedia) return; // element jeszcze nie w DOM → render czeka
            if (!Z.data.length) return; // dane nie są jeszcze pobrane

            zoopedia.innerHTML = "";

            const currentVersion = AppState.get();

            Z.data.forEach(animal => {
                const div = document.createElement("div");
                div.className = "filter-item " + (animal.classes ? animal.classes.join(" ") : "");
                div.dataset.availability = animal.availability.join(",");
                div.dataset.image = animal.image;
                div.dataset.remaster = animal.remasterImage || "";
                if (animal.contentByVersion) {
                    div.dataset.contentByVersion = JSON.stringify(animal.contentByVersion);
                }

                // ⬇️ TUTAJ PODMIENIASZ LOGIKĘ OBRAZKA ⬇️
                let imgSrc = animal.image;
                if (currentVersion === "pz2") {
                    imgSrc = animal["pz2image-remater"] || animal.pz2image || animal.image;
                } else if (currentVersion !== "pz1console" && animal.remasterImage) {
                    imgSrc = animal.remasterImage;
                }

                div.innerHTML = `
            <a href="#">
                <img loading="lazy"
                     src="${imgSrc}"
                     alt="${animal.name}">
                <span class="podpis">${animal.name}</span>
            </a>
            `;

                div.onclick = e => {
                    e.preventDefault();
                    if (animal.availability.includes(AppState.get())) {
                        Z.showSpecies(animal); // ✅ Poprawione
                    }
                };

                zoopedia.appendChild(div);
            });

            initFilters();
            updateContentButtons();
        };

        /* ===============================
           VERSION CHANGE
        ================================ */
        if (!Z.versionListenerAttached) {
            document.addEventListener("versionChanged", () => Z.render());
            Z.versionListenerAttached = true;
        }

        function renderSpeciesStatus(animal, era) {
            const statusContainer = document.getElementById("species-status");
            const descContainer = document.getElementById("species-description-container");

            const statusHtml = animal.statusImage ? `
        <div style="text-align: center; color: #fff; font-style: italic; margin: 15px 0;">
            <div style="margin-bottom: 5px;">Status: <b>${animal.status || ""}</b></div>
            <img src="${animal.statusImage}" alt="${animal.status}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
            <div style="margin-top: 5px;">
                Wielkość populacji na wolności: <b>${animal.population || ""}</b>
            </div>
        </div>
    ` : `
        <div style="margin: 15px 0;">
            <b>Status ochrony:</b> ${animal.status || "Brak danych"}<br>
            Wielkość populacji na wolności: <b>${animal.population || "Brak danych"}</b>
        </div>
    `;

            if (era === "PZ2") {
                // PZ2: Ukryj zewnętrzny kontener, wstrzyknij do tekstu
                if (statusContainer) statusContainer.style.display = "none";
                return statusHtml; // Zwracamy HTML do wstrzyknięcia w tekst
            } else {
                // PZ1: Pokaż zewnętrzny kontener, zwróć pusty string dla tekstu
                if (statusContainer) {
                    statusContainer.innerHTML = statusHtml;
                    statusContainer.style.display = "block";
                }
                return "";
            }
        }

        function getStatusHtml(animal) {
            if (animal.statusImage) {
                return `
            <div style="text-align: center; color: #fff; font-style: italic; margin: 15px 0;">
                <div style="margin-bottom: 5px;">Status: <b>${animal.status || ""}</b></div>
                <img src="${animal.statusImage}" alt="${animal.status}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
                <div style="margin-top: 5px;">
                    Wielkość populacji na wolności: <b>${animal.population || ""}</b>
                </div>
            </div>`;
            }
            return `
        <div style="margin: 15px 0;">
            <b>Status ochrony:</b> ${animal.status || "Brak danych"}<br>
            Wielkość populacji na wolności: <b>${animal.population || "Brak danych"}</b>
        </div>`;
        }

        // -------------------------
        // FUNKCJA GENERUJĄCA PEŁNĄ STRONĘ GATUNKU
        // -------------------------
        // -------------------------
        // FUNKCJA GENERUJĄCA PEŁNĄ STRONĘ GATUNKU
        // -------------------------
        Z.showSpecies = function(animal, forcedEra = null) {
                const modal = document.getElementById("species-modal");
                if (!modal) {
                    console.warn("Modal species-modal nie istnieje w DOM!");
                    return;
                }

                // 🌟 RESET PRZEWIJANIA: Wymuszenie powrotu na samą górę modala
                modal.scrollTop = 0;
                const modalScrollable = modal.querySelector(".modal-content, .species-modal-content, .modal-body");
                if (modalScrollable) {
                    modalScrollable.scrollTop = 0;
                }

                const modalName = modal.querySelector("#species-name");
                const modalImage = modal.querySelector("#species-image");
                const modalInfo = modal.querySelector("#species-info");

                if (!modalName || !modalImage || !modalInfo) {
                    console.warn("Modal brakuje wymaganych elementów");
                    return;
                }

                // --- 1. USTALENIE WERSJI I ERY ---
                const currentVersion = AppState.get();
                const isMigratedAnimal = animalMigrationMap[animal.id] || Object.values(animalMigrationMap).includes(animal.id);

                const hasPZ1 = isMigratedAnimal ? true : (animal.availability ? (animal.availability.includes("pz1pc") || animal.availability.includes("pz1console")) : true);
                const hasPZ2 = isMigratedAnimal ? true : (animal.availability ? animal.availability.includes("pz2") : (!!animal.pz2image));

                let currentGameEra = forcedEra || ((currentVersion === "pz2" && hasPZ2) ? "PZ2" : "PZ1");
                if (currentGameEra === "PZ1" && !hasPZ1 && hasPZ2) currentGameEra = "PZ2";

                // 🌟 PRZYGOTOWANIE ANIMACJI TREŚCI (BLUR & FADE IN)
                // Zbieramy kluczowe bloki tekstowe i tabele, które mają się płynnie wyłonić
                const elementsToAnimate = modal.querySelectorAll(
                    ".modal-header, #species-description-container, .modal-columns, .species-info, .species-curiosities, #species-reservoirs"
                );

                elementsToAnimate.forEach(el => {
                    el.style.transition = "none";
                    el.style.opacity = "0";
                    el.style.filter = "blur(8px)";
                    el.style.transform = "translateY(8px)";
                });

                // --- WGATRYWANIE NAZWY, ZDJĘĆ I TAKSONOMII ---
                modalName.innerHTML = `
        ${animal.name}<br>
        <span style="font-size: 0.6em; font-style: italic; font-weight: normal; line-height: 0.8;">
            (${animal.latin || ""})
        </span>
    `;

                let isRemasterActive = (currentGameEra === "PZ1" && currentVersion !== "pz1console" && !!animal.remasterImage) ||
                    (currentGameEra === "PZ2" && !!animal["pz2image-remater"]);

                function getTargetImageSrc() {
                    if (currentGameEra === "PZ2") {
                        return isRemasterActive ? (animal["pz2image-remater"] || animal.pz2image || animal.image) : (animal.pz2image || animal.image);
                    } else {
                        return isRemasterActive ? (animal.remasterImage || animal.fullImage || animal.image) : (animal.fullImage || animal.image);
                    }
                }

                modalImage.src = getTargetImageSrc();

                let existingTaxOverlay = document.querySelector(".species-taxonomy-overlay");
                if (existingTaxOverlay) existingTaxOverlay.remove();

                const imageContainer = document.querySelector(".species-image-container");
                const taxOverlay = document.createElement("div");
                taxOverlay.className = "species-taxonomy-overlay";
                Object.entries(animal.taxonomy || {}).forEach(([key, val]) => {
                    const span = document.createElement("span");
                    span.innerHTML = `<b>${key}:</b> ${val}`;
                    taxOverlay.appendChild(span);
                });
                imageContainer.appendChild(taxOverlay);

                // -------------------------------------------------------------
                // 🔹 DEKLARACJE FUNKCJI POMOCNICZYCH DLA TEKSTU I KONTROLEK UI 🔹
                // -------------------------------------------------------------
                function updateTextContent() {
                    const descContainer = document.getElementById("species-description-container");
                    if (!descContainer) return;

                    const currentStatusHtml = renderSpeciesStatus(animal, currentGameEra);

                    let fullInfoText = "";
                    if (currentGameEra !== "PZ2") {
                        // 🌟 POPRAWKA DLA PZ1: Opakowujemy conservation w osobny div zamiast używać surowych <br><br>
                        // Dzięki temu TreeWalker w słowniczku prawidłowo odczytuje i indeksuje wszystkie słowa kluczowe!
                        fullInfoText = `
                            ${animal.info || ""}
                            ${animal.conservation ? `<div style="margin-top: 25px;">${animal.conservation}</div>` : ""}
                        `;
                    } else {
                        // 📱 Sprawdzamy, czy to urządzenie mobilne (telefon/tablet)
                        const isMobile = window.innerWidth <= 768;

                        // 🔹 Generujemy kod znaku tylko dla komputerów (Desktop)
                        let znakHtml = "";
                        if (animal.znak && !isMobile) {
                            znakHtml = `
                                <div class="species-pz2-znak-container" style="position: absolute; right: 0; top: 0; width: 400px; text-align: center; z-index: 10;">
                                    <img src="${animal.znak}" alt="Znak odbity - ${animal.name}" class="species-pz2-znak" 
                                         style="
                                            max-width: ${animal.znakWidth || '240px'}; 
                                            max-height: ${animal.znakHeight || '210px'}; 
                                            width: auto; 
                                            margin-top: 20px;
                                            height: auto; 
                                            object-fit: contain; 
                                            display: inline-block; 
                                            border-radius: 4px; 
                                            filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4)); 
                                            transform: scaleX(-1);
                                         ">
                                </div>
                            `;
                        }

                        // 🔹 NOWOŚĆ: Kod znaku dla telefonów (Mobile) przeniesiony tutaj, aby odświeżał się przy zmianie ery!
        let mobileZnakHtmlInText = "";
        if (animal.znak && isMobile) {
            mobileZnakHtmlInText = `
                <div class="species-pz2-znak-container" style="position: static; width: 100%; text-align: center; margin: 15px 0; display: block;">
                    <img src="${animal.znak}" alt="Znak - ${animal.name}" class="species-pz2-znak" style="max-width: 220px; width: 60%; max-height: 180px; object-fit: contain; display: inline-block;">
                </div>
            `;
        }

        // ⚙️ Dynamiczne style dostosowane do wielkości ekranu
        const statusWidth = isMobile ? "97%" : "30%";
        const statusMarginBottom = isMobile ? "-40px" : "-40px";
        const conservationMarginRight = isMobile ? "2px" : "420px";

        fullInfoText = `
            ${animal.info || ""}
            <hr class="modal-separator">
            <div style="position: relative; width: 100%;">
                <div id="species-status" style="width: ${statusWidth}; margin: 0 auto; margin-bottom: ${statusMarginBottom};">${currentStatusHtml}</div>
                ${animal.conservation ? `<br><br><div style="margin-left: 0px; margin-right: ${conservationMarginRight};">${animal.conservation}</div>` : ""}
                ${znakHtml}
                ${mobileZnakHtmlInText}  <!-- Wstrzyknięcie znaku mobilnego we właściwe miejsce -->
            </div>
        `;
    }
    descContainer.innerHTML = fullInfoText || "Brak dodatkowych informacji";

                    // 🔥 Automatyczne formatowanie tekstu przy każdym wywołaniu (w tym przy zmianie ery gry)
                    descContainer.querySelectorAll('p, th, td, span, div').forEach(el => {
                        if (typeof enrichTextWithGlossary === "function") {
                            enrichTextWithGlossary(el);
                        }
                    });

                    // 🌟 POPRAWKA SŁOWNICZKA: 
                    // Przeszukujemy cały kontener opisu oraz nagłówek modala, żeby wyłapać słówka wszędzie
                    if (typeof enrichTextWithGlossary === "function") {
                        enrichTextWithGlossary(descContainer);
                        
                        const modalHeader = document.querySelector(".modal-header");
                        if (modalHeader) {
                            enrichTextWithGlossary(modalHeader);
                        }
                    }
                    
                    if (typeof addNonBreakingSpaces === "function") {
                        addNonBreakingSpaces(descContainer);
                    }
                }

                function updateImageControlsUI() {
                    // Usuwamy przyciski i ikony (usunięto stąd klasę znaku, bo teraz mieszka w sekcji tekstu)
                    document.querySelectorAll(".game-era-toggle, .remaster-toggle, .species-icon-btn").forEach(e => e.remove());

                    // --- 🔹 (STARY KOD GENEROWANIA ZNAKU NA ZDJĘCIU ZOSTAŁ STĄD USUNIĘTY) 🔹 ---

                    let iconOffset = 8;

                    // --- IKONA: MOD ---
                    if (currentVersion !== "pz1console") {
                        let activeModLink = null;

                        if (currentGameEra === "PZ1" && animal.mod) {
                            activeModLink = animal.mod;
                        } else if (currentGameEra === "PZ2" && animal.pz2mod) {
                            activeModLink = animal.pz2mod;
                        }

                        if (activeModLink) {
                            const modBtn = document.createElement("button");
                            modBtn.className = "species-icon-btn";
                            modBtn.title = `Zobacz mod (${currentGameEra})`;
                            modBtn.style.right = iconOffset + "px";
                            modBtn.innerHTML = "<img class='ikona-zdjecie2' src='https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829423/mod_rngo1s.webp'>";
                            modBtn.onclick = () => window.open(activeModLink, "_blank");
                            imageContainer.appendChild(modBtn);
                            iconOffset += 50;
                        }
                    }

                    // --- IKONA: DLC ---
                    if (animal.dlc) {
                        let dlcData = null;
                        let targetGlobalVersion = currentVersion;

                        if (currentGameEra === "PZ1") {
                            targetGlobalVersion = (currentVersion === "pz1console") ? "pz1console" : "pz1pc";
                            dlcData = (currentVersion === "pz1console" && animal.dlc.pz1console) ? animal.dlc.pz1console : animal.dlc.pz1pc;
                        } else if (currentGameEra === "PZ2") {
                            targetGlobalVersion = "pz2";
                            dlcData = animal.dlc.pz2;
                        }

                        if (dlcData) {
                            const dlcBtn = document.createElement("button");
                            dlcBtn.className = "species-icon-btn";
                            dlcBtn.title = dlcData.name;
                            dlcBtn.style.right = iconOffset + "px";
                            // 🌟 Pozwalamy zawartości (zdjęciu) wyjść poza ramy przycisku
                            dlcBtn.style.overflow = "visible"; 
                            
                            dlcBtn.innerHTML = "<img class='ikona-zdjecie-duza' src='https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829340/dlc_zbn7i2.webp'>";
                            dlcBtn.onclick = () => {
                                modal.classList.remove("show");
                                setTimeout(() => modal.classList.add("hidden"), 200);

                                if (AppState && typeof AppState.set === "function") {
                                    AppState.set(targetGlobalVersion);
                                }

                                if (window.loadPage && typeof window.loadPage === "function") {
                                    window.loadPage("dlc").then(() => {
                                        const openDlcModal = () => {
                                            const version = AppState.get();
                                            const dlcItem = window.DLC.data.find(d =>
                                                (d.name === dlcData.name || d.id === dlcData.id) && d.version === version
                                            );
                                            if (dlcItem) window.DLC.openModal(dlcItem);
                                        };

                                        if (window.DLC && window.DLC.data && window.DLC.data.length) {
                                            openDlcModal();
                                        } else {
                                            const handler = () => {
                                                document.removeEventListener("dlcReady", handler);
                                                openDlcModal();
                                            };
                                            document.addEventListener("dlcReady", handler);
                                        }
                                    });
                                }
                            };
                            imageContainer.appendChild(dlcBtn);
                        }
                    }

                    // --- PRZYCISK: Zmiana Ery Gry ---
                    if (hasPZ1 && hasPZ2) {
                        const gameToggleBtn = document.createElement("button");
                        
                        // 🌟 Dajemy mu tę samą klasę co przycisk DLC, by dziedziczył 100% styli!
                        gameToggleBtn.className = "species-icon-btn"; 
                        gameToggleBtn.title = `Przełącz na Planet Zoo ${currentGameEra === "PZ1" ? "2" : "1"}`;
                        
                        // Pozycjonujemy go elegancko przy lewej krawędzi (zamiast prawej, jak DLC)
                        gameToggleBtn.style.left = "10px"; 
                        gameToggleBtn.style.right = "auto"; 

                        // 🌟 Renderujemy strukturę obrazka identyczną z DLC - tutaj podmieniasz linki na własne zdjęcia ikon!
                        if (currentGameEra === "PZ1") {
                            // Ikona gdy aktywna jest era PZ1 (pokazuje np. logo PZ2 jako zachętę do kliknięcia)
                            gameToggleBtn.innerHTML = "<img class='ikona-zdjecie' src='https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861244/Planet_Zoo_logo_pexc4k.webp'>";
                        } else {
                            // Ikona gdy aktywna jest era PZ2 (pokazuje np. logo PZ1)
                            gameToggleBtn.innerHTML = "<img class='ikona-zdjecie' src='https://res.cloudinary.com/ddqbmcmoe/image/upload/v1783087642/Planet_Zoo_2_logo_equwwg.webp'>";
                        }

                       gameToggleBtn.onclick = () => {
    const targetEra = (currentGameEra === "PZ1") ? "pz2" : "pz1pc";
    
    // 1. Sprawdzamy migrację między obiektami
    const migratedAnimal = switchGameVersion(targetEra, animal.id, Z.data);
    
    if (migratedAnimal) {
        // 2. Scenariusz migracji obiektów (np. lew <-> lew_zachodnioafrykanski)
        const elementsToAnimate = [];
        const modalHeader = document.querySelector(".modal-header");
        const contentWrapper = document.querySelector(".modal-content-wrapper") || 
                               document.querySelector(".species-modal-content") ||
                               document.getElementById("species-description-container")?.parentElement;
        
        if (modalHeader) elementsToAnimate.push(modalHeader);
        if (contentWrapper) elementsToAnimate.push(contentWrapper);
        
        modalImage.classList.add("fade-out");
        if (elementsToAnimate.length > 0) {
            elementsToAnimate.forEach(el => {
                el.style.transition = "opacity 0.24s ease, filter 0.24s ease, transform 0.24s ease";
                el.style.opacity = "0";
                el.style.filter = "blur(2px)";
                el.style.transform = "translateY(2px)";
            });
        }

        setTimeout(() => {
            modalImage.classList.remove("fade-out");
            if (elementsToAnimate.length > 0) {
                elementsToAnimate.forEach(el => {
                    el.style.opacity = "1";
                    el.style.filter = "blur(0px)";
                    el.style.transform = "translateY(0px)";
                });
            }
            
            const nextEraParam = (currentGameEra === "PZ1") ? "PZ2" : "PZ1";
            
            // 🔥 WYMUSZENIE ZMIANY ATRYBUTU DLA TELEFONU PRZED PONOWNYM RENDEREM
            modal.setAttribute("data-game-era", nextEraParam.toLowerCase());

            Z.showSpecies(migratedAnimal, nextEraParam);
        }, 300);

    } else {
        // 3. Tradycyjna ścieżka dla pozostałych zwierząt (współdzielących jeden obiekt)
        currentGameEra = (currentGameEra === "PZ1") ? "PZ2" : "PZ1";
        isRemasterActive = (currentGameEra === "PZ1" && currentVersion !== "pz1console" && !!animal.remasterImage) || 
                           (currentGameEra === "PZ2" && !!animal["pz2image-remater"]);
        
        // 🔥 Ustawiamy atrybut ery również w tradycyjnej ścieżce
        modal.setAttribute("data-game-era", currentGameEra.toLowerCase());
        
        triggerImageFadeTransition(true);
    }
};
                        
                        imageContainer.appendChild(gameToggleBtn);
                    }

                    // --- PRZYCISK: Remaster ---
                    const hasRemasterForCurrentEra = (currentGameEra === "PZ1" && !!animal.remasterImage) ||
                        (currentGameEra === "PZ2" && !!animal["pz2image-remater"]);

                    if (currentVersion !== "pz1console" && hasRemasterForCurrentEra) {
                        const toggleBtn = document.createElement("button");
                        toggleBtn.className = "remaster-toggle";
                        toggleBtn.title = "Przełącz zdjęcie remaster/original";
                        toggleBtn.innerHTML = `
                        <img class="remaster-thumb" ${isRemasterActive ? 'style="border: 0px"' : ''}
                             src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829421/change_fqnrwx.webp"
                             alt="Remaster preview">
                    `;
                        toggleBtn.onclick = () => {
                            isRemasterActive = !isRemasterActive;
                            triggerImageFadeTransition();
                        };
                        imageContainer.appendChild(toggleBtn);
                    }
                }

                function triggerImageFadeTransition(isEraChange = false) {
                    // 🌟 Łapiemy bezpośrednio elementy, które mają zniknąć (w tym nagłówek i główną treść)
                    // Dzięki temu okno modala/tło pozostaje w 100% nieruchome!
                    const elementsToAnimate = [];
                    
                    const modalHeader = document.querySelector(".modal-header");
                    const contentWrapper = document.querySelector(".modal-content-wrapper") || 
                                           document.querySelector(".species-modal-content") ||
                                           document.getElementById("species-description-container")?.parentElement;
                    
                    if (modalHeader) elementsToAnimate.push(modalHeader);
                    if (contentWrapper) elementsToAnimate.push(contentWrapper);
                    
                    // 1. Zawsze animujemy samo zdjęcie (klasa fade-out)
                    modalImage.classList.add("fade-out");
                    
                    // 2. Jeśli zmieniamy erę gry, animujemy WSZYSTKIE wybrane elementy (header, rezerwaty, opisy)
                    if (isEraChange && elementsToAnimate.length > 0) {
                        elementsToAnimate.forEach(el => {
                            el.style.transition = "opacity 0.24s ease, filter 0.24s ease, transform 0.24s ease";
                            el.style.opacity = "0";
                            el.style.filter = "blur(2px)";
                            el.style.transform = "translateY(2px)"; // Subtelne, płynne tąpnięcie treści
                        });
                    }

                    setTimeout(() => {
                        // 🌟 NOWOŚĆ: Ustawiamy atrybut ery na głównym oknie modala (małe litery 'pz1' lub 'pz2' dla wygody w CSS)
                        modal.setAttribute("data-game-era", currentGameEra.toLowerCase());
                        // Podmieniamy źródło zdjęcia i odświeżamy treść pod osłoną niewidoczności
                        modalImage.src = getTargetImageSrc();
                        
                        // Przebudowanie tekstów, statusów, znaków, rezerwatów itd.
                        updateTextContent();
                        
                        // Aktualizacja przycisków, nagłówka (modal-header) i metadanych ery
                        updateImageControlsUI();

                        // Usuwamy klasę wygaszenia i dajemy klasę pojawiania się dla zdjęcia
                        modalImage.classList.remove("fade-out");
                        modalImage.classList.add("fade-in");
                        
                        // 3. Płynnie wyłaniamy całą zawartość z powrotem (w tym header!)
                        if (isEraChange && elementsToAnimate.length > 0) {
                            elementsToAnimate.forEach(el => {
                                el.style.opacity = "1";
                                el.style.filter = "blur(0px)";
                                el.style.transform = "translateY(0px)";
                            });
                        }

                        setTimeout(() => modalImage.classList.remove("fade-in"), 300);
                    }, 300);
                }

                // --- 2. REZERWATY ---
                const reservoirsContainer = document.getElementById("species-reservoirs");
                reservoirsContainer.innerHTML = "";

                const reservoirs = animal.reservoirs || [];
                let currentIndex = 0;

                const div = document.createElement("div");
                div.className = "reservoir";
                div.style.position = "relative";
                div.style.transition = "all 0.4s ease";
                reservoirsContainer.appendChild(div);

                function renderReservoir(index, direction = 1) {
                    if (!reservoirs.length) {
                        div.innerHTML = "";
                        return;
                    }

                    div.style.opacity = 0;
                    div.style.transform = `translateX(${direction * 30}px)`;

                    setTimeout(() => {
                                const res = reservoirs[index];
                                div.innerHTML = `
                        <a href="${res.link}" class="name-link"><img class="mapa-rezerwatu" src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829337/mapa_mobbyj.webp"><span class="nazwa-rezerwatu"> ${res.name} </span></a>
                        <img src="${res.map || res.icon}" alt="${res.name}" class="map">
                        <div class="population-overlay">
                            <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793723/samiec_a3alpa.webp" alt="samiec"><span>${res.male || 0}</span>
                            <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793717/samica_erwgov.webp" alt="samica"><span>${res.female || 0}</span>
                        </div>
                        ${reservoirs.length > 1 ? `
                            <span class="arrow left">&#9664;</span>
                            <span class="arrow right">&#9654;</span>
                        ` : ""}
                    `;

                    div.style.opacity = 1;
                    div.style.transform = "translateX(0)";

                    const leftArrow = div.querySelector(".arrow.left");
                    const rightArrow = div.querySelector(".arrow.right");

                    if (leftArrow) leftArrow.onclick = () => {
                        currentIndex = (currentIndex - 1 + reservoirs.length) % reservoirs.length;
                        renderReservoir(currentIndex, 1);
                    };
                    if (rightArrow) rightArrow.onclick = () => {
                        currentIndex = (currentIndex + 1) % reservoirs.length;
                        renderReservoir(currentIndex, -1);
                    };
                }, 200); 
            }

            renderReservoir(currentIndex);

            // --- 3. PRZYGOTOWANIE STRUKTURY STATYSTYCZNEJ ---
            const statIcons = {
                "Wielkość": "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793823/rozmiar_prfcfs.webp",
                "Długość życia": "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793817/d%C5%82ugo%C5%9B%C4%87_%C5%BCycia_yu5gko.webp",
                "Waga": "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793729/waga_mmrgjm.webp"
            };

            const isMobile = window.innerWidth <= 768;
            let mobileZnakHtml = "";
            if (isMobile && currentGameEra === "PZ2" && animal.znak) {
                mobileZnakHtml = `
                    <div class="species-pz2-znak-container" style="position: static; width: 100%; text-align: center; margin-top: -30px; margin-bottom: -40px; display: block;">
                        <img src="${animal.znak}" alt="Znak - ${animal.name}" class="species-pz2-znak" style="max-width: 220px; width: 60%; max-height: 180px; object-fit: contain; display: inline-block;">
                    </div>
                `;
            }

            // GŁÓWNY SZKIELET HTML (Zostawiamy pusty tag 'species-description-container'!)
            let html = `
            <hr class="modal-separator">
            <div id="species-description-container"></div>
            <hr class="modal-separator">
            <div class="modal-columns">

              <div class="column-left">
                <table style="width:100%; margin-bottom: 15px;">
              <caption><b>Siedlisko naturalne</b></caption>
              <tr>
                <th>Kontynenty</th>
                <th>Regiony</th>
                <th>Biomy</th>
              </tr>
              <tr>
                <td style="text-align: center;">${animal.habitat?.Kontynenty?.join(", ") || "-"}</td>
                <td style="text-align: center;">${animal.habitat?.Regiony?.join(", ") || "-"}</td>
            <td style="text-align: center;">
              ${(() => {
                            const biomy = animal.habitat?.Biomy || [];
                            if (biomy.length === 0) return "-";

                            let rows = [];

                            if (biomy.length <= 3) {
                                rows.push(biomy);
                            } else if (biomy.length === 4) {
                                rows.push(biomy.slice(0, 2));
                                rows.push(biomy.slice(2, 4));
                            } else if (biomy.length === 5) {
                                rows.push(biomy.slice(0, 3));
                                rows.push(biomy.slice(3, 5));
                            } else {
                                rows.push(biomy);
                            }

                            return rows.map(row => `
                    <div style="display:flex; justify-content:center; gap:5px; margin-bottom:3px;">
                      ${row.map(b => `<img style="width:30px; height:30px;" src="${b.icon}" alt="${b.name}">`).join("")}
                    </div>
                  `).join("");
                        })()
                        }
            </td>

              </tr>
            </table>
            <div class="species-map map">
                <svg id="map-connector-layer"></svg>

                <div id="world-map-full" class="map-full"></div>
                <div id="world-map-zoom" class="map-zoom"></div>
            </div>  </div>

              <div class="column-right">
                <table style="width:95%; margin-bottom: 15px; font-size:0.85rem">
                  <caption><b>Zachowania społeczne</b></caption>
                  ${(animal.social || []).map(s => {
                            return Object.entries(s).map(([key, val]) =>
                                `<tr><th style="text-align:left;">${key}</th><td>${val}</td></tr>`
                            ).join("");
                        }).join("")}
                </table>

            <table class="species-numbers desktop-only" style="width:95%; margin-bottom:15px; font-size:0.85rem; text-align:center;">
              <caption><b>Gatunek w liczbach</b></caption>
              <tr>
                ${["Wielkość", "Waga", "Długość życia"].map(stat => {
                            const icon = statIcons[stat];
                            const maleVal = animal.speciesNumbers?.[stat]?.samiec || "-";
                            const femaleVal = animal.speciesNumbers?.[stat]?.samica || "-";

                            return `
                        <th>
                            ${icon ? `<img src="${icon}" class="stat-icon">` : ""}
                            <span class="stat-label">${stat}</span>
                        </th>
                        <td style="vertical-align:top;">
                            <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793723/samiec_a3alpa.webp"
                                 style="width:24px; vertical-align:middle;" alt="samiec"> ${maleVal}<br>
                            <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793717/samica_erwgov.webp"
                                 style="width:24px; vertical-align:middle;" alt="samica"> ${femaleVal}
                        </td>
                    `;
                        }).join("")}
            </tr>

            </table>

            <table class="species-numbers mobile-only" style="width:95%; margin-bottom:15px; font-size:0.85rem; text-align:center;">
              <caption><b>Gatunek w liczbach</b></caption>
              ${["Wielkość", "Waga", "Długość życia"].map(stat => {
                            const icon = statIcons[stat];
                            const maleVal = animal.speciesNumbers?.[stat]?.samiec || "-";
                            const femaleVal = animal.speciesNumbers?.[stat]?.samica || "-";
                            const horizontal = (stat === "Waga" || stat === "Długość życia");

                            return `
                  <tr>
                    <th>
                        ${icon ? `<img src="${icon}" class="stat-icon">` : ""}
                        <span class="stat-label">${stat}</span>
                    </th>
                   <td style="${horizontal ? 'text-align:center; vertical-align:middle;' : 'text-align:center; vertical-align:middle;'}">
              <div style="display:inline-flex; align-items:center; justify-content:center; gap:4px; margin-right:5px;">
                <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793723/samiec_a3alpa.webp"
                     style="width:24px;" alt="samiec">
                <span class="glossary-text"> ${maleVal}</span>
              </div>
              <div style="display:inline-flex; align-items:center; justify-content:center; gap:4px;">
                <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793717/samica_erwgov.webp"
                     style="width:24px;" alt="samica">
                <span class="glossary-text"> ${femaleVal}</span>
              </div>
            </td>

                  </tr>`;
                        }).join("")}
            </table>


                <table style="width:95%; margin-bottom: 15px; font-size:0.85rem; table-layout: auto;">
                  <caption><b>Cykl życiowy</b></caption>
                  ${(animal.lifeCycle || []).map(l => {
                            return Object.entries(l).map(([key, val]) =>
                                `<tr>
                                    <th style="text-align:left; min-width: 130px; word-break: keep-all; overflow-wrap: break-word; padding-right: 8px; vertical-align: top;">${key}</th>
                                    <td style="font-size: 0.8rem; text-align: right; word-break: keep-all; overflow-wrap: break-word; vertical-align: top;">${val}</td>
                                 </tr>`
                            ).join("");
                        }).join("")}
                </table>

              </div>

            </div>
            <hr class="modal-separator">

            <div class="species-info" style="display:flex; gap:20px; margin-top:15px;">
              <div style="flex:1;">
                <h4 style="margin-bottom:5px;">Potrzeby społeczne</h4>
                <p>${animal.needs || "Brak dodatkowych informacji"}</p>
              </div>

        

              <div style="flex:1;">
                <h4 style="margin-bottom:5px;">Rozmnażanie</h4>
                <p>${animal.reproduction || "Brak dodatkowych informacji"}</p>
              </div>
            </div>
            <hr class="modal-separator">

            <h4 style="margin-bottom:5px;">Ciekawostki</h4>
            <div class="species-curiosities" style="display:flex; gap:20px; align-items:flex-start; margin-top:15px;">
              <ul style="flex:1; margin:0; padding-left:20px;">
                ${(animal.curiosities || []).map(item => `<li><span>${item}</span></li>`).join("") || `<li>Brak dodatkowych informacji</li>`}
              </ul>

              <div style="flex-shrink:0;">
                  <img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769793794/ciekawostka_qfhtbt.webp" alt="Ciekawostka" style="max-width:150px; height:auto; display:block;">
                </div>
            </div>
            `;

            // --- 4. WSTRZYKNIĘCIE STRUKTURY DO MODALA ---
            modalInfo.innerHTML = html;

            // --- 5. 🔥 KLUCZOWE: DOPIERO TERAZ URUCHAMIAMY AKTUALIZACJĘ TEKSTU I KONTROLEK ---
            // Gdy element `#species-description-container` fizycznie istnieje już w DOM, funkcje zadziałają natychmiast!
            updateTextContent();
            updateImageControlsUI();

            // --- 6. MAPA I FORMATOWANIE TEKSTU ---
            function getRenderRegions(animal) {
                const rawRegions = animal.habitat?.Regiony || [];
                const result = [];

                rawRegions.forEach(raw => {
                    if (raw.includes("Alaska")) { result.push("Alaska"); return; }
                    if (raw.includes("Svalbard")) { result.push("Svalbard"); return; }
                    if (raw.includes("Syberia")) { result.push("Syberia"); return; }
                    if (raw.includes("Borneo")) { result.push("Borneo"); return; }

                    const cleaned = raw.replace(/\s*\(.*?\)/g, "").trim();
                    const override = REGION_OVERRIDES[cleaned]?.[animal.name];

                    if (override && override.length) {
                        result.push(...override);
                    } else {
                        result.push(cleaned);
                    }
                });

                return result;
            }

            renderWorldMap(
                getRenderRegions(animal),
                animal.habitat?.mapa || {}
            );

            modalInfo.querySelectorAll('p').forEach(p => {
                const htmlWithMarkers = p.innerHTML.replace(/<br\s*\/?>/gi, "%%%BR%%%");
                const fragments = htmlWithMarkers.split("%%%BR%%%");

                p.innerHTML = "";
                fragments.forEach((frag, idx) => {
                    const span = document.createElement("span");
                    span.innerHTML = frag;
                    p.appendChild(span);
                    if (idx < fragments.length - 1) {
                        p.appendChild(document.createElement("br"));
                    }
                });
            });

            modalInfo.querySelectorAll('p, th, td, span, div').forEach(el => enrichTextWithGlossary(el));
            addNonBreakingSpaces(modalInfo);

            modal.setAttribute("data-game-era", currentGameEra.toLowerCase());

            modal.classList.add("show");
            modal.classList.remove("hidden");
        // 🌟 EFEKT WYŁANIANIA (BLUR -> OSTRY TEKST)
            setTimeout(() => {
                elementsToAnimate.forEach(el => {
                    el.style.transition = "opacity 0.28s ease, filter 0.28s ease, transform 0.28s ease";
                    el.style.opacity = "1";
                    el.style.filter = "blur(0px)";
                    el.style.transform = "translateY(0px)";
                });
            }, 40);
        };

    /* ===============================
       URUCHOMIENIE
    ================================ */
    initZoopedia();

})(window.ZOOPEDIA);

/* ===============================
   FILTRY
================================ */

function initFilters() {
    const zoopedia = document.getElementById("zoopedia");
    const items = document.querySelectorAll(".filter-item");
    const buttons = document.querySelectorAll("#filter-panel button[data-filter]");
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.getElementById("zoopedia-search");
    const noResultsEl = document.getElementById("zoopedia-no-results");
    const filterPanel = document.getElementById("filter-panel");

    buttons.forEach(btn => {
        btn.onclick = () => {
            if (btn.classList.contains("single")) {
                const group = btn.closest(".filter-buttons").querySelectorAll(".single");
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                } else {
                    group.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                }
            } else {
                btn.classList.toggle("active");
            }
            updateFilter(items, zoopedia);
            updateContentButtons();
        };
    });

    resetBtn.onclick = () => {
        buttons.forEach(b => b.classList.remove("active"));
        if (searchInput) searchInput.value = "";       // ⬅️ czyścimy wyszukiwanie
        if (noResultsEl) noResultsEl.classList.remove("show"); // ⬅️ ukrywamy "no results"
        updateFilter(items, zoopedia);
        ZOOPEDIA.render(); // reset całej listy
    };

    // 🔹 Kliknięcie poza panel – zamykanie
    document.addEventListener("click", (e) => {
        if (!filterPanel.contains(e.target) && e.target.id !== "filter-btn") {
            filterPanel.classList.remove("open");
        }
    });

    updateFilter(items, zoopedia);
}
// Funkcja sprawdzająca, które rzędy wjechały na ekran
function checkRowsInView(parent) {
    if (!parent) return;

    const visibleItems = parent.querySelectorAll(".filter-item.visible:not(.in-view)");
    const windowHeight = window.innerHeight;

    visibleItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        // Jeśli kafelek pojawił się na ekranie (lub jest tuż pod nim)
        if (rect.top <= windowHeight - 20 && rect.bottom >= 0) {
            item.classList.add("in-view");
        }
    });
}

function updateFilter(items, parent) {

    const activeButtons = [...document.querySelectorAll("#filter-panel .active")];
    const activeFilters = activeButtons.map(b => b.dataset.filter);

    const version = AppState.get();
    let count = 0;

    const contentFilter = activeFilters.find(f =>
        ["podstawa", "dlc", "mody", "modypz2"].includes(f)
    );

    const classFilters = activeFilters.filter(f =>
        !["podstawa", "dlc", "mody", "modypz2"].includes(f)
    );

    const visible = [];

    items.forEach(item => {

        const available = item.dataset.availability?.split(",").includes(version);
        const classesMatch = classFilters.every(f => item.classList.contains(f));

        let contentMatch = true;
        if (contentFilter) {
            const contentByVersion = item.dataset.contentByVersion
                ? JSON.parse(item.dataset.contentByVersion)
                : null;
            const content = contentByVersion?.[version];
            contentMatch = content === contentFilter;
        }

        let show = available && classesMatch && contentMatch;

        // UKRYWANIE DUPLIKATÓW LWÓW
        const animalName = item.querySelector(".podpis")?.textContent?.trim();
        if (version === "pz2" && animalName === "Lew zachodnioafrykański") show = false; 
        if ((version === "pz1pc" || version === "pz1console") && animalName === "Lew") show = false;

        // RESETOWANIE KLAS
        item.classList.remove("visible", "in-view");
        item.style.animationDelay = "0ms";

        if (show) {
            visible.push(item);
            count++;
        }
    });

    // --- Sortowanie
    visible.sort((a, b) =>
        a.querySelector(".podpis").textContent
            .localeCompare(b.querySelector(".podpis").textContent, "pl")
    );

    // Wstawianie przefiltrowanych kafelków do DOM
    parent.innerHTML = "";
    visible.forEach(i => parent.appendChild(i));

    // 🌟 RZĘDOWE PRZYPISANIE DELAY ORAZ AKTYWACJA
    requestAnimationFrame(() => {
        if (visible.length === 0) return;

        const gridColumns = window.getComputedStyle(parent).getPropertyValue("grid-template-columns");
        const colsCount = gridColumns.split(" ").length || 1;

        visible.forEach((item, index) => {
            const colIndex = index % colsCount;
            item.style.animationDelay = `${colIndex * 40}ms`; // Płynne wejście w rzędzie od lewej
            item.classList.add("visible");
        });

        // Od razu odpal sprawdzanie dla pierwszych widocznych rzędów na samej górze
        checkRowsInView(parent);
    });

    // --- Licznik
    const counterEl = document.getElementById("counter");
    if (counterEl) counterEl.textContent = `Ilość zwierząt: ${count}`;

    // --- Komunikat brak wyników
    const noResultsEl = document.getElementById("zoopedia-no-results");
    if (noResultsEl) {
        noResultsEl.classList.toggle("show", count === 0);
    }

    // Podpięcie scrolla (pod okno i pod sam kontener)
    window.onscroll = () => checkRowsInView(parent);
    parent.onscroll = () => checkRowsInView(parent);
}

/* ===============================
   CONTENT BUTTONS
================================ */

function updateContentButtons() {
    const version = AppState.get();

    // Pokazywanie / ukrywanie filtra "Akwarium" tylko dla pz2
    const akwariumBtn = document.querySelector(".pz2-only");
    if (akwariumBtn) {
        if (version === "pz2") {
            akwariumBtn.style.display = ""; // przywraca domyślny widok (blokowy/flex)
        } else {
            akwariumBtn.style.display = "none"; // ukrywa całkowicie dla pz1
            akwariumBtn.classList.remove("active"); // czyści filtr, jeśli był aktywny
        }
    }
    
    // 1️⃣ Łapiemy przyciski bez względu na ich aktualny stan data-filter
    const modBtn = document.querySelector("#filter-panel button[data-filter='mody'], #filter-panel button[data-filter='pz2mod']");
    const remasterBtn = document.querySelector("#filter-panel button[data-filter='remaster'], #filter-panel button[data-filter='remasterpz2']");

    // 2️⃣ Dynamiczna zmiana nazw i filtrów w locie
    if (version === "pz2") {
        if (modBtn) {
            modBtn.dataset.filter = "modypz2";
            const img = modBtn.querySelector("img");
            modBtn.innerHTML = ""; // czyścimy stary tekst
            if (img) modBtn.appendChild(img);
            modBtn.appendChild(document.createElement("br"));
            modBtn.appendChild(document.createTextNode("Mody")); // Nowa nazwa
        }
        if (remasterBtn) {
            remasterBtn.dataset.filter = "remasterpz2";
            const img = remasterBtn.querySelector("img");
            remasterBtn.innerHTML = "";
            if (img) remasterBtn.appendChild(img);
            remasterBtn.appendChild(document.createElement("br"));
            remasterBtn.appendChild(document.createTextNode("Remaster")); // Nowa nazwa
        }
    } else {
        // Powrót do standardowych filtrów dla Planet Zoo 1 (PC / Konsola)
        if (modBtn) {
            modBtn.dataset.filter = "mody";
            const img = modBtn.querySelector("img");
            modBtn.innerHTML = "";
            if (img) modBtn.appendChild(img);
            modBtn.appendChild(document.createElement("br"));
            modBtn.appendChild(document.createTextNode("Mody"));
        }
        if (remasterBtn) {
            remasterBtn.dataset.filter = "remaster";
            const img = remasterBtn.querySelector("img");
            remasterBtn.innerHTML = "";
            if (img) remasterBtn.appendChild(img);
            remasterBtn.appendChild(document.createElement("br"));
            remasterBtn.appendChild(document.createTextNode("Remaster"));
        }
    }

   // 3️⃣ Pobieramy zaktualizowaną listę (wszystkie możliwe warianty filtrów)
    const contentButtons = document.querySelectorAll(
        "#filter-panel button[data-filter='mody'], #filter-panel button[data-filter='modypz2'], #filter-panel button[data-filter='remaster'], #filter-panel button[data-filter='remasterpz2']"
    );

    // 4️⃣ Blokada dla wersji konsolowej (wyłącza i mody, i remastery)
    contentButtons.forEach(btn => {
        const disabled = version === "pz1console";

        btn.disabled = disabled;
        btn.style.opacity = disabled ? 0.5 : 1;
        btn.style.cursor = disabled ? "not-allowed" : "pointer";

        // Jeśli jesteśmy na konsoli, zdejmujemy z przycisku status "active", żeby filtr nie wisiał w tle
        if (disabled) {
            btn.classList.remove("active");
        }
    });
}

// WYSZUKIWANIE
(function (Z) {

    const searchInput = document.getElementById("zoopedia-search");
    const noResultsEl = document.getElementById("zoopedia-no-results");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase().trim();

            if (!q) {
                Z.render(); // reset listy
                if (noResultsEl) noResultsEl.classList.remove("show");
                return;
            }

            const filtered = Z.data.filter(animal => {
                if (animal.name.toLowerCase().includes(q)) return true;
                if (animal.aliases && animal.aliases.some(a => a.toLowerCase().includes(q))) return true;
                if (animal.latin && animal.latin.toLowerCase().includes(q)) return true;
                return false;
            });

            if (filtered.length === 0) {
                if (noResultsEl) noResultsEl.classList.add("show");
            } else {
                if (noResultsEl) noResultsEl.classList.remove("show");
            }

            Z.render(filtered);
        });
    }

    // Z.render przyjmuje opcjonalny parametr filteredData
    const originalRender = Z.render;
    Z.render = function (filteredData) {
        const dataToRender = filteredData || Z.data;
        const zoopedia = document.getElementById("zoopedia");
        if (!zoopedia) return;

        zoopedia.innerHTML = "";

        const currentVersion = AppState.get();

        dataToRender.forEach(animal => {
            const div = document.createElement("div");
            div.className = "filter-item " + (animal.classes ? animal.classes.join(" ") : "");
            div.dataset.availability = animal.availability.join(",");
            div.dataset.image = animal.image;
            div.dataset.remaster = animal.remasterImage || "";
            if (animal.contentByVersion) div.dataset.contentByVersion = JSON.stringify(animal.contentByVersion);

            // ⬇️ TUTAJ RÓWNIEŻ PODMIENIASZ LOGIKĘ OBRAZKA ⬇️
            let imgSrc = animal.image;
            if (currentVersion === "pz2") {
                imgSrc = animal["pz2image-remater"] || animal.pz2image || animal.image;
            } else if (currentVersion !== "pz1console" && animal.remasterImage) {
                imgSrc = animal.remasterImage;
            }

            div.innerHTML = `
        <a href="#">
          <img loading="lazy" src="${imgSrc}" alt="${animal.name}">
          <span class="podpis">${animal.name}</span>
        </a>
      `;

            div.onclick = e => {
                e.preventDefault();
                if (animal.availability.includes(AppState.get())) {
                    Z.showSpecies(animal);
                }
            };

            zoopedia.appendChild(div);
        });

        initFilters();
        updateContentButtons();
    };

})(window.ZOOPEDIA);

/* ===============================
   MINIATURKI (SAFE)
================================ */

window.updateThumbnail = function (el) {
    // placeholder SPA
};