/* storage.js — simple localStorage wrapper for saving/loading resume state */

const STORAGE_KEY = 'draft.resumeBuilder.v1';

const Storage = {
  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('Could not save resume data:', err);
      return false;
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Could not load resume data:', err);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Trigger a browser download of the given state as a .json file */
  downloadJSON(state, filename = 'resume.json') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /** Read a File object (from an <input type=file>) and return parsed JSON via callback */
  readJSONFile(file, onLoaded, onError) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onLoaded(data);
      } catch (err) {
        onError && onError(err);
      }
    };
    reader.onerror = onError;
    reader.readAsText(file);
  }
};