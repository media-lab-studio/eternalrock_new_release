/**
 * EternalRock — Modern Player Application
 * ES6 Modules Version
 * 
 * ⚠️ Requires HTTP server (doesn't work with file:// protocol)
 * Run with: python -m http.server 8000  OR  npx live-server
 */

// ===== IMPORTS =====
import { 
  initSchedule, 
  highlightCurrentProgram, 
  updateCurrentTime,
  stopAutoUpdates as stopScheduleUpdates,
  getCurrentProgram,
  SCHEDULE 
} from './schedule.js';

// ===== CONFIG =====
const CONFIG = {
  API_BASE: 'https://myradio24.com/users/25968',
  STREAM_URL: 'https://myradio24.org/25968',
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
  wakeLock: null,
};

// ===== DOM CACHE =====
const DOM = {
  slider: {},
  player: {},
  schedule: {},
  audio: null,
};

// ===== DOM INITIALIZATION =====
function initDOM() {
  // Slider
  DOM.slider.track = document.getElementById('slidesTrack');
  DOM.slider.indicators = document.getElementById('sliderIndicators');
  DOM.slider.prevBtn = document.querySelector('.slider-btn.prev');
  DOM.slider.nextBtn = document.querySelector('.slider-btn.next');
  DOM.slider.fullscreenBtn = document.getElementById('fullscreenBtn');
  DOM.slider.wrapper = document.querySelector('.slider-wrapper');

  // Player
  DOM.player.playBtn = document.getElementById('playBtn');
  DOM.player.muteBtn = document.getElementById('muteBtn');
  DOM.player.volumeSlider = document.getElementById('volumeSlider');
  DOM.player.volumeValue = document.getElementById('volumeValue');
  DOM.player.currentTrack = document.getElementById('currentTrack');
  DOM.player.nextTrack = document.getElementById('nextTrack');
  DOM.player.playlistName = document.getElementById('playlistName');

  // Schedule (passed to module)
  DOM.schedule.list = document.getElementById('scheduleList');
  DOM.schedule.currentTime = document.getElementById('currentTime');

  // Audio
  DOM.audio = document.getElementById('audioStream');
}

