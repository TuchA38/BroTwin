window.SHORTCUTS = window.SHORTCUTS || {
    data: null
};

// Funkcja zapobiegająca sierotom (przykleja małe słowa i ikony do sąsiedniego tekstu)
function formatShortcutDisplay(display) {
    if (!display) return "";

    const smallWords = ['a', 'o', 'w', 'z', 'u', 'na', 'do', 'i', 'czy', 'A', 'O', 'W', 'Z', 'Na', 'Do', 'I', 'Czy'];
    let formatted = display;

    // Zamiana zwykłych spacji po spójnikach na niełamliwe spacje (&nbsp;)
    smallWords.forEach(word => {
        const regex = new RegExp(`(?:^|\\s)(${word})\\s+`, 'g');
        formatted = formatted.replace(regex, (match, p1) => {
            const hasLeadingSpace = match.startsWith(' ');
            return (hasLeadingSpace ? ' ' : '') + p1 + '&nbsp;';
        });
    });

    // Przyklejanie obrazków do sąsiedniego słowa
    formatted = formatted
        .replace(/(<img[^>]*>)\s+/gi, '$1&nbsp;')
        .replace(/\s+(<img[^>]*>)/gi, '&nbsp;$1');

    return formatted;
}

// Obrazy sterowania na konsoli dla galerii
const CONSOLE_IMAGES = [
    "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1781178627/Alpha_Console_18_ca6tqf.webp",
    "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1781178619/Alpha_Console_17_cvi5lt.webp"
];

// Efekt bluru na kontenerze strony (#content) podczas zmiany wersji
function triggerContentBlur() {
    const content = document.getElementById("content");
    if (content) {
        content.classList.add("page-loading");
        setTimeout(() => {
            requestAnimationFrame(() => {
                content.classList.remove("page-loading");
            });
        }, 220);
    }
}

// Automatyczne tworzenie struktury lightboxa, jeśli nie istnieje w DOM
function ensureGalleryLightbox() {
    let lightbox = document.getElementById("gallery-lightbox");
    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "gallery-lightbox";
        lightbox.className = "gallery-lightbox hidden";
        lightbox.innerHTML = `
            <button class="gallery-close" aria-label="Zamknij">✖</button>
            <button class="gallery-prev" aria-label="Poprzednie">&#9664;</button>
            <img id="gallery-lightbox-img" src="" alt="Sterowanie Konsola">
            <button class="gallery-next" aria-label="Następne">&#9654;</button>
        `;
        document.body.appendChild(lightbox);
    }
    return lightbox;
}

// Otwieranie pełnoekranowej galerii po kliknięciu w zdjęcie konsoli
function openConsoleGallery(index) {
    ensureGalleryLightbox();

    if (typeof window.openGallery === "function") {
        window.openGallery(index, CONSOLE_IMAGES);
    } else {
        const script = document.createElement("script");
        script.src = "js/gallery.js";
        script.onload = () => {
            if (typeof window.openGallery === "function") {
                window.openGallery(index, CONSOLE_IMAGES);
            }
        };
        document.body.appendChild(script);
    }
}
window.openConsoleGallery = openConsoleGallery;

// Zbiór obecnie wciśniętych klawiszy i przycisków myszy
const activeInputCodes = new Set();

function getActiveVersion() {
    const htmlVer = document.documentElement.dataset.gameVersion;
    if (htmlVer) return normalizeVersion(htmlVer);

    if (typeof AppState !== "undefined" && AppState.get) {
        return normalizeVersion(AppState.get());
    }

    const localVer = localStorage.getItem("zoopedia-version");
    return normalizeVersion(localVer || "pz1pc");
}

function normalizeVersion(ver) {
    if (!ver) return "pz1pc";
    const v = ver.toLowerCase();
    if (v.includes("console")) return "pz1console";
    if (v.includes("pz2")) return "pz2";
    return "pz1pc";
}

