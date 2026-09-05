window.SHORTCUTS = window.SHORTCUTS || {
    data: null
};

// Funkcja pobierająca aktualną wersję z <html>, AppState lub localStorage
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

// Główna funkcja inicjalizująca dla podstrony
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
                    tableContainer.innerHTML = "<p class='no-data'>⚠️ Nie udało się wczytać pliku data/skroty.json. Uruchom stronę przez lokalny serwer (np. Live Server).</p>";
                }
            });
    }
}

// Aktualizacja diod LED na podstawie stanu klawiatury
function updateLEDs(e) {
    if (!e || typeof e.getModifierState !== "function") return;

    const numLed = document.getElementById("led-num");
    const capsLed = document.getElementById("led-caps");
    const scrollLed = document.getElementById("led-scroll");

    if (numLed) numLed.classList.toggle("active", e.getModifierState("NumLock"));
    if (capsLed) capsLed.classList.toggle("active", e.getModifierState("CapsLock"));
    if (scrollLed) scrollLed.classList.toggle("active", e.getModifierState("ScrollLock"));
}

// Rejestracja zdarzeń klawiatury i myszy (jednorazowo)
if (!window.SHORTCUTS_LISTENERS_BOUND) {
    window.SHORTCUTS_LISTENERS_BOUND = true;

    document.addEventListener("versionChanged", () => {
        renderCurrentVersionView();
    });

    const htmlObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "data-game-version") {
                renderCurrentVersionView();
            }
        });
    });
    htmlObserver.observe(document.documentElement, { attributes: true });

    window.addEventListener("mousedown", (e) => {
        if (e.target.closest("#controller-view")) return;
        const buttonCode = e.button === 0 ? "MouseLeft" : e.button === 2 ? "MouseRight" : "MouseMiddle";
        const mouseVisual = document.querySelector(`.mouse-btn[data-code="${buttonCode}"]`);
        if (mouseVisual) mouseVisual.classList.add("pressed");
    });

    window.addEventListener("mouseup", (e) => {
        const buttonCode = e.button === 0 ? "MouseLeft" : e.button === 2 ? "MouseRight" : "MouseMiddle";
        const mouseVisual = document.querySelector(`.mouse-btn[data-code="${buttonCode}"]`);
        if (mouseVisual) mouseVisual.classList.remove("pressed");
    });
}

