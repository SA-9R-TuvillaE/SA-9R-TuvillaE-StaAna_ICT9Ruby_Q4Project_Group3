var currentUser = null;
var registeredUsers = [];

var demoAccounts = [
  { username:'Ethan',   password:'ET47',             firstname:'Ethan',   lastname:'Tuvilla', age:15, email:'ET.Tuv@akademi.jp',  avatar:null },
  { username:'Enzo',    password:'Grok',             firstname:'Enzo',    lastname:'Isidro',  age:14, email:'EN.Isi@akademi.jp',  avatar:null },
  { username:'Xyrinne', password:'Idontknow',        firstname:'Xyrinne', lastname:'Nuesca',  age:14, email:'XY.Nue@akademi.jp',  avatar:null },
  { username:'Jaci',    password:'Miffy',            firstname:'Jaci',    lastname:'Or',      age:14, email:'JA.OR@akademi.jp',   avatar:null },
  { username:'Claire',  password:'DubaiChewyCookie', firstname:'Claire',  lastname:'Miclat',  age:14, email:'CL.Mic@akademi.jp',  avatar:null }
];
for (var i = 0; i < demoAccounts.length; i++) {
  registeredUsers.push(Object.assign({}, demoAccounts[i]));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function initDarkMode() {
  if (localStorage.getItem('akademi_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  updateDarkBtn();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('akademi_darkmode', document.body.classList.contains('dark-mode'));
  updateDarkBtn();
}

function updateDarkBtn() {
  var btn = document.getElementById('darkToggleBtn');
  if (!btn) return;
  btn.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
}

function showLoadingScreen(callback) {
  var old = document.getElementById('akademi-loader');
  if (old) old.remove();
  var loader = document.createElement('div');
  loader.id = 'akademi-loader';
  loader.innerHTML =
    '<div class="loader-inner">' +
      '<div class="loader-logo">Akademi</div>' +
      '<div class="loader-subtitle">Student Portal</div>' +
      '<div class="loader-dots"><span></span><span></span><span></span></div>' +
    '</div>';
  document.body.appendChild(loader);
  setTimeout(function() {
    loader.classList.add('loader-fade-out');
    setTimeout(function() {
      loader.remove();
      if (callback) callback();
    }, 500);
  }, 1200);
}

function animatePageIn() {
  var c = document.getElementById('dynamicContent');
  if (!c) return;
  c.classList.remove('page-enter');
  void c.offsetWidth;
  c.classList.add('page-enter');
}

var calendarEvents = {};

function loadCalendarEvents() {
  var s = localStorage.getItem('akademi_events');
  if (s) { try { calendarEvents = JSON.parse(s); } catch(e) {} }
}

function saveCalendarEvents() {
  localStorage.setItem('akademi_events', JSON.stringify(calendarEvents));
}

var currentYear  = new Date().getFullYear();
var currentMonth = new Date().getMonth();

function renderCalendarWidget(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var monthNames = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
  var firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  var today       = new Date();
  var todayStr    = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

  var html = '<div class="interactive-calendar">' +
    '<div class="calendar-header">' +
      '<button onclick="window.changeMonth(-1)">&#9664;</button>' +
      '<h5>' + monthNames[currentMonth] + ' ' + currentYear + '</h5>' +
      '<button onclick="window.changeMonth(1)">&#9654;</button>' +
    '</div>' +
    '<div class="calendar-grid">';

  var weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (var w = 0; w < weekdays.length; w++) {
    html += '<div class="calendar-weekday">' + weekdays[w] + '</div>';
  }
  for (var e = 0; e < firstDay; e++) html += '<div></div>';
  for (var d = 1; d <= daysInMonth; d++) {
    var key = currentYear + '-' + (currentMonth+1) + '-' + d;
    var cls = '';
    if (key === todayStr) cls += ' today';
    if (calendarEvents[key]) cls += ' has-event';
    html += '<div class="calendar-day' + cls + '" ' +
      'onclick="window.openEventModal(' + currentYear + ',' + (currentMonth+1) + ',' + d + ')">' +
      d + '</div>';
  }
  html += '</div>' +
    '<p class="text-center small mt-2" style="color:var(--text-soft)">Click a day to add an event</p>' +
  '</div>';
  container.innerHTML = html;
}

window.changeMonth = function(delta) {
  currentMonth += delta;
  if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0;  currentYear++; }
  renderCalendarWidget('calendar-widget-container');
};

var selectedDate = null;

window.openEventModal = function(y, m, d) {
  selectedDate = { y:y, m:m, d:d };
  var key = y + '-' + m + '-' + d;
  var ev  = calendarEvents[key] || {};
  document.getElementById('modalDateTitle').innerText = y + ' / ' + m + ' / ' + d;
  document.getElementById('eventTitle').value = ev.title || '';
  document.getElementById('eventDesc').value  = ev.desc  || '';
  var listDiv = document.getElementById('existingEventsList');
  if (ev.title) {
    listDiv.innerHTML =
      '<div class="event-item">' +
        '<strong>' + escapeHtml(ev.title) + '</strong>' +
        '<button onclick="window.deleteEvent(\'' + key + '\')" ' +
          'style="background:#c45c77;border:none;color:#fff;border-radius:30px;' +
                 'padding:2px 10px;font-size:11px;cursor:pointer;">Delete</button>' +
      '</div>' +
      (ev.desc ? '<div class="event-item">' + escapeHtml(ev.desc) + '</div>' : '');
  } else {
    listDiv.innerHTML = '<div style="font-size:13px;color:var(--text-soft);padding:6px;">No events for this day</div>';
  }
  document.getElementById('eventModal').style.display = 'flex';
};

window.deleteEvent = function(key) {
  delete calendarEvents[key];
  saveCalendarEvents();
  if (selectedDate) window.openEventModal(selectedDate.y, selectedDate.m, selectedDate.d);
  renderCalendarWidget('calendar-widget-container');
};

function saveEventFromModal() {
  if (!selectedDate) return;
  var key   = selectedDate.y + '-' + selectedDate.m + '-' + selectedDate.d;
  var title = document.getElementById('eventTitle').value.trim();
  var desc  = document.getElementById('eventDesc').value.trim();
  if (title) { calendarEvents[key] = { title:title, desc:desc }; }
  else { delete calendarEvents[key]; }
  saveCalendarEvents();
  closeModal();
  renderCalendarWidget('calendar-widget-container');
}

function closeModal() {
  var modal = document.getElementById('eventModal');
  if (modal) modal.style.display = 'none';
  selectedDate = null;
}

function startClock() {
  function tick() {
    var el = document.getElementById('liveClock');
    if (!el) return;
    var now  = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var hh   = String(now.getHours()).padStart(2,'0');
    var mm   = String(now.getMinutes()).padStart(2,'0');
    var ss   = String(now.getSeconds()).padStart(2,'0');
    el.innerHTML =
      '<div class="clock-time">' + hh + ':' + mm + ':' + ss + '</div>' +
      '<div class="clock-date">' + days[now.getDay()] + ', ' + mons[now.getMonth()] + ' ' + now.getDate() + '</div>';
  }
  tick();
  setInterval(tick, 1000);
}

function attachGameEvents() {
  var secret   = Math.floor(Math.random() * 10) + 1;
  var attempts = 3;
  var guessBtn = document.getElementById('guessBtn');
  var resetBtn = document.getElementById('resetGameBtn');
  var msgDiv   = document.getElementById('gameMessage');
  var input    = document.getElementById('guessInput');
  if (!guessBtn) return;

  guessBtn.onclick = function() {
    var val = parseInt(input.value);
    if (attempts <= 0) { msgDiv.innerText = 'Game over! Start a new game.'; return; }
    if (isNaN(val) || val < 1 || val > 10) { msgDiv.innerText = 'Enter a number between 1 and 10.'; return; }
    if (val === secret) {
      msgDiv.innerHTML = '<span style="color:#1e7a45;font-weight:600;">Correct! You got it!</span>';
      attempts = 0; guessBtn.disabled = true;
    } else {
      attempts--;
      var hint = val > secret ? 'Too high!' : 'Too low!';
      if (attempts === 0) {
        msgDiv.innerHTML = '<span style="color:#c45c77;">The number was <strong>' + secret + '</strong>. Try again!</span>';
      } else {
        msgDiv.innerHTML = hint + ' <span style="color:var(--text-soft)">' + attempts + ' attempt' + (attempts===1?'':'s') + ' left</span>';
      }
    }
    input.value = '';
  };

  input.addEventListener('keypress', function(e) { if (e.key === 'Enter') guessBtn.click(); });

  resetBtn.onclick = function() {
    secret   = Math.floor(Math.random() * 10) + 1;
    attempts = 3;
    msgDiv.innerHTML = '<span style="color:var(--text-soft)">New game started! Guess a number from 1 to 10.</span>';
    guessBtn.disabled = false;
    input.value = '';
  };
}

function renderSchoolMap() {
  var sections = [
    { title:'Ground Floor',    desc:'Main entrance and administration',
      rooms:["Main Entrance","Principal's Office","Faculty Room","Guidance Office","School Canteen","Restrooms"] },
    { title:'Main Building',   desc:'Classrooms and learning spaces',
      rooms:['Library','Music Room','Art Room','Science Lab','Computer Lab','Health Room','Wet Zone Garden','Hallways'] },
    { title:'Second Floor',    desc:'Sports and fitness facilities',
      rooms:['Swimming Pool','Gymnasium','Bleachers','Locker Rooms'] },
    { title:'Third Floor',     desc:'Advanced athletics and training',
      rooms:['Weight Room','Gymnastics Hall','Activity Room','Sky Lounge'] },
    { title:'Special Areas',   desc:'Unique school destinations',
      rooms:['Rooftop Garden','Hedge Maze','Observatory','Amphitheater','Reading Hut'] },
    { title:'Outdoor Grounds', desc:'Open spaces and recreation',
      rooms:['Soccer Field','Running Track','Zen Garden','Picnic Area','Parking Lot'] }
  ];

  var cards = '';
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    var roomTags = '';
    for (var r = 0; r < sec.rooms.length; r++) {
      roomTags += '<span class="map-room">' + sec.rooms[r] + '</span>';
    }
    cards +=
      '<div class="map-section">' +
        '<h5>' + sec.title + '</h5>' +
        '<p class="map-desc">' + sec.desc + '</p>' +
        '<div class="map-rooms">' + roomTags + '</div>' +
      '</div>';
  }

  return '<div class="school-map-container">' +
    '<div class="map-header">' +
      '<div class="map-title">Akademi High School</div>' +
      '<div class="map-subtitle">Campus Map &amp; Facilities Guide</div>' +
    '</div>' +
    '<div class="map-grid">' + cards + '</div>' +
    '<div class="map-footer">Akademi High School &mdash; Est. 2020 &nbsp;|&nbsp; Open 7:00 AM &ndash; 5:00 PM</div>' +
  '</div>';
}

function showDashboardContent() {
  var quotes = [
    'I am the master of my fate, I am the captain of my soul. - William Ernest Henley',
    'Educating the mind without educating the heart is no education at all. - Aristotle',
    'The unexamined life is not worth living. - Socrates',
    'Our lives begin to end the day we become silent about things that matter. -Martin Luther King Jr.',
    'Impossible is a word to be found only in the dictionary of fools. - Napoleon Bonaparte'
  ];
  var quote   = quotes[Math.floor(Math.random() * quotes.length)];
  var hour    = new Date().getHours();
  var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  var name    = (currentUser && currentUser.firstname) ? currentUser.firstname : 'Student';

  return '<div class="container">' +

    '<div class="welcome-banner mb-4">' +
      '<div class="d-flex justify-content-between align-items-center flex-wrap gap-3">' +
        '<div>' +
          '<span class="section-label">Dashboard</span>' +
          '<h4>' + greeting + ', ' + escapeHtml(name) + '!</h4>' +
          '<p class="mb-0">Here\'s what\'s happening today at Akademi.</p>' +
        '</div>' +
        '<div id="liveClock" class="live-clock"></div>' +
      '</div>' +
    '</div>' +

    '<div class="row g-4">' +
      '<div class="col-md-6">' +
        '<div class="card card-notebook p-3 h-100">' +
          '<h4>Calendar</h4>' +
          '<div id="calendar-widget-container"></div>' +
        '</div>' +
      '</div>' +
      '<div class="col-md-6 d-flex flex-column gap-3">' +
        '<div class="card card-notebook p-3">' +
          '<h4>Quote of the Day</h4>' +
          '<blockquote class="inspire-quote mt-2">&ldquo;' + escapeHtml(quote) + '&rdquo;</blockquote>' +
        '</div>' +
        '<div class="card card-notebook p-3">' +
          '<h4>Number Guessing Game</h4>' +
          '<p class="small mb-2" style="color:var(--text-soft)">Guess a number between 1 and 10. You have 3 tries!</p>' +
          '<div class="input-group mb-2">' +
            '<input type="number" id="guessInput" class="form-control" placeholder="Your guess...">' +
            '<button class="btn lc-submit" id="guessBtn" ' +
              'style="width:auto;padding:8px 20px;margin:0;border-radius:0 14px 14px 0;font-size:14px;">Guess</button>' +
          '</div>' +
          '<div id="gameMessage" class="game-msg"></div>' +
          '<button class="btn btn-secondary btn-sm mt-2" id="resetGameBtn">New Game</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="row mt-4">' +
      '<div class="col-12">' + renderSchoolMap() + '</div>' +
    '</div>' +

  '</div>';
}

var subjects = ['English','Japanese','Math','Science','History'];
var currentSubject = 'English';

function loadNote(sub) {
  var key = 'note_' + sub + '_' + ((currentUser && currentUser.username) ? currentUser.username : 'guest');
  return localStorage.getItem(key) || '';
}

function saveNote(sub, val) {
  var key = 'note_' + sub + '_' + ((currentUser && currentUser.username) ? currentUser.username : 'guest');
  localStorage.setItem(key, val);
}

window.switchSubject = function(sub) {
  currentSubject = sub;
  for (var s = 0; s < subjects.length; s++) {
    var ed  = document.getElementById('notebook-' + subjects[s]);
    var tab = document.querySelector('.subject-tab[data-subject="' + subjects[s] + '"]');
    if (ed)  ed.classList.toggle('active-editor', subjects[s] === sub);
    if (tab) tab.classList.toggle('active',        subjects[s] === sub);
  }
};

window.saveNoteBtn = function(sub) {
  var ta = document.getElementById('textarea-' + sub);
  if (ta) {
    saveNote(sub, ta.value);
    var msg = document.getElementById('saveMsg-' + sub);
    if (msg) { msg.innerText = sub + ' notes saved!'; setTimeout(function(){ msg.innerText=''; }, 2000); }
  }
};

function renderVirtualNotebook() {
  var tabs = '';
  for (var s = 0; s < subjects.length; s++) {
    var sub = subjects[s];
    tabs += '<button class="subject-tab ' + (sub===currentSubject?'active':'') + '" ' +
      'data-subject="' + sub + '" onclick="window.switchSubject(\'' + sub + '\')">' + sub + '</button>';
  }

  var editors = '';
  for (var s2 = 0; s2 < subjects.length; s2++) {
    var sub2 = subjects[s2];
    var saved = loadNote(sub2);
    editors +=
      '<div id="notebook-' + sub2 + '" class="notebook-editor ' + (sub2===currentSubject?'active-editor':'') + '">' +
        '<textarea id="textarea-' + sub2 + '" rows="15" class="form-control" ' +
          'placeholder="Write your ' + sub2 + ' notes here...">' + escapeHtml(saved) + '</textarea>' +
        '<button class="lc-submit mt-3" onclick="window.saveNoteBtn(\'' + sub2 + '\')">Save ' + sub2 + ' Notes</button>' +
        '<div id="saveMsg-' + sub2 + '" style="color:#1e7a45;font-size:13px;margin-top:6px;"></div>' +
      '</div>';
  }

  return '<div class="container">' +
    '<div class="card card-notebook p-4">' +
      '<h2 class="page-title text-center">Virtual Notebook</h2>' +
      '<p class="text-center mb-4" style="color:var(--text-soft)">Your personal notes for each subject — saved automatically per user.</p>' +
      '<div class="subject-tabs">' + tabs + '</div>' +
      editors +
    '</div>' +
  '</div>';
}

var tasksArray = [];
try {
  tasksArray = JSON.parse(localStorage.getItem('studentTasks') || '[]');
} catch(e) {}
if (!tasksArray.length) {
  tasksArray = [
    { text:'Complete ICT Project', completed:false },
    { text:'Study JavaScript',     completed:false }
  ];
}

function renderTasksPage() {
  var done = 0;
  for (var t = 0; t < tasksArray.length; t++) { if (tasksArray[t].completed) done++; }
  var pct = tasksArray.length ? Math.round(done / tasksArray.length * 100) : 0;

  return '<div class="container">' +
    '<div class="card card-notebook p-4">' +
      '<h2 class="page-title">My Tasks</h2>' +
      '<div class="tasks-progress mb-3">' +
        '<div class="d-flex justify-content-between mb-1">' +
          '<span class="small" style="color:var(--text-soft)">' + done + ' of ' + tasksArray.length + ' completed</span>' +
          '<span class="small" style="color:var(--rose-deep);font-weight:600">' + pct + '%</span>' +
        '</div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div class="input-group mb-3">' +
        '<input id="newTaskInput" class="form-control" placeholder="Add a new task...">' +
        '<button id="addTaskBtn" class="btn lc-submit" ' +
          'style="width:auto;padding:8px 20px;margin:0;border-radius:0 14px 14px 0;font-size:14px;">Add</button>' +
      '</div>' +
      '<ul class="list-group mb-3" id="tasksList"></ul>' +
      '<button id="clearCompletedBtn" class="btn btn-secondary btn-sm">Clear Completed</button>' +
    '</div>' +
  '</div>';
}

function attachTaskEvents() {
  function renderList() {
    var list = document.getElementById('tasksList');
    if (!list) return;
    list.innerHTML = '';

    var done2 = 0;
    for (var t = 0; t < tasksArray.length; t++) { if (tasksArray[t].completed) done2++; }
    var pct2 = tasksArray.length ? Math.round(done2 / tasksArray.length * 100) : 0;

    var fill = document.querySelector('.progress-fill');
    var lbl1 = document.querySelector('.tasks-progress .small:first-child');
    var lbl2 = document.querySelector('.tasks-progress .small:last-child');
    if (fill) fill.style.width = pct2 + '%';
    if (lbl1) lbl1.innerText = done2 + ' of ' + tasksArray.length + ' completed';
    if (lbl2) lbl2.innerText = pct2 + '%';

    for (var i = 0; i < tasksArray.length; i++) {
      (function(idx) {
        var t2 = tasksArray[idx];
        var li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML =
          '<span style="' + (t2.completed ? 'text-decoration:line-through;color:var(--text-soft)' : '') + '">' +
            escapeHtml(t2.text) + '</span>' +
          '<div>' +
            '<button class="btn btn-sm btn-outline-success me-2 complete-task">' +
              (t2.completed ? 'Undo' : 'Done') + '</button>' +
            '<button class="btn btn-sm btn-outline-danger delete-task">Delete</button>' +
          '</div>';
        li.querySelector('.complete-task').onclick = function() {
          tasksArray[idx].completed = !tasksArray[idx].completed;
          localStorage.setItem('studentTasks', JSON.stringify(tasksArray));
          renderList();
        };
        li.querySelector('.delete-task').onclick = function() {
          tasksArray.splice(idx, 1);
          localStorage.setItem('studentTasks', JSON.stringify(tasksArray));
          renderList();
        };
        list.appendChild(li);
      })(i);
    }
  }

  var addBtn   = document.getElementById('addTaskBtn');
  var newInput = document.getElementById('newTaskInput');
  var clearBtn = document.getElementById('clearCompletedBtn');

  if (addBtn) {
    addBtn.onclick = function() {
      var val = newInput.value.trim();
      if (val) {
        tasksArray.push({ text:val, completed:false });
        localStorage.setItem('studentTasks', JSON.stringify(tasksArray));
        newInput.value = '';
        renderList();
      }
    };
  }
  if (newInput) {
    newInput.addEventListener('keypress', function(e) { if (e.key==='Enter') addBtn.click(); });
  }
  if (clearBtn) {
    clearBtn.onclick = function() {
      tasksArray = tasksArray.filter(function(t){ return !t.completed; });
      localStorage.setItem('studentTasks', JSON.stringify(tasksArray));
      renderList();
    };
  }
  renderList();
}

function loadGrades() {
  var key = 'grades_' + ((currentUser && currentUser.username) ? currentUser.username : 'guest');
  var def = { English:{q1:'',q2:'',q3:'',q4:''}, Japanese:{q1:'',q2:'',q3:'',q4:''},
              Math:{q1:'',q2:'',q3:'',q4:''},     Science:{q1:'',q2:'',q3:'',q4:''},
              History:{q1:'',q2:'',q3:'',q4:''} };
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch(e) { return def; }
}

function saveGrades(data) {
  var key = 'grades_' + ((currentUser && currentUser.username) ? currentUser.username : 'guest');
  localStorage.setItem(key, JSON.stringify(data));
}

function calcAvg(g) {
  var vals = [g.q1,g.q2,g.q3,g.q4].map(Number).filter(function(v){ return !isNaN(v) && v > 0; });
  if (!vals.length) return null;
  return (vals.reduce(function(a,b){return a+b;},0) / vals.length).toFixed(1);
}

function gradeLabel(a) {
  if (a === null) return { text:'—', cls:'' };
  a = parseFloat(a);
  if (a >= 90) return { text:'Outstanding',      cls:'grade-outstanding'  };
  if (a >= 85) return { text:'Very Good',         cls:'grade-verygood'    };
  if (a >= 80) return { text:'Good',              cls:'grade-good'        };
  if (a >= 75) return { text:'Satisfactory',      cls:'grade-satisfactory'};
  return         { text:'Needs Improvement', cls:'grade-needs'       };
}

function renderGradesPage() {
  var grades = loadGrades();
  var totalAvgs = [];
  var rows = '';

  for (var s = 0; s < subjects.length; s++) {
    var sub = subjects[s];
    var g   = grades[sub] || { q1:'',q2:'',q3:'',q4:'' };
    var a   = calcAvg(g);
    var lbl = gradeLabel(a);
    if (a !== null) totalAvgs.push(parseFloat(a));
    rows +=
      '<tr>' +
        '<td class="grade-subject-cell">' + sub + '</td>' +
        '<td><input class="grade-input" type="number" min="0" max="100" data-sub="' + sub + '" data-q="q1" value="' + escapeHtml(g.q1) + '" placeholder="—"></td>' +
        '<td><input class="grade-input" type="number" min="0" max="100" data-sub="' + sub + '" data-q="q2" value="' + escapeHtml(g.q2) + '" placeholder="—"></td>' +
        '<td><input class="grade-input" type="number" min="0" max="100" data-sub="' + sub + '" data-q="q3" value="' + escapeHtml(g.q3) + '" placeholder="—"></td>' +
        '<td><input class="grade-input" type="number" min="0" max="100" data-sub="' + sub + '" data-q="q4" value="' + escapeHtml(g.q4) + '" placeholder="—"></td>' +
        '<td class="grade-avg-cell"><strong>' + (a !== null ? a : '—') + '</strong></td>' +
        '<td><span class="grade-badge ' + lbl.cls + '">' + lbl.text + '</span></td>' +
      '</tr>';
  }

  var overall    = totalAvgs.length ? (totalAvgs.reduce(function(a,b){return a+b;},0)/totalAvgs.length).toFixed(1) : null;
  var overallLbl = gradeLabel(overall);

  var bannerHtml = '';
  if (overall) {
    bannerHtml =
      '<div class="overall-grade-banner mb-4">' +
        '<div>' +
          '<span class="section-label">Overall Average</span>' +
          '<div class="overall-avg-num">' + overall + '</div>' +
        '</div>' +
        '<span class="grade-badge ' + overallLbl.cls + '" style="font-size:15px;padding:8px 20px;">' + overallLbl.text + '</span>' +
      '</div>';
  }

  return '<div class="container">' +
    '<div class="card card-notebook p-4">' +
      '<h2 class="page-title text-center">My Grades</h2>' +
      '<p class="text-center mb-4" style="color:var(--text-soft)">Enter your quarterly grades and click Save.</p>' +
      bannerHtml +
      '<div class="table-responsive">' +
        '<table class="grades-table">' +
          '<thead><tr>' +
            '<th>Subject</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Average</th><th>Remarks</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">' +
        '<button class="lc-submit" style="width:auto;padding:10px 28px;font-size:14px;" ' +
          'onclick="window.saveGradesNow()">Save Grades</button>' +
        '<div id="gradesSaveMsg" style="color:#1e7a45;font-size:13px;"></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

window.saveGradesNow = function() {
  var grades = loadGrades();
  var inputs = document.querySelectorAll('.grade-input');
  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    if (grades[inp.dataset.sub]) grades[inp.dataset.sub][inp.dataset.q] = inp.value;
  }
  saveGrades(grades);
  var cd = document.getElementById('dynamicContent');
  if (cd) { cd.innerHTML = renderGradesPage(); }
  var msg = document.getElementById('gradesSaveMsg');
  if (msg) { msg.innerText = 'Grades saved!'; setTimeout(function(){ msg.innerText=''; }, 2000); }
};

function renderProfilePage() {
  var av = (currentUser && currentUser.avatar) ? currentUser.avatar : '';
  return '<div class="container">' +
    '<div class="card card-notebook p-4 mx-auto" style="max-width:600px;">' +
      '<h2 class="page-title text-center mb-4">My Profile</h2>' +
      '<div class="profile-pic-edit">' +
        '<img id="profilePreview" src="' + av + '" class="profile-pic" ' +
          'onclick="document.getElementById(\'profilePicInput\').click()" ' +
          'onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23fce8ef%22/%3E%3C/svg%3E\'">' +
        '<p style="font-size:13px;color:var(--text-soft);margin-top:8px;">Click photo to change</p>' +
        '<input type="file" id="profilePicInput" class="hidden-file-input" accept="image/*">' +
      '</div>' +
      '<span class="section-label mt-2">First Name</span>' +
      '<input id="profFirst" class="form-control mb-3" value="' + escapeHtml((currentUser && currentUser.firstname) || '') + '">' +
      '<span class="section-label">Last Name</span>' +
      '<input id="profLast"  class="form-control mb-3" value="' + escapeHtml((currentUser && currentUser.lastname) || '') + '">' +
      '<span class="section-label">Age</span>' +
      '<input id="profAge"   class="form-control mb-3" type="number" value="' + ((currentUser && currentUser.age) || '') + '">' +
      '<span class="section-label">Email</span>' +
      '<input id="profEmail" class="form-control mb-3" value="' + escapeHtml((currentUser && currentUser.email) || '') + '">' +
      '<span class="section-label">Username</span>' +
      '<input class="form-control mb-4" value="' + escapeHtml((currentUser && currentUser.username) || '') + '" disabled>' +
      '<button id="updateProfileBtn" class="lc-submit">Update Profile</button>' +
      '<div id="profMsg" class="text-center small mt-3" style="color:#1e7a45;"></div>' +
    '</div>' +
  '</div>';
}

function attachProfileEvents() {
  var fileInput = document.getElementById('profilePicInput');
  var preview   = document.getElementById('profilePreview');
  if (fileInput) {
    fileInput.onchange = function(e) {
      var file = e.target.files[0];
      if (file) {
        var r = new FileReader();
        r.onload = function(ev) {
          if (preview) preview.src = ev.target.result;
          if (currentUser) currentUser.avatar = ev.target.result;
        };
        r.readAsDataURL(file);
      }
    };
  }
  var btn = document.getElementById('updateProfileBtn');
  if (btn) {
    btn.onclick = function() {
      if (!currentUser) return;
      currentUser.firstname = document.getElementById('profFirst').value;
      currentUser.lastname  = document.getElementById('profLast').value;
      currentUser.age       = parseInt(document.getElementById('profAge').value);
      currentUser.email     = document.getElementById('profEmail').value;
      if (preview && preview.src && preview.src.indexOf('data:image/svg') === -1) {
        currentUser.avatar = preview.src;
      }
      for (var i = 0; i < registeredUsers.length; i++) {
        if (registeredUsers[i].username === currentUser.username) {
          registeredUsers[i] = Object.assign({}, currentUser); break;
        }
      }
      var msg = document.getElementById('profMsg');
      if (msg) { msg.innerText = 'Profile updated successfully!'; setTimeout(function(){ msg.innerText=''; }, 2500); }
    };
  }
}

function loadPage(pageId) {
  var contentDiv = document.getElementById('dynamicContent');
  if (!contentDiv) return;

  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  for (var n = 0; n < navLinks.length; n++) navLinks[n].classList.remove('active-nav');

  var pageIndex = { dashboard:0, notebook:1, tasks:2, grades:3, profile:4 };
  var nonDangerLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.text-danger)');
  if (pageIndex[pageId] !== undefined && nonDangerLinks[pageIndex[pageId]]) {
    nonDangerLinks[pageIndex[pageId]].classList.add('active-nav');
  }

  if      (pageId === 'dashboard') { contentDiv.innerHTML = showDashboardContent(); renderCalendarWidget('calendar-widget-container'); attachGameEvents(); startClock(); }
  else if (pageId === 'notebook')  { contentDiv.innerHTML = renderVirtualNotebook(); }
  else if (pageId === 'tasks')     { contentDiv.innerHTML = renderTasksPage(); attachTaskEvents(); }
  else if (pageId === 'grades')    { contentDiv.innerHTML = renderGradesPage(); }
  else if (pageId === 'profile')   { contentDiv.innerHTML = renderProfilePage(); attachProfileEvents(); }

  animatePageIn();
  window.scrollTo(0, 0);
}