// Funkcja do płynnego przełączania wersji na PC z efektami przejścia
function switchVersionToPC(e) {
    if (e) e.preventDefault();

    triggerContentBlur();

    if (typeof AppState !== "undefined" && AppState.set) {
        AppState.set("pz1pc");
    } else {
        localStorage.setItem("zoopedia-version", "pz1pc");
        document.documentElement.dataset.gameVersion = "pz1pc";
        document.dispatchEvent(new CustomEvent("versionChanged", { detail: { version: "pz1pc" } }));
    }
    if (typeof window.syncIconWithState === "function") {
        window.syncIconWithState();
    }
}
window.switchVersionToPC = switchVersionToPC;

function initShortcuts() {
    initToast();
    renderCurrentVersionView();

    if (!SHORTCUTS.data) {
        fetch("data/skroty.json")
            .then(res => res.json())
            .then(data => {
                SHORTCUTS.data = data;
                renderCurrentVersionView();
            })
            .catch(err => {
                console.error("Błąd JSON:", err);
                const tableContainer = document.getElementById("skroty-table-container");
                if (tableContainer) {
                    tableContainer.innerHTML = "<p class='no-data'>⚠️ Nie udało się wczytać pliku data/skroty.json.</p>";
                }
            });
    }
}

function updateLEDs(e) {
    if (!e || typeof e.getModifierState !== "function") return;

    const numLed = document.getElementById("led-num");
    const capsLed = document.getElementById("led-caps");
    const scrollLed = document.getElementById("led-scroll");

    if (numLed) numLed.classList.toggle("active", e.getModifierState("NumLock"));
    if (capsLed) capsLed.classList.toggle("active", e.getModifierState("CapsLock"));
    if (scrollLed) scrollLed.classList.toggle("active", e.getModifierState("ScrollLock"));
}

['mousemove', 'mousedown', 'keydown', 'keyup', 'focus'].forEach(eventType => {
    window.addEventListener(eventType, updateLEDs, { passive: true });
});

window.addEventListener("blur", () => {
    activeInputCodes.clear();
    document.querySelectorAll('.key.pressed, .mouse-btn.pressed').forEach(el => el.classList.remove('pressed'));
});

if (!window.SHORTCUTS_LISTENERS_BOUND) {
    window.SHORTCUTS_LISTENERS_BOUND = true;

    document.addEventListener("versionChanged", () => {
        triggerContentBlur();
        renderCurrentVersionView();
    });

    const htmlObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "data-game-version") {
                triggerContentBlur();
                renderCurrentVersionView();
            }
        });
    });
    htmlObserver.observe(document.documentElement, { attributes: true });

    let mouseMoveTimeout;
    window.addEventListener("mousemove", (e) => {
        if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) {
            activeInputCodes.add("MouseMove");

            if (Math.abs(e.movementX) > Math.abs(e.movementY)) {
                activeInputCodes.add("MouseMoveX");
            } else {
                activeInputCodes.add("MouseMoveY");
            }

            checkAndShowShortcut();

            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                activeInputCodes.delete("MouseMove");
                activeInputCodes.delete("MouseMoveX");
                activeInputCodes.delete("MouseMoveY");
            }, 150);
        }
    }, { passive: true });

    window.addEventListener("mousedown", (e) => {
        const buttonCode = e.button === 0 ? "MouseLeft" : e.button === 2 ? "MouseRight" : "MouseMiddle";
        const mouseVisual = document.querySelector(`.mouse-btn[data-code="${buttonCode}"]`);
        if (mouseVisual) mouseVisual.classList.add("pressed");

        activeInputCodes.add(buttonCode);
        checkAndShowShortcut();
    });

    window.addEventListener("mouseup", (e) => {
        const buttonCode = e.button === 0 ? "MouseLeft" : e.button === 2 ? "MouseRight" : "MouseMiddle";
        const mouseVisual = document.querySelector(`.mouse-btn[data-code="${buttonCode}"]`);
        if (mouseVisual) mouseVisual.classList.remove("pressed");

        activeInputCodes.delete(buttonCode);
    });

    let wheelTimeout;
    window.addEventListener("wheel", () => {
        const wheelVisual = document.querySelector('.mouse-btn[data-code="MouseMiddle"]');
        if (wheelVisual) {
            wheelVisual.classList.add("pressed");
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                wheelVisual.classList.remove("pressed");
                activeInputCodes.delete("MouseMiddle");
            }, 150);
        }

        activeInputCodes.add("MouseMiddle");
        checkAndShowShortcut();
    }, { passive: true });
}

