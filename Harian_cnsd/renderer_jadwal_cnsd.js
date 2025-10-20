// renderer_jadwal_cnsd.js

document.addEventListener('DOMContentLoaded', function() {
    // Pengecekan Login
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = '../login.html';
        return;
    }
    
    let technicianList = [];

    // --- Deklarasi Elemen DOM ---
    const addScheduleButton = document.getElementById('add-schedule-button');
    const addScheduleModal = document.getElementById('add-schedule-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const scheduleForm = document.getElementById('schedule-form');
    const scheduleIdInput = document.getElementById('schedule-id');
    const scheduleDateInput = document.getElementById('schedule-date');
    const scheduleShiftInput = document.getElementById('schedule-shift');
    const technicianDropdownsContainer = document.getElementById('technician-dropdowns');
    const scheduleTableBody = document.getElementById('schedule-table-body');
    const modalTitle = document.getElementById('modal-title');

    // --- Fungsi ---
    const loadTechnicians = async () => {
        const result = await window.api.getTechnicians();
        if (result.success) {
            technicianList = result.data;
            createTechnicianDropdowns();
        }
    };

    const loadSchedules = async () => {
        const result = await window.api.getCnsdSchedules();
        scheduleTableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(schedule => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                const formattedDate = new Date(schedule.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'});
                
                // PERUBAHAN: Tambahkan kolom untuk teknisi_6
                row.innerHTML = `
                    <td class="px-4 py-3 font-medium text-gray-900">${schedule.schedule_id_custom || '-'}</td>
                    <td class="px-4 py-3">${formattedDate}</td>
                    <td class="px-4 py-3">${schedule.hari || '-'}</td>
                    <td class="px-4 py-3">${schedule.dinas || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_1 || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_2 || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_3 || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_4 || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_5 || '-'}</td>
                    <td class="px-4 py-3">${schedule.teknisi_6 || '-'}</td>
                    <td class="px-4 py-3">${schedule.kode || '-'}</td>
                    <td class="px-4 py-3">${schedule.grup || '-'}</td>
                    <td class="px-4 py-3">
                        <button class="edit-btn text-indigo-600 hover:text-indigo-900 font-medium" data-id="${schedule.id}">Edit</button>
                    </td>
                `;
                scheduleTableBody.appendChild(row);
            });
        } else {
            // PERUBAHAN: Update colspan menjadi 13
            scheduleTableBody.innerHTML = `
                <tr class="text-center">
                   <td colspan="13" class="py-10 px-4 text-gray-500">
                        <p>Tidak ada data jadwal untuk ditampilkan.</p>
                        <p class="text-sm">Silakan tambahkan jadwal baru.</p>
                   </td>
                </tr>
            `;
        }
    };

    const createTechnicianDropdowns = () => {
        if (!technicianDropdownsContainer) return;
        technicianDropdownsContainer.innerHTML = '';
        // PERUBAHAN: Loop sampai 6 untuk membuat 6 dropdown
        for (let i = 1; i <= 6; i++) {
            const select = document.createElement('select');
            select.name = `teknisi_${i}`;
            select.className = 'block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm mt-2';
            let options = `<option value="">Pilih Teknisi ${i}${i > 2 ? ' (Opsional)' : ''}</option>`;
            technicianList.forEach(name => {
                options += `<option value="${name}">${name}</option>`;
            });
            select.innerHTML = options;
            technicianDropdownsContainer.appendChild(select);
        }
    };

    const generateScheduleId = () => {
        if (!scheduleShiftInput || !scheduleDateInput || !scheduleIdInput) return;
        const dinas = scheduleShiftInput.value;
        const tanggalValue = scheduleDateInput.value;
        if (!dinas || !tanggalValue) {
            scheduleIdInput.value = '';
            return;
        };
        const tanggal = new Date(tanggalValue);
        const day = String(tanggal.getDate()).padStart(2, '0');
        const month = String(tanggal.getMonth() + 1).padStart(2, '0');
        const year = tanggal.getFullYear();
        scheduleIdInput.value = `${dinas.toUpperCase()}-${day}/${month}/${year}-CNSD`;
    };
    
    const openModal = () => {
        if (!scheduleForm || !addScheduleModal) return;
        modalTitle.textContent = 'Tambah Jadwal Baru';
        scheduleForm.reset();
        createTechnicianDropdowns();
        document.getElementById('schedule-db-id').value = '';
        const today = new Date();
        scheduleDateInput.value = today.toISOString().slice(0, 10);
        const hour = today.getHours();
        let currentShift = 'Malam';
        if (hour >= 7 && hour < 13) { currentShift = 'Pagi'; } 
        else if (hour >= 13 && hour < 19) { currentShift = 'Siang'; }
        scheduleShiftInput.value = currentShift;
        generateScheduleId();
        addScheduleModal.classList.remove('hidden');
    };

    const openEditModal = async (scheduleId) => {
        const result = await window.api.getCnsdScheduleById(scheduleId);
        if (!result.success || !result.data) {
            alert(result.message || 'Data jadwal tidak ditemukan.');
            return;
        }
        const schedule = result.data;
        modalTitle.textContent = 'Edit Jadwal';
        document.getElementById('schedule-db-id').value = schedule.id;
        document.getElementById('schedule-id').value = schedule.schedule_id_custom;
        document.getElementById('schedule-date').value = new Date(schedule.tanggal).toISOString().slice(0,10);
        document.getElementById('schedule-shift').value = schedule.dinas;
        
        // PERUBAHAN: Loop sampai 6 untuk mengisi data edit
        for (let i = 1; i <= 6; i++) {
            const select = document.querySelector(`[name="teknisi_${i}"]`);
            if (select) select.value = schedule[`teknisi_${i}`] || '';
        }
        
        addScheduleModal.classList.remove('hidden');
    };

    const closeModal = () => {
        if (addScheduleModal) addScheduleModal.classList.add('hidden');
    };

    // --- Event Listeners ---
    if(addScheduleButton) addScheduleButton.addEventListener('click', openModal);
    if(closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if(cancelButton) cancelButton.addEventListener('click', closeModal);
    if(scheduleDateInput) scheduleDateInput.addEventListener('change', generateScheduleId);
    if(scheduleShiftInput) scheduleShiftInput.addEventListener('change', generateScheduleId);

    if (scheduleTableBody) {
        scheduleTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('edit-btn')) {
                const scheduleId = event.target.dataset.id;
                openEditModal(scheduleId);
            }
        });
    }

    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            const formData = new FormData(scheduleForm);
            
            // PERUBAHAN: Mengambil 6 data teknisi dan mengisi kode/grup
            const scheduleData = {
                id: formData.get('id') || null,
                schedule_id_custom: formData.get('schedule-id'),
                tanggal: formData.get('schedule-date'),
                dinas: formData.get('schedule-shift'),
                hari: new Date(formData.get('schedule-date')).toLocaleDateString('id-ID', { weekday: 'long' }),
                teknisi_1: formData.get('teknisi_1') || null,
                teknisi_2: formData.get('teknisi_2') || null,
                teknisi_3: formData.get('teknisi_3') || null,
                teknisi_4: formData.get('teknisi_4') || null,
                teknisi_5: formData.get('teknisi_5') || null,
                teknisi_6: formData.get('teknisi_6') || null,
                kode: formData.get('schedule-id'), // 'kode' diisi dari 'ID Jadwal'
                grup: 'CNSD' // 'grup' diisi default 'CNSD'
            };

            let result;
            if (scheduleData.id) {
                result = await window.api.updateCnsdSchedule(scheduleData);
            } else {
                result = await window.api.saveCnsdSchedule(scheduleData);
            }

            if (result.success) {
                alert(result.message);
                closeModal();
                loadSchedules();
            } else {
                alert('Gagal: ' + (result.message || 'Terjadi kesalahan'));
            }
        });
    }

    // --- Inisialisasi ---
    async function initializePage() {
        await loadTechnicians();
        await loadSchedules();
    }
    
    initializePage();
});