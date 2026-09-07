// =====================================
// HISTORIA – SPA SAFE MODULE
// =====================================

window.HISTORIA = window.HISTORIA || {
    data: null,
    loading: false,
    loaded: false,
    activeLightBoxIndex: 0,
    activeGalleryImages: []
};

(function() {

        // ---------------------------------
        // 1️⃣ LOADER – CACHE SINGLE FETCH
        // ---------------------------------
        function loadHistoriaOnce() {
            if (window.HISTORIA.loaded) {
                return Promise.resolve(window.HISTORIA.data);
            }

            if (window.HISTORIA.loading) {
                return window.HISTORIA.loading;
            }

            window.HISTORIA.loading = fetch("data/historia.json")
                .then(res => {
                    if (!res.ok) throw new Error("Błąd sieci przy pobieraniu historia.json");
                    return res.json();
                })
                .then(data => {
                    window.HISTORIA.data = data;
                    window.HISTORIA.loaded = true;
                    return data;
                })
                .catch(err => {
                    console.error("Błąd ładowania danych historii:", err);
                    window.HISTORIA.loading = false;
                });

            return window.HISTORIA.loading;
        }

        // ---------------------------------
        // 2️⃣ LIGHTBOX CONTROLLER (FALLBACK)
        // ---------------------------------
        function setupLightbox() {
            const modal = document.getElementById("historia-lightbox");
            const closeBtn = document.getElementById("historia-lightbox-close");
            const prevBtn = document.getElementById("historia-lightbox-prev");
            const nextBtn = document.getElementById("historia-lightbox-next");

            if (!modal) return;

            function showImage(index) {
                const list = window.HISTORIA.activeGalleryImages;
                if (!list || list.length === 0) return;

                if (index < 0) index = list.length - 1;
                if (index >= list.length) index = 0;

                window.HISTORIA.activeLightBoxIndex = index;
                const item = list[index];

                const imgEl = document.getElementById("historia-lightbox-img");
                const captionEl = document.getElementById("historia-lightbox-caption");

                if (imgEl) imgEl.src = typeof item === "string" ? item : item.url;
                if (captionEl) {
                    captionEl.textContent = (typeof item === "object" && item.caption) ?
                        item.caption :
                        `Zdjęcie ${index + 1} z ${list.length}`;
                }

                modal.classList.remove("hidden");
            }

            window.openHistoriaLightbox = function(images, startIndex = 0) {
                window.HISTORIA.activeGalleryImages = images;
                showImage(startIndex);
            };

            function closeLightbox() {
                modal.classList.add("hidden");
            }

            if (closeBtn) closeBtn.onclick = closeLightbox;
            if (prevBtn) prevBtn.onclick = () => showImage(window.HISTORIA.activeLightBoxIndex - 1);
            if (nextBtn) nextBtn.onclick = () => showImage(window.HISTORIA.activeLightBoxIndex + 1);

            modal.onclick = (e) => {
                if (e.target === modal) closeLightbox();
            };

            document.removeEventListener("keydown", handleKeydown);
            document.addEventListener("keydown", handleKeydown);

            function handleKeydown(e) {
                if (modal.classList.contains("hidden")) return;
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowLeft") showImage(window.HISTORIA.activeLightBoxIndex - 1);
                if (e.key === "ArrowRight") showImage(window.HISTORIA.activeLightBoxIndex + 1);
            }
        }

        // ---------------------------------
        // 3️⃣ RENDER LOGIC
        // ---------------------------------
        function renderHistoria() {
            const root = document.querySelector(".historia-page");
            if (!root) return;

            const currentVersion = (window.AppState && typeof window.AppState.get === "function") ?
                window.AppState.get() :
                "pz1pc";

            loadHistoriaOnce().then(allVersions => {
                        if (!allVersions) return;

                        const versionData = allVersions[currentVersion] || allVersions["pz1pc"];
                        if (!versionData) return;

                        const titleEl = document.getElementById("historia-title");
                        const descEl = document.getElementById("historia-description");

                        if (titleEl) titleEl.textContent = versionData.pageTitle || "Historia Ogrodów Zoologicznych";
                        if (descEl) descEl.innerHTML = versionData.pageDescription || "";

                        const tabsContainer = document.getElementById("historia-tabs");
                        const zoosContainer = document.getElementById("historia-zoos-container");

                        if (!zoosContainer) return;

                        zoosContainer.innerHTML = "";
                        if (tabsContainer) tabsContainer.innerHTML = "";

                        const zoos = versionData.zoos || [];

                        if (zoos.length === 0) {
                            zoosContainer.innerHTML = "<p class='tekst text-center'>Brak historii dla wybranej wersji gry.</p>";
                            return;
                        }

                        if (tabsContainer) {
                            const allTab = document.createElement("button");
                            allTab.className = "historia-tab-btn active";
                            allTab.textContent = "Wszystkie ogrody";
                            allTab.onclick = () => {
                                document.querySelectorAll(".historia-tab-btn").forEach(b => b.classList.remove("active"));
                                allTab.classList.add("active");
                                document.querySelectorAll(".historia-zoo-card").forEach(c => c.style.display = "block");
                            };
                            tabsContainer.appendChild(allTab);
                        }

                        zoos.forEach(zoo => {
                                    if (tabsContainer) {
                                        const tabBtn = document.createElement("button");
                                        tabBtn.className = "historia-tab-btn";
                                        tabBtn.textContent = zoo.name;
                                        tabBtn.onclick = () => {
                                            document.querySelectorAll(".historia-tab-btn").forEach(b => b.classList.remove("active"));
                                            tabBtn.classList.add("active");

                                            document.querySelectorAll(".historia-zoo-card").forEach(card => {
                                                if (card.dataset.zooId === zoo.id) {
                                                    card.style.display = "block";
                                                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                                                } else {
                                                    card.style.display = "none";
                                                }
                                            });
                                        };
                                        tabsContainer.appendChild(tabBtn);
                                    }

                                    const zooCard = document.createElement("div");
                                    zooCard.className = "historia-zoo-card";
                                    zooCard.dataset.zooId = zoo.id;

                                    let heroHtml = zoo.heroImage ? `
                    <div class="historia-zoo-hero" style="background-image: url('${zoo.heroImage}');">
                        <div class="historia-hero-overlay">
                            ${zoo.badge ? `<span class="historia-badge">${zoo.badge}</span>` : ""}
                            <h3 class="historia-zoo-title">${zoo.name}</h3>
                            ${zoo.subtitle ? `<div class="historia-zoo-subtitle">${zoo.subtitle}</div>` : ""}
                        </div>
                    </div>
                ` : `
                    <div class="historia-zoo-header-simple">
                        ${zoo.badge ? `<span class="historia-badge">${zoo.badge}</span>` : ""}
                        <h3 class="historia-zoo-title">${zoo.name}</h3>
                        ${zoo.subtitle ? `<div class="historia-zoo-subtitle">${zoo.subtitle}</div>` : ""}
                    </div>
                `;

                let statsHtml = (Array.isArray(zoo.stats) && zoo.stats.length > 0) ? `
                    <div class="historia-stats-grid">
                        ${zoo.stats.map(s => `
                            <div class="historia-stat-box">
                                <span class="historia-stat-label">${s.label}</span>
                                <span class="historia-stat-value">${s.value}</span>
                            </div>
                        `).join("")}
                    </div>
                ` : "";

                let timelineHtml = (Array.isArray(zoo.timeline) && zoo.timeline.length > 0) ? `
                    <div class="historia-timeline-section">
                        <h4 class="historia-section-title"><i class="fas fa-hourglass-half"></i> Os Czasu i Kamienie Milowe</h4>
                        <div class="historia-timeline">
                            ${zoo.timeline.map(t => `
                                <div class="historia-timeline-item">
                                    <div class="historia-timeline-year">${t.year}</div>
                                    <div class="historia-timeline-content">
                                        <h5>${t.title}</h5>
                                        <p>${t.description}</p>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : "";

                let galleriesHtml = (Array.isArray(zoo.galleries) && zoo.galleries.length > 0) ? `
                    <div class="historia-galleries-section">
                        <h4 class="historia-section-title"><i class="fas fa-images"></i> Galerie Zdjęć (${zoo.galleries.length})</h4>
                        <div class="historia-galleries-wrapper">
                            ${zoo.galleries.map((gal, galIdx) => `
                                <div class="historia-gallery-block">
                                    <div class="historia-gallery-header">
                                        <h5 class="historia-gallery-title">${gal.title}</h5>
                                        ${gal.description ? `<p class="historia-gallery-desc">${gal.description}</p>` : ""}
                                    </div>
                                    <div class="historia-gallery-grid" data-zoo-id="${zoo.id}" data-gal-idx="${galIdx}">
                                        ${gal.images.map((img, imgIdx) => `
                                            <div class="historia-gallery-item" data-img-idx="${imgIdx}">
                                                <img loading="lazy" src="${typeof img === 'string' ? img : img.url}" alt="${img.caption || gal.title}">
                                                ${(typeof img === 'object' && img.caption) ? `<div class="historia-img-caption">${img.caption}</div>` : ""}
                                            </div>
                                        `).join("")}
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : "";

                // Wstrzykiwanie naprzemiennych zdjęć do akapitów
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = zoo.historyText || "";
                const paragraphs = Array.from(tempDiv.querySelectorAll("p"));

                const inlineImages = zoo.inlineImages || [];
                let imageCounter = 0;

                paragraphs.forEach((p, pIndex) => {
                    const matchingImages = inlineImages.filter(img => img.paragraphIndex === pIndex);

                    matchingImages.forEach(imgObj => {
                        const sideClass = (imageCounter % 2 === 0) ? "img-left" : "img-right";
                        imageCounter++;

                        const imgEl = document.createElement("img");
                        imgEl.src = imgObj.url;
                        imgEl.alt = imgObj.caption || "Zdjęcie";
                        imgEl.className = sideClass;

                        p.insertBefore(imgEl, p.firstChild);
                    });
                });

                zooCard.innerHTML = `
                    ${heroHtml}
                    <div class="historia-zoo-body">
                        ${zoo.summary ? `<div class="historia-summary-box">${zoo.summary}</div>` : ""}
                        ${statsHtml}
                        <div class="historia-text-content">
                            ${tempDiv.innerHTML}
                        </div>
                        ${timelineHtml}
                        ${galleriesHtml}
                    </div>
                `;

                zoosContainer.appendChild(zooCard);

                // 📸 1. Kliknięcia dla zdjęć W TEKŚCIE
                const textContentEl = zooCard.querySelector(".historia-text-content");
                if (textContentEl) {
                    const injectedImgs = Array.from(textContentEl.querySelectorAll("img"));
                    if (injectedImgs.length > 0) {
                        const inlineImgUrls = injectedImgs.map(img => img.src);
                        injectedImgs.forEach((imgEl, idx) => {
                            imgEl.onclick = (e) => {
                                e.stopPropagation();
                                if (typeof window.openGallery === "function") {
                                    window.openGallery(idx, inlineImgUrls);
                                } else if (typeof window.openHistoriaLightbox === "function") {
                                    window.openHistoriaLightbox(inlineImgUrls, idx);
                                }
                            };
                        });
                    }
                }

                // 📸 2. Kliknięcia dla DOLNYCH GALERII
                if (Array.isArray(zoo.galleries)) {
                    zoo.galleries.forEach((gal, galIdx) => {
                        const gridEl = zooCard.querySelector(`.historia-gallery-grid[data-gal-idx="${galIdx}"]`);
                        if (gridEl) {
                            gridEl.querySelectorAll(".historia-gallery-item").forEach((itemEl, imgIdx) => {
                                itemEl.onclick = () => {
                                    if (typeof window.openGallery === "function") {
                                        const urls = gal.images.map(img => typeof img === "string" ? img : img.url);
                                        window.openGallery(imgIdx, urls);
                                    } else {
                                        window.openHistoriaLightbox(gal.images, imgIdx);
                                    }
                                };
                            });
                        }
                    });
                }
            });

            if (typeof window.addNonBreakingSpaces === "function") {
                window.addNonBreakingSpaces(root);
            }

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("historia-visible");
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });

            document.querySelectorAll(".historia-zoo-card, .historia-timeline-item").forEach(el => {
                observer.observe(el);
            });
        });
    }

    // ---------------------------------
    // 4️⃣ INIT ON SPA READY
    // ---------------------------------
    function initHistoriaWhenReady() {
        const root = document.querySelector(".historia-page");
        if (!root) {
            requestAnimationFrame(initHistoriaWhenReady);
            return;
        }

        setupLightbox();
        renderHistoria();

        if (!window.HISTORIA.listenerAttached) {
            window.addEventListener("versionChanged", renderHistoria);
            window.addEventListener("storage", e => {
                if (window.AppState && e.key === window.AppState.key) {
                    renderHistoria();
                }
            });
            window.HISTORIA.listenerAttached = true;
        }
    }

    initHistoriaWhenReady();

})();