let currentMode = 'enc';
let inputFormat = 'hex';
let latestData = null;

const FORMAT_CONFIG = {
  hex: {
    max: 16,
    pattern: /^[0-9A-F]{16}$/,
    allowed: /[^0-9A-F]/g,
    labelText: 'Plaintext / Ciphertext Hex',
    labelKey: 'Key Hex 64-bit',
    hint: 'Masukkan 16 karakter heksadesimal: 0-9 dan A-F.',
    textPlaceholder: '0123456789ABCDEF',
    keyPlaceholder: '133457799BBCDFF1',
    sampleText: '0123456789ABCDEF',
    sampleKey: '133457799BBCDFF1'
  },
  bin: {
    max: 64,
    pattern: /^[01]{64}$/,
    allowed: /[^01]/g,
    labelText: 'Plaintext / Ciphertext Biner',
    labelKey: 'Key Biner 64-bit',
    hint: 'Masukkan tepat 64 karakter bit: 0 atau 1.',
    textPlaceholder: '0000000100100011010001010110011110001001101010111100110111101111',
    keyPlaceholder: '0001001100110100010101110111100110011011101111001101111111110001',
    sampleText: '0000000100100011010001010110011110001001101010111100110111101111',
    sampleKey: '0001001100110100010101110111100110011011101111001101111111110001'
  }
};

function setMode(mode){
  currentMode = mode;
  document.getElementById('encBtn').classList.toggle('active', mode === 'enc');
  document.getElementById('decBtn').classList.toggle('active', mode === 'dec');
}

function setInputFormat(format){
  inputFormat = format;
  const cfg = FORMAT_CONFIG[inputFormat];

  document.getElementById('hexFormatBtn').classList.toggle('active', format === 'hex');
  document.getElementById('binFormatBtn').classList.toggle('active', format === 'bin');

  const textInput = document.getElementById('textInput');
  const keyInput = document.getElementById('keyInput');
  textInput.maxLength = cfg.max;
  keyInput.maxLength = cfg.max;
  textInput.placeholder = cfg.textPlaceholder;
  keyInput.placeholder = cfg.keyPlaceholder;
  document.getElementById('textLabel').textContent = cfg.labelText;
  document.getElementById('keyLabel').textContent = cfg.labelKey;
  document.getElementById('textHint').textContent = cfg.hint;
  document.getElementById('keyHint').textContent = cfg.hint;

  textInput.value = cfg.sampleText;
  keyInput.value = cfg.sampleKey;
  document.getElementById('resultCard').classList.add('hidden');
  updateValidation();
}

function cleanInputValue(value){
  const cfg = FORMAT_CONFIG[inputFormat];
  return value.toUpperCase().replace(/\s+/g, '').replace(cfg.allowed, '').slice(0, cfg.max);
}

function updateValidation(){
  const cfg = FORMAT_CONFIG[inputFormat];
  updateOneValidation('textInput', 'textCounter', 'textValidation', cfg);
  updateOneValidation('keyInput', 'keyCounter', 'keyValidation', cfg);
  const valid = validateSilent();
  document.getElementById('processBtn').disabled = !valid;
}

function updateOneValidation(inputId, counterId, validationId, cfg){
  const input = document.getElementById(inputId);
  input.value = cleanInputValue(input.value);
  const len = input.value.length;
  const valid = cfg.pattern.test(input.value);
  const counter = document.getElementById(counterId);
  const validation = document.getElementById(validationId);

  counter.textContent = `${len}/${cfg.max}`;
  counter.classList.toggle('ok', valid);
  counter.classList.toggle('bad', !valid);
  input.classList.toggle('valid', valid);
  input.classList.toggle('invalid', !valid);
  validation.classList.toggle('ok', valid);
  validation.classList.toggle('bad', !valid);
  validation.textContent = valid ? 'Valid, siap diproses' : `Belum valid, harus ${cfg.max} karakter`;
}

function validateSilent(){
  const cfg = FORMAT_CONFIG[inputFormat];
  return cfg.pattern.test(document.getElementById('textInput').value.trim()) &&
         cfg.pattern.test(document.getElementById('keyInput').value.trim());
}

function validateBeforeRun(){
  updateValidation();
  if(!validateSilent()){
    alert(inputFormat === 'hex'
      ? 'Input belum valid. Plaintext/Ciphertext dan key harus 16 karakter hex (0-9, A-F).'
      : 'Input belum valid. Plaintext/Ciphertext dan key harus 64 karakter biner (0 atau 1).');
    return false;
  }
  return true;
}

