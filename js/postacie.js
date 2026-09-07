// =====================================
// CHARACTERS – SPA SAFE MODULE
// =====================================

window.CHARACTERS = window.CHARACTERS || {};

(function(CHARACTERS) {

    if (CHARACTERS.initialized) {
        CHARACTERS.render();
        return;
    }

    CHARACTERS.initialized = true;
    CHARACTERS.data = [];
    CHARACTERS.loading = false;

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
    // SMART WIKI LINK PARSER
    // Działa z: [[id|label]], [[postacie:id|label]], [[miejsca:id|label]]
    // ---------------------------------
    function parseCharacterLinks(text) {
        if (!text) return "";
        return text.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, rawId, label) => {
            let type = null;
            let targetId = rawId.trim();

            if (targetId.startsWith("miejsca:") || targetId.startsWith("place:")) {
                type = "place";
                targetId = targetId.replace(/^(miejsca:|place:)/, "");
            } else if (targetId.startsWith("postacie:") || targetId.startsWith("char:")) {
                type = "character";
                targetId = targetId.replace(/^(postacie:|char:)/, "");
            } else {
                if (window.PLACES && window.PLACES.data && window.PLACES.data.some(p => p.id === targetId || p.name === targetId)) {
                    type = "place";
                } else {
                    type = "character";
                }
            }

            if (type === "place") {
                return `<a href="#${targetId}" class="place-link" data-place-id="${targetId}">${label}</a>`;
            } else {
                return `<a href="#${targetId}" class="character-link" data-character-id="${targetId}">${label}</a>`;
            }
        });
    }

    // ---------------------------------
    // DYNAMICZNE GENEROWANIE SEKCJI "O POSTACI" ORAZ "RELACJE"
    // ---------------------------------
    function buildDescriptionHTML(char) {
        if (char.about || char.relations) {
            let html = "";
            if (char.about) {
                html += `<h3 class='section-title'><i class='fas fa-id-card'></i> O postaci</h3>`;
                const aboutList = Array.isArray(char.about) ? char.about : [char.about];
                aboutList.forEach(p => {
                    html += `<p class='modal-text'>${parseCharacterLinks(p)}</p>`;
                });
            }
            if (char.relations) {
                html += `<h3 class='section-title'><i class='fas fa-users'></i> Relacje</h3>`;
                const relList = Array.isArray(char.relations) ? char.relations : [char.relations];
                relList.forEach(p => {
                    html += `<p class='modal-text'>${parseCharacterLinks(p)}</p>`;
                });
            }
            return html;
        }
        return parseCharacterLinks(char.description || "");
    }

    // ---------------------------------
    // DYNAMICZNE GENEROWANIE WSPOMNIEŃ I CYTATÓW
    // ---------------------------------
    function buildFullBioHTML(char) {
        if (char.memories && Array.isArray(char.memories)) {
            let html = `<h3 class='section-title'><i class='fas fa-comments'></i> Wspomnienia i wypowiedzi</h3>`;

            char.memories.forEach(item => {
                if (item.question) {
                    html += `<h4 class='sub-title'><i class='fas fa-question-circle'></i> ${parseCharacterLinks(item.question)}</h4>`;
                }

                const contentList = Array.isArray(item.content) ? item.content : [item.content];
                contentList.forEach(text => {
                    if (!text) return;
                    const trimmed = text.trim();
                    // Wykrywanie cytatów po symbolach " lub „
                    if (trimmed.startsWith("„") || trimmed.startsWith('"')) {
                        html += `<blockquote class='character-quote'><i class='fas fa-quote-left quote-icon'></i><p>${parseCharacterLinks(trimmed)}</p></blockquote>`;
                    } else {
                        html += `<p class='modal-text'>${parseCharacterLinks(trimmed)}</p>`;
                    }
                });
            });

            return html;
        }

        // Kompatybilność ze starym polem fullBio
        const rawBio = char.fullBio || char.fullDescription || char.bio || "";
        if (Array.isArray(rawBio)) {
            return rawBio.map(paragraph => parseCharacterLinks(paragraph)).join('<br><br>');
        }
        return parseCharacterLinks(rawBio);
    }

    // ---------------------------------
    // BINDOWANIE LINKÓW (W POSTACIACH I DO MIEJSC)
    // ---------------------------------
    function bindCharacterLinks(container) {
        if (!container) return;

        container.querySelectorAll(".character-link").forEach(link => {
            link.onclick = e => {
                e.preventDefault();
                const targetId = link.dataset.characterId;
                const targetChar = CHARACTERS.data.find(c => c.id === targetId);

                if (targetChar) {
                    switchToCharacterModal(targetChar);
                } else {
                    console.warn("Nie znaleziono postaci o ID:", targetId);
                }
            };
        });

        container.querySelectorAll(".place-link").forEach(link => {
            link.onclick = e => {
                e.preventDefault();
                const placeId = link.dataset.placeId;

                CHARACTERS.closeModal();

                const triggerOpenPlace = () => {
                    if (!window.PLACES) return;

                    const placeObj = (window.PLACES.data || []).find(p => p.id === placeId || p.name === placeId);
                    const currentVersion = typeof AppState !== "undefined" && AppState.get ? AppState.get() : null;

                    // Weryfikacja i zmiana wersji jeśli miejsce nie występuje w obecnej
                    if (placeObj && currentVersion) {
                        const isAvailableInVersion = (item, ver) => {
                            if (!ver || !item || !item.version) return true;
                            if (Array.isArray(item.version)) return item.version.includes(ver);
                            return item.version === ver;
                        };

                        // Jeśli miejsce NIE występuje w aktualnie wybranej wersji
                        if (!isAvailableInVersion(placeObj, currentVersion)) {
                            let targetVersion = null;

                            // Preferujemy przełączenie do pz1, jeśli miejsce w niej występuje
                            if (isAvailableInVersion(placeObj, "pz1")) {
                                targetVersion = "pz1";
                            } else if (Array.isArray(placeObj.version) && placeObj.version.length > 0) {
                                targetVersion = placeObj.version[0];
                            } else if (typeof placeObj.version === "string") {
                                targetVersion = placeObj.version;
                            }

                            if (targetVersion && targetVersion !== currentVersion) {
                                if (typeof AppState !== "undefined") {
                                    if (typeof AppState.set === "function") AppState.set(targetVersion);
                                    else if (typeof AppState.setVersion === "function") AppState.setVersion(targetVersion);
                                }
                                document.dispatchEvent(new CustomEvent("versionChanged", { detail: targetVersion }));
                            }
                        }
                    }

                    if (typeof window.PLACES.openById === "function") {
                        window.PLACES.openById(placeId);
                    } else if (typeof window.PLACES.showPlace === "function") {
                        window.PLACES.showPlace(placeObj || placeId);
                    } else if (typeof window.PLACES.openModal === "function") {
                        window.PLACES.openModal(placeObj || placeId);
                    } else {
                        console.warn("Brak dostępnej metody otwierającej modal miejsca w window.PLACES");
                    }
                };

                const pageLoader = window.loadPage ? window.loadPage("miejsca") : Promise.resolve();

                pageLoader.then(() => {
                    if (window.PLACES && window.PLACES.data && window.PLACES.data.length > 0) {
                        triggerOpenPlace();
                    } else {
                        const onPlacesReady = () => {
                            document.removeEventListener("placesReady", onPlacesReady);
                            triggerOpenPlace();
                        };
                        document.addEventListener("placesReady", onPlacesReady);
                    }
                }).catch(err => {
                    console.error("Błąd podczas ładowania modułu miejsc:", err);
                });
            };
        });
    }

    function switchToCharacterModal(targetChar) {
        const modal = document.getElementById("postacie-modal");

        if (modal && modal.classList.contains("show")) {
            const currentElements = modal.querySelectorAll(
                "#postacie-avatar, #postacie-gallery, #postacie-fullDescription, #postacie-description, #postacie-name, #postacie-meta"
            );

            currentElements.forEach(el => {
                el.style.transition = "opacity 0.15s ease, filter 0.15s ease, transform 0.15s ease";
                el.style.opacity = "0";
                el.style.filter = "blur(8px)";
                el.style.transform = "translateY(-8px)";
            });

            setTimeout(() => {
                openModal(targetChar);
            }, 150);
        } else {
            openModal(targetChar);
        }
    }

    function loadCharacters() {
        if (CHARACTERS.data.length) return Promise.resolve(CHARACTERS.data);
        if (CHARACTERS.loading) return CHARACTERS.loading;

        CHARACTERS.loading = fetch("data/postacie.json")
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.json();
            })
            .then(data => {
                CHARACTERS.data = data;
                document.dispatchEvent(new CustomEvent("charactersReady"));
                return data;
            })
            .catch(err => {
                console.error("Błąd ładowania pliku postacie.json:", err);
                CHARACTERS.loading = false;
            });

        return CHARACTERS.loading;
    }

    function initCharacters() {
        const grid = document.getElementById("postacie-grid");
        if (!grid) {
            requestAnimationFrame(initCharacters);
            return;
        }

        CHARACTERS.grid = grid;
        loadCharacters().then(renderCharacters);

        if (!CHARACTERS.versionListenerAttached) {
            document.addEventListener("versionChanged", renderCharacters);
            CHARACTERS.versionListenerAttached = true;
        }

        document.addEventListener("click", function(e) {
            const modal = document.getElementById("postacie-modal");
            if (!modal || !modal.classList.contains("show")) return;

            const closeBtn = e.target.closest("#close-postacie");
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

    function renderCharacters() {
        const grid = document.getElementById("postacie-grid");
        if (!grid) return;

        const version = typeof AppState !== "undefined" && AppState.get ? AppState.get() : null;
        grid.innerHTML = "";

        const filtered = version ?
            CHARACTERS.data.filter(c => {
                if (!c.version) return true;
                if (Array.isArray(c.version)) return c.version.includes(version);
                return c.version === version;
            }) :
            CHARACTERS.data;

        filtered.forEach(char => {
            const item = document.createElement("div");
            item.className = "filter-item character-card";
            const imgSrc = char.image || char.avatar || "";

            item.innerHTML = `
                <a href="#${char.id}" class="character-card-link">
                    <img loading="lazy" src="${imgSrc}" alt="${char.name}">
                    <span class="podpis">${char.name}</span>
                </a>
            `;

            item.onclick = e => {
                e.preventDefault();
                openModal(char);
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

    function openModal(char) {
        const modal = document.getElementById("postacie-modal");
        const avatarDiv = document.getElementById("postacie-avatar");
        const gallery = document.getElementById("postacie-gallery");
        const fullBioDiv = document.getElementById("postacie-fullDescription");
        const descEl = document.getElementById("postacie-description");
        const nameEl = document.getElementById("postacie-name");
        const metaEl = document.getElementById("postacie-meta");

        if (!modal) return;

        modal.scrollTop = 0;
        const modalBody = modal.querySelector(".modal-content");
        if (modalBody) modalBody.scrollTop = 0;

        modal.className = modal.className.replace(/\bcharacter-theme-\S+/g, '').trim();
        if (char.id) modal.classList.add(`character-theme-${char.id}`);

        if (avatarDiv) {
            const imgSrc = char.headerImage || char.image || char.avatar;
            if (imgSrc) {
                avatarDiv.innerHTML = `
                    <figure style="width:90%;" class="character-avatar-container">
                        <img src="${imgSrc}" alt="${char.name}">
                    </figure>
                `;
                const mainImg = avatarDiv.querySelector("img");
                if (mainImg) {
                    mainImg.onclick = () => {
                        if (typeof window.openGallery === "function") {
                            window.currentGallery = [imgSrc];
                            window.openGallery(0, window.currentGallery);
                        }
                    };
                }
            } else {
                avatarDiv.innerHTML = "";
            }
        }

        if (nameEl) nameEl.textContent = char.name || "";

        if (metaEl) {
            const metaContent = [];
            if (char.role) metaContent.push(`<br><div class="meta-item"><i class="fas fa-briefcase"></i> <b>Rola:</b> ${char.role}</div><br>`);
            if (char.affiliation) metaContent.push(`<div class="meta-item"><i class="fas fa-university"></i> <b>Przynależność:</b> ${char.affiliation}</div><br>`);
            if (char.status) metaContent.push(`<div class="meta-item"><i class="fas fa-user-clock"></i> <b>Status:</b> <span class="badge">${char.status}</span></div><br>`);
            if (char.motto) metaContent.push(`
                <div class="motto-box character-quote">
                    <i class="fas fa-quote-left motto-icon quote-icon"></i>
                    <i>„${char.motto}”</i>
                </div>
            `);

            metaEl.innerHTML = metaContent.join("");
        }

        // GENEROWANIE O POSTACI I RELACJI
        if (descEl) {
            descEl.innerHTML = buildDescriptionHTML(char);
            bindCharacterLinks(descEl);

            if (typeof enrichTextWithGlossary === "function") {
                enrichTextWithGlossary(descEl);
                descEl.querySelectorAll("a.place-link, a.character-link").forEach(link => {
                    link.querySelectorAll(".glossary-link").forEach(g => g.replaceWith(document.createTextNode(g.textContent)));
                    link.normalize();
                });
            }

            if (typeof addNonBreakingSpaces === "function") {
                addNonBreakingSpaces(descEl);
            }
        }

        if (gallery) {
            const galleryImages = char.gallery || [];
            gallery.innerHTML = "";
            window.currentGallery = galleryImages.slice();
            const galleryHr = gallery.nextElementSibling;

            if (galleryImages.length > 0) {
                gallery.style.display = "";
                if (galleryHr && galleryHr.classList.contains("modal-separator")) galleryHr.style.display = "";

                galleryImages.forEach((src, index) => {
                    const img = document.createElement("img");
                    img.src = src;
                    img.className = "character-gallery-img";
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
                if (galleryHr && galleryHr.classList.contains("modal-separator")) galleryHr.style.display = "none";
            }
        }

        // GENEROWANIE WSPOMNIEŃ I CYTATÓW
        if (fullBioDiv) {
            fullBioDiv.innerHTML = buildFullBioHTML(char);
            bindCharacterLinks(fullBioDiv);

            if (typeof enrichTextWithGlossary === "function") {
                enrichTextWithGlossary(fullBioDiv);
                fullBioDiv.querySelectorAll("a.place-link, a.character-link").forEach(link => {
                    link.querySelectorAll(".glossary-link").forEach(g => g.replaceWith(document.createTextNode(g.textContent)));
                    link.normalize();
                });
            }

            if (typeof addNonBreakingSpaces === "function") {
                addNonBreakingSpaces(fullBioDiv);
            }
        }

        const animatedElements = [avatarDiv, gallery, fullBioDiv, descEl, nameEl, metaEl].filter(Boolean);

        animatedElements.forEach(el => {
            el.style.transition = "none";
            el.style.opacity = "0";
            el.style.filter = "blur(8px)";
            el.style.transform = "translateY(8px)";
        });

        modal.classList.remove("hidden");
        modal.classList.add("show");

        if (typeof window.addNonBreakingSpaces === "function") {
            window.addNonBreakingSpaces(modal);
        }

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
        loadCharacters().then(data => {
            const targetChar = data.find(c => c.id === id);
            if (targetChar) {
                openModal(targetChar);
            } else {
                console.warn("Nie znaleziono postaci o ID:", id);
            }
        });
    }

    function closeModal() {
        const modal = document.getElementById("postacie-modal");
        if (!modal) return;

        modal.classList.remove("show");

        setTimeout(() => {
            modal.classList.add("hidden");
            modal.className = modal.className.replace(/\bcharacter-theme-\S+/g, '').trim();
        }, 200);
    }

    CHARACTERS.render = renderCharacters;
    CHARACTERS.openModal = openModal;
    CHARACTERS.openById = openById;
    CHARACTERS.closeModal = closeModal;

    initCharacters();

})(window.CHARACTERS);