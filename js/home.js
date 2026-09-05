(() => {

    // =====================================
    // 1️⃣ GLOBALNY CACHE (raz na całą aplikację)
    // =====================================
    window.HOME = window.HOME || {
        data: null,
        loading: false,
        loaded: false
    };

    function loadHomeOnce() {
        if (HOME.loaded) {
            return Promise.resolve(HOME.data);
        }

        if (HOME.loading) {
            return HOME.loading;
        }

        HOME.loading = fetch("data/home.json")
            .then(r => r.json())
            .then(data => {
                HOME.data = data;
                HOME.loaded = true;
                return data;
            })
            .catch(err => {
                console.error("Błąd ładowania home.json:", err);
                HOME.loading = false;
            });

        return HOME.loading;
    }

    // =====================================
    // 2️⃣ INIT HOME (SPA SAFE)
    // =====================================
    function initHomeWhenReady() {

        const root = document.querySelector(".home-page");
        if (!root) {
            requestAnimationFrame(initHomeWhenReady);
            return;
        }

        loadHomeOnce().then(versions => {

            function renderVersionContent() {
                const version = AppState.get() || "pz1pc";
                const data = versions[version];
                if (!data) return;

                // ===== HOME =====
                const title = document.getElementById("home-title");
                const desc = document.getElementById("home-description");
                const imagesContainer = document.getElementById("home-images");
                const imagesContainer2 = document.getElementById("home-images2");
                const content = document.getElementById("home-content");

                if (title) {
                    title.innerHTML = data.home.title;
                    title.classList.add("tytuł");
                }

                if (desc) {
                    desc.innerHTML = data.home.description;
                    desc.classList.add("opis");
                }

                if (imagesContainer) {
                    imagesContainer.innerHTML = "";

                    if (data.home.image) {
                        const images = Array.isArray(data.home.image) ?
                            data.home.image : [data.home.image];

                        images.forEach(src => {
                            const img = document.createElement("img");
                            img.src = src;
                            img.alt = data.home.title;
                            img.classList.add("zdjecie-sg");
                            img.style.width = "20%";
                            img.style.display = "block";
                            img.style.margin = "0.2rem auto";
                            imagesContainer.appendChild(img);
                        });
                    }
                }
                if (imagesContainer2) {
                    imagesContainer2.innerHTML = "";

                    if (data.home.image2) {
                        const images2 = Array.isArray(data.home.image2) ?
                            data.home.image2 : [data.home.image2];

                        images2.forEach(src => {
                            const img = document.createElement("img");
                            img.src = src;
                            img.alt = data.home.title;
                            img.classList.add("zdjecie-sg2");
                            img.style.width = "8%";
                            img.style.margin = "0 0 0 2rem";
                            imagesContainer2.appendChild(img);
                        });
                    }
                }
                // ===== SEKCJE =====
                content.innerHTML = "";

                if (Array.isArray(data.home.sections)) {
                    data.home.sections.forEach(section => {

                        if (section.type === "text") {
                            const p = document.createElement("p");
                            p.classList.add("tekst");
                            p.innerHTML = section.content;
                            content.appendChild(p);
                        }

                        if (section.type === "description") {
                            const p = document.createElement("p");
                            p.classList.add("opis");
                            p.innerHTML = section.content;
                            content.appendChild(p);
                        }

                        if (section.type === "text-row") {
                            const row = document.createElement("div");
                            row.classList.add("home-text-row");

                            // Tablica, w której tymczasowo zapamiętamy stworzone karty dla tej sekcji
                            const stworzoneKartywSeksji = [];

                            section.contents.forEach(tb => {
                                const d = document.createElement("div");
                                d.classList.add("tekst-karta");

                                // Style bazowe dla karty
                                d.style.position = "relative";
                                d.style.padding = "2rem";
                                d.style.borderRadius = "8px";
                                d.style.overflow = "hidden";
                                d.style.display = "flex";
                                d.style.flexDirection = "column";
                                d.style.minHeight = "180px";

                                // KONTENER NA ZDJĘCIE W TLE
                                if (tb.bgImage) {
                                    const bgWrapper = document.createElement("div");
                                    bgWrapper.classList.add("bg-photo");
                                    bgWrapper.style.position = "absolute";
                                    bgWrapper.style.top = "0";
                                    bgWrapper.style.left = "0";
                                    bgWrapper.style.width = "100%";
                                    bgWrapper.style.height = "100%";
                                    bgWrapper.style.backgroundImage = `url('${tb.bgImage}')`;
                                    bgWrapper.style.backgroundSize = "cover";
                                    bgWrapper.style.backgroundPosition = "right center";
                                    bgWrapper.style.backgroundRepeat = "no-repeat";
                                    bgWrapper.style.zIndex = "1";

                                    const maskStyle = `linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,var(--left-alpha)) 100%)`;
                                    bgWrapper.style.webkitMaskImage = maskStyle;
                                    bgWrapper.style.maskImage = maskStyle;

                                    d.appendChild(bgWrapper);
                                }

                                // KONTENER NA TREŚĆ
                                const contentWrapper = document.createElement("div");
                                contentWrapper.classList.add("card-content");
                                contentWrapper.style.position = "relative";
                                contentWrapper.style.zIndex = "2";
                                contentWrapper.style.textAlign = "left";

                                const headerContainer = document.createElement("div");
                                headerContainer.style.display = "flex";
                                headerContainer.style.alignItems = "center";
                                headerContainer.style.gap = "0.75rem";
                                headerContainer.style.marginBottom = "0.75rem";

                                if (tb.icon) {
                                    const iconImg = document.createElement("img");
                                    iconImg.src = tb.icon;
                                    iconImg.style.width = "28px";
                                    iconImg.style.height = "28px";
                                    iconImg.style.objectFit = "contain";
                                    headerContainer.appendChild(iconImg);
                                }

                                const tempDiv = document.createElement("div");
                                tempDiv.innerHTML = tb.content;

                                const naglowekEl = tempDiv.querySelector(".naglowek");
                                if (naglowekEl) {
                                    headerContainer.appendChild(naglowekEl);
                                    contentWrapper.appendChild(headerContainer);

                                    const textContent = document.createElement("div");
                                    textContent.classList.add("tekst");
                                    textContent.innerHTML = tempDiv.innerHTML.replace(/^<br\s*\/?>/i, "");
                                    contentWrapper.appendChild(textContent);
                                } else {
                                    contentWrapper.innerHTML = tb.content;
                                }

                                d.appendChild(contentWrapper);
                                addNonBreakingSpaces(d);
                                row.appendChild(d);

                                // Pushujemy kartę do naszej tablicy przed dodaniem do wiersza
                                stworzoneKartywSeksji.push(d);
                            });

                            content.appendChild(row);

                            // 🔥 TUTAJ ROZPOCZYNA SIĘ OBSŁUGA OBSERVERA DLA WYRENDEROWANYCH KART
                            const cardObserver = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        entry.target.classList.add("visible");
                                        obs.unobserve(entry.target); // Przestań obserwować po aktywacji
                                    }
                                });
                            }, { threshold: 0.15 });

                            // Podpinamy nowo utworzone karty do obserwatora
                            stworzoneKartywSeksji.forEach(karta => cardObserver.observe(karta));
                        }

                        // === SEKCJA: SEPARATOR ===
                        if (section.type === "separator") {
                            const sepContainer = document.createElement("div");
                            sepContainer.classList.add("kreatywny-separator");

                            const spanText = document.createElement("span");
                            spanText.classList.add("separator-tekst");
                            spanText.textContent = section.title;

                            sepContainer.appendChild(spanText);
                            content.appendChild(sepContainer);
                        }

                        // === SEKCJA: TRYBY GRY (GAME MODES) ===
                        if (section.type === "game-modes" && Array.isArray(section.cards)) {
                            const container = document.createElement("div");
                            container.classList.add("game-modes-container");

                            // Tablica na wiersze, które będziemy animować
                            const stworzoneWierszeModes = [];

                            section.cards.forEach(card => {
                                const row = document.createElement("div");
                                row.classList.add("mode-row");

                                if (card.bgImage) {
                                    const bg = document.createElement("div");
                                    bg.classList.add("mode-bg");
                                    bg.style.backgroundImage = `url('${card.bgImage}')`;
                                    row.appendChild(bg);
                                }

                                const box = document.createElement("div");
                                box.classList.add("mode-box");

                                if (card.icon) {
                                    const iconCircle = document.createElement("div");
                                    iconCircle.classList.add("mode-icon-circle");

                                    const img = document.createElement("img");
                                    img.src = card.icon;
                                    img.alt = card.title || "Ikona trybu";

                                    iconCircle.appendChild(img);
                                    box.appendChild(iconCircle);
                                }

                                if (card.title) {
                                    const title = document.createElement("div");
                                    title.classList.add("mode-title");
                                    title.textContent = card.title;
                                    box.appendChild(title);
                                }

                                if (card.text) {
                                    const textEl = document.createElement("div");
                                    textEl.classList.add("mode-text");
                                    textEl.innerHTML = card.text;
                                    box.appendChild(textEl);
                                }

                                if (Array.isArray(card.features) && card.features.length > 0) {
                                    const ul = document.createElement("ul");
                                    ul.classList.add("mode-list");

                                    card.features.forEach(feat => {
                                        const li = document.createElement("li");
                                        li.innerHTML = feat;
                                        ul.appendChild(li);
                                    });

                                    box.appendChild(ul);
                                }

                                row.appendChild(box);
                                container.appendChild(row);

                                // Zapisujemy wiersz do późniejszego oznaczania przez Observer
                                stworzoneWierszeModes.push(row);
                            });

                            content.appendChild(container);

                            // 🔥 OBSERVER DLA TRYBÓW GRY
                            const modesObserver = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        // Dodajemy klasę aktywującą animację do całego wiersza
                                        entry.target.classList.add("animate-in");
                                        obs.unobserve(entry.target);
                                    }
                                });
                            }, { threshold: 0.15 });

                            // Rejestrujemy każdy wiersz w obserwatorze
                            stworzoneWierszeModes.forEach(row => modesObserver.observe(row));
                        }

                        // === SEKCJA: KARTY Z WIELKIM KONTUREM ===
                        // === SEKCJA: KARTY Z WIELKIM KONTUREM ===
                        if (section.type === "centered-outline-modes" && Array.isArray(section.cards)) {
                            const container = document.createElement("div");
                            container.classList.add("outline-modes-container");

                            // Tablica, w której zapamiętamy karty do zaanimowania
                            const stworzoneKartyOutline = [];

                            section.cards.forEach(card => {
                                const cardEl = document.createElement("div");
                                cardEl.classList.add("outline-card");

                                if (card.bgImage) {
                                    const bg = document.createElement("div");
                                    bg.classList.add("card-bg");
                                    bg.style.backgroundImage = `url('${card.bgImage}')`;
                                    cardEl.appendChild(bg);
                                }

                                if (card.title) {
                                    const titleEl = document.createElement("h2");
                                    titleEl.classList.add("card-outline-title");
                                    titleEl.textContent = card.title;
                                    cardEl.appendChild(titleEl);
                                }

                                if (card.text) {
                                    const bottomBox = document.createElement("div");
                                    bottomBox.classList.add("card-bottom-box");

                                    const textEl = document.createElement("div");
                                    textEl.classList.add("card-bottom-text");
                                    textEl.innerHTML = card.text;

                                    bottomBox.appendChild(textEl);
                                    cardEl.appendChild(bottomBox);
                                }

                                container.appendChild(cardEl);

                                // Zapisujemy kartę do tablicy animacji
                                stworzoneKartyOutline.push(cardEl);
                            });

                            content.appendChild(container);

                            // 🔥 NOWY OBSERVER DLA KART OUTLINE (Pojawianie się przy przewijaniu)
                            const outlineObserver = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        entry.target.classList.add("animate-in");
                                        obs.unobserve(entry.target); // Animuj tylko raz
                                    }
                                });
                            }, { threshold: 0.15 });

                            // Rejestrujemy każdą kartę w obserwatorze
                            stworzoneKartyOutline.forEach(card => outlineObserver.observe(card));
                        }

                        // === SEKCJA: NOWY TRYB (NEWS PO PRAWEJ Z KONTUREM) ===
                        // === SEKCJA: NOWY TRYB (NEWS PO PRAWEJ Z KONTUREM) ===
                        if (section.type === "right-news-modes" && Array.isArray(section.cards)) {
                            const container = document.createElement("div");
                            container.classList.add("right-news-container");

                            // Tablica, w której zapamiętamy wiersze do zaanimowania
                            const stworzoneWierszeRightNews = [];

                            section.cards.forEach(card => {
                                const row = document.createElement("div");
                                row.classList.add("right-news-row");

                                if (card.bgImage) {
                                    const bg = document.createElement("div");
                                    bg.classList.add("right-news-bg");
                                    bg.style.backgroundImage = `url('${card.bgImage}')`;
                                    row.appendChild(bg);
                                }

                                const box = document.createElement("div");
                                box.classList.add("right-news-box");

                                // Przezroczysty nagłówek z konturem
                                if (card.title) {
                                    const titleEl = document.createElement("h2");
                                    titleEl.classList.add("right-news-outline-title");
                                    titleEl.textContent = card.title;
                                    box.appendChild(titleEl);
                                }

                                // Słowo nowość
                                const badge = document.createElement("div");
                                badge.classList.add("right-news-badge");
                                badge.textContent = "Nowość";
                                box.appendChild(badge);

                                // Blok z tekstem
                                if (card.text) {
                                    const textEl = document.createElement("div");
                                    textEl.classList.add("right-news-text");
                                    textEl.innerHTML = card.text;
                                    box.appendChild(textEl);
                                }

                                row.appendChild(box);
                                container.appendChild(row);

                                // Zapisujemy wiersz do późniejszego animowania
                                stworzoneWierszeRightNews.push(row);
                            });

                            content.appendChild(container);

                            // 🔥 NOWY OBSERVER DLA RIGHT-NEWS
                            const rightNewsObserver = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        entry.target.classList.add("animate-in");
                                        obs.unobserve(entry.target); // Animuj tylko raz
                                    }
                                });
                            }, { threshold: 0.15 });

                            // Podpinamy każdy wiersz pod obserwator
                            stworzoneWierszeRightNews.forEach(row => rightNewsObserver.observe(row));
                        }

                        // === SEKCJA: PRZEPLATANE MEGA-FEATURES + NEWS-MODES ===
                        if (section.type === "mega-features") {
                            const featuresCards = section.cards || [];

                            // Pobieramy sekcję news-modes z całego pliku JSON dla bieżącej wersji
                            const newsSection = data.home.sections.find(s => s.type === "news-modes");
                            const newsCards = newsSection ? newsSection.cards : [];

                            const maxLength = Math.max(featuresCards.length, newsCards.length);

                            // Licznik wyrenderowanych newsów, aby wiedzieć, który z kolei jest parzysty/nieparzysty
                            let newsCounter = 0;

                            for (let i = 0; i < maxLength; i++) {

                                // 🌟 1. GENEROWANIE POJEDYNCZEJ KARTY MEGA-FEATURES
                                // 🌟 1. GENEROWANIE POJEDYNCZEJ KARTY MEGA-FEATURES
                                if (featuresCards[i]) {
                                    const card = featuresCards[i];

                                    const mainGrid = document.createElement("div");
                                    mainGrid.classList.add("mega-features-grid");

                                    const featureCol = document.createElement("div");
                                    featureCol.classList.add("feature-column");

                                    // Kontener na główne tło (Zdjęcie lub MP4)
                                    const mediaContainer = document.createElement("div");
                                    mediaContainer.classList.add("feature-media-container");

                                    if (card.bgImage) {
                                        if (card.bgImage.endsWith('.mp4')) {
                                            const bgVideo = document.createElement("video");
                                            bgVideo.classList.add("feature-bg-video");
                                            bgVideo.src = card.bgImage;
                                            bgVideo.autoplay = true;
                                            bgVideo.loop = true;
                                            bgVideo.muted = true;
                                            bgVideo.playsInline = true;
                                            mediaContainer.appendChild(bgVideo);
                                        } else {
                                            mediaContainer.style.backgroundImage = `url('${card.bgImage}')`;
                                        }
                                    }

                                    // Ikona na dole tła
                                    if (card.icon) {
                                        const iconBox = document.createElement("div");
                                        iconBox.classList.add("feature-icon-box");
                                        const iconImg = document.createElement("img");
                                        iconImg.src = card.icon;
                                        iconImg.alt = card.title || "Ikona";
                                        iconBox.appendChild(iconImg);
                                        mediaContainer.appendChild(iconBox);
                                    }
                                    featureCol.appendChild(mediaContainer);

                                    // Główny nagłówek i tekst
                                    if (card.title) {
                                        const titleEl = document.createElement("h3");
                                        titleEl.classList.add("feature-main-title");
                                        titleEl.textContent = card.title;
                                        featureCol.appendChild(titleEl);
                                    }
                                    if (card.text) {
                                        const textEl = document.createElement("p");
                                        textEl.classList.add("feature-main-text");
                                        textEl.innerHTML = card.text;
                                        featureCol.appendChild(textEl);
                                    }

                                    // Tablica na małe elementy pod-siatki (sub-items)
                                    const stworzoneSubItems = [];

                                    // Pod-sekcja 3 elementów (W tym nasz suwak)
                                    if (Array.isArray(card.subItems) && card.subItems.length > 0) {
                                        const subGrid = document.createElement("div");
                                        subGrid.classList.add("feature-sub-grid");

                                        card.subItems.forEach((sub, index) => {
                                            const subItem = document.createElement("div");
                                            subItem.classList.add("feature-sub-item");

                                            // 🔥 EFEKT KASKADY: Każdy kolejny kafelek ma większe opóźnienie (np. 0s, 0.15s, 0.3s)
                                            subItem.style.transitionDelay = `${index * 0.15}s`;

                                            if (sub.media) {
                                                // Suwak pór roku (Dwa nieruchome zdjęcia)
                                                if (Array.isArray(sub.media) && sub.media.length >= 2) {
                                                    const sliderWrapper = document.createElement("div");
                                                    sliderWrapper.classList.add("image-slider-wrapper");

                                                    const imgUnder = document.createElement("img");
                                                    imgUnder.src = sub.media[1];
                                                    imgUnder.classList.add("slider-img", "img-under");

                                                    const imgOverContainer = document.createElement("div");
                                                    imgOverContainer.classList.add("img-over-container");

                                                    const imgOver = document.createElement("img");
                                                    imgOver.src = sub.media[0];
                                                    imgOver.classList.add("slider-img", "img-over");

                                                    imgOverContainer.appendChild(imgOver);

                                                    const rangeInput = document.createElement("input");
                                                    rangeInput.type = "range";
                                                    rangeInput.min = "0";
                                                    rangeInput.max = "100";
                                                    rangeInput.value = "50";
                                                    rangeInput.classList.add("slider-input");

                                                    const sliderLine = document.createElement("div");
                                                    sliderLine.classList.add("slider-line");
                                                    const sliderButton = document.createElement("div");
                                                    sliderButton.classList.add("slider-button");
                                                    sliderLine.appendChild(sliderButton);

                                                    rangeInput.addEventListener("input", (e) => {
                                                        const value = e.target.value;
                                                        imgOverContainer.style.width = `${value}%`;
                                                        sliderLine.style.left = `${value}%`;
                                                    });

                                                    sliderWrapper.appendChild(imgUnder);
                                                    sliderWrapper.appendChild(imgOverContainer);
                                                    sliderWrapper.appendChild(rangeInput);
                                                    sliderWrapper.appendChild(sliderLine);
                                                    subItem.appendChild(sliderWrapper);
                                                }
                                                // Zapętlony plik MP4
                                                else if (typeof sub.media === "string" && sub.media.endsWith('.mp4')) {
                                                    const videoEl = document.createElement("video");
                                                    videoEl.classList.add("feature-sub-media");
                                                    videoEl.src = sub.media;
                                                    videoEl.autoplay = true;
                                                    videoEl.loop = true;
                                                    videoEl.muted = true;
                                                    videoEl.playsInline = true;
                                                    subItem.appendChild(videoEl);
                                                }
                                                // Zwykłe zdjęcie
                                                else if (typeof sub.media === "string") {
                                                    const imgEl = document.createElement("img");
                                                    imgEl.classList.add("feature-sub-media");
                                                    imgEl.src = sub.media;
                                                    subItem.appendChild(imgEl);
                                                }
                                            }

                                            if (sub.title) {
                                                const subTitle = document.createElement("h4");
                                                subTitle.classList.add("feature-sub-title");
                                                subTitle.textContent = sub.title;
                                                subItem.appendChild(subTitle);
                                            }
                                            if (sub.text) {
                                                const subText = document.createElement("p");
                                                subText.classList.add("feature-sub-text");
                                                subText.innerHTML = sub.text;
                                                subItem.appendChild(subText);
                                            }

                                            subGrid.appendChild(subItem);

                                            // Zapamiętujemy małą kartę do animacji
                                            stworzoneSubItems.push(subItem);
                                        });

                                        featureCol.appendChild(subGrid);
                                    }

                                    mainGrid.appendChild(featureCol);
                                    content.appendChild(mainGrid);

                                    // 🔥 OBSERWER DLA SEKCJI MEGA-FEATURES (GŁÓWNY ELEMENT I POD-SIATKA)
                                    const megaObserver = new IntersectionObserver((entries, obs) => {
                                        entries.forEach(entry => {
                                            if (entry.isIntersecting) {
                                                entry.target.classList.add("animate-in");
                                                obs.unobserve(entry.target);
                                            }
                                        });
                                    }, { threshold: 0.1 });

                                    // Obserwujemy całą kolumnę (aby odpalić animację nagłówka i dużego zdjęcia)
                                    megaObserver.observe(featureCol);

                                    // Obserwujemy każdą małą pod-kartę z osobna (efekt płynnego pojawiania się jak wcześniej)
                                    stworzoneSubItems.forEach(subItem => megaObserver.observe(subItem));
                                }

                                // 🌟 2. GENEROWANIE POJEDYNCZEJ KARTY NEWS-MODES
                                // 🌟 2. GENEROWANIE POJEDYNCZEJ KARTY NEWS-MODES
                                if (newsCards[i]) {
                                    const newsCard = newsCards[i];
                                    newsCounter++; // 1, 2, 3...

                                    const container = document.createElement("div");
                                    container.classList.add("news-modes-container");
                                    container.style.marginTop = "3rem";
                                    container.style.marginBottom = "3rem";

                                    const row = document.createElement("div");
                                    row.classList.add("news-row");

                                    // Budujemy elementy wewnętrzne
                                    const box = document.createElement("div");
                                    box.classList.add("news-box");

                                    const badge = document.createElement("div");
                                    badge.classList.add("news-badge");
                                    badge.textContent = "Nowość";
                                    box.appendChild(badge);

                                    if (newsCard.title) {
                                        const title = document.createElement("div");
                                        title.classList.add("news-title");
                                        title.textContent = newsCard.title;
                                        box.appendChild(title);
                                    }

                                    if (newsCard.subtitle) {
                                        const subtitle = document.createElement("div");
                                        subtitle.classList.add("news-subtitle");
                                        subtitle.textContent = newsCard.subtitle;
                                        box.appendChild(subtitle);
                                    }

                                    if (newsCard.text) {
                                        const textEl = document.createElement("div");
                                        textEl.classList.add("news-text");
                                        textEl.innerHTML = newsCard.text;
                                        box.appendChild(textEl);
                                    }

                                    let bg = null;
                                    if (newsCard.bgImage) {
                                        bg = document.createElement("div");
                                        bg.classList.add("news-bg");
                                        bg.style.backgroundImage = `url('${newsCard.bgImage}')`;
                                    }

                                    // 🌟 ODWROTNY UKŁAD DLA CO DRUGIEGO ELEMENTU
                                    if (newsCounter % 2 === 0) {
                                        row.classList.add("news-row-even");

                                        box.style.marginLeft = "auto";
                                        // Poprawka drobnego błędu ze starego kodu (dodano jednostkę px)
                                        box.style.marginRight = "48px";

                                        if (bg) row.appendChild(bg);
                                        row.appendChild(box);
                                    } else {
                                        if (bg) row.appendChild(bg);
                                        row.appendChild(box);
                                    }

                                    container.appendChild(row);
                                    content.appendChild(container);

                                    // 🔥 OBSERVER DLA NEWSÓW
                                    const newsObserver = new IntersectionObserver((entries, obs) => {
                                        entries.forEach(entry => {
                                            if (entry.isIntersecting) {
                                                entry.target.classList.add("animate-in");
                                                obs.unobserve(entry.target);
                                            }
                                        });
                                    }, { threshold: 0.15 });

                                    // Rejestrujemy wiersz w obserwatorze
                                    newsObserver.observe(row);
                                }
                            }
                        }

                        // Ignorujemy samodzielną pętlę dla news-modes, ponieważ jej karty zostały wciągnięte wyżej
                        if (section.type === "news-modes") {
                            return;
                        }

                        // === SEKCJA: INTERAKTYWNE MOTYWY (THEMES) ===
                        if (section.type === "themes" && Array.isArray(section.items)) {
                            const container = document.createElement("div");
                            container.classList.add("themes-section-container");

                            // Nagłówek i opis sekcji motywów
                            if (section.title) {
                                const t = document.createElement("h2");
                                t.classList.add("tytuł");
                                t.textContent = section.title;
                                container.appendChild(t);
                            }
                            if (section.description) {
                                const d = document.createElement("p");
                                d.classList.add("opis");
                                d.innerHTML = section.description;
                                container.appendChild(d);
                            }

                            // Główny kontener na kolumny flex
                            const flexWrapper = document.createElement("div");
                            flexWrapper.classList.add("themes-flex-wrapper");

                            section.items.forEach((item, index) => {
                                const card = document.createElement("div");
                                card.classList.add("theme-card");
                                if (index === 0) card.classList.add("active"); // Pierwszy motyw domyślnie aktywny

                                // Zdjęcie w tle
                                if (item.bgImage) {
                                    card.style.backgroundImage = `url('${item.bgImage}')`;
                                }

                                // Podpis boczny
                                const label = document.createElement("div");
                                label.classList.add("theme-label");
                                label.textContent = item.name;
                                card.appendChild(label);

                                // Kontener z treścią widoczną po rozszerzeniu karty
                                const contentBox = document.createElement("div");
                                contentBox.classList.add("theme-card-content");

                                const title = document.createElement("h3");
                                title.classList.add("theme-card-title");
                                title.textContent = item.name;

                                const text = document.createElement("p");
                                text.classList.add("theme-card-text");
                                text.innerHTML = item.text;

                                contentBox.appendChild(title);
                                contentBox.appendChild(text);
                                card.appendChild(contentBox);

                                // Logika kliknięcia
                                card.addEventListener("click", () => {
                                    const allCards = flexWrapper.querySelectorAll(".theme-card");
                                    allCards.forEach(c => c.classList.remove("active"));
                                    card.classList.add("active");
                                });

                                flexWrapper.appendChild(card);
                            });

                            container.appendChild(flexWrapper);
                            content.appendChild(container); // Wrzucenie sekcji do dokumentu

                            // 🔥 NOWY KOD: PODPIĘCIE ANIMACJI INTERSECTION OBSERVER DLA NOWO WYRENDEROWANEJ SEKCJI MOTYWÓW
                            const themesObserver = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        entry.target.classList.add("animate-in");
                                        obs.unobserve(entry.target); // Animacja wykona się tylko raz
                                    }
                                });
                            }, { threshold: 0.15 });

                            // Rozpoczynamy obserwowanie świeżo dodanego kontenera
                            themesObserver.observe(container);
                        }

                        if (section.type === "video") {
                            const fig = document.createElement("figure");
                            fig.classList.add("home-video");

                            const iframe = document.createElement("iframe");
                            iframe.src = section.url;
                            iframe.allowFullscreen = true;

                            const cap = document.createElement("figcaption");
                            cap.textContent = section.caption;

                            fig.appendChild(iframe);
                            fig.appendChild(cap);
                            content.appendChild(fig);
                        }

                        if (section.type === "gallery") {
                            const g = document.createElement("div");
                            g.classList.add("home-gallery");

                            section.images.forEach((src, i) => {
                                const img = document.createElement("img");
                                img.src = src;
                                img.style.cursor = "pointer";
                                img.onclick = () =>
                                    window.openGallery(i, section.images);
                                g.appendChild(img);
                            });

                            content.appendChild(g);
                        }

                    });

                    addNonBreakingSpaces(content);
                }

                addNonBreakingSpaces(root);
            }

            // 🔥 START
            renderVersionContent();

            // 🔁 Zawsze zgodnie z AppState
            window.addEventListener("versionChanged", renderVersionContent);
            window.addEventListener("storage", e => {
                if (e.key === AppState.key) renderVersionContent();
            });
        });
    }

    initHomeWhenReady();

})();

