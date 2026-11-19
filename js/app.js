
/* =========================================
   STUDENT HUB
   Complete App JavaScript
========================================= */

const $ = id => document.getElementById(id);

/* STORAGE */
const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* APP DATA */
let tasks = storage.get("sh_tasks", []);
let notes = storage.get("sh_notes", []);
let schedules = storage.get("sh_schedules", []);
let currentFilter = "all";
let editingNoteId = null;

/* =========================================
   USER NAME PERSONALIZATION
========================================= */

let userName = storage.get("sh_userName", "");

function updateUserName() {
  const displayName = userName || "Student";

  $("userName").textContent = displayName;
  $("profileName").textContent = displayName;
  $("profileAvatar").textContent = displayName.charAt(0).toUpperCase();

  document.title = `${displayName} | Student Hub`;
}

function openNameModal() {
  $("nameEntry").value = userName;
  $("nameModal").classList.add("show");

  setTimeout(() => {
    $("nameEntry").focus();
  }, 100);
}

function closeNameModal() {
  $("nameModal").classList.remove("show");
}

$("saveNameBtn").addEventListener("click", () => {
  const enteredName = $("nameEntry").value.trim();

  if (!enteredName) {
    showToast("Please enter your name!");
    $("nameEntry").focus();
    return;
  }

  userName = enteredName;

  storage.set("sh_userName", userName);

  updateUserName();
  closeNameModal();

  showToast(`Welcome, ${userName}! 🎉`);
});

$("nameEntry").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    $("saveNameBtn").click();
  }
});

$("editNameBtn").addEventListener("click", openNameModal);
$("dashboardEditName").addEventListener("click", openNameModal);

/* =========================================
   TOAST MESSAGE
========================================= */

let toastTimer;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =========================================
   DATE
========================================= */

function updateDate() {
  const now = new Date();

  $("todayDate").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* =========================================
   NAVIGATION
========================================= */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.remove("active");
  });

  const page = $(pageId);

  if (page) {
    page.classList.add("active");
  }

  const navButton = document.querySelector(
    `.nav-item[data-page="${pageId}"]`
  );

  if (navButton) {
    navButton.classList.add("active");
  }

  $("sidebar").classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.goto);
  });
});

$("menuToggle").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

document.addEventListener("click", event => {
  if (
    window.innerWidth <= 850 &&
    !$("sidebar").contains(event.target) &&
    !$("menuToggle").contains(event.target)
  ) {
    $("sidebar").classList.remove("open");
  }
});

/* =========================================
   THEME
========================================= */

const savedTheme = storage.get("sh_theme", "dark");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}

$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  const isLight = document.body.classList.contains("light-theme");

  storage.set("sh_theme", isLight ? "light" : "dark");

  $("themeToggle").innerHTML = isLight
    ? "☀️ <span>Switch to Dark</span>"
    : "🌙 <span>Switch to Light</span>";
});

if (savedTheme === "light") {
  $("themeToggle").innerHTML = "☀️ <span>Switch to Dark</span>";
}

/* =========================================
   TASKS
========================================= */

function saveTasks() {
  storage.set("sh_tasks", tasks);
}

function addTask(title, priority, date) {
  const task = {
    id: Date.now().toString(),
    title,
    priority,
    date,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);

  saveTasks();
  renderTasks();
  updateDashboard();
}

$("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("taskInput").value.trim();

  if (!title) return;

  addTask(
    title,
    $("taskPriority").value,
    $("taskDate").value
  );

  $("taskForm").reset();

  showToast("Task added successfully! ✅");
});

function toggleTask(taskId) {
  const task = tasks.find(task => task.id === taskId);

  if (!task) return;

  task.completed = !task.completed;

  saveTasks();
  renderTasks();
  updateDashboard();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);

  saveTasks();
  renderTasks();
  updateDashboard();

  showToast("Task deleted");
}

function renderTaskItem(task) {
  const item = document.createElement("div");
  item.className = "task-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;

  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
  });

  const details = document.createElement("div");
  details.className = "task-details";

  const title = document.createElement("h4");
  title.textContent = task.title;

  if (task.completed) {
    title.classList.add("done");
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const priority = document.createElement("span");
  priority.className = `priority ${task.priority}`;
  priority.textContent = `${task.priority} Priority`;

  meta.appendChild(priority);

  if (task.date) {
    const date = document.createElement("span");
    date.className = "task-date";
    date.textContent = `📅 ${task.date}`;
    meta.appendChild(date);
  }

  details.append(title, meta);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "🗑";
  deleteButton.title = "Delete task";

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  item.append(checkbox, details, deleteButton);

  return item;
}

