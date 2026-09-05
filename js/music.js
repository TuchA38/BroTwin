// Usunięto: const audio = document.getElementById("music-player"); ❌
const musicModal = document.getElementById("music-modal");
const tracksPanel = document.getElementById("tracks-panel");
const albumsPanel = document.getElementById("albums-panel");
const playBtn = document.getElementById("play");

let albumsData = null;
let currentAlbum = null;

let currentAlbumIndex = 0;
let currentTrackIndex = 0;
let playMode = "normal"; // normal | loop-one | shuffle

const trackToggleBtn = document.getElementById("toggle-tracks");
const albumToggleBtn = document.getElementById("toggle-albums");
const tracksPanelClose = document.querySelector("#tracks-panel .panel-close");
const albumsPanelClose = document.querySelector("#albums-panel .panel-close");

// na start ukryte
tracksPanel.classList.remove("open");
albumsPanel.classList.remove("open");

function openPanel(panel) {
    panel.classList.remove("open"); // stan startowy
    panel.offsetHeight; // 🔥 FORCED REFLOW
    panel.classList.add("open"); // animacja ruszy
}

// klik w nutki
if (trackToggleBtn) {
    trackToggleBtn.addEventListener("click", () => {
        openPanel(tracksPanel);
        albumsPanel.classList.remove("open");
    });
}

// klik w płytę
if (albumToggleBtn) {
    albumToggleBtn.addEventListener("click", () => {
        openPanel(albumsPanel);
        tracksPanel.classList.add("open"); // ukryj panele tracków
    });
}

// klik w X w panelu
if (tracksPanelClose) tracksPanelClose.addEventListener("click", () => tracksPanel.classList.remove("open"));
if (albumsPanelClose) albumsPanelClose.addEventListener("click", () => albumsPanel.classList.remove("open"));


/* ================= YOUTUBE API INTEGRATION ================= */
let ytPlayer = null;
let ytReady = false;

// Ładowanie skryptu Iframe API od YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Funkcja wywoływana automatycznie przez YouTube po załadowaniu API
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '', // startuje puste
        playerVars: {
            'autoplay': 0,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    ytReady = true;
    setInterval(updateProgressFromYT, 500);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        nextTrack();
    }
}

/* ================= FUNKCJA EFEKTU BLUR (ZOOPEDIA STYLE) ================= */
function triggerContentBlur(updateCallback) {
    // Pobieramy oba elementy osobno
    const playerMain = document.querySelector(".player-main");
    const tekstDesc = document.querySelector(".tekst");

    // Jeśli żaden z nich nie istnieje, po prostu wykonujemy aktualizację i przerywamy
    if (!playerMain && !tekstDesc) {
        updateCallback();
        return;
    }

    // Dodajemy klasę blur do istniejących elementów
    if (playerMain) playerMain.classList.add("music-loading-blur");
    if (tekstDesc) tekstDesc.classList.add("music-loading-blur");

    setTimeout(() => {
        updateCallback();

        setTimeout(() => {
            // Usuwamy klasę blur po zakończeniu animacji
            if (playerMain) playerMain.classList.remove("music-loading-blur");
            if (tekstDesc) tekstDesc.classList.remove("music-loading-blur");
        }, 150);
    }, 200);
}

