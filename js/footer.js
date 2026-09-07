(() => {
    let footerData = null;
    let lastVersion = null; // pamiętamy ostatnią wyrenderowaną wersję

    async function loadFooterData() {
        if (footerData) return footerData;
        const res = await fetch("data/footer.json");
        footerData = await res.json();
        return footerData;
    }

    function renderFooter() {
        const footer = document.getElementById("footer-links");
        if (!footer || !footerData) return;

        const version = AppState.get(); // JEDYNE ŹRÓDŁO PRAWDY
        if (version === lastVersion) return; // nic nie zmieniamy, jeśli wersja ta sama
        lastVersion = version; // aktualizujemy wersję

        const data = footerData[version];
        footer.innerHTML = "";
        if (!data) return;

        data.links.forEach(link => {
            const a = document.createElement("a");
            a.href = link.url;
            a.target = "_blank";

            const img = document.createElement("img");
            img.src = link.icon;
            img.alt = link.alt;
            img.classList.add("footer-img");

            if (link.size) img.style.width = link.size + "px";
            if (link.margin) a.style.margin = link.margin;

            a.appendChild(img);
            footer.appendChild(a);
        });

        // 🔹 aktualizacja roku w stopce
        const yearEl = document.getElementById("footer-year");
        if (yearEl) {
            const currentYear = new Date().getFullYear();
            yearEl.textContent = `Planet Zoo © 2021-${currentYear} Frontier Developments plc. Wszelkie prawa zastrzeżone.`;
        }
    }

    window.renderFooter = renderFooter; // dzięki temu inne skrypty mogą wywołać

    async function initFooter() {
        await loadFooterData();

        // 🔹 render przy starcie
        renderFooter();

        // 🔹 reaguj na zdarzenie versionChanged
        window.addEventListener("versionChanged", renderFooter);

        // 🔹 reaguj na zmianę w innej karcie / storage
        window.addEventListener("storage", e => {
            if (e.key === AppState.key) renderFooter();
        });
    }

    initFooter();
})();