document.addEventListener('DOMContentLoaded', () => {
    const initSlider = (wrapper) => {
        const input = wrapper.querySelector('.slider-input');
        const containerOver = wrapper.querySelector('.img-over-container');
        const imgOver = wrapper.querySelector('.img-over');
        const line = wrapper.querySelector('.slider-line');
        const button = wrapper.querySelector('.slider-button'); // Obsługa ruchu przycisku

        if (!input || !containerOver || !imgOver) return;

        // Funkcja, która idealnie blokuje szerokość zdjęcia na wymiarze całego suwaka
        const syncImageWidth = () => {
            const rect = wrapper.getBoundingClientRect();
            // Przypisujemy pełną, realną szerokość wrappera bezpośrednio do zdjęcia wewnątrz maski
            imgOver.style.width = `${rect.width}px`;
        };

        // Wywołanie natychmiastowe przy inicjalizacji
        syncImageWidth();

        // Główna funkcja aktualizująca stan suwaka na podstawie wartości inputa (0-100)
        const updateSliderPosition = () => {
            const value = input.value + '%';

            // Zmieniamy tylko szerokość kontenera maskującego (to tworzy efekt ucinania)
            containerOver.style.width = value;

            // Przesuwamy linię oraz koło z przyciskami
            if (line) line.style.left = value;
            if (button) button.style.left = value;

            // Ponownie upewniamy się, że zdjęcie nie drgnęło
            syncImageWidth();
        };

        // Reagowanie na ruch suwaka (input działa na żywo, change to zabezpieczenie)
        input.addEventListener('input', updateSliderPosition);
        input.addEventListener('change', updateSliderPosition);

        // Kluczowe dla telefonów: aktualizacja przy zmianie orientacji/rozmiaru ekranu
        window.addEventListener('resize', syncImageWidth);

        // Zabezpieczenie dla animacji IntersectionObserver i renderowania SPA
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => syncImageWidth());
            ro.observe(wrapper);
        }
    };

    // Obsługa elementów istniejących w statycznym kodzie HTML
    document.querySelectorAll('.image-slider-wrapper').forEach(initSlider);

    // Dynamiczny obserwator dla frameworków / rozwiązań SPA generujących widoki w locie
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList.contains('image-slider-wrapper')) {
                        initSlider(node);
                    }
                    node.querySelectorAll('.image-slider-wrapper').forEach(initSlider);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});