// ===== SLIDER MODULE =====
function initSlider() {
  if (!DOM.slider.track || !DOM.slider.indicators) {
    console.warn('⚠️ Slider elements not found');
    return;
  }

  const startIndex = Math.floor(Math.random() * CONFIG.SLIDES_COUNT);
  console.log(`🎲 Starting slide: ${startIndex + 1}`);

  // Generate slides
  for (let i = 0; i < CONFIG.SLIDES_COUNT; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<img src="img/slides/slide${i + 1}.jpg" alt="Rock visual ${i + 1}" loading="lazy">`;
    DOM.slider.track.appendChild(slide);

    // Indicators (first 5 only)
    if (i < 5) {
      const dot = document.createElement('span');
      dot.className = `indicator ${i === startIndex ? 'active' : ''}`;
      dot.dataset.index = i;
      DOM.slider.indicators.appendChild(dot);
    }
  }

  goToSlide(startIndex);
  startAutoSlide();
  console.log(`✅ Slider: ${CONFIG.SLIDES_COUNT} slides`);
}

function goToSlide(index) {
  if (!DOM.slider.track) return;
  
  state.currentSlide = (index + CONFIG.SLIDES_COUNT) % CONFIG.SLIDES_COUNT;
  DOM.slider.track.style.transform = `translateX(-${state.currentSlide * 100}%)`;

  document.querySelectorAll('.indicator').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.currentSlide % 5);
  });
}

function startAutoSlide() {
  if (state.slideInterval) clearInterval(state.slideInterval);
  state.slideInterval = setInterval(() => {
    let next;
    do {
      next = Math.floor(Math.random() * CONFIG.SLIDES_COUNT);
    } while (next === state.currentSlide && CONFIG.SLIDES_COUNT > 1);
    goToSlide(next);
  }, CONFIG.SLIDE_DURATION);
}

function stopAutoSlide() {
  if (state.slideInterval) {
    clearInterval(state.slideInterval);
    state.slideInterval = null;
  }
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// ===== PLAYER MODULE =====
function initPlayer() {
  if (!DOM.audio) {
    console.warn('⚠️ Audio element not found');
    return;
  }

  DOM.audio.src = CONFIG.STREAM_URL;
  DOM.audio.volume = state.volume;
  DOM.audio.preload = 'auto';
  DOM.audio.crossOrigin = 'anonymous';

  DOM.audio.addEventListener('playing', onAudioPlaying);
  DOM.audio.addEventListener('pause', onAudioPause);
  DOM.audio.addEventListener('error', onAudioError);

  if (DOM.player.volumeSlider) {
    DOM.player.volumeSlider.value = state.volume * 100;
    updateVolumeDisplay(state.volume * 100);
    DOM.player.volumeSlider.addEventListener('input', (e) => {
      state.volume = e.target.value / 100;
      DOM.audio.volume = state.volume;
      updateVolumeDisplay(e.target.value);
    });
  }
  console.log('🎵 Player initialized');
}

function onAudioPlaying() {
  state.isPlaying = true;
  DOM.player.playBtn?.classList.add('playing');
  startTrackUpdates();
  enableWakeLock();
}

function onAudioPause() {
  state.isPlaying = false;
  DOM.player.playBtn?.classList.remove('playing');
  stopTrackUpdates();
  disableWakeLock();
}

function onAudioError(e) {
  console.error('❌ Audio error:', e);
  state.isPlaying = false;
  DOM.player.playBtn?.classList.remove('playing');
  showNotification('⚠️ Ошибка подключения к потоку');
  stopTrackUpdates();
  disableWakeLock();
}

function updateVolumeDisplay(value) {
  if (DOM.player.volumeValue) {
    DOM.player.volumeValue.textContent = `${Math.round(value)}%`;
  }
}

async function togglePlay() {
  if (!DOM.audio) return;
  try {
    if (state.isPlaying) {
      await DOM.audio.pause();
    } else {
      await enableWakeLock();
      await DOM.audio.play();
    }
  } catch (err) {
    console.error('Playback error:', err);
    if (err.name === 'NotAllowedError') {
      showNotification('🔊 Нажмите ещё раз для воспроизведения');
    } else {
      showNotification('❌ Не удалось воспроизвести');
    }
  }
}

// ===== WAKE LOCK =====
async function enableWakeLock() {
  if (!('wakeLock' in navigator) || state.wakeLock) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
  } catch (err) {
    console.warn('⚠️ WakeLock failed:', err.message);
  }
}

async function disableWakeLock() {
  if (state.wakeLock) {
    try {
      await state.wakeLock.release();
      state.wakeLock = null;
    } catch (err) {
      console.warn('⚠️ WakeLock release failed:', err.message);
    }
  }
}

// ===== TRACK UPDATES =====
function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

async function fetchTrackData() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/status.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.song && DOM.player.currentTrack) {
      DOM.player.currentTrack.textContent = decodeHtmlEntities(data.song.trim());
    }
    if (data.nextsongs?.[0]?.song && DOM.player.nextTrack) {
      DOM.player.nextTrack.textContent = decodeHtmlEntities(data.nextsongs[0].song.trim());
    }
    if (data.playlist && DOM.player.playlistName) {
      DOM.player.playlistName.textContent = data.playlist.replace(/_/g, ' ');
    }
  } catch (err) {
    console.warn('⚠️ Track fetch failed:', err.message);
  }
}

function startTrackUpdates() {
  fetchTrackData();
  if (state.trackInterval) clearInterval(state.trackInterval);
  state.trackInterval = setInterval(fetchTrackData, CONFIG.TRACK_UPDATE_INTERVAL);
}

function stopTrackUpdates() {
  if (state.trackInterval) {
    clearInterval(state.trackInterval);
    state.trackInterval = null;
  }
}

// ===== NOTIFICATIONS =====
function showNotification(message) {
  document.querySelectorAll('.app-notification').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'app-notification';
  el.textContent = message;
  el.setAttribute('role', 'alert');
  el.style.cssText = `
    position: fixed; bottom: 100px; left: 50%;
    transform: translateX(-50%);
    background: rgba(255,94,0,0.95); color: white;
    padding: 12px 24px; border-radius: 50px;
    font-weight: 600; z-index: 10000;
    animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    pointer-events: none;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Slider
  DOM.slider.prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); goToSlide(state.currentSlide - 1); resetAutoSlide();
  });
  DOM.slider.nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    let next;
    do { next = Math.floor(Math.random() * CONFIG.SLIDES_COUNT); }
    while (next === state.currentSlide && CONFIG.SLIDES_COUNT > 1);
    goToSlide(next); resetAutoSlide();
  });
  DOM.slider.indicators?.addEventListener('click', (e) => {
    if (e.target.classList.contains('indicator')) {
      e.stopPropagation();
      goToSlide(parseInt(e.target.dataset.index, 10)); resetAutoSlide();
    }
  });
  DOM.slider.fullscreenBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); toggleFullscreen();
  });

  // Player
  DOM.player.playBtn?.addEventListener('click', togglePlay);
  DOM.player.muteBtn?.addEventListener('click', () => {
    if (DOM.audio) {
      DOM.audio.muted = !DOM.audio.muted;
      DOM.player.muteBtn.innerHTML = DOM.audio.muted 
        ? '<i class="fas fa-volume-mute"></i>' 
        : '<i class="fas fa-volume-up"></i>';
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    switch (e.code) {
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowUp': e.preventDefault(); changeVolume(0.1); break;
      case 'ArrowDown': e.preventDefault(); changeVolume(-0.1); break;
      case 'KeyM': e.preventDefault();
        if (DOM.audio) {
          DOM.audio.muted = !DOM.audio.muted;
          DOM.player.muteBtn.innerHTML = DOM.audio.muted 
            ? '<i class="fas fa-volume-mute"></i>' 
            : '<i class="fas fa-volume-up"></i>';
        }
        break;
      case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
    }
  });

  // Slider hover pause
  DOM.slider.wrapper?.addEventListener('mouseenter', stopAutoSlide);
  DOM.slider.wrapper?.addEventListener('mouseleave', startAutoSlide);

  // Fullscreen click outside
  document.addEventListener('click', (e) => {
    if (document.fullscreenElement && 
        !e.target.closest('.slider-wrapper') &&
        !e.target.closest('.slider-fullscreen')) {
      document.exitFullscreen();
    }
  });

  // Fullscreen change
  document.addEventListener('fullscreenchange', () => {
    DOM.slider.wrapper?.classList.toggle('fullscreen', !!document.fullscreenElement);
    const icon = DOM.slider.fullscreenBtn?.querySelector('i');
    if (icon) {
      icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    }
  });
}

