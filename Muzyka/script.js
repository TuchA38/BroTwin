const wrapper = document.querySelector(".wrapper"),
    musicImg = wrapper.querySelector(".img-area img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    playPauseBtn = wrapper.querySelector(".play-pause"),
    prevBtn = wrapper.querySelector("#prev"),
    nextBtn = wrapper.querySelector("#next"),
    mainAudio = wrapper.querySelector("#main-audio"),
    progressArea = wrapper.querySelector(".progress-area"),
    progressBar = progressArea.querySelector(".progress-bar"),
    musicList = wrapper.querySelector(".music-list"),
    moreMusicBtn = wrapper.querySelector("#more-music"),
    closemoreMusic = musicList.querySelector("#close");

let musicIndex = Math.floor((Math.random() * allMusic.length) + 1);
isMusicPaused = true;

window.addEventListener("load", () => {
    loadMusic(musicIndex);
    playingSong();
});

let albums = [{
        name: "Planet Zoo - Wszystkie utwory",
        musicList: allMusic13,
        img: "Muzyka/obrazy/Planet_Zoo_All.jpg"
    },
    {
        name: "Planet Zoo - Afryka",
        musicList: allMusic12,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Planet Zoo - Indie",
        musicList: allMusic11,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Planet Zoo - Ameryka Północna",
        musicList: allMusic10,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Planet Zoo - Azja",
        musicList: allMusic9,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Planet Zoo - Klasyka",
        musicList: allMusic8,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Planet Zoo - Planet Zoo",
        musicList: allMusic7,
        img: "Muzyka/obrazy/Planet_Zoo.jpg"
    },
    {
        name: "Delux",
        musicList: allMusic6,
        img: "Muzyka/obrazy/Delux_Edition.jpg"
    },
    {
        name: "Pakiet Arktyczny",
        musicList: allMusic5,
        img: "Muzyka/obrazy/Arctic_Pack.jpg"
    },
    {
        name: "Pakiet Ameryka Południowa",
        musicList: allMusic4,
        img: "Muzyka/obrazy/South_America_Pack.jpg"
    },
    {
        name: "Pakiet Australia",
        musicList: allMusic3,
        img: "Muzyka/obrazy/Australia_Pack.jpg"
    },
    {
        name: "Pakiet Wodny",
        musicList: allMusic2,
        img: "Muzyka/obrazy/Aquatic_Pack.jpg"
    },
    {
        name: "Pakiet Azja Południowo-Wschodnia",
        musicList: allMusic1,
        img: "Muzyka/obrazy/Southeast_Asia_Pack.jpg"
    },
    {
        name: "Pakiet Afryka",
        musicList: allMusic,
        img: "Muzyka/obrazy/Africa_Pack.jpg"
    },
    {
        name: "Pakiet Ameryki Północnej",
        musicList: allMusic14,
        img: "Muzyka/obrazy/North_America_Pack.jpg"
    },
    {
        name: "Pakiet Europa",
        musicList: allMusic15,
        img: "Muzyka/obrazy/Europe_Pack.jpg"
    },
    {
        name: "Pakiet Ochrona przyrody",
        musicList: allMusic16,
        img: "Muzyka/obrazy/Conservation_Pack.jpg"
    },
    {
        name: "Lo-fi (Dźwięki lata)",
        musicList: allMusic17,
        img: "Muzyka/obrazy/Lo-fi.jpg"
    },
    {
        name: "Pakiet Zmierzch",
        musicList: allMusic18,
        img: "Muzyka/obrazy/Twilight_Pack.jpg"
    },
    {
        name: "Pakiet Stepy",
        musicList: allMusic19,
        img: "Muzyka/obrazy/Grasslands_Pack.jpg"
    },
    {
        name: "Pakiet Tropiki",
        musicList: allMusic20,
        img: "Muzyka/obrazy/Tropical_Pack.jpg"
    },
    {
        name: "Pakiet Klimatu suchego",
        musicList: allMusic21,
        img: "Muzyka/obrazy/Arid_Pack.jpg"
    },
    {
        name: "Pakiet Oceania",
        musicList: allMusic22,
        img: "Muzyka/obrazy/Oceania_Pack.jpg"
    },
    {
        name: "Zwiastuny",
        musicList: allMusic23,
        img: "Muzyka/Muzyka/obrazy/Zwiastuny.jpg"
    }
];

function applyStylesForAlbum(albumName) {
    // Pobierz wrapper, który jest kontenerem dla wszystkich elementów, których chcesz zmienić style
    const wrapper = document.querySelector(".wrapper");

    // Zmień style w zależności od nazwy albumu
    if (albumName === "Pakiet Arktyczny") {
        wrapper.classList.add("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Ameryka Południowa") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.add("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Australia") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.add("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Wodny") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.add("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Azja Południowo-Wschodnia") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.add("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Afryka") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.add("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Ameryki Północnej") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.add("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Europa") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.add("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Ochrona przyrody") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.add("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Zmierzch") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.add("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Stepy") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.add("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Tropiki") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.add("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Klimatu suchego") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.add("arid-style");
        wrapper.classList.remove("oceania-style");
    } else if (albumName === "Pakiet Oceania") {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.add("oceania-style");
    } else {
        wrapper.classList.remove("arctic-style");
        wrapper.classList.remove("southamerica-style");
        wrapper.classList.remove("australia-style");
        wrapper.classList.remove("aquatic-style");
        wrapper.classList.remove("southeastasia-style");
        wrapper.classList.remove("africa-style");
        wrapper.classList.remove("northamerica-style");
        wrapper.classList.remove("europe-style");
        wrapper.classList.remove("conservation-style");
        wrapper.classList.remove("twilight-style");
        wrapper.classList.remove("grasslands-style");
        wrapper.classList.remove("tropical-style");
        wrapper.classList.remove("arid-style");
        wrapper.classList.remove("oceania-style");
    }
}

function playAlbum(albumName, element) {
    const selectedAlbum = albums.find(album => album.name === albumName);

    if (selectedAlbum) {
        currentAlbum = selectedAlbum;
        loadMusicList(selectedAlbum.musicList); // Przed ustawieniem tytułu albumu, wczytaj listę utworów
        applyStylesForAlbum(albumName);
        loadMusic(1, selectedAlbum.musicList);
        playMusic();

        // Usuń klasę "selected" z innych elementów <li> w tej samej liście
        const sidebarItems = document.querySelectorAll('.sidebar li span');
        sidebarItems.forEach(item => {
            item.classList.remove('selected');
        });

        // Dodaj klasę "selected" do klikniętego elementu <li>
        element.classList.add('selected');

        // Aktualizacja tytułu aktualnego albumu
        const topBar = document.querySelector('.top-bar span');
        topBar.textContent = albumName;

        // Przywrócenie animacji przejścia
        const wrapper = document.querySelector('.wrapper');
        wrapper.style.animation = "fadeIn ease-in 0.6s backwards";

        // Usunięcie animacji po zakończeniu
        setTimeout(() => {
            wrapper.style.animation = "none";
        }, 600);
    } else {
        console.error(`Album "${albumName}" nie został znaleziony.`);
    }
}

// Zmienna przechowująca aktualnie wybrany album
let currentAlbum = null;

document.getElementById("next-album").addEventListener("click", function() {
    changeAlbum(true);
});

document.getElementById("prev-album").addEventListener("click", function() {
    changeAlbum(false);
});

// JavaScript
function changeAlbum(next) {
    // Sprawdź, czy tablica albums nie jest pusta
    if (albums.length > 0) {
        let currentAlbumNameElement = document.querySelector('.top-bar span');
        let currentAlbumName = currentAlbumNameElement.getAttribute('data-album');

        let currentIndex = albums.findIndex(album => album.name === currentAlbum.name);
        let newIndex = next ? (currentIndex + 1) % albums.length : (currentIndex - 1 + albums.length) % albums.length;
        currentAlbum = albums[newIndex];

        currentAlbumNameElement.setAttribute('data-album', currentAlbum.name);
        currentAlbumNameElement.textContent = currentAlbum.name;

        loadMusicList(currentAlbum.musicList);

        loadMusic(1, currentAlbum.musicList);

        let ulTag = wrapper.querySelector("ul");
        let allLiTags = ulTag.querySelectorAll("li");
        allLiTags.forEach(liTag => {
            liTag.classList.remove("playing");
        });

        // Usuń klasę "selected" z innych elementów <li> w tej samej liście
        const sidebarItems = document.querySelectorAll('.sidebar li span');
        sidebarItems.forEach(item => {
            item.classList.remove('selected');
        });

        // Dodaj klasę "selected" do odpowiedniego elementu <li> na podstawie indeksu
        const selectedAlbumItem = sidebarItems[newIndex];
        if (selectedAlbumItem) {
            selectedAlbumItem.classList.add('selected');
        }

        let firstLiTag = ulTag.querySelector("li:first-child");
        if (firstLiTag) {
            firstLiTag.classList.add("playing");
            let audioDurationSpan = firstLiTag.querySelector(".audio-duration");
            audioDurationSpan.innerText = "Grane";
        }

        // Wywołaj funkcję playingSong() po zaktualizowaniu listy utworów
        playingSong();

        currentAlbumName = currentAlbum.name;
        applyStylesForAlbum(currentAlbumName);

        // Zaktualizuj animację przejścia między albumami bez użycia klasy JavaScript
        const albumContent = document.querySelector('.wrapper');
        albumContent.style.animation = "fadeIn ease-in 0.6s backwards";
        // Usuń animację po pewnym czasie, aby można było ją ponownie zastosować przy następnej zmianie albumu
        setTimeout(() => {
            albumContent.style.animation = "none";
        }, 600); // Czas trwania animacji w milisekundach
    } else {
        console.error("Nie ma dostępnych albumów.");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Ustaw domyślny indeks muzyki do odtworzenia po załadowaniu strony
    const defaultMusicIndex = 1; // Załóżmy, że chcemy odtwarzać pierwszy utwór
    const defaultAlbumIndex = 0; // Załóżmy, że chcemy odtwarzać pierwszy album
    const defaultAlbum = albums[defaultAlbumIndex];
    const defaultMusicArray = defaultAlbum.musicList;

    // Ustaw tytuł pierwszego albumu
    const topBar = document.querySelector('.top-bar span');
    topBar.textContent = defaultAlbum.name;

    // Pobierz pierwszy element listy bocznej
    const firstSidebarItem = document.querySelector('.sidebar li span');

    // Dodaj klasę "selected" do pierwszego elementu listy bocznej
    firstSidebarItem.classList.add('selected');

    // Wybierz pierwszy album po załadowaniu strony
    currentAlbum = defaultAlbum;

    // Wczytaj listę utworów dla domyślnego albumu
    loadMusicList(defaultMusicArray);

    // Odtwórz muzykę
    loadMusic(defaultMusicIndex, defaultMusicArray);
    playingSong();
});


function loadMusicList(musicArray) {
    const ulTag = wrapper.querySelector("ul");
    ulTag.innerHTML = ""; // Wyczyść listę, aby dodać nowe utwory

    musicArray.forEach((music, index) => {
        let liTag = `<li li-index="${index + 1}">
                        <div class="row">
                          <span>${music.name}</span>
                          <p>${music.artist}</p>
                        </div>
                        <span id="${music.src}" class="audio-duration">${index === 0 ? 'Grane' : ''}</span>
                        <audio class="${music.src}" src="Muzyka/utwory/${music.src}.mp3"></audio>
                      </li>`;
        ulTag.insertAdjacentHTML("beforeend", liTag);

        let liAudioDuartionTag = ulTag.querySelector(`#${music.src}`);
        let liAudioTag = ulTag.querySelector(`.${music.src}`);
        liAudioTag.addEventListener("loadeddata", () => {
            let duration = liAudioTag.duration;
            let totalMin = Math.floor(duration / 60);
            let totalSec = Math.floor(duration % 60);
            if (totalSec < 10) { //if sec is less than 10 then add 0 before it
                totalSec = `0${totalSec}`;
            };
            liAudioDuartionTag.innerText = `${totalMin}:${totalSec}`; //passing total duration of song
            liAudioDuartionTag.setAttribute("t-duration", `${totalMin}:${totalSec}`); //adding t-duration attribute with total duration value
        });
    });

    // Dodaj słowo "Grane" do pierwszego elementu listy
    const firstAudioDurationTag = ulTag.querySelector(".audio-duration");
    if (firstAudioDurationTag) {
        firstAudioDurationTag.innerText = "Grane";
    }

    // Ponowne przypisanie zdarzenia onclick dla każdego elementu li po aktualizacji listy
    playingSong();
}



function loadMusic(indexNumb, musicArray) {
    if (musicArray && indexNumb > 0 && indexNumb <= musicArray.length) {
        musicName.innerText = musicArray[indexNumb - 1].name;
        musicArtist.innerText = musicArray[indexNumb - 1].artist;
        musicImg.src = `Muzyka/obrazy/${musicArray[indexNumb - 1].img}.jpg`;
        mainAudio.src = `Muzyka/utwory/${musicArray[indexNumb - 1].src}.mp3`;

        musicIndex = indexNumb;

        pauseMusic();
        playMusic();
    } else {
        console.error("Invalid music index or music array.");
    }
}


//play music function
function playMusic() {
    wrapper.classList.add("paused");
    playPauseBtn.querySelector("i").innerText = "pause";
    mainAudio.play();
}

//pause music function
function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseBtn.querySelector("i").innerText = "play_arrow";
    mainAudio.pause();
}