function renderTasks() {
  const list = $("taskList");
  list.innerHTML = "";

  let filteredTasks = [...tasks];

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  }

  if (filteredTasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        No tasks here yet. Add a task to get started! ✨
      </div>
    `;
    return;
  }

  filteredTasks.forEach(task => {
    list.appendChild(renderTaskItem(task));
  });
}

/* FILTERS */

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    renderTasks();
  });
});

/* DASHBOARD TASKS */

function renderDashboardTasks() {
  const list = $("dashboardTaskList");
  list.innerHTML = "";

  const pending = tasks.filter(task => !task.completed);

  if (pending.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        You're all caught up! 🎉
      </div>
    `;
    return;
  }

  pending.slice(0, 5).forEach(task => {
    list.appendChild(renderTaskItem(task));
  });
}

/* DASHBOARD STATS */

function updateDashboard() {
  $("totalTasks").textContent = tasks.length;

  $("completedTasks").textContent =
    tasks.filter(task => task.completed).length;

  $("pendingTasks").textContent =
    tasks.filter(task => !task.completed).length;

  $("totalNotes").textContent = notes.length;

  renderDashboardTasks();
}

/* =========================================
   NOTES
========================================= */

function saveNotes() {
  storage.set("sh_notes", notes);
}

function renderNotes() {
  const grid = $("notesGrid");
  grid.innerHTML = "";

  if (notes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        No notes yet. Create your first note! 📝
      </div>
    `;
    return;
  }

  notes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const content = document.createElement("p");
    content.textContent = note.content;

    const date = document.createElement("small");
    date.className = "note-date";
    date.textContent = new Date(note.updatedAt).toLocaleDateString("en-IN");

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "✏️ Edit";

    editButton.addEventListener("click", () => {
      editNote(note.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑 Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id);
    });

    actions.append(editButton, deleteButton);

    card.append(title, content, date, actions);

    grid.appendChild(card);
  });
}

function openNoteEditor(note = null) {
  $("noteEditor").classList.remove("hidden");

  if (note) {
    editingNoteId = note.id;

    $("noteEditorHeading").textContent = "Edit Note";
    $("noteTitle").value = note.title;
    $("noteContent").value = note.content;
  } else {
    editingNoteId = null;

    $("noteEditorHeading").textContent = "Create Note";
    $("noteTitle").value = "";
    $("noteContent").value = "";
  }

  $("noteTitle").focus();
}

function closeNoteEditor() {
  $("noteEditor").classList.add("hidden");
  editingNoteId = null;
}

$("addNoteBtn").addEventListener("click", () => {
  openNoteEditor();
});

$("cancelNoteBtn").addEventListener("click", closeNoteEditor);

$("saveNoteBtn").addEventListener("click", () => {
  const title = $("noteTitle").value.trim();
  const content = $("noteContent").value.trim();

  if (!title || !content) {
    showToast("Please enter title and content");
    return;
  }

  if (editingNoteId) {
    const note = notes.find(note => note.id === editingNoteId);

    if (note) {
      note.title = title;
      note.content = content;
      note.updatedAt = new Date().toISOString();
    }

    showToast("Note updated! ✏️");
  } else {
    notes.unshift({
      id: Date.now().toString(),
      title,
      content,
      updatedAt: new Date().toISOString()
    });

    showToast("Note saved! 📝");
  }

  saveNotes();
  renderNotes();
  updateDashboard();
  closeNoteEditor();
});

function editNote(noteId) {
  const note = notes.find(note => note.id === noteId);

  if (note) {
    openNoteEditor(note);
  }
}

function deleteNote(noteId) {
  notes = notes.filter(note => note.id !== noteId);

  saveNotes();
  renderNotes();
  updateDashboard();

  showToast("Note deleted");
}

/* =========================================
   TIMETABLE
========================================= */

function saveSchedules() {
  storage.set("sh_schedules", schedules);
}

$("scheduleForm").addEventListener("submit", event => {
  event.preventDefault();

  const subject = $("scheduleSubject").value.trim();
  const day = $("scheduleDay").value;
  const time = $("scheduleTime").value;

  if (!subject || !day || !time) return;

  schedules.push({
    id: Date.now().toString(),
    subject,
    day,
    time
  });

  saveSchedules();
  renderTimetable();

  $("scheduleForm").reset();

  showToast("Schedule added! 📅");
});

function deleteSchedule(id) {
  schedules = schedules.filter(item => item.id !== id);

  saveSchedules();
  renderTimetable();

  showToast("Schedule removed");
}

function renderTimetable() {
  const container = $("timetableContainer");
  container.innerHTML = "";

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  days.forEach(day => {
    const daySchedules = schedules
      .filter(item => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (daySchedules.length === 0) return;

    const group = document.createElement("div");
    group.className = "day-group";

    const heading = document.createElement("h3");
    heading.textContent = day;

    group.appendChild(heading);

    daySchedules.forEach(item => {
      const row = document.createElement("div");
      row.className = "schedule-item";

      const time = document.createElement("span");
      time.className = "schedule-time";
      time.textContent = item.time;

      const subject = document.createElement("span");
      subject.className = "schedule-subject";
      subject.textContent = item.subject;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "🗑";

      deleteButton.addEventListener("click", () => {
        deleteSchedule(item.id);
      });

      row.append(time, subject, deleteButton);
      group.appendChild(row);
    });

    container.appendChild(group);
  });

  if (container.children.length === 0) {
    container.innerHTML = `
      <div class="empty-state panel">
        Your timetable is empty. Add your first class! 📚
      </div>
    `;
  }
}

/* =========================================
   MOTIVATION QUOTES
========================================= */

const quotes = [
  "Small progress every day leads to big results.",
  "Believe in yourself and keep going.",
  "Your future is created by what you do today.",
  "Don't stop when you're tired. Stop when you're done.",
  "Dream big. Work hard. Stay focused.",
  "Consistency is more important than perfection.",
  "Every expert was once a beginner.",
  "Focus on progress, not perfection.",
  "Your only limit is your mindset.",
  "One day or day one. You decide."
];

$("newQuoteBtn").addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);

  $("motivationText").textContent = quotes[randomIndex];
});

/* =========================================
   FOCUS TIMER
========================================= */

let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;
let currentMode = "Focus";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  $("timerDisplay").textContent = formatTime(timerRemaining);

  const elapsed = timerDuration - timerRemaining;

  const percentage = timerDuration > 0
    ? elapsed / timerDuration
    : 0;

  const degrees = percentage * 360;

  $("timerCircle").style.background =
    `conic-gradient(var(--purple) ${degrees}deg, var(--border) ${degrees}deg)`;
}

function setTimerMode(minutes, mode) {
  stopTimer();

  currentMode = mode;
  timerDuration = minutes * 60;
  timerRemaining = timerDuration;

  $("focusModeText").textContent = `${mode} Session`;

  $("timerStartBtn").textContent = "▶ Start";

  updateTimerDisplay();
}

function startTimer() {
  if (timerRunning) return;

  if (timerRemaining <= 0) {
    timerRemaining = timerDuration;
  }

  timerRunning = true;
  $("timerStartBtn").textContent = "⏸ Pause";

  timerInterval = setInterval(() => {
    timerRemaining--;

    updateTimerDisplay();

    if (timerRemaining <= 0) {
      stopTimer();

      timerRemaining = 0;

      updateTimerDisplay();

      $("timerStartBtn").textContent = "▶ Start";

      showToast(`${currentMode} session completed! 🎉`);

      if (currentMode === "Focus") {
        showToast("Great job! Take a break ☕");
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);

  timerInterval = null;
  timerRunning = false;
}

$("timerStartBtn").addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
    $("timerStartBtn").textContent = "▶ Resume";
  } else {
    startTimer();
  }
});

$("timerResetBtn").addEventListener("click", () => {
  stopTimer();

  timerRemaining = timerDuration;

  $("timerStartBtn").textContent = "▶ Start";

  updateTimerDisplay();

  showToast("Timer reset");
});

document.querySelectorAll(".focus-mode-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".focus-mode-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    setTimerMode(
      Number(button.dataset.minutes),
      button.dataset.mode
    );
  });
});

/* =========================================
   INITIALIZE APP
========================================= */

function initializeApp() {
  updateUserName();
  updateDate();

  renderTasks();
  renderNotes();
  renderTimetable();
  updateDashboard();

  updateTimerDisplay();

  if (!userName) {
    openNameModal();
  }
}

initializeApp();