async function processDES(){
  if(!validateBeforeRun()) return;
  const text = document.getElementById('textInput').value.trim();
  const key = document.getElementById('keyInput').value.trim();
  try{
    const res = await fetch('/api/des', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({text, key, mode: currentMode})
    });
    const json = await res.json();
    if(!json.success){ alert(json.message); return; }
    latestData = json.data;
    renderResult(json.data);
  }catch(err){
    alert('Gagal memproses DES. Pastikan server Flask berjalan.');
    console.error(err);
  }
}

function resetForm(){
  const cfg = FORMAT_CONFIG[inputFormat];
  document.getElementById('textInput').value = cfg.sampleText;
  document.getElementById('keyInput').value = cfg.sampleKey;
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('solution').classList.add('hidden');
  updateValidation();
}

function toggleSolution(){
  const sol = document.getElementById('solution');
  const open = !sol.classList.contains('hidden');
  sol.classList.toggle('hidden', open);
  document.getElementById('toggleText').textContent = open ? 'Tampilkan Solusi Penyelesaian' : 'Sembunyikan Solusi Penyelesaian';
  document.getElementById('arrow').style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}

function renderResult(data){
  const label = currentMode === 'enc' ? 'Ciphertext (Hasil Enkripsi)' : 'Plaintext (Hasil Dekripsi)';
  document.getElementById('resultCard').classList.remove('hidden');
  document.getElementById('resultTitle').textContent = label;
  document.getElementById('resultHex').textContent = data.result_hex;
  document.getElementById('resultBin').textContent = data.result_bin;
  document.getElementById('solution').innerHTML = buildSolution(data);
  document.getElementById('solution').classList.add('hidden');
  document.getElementById('resultCard').scrollIntoView({behavior:'smooth'});
}

function buildSolution(d){
  return `
    ${section(1,'Data Input', inputSection(d))}
    ${section(2,'Key Schedule — PC-1, C0/D0, LS, PC-2', keyScheduleSection(d))}
    ${section(3,'Initial Permutation (IP)', ipSection(d))}
    ${section(4,'Ringkasan 16 Round Feistel', roundSummarySection(d))}
    ${roundsSection(d)}
    ${section(5,'Final Swap dan IP⁻¹', finalSection(d))}
  `;
}

function section(n,title,body){return `<div class="sec"><div class="title"><span class="num">${n}</span>${title}</div>${body}</div>`}
function pill(text){return `<div class="pill">${text}</div>`}
function info(label,value, extraClass=''){return `<div class="info ${extraClass}"><span>${label}</span><b>${value}</b></div>`}

function inputSection(d){
  return `
    <div class="data-grid">
      ${info('Input Hex', d.input_hex)}
      ${info('Key Hex', d.key_hex)}
      ${info('Input Biner', d.input_bin, 'span-2 wrap-code')}
      ${info('Key Biner', d.key_bin, 'span-2 wrap-code')}
    </div>`;
}

