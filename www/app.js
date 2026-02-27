// 每日任务 - 应用逻辑

// ==================== 数据存储 ====================
const STORAGE_KEY = 'daily_task_data';

let tasks = [];
let settings = {
  notifications: true,
  darkMode: false,
  morningReminder: true
};
let pomodoroCount = 0;

// 加载数据
function loadData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    tasks = parsed.tasks || [];
    settings = { ...settings, ...parsed.settings };
    pomodoroCount = parsed.pomodoroCount || 0;
  }
  applySettings();
}

// 保存数据
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    tasks,
    settings,
    pomodoroCount
  }));
}

// ==================== 任务管理 ====================
function generateId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function addTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) {
    alert('请输入任务标题');
    return;
  }

  // 检查是否是编辑模式
  if (window.editingTaskId) {
    const task = tasks.find(t => t.id === window.editingTaskId);
    if (task) {
      task.title = title;
      task.description = document.getElementById('task-description').value.trim();
      task.priority = document.querySelector('.segmented-control[data-type="priority"] .active')?.dataset.value || 'normal';
      task.timeSlot = document.querySelector('.segmented-control[data-type="time"] .active')?.dataset.value || 'morning';
      task.category = document.getElementById('task-category').value;
      task.isRecurring = document.getElementById('task-recurring').checked;
      task.recurringType = document.getElementById('task-recurring-type').value;
    }
    window.editingTaskId = null;
    saveData();
    closeModal('add-task-modal');
    resetForm();
    renderAll();
    return;
  }

  const task = {
    id: generateId(),
    title,
    description: document.getElementById('task-description').value.trim(),
    priority: document.querySelector('.segmented-control[data-type="priority"] .active')?.dataset.value || 'normal',
    timeSlot: document.querySelector('.segmented-control[data-type="time"] .active')?.dataset.value || 'morning',
    category: document.getElementById('task-category').value,
    createdAt: new Date().toISOString(),
    isCompleted: false,
    isRecurring: document.getElementById('task-recurring').checked,
    recurringType: document.getElementById('task-recurring-type').value,
    pomodoroSessions: 0
  };

  tasks.push(task);
  saveData();
  closeModal('add-task-modal');
  resetForm();
  renderAll();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString() : null;
    saveData();
    renderAll();
  }
}

function deleteTask(id) {
  if (confirm('确定删除这个任务吗？')) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    renderAll();
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // 填充表单
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-description').value = task.description || '';
  
  // 设置优先级
  document.querySelectorAll('[data-type="priority"] .segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === task.priority);
  });
  
  // 设置时间段
  document.querySelectorAll('[data-type="time"] .segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === task.timeSlot);
  });
  
  document.getElementById('task-category').value = task.category;
  document.getElementById('task-recurring').checked = task.isRecurring;
  document.getElementById('task-recurring-type').value = task.recurringType || 'daily';
  toggleRecurringOptions();

  // 存储编辑模式
  window.editingTaskId = id;
  showAddTaskModal();
}

function resetForm() {
  document.getElementById('task-title').value = '';
  document.getElementById('task-description').value = '';
  document.getElementById('task-recurring').checked = false;
  document.getElementById('task-recurring-type').value = 'daily';
  document.getElementById('recurring-type-group').style.display = 'none';
  window.editingTaskId = null;
  
  // 重置优先级选择
  document.querySelectorAll('[data-type="priority"] .segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === 'normal');
  });
  
  // 重置时间段选择
  document.querySelectorAll('[data-type="time"] .segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === 'morning');
  });
}

// ==================== 渲染 ====================
function renderAll() {
  renderTodayTasks();
  renderTasks();
  renderStats();
  renderProfile();
}

function renderTodayTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= today && taskDate < tomorrow && !t.isCompleted;
  });

  const container = document.getElementById('task-list-today');
  const emptyState = document.getElementById('empty-state');

  if (todayTasks.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    container.style.display = 'flex';
    emptyState.style.display = 'none';
    container.innerHTML = todayTasks.map(task => createTaskCard(task)).join('');
  }

  // 更新完成率
  const allToday = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= today && taskDate < tomorrow;
  });
  const completed = allToday.filter(t => t.isCompleted).length;
  const rate = allToday.length > 0 ? Math.round((completed / allToday.length) * 100) : 0;
  document.getElementById('today-rate').textContent = rate + '%';
}

