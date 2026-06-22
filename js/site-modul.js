document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  // Bersihkan nilai 'track' dari karakter aneh
  const track = (params.get('track') || 'hilir').replace(/[^a-z]/gi, '').toLowerCase();

  const titleEl = document.getElementById('modullist-title');
  const descEl  = document.getElementById('modullist-desc');
  const countEl = document.getElementById('modullist-count');
  const grid    = document.getElementById('modullist-grid');

  // Peta fallback jika tracks belum ada di DB
  const PILAR_FALLBACK = {
    hilir:        { title: 'Hilir',        description: 'Pengolahan & Produksi Kakao' },
    entrepreneur: { title: 'Entrepreneur', description: 'Bisnis & Kewirausahaan Kakao' },
    digital:      { title: 'Digital',      description: 'Teknologi & Inovasi Digital' },
    sirkular:     { title: 'Sirkular',     description: 'Ekosistem Berkelanjutan Kakao' },
  };

  try {
    // ─── HALAMAN MODULLIST.HTML ───
    if (grid) {

      // 1. Ambil info track (robust: tanpa .single() dulu agar tidak 406)
      let trackId = null;
      let trackInfo = PILAR_FALLBACK[track] || { title: track, description: '' };

      const { data: trackRows, error: trackError } = await supabase
        .from('tracks')
        .select('id, title, slug, description, icon')
        .eq('slug', track)
        .limit(1);

      if (trackError) {
        // Kolom slug mungkin belum ada — coba cari berdasarkan title
        console.warn('tracks query by slug gagal, fallback ke title:', trackError.message);

        const { data: trackByTitle } = await supabase
          .from('tracks')
          .select('id, title, description, icon')
          .ilike('title', `%${trackInfo.title}%`)
          .limit(1);

        if (trackByTitle && trackByTitle.length > 0) {
          trackId   = trackByTitle[0].id;
          trackInfo = trackByTitle[0];
        }
      } else if (trackRows && trackRows.length > 0) {
        trackId   = trackRows[0].id;
        trackInfo = trackRows[0];
      }

      // Tampilkan info track di halaman
      if (titleEl) titleEl.textContent = trackInfo.title || track;
      if (descEl)  descEl.textContent  = trackInfo.description || '';

      // 2. Ambil modul berdasarkan track_id ATAU track_slug
      let modulQuery = supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('order', { ascending: true });

      if (trackId) {
        modulQuery = modulQuery.eq('track_id', trackId);
      } else {
        // Fallback: coba filter berdasarkan icon/slug modul
        console.warn('Track ID tidak ditemukan, menampilkan semua modul terbit');
      }

      const { data: modules, error: modulError } = await modulQuery;
      if (modulError) throw modulError;

      if (modules && modules.length > 0) {
        if (countEl) countEl.innerHTML = `<i class="fas fa-book"></i> ${modules.length} Modul Tersedia`;

        grid.innerHTML = modules.map((m, i) => `
          <div class="modul-card-item">
            <div class="modul-card-img">
              <img src="${m.image_url || 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=400&q=80'}"
                alt="${m.title}" loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=400&q=80'">
              <div class="modul-badge">MODUL ${i + 1}</div>
            </div>
            <div class="modul-card-body">
              <div class="modul-card-title">${m.title}</div>
              <div class="modul-card-desc">${m.description || ''}</div>
              <div class="modul-meta"><i class="far fa-clock"></i> Estimasi 45 Menit</div>
              <a class="btn-buka" href="isimodul.html?id=${m.id}">Buka Materi →</a>
            </div>
          </div>
        `).join('');
      } else {
        if (countEl) countEl.innerHTML = `<i class="fas fa-book"></i> 0 Modul Tersedia`;
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">
            <i class="fas fa-box-open" style="font-size:2rem;opacity:.3;display:block;margin-bottom:.75rem;"></i>
            Belum ada modul di pilar ini. Segera hadir!
          </div>`;
      }
    }

    // ─── HALAMAN MODUL.HTML (landing) — update jumlah modul per pilar ───
    const hasPilarCards = document.querySelector('.card-hilir, .card-entre, .card-digital, .card-sirkular');
    if (hasPilarCards) {
      const { data: trackCounts, error: countError } = await supabase
        .from('modules')
        .select('track_id, tracks(slug, title)')
        .eq('is_published', true);

      if (!countError && trackCounts) {
        const counts = { hilir: 0, entrepreneur: 0, digital: 0, sirkular: 0 };
        trackCounts.forEach(m => {
          const slug = m.tracks?.slug?.toLowerCase();
          if (slug && Object.prototype.hasOwnProperty.call(counts, slug)) {
            counts[slug]++;
          }
        });

        const map = [
          { sel: '.card-hilir .module-lessons',    key: 'hilir' },
          { sel: '.card-entre .module-lessons',     key: 'entrepreneur' },
          { sel: '.card-digital .module-lessons',   key: 'digital' },
          { sel: '.card-sirkular .module-lessons',  key: 'sirkular' },
        ];
        map.forEach(({ sel, key }) => {
          const el = document.querySelector(sel);
          if (el) el.innerHTML = `<i class="fas fa-book"></i> ${counts[key]} Modul Pembelajaran`;
        });
      }
    }

  } catch (e) {
    console.error('Gagal memuat modul.', e);
    if (grid) grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;">
        <p style="color:#c62828;font-weight:600;">
          <i class="fas fa-exclamation-triangle"></i> Gagal memuat modul.
        </p>
        <p style="font-size:.85rem;color:#888;margin-top:.5rem;">Periksa koneksi internet atau hubungi admin.</p>
      </div>`;
  }
});