function renderCurrentVersionView() {
    const currentVersion = getActiveVersion();
    const controllerContainer = document.getElementById("controller-view");
    const tableContainer = document.getElementById("skroty-table-container");

    // Ustawienie atrybutu wersji na głównym układzie
    const layoutContainer = document.querySelector(".shortcuts-layout");
    if (layoutContainer) {
        layoutContainer.dataset.version = currentVersion;
    }

    if (!controllerContainer || !tableContainer) return;

    // Pobranie i obsługa nagłówków sekcji
    const titles = document.querySelectorAll(".shortcuts-layout .panel-title");
    const controllerTitle = titles[0] || null;
    const tableTitle = titles[1] || null;

    if (currentVersion === "pz1pc") {
        if (controllerTitle) {
            controllerTitle.innerText = "Interaktywne sterowanie PC";
            controllerTitle.style.display = "block";
        }
        if (tableTitle) {
            tableTitle.innerText = "Tabela akcji";
            tableTitle.style.display = "block";
        }
        controllerContainer.innerHTML = generatePCControlsHTML();
    } else if (currentVersion === "pz1console") {
        if (controllerTitle) {
            controllerTitle.innerText = "Sterowanie na konsoli";
            controllerTitle.style.display = "block";
        }
        if (tableTitle) {
            tableTitle.style.display = "none";
        }
        controllerContainer.innerHTML = generateGamepadHTML();
        tableContainer.innerHTML = "";
        return;
    } else {
        if (controllerTitle) controllerTitle.style.display = "none";
        if (tableTitle) tableTitle.style.display = "none";
        controllerContainer.innerHTML = `
            <div class="empty-state">
                <p>🛠️ Brak zdefiniowanego kontrolera dla wybranej wersji (${currentVersion}).</p>
            </div>
        `;
        tableContainer.innerHTML = "";
        return;
    }

    if (!SHORTCUTS.data) return;

    const list = SHORTCUTS.data[currentVersion] || [];

    if (list.length === 0) {
        tableContainer.innerHTML = `<p class='no-data'>Brak zarejestrowanych skrótów dla wersji: <b>${currentVersion}</b>.</p>`;
        return;
    }

    const categories = {};
    list.forEach(item => {
        const cat = item.category || "Inne";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
    });

    let html = `<div class="shortcuts-grid">`;

    for (const [categoryName, items] of Object.entries(categories)) {
        html += `
            <div class="category-card">
                <h3 class="category-title">${categoryName}</h3>
                <table class="skroty-table">
                    <thead>
                        <tr>
                            <th>Przycisk</th>
                            <th>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(item => {
            html += `
                <tr id="row-${item.id}">
                    <th><span class="key-badge">${formatShortcutDisplay(item.display)}</span></th>
                    <td>${item.title}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    html += `</div>`;
    tableContainer.innerHTML = html;

    // Aplikowanie funkcji usuwania sierotek
    if (typeof window.addNonBreakingSpaces === "function") {
        window.addNonBreakingSpaces(tableContainer);
    }
}

function generatePCControlsHTML() {
    return `
        <div class="pc-controls-wrapper">
            <div class="keyboard-container">
                <div class="keyboard-main">
                    <div class="key-row">
                        <div class="key small" data-code="Escape">Esc</div>
                        <div class="key-spacer"></div>
                        <div class="key small" data-code="F1">F1</div>
                        <div class="key small" data-code="F2">F2</div>
                        <div class="key small" data-code="F3">F3</div>
                        <div class="key small" data-code="F4">F4</div>
                        <div class="key-spacer"></div>
                        <div class="key small" data-code="F5">F5</div>
                        <div class="key small" data-code="F6">F6</div>
                        <div class="key small" data-code="F7">F7</div>
                        <div class="key small" data-code="F8">F8</div>
                        <div class="key-spacer"></div>
                        <div class="key small" data-code="F9">F9</div>
                        <div class="key small" data-code="F10">F10</div>
                        <div class="key small" data-code="F11">F11</div>
                        <div class="key small" data-code="F12">F12</div>
                    </div>
                    <div class="key-row">
                        <div class="key" data-code="Backquote">~</div>
                        <div class="key" data-code="Digit1">1</div>
                        <div class="key" data-code="Digit2">2</div>
                        <div class="key" data-code="Digit3">3</div>
                        <div class="key" data-code="Digit4">4</div>
                        <div class="key" data-code="Digit5">5</div>
                        <div class="key" data-code="Digit6">6</div>
                        <div class="key" data-code="Digit7">7</div>
                        <div class="key" data-code="Digit8">8</div>
                        <div class="key" data-code="Digit9">9</div>
                        <div class="key" data-code="Digit0">0</div>
                        <div class="key" data-code="Minus">-</div>
                        <div class="key" data-code="Equal">=</div>
                        <div class="key medium" data-code="Backspace">⌫</div>
                    </div>
                    <div class="key-row">
                        <div class="key medium" data-code="Tab">Tab</div>
                        <div class="key" data-code="KeyQ">Q</div>
                        <div class="key" data-code="KeyW">W</div>
                        <div class="key" data-code="KeyE">E</div>
                        <div class="key" data-code="KeyR">R</div>
                        <div class="key" data-code="KeyT">T</div>
                        <div class="key" data-code="KeyY">Y</div>
                        <div class="key" data-code="KeyU">U</div>
                        <div class="key" data-code="KeyI">I</div>
                        <div class="key" data-code="KeyO">O</div>
                        <div class="key" data-code="KeyP">P</div>
                        <div class="key" data-code="BracketLeft">[</div>
                        <div class="key" data-code="BracketRight">]</div>
                        <div class="key" data-code="Backslash">\\</div>
                    </div>
                    <div class="key-row">
                        <div class="key wide" data-code="CapsLock">Caps</div>
                        <div class="key" data-code="KeyA">A</div>
                        <div class="key" data-code="KeyS">S</div>
                        <div class="key" data-code="KeyD">D</div>
                        <div class="key" data-code="KeyF">F</div>
                        <div class="key" data-code="KeyG">G</div>
                        <div class="key" data-code="KeyH">H</div>
                        <div class="key" data-code="KeyJ">J</div>
                        <div class="key" data-code="KeyK">K</div>
                        <div class="key" data-code="KeyL">L</div>
                        <div class="key" data-code="Semicolon">;</div>
                        <div class="key" data-code="Quote">'</div>
                        <div class="key wide" data-code="Enter">Enter</div>
                    </div>
                    <div class="key-row">
                        <div class="key extra-wide" data-code="ShiftLeft">Shift</div>
                        <div class="key" data-code="KeyZ">Z</div>
                        <div class="key" data-code="KeyX">X</div>
                        <div class="key" data-code="KeyC">C</div>
                        <div class="key" data-code="KeyV">V</div>
                        <div class="key" data-code="KeyB">B</div>
                        <div class="key" data-code="KeyN">N</div>
                        <div class="key" data-code="KeyM">M</div>
                        <div class="key" data-code="Comma">,</div>
                        <div class="key" data-code="Period">.</div>
                        <div class="key" data-code="Slash">/</div>
                        <div class="key extra-wide" data-code="ShiftRight">Shift</div>
                    </div>
                    <div class="key-row">
                        <div class="key medium" data-code="ControlLeft">Ctrl</div>
                        <div class="key" data-code="Fn">Fn</div>
                        <div class="key" data-code="MetaLeft">Win</div>
                        <div class="key medium" data-code="AltLeft">Alt</div>
                        <div class="key space" data-code="Space">Spacja</div>
                        <div class="key medium" data-code="AltRight">Alt</div>
                        <div class="key medium" data-code="ControlRight">Ctrl</div>
                    </div>
                </div>

                <div class="keyboard-nav">
                    <div class="led-panel">
                        <div class="led-item">
                            <span class="led-dot" id="led-num"></span>
                            <span class="led-label">num</span>
                        </div>
                        <div class="led-item">
                            <span class="led-dot" id="led-caps"></span>
                            <span class="led-label">caps</span>
                        </div>
                        <div class="led-item">
                            <span class="led-dot" id="led-scroll"></span>
                            <span class="led-label">scroll</span>
                        </div>
                    </div>
                    <div class="key-row">
                        <div class="key small" data-code="PrintScreen">PrtSc</div>
                        <div class="key small" data-code="ScrollLock">ScrLk</div>
                        <div class="key small" data-code="Pause">Pause</div>
                    </div>
                    <div class="key-row">
                        <div class="key" data-code="Insert">Ins</div>
                        <div class="key" data-code="Home">Home</div>
                        <div class="key" data-code="PageUp">PgUp</div>
                    </div>
                    <div class="key-row">
                        <div class="key" data-code="Delete">Del</div>
                        <div class="key" data-code="End">End</div>
                        <div class="key" data-code="PageDown">PgDn</div>
                    </div>
                    
                    <div class="nav-spacer"></div>

                    <div class="key-row">
                        <div class="key-placeholder"></div>
                        <div class="key" data-code="ArrowUp">↑</div>
                        <div class="key-placeholder"></div>
                    </div>
                    <div class="key-row">
                        <div class="key" data-code="ArrowLeft">←</div>
                        <div class="key" data-code="ArrowDown">↓</div>
                        <div class="key" data-code="ArrowRight">→</div>
                    </div>
                </div>
            </div>

            <div class="mouse-container">
                <div class="mouse-body">
                    <div class="mouse-btn left" data-code="MouseLeft">LMB</div>
                    <div class="mouse-btn wheel" data-code="MouseMiddle"></div>
                    <div class="mouse-btn right" data-code="MouseRight">RMB</div>
                </div>
            </div>
        </div>
    `;
}

function generateGamepadHTML() {
    return `
        <div class="console-controls-wrapper">
            <div class="console-notice">
                <span>Gra na konsoli obsługuje również myszkę i klawiaturę. Podłączyłeś je do konsoli? <a href="#" onclick="switchVersionToPC(event)">Zobacz sterowanie PC dla Planet Zoo</a>.</span>
            </div>

            <div class="console-images-container">
                <img src="${CONSOLE_IMAGES[0]}" class="console-img" style="cursor: pointer;" onclick="openConsoleGallery(0)" alt="Sterowanie Konsola – Część 1">
                <img src="${CONSOLE_IMAGES[1]}" class="console-img" style="cursor: pointer;" onclick="openConsoleGallery(1)" alt="Sterowanie Konsola – Część 2">
            </div>
        </div>
    `;
}

function initToast() {
    let toast = document.getElementById("shortcut-toast");
    if (!toast) {
        const shortcutsLayout = document.querySelector(".shortcuts-layout");
        if (shortcutsLayout) {
            toast = document.createElement("div");
            toast.id = "shortcut-toast";
            shortcutsLayout.prepend(toast);
        }
    }
}

function checkAndShowShortcut() {
    const currentVersion = getActiveVersion();
    const list = SHORTCUTS.data ? SHORTCUTS.data[currentVersion] : null;
    if (!list || activeInputCodes.size === 0) return;

    let maxMatchLength = 0;
    let matchingItems = [];

    const mouseButtons = ["MouseLeft", "MouseRight", "MouseMiddle"];
    const isAnyMouseButtonPressed = mouseButtons.some(btn => activeInputCodes.has(btn));

    list.forEach(item => {
        if (!item.codes) return;

        let bestItemComboLength = 0;

        item.codes.forEach(comboStr => {
            const requiredCodes = comboStr.split("+");

            const isPureMouseMove = requiredCodes.every(code => ["MouseMove", "MouseMoveX", "MouseMoveY"].includes(code));
            if (isPureMouseMove && isAnyMouseButtonPressed) {
                return;
            }

            const allMatched = requiredCodes.every(code => activeInputCodes.has(code));

            if (allMatched) {
                if (requiredCodes.length > bestItemComboLength) {
                    bestItemComboLength = requiredCodes.length;
                }
            }
        });

        if (bestItemComboLength > 0) {
            if (bestItemComboLength > maxMatchLength) {
                maxMatchLength = bestItemComboLength;
                matchingItems = [item];
            } else if (bestItemComboLength === maxMatchLength) {
                matchingItems.push(item);
            }
        }
    });

    if (matchingItems.length > 0) {
        showToast(matchingItems);
    }
}

function showToast(matchingItems) {
    if (window.innerWidth <= 900) return;

    const toast = document.getElementById("shortcut-toast");
    if (!toast) return;

    let html = "";
    matchingItems.forEach(item => {
        const categoryLabel = item.category ? `<span class="toast-category">[${item.category}]</span> ` : "";
        html += `
            <div class="toast-item">
                ${categoryLabel}<strong class="toast-title">${item.title}</strong>
                <span class="toast-display">(${formatShortcutDisplay(item.display)})</span>
            </div>
        `;
    });

    toast.innerHTML = html;
    toast.classList.add("visible");

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2500);
}

