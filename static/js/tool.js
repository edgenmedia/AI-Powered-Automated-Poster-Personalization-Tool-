// ── State ──────────────────────────────────────────────
let templateImg = null;
let contacts = [];
let generatedBlobs = [];
let nameBox = null, phoneBox = null;
let activeDrag = null, activeResize = null;

const boxStyles = {
  name:  { font:"'Poppins',sans-serif", size:32, weight:'700', color:'#ffffff', shadow:'dark' },
  phone: { font:"'Poppins',sans-serif", size:26, weight:'600', color:'#ffffff', shadow:'dark' }
};

// ── Template upload ─────────────────────────────────────
document.getElementById('imgFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      templateImg = img;
      document.getElementById('posterImg').src = ev.target.result;
      document.getElementById('imgBadge').innerHTML =
        `<div class="fbadge">✓ ${esc(f.name)} <span style="color:var(--t3);font-weight:400">(${img.width}×${img.height})</span></div>`;
      document.getElementById('imgBadge').style.display = '';
      document.getElementById('styleCard').style.display = '';
      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('posterSec').style.display = '';
      document.getElementById('sn1').classList.add('done');
      document.getElementById('sn2').classList.add('done');
      setTimeout(initBoxes, 80);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
});

// ── CSV / Excel upload via server ───────────────────────
document.getElementById('csvFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const fd = new FormData(); fd.append('file', f);
  fetch('/api/upload-contacts', { method:'POST', body:fd })
    .then(r => r.json()).then(d => {
      if (d.error) { alert(d.error); return; }
      contacts = d.preview;
      fetch('/api/contacts').then(r=>r.json()).then(full => {
        contacts = full.contacts || d.preview;
        renderTable(); checkReady();
      });
    });
});

// ── Init text boxes ─────────────────────────────────────
function initBoxes() {
  const wrap = document.getElementById('pwrap');
  if (nameBox)  nameBox.remove();
  if (phoneBox) phoneBox.remove();
  const w = wrap.offsetWidth, h = wrap.offsetHeight;
  nameBox  = mkBox('name',  'Name',  Math.round(w*.05), Math.round(h*.78));
  phoneBox = mkBox('phone', 'Phone', Math.round(w*.05), Math.round(h*.87));
  wrap.appendChild(nameBox);
  wrap.appendChild(phoneBox);
  applyBoxStyle('name');
  applyBoxStyle('phone');
  loadStyleUI('name');
}

function mkBox(key, label, left, top) {
  const el = document.createElement('div');
  el.className = 'tbox sel'; el.dataset.key = key;
  el.style.cssText = `left:${left}px;top:${top}px;position:absolute`;
  const lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.textContent = label + ' field';
  const inner = document.createElement('div'); inner.className = 'tbox-inner';
  inner.textContent = key === 'name' ? 'Sample Name' : '9876543210';
  const rh = document.createElement('div'); rh.className = 'rh';
  el.append(lbl, inner, rh);
  el.addEventListener('mousedown',  e => { if (!e.target.classList.contains('rh')) startDrag(e, el, key); });
  el.addEventListener('touchstart', e => { e.preventDefault(); if (!e.target.classList.contains('rh')) startDrag(e.touches[0], el, key); }, {passive:false});
  rh.addEventListener('mousedown',  e => { e.stopPropagation(); startResize(e, el, key); });
  rh.addEventListener('touchstart', e => { e.stopPropagation(); e.preventDefault(); startResize(e.touches[0], el, key); }, {passive:false});
  el.addEventListener('click', e => { e.stopPropagation(); selectBox(key); });
  return el;
}

function resetBoxes() {
  if (!nameBox || !phoneBox) return;
  const wrap = document.getElementById('pwrap');
  const w = wrap.offsetWidth, h = wrap.offsetHeight;
  nameBox.style.left = Math.round(w*.05)+'px';  nameBox.style.top = Math.round(h*.78)+'px';
  phoneBox.style.left = Math.round(w*.05)+'px'; phoneBox.style.top = Math.round(h*.87)+'px';
}

