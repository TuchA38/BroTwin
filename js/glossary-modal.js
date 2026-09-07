// =====================================
// MODAL SŁOWNIKA – SPA SAFE
// =====================================

window.glossaryData = window.glossaryData || {};

// Pobieramy bazę pojęć
fetch("data/slownik.json")
    .then(r => r.json())
    .then(data => window.glossaryData = data)
    .catch(err => console.error("Błąd pobierania słownika do modala:", err));

// ----------------------
// Otwieranie modala (delegacja – działa zawsze)
// ----------------------
document.addEventListener("click", e => {
    const el = e.target.closest(".glossary-link");
    if (!el) return;

    const key = el.dataset.key;
    const data = window.glossaryData[key];
    if (!data) return;

    const glossaryModal = document.getElementById("glossary-modal");
    const titleEl = document.getElementById("glossary-title");
    const defEl = document.getElementById("glossary-definition");
    const moreEl = document.getElementById("glossary-more");

    if (!glossaryModal || !titleEl || !defEl || !moreEl) return;

    titleEl.textContent = data.title;
    defEl.textContent = data.definition;

    if (window.addNonBreakingSpaces) {
        window.addNonBreakingSpaces(defEl);
    }

    // Przycisk przenoszący do słownika
    moreEl.innerHTML = `
        <a href="slownik.html#glossary-${encodeURIComponent(key)}" class="glossary-more-link" data-term="${encodeURIComponent(key)}">
            Więcej pojęć
        </a>
    `;

    // Obsługa kliknięcia "Więcej pojęć"
    moreEl.querySelector(".glossary-more-link").onclick = (evt) => {
        evt.preventDefault();
        const term = evt.currentTarget.dataset.term;

        // 1. Zamykamy modal
        glossaryModal.classList.remove("show");
        setTimeout(() => glossaryModal.classList.add("hidden"), 200);

        // 2. Zapisujemy klucz słówka w zmiennych globalnych (zabezpieczenie SPA)
        window.targetGlossaryKey = term;
        window.glossaryTermToOpen = term;

        // 3. Przechodzimy do strony /slownik (SPA lub tradycyjny przekierowanie)
        if (window.loadPage && typeof window.loadPage === "function") {
            window.loadPage("slownik");
        } else {
            window.location.href = `slownik.html#glossary-${term}`;
        }
    };

    glossaryModal.classList.remove("hidden");
    glossaryModal.classList.add("show");

    initGlossaryModalUI();
});

// ----------------------
// Funkcja przypinająca zamykanie modala
// ----------------------
function initGlossaryModalUI() {
    const glossaryModal = document.getElementById("glossary-modal");
    const closeBtn = document.getElementById("close-glossary");

    if (!glossaryModal || !closeBtn) return;

    closeBtn.onclick = () => {
        glossaryModal.classList.remove("show");
        setTimeout(() => glossaryModal.classList.add("hidden"), 200);
    };

    glossaryModal.onclick = (e) => {
        if (e.target === glossaryModal) {
            glossaryModal.classList.remove("show");
            setTimeout(() => glossaryModal.classList.add("hidden"), 200);
        }
    };
}