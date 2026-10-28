(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P = {
 cal:'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4', doc:'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6',
 box:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10', tent:'M3 20L12 4l9 16zM12 20v-7',
 flag:'M5 21V4M5 4h11l-2 4 2 4H5', safe:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
 users:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 100-6M18 15c2 .5 3 2.5 3 5',
 chart:'M4 20V4M4 20h16M8 16v-5M13 16V8M18 16v-3', mail:'M3 6h18v12H3zM3 7l9 7 9-7',
 home:'M4 11l8-7 8 7v9H4zM10 20v-6h4v6', plan:'M9 4h6v3H9zM6 6h12v15H6zM9 12h6M9 16h4',
 map:'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z', check:'M5 12l5 5 9-10'
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.doc}"/></svg>`;
const toast = (() => { const t = $('#toast'); let h; return m => { t.textContent = m; t.classList.add('show'); clearTimeout(h); h = setTimeout(() => t.classList.remove('show'), 3200); }; })();
const load = async f => { try { const r = await fetch('data/' + f); if (!r.ok) throw 0; return await r.json(); } catch { return { _err: true }; } };
const fail = (el, what) => { el.innerHTML = `<p class="empty">Data ${what} gagal dimuat. Buka situs melalui server (Vercel, GitHub Pages, atau <code>python -m http.server</code>), bukan langsung dari file.</p>`; };

// Navigasi
const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Tutup menu' : 'Buka menu'); };
burger.onclick = () => setMenu(!menu.classList.contains('open'));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeLb(); closeSheet(); } });
const top = $('#top');
addEventListener('scroll', () => { nav.classList.toggle('scrolled', scrollY > 10); top.hidden = scrollY < 600; }, { passive: true });
top.onclick = () => scrollTo({ top: 0 });
$('#yr').textContent = new Date().getFullYear();
document.querySelectorAll('.bar a').forEach(a => a.insertAdjacentHTML('afterbegin', icon(a.dataset.i)));

// Fungsi utama & alur
const fungsi = [['users','Pembinaan Anggota dan Pembina','Membina anggota, pembina, dan pelatih agar kompeten dan berakhlak.'],['map','Koordinasi Kwartir Cabang dan Qabilah','Menghubungkan dan mendampingi satuan organisasi di seluruh wilayah.'],['tent','Penyelenggaraan Kegiatan Kepanduan','Merencanakan dan melaksanakan kegiatan kepanduan secara aman dan tertib.'],['doc','Administrasi dan Kelembagaan','Menjaga tertib administrasi, data, dan ketentuan organisasi.']];
$('#fungsi').innerHTML = fungsi.map(f => `<article class="card"><div class="ic">${icon(f[0])}</div><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('');
const alur = [['Pemetaan Kebutuhan','Mengidentifikasi kebutuhan kegiatan dan kondisi lapangan.'],['Perencanaan dan Koordinasi','Menyusun rencana dan berkoordinasi dengan Kwartir Cabang.'],['Persiapan Teknis dan Logistik','Menyiapkan perlengkapan, lokasi, dan panitia.'],['Pelaksanaan dan Pengawasan','Menjalankan kegiatan dengan pengawasan keselamatan.'],['Evaluasi dan Pelaporan','Mengevaluasi hasil dan menyusun laporan.']];
$('#flow').innerHTML = alur.map((a, i) => `<li data-n="${i + 1}"><h3>${a[0]}</h3><p>${a[1]}</p></li>`).join('');

// Panel detail
const sh = $('#sheet'); let shF;
function closeSheet() { if (!sh.hidden) { sh.hidden = true; document.body.style.overflow = ''; shF && shF.focus(); } }
$('#shX').onclick = closeSheet; sh.onclick = e => { if (e.target === sh) closeSheet(); };

// Pengumuman
(async () => {
  const el = $('#newsList'), d = await load('news.json');
  if (d._err) return fail(el, 'pengumuman');
  const l = [...d].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 6);
  el.innerHTML = l.map(n => `<article class="card"><span class="badge">${esc(n.kategori || 'Pengumuman')}</span><h3>${esc(n.judul)}</h3><p>${esc(new Date(n.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' }))}<br>${esc(n.ringkasan)}</p>${n.url ? `<a class="btn sm" href="${esc(n.url)}" target="_blank" rel="noopener">Baca selengkapnya</a>` : ''}</article>`).join('') || '<p class="empty">Belum ada pengumuman resmi. Pengumuman akan dipublikasikan di sini.</p>';
})();

// Program + filter
(async () => {
  const el = $('#programList'), d = await load('programs.json');
  if (d._err) return fail(el, 'program');
  const cats = ['Semua Program', ...new Set(d.map(p => p.kategori))];
  let cur = cats[0]; const f = $('#fProgram');
  const draw = () => {
    f.innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === cur}">${esc(c)}</button>`).join('');
    const list = d.filter(p => cur === cats[0] || p.kategori === cur);
    el.innerHTML = list.map(p => `<article class="card"><div class="ic">${icon(p.icon)}</div><h3>${esc(p.nama)}</h3><p>${esc(p.deskripsi)}</p><span class="badge ${/selesai|berjalan/i.test(p.status) ? 'ok' : ''}">${esc(p.status)}</span><button class="btn sm" data-i="${d.indexOf(p)}">Lihat Detail</button></article>`).join('') || '<p class="empty">Belum ada program pada kategori ini.</p>';
  };
  f.onclick = e => { const b = e.target.closest('.chip'); if (b) { cur = b.textContent; draw(); } };
  el.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const p = d[b.dataset.i]; shF = b;
    const row = (k, v) => `<dt>${k}</dt><dd>${v ? esc(v) : 'Belum tersedia'}</dd>`;
    $('#shT').textContent = p.nama;
    $('#shB').innerHTML = `<span class="badge">${esc(p.status)}</span><p>${esc(p.deskripsi)}</p><dl>${row('Tujuan', p.tujuan)}${row('Sasaran', p.sasaran)}${row('Jadwal', p.jadwal)}${row('Penanggung jawab', p.penanggung_jawab)}</dl>`;
    sh.hidden = false; document.body.style.overflow = 'hidden'; $('#shX').focus(); };
  draw();
})();

