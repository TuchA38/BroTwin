let WORLD_SVG = null;

async function loadWorldSVG() {
    if (WORLD_SVG) return WORLD_SVG;

    const res = await fetch("https://res.cloudinary.com/ddqbmcmoe/image/upload/v1773593500/world_exgcxc.svg");
    WORLD_SVG = await res.text();
    return WORLD_SVG;
}

const COUNTRY_MAP = {
    "Afganistan": { id: "AF" },
    "Angola": { class: "Angola" },
    "Albania": { id: "AL" },
    "Zjednoczone Emiraty Arabskie": { id: "AE" },
    "Argentyna": { class: "Argentina" },
    "ARG1": { id: "ARG1" },
    "Armenia": { id: "AM" },
    "Australia": { class: "Australia" },
    "Australia1": { id: "Australia1" },
    "Australia2": { id: "Australia2" },
    "Australia3": { id: "Australia3" },
    "Australia4": { id: "Australia4" },
    "Australia5": { id: "Australia5" },
    "Australia6": { id: "Australia6" },
    "Australia7": { id: "Australia7" },
    "Austria": { id: "AT" },
    "Azerbejdżan": { class: "Azerbaijan" },
    "Burundi": { id: "BI" },
    "Belgia": { id: "BE" },
    "Benin": { id: "BJ" },
    "Burkina Faso": { id: "BF" },
    "Bangladesz": { id: "BD" },
    "Bułgaria": { id: "BG" },
    "Bośnia i Hercegowina": { id: "BA" },
    "Białoruś": { id: "BY" },
    "Belize": { id: "BZ" },
    "Boliwia": { id: "BO" },
    "Brazylia": { id: "BR" },
    "Brunei": { id: "BN" },
    "Bhutan": { id: "BT" },
    "Botswana": { id: "BW" },
    "Republika Środkowoafrykańska": { id: "CF" },
    "Kanada": { class: "Canada" },
    "CA1": { id: "CA1" },
    "CA2": { id: "CA2" },
    "CA4": { id: "CA4" },
    "CA11": { id: "CA11" },
    "Szwajcaria": { id: "CH" },
    "Chiny": { class: "China" },
    "Wybrzeże Kości Słoniowej": { id: "CI" },
    "Kamerun": { id: "CM" },
    "Demokratyczna Republika Konga": { id: "CD" },
    "Kongo": { id: "CG" },
    "Kolumbia": { id: "CO" },
    "Kostaryka": { id: "CR" },
    "Kuba": { id: "CU" },
    "Czechy": { id: "CZ" },
    "Niemcy": { id: "DE" },
    "Dżibuti": { id: "DJ" },
    "Dania": { class: "Denmark" },
    "Dominikana": { id: "DO" },
    "Algieria": { id: "DZ" },
    "Ekwador": { id: "EC" },
    "Egipt": { id: "EG" },
    "Erytrea": { id: "ER" },
    "Estonia": { id: "EE" },
    "Etiopia": { id: "ET" },
    "Finlandia": { id: "FI" },
    "Gabon": { id: "GA" },
    "Wielka Brytania": { class: "Kingdom" },
    "Gruzja": { id: "GE" },
    "Ghana": { id: "GH" },
    "Gwinea": { id: "GN" },
    "Gambia": { id: "GM" },
    "Gwinea Bissau": { id: "GW" },
    "Gwinea Równikowa": { id: "GQ" },
    "Grecja": { class: "Greece" },
    "Grenlandia": { id: "GL" },
    "Gwatemala": { id: "GT" },
    "Gujana": { id: "GY" },
    "Honduras": { id: "HN" },
    "Chorwacja": { id: "HR" },
    "Haiti": { id: "HT" },
    "Węgry": { id: "HU" },
    "Indonezja": { class: "Indonesia" },
    "Indonezja6": { id: "Indonezja6" },
    "Indonezja8": { id: "Indonezja8" },
    "Indonezja9": { id: "Indonezja9" },
    "Indie": { id: "IN" },
    "Irlandia": { id: "IE" },
    "Iran": { id: "IR" },
    "Irak": { id: "IQ" },
    "Islandia": { id: "IS" },
    "Izrael": { id: "IL" },
    "Włochy": { class: "Italy" },
    "Jamajka": { id: "JM" },
    "Jordania": { id: "JO" },
    "Japonia": { class: "Japan" },
    "Kazachstan": { id: "KZ" },
    "Kenia": { id: "KE" },
    "Kirgistan": { id: "KG" },
    "Kambodża": { id: "KH" },
    "Korea Południowa": { id: "KR" },
    "Kuwejt": { id: "KW" },
    "Laos": { id: "LA" },
    "Liban": { id: "LB" },
    "Liberia": { id: "LR" },
    "Libia": { id: "LY" },
    "Sri Lanka": { id: "LK" },
    "Lesotho": { id: "LS" },
    "Litwa": { id: "LT" },
    "Luksemburg": { id: "LU" },
    "Łotwa": { id: "LV" },
    "Maroko": { id: "MA" },
    "Mołdawia": { id: "MD" },
    "Madagaskar": { id: "MG" },
    "Meksyk": { id: "MX" },
    "Xochimilco": { id: "Xochimilco" },
    "Macedonia Północna": { id: "MK" },
    "Mali": { id: "ML" },
    "Mjanma": { id: "MM" },
    "Czarnogóra": { id: "ME" },
    "Mongolia": { id: "MN" },
    "Mozambik": { id: "MZ" },
    "Mauretania": { id: "MR" },
    "Malawi": { id: "MW" },
    "Malezja": { class: "Malaysia" },
    "Namibia": { id: "NA" },
    "Niger": { id: "NE" },
    "Nigeria": { id: "NG" },
    "Nikaragua": { id: "NI" },
    "Norwegia": { class: "Norway" },
    "NO1": { id: "NO1" },
    "Nepal": { id: "NP" },
    "Oman": { class: "Oman" },
    "Pakistan": { id: "PK" },
    "Panama": { id: "PA" },
    "Peru": { id: "PE" },
    "Filipiny": { class: "Philippines" },
    "Papua-Nowa Gwinea": { class: "Papua" },
    "Polska": { id: "PL" },
    "Korea Północna": { id: "KP" },
    "Paragwaj": { id: "PY" },
    "Palestyna": { id: "PS" },
    "Katar": { id: "QA" },
    "Rumunia": { id: "RO" },
    "Rwanda": { id: "RW" },
    "Sahara Zachodnia": { id: "EH" },
    "Arabia Saudyjska": { id: "SA" },
    "Sudan": { id: "SD" },
    "Sudan Południowy": { id: "SS" },
    "Senegal": { id: "SN" },
    "Sierra Leone": { id: "SL" },
    "Salwador": { id: "SV" },
    "Serbia": { id: "RS" },
    "Surinam": { id: "SR" },
    "Słowacja": { id: "SK" },
    "Słowenia": { id: "SI" },
    "Szwecja": { id: "SE" },
    "Eswatini": { id: "SZ" },
    "Syria": { id: "SY" },
    "Czad": { id: "TD" },
    "Togo": { id: "TG" },
    "Tajlandia": { id: "TH" },
    "Tadżykistan": { id: "TJ" },
    "Turkmenistan": { id: "TM" },
    "Timor Wschodni": { id: "TL" },
    "Tunezja": { id: "TN" },
    "Turcja": { class: "Turkey" },
    "Tajwan": { id: "TW" },
    "Tanzania": { id: "TZ" },
    "Uganda": { id: "UG" },
    "Ukraina": { id: "UA" },
    "Urugwaj": { id: "UY" },
    "Uzbekistan": { id: "UZ" },
    "Wenezuela": { id: "VE" },
    "Wietnam": { id: "VN" },
    "Jemen": { id: "YE" },
    "Zambia": { id: "ZM" },
    "Zimbabwe": { id: "ZW" },
    "Somalia": { id: "SO" },
    "Kosowo": { id: "XK" },
    "Republika Południowej Afryki": { id: "ZA" },
    "Nowa Zelandia": { class: "Zealand" },
    "Chile": { class: "Chile" },
    "CHI1": { id: "CHI1" },
    "Holandia": { id: "NL" },
    "Portugalia": { id: "PT" },
    "Rosja": { class: "Russian" },
    "Hiszpania": { id: "ES" },
    "Francja": { class: "France" },
    "FR2": { id: "FR2" },
    "Stany Zjednoczone": { class: "States" },
    "USA6": { id: "USA6" },
    "USA7": { id: "USA7" },
    "US-MX": { id: "US-MX" },
    "Gujana Francuska": { id: "GF" },
    "Aruba": { id: "AW" },
    "Anguilla": { id: "AI" },
    "Samoa Amerykańskie": { class: "Samoa" },
    "Antigua i Barbuda": { class: "Antigua" },
    "Bahrajn": { id: "BH" },
    "Bahamy": { class: "Bahamas" },
    "Saint-Barthélemy": { id: "BL" },
    "Bermudy": { id: "BM" },
    "Barbados": { id: "BB" },
    "Komory": { class: "Comoros" },
    "Wyspy Zielonego Przylądka": { class: "Verde" },
    "Curaçao": { id: "CW" },
    "Kajmany": { class: "Cayman" },
    "Cypr": { class: "Cyprus" },
    "Dominika": { id: "DM" },
    "Falklandy": { class: "Falkland" },
    "Wyspy Owcze": { class: "Faeroe" },
    "Mikronezja": { class: "Micronesia" },
    "Grenada": { id: "GD" },
    "Guam": { id: "GU" },
    "Saint Kitts i Nevis": { class: "Nevis" },
    "Saint Lucia": { id: "LC" },
    "Saint Martin": { id: "MF" },
    "Malediwy": { id: "MV" },
    "Wyspy Marshalla": { id: "MH" },
    "Malta": { class: "Malta" },
    "Mariany Północne": { class: "Mariana" },
    "Montserrat": { id: "MS" },
    "Mauritius": { class: "Mauritius" },
    "Nowa Kaledonia": { class: "Caledonia" },
    "Nauru": { id: "NR" },
    "Palau": { id: "PW" },
    "Portoryko": { class: "Puerto Rico" },
    "Polinezja Francuska": { class: "Polynesia" },
    "Wyspy Salomona": { class: "Solomon" },
    "Wyspy Świętego Tomasza i Książęca": { class: "São Tomé" },
    "Sint Maarten": { id: "SX" },
    "Seszele": { class: "Seychelles" },
    "Turks i Caicos": { class: "Caicos" },
    "Tonga": { class: "Tonga" },
    "Trynidad i Tobago": { class: "Tobago" },
    "Tuvalu": { id: "TV" },
    "Saint Vincent i Grenadyny": { id: "VC" },
    "Brytyjskie Wyspy Dziewicze": { id: "VG" },
    "Wyspy Dziewicze": { class: "Virgin" },
    "Vanuatu": { class: "Vanuatu" },
    "Samoa": { class: "Samoa" },
    "Bonaire": { id: "BQBO" },
    "Sint Eustatius": { id: "BQSE" },
    "Saba": { id: "BQSA" },
    "Martynika": { id: "MQ" },
    "Wyspy Kanaryjskie": { class: "Canary" },
    "Majotta": { id: "YT" },
    "Reunion": { id: "RE" },
    "Gwadelupa": { class: "Guadeloupe" },
    "Fidżi": { class: "Fiji" },
    "Komodo": { id: "KOM" },
    "Borneo": { id: "BOR" },
    "Alaska": { class: "Alaska" },
    "Svalbard": { class: "Svalbard" },
    "Syberia": { class: "Syberia" },
    "Wyspy Galapagos": { class: "Galapagos" },
    "Małe Antyle": { class: "Male-Antyle" },
    "Karaiby": { class: "Male-Antyle Bahamas Trinidad Tobago Antigua Barbuda Saint Kitts Nevis Puerto Rico", id: "BB DM CU HT DO JM VC GD LC" },
    "Antarktyda": { class: "Antarctica" },
};

