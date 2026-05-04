// ─── SUPABASE CONFIG ─────────────────────────────────────
// Replace these two values with your project's URL and anon key from supabase.com
const SUPABASE_URL  = 'https://wxmrmxxedoizdrcthlwo.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_aZgHoBkxS9obrmFo_5zicA_bCkwu9CX';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── STATE ───────────────────────────────────────────────
let IDEAS = [];
let TASKS = [];

const TEAM = [
  { initials: 'JO', name: 'Joao',    role: 'Commercial Lead', title: 'CEO', color: 'bg-orange-100 text-orange-700' },
  { initials: 'FE', name: 'Felipe',  role: 'Product Lead',    title: 'CPO', color: 'bg-violet-100 text-violet-700' },
  { initials: 'MA', name: 'Marlon',  role: 'Operations Lead', title: 'COO', color: 'bg-amber-100 text-amber-700'   },
  { initials: 'LE', name: 'Leandro', role: 'Tech Lead',       title: 'CTO', color: 'bg-teal-100 text-teal-700'    },
];

const OWNERS = ['Joao', 'Felipe', 'Marlon', 'Leandro'];

// ─── DEBOUNCE ────────────────────────────────────────────
const debounceTimers = {};
function debounce(key, fn, ms = 600) {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, ms);
}

// ─── INIT ────────────────────────────────────────────────
async function init() {
  // Set date in nav
  document.getElementById('nav-date').textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const [{ data: ideas, error: e1 }, { data: tasks, error: e2 }] = await Promise.all([
    db.from('ideas').select('*').order('sort_order'),
    db.from('tasks').select('*').order('sort_order'),
  ]);

  if (e1 || e2) {
    console.error('Supabase load error:', e1 || e2);
    alert('Could not connect to the database. Check your Supabase config in app.js.');
    return;
  }

  IDEAS = ideas || [];
  TASKS = tasks || [];

  renderTeam();
  renderIdeas();
  renderTasks();
  initScrollReveal();

  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('hidden');
  setTimeout(() => overlay.remove(), 400);
}

// ─── TEAM ────────────────────────────────────────────────
function renderTeam() {
  document.getElementById('team-grid').innerHTML = TEAM.map(m => `
    <div class="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-accent transition-colors duration-200">
      <div class="w-12 h-12 rounded-xl ${m.color} flex items-center justify-center font-display font-700 text-sm">${m.initials}</div>
      <div>
        <p class="font-display font-700 text-base">${m.name}</p>
        <p class="text-xs text-muted mt-0.5">${m.role}</p>
      </div>
      <span class="tag text-accent self-start">${m.title}</span>
    </div>
  `).join('');
}

// ─── IDEAS ───────────────────────────────────────────────
function tagBadge(t) {
  return `<span class="tag px-2 py-0.5 rounded border border-border text-muted">${t}</span>`;
}

function effortColor(e) {
  if (e === 'Low')    return 'bg-green-100 text-green-700';
  if (e === 'Medium') return 'bg-amber-100 text-amber-700';
  if (e === 'High')   return 'bg-red-100 text-red-700';
  return 'bg-surface text-muted';
}

