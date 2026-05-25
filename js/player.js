const CONFIG = {
    streamUrl: "https://myradio24.org/25968",
    defaultVolume: 0.7,
    radioId: "25968",
};

const AppState = {
    isPlaying: false,
    audio: null,
    volume: CONFIG.defaultVolume,
    currentTrack: "",
    currentPlaylist: "",
    trackUpdateInterval: null,
    wakeLock: null,
    isWakeLockSupported: false,
};

let Elements = {
    recordButton: null,
    recordSmall: null,
    volumeSlider: null,
    skullIcon: null,
    currentTrackText: null,
    playlistName: null,
    nextTrackText: null,
    volumePercent: null,
    marqueeTrack: null
};

async function initApp() {
    console.log("💀 EternalRock Radio - Modern Edition 💀");

    initElements();
    
    AppState.isWakeLockSupported = "wakeLock" in navigator;
    if (AppState.isWakeLockSupported) console.log("✅ Wake Lock API поддерживается");

    setupEventListeners();
    
    if (Elements.volumeSlider) {
        Elements.volumeSlider.value = AppState.volume * 100;
        if (Elements.volumePercent) Elements.volumePercent.textContent = `${AppState.volume * 100}%`;
    }

    await getCurrentTrackAndPlaylist();
    startTrackAndPlaylistUpdates();
}

function initElements() {
    Elements = {
        recordButton: document.getElementById("recordButton"),
        recordSmall: document.querySelector('.record-small'),
        volumeSlider: document.getElementById("volumeSlider"),
        skullIcon: document.getElementById("skullIcon"),
        currentTrackText: document.getElementById("currentTrackText"),
        playlistName: document.getElementById("playlist-name"),
        nextTrackText: document.getElementById("nextTrackText"),
        volumePercent: document.getElementById("volumePercent"),
        marqueeTrack: document.getElementById("marqueeTrack")
    };
}

async function getCurrentTrackAndPlaylist() {
    try {
        const apiUrl = `https://myradio24.com/users/${CONFIG.radioId}/status.json`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        function decodeHtmlEntities(str) {
            const txt = document.createElement("textarea");
            txt.innerHTML = str;
            return txt.value;
        }

        if (data && data.song) {
            const trackInfo = decodeHtmlEntities(data.song.trim());
            if (Elements.currentTrackText) {
                Elements.currentTrackText.textContent = trackInfo;
            }
            AppState.currentTrack = trackInfo;
        }

        if (Elements.nextTrackText) {
            if (Array.isArray(data.nextsongs) && data.nextsongs.length > 0 && data.nextsongs[0].song) {
                Elements.nextTrackText.textContent = decodeHtmlEntities(data.nextsongs[0].song.trim());
            }
        }

        if (data.playlist) {
            let playlistName = data.playlist.replace(/_/g, " ").replace(/\s*\d+$/, "").trim();
            AppState.currentPlaylist = playlistName;
        } else {
            AppState.currentPlaylist = "Rock / Metal / Alternative";
        }

        updatePlaylistNameUI();

    } catch (error) {
        console.error("❌ Ошибка получения данных:", error);
        if (Elements.currentTrackText) Elements.currentTrackText.textContent = "Ошибка загрузки";
        AppState.currentPlaylist = "Rock / Metal / Alternative";
        updatePlaylistNameUI();
    }
}

function updatePlaylistNameUI() {
    if (!AppState.currentPlaylist || !Elements.playlistName) return;
    const formattedName = AppState.currentPlaylist.replace(/_/g, " ");
    Elements.playlistName.textContent = formattedName;
}

function startTrackAndPlaylistUpdates() {
    if (AppState.trackUpdateInterval) clearInterval(AppState.trackUpdateInterval);
    AppState.trackUpdateInterval = setInterval(getCurrentTrackAndPlaylist, 30000);
}

