// renderer_daily_cnsd.js
document.addEventListener('DOMContentLoaded', function() {
    // Auth Guard
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = '../login.html';
        return;
    }
    
    let equipmentNames = [];
    let technicianList = [];

    // --- Deklarasi Elemen DOM ---
    const listElement = document.getElementById('report-list');
    const addReportButton = document.getElementById('add-report-button');
    const addReportModal = document.getElementById('add-report-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const reportForm = document.getElementById('report-form');
    const equipmentContainer = document.getElementById('equipment-list');
    const modalTitle = document.getElementById('modal-title');

    // --- Fungsi ---
    const loadInitialData = async () => {
        const [techResult, equipResult] = await Promise.all([
            window.api.getTechnicians(),
            window.api.getCnsdEquipment()
        ]);

        if (techResult.success) {
            technicianList = techResult.data;
            populatePersonDropdown('mantek', 'Pilih Mantek');
            populatePersonDropdown('acknowledge', 'Pilih Acknowledge');
        }

        if (equipResult.success) {
            equipmentNames = equipResult.data;
            createEquipmentDropdowns();
        }

        loadAndRenderReports();
    };

    const loadAndRenderReports = async () => {
        const result = await window.api.getCnsdReports();
        listElement.innerHTML = '';
        if (result.success && result.data.length > 0) {
            result.data.forEach(item => {
                const formattedDate = new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const listItem = document.createElement('li');
                listItem.className = 'grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50';
                listItem.innerHTML = `
                    <div class="col-span-3 text-sm">${formattedDate}</div>
                    <div class="col-span-4 text-sm">${item.mantek}</div>
                    <div class="col-span-4 text-sm">${item.acknowledge || 'N/A'}</div>
                    <div class="col-span-1">
                        <button class="edit-btn text-indigo-600 hover:text-indigo-900 text-sm font-medium" data-id="${item.id}">Detail/Edit</button>
                    </div>
                `;
                listElement.appendChild(listItem);
            });
        } else {
             listElement.innerHTML = `<li class="text-center p-10 text-gray-500">Belum ada laporan. Silakan buat yang baru.</li>`;
        }
    };

    const createEquipmentDropdowns = () => {
        equipmentContainer.innerHTML = '';
        equipmentNames.forEach(name => {
            const id = name.toLowerCase().replace(/[\s\(\)\.\-\/]/g, '');
            const div = document.createElement('div');
            div.innerHTML = `
                <div>
                    <label for="${id}" class="block text-sm font-medium text-gray-700">${name}</label>
                    <select id="${id}" name="${id}" data-equipment-id="${id}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                        <option>NORMAL</option>
                        <option>GANGGUAN</option>
                        <option>SINGLE</option>
                        <option>U/S</option>
                    </select>
                </div>
                <div id="keterangan-wrapper-${id}" class="mt-2 hidden">
                    <label for="keterangan-${id}" class="block text-sm font-medium text-gray-500">KETERANGAN</label>
                    <textarea id="keterangan-${id}" name="keterangan-${id}" rows="2" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
            `;
            equipmentContainer.appendChild(div);
        });
    };
    
    const populatePersonDropdown = (selectId, placeholder) => {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">${placeholder}</option>`;
        technicianList.forEach(name => {
            select.innerHTML += `<option value="${name}">${name}</option>`;
        });
    };
    
    const autoFillJadwalDinas = async () => {
        const tanggal = document.getElementById('tanggal').value;
        const dinas = document.getElementById('dinas').value;
        const jadwalDinasTextarea = document.getElementById('jadwal-dinas');
        if (!tanggal || !dinas || !jadwalDinasTextarea) return;
        const result = await window.api.getTechniciansBySchedule({ tanggal: tanggal, dinas: dinas });
        if (result.success && result.data.length > 0) {
            const formattedNames = result.data.map((name, index) => `${index + 1}. ${name}`).join('\n');
            jadwalDinasTextarea.value = formattedNames;
        } else {
            jadwalDinasTextarea.value = '';
            jadwalDinasTextarea.placeholder = 'Tidak ada jadwal untuk tanggal/shift ini.';
        }
    };

    const updateAutoFields = () => {
        const dinas = document.getElementById('dinas').value;
        const tanggal = new Date(document.getElementById('tanggal').value);
        if(!dinas || isNaN(tanggal)) return;
        const day = String(tanggal.getDate()).padStart(2, '0');
        const month = String(tanggal.getMonth() + 1).padStart(2, '0');
        const year = tanggal.getFullYear();
        document.getElementById('id-daily').value = `${dinas}-${day}/${month}/${year}-CNSD`;
        document.getElementById('kode').value = `${dinas}${day}${month}${year}CNSA`;
        autoFillJadwalDinas();
    };

    const openModal = (isEditing = false, report = null) => {
        reportForm.reset();
        modalTitle.textContent = isEditing ? "Edit Laporan Daily CNSD" : "DAILY CNSD FORM";
        document.getElementById('report-db-id').value = isEditing ? report.id : '';
        document.querySelectorAll('[id^="keterangan-wrapper-"]').forEach(el => el.classList.add('hidden'));

        if (isEditing) {
            document.getElementById('id-daily').value = report.report_id_custom;
            document.getElementById('dinas').value = report.dinas;
            
            // MODIFIKASI: Hindari konversi timezone dengan mengambil langsung bagian dari string
            document.getElementById('tanggal').value = new Date(report.tanggal).toLocaleDateString('en-CA');

            document.getElementById('jam').value = report.jam;
            document.getElementById('mantek').value = report.mantek;
            document.getElementById('acknowledge').value = report.acknowledge;
            document.getElementById('kode').value = report.kode;
            document.getElementById('jadwal-dinas').value = report.jadwal_dinas;
            
            document.querySelectorAll('#shift-buttons button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.shift === report.dinas);
            });

            const eqStatus = typeof report.equipment_status === 'string' 
                ? JSON.parse(report.equipment_status || '{}') 
                : (report.equipment_status || {});

            for (const key in eqStatus) {
                const select = document.getElementById(key);
                if (select) {
                    select.value = eqStatus[key].status;
                    if (['GANGGUAN', 'SINGLE', 'U/S'].includes(select.value)) {
                        const wrapper = document.getElementById(`keterangan-wrapper-${key}`);
                        const textarea = document.getElementById(`keterangan-${key}`);
                        if(wrapper) wrapper.classList.remove('hidden');
                        if(textarea) textarea.value = eqStatus[key].keterangan || '';
                    }
                }
            }
        } else {
            const now = new Date();
            const hour = now.getHours();
            let currentShift = (hour >= 7 && hour < 13) ? 'PAGI' : (hour >= 13 && hour < 19) ? 'SIANG' : 'MALAM';
            
            document.querySelectorAll('#shift-buttons button').forEach(btn => btn.classList.toggle('active', btn.dataset.shift === currentShift));
            document.getElementById('dinas').value = currentShift;
            document.getElementById('tanggal').value = now.toISOString().slice(0,10);
            document.getElementById('jam').value = now.toTimeString().slice(0,5);
            updateAutoFields();
        }
        
        addReportModal.classList.remove('hidden');
    };

    const closeModal = () => addReportModal.classList.add('hidden');

    // --- Event Listeners ---
    addReportButton.addEventListener('click', () => openModal(false));
    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    document.getElementById('tanggal').addEventListener('change', updateAutoFields);
    document.getElementById('shift-buttons').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#shift-buttons button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('dinas').value = e.target.dataset.shift;
            updateAutoFields();
        }
    });

    equipmentContainer.addEventListener('change', (e) => {
        if (e.target.tagName !== 'SELECT') return;
        const wrapper = document.getElementById(`keterangan-wrapper-${e.target.dataset.equipmentId}`);
        if (!wrapper) return;
        if (['GANGGUAN', 'SINGLE', 'U/S'].includes(e.target.value)) {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
            wrapper.querySelector('textarea').value = '';
        }
    });

    listElement.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const result = await window.api.getCnsdReportById(event.target.dataset.id);
            if(result.success && result.data) {
                openModal(true, result.data);
            } else {
                Swal.fire('Gagal!', 'Gagal memuat data laporan.', 'error');
            }
        }
    });
    
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(reportForm);
        const reportData = { equipment_status: {} };
        
        equipmentNames.forEach(name => {
            const id = name.toLowerCase().replace(/[\s\(\)\.\-\/]/g, '');
            const status = formData.get(id);
            const keterangan = formData.get(`keterangan-${id}`);
            if(status) {
                reportData.equipment_status[id] = { status: status };
                if (keterangan) {
                    reportData.equipment_status[id].keterangan = keterangan;
                }
            }
        });

        reportData.id = formData.get('id') || null;
        reportData.report_id_custom = formData.get('report_id_custom');
        reportData.dinas = formData.get('dinas');
        reportData.tanggal = formData.get('tanggal');
        reportData.jam = formData.get('jam');
        reportData.mantek = formData.get('mantek');
        reportData.acknowledge = formData.get('acknowledge');
        reportData.kode = formData.get('kode');
        reportData.jadwal_dinas = formData.get('jadwal_dinas');

        let result;
        if (reportData.id) {
            result = await window.api.updateCnsdReport(reportData);
        } else {
            result = await window.api.saveCnsdReport(reportData);
        }
        
        if (result.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: result.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            loadAndRenderReports();
            closeModal();
        } else {
            Swal.fire({
                title: 'Gagal!',
                text: result.message,
                icon: 'error'
            });
        }
    });

    // --- INISIALISASI ---
    loadInitialData();
});