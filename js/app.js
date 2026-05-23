/**
 * EternalRock — Modern Player Application
 * ES6+ Modules, Async/Await, Best Practices
 */

// ===== CONFIG =====
const CONFIG = {
  API_BASE: "https://myradio24.com/users/25968",
  STREAM_URL: "https://myradio24.org/25968",
  SLIDES_COUNT: 130,
  SLIDE_DURATION: 30000,
  TRACK_UPDATE_INTERVAL: 30000,
  DEFAULT_VOLUME: 0.7,
};

// ===== STATE =====
const state = {
  isPlaying: false,
  volume: CONFIG.DEFAULT_VOLUME,
  currentSlide: 0,
  slideInterval: null,
  trackInterval: null,
  audio: null,
};

// ===== DOM CACHE =====
const DOM = {
  slider: {
    track: document.getElementById("slidesTrack"),
    indicators: document.getElementById("sliderIndicators"),
    prevBtn: document.querySelector(".slider-btn.prev"),
    nextBtn: document.querySelector(".slider-btn.next"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
  },
  player: {
    playBtn: document.getElementById("playBtn"),
    muteBtn: document.getElementById("muteBtn"),
    volumeSlider: document.getElementById("volumeSlider"),
    volumeValue: document.getElementById("volumeValue"),
    currentTrack: document.getElementById("currentTrack"),
    nextTrack: document.getElementById("nextTrack"),
    playlistName: document.getElementById("playlistName"),
  },
  schedule: {
    list: document.getElementById("scheduleList"),
    currentTime: document.getElementById("currentTime"),
  },
  audio: document.getElementById("audioStream"),
};

// ===== SCHEDULE DATA =====
const SCHEDULE = [
  { time: "08:00 – 10:00", program: "🔥 Classic Rock" },
  { time: "10:00 – 11:00", program: "🎸 Blues Rock" },
  { time: "11:00 – 12:00", program: "⚡️ Alternative Rock" },
  { time: "12:00 – 13:00", program: "👑 Legends of Rock'n'Roll" },
  { time: "13:00 – 15:00", program: "🌲 Scandinavian Folk Rock" },
  { time: "15:00 – 17:00", program: "🔥 Nu Metal" },
  { time: "17:00 – 19:00", program: "🔥 Classic Rock" },
  { time: "19:00 – 20:00", program: "🎸 Blues Rock" },
  { time: "20:00 – 21:00", program: "⚡️ Alternative Rock" },
  { time: "21:00 – 22:00", program: "👑 Legends of Rock'n'Roll" },
  { time: "22:00 – 23:00", program: "🌲 Scandinavian Folk Rock" },
  { time: "23:00 – 00:00", program: "🔥 Nu Metal" },
  { time: "00:00 – 08:00", program: "🌙 Best Rock Ballads" },
];

// ===== INITIALIZATION =====
async function init() {
  console.log("🎸 EternalRock initialized");

  await Promise.all([
    initSlider(),
    initSchedule(),
    initPlayer(),
    initTimeUpdates(),
  ]);

  setupEventListeners();
  loadInitialData();
}

// ===== SLIDER MODULE =====
async function initSlider() {
  const { track, indicators } = DOM.slider;

  // Генерация слайдов
  const startIndex = Math.floor(Math.random() * CONFIG.SLIDES_COUNT);

  for (let i = 0; i < CONFIG.SLIDES_COUNT; i++) {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `<img src="img/slides/slide${i + 1}.jpg" alt="Rock visual ${i + 1}" loading="lazy">`;
    track.appendChild(slide);

    // Индикаторы (только первые 5 для чистоты)
    if (i < 5) {
      const dot = document.createElement("span");
      dot.className = `indicator ${i === startIndex ? "active" : ""}`;
      dot.dataset.index = i;
      indicators.appendChild(dot);
    }
  }

  // Показать стартовый слайд
  goToSlide(startIndex);

  // Автопрокрутка
  startAutoSlide();
}

function goToSlide(index) {
  state.currentSlide = (index + CONFIG.SLIDES_COUNT) % CONFIG.SLIDES_COUNT;

  DOM.slider.track.style.transform = `translateX(-${state.currentSlide * 100}%)`;

  // Обновить индикаторы
  document.querySelectorAll(".indicator").forEach((dot, i) => {
    dot.classList.toggle("active", i === state.currentSlide % 5);
  });
}

function startAutoSlide() {
  if (state.slideInterval) clearInterval(state.slideInterval);

  state.slideInterval = setInterval(() => {
    // Случайный переход (не повторяя текущий)
    let next;
    do {
      next = Math.floor(Math.random() * CONFIG.SLIDES_COUNT);
    } while (next === state.currentSlide && CONFIG.SLIDES_COUNT > 1);
    goToSlide(next);
  }, CONFIG.SLIDE_DURATION);
}

// ===== SCHEDULE MODULE =====
function initSchedule() {
  const { list } = DOM.schedule;

  SCHEDULE.forEach((item) => {
    const li = document.createElement("li");
    li.className = "schedule-item";
    li.innerHTML = `
      <span class="time">${item.time}</span>
      <span class="program">${item.program}</span>
    `;
    list.appendChild(li);
  });

  highlightCurrentProgram();
}

function highlightCurrentProgram() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  document.querySelectorAll(".schedule-item").forEach((item) => {
    const [start, end] = item
      .querySelector(".time")
      .textContent.split("–")
      .map((t) => {
        const [h, m] = t.trim().split(":").map(Number);
        return h * 60 + m;
      });

    let adjustedEnd = end < start ? end + 24 * 60 : end;
    let adjustedNow =
      minutes < start && adjustedEnd > 24 * 60 ? minutes + 24 * 60 : minutes;

    const isActive = adjustedNow >= start && adjustedNow < adjustedEnd;
    item.classList.toggle("active", isActive);

    // Добавить бейдж LIVE
    const program = item.querySelector(".program");
    if (isActive && !program.querySelector(".live-badge")) {
      const badge = document.createElement("span");
      badge.className = "live-badge";
      badge.textContent = "LIVE";
      program.appendChild(badge);
    } else if (!isActive) {
      program.querySelector(".live-badge")?.remove();
    }
  });
}