function renderTasks() {
  const filter = document.getElementById('task-filter').value;
  let filteredTasks = [...tasks];

  if (filter === 'incomplete') {
    filteredTasks = tasks.filter(t => !t.isCompleted);
  } else if (filter === 'completed') {
    filteredTasks = tasks.filter(t => t.isCompleted);
  }

  // 按优先级排序
  const priorityOrder = { urgent: 0, important: 1, normal: 2, routine: 3 };
  filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const container = document.getElementById('task-list-all');
  container.innerHTML = filteredTasks.map(task => createTaskCard(task, true)).join('');
}

function createTaskCard(task, showActions = false) {
  const priorityLabels = { urgent: '🔴 紧急', important: '🟠 重要', normal: '🔵 一般', routine: '🟢 日常' };
  const timeLabels = { morning: '☀️ 早上', noon: '🌤️ 中午', evening: '🌅 晚上', bedtime: '🌙 睡前' };
  const categoryIcons = { work: '💼', study: '📚', life: '🏠', fitness: '💪' };

  return `
    <div class="task-card">
      <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
        ${task.isCompleted ? '✓' : ''}
      </div>
      <div class="task-content">
        <div class="task-title ${task.isCompleted ? 'completed' : ''}">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="task-tag ${task.priority}">${priorityLabels[task.priority]}</span>
          <span class="task-tag time">${timeLabels[task.timeSlot]}</span>
          ${task.pomodoroSessions > 0 ? `<span class="task-tag time">🍅 ${task.pomodoroSessions}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        ${!task.isCompleted ? `
          <button class="task-btn complete-btn" onclick="toggleTask('${task.id}')" title="完成">
            ✓
          </button>
        ` : ''}
        <button class="task-btn edit-btn" onclick="editTask('${task.id}')" title="编辑">
          ✏️
        </button>
        <button class="task-btn delete-btn" onclick="deleteTask('${task.id}')" title="删除">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function renderStats() {
  // 今日完成率
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= today && taskDate < tomorrow;
  });
  const todayCompleted = todayTasks.filter(t => t.isCompleted).length;
  const todayRate = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

  // 本周完成率
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekAgo);
  const weekCompleted = weekTasks.filter(t => t.isCompleted).length;
  const weekRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  // 更新进度环
  updateProgress('today-progress', 'today-progress-text', todayRate);
  updateProgress('week-progress', 'week-progress-text', weekRate);

  document.getElementById('today-progress-subtitle').textContent = `${todayCompleted}/${todayTasks.length} 任务已完成`;
  document.getElementById('week-progress-subtitle').textContent = `${weekCompleted}/${weekTasks.length} 任务已完成`;

  // 总体统计
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  document.getElementById('total-tasks').textContent = totalTasks;
  document.getElementById('completed-tasks').textContent = completedTasks;
  document.getElementById('completion-rate').textContent = completionRate + '%';

  // 分类统计
  const categories = { work: { icon: '💼', name: '工作', count: 0 }, study: { icon: '📚', name: '学习', count: 0 }, life: { icon: '🏠', name: '生活', count: 0 }, fitness: { icon: '💪', name: '健身', count: 0 } };
  tasks.forEach(t => {
    if (categories[t.category]) categories[t.category].count++;
  });

  document.getElementById('category-stats').innerHTML = Object.values(categories).map(cat => `
    <div class="category-item">
      <span class="category-icon">${cat.icon}</span>
      <span class="category-name">${cat.name}</span>
      <span class="category-count">${cat.count}</span>
    </div>
  `).join('');

  // 渲染条形图（本周每天任务数）
  renderBarChart();

  // 渲染折线图（完成率趋势）
  renderLineChart();
}

function renderBarChart() {
  const today = new Date();
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const data = [];

  // 获取过去 7 天的数据
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= date && taskDate < nextDate;
    }).length;

    data.push({
      day: days[date.getDay()],
      count: count
    });
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const container = document.getElementById('week-bar-chart');

  container.innerHTML = data.map(d => `
    <div class="bar-item">
      <span class="bar-value">${d.count}</span>
      <div class="bar" style="height: ${(d.count / maxCount) * 140}px;"></div>
      <span class="bar-label">${d.day}</span>
    </div>
  `).join('');
}

