/**
 * Moduł Kalendarza Planet Zoo - Wersja Rozbudowana
 */
(function() {
    let calendarData = { fixedEvents: [], relativeEvents: [] };

    // Stan kalendarza
    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth() + 1; // 1-12
    let selectedDay = today.getDate();

    const monthsNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
        "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
    ];

    // ─── Algorytmy Święta Ruchomych ───────────────────────────────────────

    function getEasterDate(year) {
        const a = year % 19,
            b = Math.floor(year / 100),
            c = year % 100;
        const d = Math.floor(b / 4),
            e = b % 4;
        const f = Math.floor((b + 8) / 25),
            g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4),
            k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }

    function isRelativeMatch(year, month, day, targetWeekday, occurrence) {
        const date = new Date(year, month - 1, day);
        if (date.getDay() !== targetWeekday) return false;

        if (occurrence === "lastFullWeekend") {
            if (targetWeekday === 6) { // Sobota
                const sunday = new Date(year, month - 1, day + 1);
                const nextSunday = new Date(year, month - 1, day + 8);
                // Niedziela musi być w tym samym miesiącu, a kolejna niedziela już w następnym
                return sunday.getMonth() === month - 1 && nextSunday.getMonth() !== month - 1;
            } else if (targetWeekday === 0) { // Niedziela
                const saturday = new Date(year, month - 1, day - 1);
                const nextSunday = new Date(year, month - 1, day + 7);
                // Sobota musi być w tym samym miesiącu, a kolejna niedziela już w następnym
                return saturday.getMonth() === month - 1 && nextSunday.getMonth() !== month - 1;
            }
            return false;
        } else if (occurrence === "last") {
            const nextWeek = new Date(year, month - 1, day + 7);
            return nextWeek.getMonth() !== month - 1;
        } else {
            return Math.ceil(day / 7) === occurrence;
        }
    }

    function getEventsForDay(year, month, day) {
        const events = [];

        if (calendarData.fixedEvents) {
            calendarData.fixedEvents.forEach(e => {
                if (e.month === month && e.day === day) events.push(e);
            });
        }

        if (calendarData.relativeEvents) {
            calendarData.relativeEvents.forEach(e => {
                if (e.month === month && isRelativeMatch(year, month, day, e.weekday, e.occurrence)) {
                    events.push(e);
                }
            });
        }

        const easter = getEasterDate(year);
        if (easter.getMonth() + 1 === month && easter.getDate() === day) {
            events.unshift({
                title: "Wielkanoc!",
                description: "Radosnych Świąt Wielkanocnych!<br>Mamy nadzieję, że wszyscy spędzicie <b>Wielkanoc</b> z rodziną i przyjaciółmi w atmosferze wzajemnej życzliwości i spokoju.",
                image: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1786273570/wielkanoc_yf1vt2.webp",
                frame: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1786272565/jajka_gwlqau.webp"
            });
        }

        const easterMonday = new Date(easter);
        easterMonday.setDate(easter.getDate() + 1);
        if (easterMonday.getMonth() + 1 === month && easterMonday.getDate() === day) {
            events.unshift({
                title: "Poniedziałek Wielkanocny!",
                description: "Radosnych Świąt Wielkanocnych i udanego Śmigusa Dyngusa!<br>Mamy nadzieję, że wszyscy spędzicie <b>Wielkanoc</b> z rodziną i przyjaciółmi w atmosferze wzajemnej życzliwości i spokoju.",
                image: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1786273570/wielkanoc_yf1vt2.webp",
                frame: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1786272565/jajka_gwlqau.webp"
            });
        }

        // ⬇️ DODAJ TEN FRAGMENT PRZED "return events;" ⬇️
        events.sort((a, b) => {
            const isRelease = (ev) => {
                if (!ev) return false;
                // Sprawdzamy, czy obiekt posiada właściwość dlc, typ 'release' lub słowo "Wydanie"/"Premiera" w tytule
                if (ev.dlc || ev.type === 'release') return true;
                if (ev.title) {
                    const titleLower = ev.title.toLowerCase();
                    return titleLower.includes('wydanie') || titleLower.includes('premiera');
                }
                return false;
            };

            const aIsRelease = isRelease(a);
            const bIsRelease = isRelease(b);

            if (aIsRelease && !bIsRelease) return 1; // Zepchnij wydanie na koniec
            if (!aIsRelease && bIsRelease) return -1; // Przepuść święto/dzień ruchomy wyżej
            return 0;
        });

        return events;
    }

    // ─── Renderowanie Miesiąca z Animacją ──────────────────────────────────

    function renderMonth(animate = true) {
        const titleEl = document.getElementById("cal-month-title");
        if (titleEl) {
            titleEl.innerHTML = `
                <span id="select-month-btn" class="clickable-header-title">${monthsNames[viewMonth - 1]}</span> 
                <span id="select-year-btn" class="clickable-header-title">${viewYear}</span>
            `;
            setupQuickSelectors();
        }

        const grid = document.getElementById("calendar-days-grid");
        if (!grid) return;

        if (animate) {
            grid.classList.add("month-transition");
            setTimeout(() => grid.classList.remove("month-transition"), 250);
        }

        grid.innerHTML = "";

        const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
        let firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
        if (firstDay === 0) firstDay = 7; // Poniedziałek = 1

        const totalCells = 42; // Stała siatka: 6 tygodni
        let dayCounter = 1;

        for (let i = 1; i <= totalCells; i++) {
            const dayCell = document.createElement("div");

            if (i < firstDay || dayCounter > daysInMonth) {
                dayCell.className = "day-cell empty";
            } else {
                const currentDay = dayCounter;
                const events = getEventsForDay(viewYear, viewMonth, currentDay);
                const hasEvents = events.length > 0;
                const isToday = (today.getFullYear() === viewYear && (today.getMonth() + 1) === viewMonth && today.getDate() === currentDay);
                const isSelected = (currentDay === selectedDay);

                let cellClasses = ["day-cell"];
                if (hasEvents) cellClasses.push("has-events");
                if (isToday) cellClasses.push("is-today");
                if (isSelected) cellClasses.push("selected");

                dayCell.className = cellClasses.join(" ");

                const eventWithFrame = events.find(e => e.frame);
                if (eventWithFrame && eventWithFrame.frame) {
                    let frameUrl = eventWithFrame.frame;

                    if (frameUrl.includes("cloudinary.com") && frameUrl.includes("/upload/")) {
                        frameUrl = frameUrl.replace("/upload/", "/upload/w_80,h_80,c_fit,e_sharpen:100,q_auto,f_auto/");
                    }

                    dayCell.style.backgroundImage = `url('${frameUrl}')`;
                    dayCell.classList.add("has-custom-frame");
                }

                dayCell.innerHTML = `
                    <span class="day-number">${currentDay}</span>
                    ${hasEvents ? '<span class="event-dot"></span>' : ''}
                `;

                dayCell.addEventListener("click", () => {
                    selectedDay = currentDay;
                    document.querySelectorAll(".day-cell").forEach(c => c.classList.remove("selected"));
                    dayCell.classList.add("selected");
                    showDetails(currentDay);
                });

                dayCounter++;
            }

            grid.appendChild(dayCell);
        }

        showDetails(selectedDay);
    }

    // ─── OTWIERANIE MODALU DLA KONKRETNEGO ŚWIĘTA ─────────────────────────────
    function openEventByTitle(targetTitle) {
        if (!targetTitle) return;

        // Helper do czyszczenia tekstu (małe litery, usunięcie wykrzykników, kropek i spacji)
        const clean = str => (str || "").toLowerCase().replace(/[!.,?]/g, "").trim();
        const searchTarget = clean(targetTitle);

        let foundMonth = null;
        let foundDay = null;

        // 1️⃣ KROK 1: Najpierw szukamy DOKŁADNEGO dopasowania w całym roku
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = new Date(viewYear, m, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const events = getEventsForDay(viewYear, m, d);
                const match = events.find(e => e.title && clean(e.title) === searchTarget);
                if (match) {
                    foundMonth = m;
                    foundDay = d;
                    break;
                }
            }
            if (foundDay) break;
        }

        // 2️⃣ KROK 2: Jeśli nie ma idealnego dopasowania, szukamy częściowego (.includes)
        if (!foundDay) {
            for (let m = 1; m <= 12; m++) {
                const daysInMonth = new Date(viewYear, m, 0).getDate();
                for (let d = 1; d <= daysInMonth; d++) {
                    const events = getEventsForDay(viewYear, m, d);
                    const match = events.find(e => e.title && clean(e.title).includes(searchTarget));
                    if (match) {
                        foundMonth = m;
                        foundDay = d;
                        break;
                    }
                }
                if (foundDay) break;
            }
        }

        if (foundDay && foundMonth) {
            viewMonth = foundMonth;
            selectedDay = foundDay;

            const modal = document.getElementById("calendar-modal");
            if (modal) {
                modal.classList.add("show");
                document.body.style.overflow = "hidden";
                renderMonth(true);
            }
        } else {
            console.warn("Nie znaleziono wydarzenia w kalendarzu:", targetTitle);
        }
    }

    // ─── OTWIERANIE MODALU DLA KONKRETNEJ DATY (BRAKUJĄCA FUNKCJA) ─────────────
    function openDate(year, month, day) {
        if (!year || !month || !day) return;

        viewYear = parseInt(year, 10);
        viewMonth = parseInt(month, 10);
        selectedDay = parseInt(day, 10);

        const modal = document.getElementById("calendar-modal");
        if (modal) {
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
            renderMonth(true);
        }
    }

    // Eksportujemy do globalnej przestrzeni
    window.CALENDAR = window.CALENDAR || {};
    window.CALENDAR.openEventByTitle = openEventByTitle;
    window.CALENDAR.openDate = openDate; // 👈 Teraz działa prawidłowo!
    // ─── Szybki Wybór Miesiąca i Roku ─────────────────────────────────────

    function setupQuickSelectors() {
        const monthBtn = document.getElementById("select-month-btn");
        const yearBtn = document.getElementById("select-year-btn");

        if (monthBtn) {
            monthBtn.addEventListener("click", (e) => {
                showMonthPicker();
            });
        }

        if (yearBtn) {
            yearBtn.addEventListener("click", (e) => {
                showYearPicker();
            });
        }
    }

    function showMonthPicker() {
        removePickers();
        const container = document.querySelector(".calendar-nav");
        if (!container) return;

        const picker = document.createElement("div");
        picker.className = "quick-picker-dropdown month-picker";

        monthsNames.forEach((m, idx) => {
            const item = document.createElement("div");
            item.className = `picker-item ${(idx + 1 === viewMonth) ? 'active' : ''}`;
            item.innerText = m;
            item.addEventListener("click", () => {
                viewMonth = idx + 1;
                renderMonth(true);
                removePickers();
            });
            picker.appendChild(item);
        });

        container.appendChild(picker);
        // Aktywacja animacji wejścia w następnej klatce
        requestAnimationFrame(() => {
            picker.classList.add("active");
        });
    }

    function showYearPicker() {
        removePickers();
        const container = document.querySelector(".calendar-nav");
        if (!container) return;

        const picker = document.createElement("div");
        picker.className = "quick-picker-dropdown year-input-picker";

        picker.innerHTML = `
            <div class="year-input-box">
                <input type="number" id="custom-year-input" value="${viewYear}" min="1900" max="2100" step="1" />
                <div class="year-arrows">
                    <button type="button" id="year-up-btn">▲</button>
                    <button type="button" id="year-down-btn">▼</button>
                </div>
            </div>
            <button type="button" id="apply-year-btn" class="apply-year-btn">Zatwierdź</button>
        `;

        container.appendChild(picker);

        // Aktywacja animacji wejścia
        requestAnimationFrame(() => {
            picker.classList.add("active");
        });

        const input = picker.querySelector("#custom-year-input");
        const upBtn = picker.querySelector("#year-up-btn");
        const downBtn = picker.querySelector("#year-down-btn");
        const applyBtn = picker.querySelector("#apply-year-btn");

        input.focus();
        // Przenosimy kursor na sam koniec pola (za rok)
        const tempVal = input.value;
        input.value = '';
        input.value = tempVal;

        const submitYear = () => {
            let val = parseInt(input.value, 10);
            if (!isNaN(val) && val >= 1900 && val <= 2100) {
                viewYear = val;
                renderMonth(true);
                removePickers();
            }
        };

        upBtn.addEventListener("click", () => {
            input.value = parseInt(input.value, 10) + 1;
        });

        downBtn.addEventListener("click", () => {
            input.value = parseInt(input.value, 10) - 1;
        });

        applyBtn.addEventListener("click", submitYear);

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                submitYear();
            }
        });
    }

    function removePickers() {
        document.querySelectorAll(".quick-picker-dropdown").forEach(el => {
            // Jeśli okienko jest widoczne, wykonaj animację zamykania przed usunięciem
            if (el.classList.contains("active") && !el.classList.contains("closing")) {
                el.classList.remove("active");
                el.classList.add("closing");
                setTimeout(() => el.remove(), 200); // 200ms odpowiada czasowi transition w CSS
            } else if (!el.classList.contains("closing")) {
                el.remove();
            }
        });
    }

    // ─── Panel Szczegółów Dnia ─────────────────────────────────────────────

    function showDetails(day) {
        const infoContainer = document.getElementById("calendar-info-content");
        if (!infoContainer) return;

        infoContainer.classList.add("loading-blur");

        const monthsGenitive = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
            'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
        ];

        const events = getEventsForDay(viewYear, viewMonth, day);

        let html = `
            <div class="details-header">
                <h3>${day} ${monthsGenitive[viewMonth - 1]} ${viewYear}</h3>
            </div>
            <div class="details-body">
        `;

        if (events.length === 0) {
            html += `<div class="event-card">
                        <img class="event-img" src="https://res.cloudinary.com/ddqbmcmoe/image/upload/v1784671784/BRAK_nvlvhh.webp" alt="Brak wydarzeń">
                        <p class="no-events">Nikt nie lubi siedzieć i&nbsp;się nudzić!<br>Jednak tego dnia nic szczególnego się nie dzieje.<br>Możesz zobaczyć jaka aktywność jest w&nbsp;innych dniach.</p>
                     </div>`;
        } else {
            events.forEach(ev => {
                html += `<div class="event-card">
                            <h4>${ev.title}</h4>`;

                if (ev.gif) {
                    const videoUrl = `https://res.cloudinary.com/ddqbmcmoe/video/upload/v1786652105/${ev.gif}.mp4`;
                    html += `<div class="video-container">
                    <video class="event-gif" autoplay loop muted playsinline style="width:100%; border-radius:8px;">
                        <source src="${videoUrl}" type="video/mp4">
                    </video>
                 </div>`;
                }
                if (ev.image) {
                    html += `<img class="event-img" src="${ev.image}" alt="${ev.title}">`;
                }
                if (ev.dlc) {
                    // 1. Generujemy ikonę wydania/DLC pośrodku pod zdjęciem
                    html += `
        <div class="calendar-dlc-link-box" style="text-align: center; margin-top: 10px;">
            <button class="calendar-dlc-btn" data-dlc="${ev.dlc}" data-version="${ev.version || 'pz1pc'}" style="background: none; border: none; cursor: pointer; display: inline-block;">
                <img src="${ev.icon || 'https://res.cloudinary.com/ddqbmcmoe/image/upload/v1770829340/dlc_zbn7i2.webp'}" alt="Ikona DLC" style="width: 48px; height: 48px; object-fit: contain; transition: transform 0.2s ease;">
            </button>
        </div>
    `;
                }
                if (ev.description) {
                    html += `<p class="event-desc">${ev.description}</p>`;
                }
                html += `</div>`;
            });
        }

        html += `</div>`;

        setTimeout(() => {
            infoContainer.innerHTML = html;
            infoContainer.classList.remove("loading-blur");
            // Po wywołaniu infoContainer.innerHTML = html;
            infoContainer.querySelectorAll('.calendar-dlc-btn').forEach(btn => {
                // W calendar.js przy kliknięciu ikony DLC:

                btn.onclick = () => {
                    const dlcTarget = btn.dataset.dlc;
                    const targetVersion = btn.dataset.version;

                    // 1. Zamknij modal kalendarza i ODBLOKUJ scroll
                    const modal = document.getElementById("calendar-modal");
                    if (modal) {
                        modal.classList.remove("show");
                    }
                    document.body.style.overflow = "";
                    document.body.classList.remove("modal-open");

                    // 2. Przełącz wersję w AppState
                    if (typeof AppState !== "undefined" && typeof AppState.set === "function") {
                        AppState.set(targetVersion);
                    }

                    // 3. Załaduj podstronę DLC
                    if (window.loadPage && typeof window.loadPage === "function") {
                        window.loadPage("dlc").then(() => {
                            const openDlcModal = () => {
                                const currentVersion = AppState.get();
                                const dlcItem = window.DLC.data.find(d =>
                                    (d.name === dlcTarget || d.id === dlcTarget) && d.version === currentVersion
                                );

                                if (dlcItem) {
                                    window.DLC.openModal(dlcItem);
                                }
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
            });

            // ⬇️ DODAJ TĘ LINIĘ TUTAJ:
            if (typeof window.addNonBreakingSpaces === "function") {
                window.addNonBreakingSpaces(infoContainer);
            }
        }, 150);
    }

    // ─── Inicjalizacja i Nawigacja ──────────────────────────────────────────

    function checkTodayBadge() {
        const container = document.querySelector(".floating-calendar");
        if (!container) return;

        // Usuwamy stary badge, jeśli istnieje
        const existingBadge = container.querySelector(".calendar-badge");
        if (existingBadge) existingBadge.remove();

        // Sprawdzamy wydarzenia dla dzisiejszego dnia
        const todayEvents = getEventsForDay(today.getFullYear(), today.getMonth() + 1, today.getDate());

        // Jeśli dzisiaj coś jest, dodajemy statyczny wykrzyknik
        if (todayEvents.length > 0) {
            const badge = document.createElement("span");
            badge.className = "calendar-badge";
            badge.innerText = "!";
            badge.title = "Dzisiaj są ważne wydarzenia!";
            container.appendChild(badge);
        }
    }

    async function initCalendar() {
        try {
            const res = await fetch("data/calendar.json");
            if (!res.ok) throw new Error();
            calendarData = await res.json();
        } catch (e) {
            calendarData = { fixedEvents: [], relativeEvents: [] };
        }

        renderMonth(false);
        checkTodayBadge(); // <-- DODAJ TĘ LINIĘ
    }

    function startClock() {
        const updateClock = () => {
            const d = new Date();
            const clockEl = document.getElementById("calendar-clock");
            if (clockEl) {
                clockEl.innerText = d.toLocaleTimeString('pl-PL');
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    document.addEventListener("DOMContentLoaded", () => {
        startClock();
        initCalendar(); // <-- Wczyta dane i doda badge przy starcie

        const modal = document.getElementById("calendar-modal");
        if (!modal) return;

        const toggleBtn = document.getElementById("calendar-toggle");
        const closeBtn = modal.querySelector(".calendar-close-btn") || modal.querySelector(".version-modal-close");

        const prevBtn = document.getElementById("cal-prev");
        const nextBtn = document.getElementById("cal-next");
        const todayBtn = document.getElementById("cal-today-btn");

        /* 🔘 OTWIERANIE MODALU */
        function openCalendarModal() {
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
            initCalendar();
        }

        /* ❌ ZAMYKANIE MODALU */
        function closeCalendarModal() {
            modal.classList.remove("show");
            removePickers();
            setTimeout(() => {
                document.body.style.overflow = "";
            }, 250);
        }

        if (toggleBtn) toggleBtn.addEventListener("click", openCalendarModal);
        if (closeBtn) closeBtn.addEventListener("click", closeCalendarModal);

        /* 💡 ZAMYKAMY MENU / MODAL PRZY KLIKNIĘCIU GDZIEKOLWIEK INNDZIEJ */
        document.addEventListener("click", (e) => {
            // Jeśli kliknięto w tło (backdrop), zamykamy modal
            if (e.target === modal) {
                closeCalendarModal();
                return;
            }

            // Jeśli okienko wyboru miesiąca/roku jest otwarte:
            const openPicker = document.querySelector(".quick-picker-dropdown");
            if (openPicker) {
                // Sprawdzamy czy kliknięcie było W WEWNĄTRZ okienka wyboru LUB na przyciski nagłówka
                const clickedInsidePicker = openPicker.contains(e.target);
                const clickedHeaderBtn = e.target.closest("#select-month-btn") || e.target.closest("#select-year-btn");

                // Jeżeli kliknięto gdziekolwiek indziej – zamykamy menu wyboru
                if (!clickedInsidePicker && !clickedHeaderBtn) {
                    removePickers();
                }
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                const openPicker = document.querySelector(".quick-picker-dropdown");
                if (openPicker) {
                    removePickers();
                } else {
                    closeCalendarModal();
                }
            }
        });

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                removePickers();
                viewMonth--;
                if (viewMonth < 1) {
                    viewMonth = 12;
                    viewYear--;
                }
                selectedDay = 1;
                renderMonth(true);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                removePickers();
                viewMonth++;
                if (viewMonth > 12) {
                    viewMonth = 1;
                    viewYear++;
                }
                selectedDay = 1;
                renderMonth(true);
            });
        }

        if (todayBtn) {
            todayBtn.addEventListener("click", () => {
                removePickers();
                viewYear = today.getFullYear();
                viewMonth = today.getMonth() + 1;
                selectedDay = today.getDate();
                renderMonth(true);
            });
        }
    });


})();