// ── Select ──────────────────────────────────────────────
function selectBox(key) {
  [nameBox, phoneBox].forEach(b => b && b.classList.remove('sel'));
  (key==='name'?nameBox:phoneBox).classList.add('sel');
  document.getElementById('activeBox').value = key;
  loadStyleUI(key);
}

document.getElementById('posterSec').addEventListener('click', e => {
  if (e.target===document.getElementById('pwrap')||e.target===document.getElementById('posterImg'))
    [nameBox,phoneBox].forEach(b=>b&&b.classList.remove('sel'));
});

// ── Drag ────────────────────────────────────────────────
function startDrag(e, el, key) {
  selectBox(key);
  activeDrag = { el, startX:e.clientX, startY:e.clientY, oL:parseInt(el.style.left)||0, oT:parseInt(el.style.top)||0 };
  document.body.style.userSelect='none';
}

window.addEventListener('mousemove', onMove);
window.addEventListener('touchmove', e => { if (activeDrag||activeResize){ e.preventDefault(); onMove(e.touches[0]); }}, {passive:false});
window.addEventListener('mouseup',  onEnd);
window.addEventListener('touchend', onEnd);

function onMove(e) {
  if (activeDrag) {
    const { el, startX, startY, oL, oT } = activeDrag;
    const wrap = document.getElementById('pwrap');
    let nl = oL + (e.clientX-startX), nt = oT + (e.clientY-startY);
    nl = Math.max(0, Math.min(wrap.offsetWidth-el.offsetWidth, nl));
    nt = Math.max(0, Math.min(wrap.offsetHeight-el.offsetHeight, nt));
    el.style.left = nl+'px'; el.style.top = nt+'px';
  }
  if (activeResize) {
    const { el, key, startX, oSz } = activeResize;
    const ns = Math.max(8, Math.min(300, oSz + Math.round((e.clientX-startX)/3)));
    boxStyles[key].size = ns;
    applyBoxStyle(key);
    document.getElementById('cSize').value = ns;
  }
}
function onEnd() { activeDrag=null; activeResize=null; document.body.style.userSelect=''; }

// ── Resize ──────────────────────────────────────────────
function startResize(e, el, key) {
  selectBox(key);
  activeResize = { el, key, startX:e.clientX, oSz:boxStyles[key].size };
}

// ── Style ───────────────────────────────────────────────
function switchBox() {
  const key = document.getElementById('activeBox').value;
  selectBox(key); loadStyleUI(key);
}

function loadStyleUI(key) {
  const s = boxStyles[key];
  document.getElementById('cFont').value   = s.font;
  document.getElementById('cSize').value   = s.size;
  document.getElementById('cWeight').value = s.weight;
  document.getElementById('cColor').value  = s.color;
  document.getElementById('cShadow').value = s.shadow;
}

function applyStyle() {
  const key = document.getElementById('activeBox').value;
  boxStyles[key] = {
    font:   document.getElementById('cFont').value,
    size:   parseInt(document.getElementById('cSize').value)||32,
    weight: document.getElementById('cWeight').value,
    color:  document.getElementById('cColor').value,
    shadow: document.getElementById('cShadow').value
  };
  applyBoxStyle(key);
}

function applyBoxStyle(key) {
  const s = boxStyles[key];
  const el = key==='name' ? nameBox : phoneBox; if (!el) return;
  const inner = el.querySelector('.tbox-inner');
  inner.style.fontFamily = s.font;
  inner.style.fontSize   = s.size+'px';
  inner.style.fontWeight = s.weight;
  inner.style.color      = s.color;
  inner.style.textShadow = s.shadow==='dark'  ? '1px 1px 4px rgba(0,0,0,.75),0 0 8px rgba(0,0,0,.4)'
                         : s.shadow==='light' ? '1px 1px 4px rgba(255,255,255,.85)'
                         : 'none';
}

