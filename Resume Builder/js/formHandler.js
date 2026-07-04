/* formHandler.js — owns the resume state object, binds every form
   control to it, and keeps the preview + localStorage in sync. */

const App = {

  state: null,
  saveTimer: null,

  emptyState() {
    return {
      template: DEFAULT_TEMPLATE,
      personal: { name: '', title: '', email: '', phone: '', location: '', website: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: []
    };
  },

  genId() {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /* ---------------- init ---------------- */

  init() {
    const saved = Storage.load();
    this.state = saved || this.emptyState();
    // guard against older/partial saved shapes
    this.state = Object.assign(this.emptyState(), saved || {});

    this.bindPersonal();
    this.bindSummary();
    this.bindSkillInput();
    this.bindAddButtons();
    this.bindTemplateTabs();

    this.renderRepeatable('experience');
    this.renderRepeatable('education');
    this.renderRepeatable('projects');
    this.renderSkillTags();
    this.setActiveTab(this.state.template);

    Preview.render(this.state);
  },

  /* ---------------- persistence ---------------- */

  scheduleSave() {
    const indicator = document.getElementById('saveIndicator');
    indicator.textContent = 'saving…';
    indicator.classList.add('dirty');

    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      Storage.save(this.state);
      indicator.textContent = 'saved';
      indicator.classList.remove('dirty');
    }, 500);
  },

  onChange() {
    Preview.render(this.state);
    this.scheduleSave();
  },

  /* ---------------- personal + summary ---------------- */

  bindPersonal() {
    const map = {
      'p-name': 'name', 'p-title': 'title', 'p-email': 'email',
      'p-phone': 'phone', 'p-location': 'location', 'p-website': 'website'
    };
    Object.entries(map).forEach(([elId, field]) => {
      const el = document.getElementById(elId);
      el.value = this.state.personal[field] || '';
      el.addEventListener('input', () => {
        this.state.personal[field] = el.value;
        this.onChange();
      });
    });
  },

  bindSummary() {
    const el = document.getElementById('p-summary');
    el.value = this.state.summary || '';
    el.addEventListener('input', () => {
      this.state.summary = el.value;
      this.onChange();
    });
  },

  /* ---------------- repeatable sections (experience / education / projects) ---------------- */

  listElId: { experience: 'experienceList', education: 'educationList', projects: 'projectsList' },
  tplElId: { experience: 'tpl-experience-row', education: 'tpl-education-row', projects: 'tpl-projects-row' },

  bindAddButtons() {
    document.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => this.addEntry(btn.dataset.add));
    });
  },

  blankEntry(type) {
    if (type === 'experience') return { id: this.genId(), role: '', company: '', location: '', start: '', end: '', current: false, bullets: '' };
    if (type === 'education') return { id: this.genId(), school: '', degree: '', field: '', start: '', end: '', gpa: '' };
    if (type === 'projects') return { id: this.genId(), name: '', link: '', description: '' };
  },

  addEntry(type) {
    this.state[type].push(this.blankEntry(type));
    this.renderRepeatable(type);
    this.onChange();
  },

  removeEntryById(type, id) {
    this.state[type] = this.state[type].filter(item => item.id !== id);
    this.renderRepeatable(type);
    this.onChange();
  },

  renderRepeatable(type) {
    const listEl = document.getElementById(this.listElId[type]);
    const tpl = document.getElementById(this.tplElId[type]);
    listEl.innerHTML = '';

    this.state[type].forEach(item => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = item.id;

      // title input (role / school / name) uses a different class than data-field inputs
      const titleField = { experience: 'role', education: 'school', projects: 'name' }[type];
      const titleInput = node.querySelector('.entry-title-input');
      titleInput.value = item[titleField] || '';
      titleInput.addEventListener('input', () => {
        item[titleField] = titleInput.value;
        this.onChange();
      });

      node.querySelectorAll('[data-field]').forEach(input => {
        const field = input.dataset.field;
        if (field === titleField) return; // already bound above

        if (input.type === 'checkbox') {
          input.checked = !!item[field];
          input.addEventListener('change', () => {
            item[field] = input.checked;
            this.onChange();
          });
        } else {
          input.value = item[field] || '';
          input.addEventListener('input', () => {
            item[field] = input.value;
            this.onChange();
          });
        }
      });

      node.querySelector('[data-remove]').addEventListener('click', () => {
        this.removeEntryById(type, item.id);
      });

      listEl.appendChild(node);
    });
  },

  /* ---------------- skills ---------------- */

  bindSkillInput() {
    const input = document.getElementById('skillInput');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        this.state.skills.push(input.value.trim());
        input.value = '';
        this.renderSkillTags();
        this.onChange();
      }
    });
  },

  renderSkillTags() {
    const wrap = document.getElementById('skillTags');
    wrap.innerHTML = '';
    this.state.skills.forEach((skill, i) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.innerHTML = `${Preview.esc(skill)} <button type="button" aria-label="Remove ${Preview.esc(skill)}">✕</button>`;
      tag.querySelector('button').addEventListener('click', () => {
        this.state.skills.splice(i, 1);
        this.renderSkillTags();
        this.onChange();
      });
      wrap.appendChild(tag);
    });
  },

  /* ---------------- templates ---------------- */

  bindTemplateTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.state.template = tab.dataset.template;
        this.setActiveTab(this.state.template);
        this.onChange();
      });
    });
  },

  setActiveTab(templateId) {
    document.querySelectorAll('.tab').forEach(tab => {
      const active = tab.dataset.template === templateId;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  },

  /* ---------------- import / replace state wholesale ---------------- */

  loadState(newState) {
    this.state = Object.assign(this.emptyState(), newState);
    this.bindPersonal();
    this.bindSummary();
    this.renderRepeatable('experience');
    this.renderRepeatable('education');
    this.renderRepeatable('projects');
    this.renderSkillTags();
    this.setActiveTab(this.state.template);
    Preview.render(this.state);
    Storage.save(this.state);
  }
};