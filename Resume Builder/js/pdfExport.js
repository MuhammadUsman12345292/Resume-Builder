/* pdfExport.js — "Export PDF" uses the browser's native print dialog
   (Save as PDF) against a print stylesheet that shows only the paper
   preview. This avoids any external library or network dependency. */

const PdfExport = {

  init() {
    document.getElementById('printBtn').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('exportJsonBtn').addEventListener('click', () => {
      const name = (App.state.personal.name || 'resume').trim().replace(/\s+/g, '-').toLowerCase();
      Storage.downloadJSON(App.state, `${name || 'resume'}.json`);
    });

    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    importBtn.addEventListener('click', () => importFile.click());

    importFile.addEventListener('change', () => {
      const file = importFile.files[0];
      if (!file) return;
      Storage.readJSONFile(
        file,
        (data) => {
          App.loadState(data);
          importFile.value = '';
        },
        (err) => {
          console.error(err);
          alert('That file could not be read as a resume — check it is a .json export from Draft.');
          importFile.value = '';
        }
      );
    });
  }
};