const API = 'http://localhost:8000';
let token = localStorage.getItem('token');

if (token) showApp();

function handleUnauthorized() {
  localStorage.removeItem('token');
  token = null;
  document.getElementById('app-section').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('auth-msg').style.color = 'red';
  document.getElementById('auth-msg').textContent = 'Session expired. Please login again.';
}

async function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    document.getElementById('auth-msg').style.color = 'red';
    document.getElementById('auth-msg').textContent = 'Username and password are required.';
    return;
  }
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('auth-msg').style.color = 'green';
      document.getElementById('auth-msg').textContent = 'Registered! Now login.';
    } else {
      document.getElementById('auth-msg').style.color = 'red';
      document.getElementById('auth-msg').textContent = data.detail || 'Registration failed.';
    }
  } catch (err) {
    document.getElementById('auth-msg').style.color = 'red';
    document.getElementById('auth-msg').textContent = 'Cannot connect to server. Is it running?';
  }
}

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) {
    document.getElementById('auth-msg').style.color = 'red';
    document.getElementById('auth-msg').textContent = 'Username and password are required.';
    return;
  }
  try {
    const form = new URLSearchParams({username, password});
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: form
    });
    const data = await res.json();
    if (res.ok) {
      token = data.access_token;
      localStorage.setItem('token', token);
      document.getElementById('auth-msg').textContent = '';
      showApp();
    } else {
      document.getElementById('auth-msg').style.color = 'red';
      document.getElementById('auth-msg').textContent = data.detail || 'Login failed.';
    }
  } catch (err) {
    document.getElementById('auth-msg').style.color = 'red';
    document.getElementById('auth-msg').textContent = 'Cannot connect to server. Is it running?';
  }
}

function logout() {
  localStorage.removeItem('token');
  token = null;
  document.getElementById('app-section').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('auth-msg').textContent = '';
}

function showApp() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'block';
  loadTasks();
}

async function loadTasks() {
  const res = await fetch(`${API}/tasks/`, {
    headers: {'Authorization': `Bearer ${token}`}
  });
  if (res.status === 401) { handleUnauthorized(); return; }
  const tasks = await res.json();
  if (!Array.isArray(tasks)) return;
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'done' : ''}`;
    div.innerHTML = `
      <span>${task.title}</span>
      ${!task.completed ? `<button onclick='completeTask(${task.id})'>Done</button>` : ''}
      <button onclick='deleteTask(${task.id})' style='background:#fee'>Del</button>
    `;
    list.appendChild(div);
  });
}

async function createTask() {
  const title = document.getElementById('task-input').value.trim();
  if (!title) return;
  const res = await fetch(`${API}/tasks/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({title})
  });
  if (res.status === 401) { handleUnauthorized(); return; }
  if (res.ok) {
    document.getElementById('task-input').value = '';
    loadTasks();
  }
}

async function completeTask(id) {
  const res = await fetch(`${API}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: {'Authorization': `Bearer ${token}`}
  });
  if (res.status === 401) { handleUnauthorized(); return; }
  loadTasks();
}

async function deleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: 'DELETE',
    headers: {'Authorization': `Bearer ${token}`}
  });
  if (res.status === 401) { handleUnauthorized(); return; }
  loadTasks();
}
