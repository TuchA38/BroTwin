// =====================================
// PLACES – SPA SAFE MODULE
// =====================================

window.PLACES = window.PLACES || {};

(function(PLACES) {

        if (PLACES.initialized) {
            PLACES.render();
            return;
        }

        PLACES.initialized = true;
        PLACES.data = [];
        PLACES.loading = false;

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

        function parsePlaceLinks(text) {
            if (!text) return "";
            return text.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, rawId, label) => {
                let type = null;
                let targetId = rawId.trim();

                if (targetId.startsWith("postacie:") || targetId.startsWith("char:")) {
                    type = "character";
                    targetId = targetId.replace(/^(postacie:|char:)/, "");
                } else if (targetId.startsWith("miejsca:") || targetId.startsWith("place:")) {
                    type = "place";
                    targetId = targetId.replace(/^(miejsca:|place:)/, "");
                } else {
                    if (window.CHARACTERS && window.CHARACTERS.data && window.CHARACTERS.data.some(c => c.id === targetId || c.name === targetId)) {
                        type = "character";
                    } else {
                        type = "place";
                    }
                }

                if (type === "character") {
                    return `<a href="#${targetId}" class="character-link" data-character-id="${targetId}">${label}</a>`;
                } else {
                    return `<a href="#${targetId}" class="place-link" data-place-id="${targetId}">${label}</a>`;
                }
            });
        }

        function renderObjectives(place) {
            const objectives = place ? place.objectives : null;
            if (!objectives) return "";

            const isTimedChallenge = place.type === "timed" || Array.isArray(objectives);

            if (isTimedChallenge) {
                const times = place.targetTimes || {};

                let timesBarHTML = "";
                if (times.gold || times.silver || times.bronze) {
                    timesBarHTML = `
                <div class="timed-targets-container" style="display: flex; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
                    ${times.bronze ? `<div class="obj-level-header obj-bronze" style="margin: 0;"><i class="fas fa-star obj-star"></i> Brąz: ${times.bronze}</div>` : ''}
                    ${times.silver ? `<div class="obj-level-header obj-silver" style="margin: 0;"><i class="fas fa-star obj-star"></i> Srebro: ${times.silver}</div>` : ''}
                    ${times.gold ? `<div class="obj-level-header obj-gold" style="margin: 0;"><i class="fas fa-star obj-star"></i> Złoto: ${times.gold}</div>` : ''}
                </div>
            `;
                }

                let tasksHTML = "";
                const objArray = Array.isArray(objectives) ? objectives : [];
                
                objArray.forEach(group => {
                    const hasTasks = Array.isArray(group.tasks) && group.tasks.length > 0;
                    const isOpen = group.open === true;
                    const activeClass = isOpen ? "active" : "";

                    if (hasTasks) {
                        tasksHTML += `
                            <div class="obj-group ${activeClass}">
                                <div class="obj-summary" onclick="this.parentElement.classList.toggle('active')">
                                    <span class="obj-summary-title">${parsePlaceLinks(group.title)}</span>
                                    <i class="fas fa-chevron-right obj-arrow"></i>
                                </div>
                                <div class="obj-group-content">
                                    <div class="obj-group-inner">
                                        <ul class="obj-tree">
                                            ${group.tasks.map(task => `<li>${parsePlaceLinks(task)}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        tasksHTML += `
                            <div class="obj-group obj-single">
                                <div class="obj-summary static">
                                    <span class="obj-summary-title">${parsePlaceLinks(group.title)}</span>
                                </div>
                            </div>
                        `;
                    }
                });

                return `
                    <div class="scenario-objectives">
                        <h3 class="scenario-objectives-header">
                            <i class="fas fa-stopwatch scenario-objectives-icon"></i> Cele
                        </h3>
                        
                        ${timesBarHTML}

                        <div class="obj-level">
                            ${tasksHTML}
                        </div>
                    </div>
                `;
            }

            const levels = [
                { key: "bronze", label: "BRĄZOWE", class: "obj-bronze" },
                { key: "silver", label: "SREBRNE", class: "obj-silver" },
                { key: "gold", label: "ZŁOTE", class: "obj-gold" }
            ];

            let html = `
                <div class="scenario-objectives">
                    <h3 class="scenario-objectives-header">
                        <i class="fas fa-bullseye scenario-objectives-icon"></i> Cele
                    </h3>
            `;

            levels.forEach(lvl => {
                const groups = objectives[lvl.key];
                if (groups && groups.length > 0) {
                    html += `
                        <div class="obj-level ${lvl.class}">
                            <div class="obj-level-header">
                                <i class="fas fa-star obj-star"></i> ${lvl.label}
                            </div>
                    `;

                    groups.forEach((group) => {
                        const hasTasks = Array.isArray(group.tasks) && group.tasks.length > 0;

                        if (hasTasks) {
                            const isOpen = group.open === true;
                            const activeClass = isOpen ? "active" : "";

                            html += `
                                <div class="obj-group ${activeClass}">
                                    <div class="obj-summary" onclick="this.parentElement.classList.toggle('active')">
                                        <span class="obj-summary-title">${parsePlaceLinks(group.title)}</span>
                                        <i class="fas fa-chevron-right obj-arrow"></i>
                                    </div>
                                    <div class="obj-group-content">
                                        <div class="obj-group-inner">
                                            <ul class="obj-tree">
                                                ${group.tasks.map(task => `<li>${parsePlaceLinks(task)}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            html += `
                                <div class="obj-group obj-single">
                                    <div class="obj-summary static">
                                        <span class="obj-summary-title">${parsePlaceLinks(group.title)}</span>
                                    </div>
                                </div>
                            `;
                        }
                    });

                    html += `</div>`;
                }
            });

            html += `</div>`;
            return html;
        }

        function bindPlaceLinks(container) {
            if (!container) return;

            container.querySelectorAll(".place-link").forEach(link => {
                link.onclick = e => {
                    e.preventDefault();
                    const targetId = link.dataset.placeId;
                    const targetPlace = PLACES.data.find(p => p.id === targetId);

                    if (targetPlace) {
                        switchToPlaceModal(targetPlace);
                    } else {
                        console.warn("Nie znaleziono miejsca o ID:", targetId);
                    }
                };
            });

            container.querySelectorAll(".character-link").forEach(link => {
                link.onclick = e => {
                    e.preventDefault();
                    const charId = link.dataset.characterId;

                    PLACES.closeModal();

                    const openCharModal = () => {
                        if (window.CHARACTERS && typeof window.CHARACTERS.openById === "function") {
                            window.CHARACTERS.openById(charId);
                        } else if (window.CHARACTERS && typeof window.CHARACTERS.openModal === "function") {
                            const charObj = (window.CHARACTERS.data || []).find(c => c.id === charId || c.name === charId);
                            window.CHARACTERS.openModal(charObj || charId);
                        }
                    };

                    const switchAndOpen = () => {
                        if (window.CHARACTERS && typeof window.CHARACTERS.openById === "function") {
                            openCharModal();
                        } else {
                            const onReady = () => {
                                document.removeEventListener("charactersReady", onReady);
                                openCharModal();
                            };
                            document.addEventListener("charactersReady", onReady);

                            let attempts = 0;
                            const checkInterval = setInterval(() => {
                                attempts++;
                                if (window.CHARACTERS && typeof window.CHARACTERS.openById === "function") {
                                    clearInterval(checkInterval);
                                    document.removeEventListener("charactersReady", onReady);
                                    openCharModal();
                                }
                                if (attempts > 50) clearInterval(checkInterval);
                            }, 50);
                        }
                    };

                    if (typeof window.loadPage === "function") {
                        const loader = window.loadPage("postacie");
                        if (loader && typeof loader.then === "function") {
                            loader.then(switchAndOpen).catch(err => {
                                console.error("Błąd ładowania strony postaci:", err);
                                switchAndOpen();
                            });
                        } else {
                            switchAndOpen();
                        }
                    } else {
                        switchAndOpen();
                    }
                };
            });
        }

        function switchToPlaceModal(targetPlace) {
            const modal = document.getElementById("miejsca-modal");

            if (modal && modal.classList.contains("show")) {
                const currentElements = modal.querySelectorAll(
                    "#miejsca-avatar, #miejsca-gallery, #miejsca-fullDescription, #miejsca-description, #miejsca-name, #miejsca-meta"
                );

                currentElements.forEach(el => {
                    el.style.transition = "opacity 0.15s ease, filter 0.15s ease, transform 0.15s ease";
                    el.style.opacity = "0";
                    el.style.filter = "blur(8px)";
                    el.style.transform = "translateY(-8px)";
                });

                setTimeout(() => {
                    openModal(targetPlace);
                }, 150);
            } else {
                openModal(targetPlace);
            }
        }

        function loadPlaces() {
            if (PLACES.data.length) return Promise.resolve(PLACES.data);
            if (PLACES.loading) return PLACES.loading;

            PLACES.loading = fetch("data/miejsca.json")
                .then(r => {
                    if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                    return r.json();
                })
                .then(data => {
                    PLACES.data = data;
                    document.dispatchEvent(new CustomEvent("placesReady"));
                    return data;
                })
                .catch(err => {
                    console.error("Błąd ładowania pliku miejsca.json:", err);
                    PLACES.loading = false;
                });

            return PLACES.loading;
        }

        function initPlaces() {
            const grid = document.getElementById("miejsca-grid");
            if (!grid) {
                requestAnimationFrame(initPlaces);
                return;
            }

            PLACES.grid = grid;
            loadPlaces().then(renderPlaces);

            if (!PLACES.versionListenerAttached) {
                document.addEventListener("versionChanged", renderPlaces);
                PLACES.versionListenerAttached = true;
            }

            document.addEventListener("click", function(e) {
                const modal = document.getElementById("miejsca-modal");
                if (!modal || !modal.classList.contains("show")) return;

                const closeBtn = e.target.closest("#close-miejsca");
                if (closeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                    return;
                }

                if (e.target === modal) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                }
            });

            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape") closeModal();
            });
        }

        function renderPlaces() {
            const grid = document.getElementById("miejsca-grid");
            if (!grid) return;

            const version = typeof AppState !== "undefined" && AppState.get ? AppState.get() : null;
            grid.innerHTML = "";

            const filtered = version ?
                PLACES.data.filter(p => {
                    if (!p.version) return true;
                    if (Array.isArray(p.version)) return p.version.includes(version);
                    return p.version === version;
                }) :
                PLACES.data;

            filtered.forEach(place => {
                const item = document.createElement("div");
                item.className = "filter-item place-card";
                const imgSrc = place.image || place.avatar || "";
                
                const isScenario = Boolean(place.scenario || place.type === "scenario");
                const scenarioBadge = isScenario ? 
                    `<img src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1783196962/Kariera_c4rzpv.svg" alt="Tryb Kariery" class="scenario-badge-grid">` : "";

                item.innerHTML = `
                <a href="#${place.id}" class="place-card-link">
                    ${scenarioBadge}
                    <img loading="lazy" src="${imgSrc}" alt="${place.name}">
                    <span class="podpis">${place.name}</span>
                </a>
            `;

                // Aplikowanie twardych spacji w podpisie na siatce
    const podpisEl = item.querySelector(".podpis");
    if (podpisEl && typeof addNonBreakingSpaces === "function") {
        addNonBreakingSpaces(podpisEl);
    }

    item.onclick = e => {
        e.preventDefault();
        openModal(place);
    };
    grid.appendChild(item);
            });

            requestAnimationFrame(() => {
                const items = grid.querySelectorAll(".filter-item");
                if (items.length === 0) return;

                const gridColumns = window.getComputedStyle(grid).getPropertyValue("grid-template-columns");
                const colsCount = gridColumns.split(" ").length || 1;

                items.forEach((item, index) => {
                    const colIndex = index % colsCount;
                    item.style.animationDelay = `${colIndex * 40}ms`;
                    item.classList.add("visible");
                });

                checkRowsInView(grid);
            });

            window.onscroll = () => checkRowsInView(grid);
            grid.onscroll = () => checkRowsInView(grid);
        }

        function openModal(place) {
            const modal = document.getElementById("miejsca-modal");
            const avatarDiv = document.getElementById("miejsca-avatar");
            const gallery = document.getElementById("miejsca-gallery");
            const fullBioDiv = document.getElementById("miejsca-fullDescription");
            const descEl = document.getElementById("miejsca-description");
            const nameEl = document.getElementById("miejsca-name");
            const metaEl = document.getElementById("miejsca-meta");

            if (!modal) return;

            modal.scrollTop = 0;
            const modalBody = modal.querySelector(".modal-content");
            if (modalBody) modalBody.scrollTop = 0;

            modal.className = modal.className.replace(/\bplace-theme-\S+/g, '').trim();
            if (place.id) modal.classList.add(`place-theme-${place.id}`);

            if (avatarDiv) {
    const imgSrc = place.headerImage || place.image || place.avatar;
    if (imgSrc) {
        // Pobieranie ID DLC z uwzględnieniem obiektów i wersji
        let dlcTarget = null;
        const currentVersion = typeof AppState !== "undefined" && AppState.get ? AppState.get() : null;

        if (typeof place.dlcId === "object" && place.dlcId !== null) {
            dlcTarget = (currentVersion && place.dlcId[currentVersion]) 
                ? place.dlcId[currentVersion] 
                : Object.values(place.dlcId)[0];
        } else if (typeof place.dlcId === "string") {
            dlcTarget = place.dlcId;
        } else if (Array.isArray(place.version)) {
            dlcTarget = place.version.find(v => v !== "base");
        } else if (place.version && place.version !== "base") {
            dlcTarget = place.version;
        }

        // 1. Sprawdzenie, czy obiekt jest scenariuszem
        const isScenario = Boolean(place.scenario || place.type === "scenario");

        // 2. Generowanie przycisku TYLKO wtedy, gdy to scenariusz ORAZ istnieje odpowiednie dlcTarget
        const dlcBtn = (isScenario && dlcTarget && dlcTarget !== "base") ? `
            <button class="species-icon-btn dlc-link-btn" title="Przejdź do DLC" data-dlc-id="${dlcTarget}" style="position: absolute; top: 8px; right: 8px; overflow: visible;">
                <img class="ikona-zdjecie-duza" src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829340/dlc_zbn7i2.webp" alt="DLC">
            </button>
        ` : "";

        avatarDiv.innerHTML = `
            <figure style="width:90%; position:relative;" class="place-avatar-container">
                ${dlcBtn}
                <img src="${imgSrc}" alt="${place.name}" style="cursor:pointer;">
            </figure>
        `;

        const mainImg = avatarDiv.querySelector("img:not(.ikona-zdjecie-duza)");
        if (mainImg) {
            mainImg.onclick = () => {
                if (typeof window.openGallery === "function") {
                    window.currentGallery = [imgSrc];
                    window.openGallery(0, window.currentGallery);
                }
            };
        }

        // Obsługa kliknięcia przycisku DLC (wykona się tylko, gdy dlcBtn został wyrenderowany)
        const dlcBtnEl = avatarDiv.querySelector(".dlc-link-btn");
        if (dlcBtnEl) {
            dlcBtnEl.onclick = (e) => {
                e.stopPropagation();
                const dlcId = dlcBtnEl.dataset.dlcId;
                closeModal();

                const triggerOpen = () => {
                    if (!window.DLC) return false;

                    if (typeof window.DLC.loadData === "function") {
                        window.DLC.loadData().then(() => {
                            if (typeof window.DLC.openById === "function") window.DLC.openById(dlcId);
                            else if (typeof window.DLC.openModal === "function") {
                                const dlcObj = (window.DLC.data || []).find(d => d.id === dlcId);
                                window.DLC.openModal(dlcObj || dlcId);
                            }
                        });
                        return true;
                    }

                    if (Array.isArray(window.DLC.data) && window.DLC.data.length > 0) {
                        if (typeof window.DLC.openById === "function") {
                            window.DLC.openById(dlcId);
                        } else if (typeof window.DLC.openModal === "function") {
                            const dlcObj = window.DLC.data.find(d => d.id === dlcId);
                            window.DLC.openModal(dlcObj || dlcId);
                        } else if (typeof window.openDlcModal === "function") {
                            window.openDlcModal(dlcId);
                        }
                        return true;
                    }

                    return false;
                };

                const switchAndOpen = () => {
                    if (triggerOpen()) return;

                    const onReady = () => {
                        document.removeEventListener("dlcReady", onReady);
                        document.removeEventListener("dlcsReady", onReady);
                        triggerOpen();
                    };
                    document.addEventListener("dlcReady", onReady);
                    document.addEventListener("dlcsReady", onReady);

                    let attempts = 0;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        if (triggerOpen() || attempts > 50) {
                            clearInterval(checkInterval);
                            document.removeEventListener("dlcReady", onReady);
                            document.removeEventListener("dlcsReady", onReady);
                        }
                    }, 50);
                };

                if (typeof window.loadPage === "function") {
                    const loader = window.loadPage("dlc");
                    if (loader && typeof loader.then === "function") {
                        loader.then(switchAndOpen).catch(err => {
                            console.error("Błąd ładowania strony DLC:", err);
                            switchAndOpen();
                        });
                    } else {
                        switchAndOpen();
                    }
                } else {
                    switchAndOpen();
                }
            };
        }
    } else {
        avatarDiv.innerHTML = "";
    }
}

