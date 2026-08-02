// =============================================
// KO AWIS — App Logic & Navigation
// =============================================

// ---- STATE ----
let currentTrackSlug = '';
let currentModulesList = [];
let currentModuleIndex = -1;
let completedModuls = new Set();

// ---- PAGE NAVIGATION ----
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  const pageMap = {
    home: 'page-home',
    modul: 'page-modul',
    modullist: 'page-modullist',
    isimodul: 'page-isimodul',
    informasi: 'page-informasi',
    tentang: 'page-tentang'
  };

  const navMap = {
    home: 'nav-home',
    modul: 'nav-modul',
    informasi: 'nav-informasi',
    tentang: 'nav-tentang'
  };

  const el = document.getElementById(pageMap[page]);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerReveal();
  }

  const navEl = document.getElementById(navMap[page] || 'nav-' + page);
  if (navEl) navEl.classList.add('active');

  // Init articles on informasi page
  if (page === 'informasi') renderArticles('semua');
}

// ---- MODUL LIST ----
async function showModulList(track) {
  currentTrackSlug = track;
  const grid = document.getElementById('modullist-grid');
  if (grid) grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Memuat modul...</p>';

  try {
    // 1. Fetch Track Info
    const { data: trackData, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('slug', track)
      .single();

    if (trackError) throw trackError;

    // Update Header
    document.getElementById('modullist-breadcrumb').textContent = trackData.title;
    document.getElementById('modullist-title').textContent = trackData.title;
    document.getElementById('modullist-desc').textContent = trackData.description;

    // 2. Fetch Modules
    const { data: modules, error: modulError } = await supabase
      .from('modules')
      .select('*')
      .eq('track_id', trackData.id)
      .eq('is_published', true)
      .order('order', { ascending: true });

    if (modulError) throw modulError;

    document.getElementById('modullist-count').innerHTML = `<i class="fas fa-book"></i> ${modules.length} Modul Tersedia`;

    if (modules.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">Belum ada modul di pilar ini.</div>`;
    } else {
      grid.innerHTML = modules.map((m, i) => `
        <div class="modul-card-item" onclick="openModul('${track}', ${m.id})">
          <div class="modul-card-img">
            <img src="${m.image_url || 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=400&q=80'}" alt="${m.title}" loading="lazy">
            <div class="modul-badge">MODUL ${i + 1}</div>
          </div>
          <div class="modul-card-body">
            <div class="modul-card-title">${m.title}</div>
            <div class="modul-card-desc">${m.description || ''}</div>
            <div class="modul-meta">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              45 Menit
              ${completedModuls.has(track + '-' + m.id) ? '<span style="color:var(--green-500);margin-left:0.5rem;"><i class="fas fa-check-circle"></i> Selesai</span>' : ''}
            </div>
            <button class="btn-buka">
              Buka Materi →
            </button>
          </div>
        </div>
      `).join('');
    }

    showPage('modullist');
    document.getElementById('nav-modul').classList.add('active');

  } catch (e) {
    console.error(e);
    if (grid) grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Gagal memuat data modul.</p>';
  }
}

// ---- OPEN MODUL ----
async function openModul(trackSlug, modulId) {
  currentTrackSlug = trackSlug;
  showPage('isimodul');
  document.getElementById('nav-modul').classList.add('active');

  const content = document.getElementById('modulContent');
  content.innerHTML = '<p>Memuat materi...</p>';

  try {
    // 1. Get Track Info
    const { data: trackData } = await supabase.from('tracks').select('*').eq('slug', trackSlug).single();

    // 2. Get All Modules for Sidebar
    const { data: allModules } = await supabase
      .from('modules')
      .select('id, title, order')
      .eq('track_id', trackData.id)
      .eq('is_published', true)
      .order('order', { ascending: true });

    // 3. Find current index
    currentModulesList = allModules;
    currentModuleIndex = allModules.findIndex(m => m.id == modulId);

    // 4. Get Current Module Content
    const { data: modul } = await supabase.from('modules').select('*').eq('id', modulId).single();

    // Render Sidebar
    renderSidebar(trackData, allModules, currentModuleIndex);

    // Render Content
    renderContent(trackData, modul, currentModuleIndex + 1);

  } catch (e) {
    console.error(e);
    content.innerHTML = '<p>Gagal memuat materi.</p>';
  }
}

function renderSidebar(trackData, modules, currentIndex) {
  const total = modules.length;
  const progress = Math.round(((currentIndex + 1) / (total)) * 100);

  document.getElementById('sidebar-track-name').textContent = trackData.title;
  document.getElementById('sidebar-progress-text').textContent = progress + '% Selesai';
  document.getElementById('sidebarProgressFill').style.width = progress + '%';
  document.getElementById('progressBarBottom').style.width = progress + '%';

  const sidebarNav = document.getElementById('sidebarNav');
  sidebarNav.innerHTML = modules.map((m, i) => `
      <div class="sidebar-item ${i === currentIndex ? 'active' : ''}" onclick="openModul('${trackData.slug}', ${m.id})">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${completedModuls.has(trackData.slug + '-' + m.id) ? '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'}</svg>
        Modul ${i + 1}: ${m.title}
      </div>
    `).join('');

  // Buttons
  document.getElementById('btnPrev').style.display = currentIndex <= 0 ? 'none' : 'flex';
  document.getElementById('btnNext').innerHTML = currentIndex >= total - 1 ? '<i class="fas fa-check-circle"></i> Selesaikan Track' : 'Selesai & Lanjut ke Modul Berikutnya →';
}

function renderContent(trackData, modul, modulNum) {
  const content = document.getElementById('modulContent');
  content.innerHTML = `
    <div class="modul-breadcrumb">
      <a onclick="showPage('modul')" style="cursor:pointer;">Modul KO AWIS</a>
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      <a onclick="showModulList('${trackData.slug}')" style="cursor:pointer;">${trackData.title}</a>
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
      <span>Modul ${modulNum}</span>
    </div>

    <h1>Modul ${modulNum}: ${modul.title}</h1>
    <p class="modul-desc">${modul.description || ''}</p>

    <div style="margin-top: 2rem;">
        ${modul.content}
    </div>
  `;
  content.style.animation = 'none';
  content.offsetHeight; // reflow
  content.style.animation = 'fadeUp 0.4s ease';
}

async function navigateModul(dir) {
  const nextIndex = currentModuleIndex + dir;
  if (nextIndex >= 0 && nextIndex < currentModulesList.length) {
    const nextModul = currentModulesList[nextIndex];
    // Mark current as complete
    if (dir === 1) completedModuls.add(currentTrackSlug + '-' + currentModulesList[currentModuleIndex].id);
    await openModul(currentTrackSlug, nextModul.id);
  } else {
    // End of track
    if (dir === 1) {
      showToast('<i class="fas fa-check-circle"></i> Selamat! Anda telah menyelesaikan track ini!');
      setTimeout(() => showModulList(currentTrackSlug), 1500);
      return;
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- ARTICLES ----
async function renderArticles(filter) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Memuat artikel...</p>';
  
  try {
    let query = supabase.from('articles').select('*').eq('is_published', true);
    if (filter !== 'semua') {
      query = query.eq('category', filter);
    }
    
    const { data: articles, error } = await query;
    if (error) throw error;

    if (!articles || articles.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light);">
        <div style="font-size:3rem;margin-bottom:1rem;"><i class="fas fa-inbox"></i></div>
        <p>Belum ada artikel untuk kategori ini.</p>
      </div>`;
      return;
    }

    grid.innerHTML = articles.map(a => `
      <div class="article-card" onclick="showToast('Membuka artikel: ${a.title.substring(0,30)}...')">
        <div class="article-img">
          <img src="${a.image_url || 'https://via.placeholder.com/400x200'}" alt="${a.title}" loading="lazy">
          <span class="article-cat-badge">${a.category}</span>
        </div>
        <div class="article-body">
          <div class="article-meta">
            <span><i class="far fa-calendar-alt"></i> ${new Date(a.created_at).toLocaleDateString('id-ID')}</span>
            <span><i class="far fa-clock"></i> ${a.read_time || 5} min baca</span>
          </div>
          <div class="article-title">${a.title}</div>
          <p class="article-excerpt">${a.excerpt}</p>
          <div class="article-footer">
            <div class="article-author">
              <div class="author-avatar">${(a.author || 'A').charAt(0)}</div>
              <span>${a.author || 'Admin'}</span>
            </div>
            <span class="article-link">Selengkapnya ›</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Gagal memuat artikel.</p>';
  }
}

function filterArticles(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArticles(cat);
}

// ---- FORM SUBMIT ----
function handleFormSubmit() {
  const name = document.querySelector('.form-input[placeholder="Masukkan nama Anda"]').value;
  const email = document.querySelector('.form-input[placeholder="nama@email.com"]').value;
  const msg = document.querySelector('.form-textarea').value;

  if (!name || !email || !msg) {
    showToast('<i class="fas fa-exclamation-triangle"></i> Mohon isi semua field terlebih dahulu.');
    return;
  }
  showToast('<i class="fas fa-check-circle"></i> Pesan berhasil dikirim! Tim kami akan menghubungi Anda segera.');
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
}

// ---- TOAST ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  triggerReveal();
});

// ---- REVEAL ON SCROLL ----
function triggerReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('visible');
    }
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  renderArticles('semua');
  loadDynamicModuleCounts();
  setTimeout(triggerReveal, 100);
  // support opening module via query params from static pages
  const params = new URLSearchParams(location.search);
  const qTrack = params.get('track');
  const qOpen = params.get('open');
  if (qTrack) {
    try {
      showModulList(qTrack);
      if (qOpen !== null) {
        // Note: qOpen should be ID now, not index
        openModul(qTrack, qOpen);
      }
    } catch (e) { /* ignore if functions not available on this page */ }
  }
});