function renderLineChart() {
  const today = new Date();
  const data = [];

  // 获取过去 7 天的完成率
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      return taskDate >= date && taskDate < nextDate;
    });
    const completed = dayTasks.filter(t => t.isCompleted).length;
    const rate = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;

    data.push(rate);
  }

  const container = document.getElementById('completion-line-chart');
  const width = 300;
  const height = 160;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 生成路径
  const points = data.map((rate, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - (rate / 100) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';

  // 生成网格线
  let gridLines = '';
  for (let i = 0; i <= 4; i++) {
    const y = height - padding - (i / 4) * chartHeight;
    gridLines += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="grid-line"/>`;
    gridLines += `<text x="${padding - 5}" y="${y + 3}" class="y-label">${i * 25}%</text>`;
  }

  // 生成 X 轴标签
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  let xLabels = '';
  data.forEach((_, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    xLabels += `<text x="${x}" y="${height - 10}" class="x-label">${days[(new Date().getDay() - 6 + i + 7) % 7]}</text>`;
  });

  // 生成数据点
  let dataPoints = '';
  points.forEach((point, i) => {
    const [x, y] = point.split(',');
    dataPoints += `<circle cx="${x}" cy="${y}" r="4" class="data-point"/>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}">
      ${gridLines}
      ${pathD ? `<path d="${pathD}" class="data-line"/>` : ''}
      ${dataPoints}
      ${xLabels}
    </svg>
  `;
}

function updateProgress(circleId, textId, percent) {
  const circle = document.querySelector(`#${circleId} .progress-ring`);
  const text = document.getElementById(textId);
  const circumference = 2 * Math.PI * 15.9155;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
  text.textContent = percent + '%';
}

function renderProfile() {
  document.getElementById('profile-task-count').textContent = tasks.length;
  document.getElementById('setting-notifications').checked = settings.notifications;
  document.getElementById('setting-darkmode').checked = settings.darkMode;
  document.getElementById('setting-morning').checked = settings.morningReminder;
}

// ==================== UI 交互 ====================
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`screen-${tab}`).classList.add('active');
  document.querySelector(`.nav-item[onclick="switchTab('${tab}')"]`).classList.add('active');
}

function showAddTaskModal() {
  document.getElementById('add-task-modal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function selectPriority(btn) {
  const container = btn.closest('[data-type="priority"]');
  container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectTimeSlot(btn) {
  const container = btn.closest('[data-type="time"]');
  container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleRecurringOptions() {
  const isRecurring = document.getElementById('task-recurring').checked;
  document.getElementById('recurring-type-group').style.display = isRecurring ? 'block' : 'none';
}

function saveSettings() {
  settings.notifications = document.getElementById('setting-notifications').checked;
  settings.morningReminder = document.getElementById('setting-morning').checked;
  saveData();
}

function toggleDarkMode() {
  settings.darkMode = document.getElementById('setting-darkmode').checked;
  applySettings();
  saveData();
}

function applySettings() {
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function clearAllData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    localStorage.removeItem(STORAGE_KEY);
    tasks = [];
    settings = { notifications: true, darkMode: false, morningReminder: true };
    pomodoroCount = 0;
    applySettings();
    renderAll();
    alert('数据已清除');
  }
}

function exportData() {
  const data = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily_task_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, e.target.result);
        loadData();
        renderAll();
        alert('数据导入成功！');
      } catch (err) {
        alert('导入失败：' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== 快捷操作 ====================
function completeAllToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let count = 0;
  tasks.forEach(t => {
    const taskDate = new Date(t.createdAt);
    if (taskDate >= today && taskDate < tomorrow && !t.isCompleted) {
      t.isCompleted = true;
      t.completedAt = new Date().toISOString();
      count++;
    }
  });

  if (count > 0) {
    saveData();
    renderAll();
    alert(`已完成 ${count} 个今日任务！🎉`);
  } else {
    alert('今日没有未完成的任务了！');
  }
}

function showCompletedTasks() {
  document.getElementById('task-filter').value = 'completed';
  renderTasks();
  switchTab('tasks');
}

function clearCompleted() {
  const completedCount = tasks.filter(t => t.isCompleted).length;
  if (completedCount === 0) {
    alert('没有已完成的任务可以清除');
    return;
  }

  if (confirm(`确定要清除 ${completedCount} 个已完成的任务吗？\n\n此操作不可恢复！`)) {
    tasks = tasks.filter(t => !t.isCompleted);
    saveData();
    renderAll();
    alert('已完成任务已清除！');
  }
}

// ==================== 番茄钟 ====================
let timerInterval = null;
let timerSeconds = 25 * 60;
let isBreak = false;
let isRunning = false;

function showPomodoroModal() {
  document.getElementById('pomodoro-modal').classList.add('active');
  updateTimerDisplay();
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    document.getElementById('timer-toggle-icon').textContent = '▶';
  } else {
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      } else {
        completeSession();
      }
    }, 1000);
    document.getElementById('timer-toggle-icon').textContent = '⏸';
  }
  isRunning = !isRunning;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timerSeconds = isBreak ? 5 * 60 : 25 * 60;
  document.getElementById('timer-toggle-icon').textContent = '▶';
  updateTimerDisplay();
}