function getTargetCode(e) {
    if (!e || !e.code) return "";

    const isNumLockOn = e.getModifierState ? e.getModifierState("NumLock") : false;

    if (e.code.startsWith("Numpad")) {
        if (!isNumLockOn) {
            const numpadToNav = {
                "Numpad7": "Home",
                "Numpad8": "ArrowUp",
                "Numpad9": "PageUp",
                "Numpad4": "ArrowLeft",
                "Numpad6": "ArrowRight",
                "Numpad1": "End",
                "Numpad2": "ArrowDown",
                "Numpad3": "PageDown",
                "Numpad0": "Insert",
                "NumpadDecimal": "Delete"
            };
            return numpadToNav[e.code] || "";
        }

        const numpadToDigit = {
            "Numpad0": "Digit0",
            "Numpad1": "Digit1",
            "Numpad2": "Digit2",
            "Numpad3": "Digit3",
            "Numpad4": "Digit4",
            "Numpad5": "Digit5",
            "Numpad6": "Digit6",
            "Numpad7": "Digit7",
            "Numpad8": "Digit8",
            "Numpad9": "Digit9",
            "NumpadDecimal": "Period",
            "NumpadDivide": "Slash",
            "NumpadSubtract": "Minus",
            "NumpadAdd": "Equal",
            "NumpadEnter": "Enter"
        };
        return numpadToDigit[e.code] || "";
    }

    return e.code;
}

window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const blockedKeys = [
        "Tab", "AltLeft", "AltRight", "Space",
        "ArrowUp", "ArrowDown", "PageUp", "PageDown",
        "Home", "End", "Insert", "Delete", "Ctrl",
        "F1", "F3", "F5", "F6", "F7", "F10", "F11", "F12"
    ];

    if (blockedKeys.includes(e.code) || blockedKeys.includes(e.key)) {
        e.preventDefault();
    }

    const codeToHighlight = getTargetCode(e);
    if (codeToHighlight) {
        activeInputCodes.add(codeToHighlight);
    }

    const keyVisuals = document.querySelectorAll(`.key[data-code="${codeToHighlight}"]`);
    keyVisuals.forEach(el => el.classList.add("pressed"));

    updateLEDs(e);
    checkAndShowShortcut();
});

window.addEventListener("keyup", (e) => {
    const codeToHighlight = getTargetCode(e);
    if (codeToHighlight) {
        activeInputCodes.delete(codeToHighlight);
    }

    const keyVisuals = document.querySelectorAll(`.key[data-code="${codeToHighlight}"]`);
    keyVisuals.forEach(el => el.classList.remove("pressed"));

    updateLEDs(e);
});

window.initShortcuts = initShortcuts;
initShortcuts();