async function loadDynamicModuleCounts() {
  try {
    const { data: trackCounts, error: countError } = await supabase
      .from('modules')
      .select('track_id, tracks(slug)')
      .eq('is_published', true);
      
    if (!countError && trackCounts) {
      const counts = { hilir: 0, entrepreneur: 0, digital: 0, sirkular: 0, ttg: 0 };
      trackCounts.forEach(m => {
        const slug = m.tracks?.slug;
        if (slug && counts.hasOwnProperty(slug)) {
          counts[slug]++;
        }
      });
      
      const hilirEl = document.querySelector('.card-hilir .module-lessons');
      if (hilirEl) hilirEl.innerHTML = `<i class="fas fa-book"></i> ${counts.hilir} Modul Pembelajaran`;
      
      const entreEl = document.querySelector('.card-entre .module-lessons');
      if (entreEl) entreEl.innerHTML = `<i class="fas fa-book"></i> ${counts.entrepreneur} Modul Pembelajaran`;
      
      const digitalEl = document.querySelector('.card-digital .module-lessons');
      if (digitalEl) digitalEl.innerHTML = `<i class="fas fa-book"></i> ${counts.digital} Modul Pembelajaran`;
      
      const sirkularEl = document.querySelector('.card-sirkular .module-lessons');
      if (sirkularEl) sirkularEl.innerHTML = `<i class="fas fa-book"></i> ${counts.sirkular} Modul Pembelajaran`;

      const ttgEl = document.querySelector('.card-ttg .module-lessons');
      if (ttgEl) ttgEl.innerHTML = `<i class="fas fa-book"></i> ${counts.ttg} Program`;
    }
  } catch (err) {
    console.error(err);
  }
}