// renderer_cnsd.js

document.addEventListener('DOMContentLoaded', function() {
    // Pengecekan login (Auth Guard)
    const userSession = localStorage.getItem('loggedInUser');
    if (!userSession) {
        window.location.href = '../login.html';
        return;
    }
    
    const personnelDataKey = 'personnelDataCNSD';
    
    // Setup "database" personel lokal untuk dropdown tanda tangan
    const setupPersonnelDatabase = () => {
        const defaultPersonnel = [
            { id: 1, name: 'Agus Dhermawan', role: 'Manager', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0MEExMDAgODAgMCAwIDAgMTkwIDQwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNSAzMEExMDAgODAgMCAwIDEgMTgwIDMwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 2, name: 'Andi Wibowo', role: 'Manager', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAzNEMxMDAuNCAxOS43IDEzNS4xIDQyLjEgMTkwIDM1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==' },
            { id: 3, name: 'Efried N.P.', role: 'Manager', signature: '-' },
            { id: 4, name: '-', role: 'Manager', signature: '-' },
            { id: 5, name: 'Netty Septa C.', role: 'Manager', signature: '-' },
            { id: 6, name: 'Moch. Ichsan', role: 'Supervisor', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0NEM1MS45IDIxLjQgMTU0LjUgNjAuMyAxOTAgMzIiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 7, name: 'Nur Hukim', role: 'Supervisor', signature: '-' },
            { id: 8, name: 'Aditya Huzairi P.', role: 'Supervisor', signature: '-'},
            { id: 9, name: '-', role: 'Supervisor', signature: '-'},
            { id: 10, name: 'Khoirul M.A.', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAyNUM3My44IDU0LjcgODYuMSAxMS4xIDE5MCAzNCIgc3Ryb2tlPQiYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
            { id: 11, name: 'Argo Pragolo', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCA0NEMxMDAuNCAxOS43IDEzNS4xIDQyLjEgMTkwIDM1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==' },
            { id: 12, name: 'Tria Sabda Utama', role: 'Pelaksana', signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCAzN0M0Ni4yIDU2LjggMTM2LjUgNS44IDE5MCAzNCIgc3Ryb2tlPQiYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+' },
        ];
        if (!localStorage.getItem(personnelDataKey)) {
            localStorage.setItem(personnelDataKey, JSON.stringify(defaultPersonnel));
        }
    };
    setupPersonnelDatabase();
    
    const personnelData = JSON.parse(localStorage.getItem(personnelDataKey));
    const shiftData = { 'PAGI': '07.00 - 13.00', 'SIANG': '13.00 - 19.00', 'MALAM': '19.00 - 07.00' };

    // Ambil elemen dari HTML
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
    const tanggalInput = document.getElementById('tanggal'); 
    const pelaksanaTextarea = document.getElementById('shift-dinas-textarea');
    const woIdInput = document.getElementById('wo_id');

    const signatureSelects = {
        verify_manager: document.getElementById('verify_manager_select'),
        verify_supervisor: document.getElementById('verify_supervisor_select'),
        verify_pelaksana: document.getElementById('verify_pelaksana_select'),
    };
    
    const autoFillPelaksana = async () => {
        if (!tanggalInput || !shiftSelect || !pelaksanaTextarea) return;
        const selectedDate = tanggalInput.value;
        const selectedShift = shiftSelect.value.toUpperCase();
        const result = await window.api.getTechniciansBySchedule({ tanggal: selectedDate, dinas: selectedShift });
        if (result.success && result.data.length > 0) {
            const formattedNames = result.data.map((name, index) => `${index + 1}. ${name}`).join('\n');
            pelaksanaTextarea.value = formattedNames;
        } else {
            pelaksanaTextarea.value = '';
        }
    };

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
        const populate = (selectElement, personnelList) => {
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">-- Pilih Nama --</option>';
            personnelList.forEach(p => {
                selectElement.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            });
        };
        populate(signatureSelects.verify_manager, managers);
        populate(signatureSelects.verify_supervisor, supervisors);
        populate(signatureSelects.verify_pelaksana, pelaksana);
    };
    
    const updateSignatureImage = (selectElement, imgElementId) => {
        const selectedId = selectElement.value;
        const person = personnelData.find(p => p.id == selectedId);
        const imgElement = document.getElementById(imgElementId);
        if (imgElement) imgElement.src = person ? person.signature : '';
    };

    const showWoForm = (isEditing = false) => {
        woFormContainer.classList.remove('hidden');
        woListContainer.classList.add('hidden');
        maintenanceForm.reset();
        woIdInput.value = '';
        if (!isEditing) {
            Object.values(signatureSelects).forEach(sel => { if(sel) sel.value = "" });
            ['verify_manager_sig', 'verify_supervisor_sig', 'verify_pelaksana_sig'].forEach(id => {
                const img = document.getElementById(id);
                if (img) img.src = '';
            });
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            maintenanceForm.tanggal.value = `${year}-${month}-${day}`;
            const currentShift = getShiftByTime(now);
            shiftSelect.value = currentShift;
            jamDisplay.value = shiftData[currentShift];
            autoFillPelaksana(); 
        }
    };

    const showWoList = async () => {
        woFormContainer.classList.add('hidden');
        woListContainer.classList.remove('hidden');
        await renderWoTable();
    };
    
    const getStatusText = (status) => ({
        'selesai': 'Selesai', 'belum_selesai': 'Belum Selesai', 
        'lanjut_shift': 'Lanjut Shift', 'tidak_bisa': 'Tidak Bisa Dilaksanakan'
    }[status] || 'Baru');

    const renderWoTable = async () => {
        const result = await window.api.getCnsdWorkorders();
        if (!result.success) {
            woListContainer.innerHTML = '<div class="bg-white p-6 rounded-lg shadow text-center text-red-500">Gagal memuat data work order.</div>';
            return;
        }
        const workOrders = result.data;
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
                                    <td class="px-6 py-4 whitespace-nowrap">${wo.wo_id_custom}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${wo.tanggal ? new Date(wo.tanggal).toLocaleDateString('en-CA') : '-'}</td>
                                    <td class="px-6 py-4 max-w-sm truncate" title="${wo.deskripsi || ''}">${wo.deskripsi || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${getStatusText(wo.status_pelaksanaan)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <button onclick="editWorkOrder(${wo.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onclick="deleteWorkOrder(${wo.id})" class="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // MODIFIKASI: Menggunakan Swal.fire untuk notifikasi sukses dan error
    const saveWorkOrder = async () => {
        const formData = new FormData(maintenanceForm);
        let woData = Object.fromEntries(formData.entries());
        woData.output = Array.from(maintenanceForm.querySelectorAll('input[name="output"]:checked')).map(cb => cb.value);
        const lainnyaCheckbox = document.getElementById('out_lainnya_check');
        const lainnyaText = document.getElementById('out_lainnya_text').value.trim();
        if (lainnyaCheckbox.checked && lainnyaText !== '') {
            woData.output.push(lainnyaText);
        }
        delete woData.output_check;
        delete woData.output_lainnya;
        
        const result = await window.api.saveCnsdWorkorder(woData);
        if (result.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: result.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            showWoList();
        } else {
            Swal.fire({
                title: 'Error!',
                text: result.message,
                icon: 'error'
            });
        }
    };
    
    // MODIFIKASI: Menggunakan Swal.fire untuk notifikasi error
    window.editWorkOrder = async (id) => {
        const result = await window.api.getCnsdWorkorderById(id);
        if (!result.success || !result.data) {
            Swal.fire({
                title: 'Gagal!',
                text: 'Gagal mengambil data work order.',
                icon: 'error'
            });
            return;
        }
        
        const wo = result.data;
        showWoForm(true);
        for(const key in wo) {
            if (key === 'output' && wo[key]) {
                try {
                    const outputs = JSON.parse(wo[key]);
                    if (Array.isArray(outputs)) {
                        outputs.forEach(value => {
                            const standardCheckbox = document.querySelector(`input[name="output"][value="${value}"]`);
                            if(standardCheckbox) {
                                standardCheckbox.checked = true;
                            } else {
                                // Jika bukan checkbox standar, berarti ini data 'Lainnya'
                                document.getElementById('out_lainnya_check').checked = true;
                                document.getElementById('out_lainnya_text').value = value;
                            }
                        });
                    }
                } catch(e) { console.error("Error parsing output JSON:", e); }
            } else if (maintenanceForm.elements[key]) {
                const element = maintenanceForm.elements[key];
                if(element.type === 'radio') {
                     const radioToSelect = document.querySelector(`input[name="${key}"][value="${wo[key]}"]`);
                     if(radioToSelect) radioToSelect.checked = true;
                } else if (element.type === 'date' && wo[key]) {
                    element.value = new Date(wo[key]).toLocaleDateString('en-CA');
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
        saveWoBtn.textContent = 'Update';
    };
    
    // MODIFIKASI: Menggunakan Swal.fire untuk konfirmasi hapus
    window.deleteWorkOrder = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Work order yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleteResult = await window.api.deleteCnsdWorkorder(id);
                if(deleteResult.success) {
                    Swal.fire(
                        'Dihapus!',
                        'Work order berhasil dihapus.',
                        'success'
                    );
                    showWoList();
                } else {
                    Swal.fire(
                        'Gagal!',
                        deleteResult.message,
                        'error'
                    );
                }
            }
        });
    };

    // --- Event Listeners ---
    
    if(createNewWoBtn) createNewWoBtn.addEventListener('click', () => {
        saveWoBtn.textContent = 'Simpan';
        showWoForm();
    });
    if(viewWoListBtn) viewWoListBtn.addEventListener('click', showWoList);
    if(saveWoBtn) saveWoBtn.addEventListener('click', saveWorkOrder);
    if(printWoBtn) printWoBtn.addEventListener('click', () => window.print());
    if(cancelWoBtn) cancelWoBtn.addEventListener('click', showWoList);

    if (shiftSelect) {
        shiftSelect.addEventListener('change', (e) => {
            jamDisplay.value = shiftData[e.target.value] || '';
            autoFillPelaksana();
        });
    }
    
    if (tanggalInput) {
        tanggalInput.addEventListener('change', autoFillPelaksana);
    }

    Object.keys(signatureSelects).forEach(key => {
        const selectElement = signatureSelects[key];
        if (selectElement) {
            selectElement.addEventListener('change', (e) => {
                const imgId = `${key}_sig`;
                updateSignatureImage(e.target, imgId);
            });
        }
    });

    populateDropdowns();
    showWoList();
});