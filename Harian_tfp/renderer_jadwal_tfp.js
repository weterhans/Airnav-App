// renderer_jadwal_tfp.js

document.addEventListener('DOMContentLoaded', function() {
    // Auth Guard
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
        const result = await window.api.getTfpSchedules();
        scheduleTableBody.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(schedule => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                const formattedDate = new Date(schedule.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'});
                row.innerHTML = `
                    <td class="px-4 py-3">${schedule.schedule_id_custom}</td>
                    <td class="px-4 py-3">${formattedDate}</td>
                    <td class="px-4 py-3">${schedule.hari}</td>
                    <td class="px-4 py-3">${schedule.dinas}</td>
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
            scheduleTableBody.innerHTML = `<tr class="text-center"><td colspan="13" class="py-10">Belum ada data jadwal.</td></tr>`;
        }
    };

    const createTechnicianDropdowns = () => {
        technicianDropdownsContainer.innerHTML = '';
        // PERUBAHAN: Loop sampai 6
        for (let i = 1; i <= 6; i++) {
            const select = document.createElement('select');
            select.name = `teknisi_${i}`;
            select.className = 'block w-full border-gray-300 rounded-md shadow-sm mt-2';
            let options = `<option value="">Pilih Teknisi ${i}${i > 2 ? ' (Opsional)' : ''}</option>`;
            technicianList.forEach(name => options += `<option value="${name}">${name}</option>`);
            select.innerHTML = options;
            technicianDropdownsContainer.appendChild(select);
        }
    };

    const generateScheduleId = () => {
        const dinas = scheduleShiftInput.value;
        const tanggal = new Date(scheduleDateInput.value);
        if (!dinas || isNaN(tanggal)) return;
        const day = String(tanggal.getDate()).padStart(2, '0');
        const month = String(tanggal.getMonth() + 1).padStart(2, '0');
        const year = tanggal.getFullYear();
        scheduleIdInput.value = `${dinas.toUpperCase()}-${day}/${month}/${year}-TFP`;
    };
    
    const openModal = (isEditing = false, data = null) => {
        scheduleForm.reset();
        modalTitle.textContent = isEditing ? 'Edit Jadwal TFP' : 'Tambah Jadwal Baru';
        document.getElementById('schedule-db-id').value = isEditing ? data.id : '';

        if (isEditing) {
            scheduleIdInput.value = data.schedule_id_custom;
            scheduleDateInput.value = new Date(data.tanggal).toISOString().slice(0,10);
            scheduleShiftInput.value = data.dinas;
            // PERUBAHAN: Loop sampai 6
            for (let i = 1; i <= 6; i++) {
                const select = document.querySelector(`[name="teknisi_${i}"]`);
                if (select) select.value = data[`teknisi_${i}`] || '';
            }
        } else {
            scheduleDateInput.value = new Date().toISOString().slice(0, 10);
            const hour = new Date().getHours();
            let currentShift = (hour >= 7 && hour < 13) ? 'Pagi' : (hour >= 13 && hour < 19) ? 'Siang' : 'Malam';
            scheduleShiftInput.value = currentShift;
            generateScheduleId();
        }
        addScheduleModal.classList.remove('hidden');
    };

    const closeModal = () => addScheduleModal.classList.add('hidden');

    // --- Event Listeners ---
    addScheduleButton.addEventListener('click', () => openModal(false));
    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    scheduleDateInput.addEventListener('change', generateScheduleId);
    scheduleShiftInput.addEventListener('change', generateScheduleId);

    scheduleTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const result = await window.api.getTfpScheduleById(e.target.dataset.id);
            if (result.success) openModal(true, result.data);
        }
    });

    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(scheduleForm);
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
            teknisi_6: formData.get('teknisi_6') || null, // Tambahkan teknisi 6
            kode: formData.get('schedule-id'),
            grup: 'TFP'
        };

        const result = scheduleData.id ? await window.api.updateTfpSchedule(scheduleData) : await window.api.saveTfpSchedule(scheduleData);
        alert(result.message);
        if (result.success) {
            closeModal();
            loadSchedules();
        }
    });

    // --- Inisialisasi ---
    loadTechnicians();
    loadSchedules();
});