//prev music function
function prevMusic() {
    let currentIndex = albums.findIndex(album => album.name === document.querySelector('.top-bar span').textContent);
    let currentAlbum = albums[currentIndex];
    let musicArray = currentAlbum.musicList;

    musicIndex--; //decrement of musicIndex by 1
    //if musicIndex is less than 1 then musicIndex will be the array length so the last music play
    musicIndex < 1 ? musicIndex = musicArray.length : musicIndex = musicIndex;
    loadMusic(musicIndex, musicArray);
    playMusic();
    playingSong();
}

//next music function
function nextMusic() {
    let currentIndex = albums.findIndex(album => album.name === document.querySelector('.top-bar span').textContent);
    let currentAlbum = albums[currentIndex];
    let musicArray = currentAlbum.musicList;

    musicIndex++; //increment of musicIndex by 1
    //if musicIndex is greater than array length then musicIndex will be 1 so the first music play
    musicIndex > musicArray.length ? musicIndex = 1 : musicIndex = musicIndex;
    loadMusic(musicIndex, musicArray);
    playMusic();
    playingSong();
}

// play or pause button event
playPauseBtn.addEventListener("click", () => {
    const isMusicPlay = wrapper.classList.contains("paused");
    //if isPlayMusic is true then call pauseMusic else call playMusic
    isMusicPlay ? pauseMusic() : playMusic();
    playingSong();
});

