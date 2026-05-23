/**
 * Schedule Module - EternalRock
 * ✅ Clean exports: inline only, no duplicate export block
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
let _dom = { list: null, currentTime: null };

/**
 * Initialize schedule module
 */
export function initSchedule(selectors = {}) {
  _dom.list = document.querySelector(selectors.list || '#scheduleList');
  _dom.currentTime = document.querySelector(selectors.currentTime || '#currentTime');
  if (!_dom.list) { console.warn('⚠️ Schedule list not found'); return; }
  _renderSchedule();
  _startAutoUpdates();
  console.log('📅 Schedule initialized');
}

function _renderSchedule() {
  if (!_dom.list) return;
  _dom.list.innerHTML = '';
  SCHEDULE.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'schedule-item';
    li.dataset.id = item.id;
    li.innerHTML = `<span class="time">${item.time}</span><span class="program">${item.program}</span>`;
    _dom.list.appendChild(li);
  });
}

function _parseTime(str) {
  const [h, m] = str.trim().split(':').map(Number);
  return h * 60 + m;
}

function _isTimeInRange(cur, start, end) {
  return end < start ? cur >= start || cur < end : cur >= start && cur < end;
}

/**
 * Highlight current program
 */
export function highlightCurrentProgram() {
  const now = new Date();
  const curMin = now.getHours() * 60 + now.getMinutes();
  document.querySelectorAll('.schedule-item').forEach(item => {
    const tEl = item.querySelector('.time'); if (!tEl) return;
    const [sStr, eStr] = tEl.textContent.split('–');
    const s = _parseTime(sStr), e = _parseTime(eStr);
    const active = _isTimeInRange(curMin, s, e);
    item.classList.toggle('active', active);
    const pEl = item.querySelector('.program'); if (!pEl) return;
    const badge = pEl.querySelector('.live-badge');
    if (active) {
      _currentProgramId = item.dataset.id;
      if (!badge) { const b = document.createElement('span'); b.className = 'live-badge'; b.textContent = 'LIVE'; pEl.appendChild(b); }
    } else if (badge) badge.remove();
  });
  return _currentProgramId;
}

/**
 * Update displayed time
 */
export function updateCurrentTime() {
  if (!_dom.currentTime) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0'), m = String(now.getMinutes()).padStart(2,'0');
  _dom.currentTime.textContent = `${h}:${m}`;
  _dom.currentTime.setAttribute('datetime', now.toISOString());
}

function _startAutoUpdates() {
  updateCurrentTime(); highlightCurrentProgram();
  if (_updateInterval) clearInterval(_updateInterval);
  _updateInterval = setInterval(() => { updateCurrentTime(); highlightCurrentProgram(); }, 60000);
}

/**
 * Stop auto-updates
 */
export function stopAutoUpdates() {
  if (_updateInterval) { clearInterval(_updateInterval); _updateInterval = null; }
}

/**
 * Get current program
 */
export function getCurrentProgram() {
  return _currentProgramId ? SCHEDULE.find(i => i.id === _currentProgramId) || null : null;
}

/**
 * Get program at time (testing)
 */
export function getProgramAtTime(timeStr) {
  const min = _parseTime(timeStr);
  for (const item of SCHEDULE) {
    const [s,e] = item.time.split('–');
    if (_isTimeInRange(min, _parseTime(s), _parseTime(e))) return item;
  }
  return null;
}

// ✅ НЕТ БЛОКА `export { ... }` В КОНЦЕ — всё уже экспортировано inline!