if (nameEl) {
    nameEl.textContent = place.name || "";
    if (typeof addNonBreakingSpaces === "function") {
        addNonBreakingSpaces(nameEl);
    }
}
            if (metaEl) {
                const metaContent = [];

                if (place.role) {
                    metaContent.push(`<b>Rola:</b> ${place.role}`);
                }

                if (place.scenario) {
                    metaContent.push(`<b>Scenariusz:</b> ${place.scenario}`);
                }

                if (place.rewardImage || place.rewardImages || place.reward) {
                    const imagesMap = place.rewardImages ? { ...place.rewardImages } : {};
                    if (place.rewardImage && !imagesMap.stone) {
                        imagesMap.stone = place.rewardImage;
                    }

                    const keys = Object.keys(imagesMap);
                    const initialSrc = imagesMap.stone || (keys.length > 0 ? imagesMap[keys[0]] : place.rewardImage);

                    let dotsHtml = '';
                    if (keys.length > 1) {
                        const labels = {
                            stone: 'Kamień',
                            bronze: 'Brąz',
                            silver: 'Srebro',
                            gold: 'Złoto'
                        };

                        dotsHtml = `<div class="reward-dots-container">` +
                            keys.map((key, idx) => {
                                const activeClass = idx === 0 ? 'active' : '';
                                return `<span class="reward-dot dot-${key} ${activeClass}" data-variant="${key}" title="${labels[key] || key}"></span>`;
                            }).join('') +
                        `</div>`;
                    }

                    metaContent.push(`
                        <div class="place-reward-container">
                            ${place.reward ? `<div style="margin-bottom:6px;"><b>Nagroda:</b> ${place.reward}</div>` : ''}
                            <div class="reward-img-wrapper">
                                <img src="${initialSrc}" alt="${place.reward || 'Nagroda'}" class="place-reward-img">
                                ${dotsHtml}
                            </div>
                        </div>
                    `);
                }

                metaEl.innerHTML = metaContent.join("<br>");

                const rewardWrapper = metaEl.querySelector(".reward-img-wrapper");
                if (rewardWrapper) {
                    const rewardImg = rewardWrapper.querySelector(".place-reward-img");
                    const dots = rewardWrapper.querySelectorAll(".reward-dot");

                    const imagesMap = place.rewardImages ? { ...place.rewardImages } : {};
                    if (place.rewardImage && !imagesMap.stone) imagesMap.stone = place.rewardImage;

                    dots.forEach(dot => {
                        dot.onclick = (e) => {
                            e.stopPropagation();
                            const variant = dot.dataset.variant;
                            if (imagesMap[variant]) {
                                rewardImg.src = imagesMap[variant];
                                dots.forEach(d => d.classList.remove("active"));
                                dot.classList.add("active");
                            }
                        };
                    });

                    if (rewardImg) {
                        rewardImg.onclick = () => {
                            if (typeof window.openGallery === "function") {
                                const activeDot = rewardWrapper.querySelector(".reward-dot.active");
                                const currentVariant = activeDot ? activeDot.dataset.variant : 'stone';

                                window.openGallery(0, [rewardImg.src], {
                                    rewardImages: imagesMap,
                                    activeVariant: currentVariant
                                });
                            }
                        };
                    }
                }
            }

            if (fullBioDiv && descEl && fullBioDiv.parentNode && fullBioDiv.parentNode === descEl.parentNode) {
                fullBioDiv.parentNode.insertBefore(fullBioDiv, descEl);
            }

            if (fullBioDiv) {
                const bioText = (place.fullBio || place.fullDescription || place.bio || "").trim();

                if (bioText) {
                    fullBioDiv.style.display = "";
                    fullBioDiv.innerHTML = `
                        <h3 class="section-title"><i class="fas fa-map-marker-alt"></i> O&nbsp;miejscu</h3>
                        ${parsePlaceLinks(bioText)}
                        <hr class="modal-separator">
                    `;
                    bindPlaceLinks(fullBioDiv);

                    if (typeof enrichTextWithGlossary === "function") {
                        enrichTextWithGlossary(fullBioDiv);
                        fullBioDiv.querySelectorAll("p, th, td, span, div").forEach(el => enrichTextWithGlossary(el));
                    }
                    if (typeof addNonBreakingSpaces === "function") {
                        addNonBreakingSpaces(fullBioDiv);
                    }
                } else {
                    fullBioDiv.style.display = "none";
                    fullBioDiv.innerHTML = "";
                }
            }

            if (descEl) {
                let descHtml = "";
                const descText = (place.description || "").trim();

                if (descText) {
                    const sectionTitle = (place.type === "timed") ? "Opis wyzwania" : "Fabuła scenariusza";
                    descHtml += `<h3 class="section-title"><i class="fas fa-book-open"></i> ${sectionTitle}</h3>`;
                    descHtml += parsePlaceLinks(descText);
                }

                if (place.objectives) {
                    descHtml += renderObjectives(place);
                }

                descEl.innerHTML = descHtml;
                bindPlaceLinks(descEl);

                if (typeof enrichTextWithGlossary === "function") {
                    enrichTextWithGlossary(descEl);
                    descEl.querySelectorAll("p, th, td, span, div").forEach(el => enrichTextWithGlossary(el));
                }
                if (typeof addNonBreakingSpaces === "function") {
                    addNonBreakingSpaces(descEl);
                }
            }

            if (gallery) {
                const galleryImages = place.gallery || [];
                gallery.innerHTML = "";
                window.currentGallery = galleryImages.slice();

                if (galleryImages.length > 0) {
                    gallery.style.display = "";

                    galleryImages.forEach((src, index) => {
                        const img = document.createElement("img");
                        img.src = src;
                        img.className = "place-gallery-img";
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
                }
            }

            const allHrs = modal.querySelectorAll("hr, .modal-separator");
            allHrs.forEach(hr => {
                hr.style.display = "";
                
                let hasContentAfter = false;
                let curr = hr;

                while (curr && curr !== modal) {
                    let next = curr.nextElementSibling;
                    while (next) {
                        const isVisible = next.offsetWidth > 0 || next.offsetHeight > 0 || next.getClientRects().length > 0;
                        const hasText = next.textContent.trim().length > 0;
                        
                        if (isVisible && hasText && window.getComputedStyle(next).display !== "none") {
                            hasContentAfter = true;
                            break;
                        }
                        next = next.nextElementSibling;
                    }
                    if (hasContentAfter) break;
                    curr = curr.parentElement;
                }

                if (!hasContentAfter) {
                    hr.style.display = "none";
                }
            });

            const animatedElements = [avatarDiv, gallery, fullBioDiv, descEl, nameEl, metaEl].filter(Boolean);

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

        function openById(id) {
            loadPlaces().then(data => {
                const targetPlace = data.find(p => p.id === id);
                if (targetPlace) {
                    openModal(targetPlace);
                } else {
                    console.warn("Nie znaleziono miejsca o ID:", id);
                }
            });
        }

        function closeModal() {
            const modal = document.getElementById("miejsca-modal");
            if (!modal) return;

            modal.classList.remove("show");

            setTimeout(() => {
                modal.classList.add("hidden");
                modal.className = modal.className.replace(/\bplace-theme-\S+/g, '').trim();
            }, 200);
        }

        PLACES.render = renderPlaces;
        PLACES.openModal = openModal;
        PLACES.openById = openById;
        PLACES.closeModal = closeModal;

        initPlaces();

})(window.PLACES);