function setupEventListeners() {
    if (Elements.recordButton) {
        Elements.recordButton.addEventListener("click", togglePlayback);
    }
    if (Elements.recordSmall) {
        Elements.recordSmall.addEventListener("click", togglePlayback);
    }

    if (Elements.volumeSlider) {
        Elements.volumeSlider.addEventListener("input", handleVolumeChange);
        Elements.volumeSlider.addEventListener("input", function() {
            if (Elements.volumePercent) {
                Elements.volumePercent.textContent = `${this.value}%`;
            }
        });
    }
}

async function togglePlayback() {
    if (AppState.isPlaying) {
        await stopPlayback();
    } else {
        await startPlayback();
    }
    updateUI();
}

async function startPlayback() {
    try {
        AppState.audio = new Audio(CONFIG.streamUrl);
        AppState.audio.volume = AppState.volume;
        
        AppState.audio.addEventListener("error", onAudioError);
        
        const playPromise = AppState.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    AppState.isPlaying = true;
                    enableWakeLock();
                    updateUI();
                    startSkullAnimation();
                })
                .catch(error => {
                    console.error("❌ Ошибка воспроизведения:", error);
                    AppState.isPlaying = false;
                    updateUI();
                });
        }
    } catch (error) {
        console.error("❌ Ошибка создания аудио:", error);
        AppState.isPlaying = false;
        updateUI();
    }
}

async function stopPlayback() {
    if (AppState.audio) {
        AppState.audio.pause();
        AppState.audio.currentTime = 0;
        AppState.audio = null;
    }
    AppState.isPlaying = false;
    await disableWakeLock();
    updateUI();
    stopSkullAnimation();
}

function startSkullAnimation() {
    if (Elements.skullIcon) {
        Elements.skullIcon.style.animation = "skull-pulse 2s ease-in-out infinite";
    }
    if (Elements.recordButton) {
        Elements.recordButton.classList.add("record-playing-small");
    }
    if (Elements.recordSmall) {
        Elements.recordSmall.classList.add("record-playing-small");
    }
}

function stopSkullAnimation() {
    if (Elements.skullIcon) {
        Elements.skullIcon.style.animation = "none";
    }
    if (Elements.recordButton) {
        Elements.recordButton.classList.remove("record-playing-small");
    }
    if (Elements.recordSmall) {
        Elements.recordSmall.classList.remove("record-playing-small");
    }
}

function onAudioError(event) {
    console.error("❌ Ошибка аудио:", event);
    AppState.isPlaying = false;
    updateUI();
    stopSkullAnimation();
    disableWakeLock();
}

function handleVolumeChange(event) {
    const volume = event.target.value / 100;
    AppState.volume = volume;
    if (AppState.audio) {
        AppState.audio.volume = volume;
    }
}

async function enableWakeLock() {
    if (!AppState.isWakeLockSupported || AppState.wakeLock !== null) return;
    try {
        AppState.wakeLock = await navigator.wakeLock.request("screen");
        console.log("✅ Wake Lock активирован");
    } catch (err) {
        console.error(`❌ Ошибка Wake Lock: ${err}`);
    }
}

async function disableWakeLock() {
    if (!AppState.isWakeLockSupported || AppState.wakeLock === null) return;
    try {
        await AppState.wakeLock.release();
        AppState.wakeLock = null;
        console.log("✅ Wake Lock деактивирован");
    } catch (err) {
        console.error(err);
    }
}

function updateUI() {
    if (AppState.isPlaying) {
        if (Elements.recordButton) Elements.recordButton.classList.add("record-playing-small");
        if (Elements.recordSmall) Elements.recordSmall.classList.add("record-playing-small");
    } else {
        if (Elements.recordButton) Elements.recordButton.classList.remove("record-playing-small");
        if (Elements.recordSmall) Elements.recordSmall.classList.remove("record-playing-small");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

console.log("%c💀 EternalRock Radio - Modern Rock Edition 💀", "color: #ff3a00; font-size: 16px; font-weight: bold;");
