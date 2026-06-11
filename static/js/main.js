/* ── Main JS – Poster Personalization Tool ─── */

const state = {
  step: 1,
  template: null,
  nameField: { x: 0.1, y: 0.75, font_size: 48, color: '#FFFFFF', bold: true, align: 'left', shadow: true },
  phoneField: { x: 0.1, y: 0.83, font_size: 38, color: '#FFFFFF', bold: false, align: 'left', shadow: true },
  contacts: [],
  nameSet: false,
  phoneSet: false,
  placing: null,
  generated: [],
  templateImgUrl: null,
};

// ── Canvas (lives permanently in panel-2) ──────
let canvas, ctx, img;
let hoverPos = null; // {x, y} in canvas coords while placing

const SAMPLE = { name: 'Amit Sharma', phone: '9876543210' };

function initCanvas() {
  canvas = document.getElementById('poster-canvas');
  ctx = canvas.getContext('2d');
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('mouseleave', () => { hoverPos = null; drawCanvas(); });
}

function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

function onCanvasMouseMove(e) {
  if (!state.placing) return;
  hoverPos = canvasCoords(e);
  drawCanvas();
}

function loadTemplateToCanvas(imgUrl) {
  state.templateImgUrl = imgUrl;
  const preview = document.getElementById('template-preview-img');
  if (preview) { preview.src = imgUrl + '?t=' + Date.now(); preview.style.display = 'block'; }

  img = new Image();
  img.onload = () => {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    drawCanvas();
    updatePositionBadges();
  };
  img.src = imgUrl + '?t=' + Date.now();
}

function drawCanvas() {
  if (!img || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);

  if (state.nameSet)  drawTextBox(state.nameField.x * canvas.width,  state.nameField.y * canvas.height,  SAMPLE.name,  state.nameField,  '#f59e0b', false);
  if (state.phoneSet) drawTextBox(state.phoneField.x * canvas.width, state.phoneField.y * canvas.height, SAMPLE.phone, state.phoneField, '#06b6d4', false);

  // Ghost preview while placing
  if (state.placing && hoverPos) {
    const field  = state.placing === 'name' ? state.nameField  : state.phoneField;
    const color  = state.placing === 'name' ? '#f59e0b' : '#06b6d4';
    const sample = state.placing === 'name' ? SAMPLE.name : SAMPLE.phone;
    drawTextBox(hoverPos.x, hoverPos.y, sample, field, color, true);
  }
}

/**
 * Draw a realistic text-box preview on the canvas.
 * @param {number} x         – anchor x in canvas pixels
 * @param {number} y         – anchor y in canvas pixels (top of text)
 * @param {string} text      – sample text to render
 * @param {object} field     – { font_size, color, bold, align, shadow }
 * @param {string} boxColor  – border / handle accent color (hex)
 * @param {boolean} ghost    – semi-transparent hover ghost
 */
