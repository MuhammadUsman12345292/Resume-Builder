/* templates.js — available resume templates. Each maps to a CSS class
   (template-<id>) defined in style.css that restyles the .paper preview. */

const TEMPLATES = [
  { id: 'modern',  label: '01 · Modern'  },
  { id: 'classic', label: '02 · Classic' },
  { id: 'minimal', label: '03 · Minimal' }
];

const DEFAULT_TEMPLATE = 'modern';