//prev music button event
prevBtn.addEventListener("click", () => {
    prevMusic();
});

//next music button event
nextBtn.addEventListener("click", () => {
    nextMusic();
});

// update progress bar width according to music current time
mainAudio.addEventListener("timeupdate", (e) => {
    const currentTime = e.target.currentTime; //getting playing song currentTime
    const duration = e.target.duration; //getting playing song total duration
    let progressWidth = (currentTime / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;

    let musicCurrentTime = wrapper.querySelector(".current-time"),
        musicDuartion = wrapper.querySelector(".max-duration");
    mainAudio.addEventListener("loadeddata", () => {
        // update song total duration
        let mainAdDuration = mainAudio.duration;
        let totalMin = Math.floor(mainAdDuration / 60);
        let totalSec = Math.floor(mainAdDuration % 60);
        if (totalSec < 10) { //if sec is less than 10 then add 0 before it
            totalSec = `0${totalSec}`;
        }
        musicDuartion.innerText = `${totalMin}:${totalSec}`;
    });
    // update playing song current time
    let currentMin = Math.floor(currentTime / 60);
    let currentSec = Math.floor(currentTime % 60);
    if (currentSec < 10) { //if sec is less than 10 then add 0 before it
        currentSec = `0${currentSec}`;
    }
    musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
});

// update playing song currentTime on according to the progress bar width
progressArea.addEventListener("click", (e) => {
    let progressWidth = progressArea.clientWidth; //getting width of progress bar
    let clickedOffsetX = e.offsetX; //getting offset x value
    let songDuration = mainAudio.duration; //getting song total duration

    mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
    playMusic(); //calling playMusic function
    playingSong();
});

//change loop, shuffle, repeat icon onclick
const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", () => {
    let getText = repeatBtn.innerText; //getting this tag innerText
    switch (getText) {
        case "repeat":
            repeatBtn.innerText = "repeat_one";
            repeatBtn.setAttribute("title", "Song looped");
            break;
        case "repeat_one":
            repeatBtn.innerText = "shuffle";
            repeatBtn.setAttribute("title", "Playback shuffled");
            break;
        case "shuffle":
            repeatBtn.innerText = "repeat";
            repeatBtn.setAttribute("title", "Playlist looped");
            break;
    }
});

