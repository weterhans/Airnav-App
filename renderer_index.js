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

    allNavigationalLinks.forEach(link => {
        // Cek apakah link ini memiliki atribut 'data-target'
        if (link.hasAttribute('data-target')) {
            // Jika YA (link internal), tambahkan listener untuk mencegah pindah halaman
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Hentikan aksi default HANYA untuk link internal
                const targetId = link.getAttribute('data-target');
                handleNavigation(targetId);
                // Simpan state ke hash agar bisa di-refresh/bookmark
                window.location.hash = targetId;
            });
        }
        // Jika TIDAK (link eksternal seperti ke personal.html),
        // JANGAN tambahkan listener khusus. Biarkan link berfungsi normal.
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

    const scheduleDateElement = document.getElementById('schedule-date');
    const managerTableBody = document.getElementById('manager-table-body');
    const tfpTableBody = document.getElementById('tfp-table-body');
    const cnsTableBody = document.getElementById('cns-table-body');

    
    // Fungsi bantuan untuk mengisi tabel agar tidak mengulang kode
    function populateTable(tableBody, scheduleData, emptyMessage) {
        tableBody.innerHTML = ''; // Kosongkan tabel
        if (scheduleData && scheduleData.length > 0) {
            scheduleData.forEach(person => {
                const tr = document.createElement('tr');
                const cellNama = `<td class="p-4">${person.name || ''}</td>`;
                const cellShift = `<td class="p-4">${person.shift || ''}</td>`;
                tr.innerHTML = cellNama + cellShift;
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="2" class="p-4 text-center text-gray-500">${emptyMessage}</td></tr>`;
        }
    }

    if (scheduleDateElement && managerTableBody && tfpTableBody && cnsTableBody) {
        // Listener untuk menerima payload jadwal yang baru
        window.api.onUpdateSchedule((payload) => {
            console.log('Menerima payload jadwal yang dikategorikan:', payload);

            // Perbarui tanggal
            scheduleDateElement.textContent = payload.displayDate || 'Tanggal tidak tersedia';

            // Isi setiap tabel dengan data yang sesuai
            populateTable(managerTableBody, payload.manager, 'Tidak ada Manager yang dinas');
            populateTable(tfpTableBody, payload.tfp, 'Tidak ada personil TFP yang dinas');
            populateTable(cnsTableBody, payload.cns, 'Tidak ada personil CNS yang dinas');
        });

        // Listener jika terjadi error
        window.api.onScheduleError(() => {
            const errorMessage = '<tr><td colspan="2" class="p-4 text-center text-red-500">Gagal memuat jadwal</td></tr>';
            scheduleDateElement.textContent = 'Gagal memuat tanggal';
            managerTableBody.innerHTML = errorMessage;
            tfpTableBody.innerHTML = errorMessage;
            cnsTableBody.innerHTML = errorMessage;
        });

        const editScheduleBtn = document.getElementById('edit-schedule-btn');
        if (editScheduleBtn) {
            editScheduleBtn.addEventListener('click', () => {
                console.log('Tombol Ubah Jadwal diklik, memanggil openSheet...');
                window.api.openSheet();
            });
        }

    }

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