function renderIdeas() {
  document.getElementById('idea-count').textContent = IDEAS.length;
  document.getElementById('ideas-list').innerHTML = IDEAS.map((idea, idx) => `
    <div class="bg-white border border-border rounded-2xl overflow-hidden idea-card" id="card-${idea.id}">
      <div class="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-surface/50 transition-colors" onclick="toggleIdea('${idea.id}')">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <span class="font-display font-700 text-2xl text-border w-8 shrink-0">${String(idx + 1).padStart(2, '0')}</span>
          <div class="min-w-0">
            <p class="font-display font-700 text-base leading-tight" id="title-display-${idea.id}">${idea.title}</p>
            <p class="text-xs text-muted mt-0.5 truncate">${idea.concept}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 ml-4 shrink-0">
          <div class="hidden md:flex gap-1">${(idea.tags || []).map(tagBadge).join('')}</div>
          ${idea.effort ? `<span class="tag px-2 py-0.5 rounded-full ${effortColor(idea.effort)}">${idea.effort}</span>` : ''}
          <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" id="chev-${idea.id}"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>

      <div class="h-0.5 bg-surface mx-6 rounded-full overflow-hidden">
        <div class="progress-bar h-full bg-accent rounded-full" id="prog-${idea.id}" style="width: ${idea.progress}%"></div>
      </div>

      <div class="card-expand" id="expand-${idea.id}">
        <div class="px-6 py-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label class="tag text-muted block mb-2">Title</label>
            <div contenteditable data-placeholder="Idea name"
              class="text-sm font-display font-700 border border-border rounded-xl px-4 py-3 min-h-[44px] focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'title', this)">${idea.title}</div>
          </div>

          <div>
            <label class="tag text-muted block mb-2">One-liner</label>
            <div contenteditable data-placeholder="One sentence concept"
              class="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px] focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'concept', this)">${idea.concept}</div>
          </div>

          <div class="md:col-span-2">
            <label class="tag text-muted block mb-2">Description</label>
            <div contenteditable data-placeholder="Add a full description of this idea…"
              class="min-h-[72px] text-sm leading-relaxed border border-border rounded-xl px-4 py-3 focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'description', this)">${idea.description}</div>
          </div>

          <div>
            <label class="tag text-muted block mb-2">Target Market</label>
            <div contenteditable data-placeholder="Who is this for?"
              class="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px] focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'market', this)">${idea.market}</div>
          </div>

          <div>
            <label class="tag text-muted block mb-2">Revenue Model</label>
            <div contenteditable data-placeholder="How does this make money?"
              class="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px] focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'revenue', this)">${idea.revenue}</div>
          </div>

          <div>
            <label class="tag text-muted block mb-2">Effort Estimate</label>
            <div class="flex border border-border rounded-xl overflow-hidden" id="eff-${idea.id}">
              ${['Low', 'Medium', 'High'].map(e => `
                <button class="seg-btn flex-1 py-2 text-xs font-display font-600 hover:bg-surface ${idea.effort === e ? 'active' : ''}"
                  onclick="selectEffort('${idea.id}', '${e}', this)">${e}</button>
              `).join('<div class="w-px bg-border"></div>')}
            </div>
          </div>

          <div>
            <label class="tag text-muted block mb-2">MVP Deadline</label>
            <div contenteditable data-placeholder="Week # or date"
              class="text-sm border border-border rounded-xl px-4 py-3 min-h-[44px] focus:border-accent"
              oninput="onIdeaInput('${idea.id}', 'deadline', this)">${idea.deadline}</div>
          </div>

          <div class="md:col-span-2 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1">
              <div class="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div class="progress-bar h-full bg-accent rounded-full" id="prog2-${idea.id}" style="width: ${idea.progress}%"></div>
              </div>
              <span class="tag text-muted" id="prog-label-${idea.id}">${idea.progress}% filled</span>
            </div>
            <button onclick="deleteIdea('${idea.id}')" class="text-xs text-muted hover:text-accent transition-colors tag">Delete</button>
          </div>

        </div>
      </div>
    </div>
  `).join('');
}

function toggleIdea(id) {
  const body = document.getElementById('expand-' + id);
  const chev = document.getElementById('chev-' + id);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open', !isOpen);
}

function onIdeaInput(id, field, el) {
  const val = el.textContent.trim();
  const idea = IDEAS.find(i => i.id === id);
  if (!idea) return;
  idea[field] = val;
  if (field === 'title') {
    const display = document.getElementById('title-display-' + id);
    if (display) display.textContent = val || 'Untitled';
  }
  updateProgress(id);
  debounce(`idea-${id}-${field}`, () => {
    db.from('ideas').update({ [field]: val, progress: idea.progress }).eq('id', id);
  });
}

function selectEffort(id, val, btn) {
  const idea = IDEAS.find(i => i.id === id);
  if (!idea) return;
  idea.effort = val;
  document.getElementById('eff-' + id).querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateProgress(id);
  db.from('ideas').update({ effort: val, progress: idea.progress }).eq('id', id);
}