// ── Contacts ────────────────────────────────────────────
function loadSample() {
  contacts = [
    {name:'Amit Sharma', phone:'9876543210'},
    {name:'Priya Verma',  phone:'9123456789'},
    {name:'Rahul Gupta',  phone:'9988776655'},
    {name:'Sneha Patel',  phone:'9871234567'},
    {name:'Vikram Singh', phone:'9765432109'},
  ];
  renderTable(); checkReady();
}

function addRow()     { contacts.push({name:'',phone:''}); renderTable(); }
function removeRow(i) { contacts.splice(i,1); renderTable(); checkReady(); }

function renderTable() {
  document.getElementById('tbody').innerHTML = contacts.map((c,i)=>`
    <tr>
      <td style="color:var(--t3);font-size:10px">${i+1}</td>
      <td><input value="${esc(c.name)}"  oninput="contacts[${i}].name=this.value;checkReady()"  placeholder="Full name"></td>
      <td><input value="${esc(c.phone)}" oninput="contacts[${i}].phone=this.value" placeholder="Phone"></td>
      <td><button onclick="removeRow(${i})" style="background:none;border:none;cursor:pointer;color:var(--t3);font-size:15px;line-height:1">×</button></td>
    </tr>`).join('');
  document.getElementById('cCount').textContent = contacts.length;
  document.getElementById('sn3').classList.toggle('done', contacts.length>0);
}

function checkReady() {
  const ok = templateImg && contacts.some(c=>c.name);
  document.getElementById('genBtn').disabled = !ok;
  if (ok) document.getElementById('sn4').classList.add('done');
}

// ── Draw poster on canvas ───────────────────────────────
function drawPoster(canvas, contact) {
  const pImg = document.getElementById('posterImg');
  const scaleX = templateImg.naturalWidth  / pImg.offsetWidth;
  const scaleY = templateImg.naturalHeight / pImg.offsetHeight;

  canvas.width  = templateImg.naturalWidth;
  canvas.height = templateImg.naturalHeight;
  const ctx = canvas.getContext('2d');

  // Draw template
  ctx.drawImage(templateImg, 0, 0);

  const drawField = (key, text) => {
    const s   = boxStyles[key];
    const el  = key==='name' ? nameBox : phoneBox;
    const lft = parseInt(el.style.left)||0;
    const top = parseInt(el.style.top)||0;
    const scaledSize = Math.round(s.size * scaleX);

    ctx.font      = `${s.weight} ${scaledSize}px ${s.font}`;
    ctx.fillStyle = s.color;
    ctx.textBaseline = 'top';

    if (s.shadow==='dark') {
      ctx.shadowColor='rgba(0,0,0,.75)'; ctx.shadowBlur=Math.round(scaledSize*.15);
      ctx.shadowOffsetX=Math.round(scaledSize*.03); ctx.shadowOffsetY=Math.round(scaledSize*.03);
    } else if (s.shadow==='light') {
      ctx.shadowColor='rgba(255,255,255,.85)'; ctx.shadowBlur=Math.round(scaledSize*.15);
      ctx.shadowOffsetX=Math.round(scaledSize*.03); ctx.shadowOffsetY=Math.round(scaledSize*.03);
    }

    ctx.fillText(text, lft*scaleX, top*scaleY);
    ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
  };

  drawField('name',  contact.name  || '');
  drawField('phone', contact.phone || '');
}

