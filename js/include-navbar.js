(function(){
  // 1. HTML Navbar & Mobile Menu
  const navbarHTML = `
    <nav class="navbar" id="navbar">
      <div class="container-wide">
        <a href="index.html" class="nav-brand">
          <img src="../assets/logo-koawis-rectangle.png" alt="Logo KO AWIS" style="width: 130px; height: auto;">
        </a>
        <div class="nav-links">
          <a href="index.html" id="nav-home">Beranda</a>
          <a href="modul.html" id="nav-modul">Program KO AWIS</a>
          <a href="luaran.html" id="nav-luaran">Luaran</a>
          <a href="informasi.html" id="nav-informasi">Galeri Kegiatan</a>
          <a href="keuangan.html" id="nav-keuangan">KaWis</a>
          <a href="tentang.html" id="nav-tentang">Tentang Kami</a>
        </div>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
    <!-- Mobile Menu Overlay -->
    <div class="mobile-nav-overlay" id="mobileMenu">
      <a href="index.html" class="mobile-nav-link" id="mob-home"><i class="fas fa-home"></i> Beranda</a>
      <a href="modul.html" class="mobile-nav-link" id="mob-modul"><i class="fas fa-book"></i> Program KO AWIS</a>
      <a href="luaran.html" class="mobile-nav-link" id="mob-luaran"><i class="fas fa-trophy"></i> Luaran</a>
      <a href="informasi.html" class="mobile-nav-link" id="mob-informasi"><i class="fas fa-newspaper"></i> Galeri Kegiatan</a>
      <a href="keuangan.html" class="mobile-nav-link" id="mob-keuangan"><i class="fas fa-chart-line"></i> KaWis</a>
      <a href="tentang.html" class="mobile-nav-link" id="mob-tentang"><i class="fas fa-users"></i> Tentang Kami</a>
    </div>
  `;

  // 2. Inject HTML ke dalam body
  const existingNav = document.querySelector('.navbar');
  if (existingNav) existingNav.remove();
  const existingMobile = document.getElementById('mobileMenu');
  if (existingMobile) existingMobile.remove();
  
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  // 3. Logic Hamburger & Active State
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  // 4. Tandai Menu Aktif Otomatis
  const path = location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  const setActive = (id) => {
    document.getElementById('nav-' + id)?.classList.add('active');
    document.getElementById('mob-' + id)?.classList.add('active');
  };

  // Logika deteksi halaman
  if (page.includes('modul') || page.includes('isimodul') || page.includes('modullist')) setActive('modul');
  else if (page.includes('luaran')) setActive('luaran');
  else if (page.includes('informasi') || page.includes('isiartikel')) setActive('informasi');
  else if (page.includes('keuangan')) setActive('keuangan');
  else if (page.includes('tentang')) setActive('tentang');
  else setActive('home');
})();