//code for what to do after song ended
mainAudio.addEventListener("ended", () => {
    let currentIndex = albums.findIndex(album => album.name === document.querySelector('.top-bar span').textContent);
    let currentAlbum = albums[currentIndex];
    let musicArray = currentAlbum.musicList;

    let getText = repeatBtn.innerText; //getting this tag innerText
    switch (getText) {
        case "repeat":
            nextMusic(musicArray); //calling nextMusic function
            break;
        case "repeat_one":
            mainAudio.currentTime = 0; //setting audio current time to 0
            loadMusic(musicIndex, musicArray); //calling loadMusic function with argument, in the argument there is a index of current song
            playMusic(); //calling playMusic function
            break;
        case "shuffle":
            let randIndex = Math.floor((Math.random() * musicArray.length) + 1); //genereting random index/numb with max range of array length
            do {
                randIndex = Math.floor((Math.random() * musicArray.length) + 1);
            } while (musicIndex == randIndex); //this loop run until the next random number won't be the same of current musicIndex
            musicIndex = randIndex; //passing randomIndex to musicIndex
            loadMusic(musicIndex, musicArray);
            playMusic();
            playingSong();
            break;
    }
});


//show music list onclick of music icon
moreMusicBtn.addEventListener("click", () => {
    musicList.classList.toggle("show");
});
closemoreMusic.addEventListener("click", () => {
    moreMusicBtn.click();
});

