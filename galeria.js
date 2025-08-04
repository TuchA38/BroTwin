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

        showOverlay();
        showImage(currentIndex);
    });
});

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