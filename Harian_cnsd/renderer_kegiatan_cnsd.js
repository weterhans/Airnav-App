// renderer_kegiatan_cnsd.js (Versi Perbaikan)

document.addEventListener('DOMContentLoaded', function () {
    // Auth Guard
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = '../login.html';
        return;
    }

    // --- Elemen-elemen ---
    const addActivityButton = document.getElementById('add-activity-button');
    const addActivityModal = document.getElementById('add-activity-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const activityForm = document.getElementById('activity-form');
    const modalTitle = document.getElementById('modal-title');
    const activityTableBody = document.getElementById('activity-table-body');
    const activityAttachmentInput = document.getElementById('activity-attachment');
    const technicianDropdownsContainer = document.getElementById('technician-dropdowns');
    const existingAttachmentPreview = document.getElementById('existing-attachment-preview');
    const newAttachmentPreview = document.getElementById('new-attachment-preview');
    const imageLightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeLightboxButton = document.getElementById('close-lightbox-button');
    
    // --- Variabel State ---
    let technicianList = [];
    let newAttachmentFiles = [];
    let existingAttachmentPaths = [];

    const getCurrentShift = () => {
    const currentHour = new Date().getHours(); // Ambil jam saat ini (format 0-23)

    if (currentHour >= 7 && currentHour < 13) {
        // Antara jam 7:00 pagi sampai 12:59 siang
        return 'Pagi';
    } else if (currentHour >= 13 && currentHour < 19) {
        // Antara jam 1:00 siang sampai 6:59 sore
        return 'Siang';
    } else {
        // Sisa waktu lainnya (jam 7:00 malam sampai 6:59 pagi)
        return 'Malam';
    }};

    const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast-notification');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    // Hapus dulu kelas warna sebelumnya
    toast.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');

    if (type === 'success') {
        toastIcon.innerHTML = '✅';
        toast.classList.add('bg-green-100', 'text-green-700');
    } else { // type === 'error'
        toastIcon.innerHTML = '❌';
        toast.classList.add('bg-red-100', 'text-red-700');
    }

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
};

    // --- Fungsi Utama ---

    const loadActivities = async () => {
        console.log("1. Memanggil backend untuk mengambil data kegiatan...");
        const result = await window.api.getCnsdActivities();
        console.log("2. Menerima hasil dari backend:", result);

        activityTableBody.innerHTML = '';
        if (result && result.success && result.data.length > 0) {
            console.log(`3. Ditemukan ${result.data.length} data, mulai merender tabel.`);
            result.data.forEach(activity => {
                try {
                    const row = document.createElement('tr');
                    row.className = 'border-b hover:bg-gray-50';
                    
                    let formattedDate = '-';
                    if (activity.tanggal) {
                        formattedDate = new Date(activity.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    }

                    const teknisiArray = Array.isArray(activity.teknisi) ? activity.teknisi : [];
                    const lampiranArray = Array.isArray(activity.lampiran) ? activity.lampiran : [];
                    
                    const lampiranCell = lampiranArray.length > 0
                        ? `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${lampiranArray.length} Lampiran</span>`
                        : '-';

                    row.innerHTML = `
                        <td class="px-4 py-2">${activity.kode || '-'}</td>
                        <td class="px-4 py-2">${activity.dinas || '-'}</td>
                        <td class="px-4 py-2">${formattedDate}</td>
                        <td class="px-4 py-2">${activity.waktu_mulai || '-'}</td>
                        <td class="px-4 py-2">${activity.waktu_selesai || '-'}</td>
                        <td class="px-4 py-2">${activity.alat || '-'}</td>
                        <td class="px-4 py-2 truncate max-w-xs" title="${activity.permasalahan || ''}">${activity.permasalahan || ''}</td>
                        <td class="px-4 py-2 truncate max-w-xs" title="${activity.tindakan || ''}">${activity.tindakan || ''}</td>
                        <td class="px-4 py-2 truncate max-w-xs" title="${activity.hasil || ''}">${activity.hasil || ''}</td>
                        <td class="px-4 py-2">${activity.status || '-'}</td>
                        <td class="px-4 py-2">${teknisiArray.join(', ')}</td>
                        <td class="px-4 py-2">${activity.waktu_terputus || '-'}</td>
                        <td class="px-4 py-2">${lampiranCell}</td>
                        <td class="px-4 py-2">
                            <button class="edit-btn text-indigo-600 hover:text-indigo-900 font-medium" data-id="${activity.id}">Edit</button>
                        </td>
                    `;
                    activityTableBody.appendChild(row);
                } catch (e) {
                    console.error('Gagal memproses satu baris data kegiatan:', activity, e);
                }
            });
        } else {
            console.log("3. Tidak ada data yang ditemukan atau terjadi error, menampilkan pesan kosong.");
            activityTableBody.innerHTML = `<tr id="empty-row" class="text-center"><td colspan="14" class="py-10">Belum ada data kegiatan.</td></tr>`;
        }
    };

    const createTechnicianDropdowns = () => {
        if (!technicianDropdownsContainer) return;
        technicianDropdownsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const select = document.createElement('select');
            select.name = `teknisi-${i}`;
            select.className = 'block w-full border-gray-300 rounded-md shadow-sm';
            let options = `<option value="">Pilih Teknisi ${i}${i > 2 ? ' (Opsional)' : ''}</option>`;
            technicianList.forEach(name => options += `<option value="${name}">${name}</option>`);
            select.innerHTML = options;
            technicianDropdownsContainer.appendChild(select);
        }
    };
    
    // ... (fungsi lainnya seperti openModal, createPreviewElement, dll. tetap sama persis seperti sebelumnya) ...

    const renderAllPreviews = async () => {
        existingAttachmentPreview.innerHTML = '';
        newAttachmentPreview.innerHTML = '';
        for (const path of existingAttachmentPaths) {
            const dataUrl = await window.api.readFileAsBase64(path);
            if (dataUrl) {
                const div = createPreviewElement(dataUrl, path, 'existing');
                existingAttachmentPreview.appendChild(div);
            }
        }
        newAttachmentFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = createPreviewElement(e.target.result, index, 'new');
                newAttachmentPreview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    };
    
    const createPreviewElement = (src, identifier, type) => {
        const div = document.createElement('div');
        div.className = 'relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden group preview-image-wrapper cursor-pointer';
        div.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" class="remove-attachment-btn text-white p-2 rounded-full hover:bg-red-500 z-10" data-identifier="${identifier}" data-type="${type}" title="Hapus gambar ini">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        return div;
    };

    const openModal = async (isEditing = false, data = null) => {
        activityForm.reset();
        newAttachmentFiles = [];
        existingAttachmentPaths = [];
        modalTitle.textContent = isEditing ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru';
        document.getElementById('activity-db-id').value = isEditing ? data.id : '';
        if (isEditing) {
            document.getElementById('activity-code').value = data.kode;
            document.getElementById('activity-shift').value = data.dinas;
            if (data.tanggal) {
                document.getElementById('activity-date').value = new Date(data.tanggal).toISOString().slice(0,10);
            }
            document.getElementById('activity-start-time').value = data.waktu_mulai;
            document.getElementById('activity-end-time').value = data.waktu_selesai;
            document.getElementById('activity-tool').value = data.alat;
            document.getElementById('activity-problem').value = data.permasalahan;
            document.getElementById('activity-action').value = data.tindakan;
            document.getElementById('activity-result').value = data.hasil;
            document.getElementById('activity-status').value = data.status;
            document.getElementById('activity-downtime').value = data.waktu_terputus;
            let teknisiArray = [];
            if (Array.isArray(data.teknisi)) {
                // KASUS 1: Jika datanya SUDAH berbentuk Array, langsung pakai.
                teknisiArray = data.teknisi;
            } else if (typeof data.teknisi === 'string' && data.teknisi) {
                // KASUS 2: Jika datanya adalah String, proses lebih lanjut.
                try {
                    // Coba parse sebagai JSON. Berhasil untuk '["Andi", "Joko"]'.
                    const parsed = JSON.parse(data.teknisi);
                    // Pastikan hasil parse adalah array
                    teknisiArray = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    // Gagal parse, berarti ini string biasa. Split dengan koma.
                    // Berhasil untuk "joko" dan "Andi,Joko".
                    teknisiArray = data.teknisi.split(',');
                }
            }
            for (let i = 0; i < 5; i++) {
                const select = document.querySelector(`select[name="teknisi-${i+1}"]`);
                if (select) select.value = teknisiArray[i] || '';
            }
            existingAttachmentPaths = Array.isArray(data.lampiran) ? data.lampiran : [];
        } else {
            document.getElementById('activity-code').value = `KG-CNSD-${Date.now().toString().slice(-6)}`;
            document.getElementById('activity-date').value = new Date().toISOString().slice(0,10);
            document.getElementById('activity-shift').value = getCurrentShift();
        }
        await renderAllPreviews();
        addActivityModal.classList.remove('hidden');
    };

    const handleFileSelection = (event) => {
        const selectedFiles = Array.from(event.target.files);
        newAttachmentFiles = [...newAttachmentFiles, ...selectedFiles];
        renderAllPreviews();
        activityAttachmentInput.value = '';
    };

    // --- Event Listeners ---
    
    activityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(activityForm);
        const teknisi = [];
        for (let i = 1; i <= 5; i++) {
            const teknisiName = formData.get(`teknisi-${i}`);
            if (teknisiName) teknisi.push(teknisiName);
        }
        const activityData = {
            id: formData.get('id') || null,
            kode: formData.get('activity-code'),
            dinas: formData.get('activity-shift'),
            tanggal: formData.get('activity-date'),
            waktu_mulai: formData.get('activity-start-time'),
            waktu_selesai: formData.get('activity-end-time') || null,
            alat: formData.get('activity-tool'),
            permasalahan: formData.get('activity-problem'),
            tindakan: formData.get('activity-action'),
            hasil: formData.get('activity-result'),
            status: formData.get('activity-status'),
            waktu_terputus: formData.get('activity-downtime') || null,
            teknisi: teknisi,
            lampiran: JSON.stringify(existingAttachmentPaths),
            attachments: [] 
        };
        if (newAttachmentFiles.length > 0) {
            const filePromises = newAttachmentFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ name: file.name, data: e.target.result });
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });
            });
            activityData.attachments = await Promise.all(filePromises);
        }
        const result = await window.api.saveCnsdActivity(activityData);
        if (result.success) {
            showToast(result.message, 'success'); // Notifikasi sukses (hijau)
            addActivityModal.classList.add('hidden');
            loadActivities();
        } else {
            showToast(result.message || 'Terjadi kesalahan', 'error'); // Notifikasi error (merah)
        }
    });
    
    // MENGGABUNGKAN DUA EVENT LISTENER MENJADI SATU
    document.getElementById('attachment-container').addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-attachment-btn');
        const previewWrapper = event.target.closest('.preview-image-wrapper');

        if (removeButton) {
            const identifier = removeButton.dataset.identifier;
            const type = removeButton.dataset.type;
            if (type === 'existing') {
                existingAttachmentPaths = existingAttachmentPaths.filter(path => path !== identifier);
            } else if (type === 'new') {
                newAttachmentFiles.splice(parseInt(identifier, 10), 1);
            }
            renderAllPreviews();
        } else if (previewWrapper) {
            const img = previewWrapper.querySelector('img');
            if (img) {
                lightboxImage.src = img.src;
                imageLightbox.classList.remove('hidden');
            }
        }
    });

    activityAttachmentInput.addEventListener('change', handleFileSelection);
    addActivityButton.addEventListener('click', () => openModal(false));
    closeModalButton.addEventListener('click', () => addActivityModal.classList.add('hidden'));
    cancelButton.addEventListener('click', () => addActivityModal.classList.add('hidden'));
    
    activityTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const result = await window.api.getCnsdActivityById(id);
            if (result.success && result.data) {
                await openModal(true, result.data);
            } else {
                showToast('Gagal mengambil detail kegiatan.', 'error');
            }
        }
    });

    closeLightboxButton.addEventListener('click', () => imageLightbox.classList.add('hidden'));
    imageLightbox.addEventListener('click', (event) => {
        if (event.target === imageLightbox) {
            imageLightbox.classList.add('hidden');
        }
    });

    // --- FUNGSI INISIALISASI HALAMAN ---
    const initializePage = async () => {
        console.log("Memulai inisialisasi halaman...");
        try {
            const techResult = await window.api.getTechnicians();
            if (techResult.success) {
                technicianList = techResult.data;
                createTechnicianDropdowns();
                console.log("Daftar teknisi berhasil dimuat.");
            } else {
                console.error("Gagal memuat daftar teknisi.");
            }
            await loadActivities();
        } catch (error) {
            console.error("Terjadi error fatal saat inisialisasi:", error);
        }
        console.log("Inisialisasi halaman selesai.");
    };

    // Memulai semuanya
    initializePage();
});