/**
 * Schedule Module - EternalRock
 * Clean exports, no conflicts
 */

// ===== SCHEDULE DATA =====
export const SCHEDULE = [
  { time: '08:00 – 10:00', program: '🔥 Classic Rock', id: 'classic-rock-1' },
  { time: '10:00 – 11:00', program: '🎸 Blues Rock', id: 'blues-rock-1' },
  { time: '11:00 – 12:00', program: '⚡️ Alternative Rock', id: 'alt-rock-1' },
  { time: '12:00 – 13:00', program: '👑 Legends of Rock\'n\'Roll', id: 'legends-1' },
  { time: '13:00 – 15:00', program: '🌲 Scandinavian Folk Rock', id: 'folk-rock-1' },
  { time: '15:00 – 17:00', program: '🔥 Nu Metal', id: 'nu-metal-1' },
  { time: '17:00 – 19:00', program: '🔥 Classic Rock', id: 'classic-rock-2' },
  { time: '19:00 – 20:00', program: '🎸 Blues Rock', id: 'blues-rock-2' },
  { time: '20:00 – 21:00', program: '⚡️ Alternative Rock', id: 'alt-rock-2' },
  { time: '21:00 – 22:00', program: '👑 Legends of Rock\'n\'Roll', id: 'legends-2' },
  { time: '22:00 – 23:00', program: '🌲 Scandinavian Folk Rock', id: 'folk-rock-2' },
  { time: '23:00 – 00:00', program: '🔥 Nu Metal', id: 'nu-metal-2' },
  { time: '00:00 – 08:00', program: '🌙 Best Rock Ballads', id: 'ballads-night' },
];

// ===== STATE =====
let _currentProgramId = null;
let _updateInterval = null;

// ===== DOM CACHE =====
let _dom = { list: null, currentTime: null };

/**
 * Initialize schedule module
 */
export function initSchedule(selectors = {}) {
  _dom.list = document.querySelector(selectors.list || '#scheduleList');
  _dom.currentTime = document.querySelector(selectors.currentTime || '#currentTime');
  
  if (!_dom.list) {
    console.warn('⚠️ Schedule list container not found');
    return;
  }
  
  _renderSchedule();
  _startAutoUpdates();
  console.log('📅 Schedule module initialized');
}

/**
 * Render schedule items
 */
function _renderSchedule() {
  if (!_dom.list) return;
  _dom.list.innerHTML = '';
  
  SCHEDULE.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'schedule-item';
    li.dataset.id = item.id;
    li.dataset.index = index;
    li.innerHTML = `<span class="time">${item.time}</span><span class="program">${item.program}</span>`;
    _dom.list.appendChild(li);
  });
}

/**
 * Parse "HH:MM" to minutes
 */
function _parseTime(timeStr) {
  const [h, m] = timeStr.trim().split(':').map(Number);
  return h * 60 + m;
}

/**
 * Check if time is in range (handles overnight)
 */
function _isTimeInRange(current, start, end) {
  if (end < start) return current >= start || current < end;
  return current >= start && current < end;
}

/**
 * Highlight current program
 */
export function highlightCurrentProgram() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  document.querySelectorAll('.schedule-item').forEach(item => {
    const timeEl = item.querySelector('.time');
    if (!timeEl) return;
    
    const [startStr, endStr] = timeEl.textContent.split('–');
    const start = _parseTime(startStr);
    const end = _parseTime(endStr);
    const isActive = _isTimeInRange(currentMinutes, start, end);
    
    item.classList.toggle('active', isActive);
    
    const programEl = item.querySelector('.program');
    if (!programEl) return;
    
    const badge = programEl.querySelector('.live-badge');
    if (isActive) {
      _currentProgramId = item.dataset.id;
      if (!badge) {
        const b = document.createElement('span');
        b.className = 'live-badge';
        b.textContent = 'LIVE';
        programEl.appendChild(b);
      }
    } else if (badge) {
      badge.remove();
    }
  });
  
  return _currentProgramId;
}

/**
 * Update displayed time
 */
export function updateCurrentTime() {
  if (!_dom.currentTime) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  _dom.currentTime.textContent = `${h}:${m}`;
  _dom.currentTime.setAttribute('datetime', now.toISOString());
}

/**
 * Start auto-updates
 */
function _startAutoUpdates() {
  updateCurrentTime();
  highlightCurrentProgram();
  if (_updateInterval) clearInterval(_updateInterval);
  _updateInterval = setInterval(() => {
    updateCurrentTime();
    highlightCurrentProgram();
  }, 60000);
}

/**
 * Stop auto-updates (cleanup)
 */
export function stopAutoUpdates() {
  if (_updateInterval) {
    clearInterval(_updateInterval);
    _updateInterval = null;
  }
}

/**
 * Get current program info
 */
export function getCurrentProgram() {
  if (!_currentProgramId) return null;
  return SCHEDULE.find(item => item.id === _currentProgramId) || null;
}

/**
 * Get program at specific time (for testing)
 */
export function getProgramAtTime(timeStr) {
  const minutes = _parseTime(timeStr);
  for (const item of SCHEDULE) {
    const [s, e] = item.time.split('–');
    if (_isTimeInRange(minutes, _parseTime(s), _parseTime(e))) return item;
  }
  return null;
}

export {
  initSchedule,
  highlightCurrentProgram,
  updateCurrentTime,
  stopAutoUpdates,
  getCurrentProgram,
  getProgramAtTime,
};