function updateProgress(id) {
  const idea = IDEAS.find(i => i.id === id);
  const body = document.getElementById('expand-' + id);
  if (!body || !idea) return;
  const editables = body.querySelectorAll('[contenteditable]');
  let filled = 0;
  const total = editables.length + 1; // +1 for effort
  editables.forEach(el => { if (el.textContent.trim()) filled++; });
  if (idea.effort) filled++;
  const pct = Math.round((filled / total) * 100);
  idea.progress = pct;
  document.getElementById('prog-' + id).style.width = pct + '%';
  const p2 = document.getElementById('prog2-' + id);
  if (p2) p2.style.width = pct + '%';
  const lbl = document.getElementById('prog-label-' + id);
  if (lbl) lbl.textContent = pct + '% filled';
}

async function addIdea() {
  const id = 'idea-' + Date.now();
  const newIdea = {
    id, title: 'New Idea', concept: '', description: '',
    market: '', revenue: '', effort: '', deadline: '',
    tags: [], progress: 0, sort_order: IDEAS.length,
  };
  const { data, error } = await db.from('ideas').insert(newIdea).select().single();
  if (error) { console.error(error); return; }
  IDEAS.push(data);
  renderIdeas();
  setTimeout(() => toggleIdea(id), 50);
}

async function deleteIdea(id) {
  if (!confirm('Delete this idea?')) return;
  await db.from('ideas').delete().eq('id', id);
  IDEAS = IDEAS.filter(i => i.id !== id);
  renderIdeas();
}

// ─── TASKS ───────────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById('tasks-list');
  const empty = document.getElementById('tasks-empty');
  const done = TASKS.filter(t => t.done).length;
  document.getElementById('tasks-done-count').textContent = `${done} / ${TASKS.length}`;

  if (TASKS.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = TASKS.map(t => `
    <div class="flex items-center gap-3 bg-white border border-border rounded-xl px-5 py-3 group animate-fade-in">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})"
        class="w-4 h-4 rounded accent-[#FF4D1C] shrink-0 cursor-pointer" />
      <div contenteditable data-placeholder="Describe this task…"
        class="flex-1 text-sm ${t.done ? 'line-through text-muted' : ''} focus:outline-none"
        oninput="onTaskInput(${t.id}, 'text', this)">${t.text}</div>
      <select onchange="onTaskSelect(${t.id}, 'owner', this.value)"
        class="text-xs border border-border rounded-lg px-2 py-1 bg-transparent font-display font-600 cursor-pointer">
        <option value="">Owner</option>
        ${OWNERS.map(o => `<option ${t.owner === o ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
      <input type="text" value="${t.due}" placeholder="Due date"
        oninput="onTaskInput(${t.id}, 'due', this)"
        class="text-xs border border-border rounded-lg px-2 py-1 w-28 text-center" />
      <button onclick="deleteTask(${t.id})" class="opacity-0 group-hover:opacity-100 text-muted hover:text-accent transition-all ml-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
  `).join('');
}

function onTaskInput(id, field, el) {
  const val = field === 'text' ? el.textContent.trim() : el.value;
  const task = TASKS.find(t => t.id === id);
  if (!task) return;
  task[field] = val;
  debounce(`task-${id}-${field}`, () => {
    db.from('tasks').update({ [field]: val }).eq('id', id);
  }, field === 'due' ? 400 : 600);
}

function onTaskSelect(id, field, val) {
  const task = TASKS.find(t => t.id === id);
  if (!task) return;
  task[field] = val;
  db.from('tasks').update({ [field]: val }).eq('id', id);
}

async function toggleTask(id) {
  const task = TASKS.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  await db.from('tasks').update({ done: task.done }).eq('id', id);
  renderTasks();
}

async function addTask() {
  const newTask = { text: '', owner: '', due: '', done: false, sort_order: TASKS.length };
  const { data, error } = await db.from('tasks').insert(newTask).select().single();
  if (error) { console.error(error); return; }
  TASKS.push(data);
  renderTasks();
  const inputs = document.querySelectorAll('#tasks-list [contenteditable]');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

async function deleteTask(id) {
  await db.from('tasks').delete().eq('id', id);
  TASKS = TASKS.filter(t => t.id !== id);
  renderTasks();
}

// ─── SCROLL REVEAL ───────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section-fade').forEach(el => obs.observe(el));
}

init();