async function renderWorldMap(regions = [], mapOptions = {}) {
    const options = {
        land: true,
        water: true,
        highlightLand: true,
        ...mapOptions
    };

    const full = document.getElementById("world-map-full");
    const zoom = document.getElementById("world-map-zoom");

    if (!full || !zoom) return;

    const svgText = await loadWorldSVG();

    // 1️⃣ MAPA PEŁNA
    full.innerHTML = svgText;
    const fullSVG = full.querySelector("svg");

    const activePaths = markRegions(fullSVG, regions, false, options);

    // 2️⃣ MAPA ZOOM
    zoom.innerHTML = svgText;
    const zoomSVG = zoom.querySelector("svg");

    const zoomPaths = markRegions(zoomSVG, regions, true, options);
    zoomToRegions(zoomSVG, zoomPaths);

    // 🔥 NOWE
    drawZoomBox(fullSVG, zoomSVG);
    watchConnector(); // zamiast requestAnimationFrame


}

function ensureConnectorLine() {
    let tries = 0;

    function attempt() {
        const indicator = document.querySelector("#zoom-indicator");
        const zoomContainer = document.querySelector("#world-map-zoom");

        if (!indicator || !zoomContainer) return;

        const r1 = indicator.getBoundingClientRect();
        const r2 = zoomContainer.getBoundingClientRect();

        // warunek: elementy mają realne rozmiary
        if (r1.width > 5 && r1.height > 5 && r2.width > 5 && r2.height > 5) {
            drawConnectorLine();
        } else if (tries < 20) {
            tries++;
            requestAnimationFrame(attempt);
        }
    }

    attempt();
}


