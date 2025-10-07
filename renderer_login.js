// renderer_login.js

document.addEventListener('DOMContentLoaded', function() {
    // === DEKLARASI SEMUA ELEMEN ===
    // Pastikan semua ID ini sesuai dengan yang ada di login.html
    const splashScreen = document.getElementById('splash-screen');
    const splashLogo = document.getElementById('splash-logo');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const registerLink = document.getElementById('register-link');
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertCloseBtn = document.getElementById('alert-close-btn');

    // [DEBUG] Cek apakah 'api' dari preload.js berhasil dimuat
    console.log('Renderer: window.api object:', window.api);

    // === FUNGSI UTAMA UNTUK MEMULAI APLIKASI ===
    function initializeApp() {
        if (!splashScreen || !mainContent || !loginForm) {
            console.error("Elemen penting tidak ditemukan! Pastikan ID di login.html sudah benar: #splash-screen, #main-content, #login-form");
            return;
        }

        if (sessionStorage.getItem('loggedInUser')) {
            splashScreen.style.display = 'none';
            mainContent.classList.remove('opacity-0');
            const currentPath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            window.location.href = currentPath + '/index.html';
            return;
        }
        
        runSplashScreenAnimation();
    }

    // === FUNGSI UNTUK ANIMASI & NOTIFIKASI ===
    function runSplashScreenAnimation() {
        if (splashLogo) {
            setTimeout(() => {
                splashLogo.classList.remove('opacity-0');
            }, 100);
        }

        setTimeout(() => {
            if (splashScreen) splashScreen.classList.add('opacity-0');
            if (mainContent) mainContent.classList.remove('opacity-0');
            setTimeout(() => {
                if (splashScreen) splashScreen.style.display = 'none';
            }, 1000);
        }, 2000);
    }

    function showCustomAlert(message) {
        if (alertMessage && customAlert) {
            alertMessage.textContent = message;
            customAlert.classList.remove('hidden');
        }
    }
    
    // Menambahkan event listener HANYA jika elemennya ada
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', () => {
            if (customAlert) customAlert.classList.add('hidden');
        });
    }

    // === BAGIAN ANIMASI & UX TAMBAHAN ===
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                passwordInput.focus();
            }
        });
    }

    if (registerLink && mainContent) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            const destination = this.href;
            mainContent.classList.add('opacity-0');
            setTimeout(() => {
                window.location.href = destination;
            }, 1000);
        });
    }

    // === LOGIKA UTAMA LOGIN KE DATABASE ===
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showCustomAlert('Username atau Password tidak boleh kosong.');
                return;
            }

            try {
                // [DEBUG] Lacak data yang akan dikirim
                console.log('Renderer: Mengirim data ke main process...', { username, password });
                const result = await window.api.login(username, password);
                
                // [DEBUG] Lacak hasil yang diterima
                console.log('Renderer: Menerima hasil dari main process:', result);

                if (result && result.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                    const currentPath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                    window.location.href = currentPath + '/index.html';
                } else {
                    const message = result ? result.message : 'Gagal login, tidak ada respons dari server.';
                    showCustomAlert(message);
                }
            } catch (error) {
                // [DEBUG] Tangkap error jika pemanggilan IPC gagal total
                console.error('Renderer: Terjadi error saat memanggil window.api.login:', error);
                showCustomAlert('Error: Gagal menghubungi proses backend.');
            }
        });
    }

    // === MULAI SEMUANYA! ===
    initializeApp();
});