function skipTimer() {
  completeSession();
}

function completeSession() {
  clearInterval(timerInterval);
  isRunning = false;

  if (!isBreak) {
    pomodoroCount++;
    isBreak = true;
    timerSeconds = 5 * 60;
    document.getElementById('pomodoro-title').textContent = '☕ 休息时间';
    document.getElementById('timer-status').textContent = '休息中';
    document.getElementById('pomodoro-count').textContent = pomodoroCount;
    document.getElementById('pomodoro-tip').textContent = '💡 休息时起来走动一下，喝杯水吧～';
    document.getElementById('timer-progress').setAttribute('stroke', '#2196F3');
    saveData();
  } else {
    isBreak = false;
    timerSeconds = 25 * 60;
    document.getElementById('pomodoro-title').textContent = '🍅 专注时间';
    document.getElementById('timer-status').textContent = '专注中';
    document.getElementById('pomodoro-tip').textContent = '💡 专注期间请关闭手机通知，保持专注！';
    document.getElementById('timer-progress').setAttribute('stroke', '#FF5722');
  }

  updateTimerDisplay();
  
  // 通知
  if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(isBreak ? '休息时间' : '专注时间', {
      body: isBreak ? '休息 5 分钟，准备下一轮专注！' : '开始 25 分钟专注，加油！'
    });
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  document.getElementById('timer-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
  const progress = (totalSeconds - timerSeconds) / totalSeconds;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * progress;
  document.getElementById('timer-progress').setAttribute('stroke-dashoffset', offset);
}

// 请求通知权限
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ==================== 语音输入 ====================
let recognition = null;
let isListening = false;

function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log('浏览器不支持语音识别');
    document.getElementById('voice-btn').style.display = 'none';
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('voice-btn').classList.add('listening');
    document.getElementById('voice-status').textContent = '🎤 正在听，请说话...';
    document.getElementById('voice-status').classList.add('recording');
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('voice-btn').classList.remove('listening');
    document.getElementById('voice-status').classList.remove('recording');
    if (document.getElementById('voice-status').textContent === '🎤 正在听，请说话...') {
      document.getElementById('voice-status').textContent = '';
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const titleInput = document.getElementById('task-title');
    
    if (titleInput.value) {
      titleInput.value += ' ' + transcript;
    } else {
      titleInput.value = transcript;
    }
    
    document.getElementById('voice-status').textContent = '✅ 识别成功："' + transcript + '"';
    setTimeout(() => {
      document.getElementById('voice-status').textContent = '';
    }, 3000);
  };

  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    let errorMsg = '❌ 识别失败';
    if (event.error === 'no-speech') {
      errorMsg = '❌ 没有检测到声音，请再试一次';
    } else if (event.error === 'not-allowed') {
      errorMsg = '❌ 麦克风权限被拒绝，请在浏览器设置中允许';
    }
    document.getElementById('voice-status').textContent = errorMsg;
    document.getElementById('voice-btn').classList.remove('listening');
  };

  return recognition;
}

function toggleVoiceInput() {
  if (!recognition) {
    recognition = initSpeechRecognition();
    if (!recognition) {
      alert('您的浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari 浏览器');
      return;
    }
  }

  if (isListening) {
    recognition.stop();
    document.getElementById('voice-status').textContent = '';
  } else {
    try {
      recognition.start();
    } catch (e) {
      console.error('启动语音识别失败:', e);
      alert('语音识别启动失败，请确保已允许麦克风权限');
    }
  }
}

// 快速语音添加任务（主页按钮）
function quickVoiceAdd() {
  if (!recognition) {
    recognition = initSpeechRecognition();
    if (!recognition) {
      alert('您的浏览器不支持语音识别功能，请使用 Chrome、Edge 或 Safari 浏览器');
      return;
    }
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  // 创建临时识别用于快速添加
  const quickRecognition = recognition;
  quickRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    
    // 直接添加任务
    const task = {
      id: generateId(),
      title: transcript,
      description: '',
      priority: 'normal',
      timeSlot: 'morning',
      category: 'work',
      createdAt: new Date().toISOString(),
      isCompleted: false,
      isRecurring: false,
      recurringType: 'none',
      pomodoroSessions: 0
    };

    tasks.push(task);
    saveData();
    renderAll();

    // 显示成功提示
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '✅ 任务已添加：' + transcript;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  try {
    quickRecognition.start();
  } catch (e) {
    console.error('启动语音识别失败:', e);
  }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderAll();
  requestNotificationPermission();
  initSpeechRecognition();

  // 设置当前日期
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', options);
});