function doLogin() {
  var u     = document.getElementById('login-user').value.trim();
  var p     = document.getElementById('login-pass').value.trim();
  var stay  = document.getElementById('stay-logged-in').checked;
  var found = null;
  for (var i = 0; i < registeredUsers.length; i++) {
    if (registeredUsers[i].username === u && registeredUsers[i].password === p) {
      found = registeredUsers[i]; break;
    }
  }
  if (found) {
    currentUser = Object.assign({}, found);
    if (stay) localStorage.setItem('akademi_session', JSON.stringify({ username: u }));
    else localStorage.removeItem('akademi_session');
    showLoadingScreen(showDashboard);
  } else {
    var err = document.getElementById('login-error');
    if (err) { err.style.display = 'block'; setTimeout(function(){ err.style.display='none'; }, 2500); }
  }
}

function doRegister() {
  var first = document.getElementById('reg-first').value.trim();
  var last  = document.getElementById('reg-last').value.trim();
  var age   = parseInt(document.getElementById('reg-age').value);
  var user  = document.getElementById('reg-username').value.trim();
  var pass  = document.getElementById('reg-pass').value.trim();
  var terms = document.getElementById('reg-terms').checked;
  var err   = document.getElementById('reg-error');

  if (!first||!last||!user||!pass||isNaN(age)||age<10||age>20||!terms) {
    if (err) { err.style.display='block'; err.innerText='Please fill in all fields correctly.'; }
    return;
  }
  for (var i = 0; i < registeredUsers.length; i++) {
    if (registeredUsers[i].username === user) {
      if (err) { err.style.display='block'; err.innerText='Username already taken. Try another.'; }
      return;
    }
  }

  var avatarEl = document.querySelector('#lc-profile-box img');
  var avatar   = (avatarEl && avatarEl.src) ? avatarEl.src : null;
  var newUser  = {
    username:  user, password:  pass,
    firstname: first, lastname: last, age: age,
    contact:   document.getElementById('reg-contact').value,
    email:     document.getElementById('reg-email').value,
    avatar:    avatar
  };
  registeredUsers.push(newUser);
  currentUser = Object.assign({}, newUser);

  if (document.getElementById('reg-stay').checked) {
    localStorage.setItem('akademi_session', JSON.stringify({ username: user }));
  }
  showLoadingScreen(showDashboard);
}

