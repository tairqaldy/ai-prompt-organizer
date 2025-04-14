function savePrompt() {
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const content = document.getElementById('content').value;

  if (!title || !content) return alert('Please fill out all fields.');

  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  prompts.push({ title, category, content });
  localStorage.setItem('prompts', JSON.stringify(prompts));

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  renderPrompts();
}

function renderPrompts() {
  let prompts = JSON.parse(localStorage.getItem('prompts')) || [];

  if (prompts.length === 0) {
    prompts = [
      { title: 'Essay Structure Prompt', category: 'Essay', content: 'Write an introduction, three body paragraphs, and a conclusion about [topic]. Use formal tone.' },
      { title: 'Image Generation Prompt', category: 'Image Gen', content: 'Generate a realistic futuristic cityscape at sunset, in ultra-high resolution.' },
      { title: 'Bug Fixing Help', category: 'Coding', content: 'You are a senior developer. Help me debug the following Python code: [paste code]' },
    ];
    localStorage.setItem('prompts', JSON.stringify(prompts));
  }

  const filter = document.getElementById('filter').value;
  const list = document.getElementById('promptList');
  list.innerHTML = '';

  const filteredPrompts = filter === 'All' ? prompts : prompts.filter(p => p.category === filter);

  filteredPrompts.forEach((p, index) => {
    const prompt = document.createElement('div');
    prompt.className = 'prompt';
    prompt.setAttribute('data-id', index);

    const header = document.createElement('div');
    header.className = 'prompt-header';
    header.innerHTML = `<strong>${p.title}</strong><span>(${p.category})</span>`;
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
        <button onclick="deletePrompt(${index})">Delete</button>
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

function deletePrompt(index) {
  const prompts = JSON.parse(localStorage.getItem('prompts')) || [];
  prompts.splice(index, 1);
  localStorage.setItem('prompts', JSON.stringify(prompts));
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
    txtContent += `${i + 1}. ${p.title} [${p.category}]:\n${p.content}\n\n`;
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

renderPrompts();