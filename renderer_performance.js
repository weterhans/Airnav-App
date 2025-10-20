document.addEventListener('DOMContentLoaded', () => {
    // --- Selektor Elemen ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOpenMobile = document.getElementById('sidebar-open-mobile');
    const mainContent = document.getElementById('main-content');
    const profileButton = document.getElementById('profile-button');
    const profileMenu = document.getElementById('profile-menu');
    const greetingEl = document.getElementById('greeting');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');

    // --- Logika untuk Toggle Sidebar (Desktop & Mobile) ---
    const isDesktop = () => window.innerWidth >= 768;

    // Fungsi untuk mengubah state sidebar di desktop (collapse/expand)
    const toggleDesktopSidebar = () => {
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('collapsed')) {
            mainContent.classList.remove('md:ml-64');
            mainContent.classList.add('md:ml-20');
        } else {
            mainContent.classList.remove('md:ml-20');
            mainContent.classList.add('md:ml-64');
        }
    };

    // Fungsi untuk mengubah state sidebar di mobile (show/hide)
    const toggleMobileSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
    };

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (isDesktop()) {
                toggleDesktopSidebar();
            } else {
                toggleMobileSidebar();
            }
        });
    }

    if (sidebarOpenMobile) {
        sidebarOpenMobile.addEventListener('click', toggleMobileSidebar);
    }

    // --- Logika untuk Menu Profil ---
    if (profileButton) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event 'click' dari window dieksekusi
            profileMenu.classList.toggle('hidden');
        });
    }

    // Sembunyikan menu profil jika pengguna mengklik di luar area menu
    window.addEventListener('click', () => {
        if (profileMenu && !profileMenu.classList.contains('hidden')) {
            profileMenu.classList.add('hidden');
        }
    });

    // --- Ucapan Selamat Dinamis Berdasarkan Waktu ---
    const setGreeting = () => {
        if (!greetingEl) return;
        const hour = new Date().getHours();
        let greetingText;
        if (hour >= 4 && hour < 11) {
            greetingText = "Selamat Pagi!";
        } else if (hour >= 11 && hour < 15) {
            greetingText = "Selamat Siang!";
        } else if (hour >= 15 && hour < 19) {
            greetingText = "Selamat Sore!";
        } else {
            greetingText = "Selamat Malam!";
        }
        greetingEl.textContent = greetingText;
    };

    setGreeting(); // Panggil fungsi saat halaman pertama kali dimuat

    // --- Logika untuk Tombol Logout ---
    const handleLogout = (e) => {
        e.preventDefault();
        console.log('Proses logout dimulai...');
        // Di sini Anda bisa menambahkan logika logout sebenarnya,
        // misalnya menghapus token sesi, dan mengarahkan ke halaman login.
        alert('Fungsi logout belum diimplementasikan.');
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Menyesuaikan tampilan sidebar saat ukuran window diubah
    window.addEventListener('resize', () => {
        // Jika user mengubah ukuran ke desktop
        if (isDesktop()) {
            // Pastikan sidebar mobile tertutup
            sidebar.classList.add('-translate-x-full');
            // Atur ulang margin konten utama sesuai state sidebar (collapsed atau tidak)
            if (sidebar.classList.contains('collapsed')) {
                mainContent.classList.remove('md:ml-64');
                mainContent.classList.add('md:ml-20');
            } else {
                mainContent.classList.remove('md:ml-20');
                mainContent.classList.add('md:ml-64');
            }
        } else {
             // Jika user mengubah ke mobile, hapus class collapsed dan sesuaikan margin
             sidebar.classList.remove('collapsed');
             mainContent.classList.remove('md:ml-20');
             mainContent.classList.add('md:ml-64');
        }
    });
});