function changeVolume(delta) {
  if (!DOM.player.volumeSlider || !DOM.audio) return;
  let newVolume = Math.max(0, Math.min(1, state.volume + delta));
  state.volume = newVolume;
  DOM.audio.volume = newVolume;
  DOM.player.volumeSlider.value = newVolume * 100;
  updateVolumeDisplay(newVolume * 100);
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
  if (!DOM.slider.wrapper) return;
  if (!document.fullscreenElement) {
    DOM.slider.wrapper.requestFullscreen?.().catch(err => {
      console.warn('Fullscreen error:', err.message);
      showNotification('⚠️ Полноэкранный режим недоступен');
    });
  } else {
    document.exitFullscreen();
  }
}

// ===== MAIN INIT =====
async function init() {
  console.log('🎸 EternalRock v2.0 (Modules) initializing...');
  
  initDOM();
  
  // Initialize modules
  initSlider();
  
  // ✅ Initialize schedule module with imported functions
  initSchedule({
    list: '#scheduleList',
    currentTime: '#currentTime',
  });
  
  initPlayer();
  
  // Time updates (use imported function)
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);
  setInterval(highlightCurrentProgram, 60000);
  
  setupEventListeners();
  fetchTrackData();
  
  console.log('✅ EternalRock ready!');
  
  // Debug API
  if (window.location.hostname === 'localhost') {
    window.EternalRock = {
      togglePlay, goToSlide, fetchTrackData,
      getCurrentProgram, SCHEDULE, state, CONFIG,
    };
  }
}

// ===== START =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===== CSS ANIMATIONS =====
if (!document.getElementById('eternalrock-styles')) {
  const style = document.createElement('style');
  style.id = 'eternalrock-styles';
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translate(-50%, 0); }
      to { opacity: 0; transform: translate(-50%, -10px); }
    }
  `;
  document.head.appendChild(style);
}

// ===== EXPORTS FOR TESTING =====
export { init, togglePlay, goToSlide, fetchTrackData };
