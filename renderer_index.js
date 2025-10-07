// renderer_index.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Ambil dan parse data user dari localStorage
    const userSession = localStorage.getItem('loggedInUser');
    let currentUser = null;
    if (userSession) {
        currentUser = JSON.parse(userSession);
    }

    // Fungsi untuk redirect ke login jika tidak ada sesi
    const redirectToLogin = () => {
        const currentPath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        window.location.href = currentPath + '/login.html';
    };

    // 2. Auth Guard: Cek sesi, jika tidak ada, tendang ke halaman login
    if (!currentUser) {
        redirectToLogin();
        return; 
    }

    // Deklarasi semua elemen DOM
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const greetingElement = document.getElementById('greeting');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    const allNavigationalLinks = document.querySelectorAll('.nav-link, .quick-link, .back-button');
    const contentPanels = document.querySelectorAll('.content-panel');
    const navLinks = document.querySelectorAll('.nav-link');

    // Fungsi untuk handle navigasi antar panel INTERNAL
    const handleNavigation = (targetId) => {
        contentPanels.forEach(panel => {
            if(panel) panel.classList.add('hidden');
        });
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.remove('hidden');
        }
        
        navLinks.forEach(navLink => {
            navLink.classList.toggle('menu-active', navLink.getAttribute('data-target') === targetId);
        });
    };

    // --- INI BAGIAN YANG DIPERBAIKI ---
    // Logika ini sekarang bisa membedakan link internal dan eksternal
    allNavigationalLinks.forEach(link => {
        // HANYA tambahkan listener khusus jika link punya atribut 'data-target'
        if (link.hasAttribute('data-target')) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah pindah halaman HANYA untuk link internal
                const targetId = link.getAttribute('data-target');
                handleNavigation(targetId);
                window.location.hash = targetId;
            });
        }
        // Jika link TIDAK punya 'data-target' (seperti link ke work_order.html),
        // maka tidak ada event listener yang ditambahkan,
        // sehingga link akan berfungsi normal sesuai 'href'-nya.
    });
    
    // Cek hash di URL saat pertama kali load
    const checkUrlHash = () => {
        const currentHash = window.location.hash.substring(1);
        const targetPanel = document.getElementById(currentHash);
        if (currentHash && targetPanel && targetPanel.classList.contains('content-panel')) {
            handleNavigation(currentHash);
        } else {
            handleNavigation('dashboard-content');
        }
    };

    // Fungsi Logout
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        redirectToLogin();
    };
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', handleLogout);
    
    // Fungsi untuk update sapaan dan avatar
    const updateGreetingAndAvatar = () => {
        if (!currentUser) return;
        const defaultAvatar = `https://placehold.co/100x100/E2E8F0/4A5568?text=${currentUser.username.charAt(0).toUpperCase()}`;
        const userProfile = {
            fullname: currentUser.fullname || currentUser.username,
            avatar: currentUser.avatar_url || defaultAvatar 
        };
        const avatarImg = document.getElementById('avatar-img');
        if (avatarImg) avatarImg.src = userProfile.avatar;
        const hours = new Date().getHours();
        const capitalizedName = userProfile.fullname.charAt(0).toUpperCase() + userProfile.fullname.slice(1);
        let greetingText;
        if (hours >= 4 && hours < 12) { greetingText = `Selamat Pagi, ${capitalizedName}`; } 
        else if (hours >= 12 && hours < 18) { greetingText = `Selamat Siang, ${capitalizedName}`; } 
        else { greetingText = `Selamat Malam, ${capitalizedName}`; }
        if (greetingElement) greetingElement.textContent = greetingText;
    };
    
    // Fungsi untuk UI berdasarkan role
    const setupRoleBasedUI = () => {
        // Logika role-based Anda bisa ditaruh di sini
    };
    
    // Panggil semua fungsi inisialisasi
    checkUrlHash();
    updateGreetingAndAvatar();
    setupRoleBasedUI();

    // Sisa event listener lainnya (sidebar toggle, profile menu, dll.)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            sidebar.classList.toggle('w-64');
            sidebar.classList.toggle('w-20');
            mainContent.classList.toggle('md:ml-64');
            mainContent.classList.toggle('md:ml-20');
        });
    }

    const profileButton = document.getElementById('profile-button');
    const profileMenu = document.getElementById('profile-menu');
    if (profileButton && profileMenu) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileMenu.classList.toggle('hidden');
        });
    }
    document.addEventListener('click', (e) => {
        if (profileMenu && !profileMenu.classList.contains('hidden') && !profileButton.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
});