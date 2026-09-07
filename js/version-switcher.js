(() => {

    const toggleBtn = document.getElementById("version-toggle");
    const versionModal = document.getElementById("version-modal");
    const modalContent = versionModal.querySelector(".version-modal-content");
    const closeBtn = versionModal.querySelector(".version-modal-close");

    // floating button
    const floatingIcon = document.getElementById("version-icon");

    // menu icons
    const menuIconMobile = document.getElementById("menu-version-icon-mobile");
    const menuIconDesktop = document.getElementById("menu-version-icon-desktop");

    /* 🗺️ MAPA OBRAZÓW WERSJI */
    const VERSION_IMAGES = {
        pz1pc: {
            normal: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861245/Planet_Zoo_pc_uxtfas.webp",
            mobile: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861244/Planet_Zoo_pc_BIG_cmwftl.webp",
            desktop: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861244/Planet_Zoo_pc_BIG_cmwftl.webp"
        },
        pz1console: {
            normal: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861244/Planet_Zoo_konsola_axcsdt.webp",
            mobile: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861250/Planet_Zoo_konsola_BIG_zjrmwe.webp",
            desktop: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861250/Planet_Zoo_konsola_BIG_zjrmwe.webp"
        },
        pz2: {
            normal: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1782578784/Planet_Zoo_2_lkh5m4.webp",
            mobile: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861249/Planet_Zoo_PZ2_ukejnn.webp",
            desktop: "https://res.cloudinary.com/ddqbmcmoe/image/upload/v1769861249/Planet_Zoo_PZ2_ukejnn.webp"
        }
    };

    /* 🔧 Ustawianie ikon */
    function setVersionIcons(version) {
        const images = VERSION_IMAGES[version];
        if (!images) return;

        if (floatingIcon) floatingIcon.src = images.normal;
        if (menuIconMobile) menuIconMobile.src = images.mobile;
        if (menuIconDesktop) menuIconDesktop.src = images.desktop;
    }

    /* 🔘 OTWIERANIE */
    function openModal() {
        versionModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    /* ❌ ZAMYKANIE */
    function closeModal() {
        versionModal.classList.remove("show");

        // poczekaj aż skończy się animacja
        setTimeout(() => {
            document.body.style.overflow = "";
        }, 250); // MUSI = transition w CSS
    }


    toggleBtn.addEventListener("click", openModal);

    [menuIconMobile, menuIconDesktop].forEach(icon => {
        if (icon) icon.addEventListener("click", openModal);
    });

    // klik w tło
    versionModal.addEventListener("click", e => {
        if (e.target === versionModal) closeModal();
    });

    // klik w X
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // klik w środek nie zamyka
    modalContent.addEventListener("click", e => e.stopPropagation());

    // ESC
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeModal();
    });

    /* 🎯 wybór wersji */
    versionModal.querySelectorAll("[data-version]").forEach(btn => {
        btn.addEventListener("click", () => {
            try {
                const version = btn.dataset.version;

                AppState.set(version);
                setVersionIcons(version);

                window.dispatchEvent(
                    new CustomEvent("versionChanged", {
                        detail: { version }
                    })
                );

            } finally {
                closeModal(); // zamyka modal zawsze
            }
        });
    });


    /* 🔁 synchronizacja */
    function syncIconWithState() {
        setVersionIcons(AppState.get());

        // 🔹 aktualizacja footer przy każdej zmianie wersji
        if (window.renderFooter) window.renderFooter();
    }

    // Wywołanie na start strony
    syncIconWithState();

    // 🔥 NOWOŚĆ: Nasłuchiwanie na zmianę wersji w obrębie tej samej karty (np. kliknięcie ikony DLC)
    document.addEventListener("versionChanged", () => {
        syncIconWithState();
    });

    // Nasłuchiwanie zmian z innych kart przeglądarki
    window.addEventListener("storage", e => {
        if (e.key === AppState.key) syncIconWithState();
    });

    // aby UPDATES mogło synchronizować ikonki
    window.syncIconWithState = syncIconWithState;

})();