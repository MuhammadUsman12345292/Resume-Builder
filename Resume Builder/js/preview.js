/* preview.js — turns the resume state object into the markup shown
   inside the live "paper" preview panel. */

const Preview = {

  /** Basic HTML-escaping so typed content can never break the preview markup */
  esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /** Convert multi-line textarea content into an array of non-empty lines */
  lines(str) {
    return (str || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
  },

  render(state) {
    const paper = document.getElementById('resumePaper');
    paper.className = `paper template-${state.template}`;
    paper.innerHTML =
      this.renderHeader(state.personal) +
      this.renderSummary(state.summary) +
      this.renderExperience(state.experience) +
      this.renderEducation(state.education) +
      this.renderSkills(state.skills) +
      this.renderProjects(state.projects);
  },

  renderHeader(p) {
    const name = this.esc(p.name) || 'Your Name';
    const title = this.esc(p.title);
    const contactParts = [p.email, p.phone, p.location, p.website]
      .filter(Boolean)
      .map(v => `<span>${this.esc(v)}</span>`)
      .join('');

    return `
      <div class="r-header">
        <h1 class="r-name">${name}</h1>
        ${title ? `<div class="r-title">${title}</div>` : ''}
        ${contactParts ? `<div class="r-contact">${contactParts}</div>` : ''}
      </div>`;
  },

  renderSummary(summary) {
    if (!summary || !summary.trim()) return '';
    return `
      <div class="r-section">
        <div class="r-section-title">Summary</div>
        <p class="r-summary">${this.esc(summary)}</p>
      </div>`;
  },

  renderExperience(list) {
    if (!list || !list.length) return '';
    const items = list.map(job => {
      const bullets = this.lines(job.bullets)
        .map(b => `<li>${this.esc(b)}</li>`)
        .join('');
      const end = job.current ? 'Present' : this.esc(job.end);
      return `
        <div class="r-item">
          <div class="r-item-head">
            <span class="r-item-title">${this.esc(job.role) || 'Role title'}${job.company ? ` — ${this.esc(job.company)}` : ''}</span>
            <span class="r-item-date">${this.esc(job.start)}${(job.start || end) ? ' – ' : ''}${end}</span>
          </div>
          ${job.location ? `<div class="r-item-sub">${this.esc(job.location)}</div>` : ''}
          ${bullets ? `<ul class="r-bullets">${bullets}</ul>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="r-section">
        <div class="r-section-title">Experience</div>
        ${items}
      </div>`;
  },

  renderEducation(list) {
    if (!list || !list.length) return '';
    const items = list.map(ed => {
      const degreeLine = [ed.degree, ed.field].filter(Boolean).map(v => this.esc(v)).join(', ');
      return `
        <div class="r-item">
          <div class="r-item-head">
            <span class="r-item-title">${this.esc(ed.school) || 'School name'}</span>
            <span class="r-item-date">${this.esc(ed.start)}${(ed.start || ed.end) ? ' – ' : ''}${this.esc(ed.end)}</span>
          </div>
          ${degreeLine ? `<div class="r-item-sub">${degreeLine}${ed.gpa ? ` · GPA ${this.esc(ed.gpa)}` : ''}</div>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="r-section">
        <div class="r-section-title">Education</div>
        ${items}
      </div>`;
  },

  renderSkills(skills) {
    if (!skills || !skills.length) return '';
    const pills = skills.map(s => `<span class="r-skill-pill">${this.esc(s)}</span>`).join('');
    return `
      <div class="r-section">
        <div class="r-section-title">Skills</div>
        <div class="r-skills">${pills}</div>
      </div>`;
  },

  renderProjects(list) {
    if (!list || !list.length) return '';
    const items = list.map(proj => `
        <div class="r-item">
          <div class="r-item-head">
            <span class="r-item-title">${this.esc(proj.name) || 'Project name'}</span>
            ${proj.link ? `<span class="r-item-date">${this.esc(proj.link)}</span>` : ''}
          </div>
          ${proj.description ? `<div class="r-item-sub">${this.esc(proj.description)}</div>` : ''}
        </div>`).join('');

    return `
      <div class="r-section">
        <div class="r-section-title">Projects</div>
        ${items}
      </div>`;
  }
};