function drawTextBox(x, y, text, field, boxColor, ghost) {
  ctx.save();
  ctx.globalAlpha = ghost ? 0.65 : 1;

  const fontSize = Math.max(field.font_size, 8);
  const fontStr  = `${field.bold ? 'bold ' : ''}${fontSize}px Inter, Arial, sans-serif`;
  ctx.font = fontStr;
  ctx.textBaseline = 'top';

  const metrics    = ctx.measureText(text);
  const textW      = metrics.width;
  const textH      = fontSize * 1.25;
  const pad        = fontSize * 0.25;

  // Align offset
  let tx = x;
  if (field.align === 'center') tx = x - textW / 2;
  if (field.align === 'right')  tx = x - textW;

  const boxX = tx - pad;
  const boxY = y  - pad;
  const boxW = textW + pad * 2;
  const boxH = textH + pad * 2;

  // Frosted background
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 6); ctx.fill();

  // Glowing border
  ctx.strokeStyle = boxColor;
  ctx.lineWidth   = Math.max(2, fontSize * 0.04);
  ctx.setLineDash([]);
  ctx.shadowColor = boxColor;
  ctx.shadowBlur  = ghost ? 12 : 8;
  roundRect(ctx, boxX, boxY, boxW, boxH, 6); ctx.stroke();
  ctx.shadowBlur = 0;

  // Drop shadow on text
  if (field.shadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText(text, tx + fontSize * 0.05, y + fontSize * 0.05);
  }

  // Actual text
  ctx.fillStyle = field.color;
  ctx.fillText(text, tx, y);

  // Drag handle (small circle at anchor)
  ctx.globalAlpha = ghost ? 0.55 : 0.95;
  ctx.fillStyle   = boxColor;
  ctx.shadowColor = boxColor;
  ctx.shadowBlur  = 10;
  ctx.beginPath();
  ctx.arc(x, y + textH / 2, Math.max(6, fontSize * 0.14), 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Label tab above box
  if (!ghost) {
    const label    = field === state.nameField ? '\u270F Name' : '\uD83D\uDCDE Phone';
    const tabFont  = `bold ${Math.max(11, Math.min(18, fontSize * 0.32))}px Inter, sans-serif`;
    ctx.font       = tabFont;
    ctx.textBaseline = 'bottom';
    const lw       = ctx.measureText(label).width;
    const lh       = Math.max(18, fontSize * 0.4);
    ctx.fillStyle  = boxColor;
    ctx.globalAlpha = 0.9;
    roundRect(ctx, boxX, boxY - lh - 2, lw + 16, lh, 4); ctx.fill();
    ctx.fillStyle  = '#fff';
    ctx.globalAlpha = 1;
    ctx.fillText(label, boxX + 8, boxY - 2);
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function onCanvasClick(e) {
  if (!state.placing) return;
  const { x: cx, y: cy } = canvasCoords(e);
  const rx = cx / canvas.width;
  const ry = cy / canvas.height;

  if (state.placing === 'name') {
    state.nameField.x = rx; state.nameField.y = ry;
    state.nameSet = true;
    document.getElementById('name-card').classList.remove('placing');
  } else {
    state.phoneField.x = rx; state.phoneField.y = ry;
    state.phoneSet = true;
    document.getElementById('phone-card').classList.remove('placing');
  }

  hoverPos = null;
  state.placing = null;
  canvas.style.cursor = 'crosshair';
  document.getElementById('placing-hint').classList.remove('show');
  drawCanvas();
  updatePositionBadges();
  syncFieldControls();
}

function updatePositionBadges() {
  const nb = document.getElementById('name-pos');
  const pb = document.getElementById('phone-pos');
  if (state.nameSet) {
    nb.textContent = `X: ${(state.nameField.x * 100).toFixed(1)}%  Y: ${(state.nameField.y * 100).toFixed(1)}%`;
    nb.classList.add('set');
  } else { nb.textContent = 'Click canvas to place'; }

  if (state.phoneSet) {
    pb.textContent = `X: ${(state.phoneField.x * 100).toFixed(1)}%  Y: ${(state.phoneField.y * 100).toFixed(1)}%`;
    pb.classList.add('set');
  } else { pb.textContent = 'Click canvas to place'; }
}

function syncFieldControls() {
  // Sync inputs → state (read from inputs)
  const nf = state.nameField, pf = state.phoneField;
  nf.font_size = parseInt(document.getElementById('name-size').value) || 48;
  nf.color = document.getElementById('name-color').value;
  nf.bold = document.getElementById('name-bold').checked;
  nf.align = document.getElementById('name-align').value;
  nf.shadow = document.getElementById('name-shadow').checked;

  pf.font_size = parseInt(document.getElementById('phone-size').value) || 38;
  pf.color = document.getElementById('phone-color').value;
  pf.bold = document.getElementById('phone-bold').checked;
  pf.align = document.getElementById('phone-align').value;
  pf.shadow = document.getElementById('phone-shadow').checked;

  drawCanvas();
}

// ── Step Navigation ────────────────────────────
function goStep(n) {
  state.step = n;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${n}`).classList.add('active');
  document.querySelectorAll('.step-btn').forEach((b, i) => {
    b.classList.remove('active', 'done');
    if (i + 1 === n) b.classList.add('active');
    else if (i + 1 < n) b.classList.add('done');
  });
}

// ── Upload Template ────────────────────────────
function setupTemplateUpload() {
  const zone = document.getElementById('template-zone');
  const input = document.getElementById('template-input');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); handleTemplateFile(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => handleTemplateFile(input.files[0]));
}

async function handleTemplateFile(file) {
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowed.includes(file.type)) { showAlert('template-alert', 'Only JPG/PNG images allowed.', 'error'); return; }

  const fd = new FormData();
  fd.append('file', file);

  showAlert('template-alert', 'Uploading…', 'info');
  try {
    const res = await fetch('/api/upload-template', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    state.template = data;
    document.getElementById('template-badge').innerHTML = `
      <div class="file-badge">
        <div class="icon">🖼️</div>
        <div class="info">
          <div class="name">${data.filename}</div>
          <div class="meta">${data.width} × ${data.height} px</div>
        </div>
        <span style="color:var(--success);font-size:20px">✓</span>
      </div>`;
    showAlert('template-alert', 'Template uploaded successfully!', 'success');
    loadTemplateToCanvas('/api/template-preview');
    markStepDone(1);
  } catch (e) { showAlert('template-alert', e.message, 'error'); }
}

// ── Field Configuration ────────────────────────
function startPlacing(field) {
  if (!state.template) { showAlert('config-alert', 'Please upload a template first.', 'error'); return; }
  state.placing = field;
  canvas.style.cursor = 'crosshair';
  const hint = document.getElementById('placing-hint');
  hint.textContent = `Click on the poster where you want the ${field === 'name' ? 'Contact Name' : 'Phone Number'} to appear`;
  hint.classList.add('show');
  document.getElementById('name-card').classList.toggle('placing', field === 'name');
  document.getElementById('phone-card').classList.toggle('placing', field === 'phone');
}

async function saveFieldConfig() {
  if (!state.nameSet || !state.phoneSet) {
    showAlert('config-alert', 'Please place both Name and Phone fields on the canvas.', 'error');
    return;
  }
  syncFieldControls();
  try {
    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name_field: state.nameField, phone_field: state.phoneField })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showAlert('config-alert', 'Field positions saved!', 'success');
    markStepDone(2);
    setTimeout(() => goStep(3), 800);
  } catch (e) { showAlert('config-alert', e.message, 'error'); }
}

// ── Upload Contacts ────────────────────────────
function setupContactUpload() {
  const zone = document.getElementById('contact-zone');
  const input = document.getElementById('contact-input');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); handleContactFile(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => handleContactFile(input.files[0]));
}

async function handleContactFile(file) {
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);

  showAlert('contact-alert', 'Parsing contacts…', 'info');
  try {
    const res = await fetch('/api/upload-contacts', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    state.contacts = data.preview;
    document.getElementById('contact-badge').innerHTML = `
      <div class="file-badge">
        <div class="icon">📋</div>
        <div class="info">
          <div class="name">${data.filename}</div>
          <div class="meta">${data.count} contacts loaded</div>
        </div>
        <span style="color:var(--success);font-size:20px">✓</span>
      </div>`;

    // Preview table
    renderContactTable(data.preview, data.count);
    showAlert('contact-alert', `${data.count} contacts loaded successfully!`, 'success');
    markStepDone(3);
  } catch (e) { showAlert('contact-alert', e.message, 'error'); }
}

function renderContactTable(contacts, total) {
  const tbody = document.getElementById('contacts-tbody');
  const section = document.getElementById('contacts-table-section');
  tbody.innerHTML = '';

  contacts.forEach((c, i) => {
    tbody.innerHTML += `<tr><td>${i + 1}</td><td>${escHtml(c.name)}</td><td>${escHtml(c.phone)}</td></tr>`;
  });

  if (total > contacts.length) {
    tbody.innerHTML += `<tr class="more-row"><td colspan="3">… and ${total - contacts.length} more contacts</td></tr>`;
  }
  section.style.display = 'block';
}

// ── Generate Posters ───────────────────────────
async function generatePosters() {
  const btn = document.getElementById('generate-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Generating…';

  document.getElementById('progress-section').style.display = 'block';
  document.getElementById('output-section').style.display = 'none';

  try {
    const res = await fetch('/api/generate', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Poll progress
    await pollProgress();
    await loadOutputGrid();
    document.getElementById('output-section').style.display = 'block';
    showAlert('generate-alert', `✅ ${data.generated} posters generated successfully!`, 'success');
    markStepDone(4);
  } catch (e) {
    showAlert('generate-alert', e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '⚡ Generate Posters';
  }
}

async function pollProgress() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/progress');
        const d = await res.json();
        const pct = d.total ? Math.round((d.current / d.total) * 100) : 0;
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-text').textContent = `${d.current} / ${d.total} posters`;

        if (!d.running || d.done || d.error) {
          clearInterval(interval);
          resolve();
        }
      } catch { clearInterval(interval); resolve(); }
    }, 300);
  });
}

async function loadOutputGrid() {
  const res = await fetch('/api/output-list');
  const data = await res.json();
  state.generated = data.files;

  const grid = document.getElementById('output-grid');
  grid.innerHTML = '';

  data.files.forEach(f => {
    const card = document.createElement('div');
    card.className = 'poster-thumb';
    card.innerHTML = `
      <img src="/api/preview/${encodeURIComponent(f.filename)}?t=${Date.now()}" alt="${escHtml(f.filename)}" loading="lazy">
      <div class="thumb-overlay">
        <div class="thumb-name">${escHtml(f.filename.replace('.jpg', ''))}</div>
        <div class="thumb-dl">Click to download</div>
      </div>`;
    card.addEventListener('click', () => downloadFile(f.filename));
    grid.appendChild(card);
  });

  // Stats
  document.getElementById('stat-total').textContent = data.count;
}

function downloadFile(filename) {
  window.location.href = `/api/download/${encodeURIComponent(filename)}`;
}

function downloadAll() {
  window.location.href = '/api/download-all';
}

// ── Helpers ────────────────────────────────────
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'flex';
  if (type === 'success') setTimeout(() => { if (el.textContent === msg) el.style.display = 'none'; }, 4000);
}

function markStepDone(n) {
  const btn = document.querySelector(`.step-btn[data-step="${n}"]`);
  if (btn) { btn.classList.remove('active'); btn.classList.add('done'); }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  setupTemplateUpload();
  setupContactUpload();

  // Field control inputs live-update canvas
  ['name-size','name-color','name-bold','name-align','name-shadow',
   'phone-size','phone-color','phone-bold','phone-align','phone-shadow']
    .forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', syncFieldControls); });

  // Step buttons
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => goStep(parseInt(btn.dataset.step)));
  });

  goStep(1);
});