/* ================= OBSŁUGA PRZYCISKU DLC ================= */
function updateDlcButton(album) {
    const dlcBtn = document.getElementById("album-dlc-btn");
    if (!dlcBtn || !album) return;

    // 1. Pobieramy aktualny stan aplikacji (np. "pz1pc", "pz1console" lub "pz2")
    const currentAppState = typeof AppState !== "undefined" && AppState.get ? AppState.get() : "pz1pc";

    // Słownik mapujący album do odpowiednich DLC na danej platformie/wersji
    const albumToDlcMap = {
        "pz1pc": {
            "pz-deluxe": "deluxe-edition",
            "pz-arctic-pack": "arctic-pack",
            "pz-south-america-pack": "south-america-pack",
            "pz-australia-pack": "australia-pack",
            "pz-aquatic-pack": "aquatic-pack",
            "pz-southeast-asia-animal-pack": "southeast-asia-animal-pack",
            "pz-africa-pack": "africa-pack",
            "pz-north-america-animal-pack": "north-america-animal-pack",
            "pz-europe-pack": "europe-pack",
            "pz-conservation-pack": "conservation-pack",
            "pz-twilight-pack": "twilight-pack",
            "pz-grasslands-animal-pack": "grasslands-animal-pack",
            "pz-tropical-pack": "tropical-pack",
            "pz-arid-animal-pack": "arid-animal-pack",
            "pz-oceania-pack": "oceania-pack",
            "pz-eurasia-animal-pack": "eurasia-animal-pack",
            "pz-afryka": "planet-zoo",
            "pz-indie": "planet-zoo",
            "pz-ameryka-polnocna": "planet-zoo",
            "pz-azja": "planet-zoo",
            "pz-klasyka": "planet-zoo",
            "pz-planet-zoo": "planet-zoo"
        },
        "pz1console": {
            "pz-deluxe": "deluxe-edition-console",
            "pz-arctic-pack": "arctic&conservation-bundle",
            "pz-south-america-pack": "australia&south-america-bundle",
            "pz-australia-pack": "australia&south-america-bundle",
            "pz-aquatic-pack": "aquatic&twilight-bundle",
            "pz-southeast-asia-animal-pack": "deluxe-edition-console",
            "pz-africa-pack": "grasslands&africa-bundle",
            "pz-north-america-animal-pack": "north-america&europe-bundle",
            "pz-europe-pack": "north-america&europe-bundle",
            "pz-conservation-pack": "arctic&conservation-bundle",
            "pz-twilight-pack": "aquatic&twilight-bundle",
            "pz-grasslands-animal-pack": "grasslands&africa-bundle",
            "pz-tropical-pack": "arid&tropical-bundle",
            "pz-arid-animal-pack": "arid&tropical-bundle",
            "pz-oceania-pack": "oceania&eurasia-bundle",
            "pz-eurasia-animal-pack": "oceania&eurasia-bundle",
            "pz-afryka": "planet-zoo-console-edition",
            "pz-indie": "planet-zoo-console-edition",
            "pz-ameryka-polnocna": "planet-zoo-console-edition",
            "pz-azja": "planet-zoo-console-edition",
            "pz-klasyka": "planet-zoo-console-edition",
            "pz-planet-zoo": "planet-zoo-console-edition"
        },
        "pz2": {
            "": ""
        }
    };

    // 2. Szukamy odpowiedniego dlcId oraz targetVersion
    let dlcId = null;
    let targetVersion = currentAppState;

    // Krok A: Sprawdzamy, czy w aktualnej wersji AppState jest wpis dla tego albumu
    if (albumToDlcMap[currentAppState] && albumToDlcMap[currentAppState][album.id]) {
        dlcId = albumToDlcMap[currentAppState][album.id];
        targetVersion = currentAppState;
    }
    // Krok B: Jeśli nie ma w aktualnej wersji, sprawdzamy album.version
    else if (album.version && albumToDlcMap[album.version] && albumToDlcMap[album.version][album.id]) {
        dlcId = albumToDlcMap[album.version][album.id];
        targetVersion = album.version;
    }
    // Krok C: Jeśli nadal nie znaleziono, sprawdzamy album.version2
    else if (album.version2 && albumToDlcMap[album.version2] && albumToDlcMap[album.version2][album.id]) {
        dlcId = albumToDlcMap[album.version2][album.id];
        targetVersion = album.version2;
    }

    // 3. Obsługa wyświetlania i kliknięcia
    if (dlcId) {
        dlcBtn.classList.remove("hidden");

        dlcBtn.onclick = () => {
            // Zamknij odtwarzacz muzyczny
            musicModal.classList.add("hidden");
            musicModal.classList.remove("show");
            document.body.classList.remove("modal-open");

            // Switch wersji w AppState (jeśli wymagana jest zmiana widoku/wersji)
            if (AppState && typeof AppState.set === "function" && AppState.get() !== targetVersion) {
                AppState.set(targetVersion);
            }

            // Załaduj i otwórz stronę DLC
            if (window.loadPage && typeof window.loadPage === "function") {
                window.loadPage("dlc").then(() => {
                    const openDlcModal = () => {
                        const currentVer = AppState.get();

                        // Szukamy DLC pasującego po ID oraz po zaktualizowanej wersji
                        const dlcItem = window.DLC && window.DLC.data && window.DLC.data.find(d =>
                            d.id === dlcId && d.version === currentVer
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
    } else {
        dlcBtn.classList.add("hidden");
    }
}

/* ========= OPEN ========= */

async function openMusic() {
    musicModal.classList.add("show");
    musicModal.classList.remove("hidden"); // Upewniamy się, że zdejmujemy klasę hidden
    document.body.classList.add("modal-open");

    // Jeśli dane nie zostały jeszcze pobrane — pobieramy je po raz pierwszy
    if (!albumsData) {
        const res = await fetch("data/music.json");
        albumsData = await res.json();

        currentAlbumIndex = 0;
        currentAlbum = albumsData.albums[0];
        currentTrackIndex = 0;

        renderAlbums();
        renderTracks();
    }

    // Aktualizujemy TYLKO stan przycisku DLC pod kątem bieżącego AppState bez wywoływania loadAlbum
    if (currentAlbum) {
        updateDlcButton(currentAlbum);
    }

    tracksPanel.classList.remove("open");
    albumsPanel.classList.remove("open");
}

function renderAlbums() {
    if (!albumsData) return;

    const list = document.getElementById("album-list");
    list.innerHTML = "";

    albumsData.albums.forEach((album, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="title">${album.title}</span>
            <span class="count">${album.tracks.length}</span>
        `;

        if (i === currentAlbumIndex) {
            li.classList.add("active");
        }

        li.onclick = () => {
            if (i === currentAlbumIndex) return;
            loadAlbumByIndex(i);
        };

        list.appendChild(li);
    });
}

function renderTracks() {
    if (!currentAlbum) return;

    const list = document.getElementById("track-list");
    list.innerHTML = "";

    currentAlbum.tracks.forEach((track, i) => {
        const li = document.createElement("li");
        // Dodano kontener na tytuł+autor oraz bezpieczne podstawienie autora
        li.innerHTML = `
            <div class="track-meta">
                <span class="title">${track.title}</span>
                <span class="author">${track.author || "J.J. Ipsen"}</span>
            </div>
            <span class="duration">${track.duration}</span>
        `;

        if (i === currentTrackIndex) {
            li.classList.add("active");
        }

        li.onclick = () => {
            if (i === currentTrackIndex) return;
            playTrack(i);
        };

        list.appendChild(li);
    });
}

function playTrack(index) {
    const tracks = currentAlbum.tracks;
    if (index < 0) index = tracks.length - 1;
    if (index >= tracks.length) index = 0;

    currentTrackIndex = index;

    triggerContentBlur(() => {
        renderTracks();
        const track = tracks[index];

        if (ytReady && ytPlayer && track.url) {
            // Zmiana z cueVideoById na loadVideoById powoduje natychmiastowy start utworu!
            ytPlayer.loadVideoById(track.url);
        }

        document.getElementById("current-track").textContent = track.title;
        document.getElementById("current-author").textContent = track.author || "J.J. Ipsen";
        playBtn.innerHTML = '<i class="fas fa-pause"></i>'; // Z automatu dajemy ikonę pauzy, bo gra
        updateMiniTitle();
        miniPlay.textContent = "⏸";
        document.getElementById("duration").textContent = track.duration;
    });
}

/* ========= CONTROLS ========= */

function nextTrack() {
    const tracks = currentAlbum.tracks;

    if (playMode === "loop-one") {
        playTrack(currentTrackIndex);
        return;
    }

    if (playMode === "shuffle") {
        playTrack(Math.floor(Math.random() * tracks.length));
        return;
    }

    playTrack(currentTrackIndex + 1);
}

function prevTrack() {
    playTrack(currentTrackIndex - 1);
}

function changeMode() {
    const btn = document.getElementById("mode");

    if (playMode === "normal") {
        playMode = "loop-one";
        btn.innerHTML = '<i class="fas fa-redo"></i>';
    } else if (playMode === "loop-one") {
        playMode = "shuffle";
        btn.innerHTML = '<i class="fas fa-random"></i>';
    } else {
        playMode = "normal";
        btn.innerHTML = '<i class="fas fa-arrow-right"></i>';
    }
}

function togglePlay() {
    if (!ytReady || !ytPlayer) return;

    const playerState = ytPlayer.getPlayerState();

    if (playerState === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        miniPlay.textContent = "▶";
    } else {
        ytPlayer.playVideo();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        miniPlay.textContent = "⏸";
    }
}

/* ========= EVENTS ========= */

document.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    switch (btn.id) {
        case "album-prev":
            prevAlbum();
            break;
        case "album-next":
            nextAlbum();
            break;
        case "track-prev":
            prevTrack();
            break;
        case "track-next":
            nextTrack();
            break;
        case "play":
            togglePlay();
            break;
        case "mode":
            changeMode();
            break;
        case "toggle-tracks":
            tracksPanel.classList.add("open");
            albumsPanel.classList.remove("open");
            break;
        case "toggle-albums":
            albumsPanel.classList.add("open");
            tracksPanel.classList.remove("open");
            break;
    }
});

/* ========= TIME & PROGRESS ========= */

function updateProgressFromYT() {
    if (!ytReady || !ytPlayer || ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) return;

    const currentTime = ytPlayer.getCurrentTime() || 0;
    const duration = ytPlayer.getDuration() || 0;

    const currentEl = document.getElementById("current-time");
    const progressEl = document.getElementById("progress");

    if (currentEl) currentEl.textContent = format(currentTime);
    if (progressEl && duration > 0) {
        progressEl.value = (currentTime / duration) * 100;
    }
}

document.getElementById("progress").addEventListener("input", e => {
    if (!ytReady || !ytPlayer) return;
    const duration = ytPlayer.getDuration() || 0;
    const newTime = (e.target.value / 100) * duration;
    ytPlayer.seekTo(newTime, true);
});

function format(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function loadAlbum(album, autoPlay = false) {
    currentAlbum = album;
    currentTrackIndex = 0;

    triggerContentBlur(() => {
        // Zmiana klasy pudła dla stylów pod dany album
        const musicBox = document.querySelector(".music-box");
        if (musicBox) {
            musicBox.className = "music-box";
            musicBox.classList.add(album.id);
        }

        // --- OBSŁUGA POŁĄCZONEGO PRZYCISKU DLC ---
        updateDlcButton(album);

        // Standardowe ładowanie tytułu i okładki
        document.getElementById("album-title").textContent = album.title;
        document.getElementById("album-cover").src = album.cover;

        renderTracks();

        const firstTrack = album.tracks[0];

        if (autoPlay) {
            playTrack(0);
        } else {
            if (ytReady && ytPlayer && firstTrack.url) {
                ytPlayer.cueVideoById(firstTrack.url);
            }
            document.getElementById("current-track").textContent = firstTrack.title;
            document.getElementById("current-author").textContent = firstTrack.author || "J.J. Ipsen";
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            document.getElementById("duration").textContent = firstTrack.duration;
        }
    });
}

function loadAlbumByIndex(index) {
    const albums = albumsData.albums;

    if (index < 0) index = albums.length - 1;
    if (index >= albums.length) index = 0;

    currentAlbumIndex = index;
    loadAlbum(albums[index], true);
    renderAlbums();
}

function nextAlbum() {
    loadAlbumByIndex(currentAlbumIndex + 1);
}

function prevAlbum() {
    loadAlbumByIndex(currentAlbumIndex - 1);
}

document.addEventListener("click", e => {
    if (e.target.id === "music-toggle" || e.target.closest("#music-toggle") || e.target.id === "open-music") {
        e.preventDefault();
        openMusic();
    }
});

// Zamykanie modala X
document.querySelector(".music-close").addEventListener("click", () => {
    musicModal.classList.add("hidden");
    musicModal.classList.remove("show");
    document.body.classList.remove("modal-open");
});

// Klik poza modal
musicModal.addEventListener("click", e => {
    if (e.target === musicModal) {
        musicModal.classList.add("hidden");
        musicModal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});

const miniPlayer = document.getElementById("mini-player");
const miniToggle = document.getElementById("mini-toggle");
const miniPlay = document.getElementById("mini-play");
const miniPrev = document.getElementById("mini-prev");
const miniNext = document.getElementById("mini-next");
const miniText = document.getElementById("mini-track-text");

const musicWidget = document.getElementById("music-widget") || document.querySelector(".music");

if (miniToggle && musicWidget) {
    miniToggle.addEventListener("click", () => {
        musicWidget.classList.toggle("open");
        if (miniPlayer) miniPlayer.classList.toggle("open");
        miniToggle.textContent = musicWidget.classList.contains("open") ? "⮜" : "⮞";
    });
}

if (miniPlay) {
    miniPlay.addEventListener("click", () => {
        togglePlay();
    });
}

if (miniPrev) miniPrev.addEventListener("click", prevTrack);
if (miniNext) miniNext.addEventListener("click", nextTrack);

function updateMiniTitle() {
    if (!currentAlbum || !miniText) return;
    miniText.textContent = currentAlbum.tracks[currentTrackIndex].title;
}

/* ================= REJESTRACJA WYDARZENIA DLA FIRST TRACKA ================= */

// Nadpisujemy funkcję YouTube API, aby od razu po gotowości playera wczytała pierwszy utwór
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 0
        },
        events: {
            'onReady': (event) => {
                ytReady = true;
                setInterval(updateProgressFromYT, 500);

                if (currentAlbum && currentAlbum.tracks[0]) {
                    ytPlayer.cueVideoById(currentAlbum.tracks[0].url);
                }
            },
            'onStateChange': onPlayerStateChange
        }
    });
};

/* ================= ZAKTUALIZOWANA FUNKCJA INICJALIZACJI ================= */

async function initMusicPlayer() {
    const res = await fetch("data/music.json");
    albumsData = await res.json();

    const allAlbum = albumsData.albums.find(album => album.id === "pz-all");
    let totalTracksCount = allAlbum ? allAlbum.tracks.length : 0;

    const tracksCountEl = document.getElementById("tracks-count");
    if (tracksCountEl) {
        tracksCountEl.textContent = totalTracksCount;
    }

    currentAlbumIndex = 0;
    currentAlbum = albumsData.albums[0];
    currentTrackIndex = 0;

    const firstTrack = currentAlbum.tracks[0];

    const musicBox = document.querySelector(".music-box");
    if (musicBox) {
        musicBox.className = "music-box";
        musicBox.classList.add(currentAlbum.id);
    }

    // UI — modal
    document.getElementById("album-title").textContent = currentAlbum.title;
    document.getElementById("album-cover").src = currentAlbum.cover;
    document.getElementById("current-track").textContent = firstTrack.title;
    document.getElementById("current-author").textContent = firstTrack.author || "J.J. Ipsen";
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    document.getElementById("duration").textContent = firstTrack.duration;

    if (ytReady && ytPlayer && firstTrack.url) {
        ytPlayer.cueVideoById(firstTrack.url);
    }

    updateMiniTitle();
    if (miniPlay) miniPlay.textContent = "▶";

    renderAlbums();
    renderTracks();
}

document.addEventListener("DOMContentLoaded", () => {
    initMusicPlayer();
});

window.openMusicAlbum = async function(albumId) {
    await openMusic();

    const wait = setInterval(() => {
        if (!albumsData || !albumsData.albums) return;

        const index = albumsData.albums.findIndex(a => a.id === albumId);

        if (index === -1) {
            console.warn("Nie znaleziono albumu:", albumId);
            clearInterval(wait);
            return;
        }

        loadAlbumByIndex(index);
        clearInterval(wait);
    }, 100);
};

tracksPanel.addEventListener("click", e => e.stopPropagation());
albumsPanel.addEventListener("click", e => e.stopPropagation());

document.addEventListener("click", e => {
    if (tracksPanel.classList.contains("open") && !tracksPanel.contains(e.target) && !e.target.closest("#toggle-tracks")) {
        tracksPanel.classList.remove("open");
    }
    if (albumsPanel.classList.contains("open") && !albumsPanel.contains(e.target) && !e.target.closest("#toggle-albums")) {
        albumsPanel.classList.remove("open");
    }
});