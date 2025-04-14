// Auto-save draft functionality
let autoSaveTimeout;
const AUTO_SAVE_DELAY = 1000; // 1 second

function autoSaveDraft() {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    const draft = {
      title: document.getElementById('title').value,
      category: document.getElementById('category').value,
      newCategory: document.getElementById('newCategory').value,
      content: document.getElementById('content').value
    };
    localStorage.setItem('promptDraft', JSON.stringify(draft));
  }, AUTO_SAVE_DELAY);
}

function loadDraft() {
  const draft = JSON.parse(localStorage.getItem('promptDraft'));
  if (draft) {
    document.getElementById('title').value = draft.title || '';
    document.getElementById('category').value = draft.category || 'Essay';
    document.getElementById('newCategory').value = draft.newCategory || '';
    document.getElementById('content').value = draft.content || '';
  }
}

// Add event listeners for auto-save
document.getElementById('title').addEventListener('input', autoSaveDraft);
document.getElementById('category').addEventListener('change', autoSaveDraft);
document.getElementById('newCategory').addEventListener('input', autoSaveDraft);
document.getElementById('content').addEventListener('input', autoSaveDraft);

function savePrompt() {
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const newCategory = document.getElementById('newCategory').value;
  const content = document.getElementById('content').value;

  if (!title || !content) return alert('Please fill out all fields.');

  const finalCategory = newCategory || category;
  if (newCategory) {
    // Add new category to select options
    const categorySelect = document.getElementById('category');
    const filterSelect = document.getElementById('filter');
    const option = document.createElement('option');
    option.value = newCategory;
    option.textContent = newCategory;
    categorySelect.appendChild(option.cloneNode(true));
    filterSelect.appendChild(option);
  }

  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  prompts.push({
    title,
    category: finalCategory,
    content,
    date: new Date().toISOString(),
    isFavorite: false,
    isArchived: false
  });
  localStorage.setItem('prompts', JSON.stringify(prompts));

  // Clear form and draft
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('newCategory').value = '';
  localStorage.removeItem('promptDraft');
  renderPrompts();
}

function renderPrompts() {
  let prompts = JSON.parse(localStorage.getItem('prompts')) || [];

  if (prompts.length === 0) {
    const currentDate = new Date().toISOString();
    prompts = [
      { 
        title: 'Essay Structure Prompt', 
        category: 'Essay', 
        content: 'Write an introduction, three body paragraphs, and a conclusion about [topic]. Use formal tone.', 
        date: currentDate, 
        isFavorite: false,
        isArchived: false
      },
      { 
        title: 'Image Generation Prompt', 
        category: 'Image Gen', 
        content: 'Generate a realistic futuristic cityscape at sunset, in ultra-high resolution.', 
        date: currentDate, 
        isFavorite: false,
        isArchived: false
      },
      { 
        title: 'Bug Fixing Help', 
        category: 'Coding', 
        content: 'You are a senior developer. Help me debug the following Python code: [paste code]', 
        date: currentDate, 
        isFavorite: false,
        isArchived: false
      },
    ];
    localStorage.setItem('prompts', JSON.stringify(prompts));
  }

  const filter = document.getElementById('filter').value;
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const showFavorites = document.getElementById('favoritesFilter').classList.contains('active');
  const showArchived = document.getElementById('archivedFilter').classList.contains('active');
  const list = document.getElementById('promptList');
  list.innerHTML = '';

  let filteredPrompts = filter === 'All' ? prompts : prompts.filter(p => p.category === filter);
  
  if (searchQuery) {
    filteredPrompts = filteredPrompts.filter(p => 
      p.title.toLowerCase().includes(searchQuery) || 
      p.content.toLowerCase().includes(searchQuery)
    );
  }

  if (showFavorites) {
    filteredPrompts = filteredPrompts.filter(p => p.isFavorite);
  }

  if (showArchived) {
    filteredPrompts = filteredPrompts.filter(p => p.isArchived);
  } else {
    filteredPrompts = filteredPrompts.filter(p => !p.isArchived);
  }

  filteredPrompts.forEach((p, index) => {
    const prompt = document.createElement('div');
    prompt.className = `prompt ${p.isArchived ? 'archived' : ''}`;
    prompt.setAttribute('data-id', index);

    const header = document.createElement('div');
    header.className = 'prompt-header';
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'prompt-title';
    
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = `favorite-btn ${p.isFavorite ? 'active' : ''}`;
    favoriteBtn.innerHTML = '⭐';
    favoriteBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(index);
    };

    const title = document.createElement('span');
    title.innerHTML = `<strong>${p.title}</strong>`;
    
    const date = document.createElement('span');
    date.className = 'prompt-date';
    date.textContent = new Date(p.date).toLocaleDateString();
    
    const category = document.createElement('span');
    category.textContent = `(${p.category})`;

    titleContainer.appendChild(favoriteBtn);
    titleContainer.appendChild(title);
    titleContainer.appendChild(date);
    header.appendChild(titleContainer);
    header.appendChild(category);

    header.onclick = () => {
      const contentEl = prompt.querySelector('.prompt-content');
      contentEl.style.display = contentEl.style.display === 'none' ? 'block' : 'none';
    };

    const content = document.createElement('div');
    content.className = 'prompt-content';
    content.innerHTML = `
      <p>${p.content}</p>
      <div class="prompt-actions">
        <button onclick="editPrompt(${index})">Edit</button>
        <button onclick="archivePrompt(${index})">${p.isArchived ? 'Restore' : 'Archive'}</button>
      </div>
    `;

    prompt.appendChild(header);
    prompt.appendChild(content);
    list.appendChild(prompt);
  });

  Sortable.create(list, {
    animation: 150,
    onEnd: function (evt) {
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
      const moved = prompts.splice(oldIndex, 1)[0];
      prompts.splice(newIndex, 0, moved);
      localStorage.setItem('prompts', JSON.stringify(prompts));
      renderPrompts();
    },
  });
}

function toggleFavorite(index) {
  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  prompts[index].isFavorite = !prompts[index].isFavorite;
  localStorage.setItem('prompts', JSON.stringify(prompts));
  renderPrompts();
}

function toggleFavoritesFilter() {
  const button = document.getElementById('favoritesFilter');
  button.classList.toggle('active');
  renderPrompts();
}

function toggleArchivedFilter() {
  const button = document.getElementById('archivedFilter');
  button.classList.toggle('active');
  renderPrompts();
}

function archivePrompt(index) {
  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  prompts[index].isArchived = !prompts[index].isArchived;
  localStorage.setItem('prompts', JSON.stringify(prompts));
  renderPrompts();
}

function searchPrompts() {
  renderPrompts();
}

function editPrompt(index) {
  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  const prompt = prompts[index];

  document.getElementById('title').value = prompt.title;
  document.getElementById('category').value = prompt.category;
  document.getElementById('content').value = prompt.content;

  prompts.splice(index, 1);
  localStorage.setItem('prompts', JSON.stringify(prompts));
  renderPrompts();
}

function exportPrompts() {
  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  let txtContent = '';
  prompts.forEach((p, i) => {
    if (!p.isArchived) {
      txtContent += `${i + 1}. ${p.title} [${p.category}] (${new Date(p.date).toLocaleDateString()}):\n${p.content}\n\n`;
    }
  });
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'prompts.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
}

function toggleTheme() {
  document.body.classList.toggle('light');
}

// Load draft on page load
loadDraft();
renderPrompts();