function zoomToRegions(svg, elements) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    if ((maxX - minX) < 20) {
        minX -= 20;
        maxX += 20;
    }
    if ((maxY - minY) < 20) {
        minY -= 20;
        maxY += 20;
    }

    const WATER_STROKE = 20;
    const padding = 1 + WATER_STROKE;

    if (elements.length) {
        // mamy zaznaczone lądy
        elements.forEach(el => {
            const b = el.getBBox();
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.width);
            maxY = Math.max(maxY, b.y + b.height);
        });
    } else {
        // sprawdzamy wodę
        const waterEls = svg.querySelectorAll(".water-layer use");
        if (waterEls.length) {
            waterEls.forEach(el => {
                const b = el.getBBox();
                minX = Math.min(minX, b.x);
                minY = Math.min(minY, b.y);
                maxX = Math.max(maxX, b.x + b.width);
                maxY = Math.max(maxY, b.y + b.height);
            });
        } else {
            // fallback – całe SVG
            const b = svg.getBBox();
            minX = b.x;
            minY = b.y;
            maxX = b.x + b.width;
            maxY = b.y + b.height;
        }
    }

    svg.setAttribute(
        "viewBox",
        `${minX - padding} ${minY - padding} ${(maxX - minX) + padding * 2} ${(maxY - minY) + padding * 2}`
    );
}