// ── Generate ────────────────────────────────────────────
async function generateAll() {
  generatedBlobs = [];
  const valid = contacts.filter(c=>c.name);
  if (!valid.length) return;

  [nameBox,phoneBox].forEach(b=>b&&b.classList.remove('sel'));

  const grid = document.getElementById('outGrid');
  grid.innerHTML = ''; grid.style.display = 'grid';
  document.getElementById('progWrap').style.display = '';
  document.getElementById('zipBtn').style.display = 'none';
  document.getElementById('genBtn').disabled = true;

  const canvas = document.getElementById('exportCanvas');
  const images = [];

  for (let i=0; i<valid.length; i++) {
    const c = valid[i];
    await new Promise(r=>setTimeout(r,10));
    drawPoster(canvas, c);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const safe    = c.name.replace(/[^a-z0-9]/gi,'_');
    const fname   = safe+'.jpg';
    images.push({ name:fname, data_url:dataUrl });

    const blob = await new Promise(r=>canvas.toBlob(r,'image/jpeg',.95));
    const url  = URL.createObjectURL(blob);
    generatedBlobs.push({ blob, name:fname });

    const thumb = document.createElement('div');
    thumb.className = 'out-thumb';
    thumb.dataset.index = i;
    thumb.innerHTML = `<img src="${url}" alt="${esc(c.name)}" loading="lazy"><span>${esc(c.name)}</span>`;
    thumb.addEventListener('click', () => openPreview(i));
    grid.appendChild(thumb);

    const pct = Math.round((i+1)/valid.length*100);
    document.getElementById('progFill').style.width = pct+'%';
    document.getElementById('progTxt').textContent  = `${i+1} / ${valid.length} posters`;
  }

  // Save to server (for ZIP)
  fetch('/api/save-generated', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ images })
  }).catch(()=>{});

  document.getElementById('progTxt').textContent = `✓ ${valid.length} posters ready — click any to preview`;
  document.getElementById('zipBtn').style.display = '';
  document.getElementById('genBtn').disabled = false;
  document.getElementById('sn4').classList.add('done');
}

// ── ZIP download ────────────────────────────────────────
function downloadZip() { window.location.href = '/api/download-all'; }

// ── Helpers ─────────────────────────────────────────────
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

// ── Preview Overlay (Drive-style) ───────────────────────
let previewIndex = -1;

function openPreview(index) {
  if (!generatedBlobs.length) return;
  previewIndex = index;
  const overlay = document.getElementById('previewOverlay');
  showPreviewAt(index);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  document.getElementById('previewOverlay').classList.remove('open');
  document.body.style.overflow = '';
  previewIndex = -1;
}

function showPreviewAt(index) {
  const item = generatedBlobs[index];
  if (!item) return;
  const imgEl = document.getElementById('previewImg');
  imgEl.src = URL.createObjectURL(item.blob);
  document.getElementById('previewFilename').textContent = item.name.replace('.jpg', '');
  document.getElementById('previewCounter').textContent = `${index + 1} of ${generatedBlobs.length}`;

  // Navigation state
  document.getElementById('previewPrev').disabled = (index === 0);
  document.getElementById('previewNext').disabled = (index === generatedBlobs.length - 1);

  // Re-trigger entrance animation
  const wrap = document.getElementById('previewImgWrap');
  wrap.style.animation = 'none';
  wrap.offsetHeight; // force reflow
  wrap.style.animation = '';
}

function previewNavigate(dir) {
  const next = previewIndex + dir;
  if (next < 0 || next >= generatedBlobs.length) return;
  previewIndex = next;
  showPreviewAt(previewIndex);
}

function previewDownloadCurrent() {
  if (previewIndex < 0 || !generatedBlobs[previewIndex]) return;
  const item = generatedBlobs[previewIndex];
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement('a');
  a.href = url; a.download = item.name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Wire up preview controls
document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewPrev').addEventListener('click', () => previewNavigate(-1));
document.getElementById('previewNext').addEventListener('click', () => previewNavigate(1));
document.getElementById('previewDownload').addEventListener('click', previewDownloadCurrent);

// Close on backdrop click
document.getElementById('previewBody').addEventListener('click', e => {
  if (e.target === document.getElementById('previewBody')) closePreview();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  const overlay = document.getElementById('previewOverlay');
  if (!overlay.classList.contains('open')) return;
  switch (e.key) {
    case 'Escape':      closePreview(); break;
    case 'ArrowLeft':   previewNavigate(-1); break;
    case 'ArrowRight':  previewNavigate(1); break;
    case 'd': case 'D': previewDownloadCurrent(); break;
  }
});

// Init
renderTable();