// Agenda + filter
(async () => {
  const el = $('#eventList'), d = await load('events.json');
  if (d._err) return fail(el, 'agenda');
  const bln = $('#fBulan'), kat = $('#fKat');
  const nm = s => new Date(s).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  [...new Set(d.map(e => e.tanggal.slice(0, 7)))].sort().forEach(m => bln.add(new Option(nm(m + '-01'), m)));
  [...new Set(d.map(e => e.kategori))].forEach(k => kat.add(new Option(k, k)));
  const draw = () => {
    const l = d.filter(e => (!bln.value || e.tanggal.startsWith(bln.value)) && (!kat.value || e.kategori === kat.value));
    el.innerHTML = l.map(e => `<article class="card"><span class="badge">${esc(e.kategori)} &middot; ${esc(e.tingkat)}</span><h3>${esc(e.nama)}</h3><p>${esc(new Date(e.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' }))}${e.waktu ? ', ' + esc(e.waktu) : ''}<br>${esc(e.lokasi)}</p><p>${esc(e.deskripsi)}</p>${e.pendaftaran ? `<span class="badge ok">${esc(e.pendaftaran)}</span>` : ''}</article>`).join('') || '<p class="empty">Agenda kegiatan akan dipublikasikan setelah jadwal resmi ditetapkan.</p>';
  };
  bln.onchange = kat.onchange = draw; draw();
})();

// Dokumen + pencarian
(async () => {
  const el = $('#docList'), d = await load('documents.json'), q = $('#qDoc');
  if (d._err) return fail(el, 'dokumen');
  const draw = () => {
    const k = q.value.trim().toLowerCase();
    const l = d.filter(x => (x.nama + x.kategori + x.ringkasan).toLowerCase().includes(k));
    el.innerHTML = l.map(x => `<article class="card"><div class="ic">${icon('doc')}</div><span class="badge ${x.url ? 'ok' : ''}">${x.url ? esc(x.kategori) : 'Dalam Penyusunan'}</span><h3>${esc(x.nama)}</h3><p>${esc(x.ringkasan)}${x.versi ? '<br>Versi: ' + esc(x.versi) : ''}</p>${x.url ? `<a class="btn sm" href="${esc(x.url)}" target="_blank" rel="noopener">Baca Dokumen</a>` : `<button class="btn sm" data-n="${esc(x.nama)}">Baca Dokumen</button>`}</article>`).join('') || '<p class="empty">Dokumen tidak ditemukan. Coba kata kunci lain.</p>';
  };
  q.oninput = draw;
  el.onclick = e => { const b = e.target.closest('[data-n]'); if (b) toast(`"${b.dataset.n}" masih dalam penyusunan.`); };
  draw();
})();

