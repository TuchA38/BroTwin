const overlay = document.createElement('div');
overlay.id = 'lightbox-overlay';
overlay.innerHTML = `
  <span id="lightbox-close" class="lightbox-close">&times;</span>
  <img id="lightbox-image" src="" alt="">
  <div id="lightbox-caption"></div>
  <span id="lightbox-prev" class="lightbox-nav">&#10094;</span>
  <span id="lightbox-next" class="lightbox-nav">&#10095;</span>
`;
document.body.appendChild(overlay);

const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeBtn = document.getElementById('lightbox-close');
const preveBtn = document.getElementById('lightbox-prev');
const nexteBtn = document.getElementById('lightbox-next');

let currentIndex = 0;
let currentGalleryImages = [];

function showOverlay() {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('show'));
}

function hideOverlay() {
    overlay.classList.add('hiding');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.classList.remove('hiding');
        overlay.style.display = 'none';
    }, 300);
}

function showImage(index, direction = 'right') {
    const item = currentGalleryImages[index];
    if (!item) return;

    lightboxImage.classList.remove('show', 'enter-left', 'enter-right');

    const enterClass = direction === 'right' ? 'enter-right' : 'enter-left';
    lightboxImage.classList.add(enterClass);

    setTimeout(() => {
        lightboxImage.src = item.src;
        lightboxCaption.textContent = item.dataset.caption || item.alt || '';
        currentIndex = index;

        lightboxImage.onload = () => {
            lightboxImage.classList.remove('enter-left', 'enter-right');
            lightboxImage.classList.add('show');
        };
    }, 100);
}

// Kliknięcie miniatury
document.querySelectorAll('.gallery-image').forEach(img => {
    img.addEventListener('click', e => {
        const clickedImg = e.currentTarget;
        const gallery = clickedImg.closest('.gallery');
        currentGalleryImages = Array.from(gallery.querySelectorAll('.gallery-image'));
        currentIndex = currentGalleryImages.indexOf(clickedImg);

        // ukryj strzałki, jeśli tylko jedno zdjęcie
        if (currentGalleryImages.length <= 1) {
            preveBtn.style.display = "none";
            nexteBtn.style.display = "none";
        } else {
            preveBtn.style.display = "block";
            nexteBtn.style.display = "block";
        }

        showOverlay();
        showImage(currentIndex);
    });
});

let scale = 1;
let lastTouchX = 0;
let lastTouchY = 0;
let translateX = 0;
let translateY = 0;

// Nawigacja
preveBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    showImage(newIndex, 'left');
});
nexteBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % currentGalleryImages.length;
    showImage(newIndex, 'right');
});

// Zamknięcie
closeBtn.addEventListener('click', hideOverlay);
overlay.addEventListener('click', e => {
    if (e.target === overlay) hideOverlay();
});
document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('show')) return;
    if (e.key === 'Escape') hideOverlay();
    if (e.key === 'ArrowRight') nexteBtn.click();
    if (e.key === 'ArrowLeft') preveBtn.click();
});

let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
    const swipeDistance = touchEndX - touchStartX;

    // jeśli obrazek jest powiększony, nie zmieniaj
    if (lightboxImage.naturalWidth > lightboxImage.clientWidth * 1.2) {
        return;
    }

    if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance < 0) {
            const newIndex = (currentIndex + 1) % currentGalleryImages.length;
            showImage(newIndex, 'right');
        } else {
            const newIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            showImage(newIndex, 'left');
        }
    }
}

let initialDistance = 0;

overlay.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        touchStartX = e.touches[0].screenX;
    }
});

overlay.addEventListener("touchmove", e => {
    if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        scale = Math.min(Math.max(1, newDistance / initialDistance), 4); // 1x–4x
        lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    } else if (e.touches.length === 1 && scale > 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        translateX += dx;
        translateY += dy;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        lightboxImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
});

overlay.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;

    if (scale === 1) {
        handleGesture(); // normalne przełączanie zdjęć
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const caption = document.getElementById("lightbox-caption");

    if (caption) {
        const observer = new MutationObserver(() => {
            if (caption.textContent.trim() === "") {
                caption.style.background = "none";
                caption.style.padding = "0";
            } else {
                caption.style.background = "rgba(0,0,0,0.6)";
                caption.style.padding = "6px 10px";
            }
        });

        observer.observe(caption, { childList: true, subtree: true, characterData: true });
    }
});