const ulTag = wrapper.querySelector("ul");
// let create li tags according to array length for list
for (let i = 0; i < allMusic.length; i++) {
    //let's pass the song name, artist from the array
    let liTag = `<li li-index="${i + 1}">
                <div class="row">
                  <span>${allMusic[i].name}</span>
                  <p>${allMusic[i].artist}</p>
                </div>
                <span id="${allMusic[i].src}" class="audio-duration">3:40</span>
                <audio class="${allMusic[i].src}" src="Muzyka/utwory/${allMusic[i].src}.mp3"></audio>
              </li>`;
    ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag

    let liAudioDuartionTag = ulTag.querySelector(`#${allMusic[i].src}`);
    let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);
    liAudioTag.addEventListener("loadeddata", () => {
        let duration = liAudioTag.duration;
        let totalMin = Math.floor(duration / 60);
        let totalSec = Math.floor(duration % 60);
        if (totalSec < 10) { //if sec is less than 10 then add 0 before it
            totalSec = `0${totalSec}`;
        };
        liAudioDuartionTag.innerText = `${totalMin}:${totalSec}`; //passing total duation of song
        liAudioDuartionTag.setAttribute("t-duration", `${totalMin}:${totalSec}`); //adding t-duration attribute with total duration value
    });
}

//play particular song from the list onclick of li tag
function playingSong() {
    const allLiTag = ulTag.querySelectorAll("li");

    for (let j = 0; j < allLiTag.length; j++) {
        let audioTag = allLiTag[j].querySelector(".audio-duration");

        if (allLiTag[j].classList.contains("playing")) {
            allLiTag[j].classList.remove("playing");
            let adDuration = audioTag.getAttribute("t-duration");
            audioTag.innerText = adDuration;
        }

        //if the li tag index is equal to the musicIndex then add playing class in it
        if (allLiTag[j].getAttribute("li-index") == musicIndex) {
            allLiTag[j].classList.add("playing");
            audioTag.innerText = "Grane";
        }

        allLiTag[j].setAttribute("onclick", "clicked(this)");
    }
}

//particular li clicked function
function clicked(element) {
    let getLiIndex = element.getAttribute("li-index");
    let currentIndex = albums.findIndex(album => album.name === document.querySelector('.top-bar span').textContent);
    let currentAlbum = albums[currentIndex];
    let musicArray = currentAlbum.musicList;
    musicIndex = getLiIndex; //updating current song index with clicked li index
    loadMusic(musicIndex, musicArray); // Przekazujemy tablicę utworów z aktualnego albumu
    playMusic();
    playingSong();
}