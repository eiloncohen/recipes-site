// ===== State =====
let allRecipes = [];
let currentCategory = 'הכל';
let currentSearch = '';

// ===== DOM =====
const recipesGrid = document.getElementById('recipesGrid');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const searchInput = document.getElementById('searchInput');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const drawerOverlay = document.getElementById('drawerOverlay');
const recipeForm = document.getElementById('recipeForm');
const formTitle = document.getElementById('formTitle');
const editId = document.getElementById('editId');
const toast = document.getElementById('toast');

// ===== API =====
const API = '/recipes';

async function fetchRecipes() {
  try {
    loadingState.style.display = 'block';
    recipesGrid.style.display = 'none';
    emptyState.style.display = 'none';

    const res = await fetch(API);
    allRecipes = await res.json();
    renderRecipes();
  } catch (err) {
    showToast('שגיאה בטעינת המתכונים', 'error');
  } finally {
    loadingState.style.display = 'none';
  }
}

async function saveRecipe(data) {
  const id = editId.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/${id}` : API;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'שגיאה בשמירה');
  }
  return res.json();
}

async function deleteRecipe(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('שגיאה במחיקה');
}

// ===== Render =====
function renderRecipes() {
  let filtered = allRecipes;

  if (currentCategory !== 'הכל') {
    filtered = filtered.filter(r => r.category === currentCategory);
  }
  if (currentSearch.trim()) {
    const q = currentSearch.trim().toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.ingredients?.some(i => i.toLowerCase().includes(q))
    );
  }

  recipesGrid.innerHTML = '';

  if (filtered.length === 0) {
    recipesGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  recipesGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  filtered.forEach((recipe, i) => {
    const card = createCard(recipe, i);
    recipesGrid.appendChild(card);
  });
}

function createCard(recipe, index) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const ingCount = recipe.ingredients?.length || 0;
  const stepsCount = recipe.instructions?.length || 0;

  card.innerHTML = `
    <div class="card-banner"></div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-category">${recipe.category || 'כללי'}</span>
        ${recipe.prepTime ? `<span class="card-time">⏱ ${recipe.prepTime}</span>` : ''}
      </div>
      <h3 class="card-title">${escapeHtml(recipe.title)}</h3>
      ${recipe.description ? `<p class="card-desc">${escapeHtml(recipe.description)}</p>` : ''}
    </div>
    <div class="card-footer">
      <span class="card-ingredients-count">${ingCount} מצרכים · ${stepsCount} שלבים</span>
      <div class="card-actions">
        <button class="btn-card-edit" title="עריכה" onclick="openEditForm(event, ${recipe.id})">✏️</button>
        <button class="btn-card-delete" title="מחיקה" onclick="confirmDelete(event, ${recipe.id}, '${escapeHtml(recipe.title)}')">🗑</button>
      </div>
    </div>
  `;

  // Click card body opens modal
  card.querySelector('.card-body').addEventListener('click', () => openModal(recipe));
  card.querySelector('.card-footer').addEventListener('click', (e) => {
    if (!e.target.closest('button')) openModal(recipe);
  });

  return card;
}

// ===== Modal =====
function openModal(recipe) {
  const ingHtml = recipe.ingredients?.map(i => `<li>${escapeHtml(i)}</li>`).join('') || '';
  const stepsHtml = recipe.instructions?.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '';

  modalBody.innerHTML = `
    <p class="modal-category">${recipe.category || 'כללי'}</p>
    <h2 class="modal-title">${escapeHtml(recipe.title)}</h2>
    ${recipe.description ? `<p class="modal-desc">${escapeHtml(recipe.description)}</p>` : ''}
    <div class="modal-info">
      ${recipe.prepTime ? `
        <div class="modal-info-item">⏱ <strong>${escapeHtml(recipe.prepTime)}</strong>
        </div>` : ''}
      <div class="modal-info-item">🥗 <strong>${recipe.ingredients?.length || 0} מצרכים</strong></div>
      <div class="modal-info-item">📋 <strong>${recipe.instructions?.length || 0} שלבים</strong></div>
    </div>
    <h4 class="modal-section-title">מצרכים</h4>
    <ul class="ingredients-list">${ingHtml}</ul>
    <h4 class="modal-section-title">אופן הכנה</h4>
    <ol class="instructions-list">${stepsHtml}</ol>
  `;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('btnCloseModal').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ===== Drawer (Form) =====
function openAddForm() {
  formTitle.textContent = 'הוספת מתכון חדש';
  editId.value = '';
  recipeForm.reset();
  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openEditForm(e, id) {
  e.stopPropagation();
  const recipe = allRecipes.find(r => r.id === id);
  if (!recipe) return;

  formTitle.textContent = 'עריכת מתכון';
  editId.value = id;
  document.getElementById('fTitle').value = recipe.title;
  document.getElementById('fCategory').value = recipe.category || 'כללי';
  document.getElementById('fPrepTime').value = recipe.prepTime || '';
  document.getElementById('fDescription').value = recipe.description || '';
  document.getElementById('fIngredients').value = (recipe.ingredients || []).join('\n');
  document.getElementById('fInstructions').value = (recipe.instructions || []).join('\n');

  drawerOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawerOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('btnOpenForm').addEventListener('click', openAddForm);
document.getElementById('btnCloseDrawer').addEventListener('click', closeDrawer);
document.getElementById('btnCancelForm').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', (e) => {
  if (e.target === drawerOverlay) closeDrawer();
});

// ===== Form Submit =====
recipeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitForm');
  btn.disabled = true;
  btn.textContent = 'שומר...';

  const data = {
    title: document.getElementById('fTitle').value,
    category: document.getElementById('fCategory').value,
    prepTime: document.getElementById('fPrepTime').value,
    description: document.getElementById('fDescription').value,
    ingredients: document.getElementById('fIngredients').value,
    instructions: document.getElementById('fInstructions').value,
  };

  try {
    await saveRecipe(data);
    showToast(editId.value ? '✅ המתכון עודכן!' : '✅ המתכון נשמר!', 'success');
    closeDrawer();
    await fetchRecipes();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 שמור מתכון';
  }
});

// ===== Delete =====
async function confirmDelete(e, id, name) {
  e.stopPropagation();
  if (!confirm(`למחוק את "${name}"?`)) return;

  try {
    await deleteRecipe(id);
    showToast('🗑 המתכון נמחק', 'success');
    await fetchRecipes();
  } catch (err) {
    showToast('שגיאה במחיקה', 'error');
  }
}

// ===== Search & Filter =====
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderRecipes();
});

document.getElementById('categoryTabs').addEventListener('click', (e) => {
  if (!e.target.classList.contains('cat-tab')) return;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  currentCategory = e.target.dataset.cat;
  renderRecipes();
});

// Keyboard shortcut: ESC closes overlays
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeDrawer();
  }
});

// ===== Toast =====
let toastTimer;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// ===== Utils =====
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Init =====
fetchRecipes();
