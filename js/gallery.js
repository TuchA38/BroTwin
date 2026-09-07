// =====================================
// GALLERY.JS – SPA-SAFE LIGHTBOX WITH REWARDS
// =====================================

// -------------------------------------
// 1️⃣ zmienne globalne
// -------------------------------------
window.currentIndex = window.currentIndex || 0;
window.currentGallery = window.currentGallery || [];
window.startX = window.startX || 0;
window.galleryKeyboardInitialized = window.galleryKeyboardInitialized || false;
window.galleryOptions = window.galleryOptions || {};

// -------------------------------------
// 2️⃣ otwieranie / zamykanie galerii
// -------------------------------------
window.openGallery = function(index, images, options = {}) {
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("gallery-lightbox-img");
    if (!lightbox || !lightboxImg) return;

    // 🔥 KLON TABLICY – ważne przy wielu galeriach
    window.currentGallery = images.slice();
    window.currentIndex = index;
    window.galleryOptions = options || {}; // Zapamiętujemy opcje (np. warianty nagród)

    lightbox.classList.remove("hidden");
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";

    window.showImage(window.currentIndex);

    // 🔑 podpinamy UI + kropki wariantu ZA KAŻDYM OTWARCIEM
    initGalleryControls();
    renderGalleryDots();
};

window.closeGallery = function() {
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("gallery-lightbox-img");
    const lightboxVid = document.getElementById("gallery-lightbox-video");
    if (!lightbox) return;

    lightbox.classList.remove("show");
    lightbox.classList.add("hidden");
    document.body.style.overflow = "";

    if (lightboxImg) lightboxImg.style.opacity = 0;
    if (lightboxVid) {
        lightboxVid.style.opacity = 0;
        lightboxVid.pause();
        lightboxVid.src = "";
    }

    // Usuń kropki przy zamknięciu
    const dotsContainer = lightbox.querySelector(".gallery-reward-dots");
    if (dotsContainer) dotsContainer.remove();
    window.galleryOptions = {};
};

// -------------------------------------
// 3️⃣ wyświetlanie zdjęć
// -------------------------------------
window.showImage = function(index) {
    const lightboxImg = document.getElementById("gallery-lightbox-img");
    const lightboxVid = document.getElementById("gallery-lightbox-video");
    if ((!lightboxImg && !lightboxVid) || !window.currentGallery.length) return;

    window.currentIndex = index;
    const currentSrc = window.currentGallery[window.currentIndex];
    const isVideo = currentSrc.endsWith(".mp4") || currentSrc.includes("/video/");

    if (lightboxImg) lightboxImg.style.opacity = 0;
    if (lightboxVid) lightboxVid.style.opacity = 0;

    setTimeout(() => {
        if (isVideo && lightboxVid) {
            if (lightboxImg) lightboxImg.style.display = "none";
            lightboxVid.style.display = "block";
            lightboxVid.src = currentSrc;
            lightboxVid.play();
            requestAnimationFrame(() => { lightboxVid.style.opacity = 1; });
        } else if (lightboxImg) {
            if (lightboxVid) {
                lightboxVid.style.display = "none";
                lightboxVid.pause();
            }
            lightboxImg.style.display = "block";
            lightboxImg.src = currentSrc;
            requestAnimationFrame(() => { lightboxImg.style.opacity = 1; });
        }
    }, 150);
};

window.nextImage = function() {
    if (window.currentGallery.length <= 1) return;
    window.currentIndex = (window.currentIndex + 1) % window.currentGallery.length;
    window.showImage(window.currentIndex);
};

window.prevImage = function() {
    if (window.currentGallery.length <= 1) return;
    window.currentIndex =
        (window.currentIndex - 1 + window.currentGallery.length) %
        window.currentGallery.length;
    window.showImage(window.currentIndex);
};

