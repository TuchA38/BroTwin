// =====================================
// DLC – SPA SAFE MODULE
// =====================================

window.DLC = window.DLC || {};

(function(DLC) {

        if (DLC.initialized) {
            DLC.render();
            return;
        }

        DLC.initialized = true;
        DLC.data = [];
        DLC.loading = false;

        // ---------------------------------
        // HELPER: SPRAWDZANIE WIDOCZNOŚCI KAFELKÓW NA EKRANIE
        // ---------------------------------
        function checkRowsInView(parent) {
            if (!parent) return;

            const visibleItems = parent.querySelectorAll(".filter-item.visible:not(.in-view)");
            const windowHeight = window.innerHeight;

            visibleItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.top <= windowHeight - 20 && rect.bottom >= 0) {
                    item.classList.add("in-view");
                }
            });
        }

        // ---------------------------------
        // HELPER: WIKI LINK PARSER [[id|label]]
        // ---------------------------------
        function parseDlcLinks(text) {
            if (!text) return "";
            return text.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, dlcId, dlcName) => {
                return `<a href="#${dlcId}" class="dlc-link" data-dlc-id="${dlcId}">${dlcName}</a>`;
            });
        }

        function bindDlcLinks(container) {
            if (!container) return;
            container.querySelectorAll(".dlc-link").forEach(link => {
                link.onclick = e => {
                    e.preventDefault();
                    const targetId = link.dataset.dlcId;
                    const targetDlc = DLC.data.find(d => d.id === targetId);
                    if (targetDlc) {
                        const modal = document.getElementById("dlc-modal");

                        if (modal && modal.classList.contains("show")) {
                            const currentElements = modal.querySelectorAll(
                                "#dlc-trailer, #dlc-gallery, #dlc-fullDescription, #dlc-description, #dlc-name, #dlc-meta, #dlc-link"
                            );

                            currentElements.forEach(el => {
                                el.style.transition = "opacity 0.15s ease, filter 0.15s ease, transform 0.15s ease";
                                el.style.opacity = "0";
                                el.style.filter = "blur(8px)";
                                el.style.transform = "translateY(-8px)";
                            });

                            setTimeout(() => {
                                openModal(targetDlc);
                            }, 150);
                        } else {
                            openModal(targetDlc);
                        }
                    } else {
                        console.warn("Nie znaleziono DLC o ID:", targetId);
                    }
                };
            });
        }

        // ---------------------------------
        // LOADER – fetch tylko raz
        // ---------------------------------
        function loadDLC() {
            if (DLC.data.length) {
                return Promise.resolve(DLC.data);
            }

            if (DLC.loading) {
                return DLC.loading;
            }

            DLC.loading = fetch("data/dlc.json")
                .then(r => r.json())
                .then(data => {
                    DLC.data = data;
                    document.dispatchEvent(new CustomEvent("dlcReady"));
                    return data;
                })
                .catch(err => {
                    console.error("Błąd ładowania DLC:", err);
                    DLC.loading = false;
                });

            return DLC.loading;
        }

        // ---------------------------------
        // INIT
        // ---------------------------------
        function initDLC() {
            const grid = document.getElementById("dlc-grid");
            const modal = document.getElementById("dlc-modal");
            const closeBtn = document.getElementById("close-dlc");

            if (!grid || !modal || !closeBtn) {
                requestAnimationFrame(initDLC);
                return;
            }

            DLC.grid = grid;
            DLC.modal = modal;

            loadDLC().then(renderDLC);

            if (!DLC.versionListenerAttached) {
                document.addEventListener("versionChanged", renderDLC);
                DLC.versionListenerAttached = true;
            }

            closeBtn.onclick = closeModal;

            modal.addEventListener("click", e => {
                if (e.target === modal) closeModal();
            });
        }

        // ---------------------------------
        // RENDER GRID (Z ANIMACJĄ RZĘDÓW I SCROLLA)
        // ---------------------------------
        function renderDLC() {
            const grid = document.getElementById("dlc-grid");
            if (!grid) return;

            const version = AppState.get();
            grid.innerHTML = "";

            const filteredDLC = DLC.data.filter(d => d.version === version);

            filteredDLC.forEach(dlc => {
                const item = document.createElement("div");
                // 🌟 Zaczynamy tylko od klasy .filter-item (opacity: 0 w CSS)
                item.className = "filter-item";
                item.innerHTML = `
                    <a href="#">
                        <img loading="lazy" src="${dlc.image}">
                        <span class="podpis">${dlc.name}</span>
                    </a>
                `;
                item.onclick = e => {
                    e.preventDefault();
                    openModal(dlc);
                };
                grid.appendChild(item);
            });

            // 🌟 Obliczanie kolumn, przypisanie opóźnień w rzędzie oraz nasłuchiwanie scrolla
            requestAnimationFrame(() => {
                const items = grid.querySelectorAll(".filter-item");
                if (items.length === 0) return;

                const gridColumns = window.getComputedStyle(grid).getPropertyValue("grid-template-columns");
                const colsCount = gridColumns.split(" ").length || 1;

                items.forEach((item, index) => {
                    const colIndex = index % colsCount;
                    item.style.animationDelay = `${colIndex * 40}ms`; // Efekt fali wewnątrz jednego rzędu
                    item.classList.add("visible");
                });

                // Sprawdzamy pierwsze rzędy widoczne od razu na samej górze
                checkRowsInView(grid);
            });

            // Podpięcie scrolla pod główne okno i pod samą siatkę dlc-grid
            window.onscroll = () => checkRowsInView(grid);
            grid.onscroll = () => checkRowsInView(grid);
        }

        function openModal(dlc) {
            const modal = document.getElementById("dlc-modal");
            const trailerDiv = document.getElementById("dlc-trailer");
            const gallery = document.getElementById("dlc-gallery");
            const fullDescDiv = document.getElementById("dlc-fullDescription");
            const bannerImgSrc = dlc.headerImage;

            if (!modal) {
                console.warn("Modal DLC nie istnieje w DOM");
                return;
            }

            modal.scrollTop = 0;
            const modalBody = modal.querySelector(".dlc-modal-body, .modal-content, .dlc-modal-content");
            if (modalBody) {
                modalBody.scrollTop = 0;
            }

            modal.className = modal.className.replace(/\bdlc-theme-\S+/g, '').trim();

            if (dlc.id) {
                modal.classList.add(`dlc-theme-${dlc.id}`);
            }

            if (dlc.trailer && dlc.trailer.url) {
                trailerDiv.innerHTML = `
                <figure style="width:90%; height:100%; margin-bottom:0%;" class="dlc-video-container">
                    <iframe style="width:98%;" src="${dlc.trailer.url}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                    ${dlc.trailer.caption ? `<figcaption>${dlc.trailer.caption}</figcaption>` : ''}
                </figure>
            `;
            } else if (bannerImgSrc) {
            trailerDiv.innerHTML = `
                <figure style="width:90%;" class="dlc-video-container">
                    <img src="${bannerImgSrc}" alt="${dlc.name}">
                </figure>
            `;
            const mainImg = trailerDiv.querySelector("img");
            if (mainImg) {
                mainImg.onclick = () => {
                    if (typeof window.openGallery === "function") {
                        window.currentGallery = [bannerImgSrc];
                        window.openGallery(0, window.currentGallery);
                    }
                };
            }
            } else if (dlc.image) {
            trailerDiv.innerHTML = `
                <figure style="width:90%;" class="dlc-video-container">
                    <img src="${dlc.image}" alt="${dlc.name}">
                </figure>
            `;
            const mainImg = trailerDiv.querySelector("img");
            if (mainImg) {
                mainImg.onclick = () => {
                    if (typeof window.openGallery === "function") {
                        window.currentGallery = [dlc.image];
                        window.openGallery(0, window.currentGallery);
                    }
                };
            }
            } else {
            trailerDiv.innerHTML = "";
            }

            document.getElementById("dlc-name").textContent = dlc.name;

            const metaEl = document.getElementById("dlc-meta");
            const releaseDateText = dlc.releaseDate || "-";

            metaEl.innerHTML = `<b>Data wydania:</b> <span id="dlc-release-date-btn">${releaseDateText}</span><br><b>Cena:</b> ${dlc.price || "-"}`;

            function parseReleaseDate(str) {
            if (!str || str === "-") return null;

            const monthsMap = {
                "stycznia": 1, "lutego": 2, "marca": 3, "kwietnia": 4,
                "maja": 5, "czerwca": 6, "lipca": 7, "sierpnia": 8,
                "września": 9, "października": 10, "listopada": 11, "grudnia": 12
            };

            const textMatch = str.trim().toLowerCase().match(/^(\d{1,2})\s+([a-ząśężźćńół]+)\s+(\d{4})$/i);
            if (textMatch) {
                const day = parseInt(textMatch[1], 10);
                const monthName = textMatch[2];
                const year = parseInt(textMatch[3], 10);
                const month = monthsMap[monthName];
                if (month) return { year, month, day };
            }

            const numMatch = str.trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
            if (numMatch) {
                return {
                    day: parseInt(numMatch[1], 10),
                    month: parseInt(numMatch[2], 10),
                    year: parseInt(numMatch[3], 10)
                };
            }

            return null;
            }

            const dateBtn = document.getElementById("dlc-release-date-btn");
            if (dateBtn && dlc.releaseDate) {
            dateBtn.onclick = () => {
                const parsed = parseReleaseDate(dlc.releaseDate);
                if (parsed && window.CALENDAR && typeof window.CALENDAR.openDate === "function") {
                    window.CALENDAR.openDate(parsed.year, parsed.month, parsed.day);
                }
            };
            }

            const linkContainer = document.getElementById("dlc-link");
            linkContainer.innerHTML = "";
            linkContainer.style.display = "flex";
            linkContainer.style.flexDirection = "column";
            linkContainer.style.alignItems = "center";
            linkContainer.style.gap = "12px";
            linkContainer.style.marginTop = "6px";

            if (dlc.version === "pz1pc" && dlc.steamLink) {
                const a = document.createElement("a");
                a.href = dlc.steamLink;
                a.target = "_blank";

                const img = document.createElement("img");
                img.src = "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865070/Steam_logo_rjt6ff.webp";
                img.style.height = "70px";
                img.style.objectFit = "contain";
                img.style.cursor = "pointer";

                a.appendChild(img);
                linkContainer.appendChild(a);

            } else if (dlc.version === "pz1console") {
                const consoleLinks = [
                    {
                        icon: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865068/Playstation_xi9r3l.webp",
                        link: dlc.psLink || "#"
                    },
                    {
                        icon: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865071/Xbox-logo_i2mz74.webp",
                        link: dlc.xboxLink || "#"
                    }
                ];

                const row = document.createElement("div");
                row.style.display = "flex";
                row.style.gap = "12px";

                consoleLinks.forEach(p => {
                    const a = document.createElement("a");
                    a.href = p.link;
                    a.target = "_blank";

                    const img = document.createElement("img");
                    img.src = p.icon;
                    img.style.height = "88px";
                    img.style.objectFit = "contain";
                    img.style.cursor = "pointer";

                    a.appendChild(img);
                    row.appendChild(a);
                });

                linkContainer.appendChild(row);

            } else if (dlc.version === "pz2") {
                if (dlc.steamLink) {
                    const a = document.createElement("a");
                    a.href = dlc.steamLink;
                    a.target = "_blank";

                    const img = document.createElement("img");
                    img.src = "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865070/Steam_logo_rjt6ff.webp";
                    img.style.height = "70px";
                    img.style.objectFit = "contain";
                    img.style.cursor = "pointer";

                    a.appendChild(img);
                    linkContainer.appendChild(a);
                }

                const row = document.createElement("div");
                row.style.display = "flex";
                row.style.gap = "12px";
                row.style.marginTop = "6px";

                [
                    { icon: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865068/Playstation_xi9r3l.webp", link: dlc.psLink || "#" },
                    { icon: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769865071/Xbox-logo_i2mz74.webp", link: dlc.xboxLink || "#" }
                ].forEach(p => {
                    const a = document.createElement("a");
                    a.href = p.link;
                    a.target = "_blank";

                    const img = document.createElement("img");
                    img.src = p.icon;
                    img.style.height = "88px";
                    img.style.objectFit = "contain";
                    img.style.cursor = "pointer";

                    a.appendChild(img);
                    row.appendChild(a);
                });

                linkContainer.appendChild(row);
            }

            const descEl = document.getElementById("dlc-description");
            descEl.innerHTML = parseDlcLinks(dlc.description || "");
            bindDlcLinks(descEl);

            enrichTextWithGlossary(descEl);

            descEl.querySelectorAll("p, th, td, span, div").forEach(el => {
                enrichTextWithGlossary(el);
            });

            addNonBreakingSpaces(descEl);

            const galleryImages = dlc.gallery || dlc.gallery1 || [];
            gallery.innerHTML = "";
            window.currentGallery = galleryImages.slice();

            const galleryHr = gallery.nextElementSibling;

            if (galleryImages.length > 0) {
                gallery.style.display = ""; 
                if (galleryHr && galleryHr.classList.contains("modal-separator")) {
                    galleryHr.style.display = "";
                }

                galleryImages.forEach((src, index) => {
                    const img = document.createElement("img");
                    img.src = src;
                    img.className = "dlc-gallery-img";

                    img.style.cursor = "pointer";
                    img.style.transition = "transform 0.2s";
                    img.onmouseover = () => img.style.transform = "scale(1.05)";
                    img.onmouseout = () => img.style.transform = "scale(1)";

                    img.onclick = () => {
                        if (typeof window.openGallery === "function") {
                            window.currentGallery = galleryImages;
                            window.openGallery(index, window.currentGallery);
                        }
                    };

                    gallery.appendChild(img);
                });
            } else {
                gallery.style.display = "none";
                if (galleryHr && galleryHr.classList.contains("modal-separator")) {
                    galleryHr.style.display = "none";
                }
            }

            fullDescDiv.innerHTML = "";

            function renderSection(name, price, trailer, headerImage, descText, showSeparator) {
                const sectionContainer = document.createElement("div");
                sectionContainer.className = "dlc-variant-section";

                if (showSeparator) {
                    const hr = document.createElement("hr");
                    hr.className = "modal-separator";
                    sectionContainer.appendChild(hr);
                }

                if (name || price || (trailer && trailer.url) || headerImage) {
                    const header = document.createElement("div");
                    header.className = "dlc-variant-header";
                    header.id = "dlc-header";

                    if (trailer && trailer.url) {
                        const trailerDiv = document.createElement("div");
                        trailerDiv.id = "dlc-trailer";
                        trailerDiv.innerHTML = `
                            <figure style="width:90%; height:100%; margin-bottom:0%;" class="dlc-video-container">
                                <iframe style="width:98%;" src="${trailer.url}" 
                                        frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                                ${trailer.caption ? `<figcaption style="text-align:center;"><i>${trailer.caption}</i></figcaption>` : ''}
                            </figure>
                        `;
                        header.appendChild(trailerDiv);
                    } 
                    else if (headerImage) {
                        const imageDiv = document.createElement("div");
                        imageDiv.id = "dlc-trailer";
                        imageDiv.innerHTML = `
                            <figure style="width:90%;" class="dlc-video-container">
                                <img src="${headerImage}" alt="${name || 'Wariant DLC'}">
                            </figure>
                        `;
                        const mainImg = imageDiv.querySelector("img");
                        if (mainImg) {
                            mainImg.onclick = () => {
                                if (typeof window.openGallery === "function") {
                                    window.currentGallery = [headerImage];
                                    window.openGallery(0, window.currentGallery);
                                }
                            };
                        }
                        header.appendChild(imageDiv);
                    }

                    if (name || price) {
                        const infoDiv = document.createElement("div");
                        infoDiv.id = "dlc-info";
                        infoDiv.innerHTML = `
                            ${name ? `<h2>${name}</h2>` : ''}
                            ${price ? `<p><b>Cena wariantu:</b> ${price}</p>` : ''}
                        `;
                        header.appendChild(infoDiv);
                    }

                    sectionContainer.appendChild(header);
                }

                if (descText) {
                    const descDiv = document.createElement("div");
                    let html = parseDlcLinks(descText);

                    (dlc.species || []).forEach(speciesName => {
                        html = html.replace(
                            new RegExp(`{{${speciesName}}}`, "g"),
                            `<a href="#" class="species-link" data-species="${speciesName}">${speciesName}</a>`
                        );
                    });

                    if (dlc.gifs && Array.isArray(dlc.gifs)) {
                        dlc.gifs.forEach((gifUrl, index) => {
                            const placeholder = `[gif${index + 1}]`;

                            if (html.includes(placeholder)) {
                                const sectionStartHTML = `
                                    <div class="description-section" style="clear: both; margin-top: 20px; margin-bottom: 25px; display: table; width: 100%;">
                                        <figure style="float: left; margin: 0 20px 10px 0; max-width: 320px; width: 100%;">
                                            <video autoplay loop muted playsinline class="description-gif-video" style="width: 100%; height: auto; border-radius: 8px; display: block;">
                                                <source src="${gifUrl}">
                                            </video>
                                        </figure>
                                `;

                                html = html.replace(placeholder, `</div>${sectionStartHTML}`);
                            }
                        });

                        if (dlc.gifs.some((_, i) => descText.includes(`[gif${i + 1}]`))) {
                            html += `</div>`;
                        }
                    }

                    descDiv.innerHTML = html;
                    bindDlcLinks(descDiv);
                    bindMusicLinks(descDiv, dlc);
bindScenarioLinks(descDiv, dlc);

                    sectionContainer.appendChild(descDiv);
                }

                fullDescDiv.appendChild(sectionContainer);
            }

            let sectionCount = 0;

            if (dlc.name2 || dlc.price2 || dlc.fullDescription || dlc.headerImage2 || (dlc.trailer2 && dlc.trailer2.url)) {
                renderSection(dlc.name2, dlc.price2, dlc.trailer2, dlc.headerImage2, dlc.fullDescription, false);
                sectionCount++;
            }

            if (dlc.name3 || dlc.price3 || dlc.fullDescription2 || dlc.headerImage3 || (dlc.trailer3 && dlc.trailer3.url)) {
                renderSection(dlc.name3, dlc.price3, dlc.trailer3, dlc.headerImage3, dlc.fullDescription2, sectionCount > 0);
            }

            function wrapTextKeepBR(node) {
                Array.from(node.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim() !== "") {
                        const span = document.createElement("span");
                        span.textContent = child.nodeValue;
                        child.parentNode.replaceChild(span, child);
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        if (child.tagName === "BR" || child.classList.contains("dlc-link") || child.classList.contains("species-link")) {
                            return;
                        }
                        wrapTextKeepBR(child);
                    }
                });
            }

            wrapTextKeepBR(fullDescDiv);

            enrichTextWithGlossary(fullDescDiv);
            fullDescDiv.querySelectorAll("p, th, td, span, div").forEach(el => {
                enrichTextWithGlossary(el);
            });
            addNonBreakingSpaces(fullDescDiv);

            fullDescDiv.querySelectorAll(".species-link").forEach(link => {
                link.onclick = e => {
                    e.preventDefault();
                    const speciesName = link.dataset.species;
                    if (!window.loadPage) return;

                    window.loadPage("zoopedia").then(() => {
                        const openSpeciesModal = () => {
                            if (!window.ZOOPEDIA || !window.ZOOPEDIA.data || !window.ZOOPEDIA.data.length) return;
                            const animal = window.ZOOPEDIA.data.find(a => a.name === speciesName);
                            if (animal && window.ZOOPEDIA.showSpecies) {
                                window.ZOOPEDIA.showSpecies(animal);
                            } else {
                                console.warn("Nie znaleziono gatunku:", speciesName);
                            }
                        };

                        if (window.ZOOPEDIA && window.ZOOPEDIA.data && window.ZOOPEDIA.data.length) {
                            openSpeciesModal();
                        } else {
                            const handler = () => {
                                document.removeEventListener("zoopediaReady", handler);
                                openSpeciesModal();
                            };
                            document.addEventListener("zoopediaReady", handler);
                        }
                    });
                };
            });

            if (dlc.gallery2 && dlc.gallery2.length) {
                const gallery2Container = document.createElement("div");
                gallery2Container.id = "dlc-gallery2";
                gallery2Container.className = "dlc-gallery";
                fullDescDiv.appendChild(gallery2Container);

                window.currentGallery2 = dlc.gallery2.slice();

                dlc.gallery2.forEach((src, index) => {
                    const img = document.createElement("img");
                    img.src = src;
                    img.className = "dlc-gallery-img";

                    img.style.cursor = "pointer";
                    img.style.transition = "transform 0.2s";
                    img.onmouseover = () => img.style.transform = "scale(1.05)";
                    img.onmouseout = () => img.style.transform = "scale(1)";

                    img.onclick = () => {
                        if (typeof window.openGallery === "function") {
                            window.currentGallery = dlc.gallery2;
                            window.openGallery(index, window.currentGallery);
                        }
                    };

                    gallery2Container.appendChild(img);
                });
            }

            const closeBtn = document.getElementById("close-dlc");
            if (closeBtn) {
                closeBtn.onclick = () => {
                    modal.classList.remove("show");
                    setTimeout(() => modal.classList.add("hidden"), 200);
                };
            }

            if (modal) {
                modal.addEventListener("click", e => {
                    if (e.target === modal) {
                        modal.classList.remove("show");
                        setTimeout(() => modal.classList.add("hidden"), 250);
                    }
                });
            }

            const animatedElements = [
                trailerDiv,
                gallery,
                fullDescDiv,
                descEl,
                document.getElementById("dlc-name"),
                document.getElementById("dlc-meta"),
                document.getElementById("dlc-link")
            ].filter(Boolean);

            animatedElements.forEach(el => {
                el.style.transition = "none";
                el.style.opacity = "0";
                el.style.filter = "blur(8px)";
                el.style.transform = "translateY(8px)";
            });

            modal.classList.remove("hidden");
            modal.classList.add("show");

            setTimeout(() => {
                animatedElements.forEach(el => {
                    el.style.transition = "opacity 0.28s ease, filter 0.28s ease, transform 0.28s ease";
                    el.style.opacity = "1";
                    el.style.filter = "blur(0px)";
                    el.style.transform = "translateY(0px)";
                });
            }, 40);
        }

        function bindMusicLinks(container, dlc) {
            if (!dlc.music || !dlc.music.length) return;

            const bolds = container.querySelectorAll("b");

            bolds.forEach(b => {
                const text = b.textContent.trim();

                if (!text.toLowerCase().startsWith("posłuchaj")) return;

                const label = text.replace(/^posłuchaj\s*/i, "").trim();

                const match = dlc.music.find(m =>
                    m.label.toLowerCase() === label.toLowerCase()
                );

                if (!match) return;

                b.onclick = e => {
                    e.preventDefault();

                    if (typeof window.openMusicAlbum !== "function") return;

                    window.openMusicAlbum(match.album);
                };
            });
        }

        function bindScenarioLinks(container, dlc) {
    if (!container) return;
    container.querySelectorAll(".scenario-link").forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const scenarioId = link.dataset.scenarioId || (dlc.scenarios && dlc.scenarios[0] ? (dlc.scenarios[0].id || dlc.scenarios[0]) : null);
            
            if (scenarioId) {
                closeModal();
                if (typeof window.loadPage === "function") {
                    window.loadPage("miejsca").then(() => {
                        const openPlace = () => {
                            if (window.PLACES && typeof window.PLACES.openById === "function") {
                                window.PLACES.openById(scenarioId);
                            }
                        };

                        // Wywołujemy od razu, a w razie braku gotowości dajemy opóźnienie
                        if (window.PLACES && typeof window.PLACES.openById === "function") {
                            openPlace();
                        } else {
                            setTimeout(openPlace, 150);
                        }
                    });
                }
            }
        };
    });
}
        function closeModal() {
            const modal = document.getElementById("dlc-modal");
            if (!modal) return;
            modal.classList.remove("show");

            setTimeout(() => {
                modal.classList.add("hidden");
                modal.className = modal.className.replace(/\bdlc-theme-\S+/g, '').trim();
            }, 200);
        }

        // ---------------------------------
        // PUBLIC API
        // ---------------------------------
        DLC.render = renderDLC;
        DLC.openModal = openModal;

        initDLC();

})(window.DLC);