function drawZoomBox(fullSVG, zoomSVG) {
    if (!fullSVG || !zoomSVG) return;

    // usuń starą ramkę
    const old = fullSVG.querySelector("#zoom-indicator");
    if (old) old.remove();

    const vb = zoomSVG.viewBox.baseVal;
    if (!vb) return;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("id", "zoom-indicator");
    rect.setAttribute("x", vb.x);
    rect.setAttribute("y", vb.y);
    rect.setAttribute("width", vb.width);
    rect.setAttribute("height", vb.height);

    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", "#ffffff");
    rect.setAttribute("stroke-width", "5");
    rect.setAttribute("pointer-events", "none");
    rect.setAttribute("fill-opacity", "0.1");

    fullSVG.appendChild(rect);
}

function drawConnectorLine() {
    const indicator = document.querySelector("#zoom-indicator");
    const zoomContainer = document.querySelector("#world-map-zoom");
    const layer = document.querySelector("#map-connector-layer");

    if (!indicator || !zoomContainer || !layer) return;

    layer.innerHTML = "";

    const indRect = indicator.getBoundingClientRect();
    const zoomRect = zoomContainer.getBoundingClientRect();
    const parentRect = layer.getBoundingClientRect();

    // START — dół środka ramki
    const startX = indRect.left + indRect.width / 2 - parentRect.left;
    const startY = indRect.bottom - parentRect.top;

    // KONIEC — góra środka zoom
    const endX = zoomRect.left + zoomRect.width / 2 - parentRect.left;
    const endY = zoomRect.top - parentRect.top;

    // Punkt pośredni (kąt prosty)
    const midY = startY + (endY - startY) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    const d = `
        M ${startX} ${startY}
        L ${startX} ${midY}
        L ${endX} ${midY}
        L ${endX} ${endY}
    `;

    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-width", "1");
    path.setAttribute("stroke-linejoin", "round");

    layer.appendChild(path);
}

