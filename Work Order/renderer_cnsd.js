// renderer_tfp.js

document.addEventListener('DOMContentLoaded', function() {
    // Pengecekan Login
    const userSession = localStorage.getItem('loggedInUser');
    if (!userSession) {
        window.location.href = '../login.html';
        return;
    }
    const currentUser = JSON.parse(userSession);
    
    // Konfigurasi khusus untuk TFP
    const personnelDataKey = 'personnelDataTFP';
    const workOrdersDataKey = 'workOrdersTFP';
    const woCounterKey = 'woCounterTFP';
    const woIdPrefix = 'WO-TFP-';

    // Setup "database" personel untuk TFP
    const setupPersonnelDatabase = () => {
        const defaultPersonnel = [
            { id: 1, name: 'Agus Dhermawan', role: 'Manager', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0MEExMDAgODAgMCAwIDAgMTkwIDQwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNSAzMEExMDAgODAgMCAwIDEgMTgwIDMwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 2, name: 'Andi Wibowo', role: 'Manager', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAzNEMxMDAuNCAxOS43IDEzNS4xIDQyLjEgMTkwIDM1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==' },
            { id: 3, name: 'Efried N.P.', role: 'Manager', signature: '-' },
            { id: 4, name: '-', role: 'Manager', signature: '-' },
            { id: 5, name: 'Netty Septa C.', role: 'Manager', signature: '-' },
            { id: 6, name: 'Priyoko', role: 'Supervisor', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0NEM1MS45IDIxLjQgMTU0LjUgNjAuMyAxOTAgMzIiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 7, name: 'Fajar Kusuma W..', role: 'Supervisor', signature: '-'},
            { id: 8, name: '-', role: 'Supervisor', signature: '-' },
            // PERBAIKAN TYPO: anme -> name
            { id: 9, name: 'Iqbal Mustika', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAyNUM3My44IDU0LjcgODYuMSAxMS4xIDE5MCAzNCIgc3Ryb2tlPQiYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 10, name: 'Fajar Nugroho', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0NEMxMDAuNCAxOS43IDEzNS4xIDQyLjEgMTkwIDM1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==' },
            { id: 11, name: 'Bian Prasetia H', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAzN0M0Ni4yIDU2LjggMTM2LjUgNS44IDE5MCAzNCIgc3Ryb2tlPQiYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
        ];
        if (!localStorage.getItem(personnelDataKey)) {
            localStorage.setItem(personnelDataKey, JSON.stringify(defaultPersonnel));
        }
    };

    setupPersonnelDatabase();
    // ... (Sisa kode sama persis dengan renderer_cnsd.js, 
    // hanya menggunakan variabel konfigurasi TFP)
    const personnelData = JSON.parse(localStorage.getItem(personnelDataKey));
    const shiftData = { 'PAGI': '07.00 - 13.00', 'SIANG': '13.00 - 19.00', 'MALAM': '19.00 - 07.00' };
    const createNewWoBtn = document.getElementById('create-new-wo');
    const viewWoListBtn = document.getElementById('view-wo-list');
    const woFormContainer = document.getElementById('wo-form-container');
    const woListContainer = document.getElementById('wo-list-container');
    const maintenanceForm = document.getElementById('maintenance-form');
    const saveWoBtn = document.getElementById('save-wo');
    const printWoBtn = document.getElementById('print-wo');
    const cancelWoBtn = document.getElementById('cancel-wo');
    const shiftSelect = document.getElementById('shift_select');
    const jamDisplay = document.getElementById('jam_display');
    const signatureSelects = {
        approval_manager: document.getElementById('approval_manager_select'),
        approval_supervisor: document.getElementById('approval_supervisor_select'),
        approval_pelaksana: document.getElementById('approval_pelaksana_select'),
        verify_manager: document.getElementById('verify_manager_select'),
        verify_supervisor: document.getElementById('verify_supervisor_select'),
        verify_pelaksana: document.getElementById('verify_pelaksana_select'),
    };
    let workOrders = JSON.parse(localStorage.getItem(workOrdersDataKey) || '[]');
    let woCounter = parseInt(localStorage.getItem(woCounterKey) || '1');
    const getShiftByTime = (date) => {
        const hour = date.getHours();
        if (hour >= 7 && hour < 13) return 'PAGI';
        if (hour >= 13 && hour < 19) return 'SIANG';
        return 'MALAM';
    };
    const populateDropdowns = () => {
        if (shiftSelect) {
            shiftSelect.innerHTML = Object.keys(shiftData).map(shift => `<option value="${shift}">${shift}</option>`).join('');
        }
        const managers = personnelData.filter(p => p.role === 'Manager');
        const supervisors = personnelData.filter(p => p.role === 'Supervisor');
        const pelaksana = personnelData.filter(p => p.role === 'Pelaksana');
        const populate = (selectElement, list) => {
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">-- Pilih Nama --</option>' + list.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        };
        populate(signatureSelects.approval_manager, managers);
        populate(signatureSelects.verify_manager, managers);
        populate(signatureSelects.approval_supervisor, supervisors);
        populate(signatureSelects.verify_supervisor, supervisors);
        populate(signatureSelects.approval_pelaksana, pelaksana);
        populate(signatureSelects.verify_pelaksana, pelaksana);
    };
    const updateSignatureImage = (selectElement, imgElementId) => {
        const selectedId = selectElement.value;
        const person = personnelData.find(p => p.id == selectedId);
        const imgElement = document.getElementById(imgElementId);
        if (imgElement) imgElement.src = person && person.signature ? person.signature : '';
    };
    const showWoForm = (isEditing = false) => {
        woFormContainer.classList.remove('hidden');
        woListContainer.classList.add('hidden');
        if (!isEditing) {
            maintenanceForm.reset();
            Object.values(signatureSelects).forEach(sel => { if(sel) sel.value = ""; });
            ['approval_manager_sig', 'approval_supervisor_sig', 'approval_pelaksana_sig', 'verify_manager_sig', 'verify_supervisor_sig', 'verify_pelaksana_sig'].forEach(id => {
                const img = document.getElementById(id);
                if (img) img.src = '';
            });
            const now = new Date();
            maintenanceForm.tanggal.value = now.toISOString().split('T')[0];
            const currentShift = getShiftByTime(now);
            shiftSelect.value = currentShift;
            jamDisplay.value = shiftData[currentShift];
        }
    };
    const showWoList = () => {
        woFormContainer.classList.add('hidden');
        woListContainer.classList.remove('hidden');
        renderWoTable();
    };
    const getStatusText = (status) => ({
        'selesai': 'Selesai', 'belum_selesai': 'Belum Selesai', 
        'lanjut_shift': 'Lanjut Shift', 'tidak_bisa': 'Tidak Bisa Dilaksanakan'
    }[status] || 'Baru');
    const renderWoTable = () => {
        if (!woListContainer) return;
        if (workOrders.length === 0) {
            woListContainer.innerHTML = '<div class="bg-white p-6 rounded-lg shadow text-center text-gray-500">Belum ada work order yang dibuat.</div>';
            return;
        }
        woListContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b"><h3 class="text-lg font-semibold">Daftar Work Order</h3></div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. WO</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${workOrders.map(wo => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">${wo.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${wo.tanggal}</td>
                                    <td class="px-6 py-4 max-w-sm truncate" title="${wo.deskripsi || ''}">${wo.deskripsi || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${getStatusText(wo.status_pelaksanaan)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <button onclick="editWorkOrder('${wo.id}')" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onclick="deleteWorkOrder('${wo.id}')" class="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };
    const saveWorkOrder = () => {
        const formData = new FormData(maintenanceForm);
        let woData = Object.fromEntries(formData.entries());
        woData.output = Array.from(maintenanceForm.querySelectorAll('input[name="output"]:checked')).map(cb => cb.value);
        const editingId = maintenanceForm.dataset.editingId;
        if (editingId) {
            const woIndex = workOrders.findIndex(w => w.id === editingId);
            if (woIndex !== -1) workOrders[woIndex] = { ...workOrders[woIndex], ...woData };
        } else {
            woData.id = `${woIdPrefix}${woCounter.toString().padStart(4, '0')}`;
            workOrders.push(woData);
            localStorage.setItem(woCounterKey, ++woCounter);
        }
        localStorage.setItem(workOrdersDataKey, JSON.stringify(workOrders));
        saveWoBtn.textContent = 'Tersimpan!';
        setTimeout(() => {
            saveWoBtn.textContent = 'Simpan';
            showWoList();
        }, 1500);
    };
    window.editWorkOrder = (woId) => {
        const wo = workOrders.find(w => w.id === woId);
        if (wo) {
            maintenanceForm.reset();
            for(const key in wo) {
                if (key === 'output' && Array.isArray(wo[key])) {
                    wo[key].forEach(value => {
                        const checkbox = document.getElementById(`out_${value}`);
                        if(checkbox) checkbox.checked = true;
                    });
                } else if (maintenanceForm.elements[key]) {
                    const element = maintenanceForm.elements[key];
                    if(element.type === 'radio') {
                         if(document.querySelector(`input[name="${key}"][value="${wo[key]}"]`)) {
                            document.querySelector(`input[name="${key}"][value="${wo[key]}"]`).checked = true;
                         }
                    } else {
                         element.value = wo[key];
                    }
                }
            }
            if (wo.shift) {
                shiftSelect.value = wo.shift;
                jamDisplay.value = shiftData[wo.shift] || '';
            }
            Object.keys(signatureSelects).forEach(key => {
                if(wo[key] && signatureSelects[key]) {
                    signatureSelects[key].value = wo[key];
                    updateSignatureImage(signatureSelects[key], `${key}_sig`);
                }
            });
            maintenanceForm.dataset.editingId = woId;
            saveWoBtn.textContent = 'Update';
            showWoForm(true);
        }
    };
    window.deleteWorkOrder = (woId) => {
        if(confirm('Yakin ingin menghapus Work Order ini?')) {
            workOrders = workOrders.filter(w => w.id !== woId);
            localStorage.setItem(workOrdersDataKey, JSON.stringify(workOrders));
            renderWoTable();
        }
    };
    createNewWoBtn.addEventListener('click', () => {
        maintenanceForm.removeAttribute('data-editing-id');
        saveWoBtn.textContent = 'Simpan';
        showWoForm();
    });
    viewWoListBtn.addEventListener('click', showWoList);
    saveWoBtn.addEventListener('click', saveWorkOrder);
    printWoBtn.addEventListener('click', () => window.print());
    cancelWoBtn.addEventListener('click', showWoList);
    if (shiftSelect) {
        shiftSelect.addEventListener('change', (e) => jamDisplay.value = shiftData[e.target.value] || '');
    }
    Object.keys(signatureSelects).forEach(key => {
        const selectElement = signatureSelects[key];
        if (selectElement) {
            selectElement.addEventListener('change', (e) => {
                const imgId = `${key}_sig`;
                updateSignatureImage(e.target, imgId);
                if (key.startsWith('approval_')) {
                    const role = key.split('_')[1];
                    const verifySelectKey = `verify_${role}`;
                    const verifyImgId = `verify_${role}_sig`;
                    if (signatureSelects[verifySelectKey]) {
                        signatureSelects[verifySelectKey].value = e.target.value;
                        updateSignatureImage(signatureSelects[verifySelectKey], verifyImgId);
                    }
                }
            });
        }
    });
    populateDropdowns();
    showWoList();
});