function showDashboard() {
  var loginCard = document.getElementById('login-card-container');
  var dashApp   = document.getElementById('dashboardApp');
  if (loginCard) loginCard.style.display = 'none';
  if (dashApp)   dashApp.style.display   = 'block';
  document.body.style.display = 'block';

  initDarkMode();
  loadCalendarEvents();
  loadPage('dashboard');

  var quotes = ['Believe you can!','Effort will be rewarded','Stay curious','Dream big'];
  var fq = document.getElementById('footerQuote');
  if (fq) fq.innerText = quotes[Math.floor(Math.random() * quotes.length)];

  var saveBtn = document.getElementById('saveEventBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveEventFromModal);
}

function logout() {
  currentUser = null;
  localStorage.removeItem('akademi_session');
  var loginCard = document.getElementById('login-card-container');
  var dashApp   = document.getElementById('dashboardApp');
  if (loginCard) { loginCard.style.display = 'block'; }
  if (dashApp)   { dashApp.style.display   = 'none';  }
  document.body.style.display = 'flex';
  document.body.classList.remove('dark-mode');
  var lu = document.getElementById('login-user');
  var lp = document.getElementById('login-pass');
  if (lu) lu.value = '';
  if (lp) lp.value = '';
}

function switchTab(tab) {
  var isLogin = (tab === 'login');
  document.getElementById('tab-login').classList.toggle('active',  isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('login-form-wrap').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('register-form-wrap').style.display = isLogin ? 'none'  : 'block';
}

var avatarInput = document.getElementById('lc-avatar-input');
if (avatarInput) {
  avatarInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file) {
      var r = new FileReader();
      r.onload = function(ev) {
        var box = document.getElementById('lc-profile-box');
        if (box) box.innerHTML = '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      };
      r.readAsDataURL(file);
    }
  });
}

var loginUser = document.getElementById('login-user');
var loginPass = document.getElementById('login-pass');
if (loginUser) loginUser.addEventListener('keypress', function(e){ if(e.key==='Enter') doLogin(); });
if (loginPass) loginPass.addEventListener('keypress', function(e){ if(e.key==='Enter') doLogin(); });

var saveEventBtn = document.getElementById('saveEventBtn');
if (saveEventBtn) saveEventBtn.addEventListener('click', saveEventFromModal);

var savedSession = localStorage.getItem('akademi_session');
if (savedSession && document.getElementById('login-card-container')) {
  try {
    var sData  = JSON.parse(savedSession);
    var sFound = null;
    for (var si = 0; si < registeredUsers.length; si++) {
      if (registeredUsers[si].username === sData.username) { sFound = registeredUsers[si]; break; }
    }
    if (sFound) {
      currentUser = Object.assign({}, sFound);
      showLoadingScreen(showDashboard);
    }
  } catch(e) {}
}