let connectorObserver;

function watchConnector() {
    const indicator = document.querySelector("#zoom-indicator");
    const zoomContainer = document.querySelector("#world-map-zoom");
    const layer = document.querySelector("#map-connector-layer");

    if (!indicator || !zoomContainer || !layer) return;

    // jeśli był już stary obserwator → odłącz
    if (connectorObserver) connectorObserver.disconnect();

    connectorObserver = new ResizeObserver(() => {
        const r1 = indicator.getBoundingClientRect();
        const r2 = zoomContainer.getBoundingClientRect();

        if (r1.width > 5 && r1.height > 5 && r2.width > 5 && r2.height > 5) {
            drawConnectorLine();
        }
    });

    connectorObserver.observe(indicator);
    connectorObserver.observe(zoomContainer);
}

function markRegions(svg, regions, dimOthers = true, options = {}) {
    const { land = true, water = false, highlightLand = true } = options;

    svg.querySelectorAll(".countries-layer path").forEach(p => {
        p.classList.remove("active", "dim");
        if (land && dimOthers) p.classList.add("dim");
    });

    const waterGroup = svg.querySelector(".water-layer");
    if (waterGroup) waterGroup.innerHTML = "";

    let defs = svg.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.insertBefore(defs, svg.firstChild);
    }

    // USUŃ stare rzeczy
    const oldMaskShape = svg.querySelector("#mask-shape");
    if (oldMaskShape) oldMaskShape.remove();

    const oldWaterMask = svg.querySelector("#water-mask");
    if (oldWaterMask) oldWaterMask.remove();


    // === MASKA ZBIORCZA ===
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", "water-mask");

    const maskShape = document.createElementNS("http://www.w3.org/2000/svg", "g");
    maskShape.setAttribute("id", "mask-shape");
    mask.appendChild(maskShape);
    defs.appendChild(mask);

    // === FILTER DYLATACJI ===
    if (!svg.querySelector("#water-dilate")) {
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "water-dilate");

        const morph = document.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
        morph.setAttribute("operator", "dilate");
        morph.setAttribute("radius", "18"); // GRUBOŚĆ WODY

        filter.appendChild(morph);
        defs.appendChild(filter);
    }

    const active = [];

    regions.forEach(name => {
        const map = COUNTRY_MAP[name];
        if (!map) return;

        let elements = [];

        // ID
        if (map.id) {
            const ids = map.id.split(" ");
            ids.forEach(id => {
                const el = svg.querySelector(`#${CSS.escape(id)}`);
                if (el) elements.push(el);
            });
        }

        // KLASY
        if (map.class) {
            const classes = map.class.split(" ");
            classes.forEach(cls => {
                const found = svg.querySelectorAll(`.${CSS.escape(cls)}`);
                elements.push(...found);
            });
        }

        elements.forEach(el => {
            // LĄD
            if (land && highlightLand) {
                if (el.tagName === "g") {
                    el.querySelectorAll("path").forEach(p => {
                        p.classList.add("active");
                        p.classList.remove("dim");
                        active.push(p);
                    });
                } else {
                    el.classList.add("active");
                    el.classList.remove("dim");
                    active.push(el);
                }
            }

            // DODAJEMY DO MASKI
            if (water) {
                const clone = el.cloneNode(true);
                clone.removeAttribute("id");
                clone.setAttribute("fill", "white");
                clone.setAttribute("stroke", "none");
                maskShape.appendChild(clone);
            }
        });
    });

    // === WODA = POWIĘKSZONY KSZTAŁT ===
    if (water && waterGroup) {
        const maskPaths = maskShape.querySelectorAll("path");
        maskPaths.forEach(p => {
            p.setAttribute("fill", "#ff69b4"); // nadpisanie koloru różowego
            p.setAttribute("stroke", "none");
        });

        // === WODA = POWIĘKSZONY KSZTAŁT ===
        const waterUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
        waterUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#mask-shape");
        waterUse.setAttribute("fill", "#ff69b4");
        waterUse.setAttribute("fill-opacity", "0.25");
        waterUse.setAttribute("stroke", "none");
        waterUse.setAttribute("filter", "url(#water-dilate)");
        waterUse.setAttribute("pointer-events", "none");
        waterGroup.appendChild(waterUse);
    }

    return active;
}