// Galeri + lightbox
const lb = $('#lb'); let lastF;
const closeLb = () => { if (!lb.hidden) { lb.hidden = true; lastF && lastF.focus(); } };
$('#lbX').onclick = closeLb; lb.onclick = e => { if (e.target === lb) closeLb(); };
(async () => {
  const el = $('#gallery'), d = await load('gallery.json');
  if (d._err) return fail(el, 'galeri');
  el.innerHTML = d.map((g, i) => `<button data-i="${i}" aria-label="Buka foto: ${esc(g.caption)}">${g.src ? `<img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" width="400" height="400" style="width:100%;height:100%;object-fit:cover">` : esc(g.caption)}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const g = d[b.dataset.i]; lastF = b;
    $('#lbImg').innerHTML = g.src ? `<img src="${esc(g.src)}" alt="${esc(g.alt)}" style="width:100%;height:100%;object-fit:contain">` : 'Placeholder foto';
    $('#lbCap').textContent = g.caption + (g.tanggal ? ' - ' + g.tanggal : ''); lb.hidden = false; $('#lbX').focus(); };
})();

// Situs: statistik, pengurus, kontak
(async () => {
  const s = await load('site.json');
  if (s._err) { ['#stats', '#team', '#contactList'].forEach(i => fail($(i), 'situs')); return; }
  $('#stats').innerHTML = s.stats.map(x => x.value == null ? `<div class="stat na"><b>Data sedang disiapkan</b><span>${esc(x.label)}</span></div>` : `<div class="stat"><b>${esc(x.value)}${esc(x.suffix || '')}</b><span>${esc(x.label)}</span></div>`).join('');
  const tm = $('#team');
  if (!s.team.length) tm.innerHTML = '<p class="empty">Susunan pengurus Kwartir Daerah akan ditampilkan setelah data terverifikasi.</p>';
  else { const g = {}; s.team.forEach(t => (g[t.bidang || 'Pimpinan'] ??= []).push(t));
    tm.innerHTML = Object.entries(g).map(([b, l]) => `<h3 class="grp">${esc(b)}</h3><div class="grid g3">${l.map(t => `<article class="card person">${t.foto ? `<img src="${esc(t.foto)}" alt="Foto ${esc(t.nama)}" loading="lazy" width="64" height="64">` : `<div class="ic">${icon('users')}</div>`}<h3>${esc(t.nama)}</h3><p><b>${esc(t.jabatan)}</b>${t.tugas ? '<br>' + esc(t.tugas) : ''}</p></article>`).join('')}</div>`).join(''); }
  const c = s.contact, wa = (c.whatsapp || '').replace(/\D/g, '');
  const rows = [['Email', c.email, c.email && `mailto:${c.email}`], ['WhatsApp', c.whatsapp, wa && `https://wa.me/${wa}`], ['Instagram', c.instagram, c.instagram], ['Sekretariat', c.alamat, '']];
  $('#contactList').innerHTML = rows.map(r => `<li><b>${r[0]}</b>${r[1] ? (r[2] ? `<a href="${esc(r[2])}" target="_blank" rel="noopener">${esc(r[1])}</a>` : esc(r[1])) : 'Belum tersedia'}</li>`).join('');
  $('#btnContact').onclick = () => { const u = wa ? `https://wa.me/${wa}` : c.email ? `mailto:${c.email}` : ''; u ? open(u, '_blank', 'noopener') : toast('Kanal kontak resmi belum dikonfigurasi.'); };
  $('#btnSafety').onclick = () => s.safetyDoc ? open(s.safetyDoc, '_blank', 'noopener') : toast('Panduan keselamatan masih dalam penyusunan.');
})();

// Animasi muncul
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 }) : null;
document.querySelectorAll('.sec h2').forEach(h => { if (io) { h.classList.add('reveal'); io.observe(h); } });
})();
