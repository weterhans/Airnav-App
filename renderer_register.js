// renderer_register.js

document.addEventListener('DOMContentLoaded', function() {
    // === DEKLARASI SEMUA ELEMEN ===
    const registerCard = document.getElementById('register-card');
    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');
    const canvas = document.getElementById('signature-pad');
    const ctx = canvas.getContext('2d');

    // Elemen untuk Notifikasi Kustom
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertCloseBtn = document.getElementById('alert-close-btn');

    // === LOGIKA NOTIFIKASI KUSTOM ===
    function showCustomAlert(message) {
        alertMessage.textContent = message; // Atur pesan notifikasi
        customAlert.classList.remove('hidden'); // Tampilkan modal
    }

    // Event listener untuk tombol "OK" di modal
    alertCloseBtn.addEventListener('click', () => {
        customAlert.classList.add('hidden'); // Sembunyikan modal
    });

    // === ANIMASI FADE-IN KARTU ===
    setTimeout(() => {
        registerCard.classList.remove('opacity-0');
    }, 100);

    // === LOGIKA CANVAS TANDA TANGAN ===
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function getMousePos(canvasDom, mouseEvent) {
        const rect = canvasDom.getBoundingClientRect();
        return { x: mouseEvent.clientX - rect.left, y: mouseEvent.clientY - rect.top };
    }
    function draw(e) {
        if (!isDrawing) return;
        const pos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        [lastX, lastY] = [pos.x, pos.y];
    }
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        [lastX, lastY] = [pos.x, pos.y];
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);

    document.getElementById('clear-signature').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });


    // === LOGIKA TOGGLE PASSWORD ===
    function setupPasswordToggle(toggleBtnId, passwordInputId, eyeIconId, eyeSlashIconId) {
        const toggleButton = document.getElementById(toggleBtnId);
        const input = document.getElementById(passwordInputId);
        const eyeIcon = document.getElementById(eyeIconId);
        const eyeSlashIcon = document.getElementById(eyeSlashIconId);
        toggleButton.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            eyeIcon.classList.toggle('hidden');
            eyeSlashIcon.classList.toggle('hidden');
        });
    }
    setupPasswordToggle('toggle-password', 'password', 'eye-icon', 'eye-slash-icon');
    setupPasswordToggle('toggle-confirm-password', 'confirm-password', 'confirm-eye-icon', 'confirm-eye-slash-icon');


    // === LOGIKA SUBMIT FORM REGISTRASI KE DATABASE ===
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerButton.disabled = true;
        registerButton.textContent = 'Memproses...';

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            showCustomAlert('Password dan Konfirmasi Password tidak cocok.');
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            return;
        }
        
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = canvas.width; blankCanvas.height = canvas.height;
        if (canvas.toDataURL() === blankCanvas.toDataURL()) {
            showCustomAlert('Tanda tangan tidak boleh kosong.');
            registerButton.disabled = false;
            registerButton.textContent = 'Register';
            return;
        }

        const userData = {
            username: document.getElementById('username').value,
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            role: document.getElementById('jabatan').value,
            password: password,
            signatureDataUrl: canvas.toDataURL('image/png')
        };
        
        const result = await window.api.register(userData);
        showCustomAlert(result.message);

        if (result.success) {
            alertCloseBtn.onclick = () => {
                customAlert.classList.add('hidden');
                window.location.href = 'login.html';
                // Reset onclick ke default untuk menghindari perilaku tak terduga
                alertCloseBtn.onclick = () => customAlert.classList.add('hidden');
            };
        } else {
            alertCloseBtn.onclick = () => {
                 customAlert.classList.add('hidden');
            };
        }

        registerButton.disabled = false;
        registerButton.textContent = 'Register';
    });
});