function renderCurrentVersionView() {
    const currentVersion = getActiveVersion();
    const controllerContainer = document.getElementById("controller-view");
    const tableContainer = document.getElementById("skroty-table-container");

    if (!controllerContainer || !tableContainer) return;

    // Generowanie wizualnego kontrolera
    if (currentVersion === "pz1pc") {
        controllerContainer.innerHTML = generatePCControlsHTML();
    } else if (currentVersion === "pz1console") {
        controllerContainer.innerHTML = generateGamepadHTML();
    } else {
        controllerContainer.innerHTML = `
            <div class="empty-state">
                <p>🛠️ Brak zdefiniowanego kontrolera dla wybranej wersji (${currentVersion}).</p>
            </div>
        `;
    }

    // Generowanie tabeli ze skrótami
    if (!SHORTCUTS.data) return;

    const list = SHORTCUTS.data[currentVersion] || [];

    if (list.length === 0) {
        tableContainer.innerHTML = `<p class='no-data'>Brak zarejestrowanych skrótów dla wersji: <b>${currentVersion}</b>.</p>`;
        return;
    }

    let html = `
        <table class="skroty-table">
            <thead>
                <tr>
                    <th>Przycisk</th>
                    <th>Akcja</th>
                    <th>Kategoria</th>
                </tr>
            </thead>
            <tbody>
    `;

    list.forEach(item => {
        html += `
            <tr id="row-${item.id}">
                <th><span class="key-badge">${item.display}</span></th>
                <td>${item.title}</td>
                <td><small>${item.category || "Ogólne"}</small></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

function generatePCControlsHTML() {
    return `
        <div class="pc-controls-wrapper">
            <div class="keyboard-container">
                <div class="keyboard-main">
                    <!-- Rząd Esc + F1-F12 z odstępami -->
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
                    <!-- Rząd cyfr i znaków -->
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
                    <!-- Rząd Tab + QWERTY + [, ], \ -->
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
                    <!-- Rząd CapsLock + ASDF + Enter -->
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
                    <!-- Rząd Shift + ZXCV + Shift Prawy -->
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
                    <!-- Dolny Rząd -->
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

                <!-- Blok Nawigacyjny / Systemowy -->
                <div class="keyboard-nav">
                    <!-- Kontrolki LED -->
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
                    <!-- Linia F12: PrtScn, ScrLk, Pause -->
                    <div class="key-row">
                        <div class="key small" data-code="PrintScreen">PrtSc</div>
                        <div class="key small" data-code="ScrollLock">ScrLk</div>
                        <div class="key small" data-code="Pause">Pause</div>
                    </div>
                    <!-- Linia cyfr: Ins, Home, PgUp -->
                    <div class="key-row">
                        <div class="key" data-code="Insert">Ins</div>
                        <div class="key" data-code="Home">Home</div>
                        <div class="key" data-code="PageUp">PgUp</div>
                    </div>
                    <!-- Linia QWERTY: Del, End, PgDn -->
                    <div class="key-row">
                        <div class="key" data-code="Delete">Del</div>
                        <div class="key" data-code="End">End</div>
                        <div class="key" data-code="PageDown">PgDn</div>
                    </div>
                    
                    <div class="nav-spacer"></div>

                    <!-- Strzałka w górę -->
                    <div class="key-row">
                        <div class="key-placeholder"></div>
                        <div class="key" data-code="ArrowUp">↑</div>
                        <div class="key-placeholder"></div>
                    </div>
                    <!-- Strzałki lewo, dół, prawo -->
                    <div class="key-row">
                        <div class="key" data-code="ArrowLeft">←</div>
                        <div class="key" data-code="ArrowDown">↓</div>
                        <div class="key" data-code="ArrowRight">→</div>
                    </div>
                </div>
            </div>

            <!-- Myszka -->
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
        <div class="gamepad-container">
            <svg class="gamepad-svg" viewBox="0 0 500 300">
                <path d="M 120,40 Q 250,20 380,40 Q 480,80 450,240 Q 400,280 340,220 Q 250,240 160,220 Q 100,280 50,240 Q 20,80 120,40 Z" fill="#1f2937" stroke="#374151" stroke-width="4"/>
                <g class="pad-dpad" fill="#374151">
                    <rect x="110" y="110" width="20" height="60" rx="4"/>
                    <rect x="90" y="130" width="60" height="20" rx="4"/>
                </g>
                <g class="pad-buttons">
                    <circle cx="370" cy="115" r="12" fill="#374151"/><text x="370" y="119" fill="#fff" font-size="12" text-anchor="middle">Y</text>
                    <circle cx="345" cy="140" r="12" fill="#374151"/><text x="345" y="144" fill="#fff" font-size="12" text-anchor="middle">X</text>
                    <circle cx="395" cy="140" r="12" fill="#374151"/><text x="395" y="144" fill="#fff" font-size="12" text-anchor="middle">B</text>
                    <circle cx="370" cy="165" r="12" fill="#374151"/><text x="370" y="169" fill="#fff" font-size="12" text-anchor="middle">A</text>
                </g>
                <circle cx="180" cy="180" r="28" fill="#111827" stroke="#4b5563" stroke-width="3"/>
                <circle cx="310" cy="180" r="28" fill="#111827" stroke="#4b5563" stroke-width="3"/>
                <rect x="215" y="115" width="25" height="12" rx="4" fill="#4b5563"/>
                <rect x="260" y="115" width="25" height="12" rx="4" fill="#4b5563"/>
            </svg>
        </div>
    `;
}

function initToast() {
    if (!document.getElementById("shortcut-toast")) {
        const toast = document.createElement("div");
        toast.id = "shortcut-toast";
        document.body.appendChild(toast);
    }
}

function checkAndShowShortcut(e) {
    const currentVersion = getActiveVersion();
    const list = SHORTCUTS.data ? SHORTCUTS.data[currentVersion] : null;
    if (!list) return;

    let combo = [];
    if (e.ctrlKey) combo.push("ControlLeft");
    if (e.shiftKey) combo.push("ShiftLeft");
    if (!["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight"].includes(e.code)) {
        combo.push(e.code);
    }
    const comboStr = combo.join("+");

    const matched = list.find(item =>
        item.codes && (item.codes.includes(e.code) || item.codes.includes(comboStr))
    );

    if (matched) {
        showToast(`${matched.display} — ${matched.title}`);
    }
}

function showToast(text) {
    const toast = document.getElementById("shortcut-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("visible");

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 2000);
}

// Mapa zamienna dla klawiszy numerycznych działających jako nawigacja
function getTargetCode(e) {
    const numpadToNav = {
        "Home": "Home",
        "End": "End",
        "PageUp": "PageUp",
        "PageDown": "PageDown",
        "Insert": "Insert",
        "Delete": "Delete",
        "ArrowUp": "ArrowUp",
        "ArrowDown": "ArrowDown",
        "ArrowLeft": "ArrowLeft",
        "ArrowRight": "ArrowRight"
    };

    if (e.code.startsWith("Numpad") && numpadToNav[e.key]) {
        return numpadToNav[e.key];
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
    const keyVisuals = document.querySelectorAll(`.key[data-code="${codeToHighlight}"]`);
    keyVisuals.forEach(el => el.classList.add("pressed"));

    updateLEDs(e);
    checkAndShowShortcut(e);
});

window.addEventListener("keyup", (e) => {
    const codeToHighlight = getTargetCode(e);
    const keyVisuals = document.querySelectorAll(`.key[data-code="${codeToHighlight}"]`);
    keyVisuals.forEach(el => el.classList.remove("pressed"));

    updateLEDs(e);
});

// Uruchomienie natychmiastowe przy dołączeniu skryptu do DOM
window.initShortcuts = initShortcuts;
initShortcuts();