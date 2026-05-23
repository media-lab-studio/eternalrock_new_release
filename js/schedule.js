/**
 * Schedule Module - EternalRock
 * Handles broadcast schedule rendering and live highlighting
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
let scheduleState = {
  currentProgramId: null,
  updateInterval: null,
};

// ===== DOM CACHE =====
let DOM = {
  list: null,
  currentTime: null,
};

/**
 * Initialize schedule module
 * @param {Object} selectors - DOM element selectors
 */
export function initSchedule(selectors = {}) {
  DOM.list = document.querySelector(selectors.list || '#scheduleList');
  DOM.currentTime = document.querySelector(selectors.currentTime || '#currentTime');
  
  if (!DOM.list) {
    console.warn('⚠️ Schedule list container not found');
    return;
  }
  
  renderSchedule();
  startAutoUpdates();
  
  console.log('📅 Schedule module initialized');
  return scheduleAPI;
}

/**
 * Render schedule items to DOM
 */
function renderSchedule() {
  if (!DOM.list) return;
  
  DOM.list.innerHTML = '';
  
  SCHEDULE.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'schedule-item';
    li.dataset.id = item.id;
    li.dataset.index = index;
    li.innerHTML = `
      <span class="time">${item.time}</span>
      <span class="program">${item.program}</span>
    `;
    DOM.list.appendChild(li);
  });
}

/**
 * Parse time string "HH:MM" to minutes since midnight
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {number} Minutes since midnight
 */
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.trim().split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if current time falls within a time range
 * Handles overnight ranges (e.g., 23:00 – 08:00)
 * @param {number} currentMinutes - Current time in minutes
 * @param {number} startMinutes - Start time in minutes
 * @param {number} endMinutes - End time in minutes
 * @returns {boolean}
 */
function isTimeInRange(currentMinutes, startMinutes, endMinutes) {
  // Overnight range (e.g., 23:00 – 08:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  // Normal range
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Highlight the currently active program
 */
export function highlightCurrentProgram() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let foundActive = false;
  
  document.querySelectorAll('.schedule-item').forEach(item => {
    const timeText = item.querySelector('.time')?.textContent;
    if (!timeText) return;
    
    const [startStr, endStr] = timeText.split('–');
    const startMinutes = parseTime(startStr);
    const endMinutes = parseTime(endStr);
    
    const isActive = isTimeInRange(currentMinutes, startMinutes, endMinutes);
    
    item.classList.toggle('active', isActive);
    
    // Manage LIVE badge
    const programEl = item.querySelector('.program');
    const existingBadge = programEl?.querySelector('.live-badge');
    
    if (isActive) {
      foundActive = true;
      scheduleState.currentProgramId = item.dataset.id;
      
      if (programEl && !existingBadge) {
        const badge = document.createElement('span');
        badge.className = 'live-badge';
        badge.textContent = 'LIVE';
        badge.setAttribute('aria-label', 'Сейчас в эфире');
        programEl.appendChild(badge);
      }
    } else if (existingBadge) {
      existingBadge.remove();
    }
  });
  
  // Fallback: если ничего не найдено (крайний случай)
  if (!foundActive) {
    scheduleState.currentProgramId = null;
  }
  
  return scheduleState.currentProgramId;
}

/**
 * Update the displayed current time
 */
export function updateCurrentTime() {
  if (!DOM.currentTime) return;
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  DOM.currentTime.textContent = `${hours}:${minutes}`;
  DOM.currentTime.setAttribute('datetime', now.toISOString());
  
  // Optional: add visual pulse on minute change
  DOM.currentTime.classList.add('time-update');
  setTimeout(() => DOM.currentTime.classList.remove('time-update'), 300);
}

/**
 * Start automatic updates for time and schedule highlighting
 */
function startAutoUpdates() {
  // Update time every minute
  updateCurrentTime();
  scheduleState.updateInterval = setInterval(() => {
    updateCurrentTime();
    highlightCurrentProgram();
  }, 60000);
  
  // Initial highlight
  highlightCurrentProgram();
}

/**
 * Stop automatic updates (cleanup)
 */
export function stopAutoUpdates() {
  if (scheduleState.updateInterval) {
    clearInterval(scheduleState.updateInterval);
    scheduleState.updateInterval = null;
    console.log('⏹️ Schedule auto-updates stopped');
  }
}

/**
 * Get the currently active program info
 * @returns {Object|null} Program data or null
 */
export function getCurrentProgram() {
  if (!scheduleState.currentProgramId) return null;
  
  return SCHEDULE.find(item => item.id === scheduleState.currentProgramId) || null;
}

/**
 * Get program by time (for testing/debugging)
 * @param {string} timeStr - Time in "HH:MM" format
 * @returns {Object|null}
 */
export function getProgramAtTime(timeStr) {
  const minutes = parseTime(timeStr);
  
  for (const item of SCHEDULE) {
    const [startStr, endStr] = item.time.split('–');
    const startMinutes = parseTime(startStr);
    const endMinutes = parseTime(endStr);
    
    if (isTimeInRange(minutes, startMinutes, endMinutes)) {
      return item;
    }
  }
  return null;
}

/**
 * Public API for external use
 */
// ... весь код модуля ...

// ===== ПУБЛИЧНЫЙ API =====
const scheduleAPI = {
  init: initSchedule,
  highlight: highlightCurrentProgram,
  updateTime: updateCurrentTime,
  stop: stopAutoUpdates,
  getCurrent: getCurrentProgram,
  getAtTime: getProgramAtTime,
  SCHEDULE,
};

// ===== EXPORTS =====
export {
  initSchedule,
  highlightCurrentProgram,
  updateCurrentTime,
  stopAutoUpdates as stopScheduleUpdates,  
  getCurrentProgram,
  getProgramAtTime,
  SCHEDULE,
};

export default scheduleAPI;

// Auto-init if script is loaded directly (non-module fallback)
if (typeof document !== 'undefined' && !import.meta?.url) {
  document.addEventListener('DOMContentLoaded', () => {
    initSchedule();
  });
}

export default scheduleAPI;