function keyScheduleSection(d){
  const ks = d.key_schedule;
  const rows = ks.rounds.map(r => `<tr><td>${r.round}</td><td>${r.shift}</td><td class="mono blue breakable">${r.c}</td><td class="mono green breakable">${r.d}</td><td class="mono amber">${r.key_hex}</td></tr>`).join('');
  return `
    ${pill('PC-1 menghasilkan 56-bit, lalu dibagi menjadi C0 dan D0 masing-masing 28-bit')}
    <div class="data-grid">
      ${info('PC-1 Hex', ks.pc1_hex)}
      ${info('C0 Hex', ks.c0_hex)}
      ${info('D0 Hex', ks.d0_hex)}
      ${info('C0 Biner', ks.c0, 'wrap-code')}
      ${info('D0 Biner', ks.d0, 'wrap-code')}
    </div>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>Round</th><th>LS</th><th>Cn</th><th>Dn</th><th>Kn Hex</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

function ipSection(d){
  return `
    ${pill('IP mengacak plaintext/ciphertext 64-bit sebelum masuk ke 16 round')}
    <div class="data-grid">
      ${info('IP Hex', d.ip_hex)}
      ${info('L0 Hex', d.l0_hex)}
      ${info('R0 Hex', d.r0_hex)}
      ${info('IP Biner', d.ip_bin, 'span-2 wrap-code')}
    </div>`;
}

function roundSummarySection(d){
  const rows = d.rounds.map(r => `<tr>
    <td>${r.round}</td>
    <td class="mono">${r.l_before_hex}</td>
    <td class="mono">${r.r_before_hex}</td>
    <td class="mono amber">${r.subkey_hex}</td>
    <td class="mono green">${r.p_output_hex}</td>
    <td class="mono blue">${r.l_after_hex}</td>
    <td class="mono blue">${r.r_after_hex}</td>
  </tr>`).join('');
  return `
    ${pill('Tabel ringkas ini memudahkan pengecekan semua round tanpa membuka detail satu per satu')}
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>Round</th><th>L sebelum</th><th>R sebelum</th><th>Subkey</th><th>F/P</th><th>L hasil</th><th>R hasil</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

function roundsSection(d){
  return d.rounds.map(r => roundCard(r)).join('');
}

function roundCard(r){
  return `<details class="round-card" ${r.round === 1 ? 'open' : ''}>
    <summary>
      <span><b class="num">${r.round}</b> Round ${r.round}</span>
      <span class="summary-right">K${r.round}: ${r.subkey_hex} • L${r.round}: ${r.l_after_hex} • R${r.round}: ${r.r_after_hex}</span>
    </summary>
    <div class="round-body">
      <div class="data-grid">
        ${info('L sebelum Hex', r.l_before_hex)}
        ${info('R sebelum Hex', r.r_before_hex)}
        ${info('Subkey K Hex', r.subkey_hex)}
        ${info('E(R) Hex', r.expanded_hex)}
        ${info('E(R) XOR K Hex', r.xor_hex)}
        ${info('S-Box Output Hex', r.sbox_output_hex)}
        ${info('P Output / F Hex', r.p_output_hex)}
        ${info('R hasil Hex', r.r_after_hex)}
      </div>
      <div class="sbox-grid">${r.sbox_details.map(s => sboxMini(s)).join('')}</div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>Step</th><th>Nilai Biner</th><th>Nilai Hex</th></tr></thead><tbody>
        <tr><td>L sebelum</td><td class="mono breakable">${r.l_before_bin}</td><td>${r.l_before_hex}</td></tr>
        <tr><td>R sebelum</td><td class="mono breakable">${r.r_before_bin}</td><td>${r.r_before_hex}</td></tr>
        <tr><td>E(R)</td><td class="mono breakable">${r.expanded_bin}</td><td>${r.expanded_hex}</td></tr>
        <tr><td>XOR Subkey</td><td class="mono breakable">${r.xor_bin}</td><td>${r.xor_hex}</td></tr>
        <tr><td>S-Box</td><td class="mono breakable">${r.sbox_output_bin}</td><td>${r.sbox_output_hex}</td></tr>
        <tr><td>P</td><td class="mono breakable">${r.p_output_bin}</td><td>${r.p_output_hex}</td></tr>
        <tr><td>L setelah</td><td class="mono breakable">${r.l_after_bin}</td><td>${r.l_after_hex}</td></tr>
        <tr><td>R setelah</td><td class="mono breakable">${r.r_after_bin}</td><td>${r.r_after_hex}</td></tr>
      </tbody></table></div>
    </div>
  </details>`;
}

function sboxMini(s){
  return `<div class="sbox-card"><h4>${s.sbox}</h4><p>Input: <b class="mono blue">${s.input}</b><br>Row: ${s.row_bits} = ${s.row}<br>Col: ${s.col_bits} = ${s.col}<br>Value: ${s.value}<br>Output: <b class="mono green">${s.output}</b></p></div>`;
}

function finalSection(d){
  const label = currentMode === 'enc' ? 'Ciphertext' : 'Plaintext';
  return `
    ${pill('Setelah round 16, DES melakukan final swap R16 + L16, lalu IP⁻¹')}
    <div class="data-grid">
      ${info('Preoutput Hex', d.preoutput_hex)}
      ${info('IP⁻¹ Hex', d.ip_inv_hex)}
      ${info('Preoutput Biner', d.preoutput_bin, 'span-2 wrap-code')}
      ${info('IP⁻¹ Biner', d.ip_inv_bin, 'span-2 wrap-code')}
    </div>
    <div class="final">
      <div class="final-row"><span>${label} Hex</span><b>${d.result_hex}</b></div>
      <div class="final-row"><span>${label} Biner</span><b>${d.result_bin}</b></div>
    </div>`;
}

['textInput','keyInput'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateValidation);
});

document.addEventListener('DOMContentLoaded', updateValidation);
document.addEventListener('keydown', e => { if(e.key === 'Enter') processDES(); });
