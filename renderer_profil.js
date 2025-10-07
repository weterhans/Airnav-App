// renderer_profil.js

document.addEventListener('DOMContentLoaded', function() {
    // 1. Ambil data user dari sesi yang sedang berjalan
    const userSession = localStorage.getItem('loggedInUser');
    let currentUser = null;

    if (userSession) {
        currentUser = JSON.parse(userSession);
    } else {
        // Jika tidak ada sesi, tendang ke halaman login
        const currentPath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        window.location.href = currentPath + '/login.html';
        return;
    }

    // --- Deklarasi Elemen DOM ---
    const profileAvatarContainer = document.getElementById('profile-avatar-container');
    const profileAvatar = document.getElementById('profile-avatar');
    const photoUpload = document.getElementById('photo-upload');
    const profileFullName = document.getElementById('profile-fullname');
    const profileUsername = document.getElementById('profile-username');
    const detailFullName = document.getElementById('detail-fullname');
    const detailUsername = document.getElementById('detail-username');
    const detailPhone = document.getElementById('detail-phone');
    const detailId = document.getElementById('detail-id');
    const detailLokasi = document.getElementById('detail-lokasi');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-modal');
    const modalBackdrop = document.getElementById('edit-modal-backdrop');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editProfileForm = document.getElementById('edit-profile-form');
    const editFullnameInput = document.getElementById('edit-fullname');
    const editUsernameInput = document.getElementById('edit-username');
    const editPhoneInput = document.getElementById('edit-phone');

    // Deklarasi Notifikasi Kustom
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const alertCloseBtn = document.getElementById('alert-close-btn');

    // === BAGIAN BARU: Deklarasi Elemen Tanda Tangan ===
    const signatureCanvas = document.getElementById('edit-signature-pad');
    const signatureCtx = signatureCanvas.getContext('2d');
    const clearSignatureBtn = document.getElementById('clear-edit-signature');
    
    // Inisialisasi properti canvas
    signatureCtx.strokeStyle = '#000000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineJoin = 'round';
    signatureCtx.lineCap = 'round';


    // --- Logika untuk Menggambar di Canvas (BARU) ---
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    };
    const draw = (e) => {
        if (!isDrawing) return;
        signatureCtx.beginPath();
        signatureCtx.moveTo(lastX, lastY);
        signatureCtx.lineTo(e.offsetX, e.offsetY);
        signatureCtx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    };
    const stopDrawing = () => isDrawing = false;
    const clearCanvas = () => signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    clearSignatureBtn.addEventListener('click', clearCanvas);


    // --- Fungsi ---
    const updateProfileUI = () => {
        if (!currentUser) return;
        const capitalizedName = currentUser.fullname ? (currentUser.fullname.charAt(0).toUpperCase() + currentUser.fullname.slice(1)) : currentUser.username;
        const defaultAvatar = `https://placehold.co/100x100/E2E8F0/4A5568?text=${currentUser.username.charAt(0).toUpperCase()}`;

        if (profileAvatar) profileAvatar.src = currentUser.avatar_url || defaultAvatar;
        if (profileFullName) profileFullName.textContent = capitalizedName;
        if (profileUsername) profileUsername.textContent = `@${currentUser.username}`;
        if (detailFullName) detailFullName.textContent = capitalizedName;
        if (detailUsername) detailUsername.textContent = currentUser.username;
        if (detailPhone) detailPhone.textContent = currentUser.phone_number || '-';
        if (detailId) detailId.textContent = currentUser.id || '-';
        if (detailLokasi) detailLokasi.textContent = 'SURABAYA';
    };

    const closeModal = () => {
        if (editModal) editModal.classList.add('hidden');
    };

    const showCustomAlert = (message) => {
        if (alertMessage && customAlert) {
            alertMessage.textContent = message;
            customAlert.classList.remove('hidden');
        }
    };

    // --- Event Listeners ---
    if (alertCloseBtn) {
        alertCloseBtn.addEventListener('click', () => {
            if (customAlert) customAlert.classList.add('hidden');
        });
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (editFullnameInput && editUsernameInput && editPhoneInput && editModal) {
                editFullnameInput.value = currentUser.fullname;
                editUsernameInput.value = currentUser.username;
                editPhoneInput.value = currentUser.phone_number || '';
                
                // MODIFIKASI: Bersihkan canvas setiap kali modal dibuka
                clearCanvas();

                editModal.classList.remove('hidden');
            } else {
                console.error("Elemen input di dalam modal tidak ditemukan!");
            }
        });
    }

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // MODIFIKASI: Cek apakah canvas tanda tangan kosong
            const blankCanvas = document.createElement('canvas');
            blankCanvas.width = signatureCanvas.width;
            blankCanvas.height = signatureCanvas.height;
            const isSignatureEmpty = signatureCanvas.toDataURL() === blankCanvas.toDataURL();

            const updatedData = {
                id: currentUser.id,
                fullname: editFullnameInput.value,
                username: editUsernameInput.value,
                phone_number: editPhoneInput.value,
                currentAvatarUrl: currentUser.avatar_url,
                currentSignatureUrl: currentUser.signature_url,
                avatarDataUrl: null,
                // MODIFIKASI: Kirim data tanda tangan jika tidak kosong
                signatureDataUrl: isSignatureEmpty ? null : signatureCanvas.toDataURL('image/png')
            };

            const result = await window.api.updateProfile(updatedData);

            if (result && result.success) {
                localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                currentUser = result.user;
                updateProfileUI();
                showCustomAlert('Profil berhasil diperbarui!');
            } else {
                showCustomAlert(result ? result.message : 'Gagal memperbarui profil.');
            }
            closeModal();
        });
    }

    if (profileAvatarContainer) {
        profileAvatarContainer.addEventListener('click', () => {
            if (photoUpload) photoUpload.click();
        });
    }

    if (photoUpload) {
        photoUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const avatarDataUrl = e.target.result;
                    const result = await window.api.updateProfile({
                        ...currentUser,
                        currentAvatarUrl: currentUser.avatar_url,
                        avatarDataUrl: avatarDataUrl
                    });

                    if (result && result.success) {
                        localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                        currentUser = result.user;
                        updateProfileUI();
                        showCustomAlert('Foto profil berhasil diperbarui!');
                    } else {
                        showCustomAlert('Gagal mengunggah foto.');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Initial Load ---
    updateProfileUI();
});