// ===== PLAYER MODULE =====
async function initPlayer() {
  const { audio, playBtn, volumeSlider } = DOM;

  // Настройка аудио
  audio.src = CONFIG.STREAM_URL;
  audio.volume = state.volume;
  audio.preload = "auto";

  // Обработчики
  audio.addEventListener("playing", () => {
    state.isPlaying = true;
    playBtn.classList.add("playing");
    startTrackUpdates();
  });

  audio.addEventListener("pause", () => {
    state.isPlaying = false;
    playBtn.classList.remove("playing");
    stopTrackUpdates();
  });

  audio.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    showNotification("⚠️ Ошибка подключения к потоку");
  });

  // Громкость
  volumeSlider.value = state.volume * 100;
  DOM.player.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;

  volumeSlider.addEventListener("input", (e) => {
    state.volume = e.target.value / 100;
    audio.volume = state.volume;
    DOM.player.volumeValue.textContent = `${e.target.value}%`;
  });
}

async function togglePlay() {
  const { audio } = DOM;

  try {
    if (state.isPlaying) {
      await audio.pause();
    } else {
      // Wake Lock для мобильных
      if ("wakeLock" in navigator) {
        await navigator.wakeLock.request("screen");
      }
      await audio.play();
    }
  } catch (err) {
    console.error("Playback error:", err);
    showNotification("❌ Не удалось воспроизвести");
  }
}

// ===== TRACK UPDATES =====
async function fetchTrackData() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/status.json`);
    const data = await res.json();

    // Декодирование HTML-entities
    const decode = (str) => {
      const txt = document.createElement("textarea");
      txt.innerHTML = str;
      return txt.value;
    };

    if (data.song) {
      DOM.player.currentTrack.textContent = decode(data.song.trim());
    }

    if (data.nextsongs?.[0]?.song) {
      DOM.player.nextTrack.textContent = decode(data.nextsongs[0].song.trim());
    }

    if (data.playlist) {
      DOM.player.playlistName.textContent = data.playlist.replace(/_/g, " ");
    }
  } catch (err) {
    console.warn("Track fetch failed:", err);
  }
}

function startTrackUpdates() {
  fetchTrackData();
  state.trackInterval = setInterval(
    fetchTrackData,
    CONFIG.TRACK_UPDATE_INTERVAL,
  );
}

function stopTrackUpdates() {
  if (state.trackInterval) {
    clearInterval(state.trackInterval);
    state.trackInterval = null;
  }
}

// ===== TIME & UTILS =====
function initTimeUpdates() {
  const updateTime = () => {
    const now = new Date();
    DOM.schedule.currentTime.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    DOM.schedule.currentTime.setAttribute("datetime", now.toISOString());
  };

  updateTime();
  setInterval(updateTime, 60000);
  setInterval(highlightCurrentProgram, 60000);
}

function loadInitialData() {
  fetchTrackData();
}

function showNotification(message) {
  // Простая система уведомлений
  const el = document.createElement("div");
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,94,0,0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: 600;
    z-index: 2000;
    animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2.5s forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Слайдер
  DOM.slider.prevBtn?.addEventListener("click", () =>
    goToSlide(state.currentSlide - 1),
  );
  DOM.slider.nextBtn?.addEventListener("click", () => {
    const next = Math.floor(Math.random() * CONFIG.SLIDES_COUNT);
    goToSlide(next);
  });

  DOM.slider.indicators?.addEventListener("click", (e) => {
    if (e.target.classList.contains("indicator")) {
      goToSlide(parseInt(e.target.dataset.index));
    }
  });

  // Fullscreen
  DOM.slider.fullscreenBtn?.addEventListener("click", toggleFullscreen);

  // Плеер
  DOM.player.playBtn?.addEventListener("click", togglePlay);

  DOM.player.muteBtn?.addEventListener("click", () => {
    DOM.audio.muted = !DOM.audio.muted;
    DOM.player.muteBtn.innerHTML = DOM.audio.muted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  });

  // Клавиатура
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT") {
      e.preventDefault();
      togglePlay();
    }
    if (e.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen();
    }
  });

  // Пауза слайдера при наведении
  DOM.slider.track
    ?.closest(".slider-wrapper")
    ?.addEventListener("mouseenter", () => {
      if (state.slideInterval) clearInterval(state.slideInterval);
    });

  DOM.slider.track
    ?.closest(".slider-wrapper")
    ?.addEventListener("mouseleave", startAutoSlide);
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
  const slider = DOM.slider.track.closest(".slider-wrapper");

  if (!document.fullscreenElement) {
    slider.requestFullscreen?.();
    slider.classList.add("fullscreen");
  } else {
    document.exitFullscreen();
    slider.classList.remove("fullscreen");
  }
}

// ===== START =====
document.addEventListener("DOMContentLoaded", init);

// ===== EXPORTS FOR TESTING =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = { init, togglePlay, goToSlide };
}