// -------------------------------------
// 4️⃣ UI – guziki + klik poza zdjęciem
// -------------------------------------
function initGalleryControls() {
    const lightbox = document.getElementById("gallery-lightbox");
    if (!lightbox) return;

    const btnClose = lightbox.querySelector(".gallery-close");
    const btnNext = lightbox.querySelector(".gallery-next");
    const btnPrev = lightbox.querySelector(".gallery-prev");

    const single = window.currentGallery.length <= 1;

    // 🔽 STRZAŁKI – tylko jeśli >1 zdjęcie
    if (btnNext) btnNext.style.display = single ? "none" : "";
    if (btnPrev) btnPrev.style.display = single ? "none" : "";

    if (btnClose) btnClose.onclick = window.closeGallery;
    if (!single && btnNext) btnNext.onclick = window.nextImage;
    if (!single && btnPrev) btnPrev.onclick = window.prevImage;

    // kliknięcie w tło
    lightbox.onclick = e => {
        if (e.target === lightbox) window.closeGallery();
    };
}

// -------------------------------------
// 5️⃣ RENDEROWANIE KROPEK PRZY ZDJĘCIU W LIGHTBOXIE
// -------------------------------------
function renderGalleryDots() {
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("gallery-lightbox-img");
    if (!lightbox || !lightboxImg) return;

    // Usuwamy stare kropki jeśli gdzieś istnieją
    let dotsContainer = lightbox.querySelector(".gallery-reward-dots");
    if (dotsContainer) dotsContainer.remove();

    const rewardImages = window.galleryOptions && window.galleryOptions.rewardImages;
    if (!rewardImages) return;

    const keys = Object.keys(rewardImages);
    if (keys.length <= 1) return;

    const labels = {
        stone: 'Kamień',
        bronze: 'Brąz',
        silver: 'Srebro',
        gold: 'Złoto'
    };

    const currentActiveVariant = window.galleryOptions.activeVariant || keys[0];

    dotsContainer = document.createElement("div");
    dotsContainer.className = "gallery-reward-dots";

    dotsContainer.innerHTML = keys.map(key => {
        const activeClass = key === currentActiveVariant ? 'active' : '';
        return `<span class="reward-dot dot-${key} ${activeClass}" data-variant="${key}" title="${labels[key] || key}"></span>`;
    }).join('');

    // 🔥 DOKLEJAMY KROPKI DO ELEMENTU-RODZICA ZDJĘCIA (ZAMIAST CAŁEGO LIGHTBOXA)
    const targetParent = lightboxImg.parentElement || lightbox;
    targetParent.appendChild(dotsContainer);

    // Biskowanie kliknięcia w kropki
    const dots = dotsContainer.querySelectorAll(".reward-dot");
    dots.forEach(dot => {
        dot.onclick = (e) => {
            e.stopPropagation(); // Blokuje zamykanie galerii
            const variant = dot.dataset.variant;
            const newSrc = rewardImages[variant];
            if (newSrc) {
                lightboxImg.src = newSrc;
                window.currentGallery[window.currentIndex] = newSrc;
                window.galleryOptions.activeVariant = variant;

                dots.forEach(d => d.classList.remove("active"));
                dot.classList.add("active");
            }
        };
    });
}

// -------------------------------------
// 6️⃣ KLAWIATURA – tylko raz (SPA-safe)
// -------------------------------------
function initGalleryKeyboard() {
    if (window.galleryKeyboardInitialized) return;
    window.galleryKeyboardInitialized = true;

    document.addEventListener("keydown", e => {
        const lb = document.getElementById("gallery-lightbox");
        if (!lb || !lb.classList.contains("show")) return;

        if (e.key === "Escape") {
            window.closeGallery();
            return;
        }

        if (window.currentGallery.length <= 1) return;

        if (e.key === "ArrowRight") window.nextImage();
        if (e.key === "ArrowLeft") window.prevImage();
    });
}

initGalleryKeyboard();

// -------------------------------------
// 7️⃣ SWIPE / TOUCH (Mobile)
// -------------------------------------
function initGallerySwipe() {
    const lightboxImg = document.getElementById("gallery-lightbox-img");
    if (!lightboxImg) return;

    lightboxImg.addEventListener("touchstart", e => {
        window.startX = e.touches[0].clientX;
    });

    lightboxImg.addEventListener("touchend", e => {
        if (window.currentGallery.length <= 1) return;

        const diff = e.changedTouches[0].clientX - window.startX;
        if (diff > 50) window.prevImage();
        if (diff < -50) window.nextImage();
    });
}

initGallerySwipe();