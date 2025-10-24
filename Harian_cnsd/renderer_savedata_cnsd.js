// renderer_savedata_cnsd.js

document.addEventListener('DOMContentLoaded', function() {
    // Auth Guard
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = '../login.html';
        return;
    }

    // --- State ---
    let currentDataId = null;
    let equipmentNames = [];
    let selectedMonthlyEquipment = [];
    // --- Elemen Modal dan Konten ---
    const dataModal = document.getElementById('dataModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const modalTitle = document.getElementById('modalTitle');
    const detailModal = document.getElementById('detailModal');
    const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    const detailContent = document.getElementById('detailContent'); 
    const activityDetailContent = document.getElementById('activityDetailContent'); 
    const pdfLinkContainer = document.getElementById('pdfLinkContainer'); 
    const scheduleModal = document.getElementById('scheduleModal');
    const closeScheduleModalBtn = document.getElementById('closeScheduleModalBtn');
    const scheduleContent = document.getElementById('scheduleContent');
    const cardContainer = document.getElementById('card-container');
    const noDataMessage = document.getElementById('no-data-message');

    // --- Elemen Modal Checklist (MODIFIKASI) ---
    const equipmentChecklistModal = document.getElementById('equipmentChecklistModal');
    const closeChecklistModalBtn = document.getElementById('closeChecklistModalBtn');
    const saveChecklistBtn = document.getElementById('saveChecklistBtn');
    const equipmentChecklistContainer = document.getElementById('equipment-checklist-container');
    const selectAllEquipmentCheckbox = document.getElementById('select-all-equipment'); 

    // --- Elemen Form ---
    const harianBtn = document.getElementById('harianBtn');
    const bulananBtn = document.getElementById('bulananBtn');
    const harianForm = document.getElementById('harianForm');
    const bulananForm = document.getElementById('bulananForm');
    const dinasButtons = document.querySelectorAll('.dinas-btn');
    const printToggleHarian = document.getElementById('print-toggle-harian');
    const printToggleBulanan = document.getElementById('print-toggle-bulanan');
    const namaAlatDisplay = document.getElementById('nama-alat-display');

    // --- Fungsi ---
    const closeModal = (modal) => modal.classList.add('hidden');
    const openModal = (modal) => modal.classList.remove('hidden');

    const setActiveButton = (activeBtn, inactiveBtn) => {
        activeBtn.classList.add('bg-airnav-blue', 'text-white');
        activeBtn.classList.remove('text-gray-700', 'bg-transparent');
        inactiveBtn.classList.remove('bg-airnav-blue', 'text-white');
        inactiveBtn.classList.add('text-gray-700');
    };

    const handleToggleButton = (button, state) => {
        const isActive = state === 'YA';
        button.textContent = isActive ? 'YA' : 'TIDAK';
        button.classList.toggle('bg-airnav-blue', isActive);
        button.classList.toggle('text-white', isActive);
        button.classList.toggle('bg-gray-200', !isActive);
        button.classList.toggle('text-gray-700', !isActive);
    };

    const formatDateForDisplay = (dateInput, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) => {
        if (!dateInput) return '-';
        let dateObject;
        try {
            dateObject = new Date(dateInput);
             if (isNaN(dateObject.getTime())) throw new Error("Invalid initial date");
        } catch (e) {
             console.error("Error parsing initial date:", dateInput, e);
             return 'Invalid Date';
        }
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const day = dateObject.getDate();
        try {
            if (options.weekday) {
                const dateForLocale = new Date(year, month, day);
                return dateForLocale.toLocaleDateString('id-ID', options);
            } else {
                const displayDay = String(day).padStart(2, '0');
                const displayMonth = String(month + 1).padStart(2, '0');
                return `${displayDay}/${displayMonth}/${year}`;
            }
        } catch (e) {
            console.error("Error formatting date display:", dateInput, e);
            return 'Invalid Date';
        }
    };

    const renderCard = (data) => {
        const card = document.createElement('div');
        card.className = 'bg-white text-gray-800 border p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors duration-200';

        Object.keys(data).forEach(key => {
            if ((key === 'tanggal' || key === 'sampai') && data[key]) {
                try {
                    const dateObj = new Date(data[key]);
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    card.dataset[key] = `${year}-${month}-${day}`;
                } catch (e) {
                    console.error("Gagal format tanggal di renderCard:", data[key], e);
                    card.dataset[key] = data[key]; 
                }
            } else {
                card.dataset[key] = data[key];
            }
        });

        const displayDate = formatDateForDisplay(data.tanggal);
        const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        const dateForFilename = card.dataset.tanggal;
        const [fnYear, fnMonth, fnDay] = dateForFilename ? dateForFilename.split('-') : ['ERR', 'ERR', 'ERR'];

        let displayName = 'Laporan Bulanan';
        if (data.type === 'Harian') {
            displayName = data.mantek;
        } else {
            // --- PERBAIKAN 1: Cek "ALL Equipment" ---
            if (data.nama_alat === "ALL Equipment") {
                displayName = 'Semua Alat';
            } else {
                try {
                    const alatArray = JSON.parse(data.nama_alat || '[]');
                    if (alatArray.length > 0) {
                        displayName = alatArray[0] + (alatArray.length > 1 ? ` (+${alatArray.length - 1})` : '');
                    }
                } catch (e) { displayName = 'Laporan Bulanan'; }
            }
            // --- AKHIR PERBAIKAN 1 ---
        }
        
        const fileName = `${data.grup}.${data.type === 'Harian' ? data.dinas : 'BULANAN'}.${fnDay}.ALL.${fnYear}_${timeStr}.pdf`.toUpperCase();
        card.dataset.fileName = fileName;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="text-sm font-medium">${displayDate}</span>
                <span class="text-sm font-semibold text-airnav-blue">${displayName}</span>
            </div>
            <div class="flex justify-between items-end mt-4">
                <p class="text-xs text-gray-500 break-all pr-4">${fileName}</p>
                <div class="flex space-x-3 text-gray-500">
                    <svg class="schedule-icon w-4 h-4 cursor-pointer hover:text-airnav-blue" title="Detail Jadwal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <svg class="document-icon w-4 h-4 cursor-pointer hover:text-airnav-blue" title="Detail Laporan & Kegiatan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <svg class="edit-icon w-4 h-4 cursor-pointer hover:text-airnav-blue" title="Edit" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <svg class="delete-icon w-4 h-4 cursor-pointer hover:text-airnav-red" title="Hapus" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </div>
            </div>
        `;
        cardContainer.appendChild(card);
    };

    const loadAndRenderData = async () => {
        const result = await window.api.getCnsdSaveData();
        cardContainer.innerHTML = '';
        if (result.success && result.data.length > 0) {
            noDataMessage.classList.add('hidden');
            result.data.forEach(item => renderCard(item));
        } else {
            cardContainer.appendChild(noDataMessage);
            noDataMessage.classList.remove('hidden');
        }
    };

    const fetchAndDisplayActivityDetails = async (tanggal, targetElementId, dinasToFilter = null) => {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.error(`Target elemen #${targetElementId} tidak ditemukan.`);
            return;
        }
        targetElement.innerHTML = '<p class="italic text-gray-500">Memuat kegiatan...</p>';

        try {
            const result = await window.api.getCnsdActivitiesByDate(tanggal); 
            if (result.success && result.data.length > 0) {
                const filteredData = dinasToFilter 
                    ? result.data.filter(activity => activity.dinas && activity.dinas.toUpperCase() === dinasToFilter.toUpperCase()) 
                    : result.data;
                if (filteredData.length === 0) {
                     targetElement.innerHTML = `<p class="italic text-gray-500">Tidak ada kegiatan ditemukan untuk dinas ${dinasToFilter} tanggal ini.</p>`;
                     return;
                }
                let activityHTML = '<div class="space-y-4">';
                filteredData.forEach((activity, index) => {
                    const teknisiArray = activity.teknisi ? (typeof activity.teknisi === 'string' ? JSON.parse(activity.teknisi) : activity.teknisi) : [];
                    const lampiranArray = activity.lampiran ? (typeof activity.lampiran === 'string' ? JSON.parse(activity.lampiran) : activity.lampiran) : [];

                    activityHTML += `<div class="${index > 0 ? 'pt-4 border-t border-gray-200' : ''}">`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Kode:</strong> ${activity.kode || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Dinas:</strong> ${activity.dinas || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Mulai:</strong> ${activity.waktu_mulai || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Selesai:</strong> ${activity.waktu_selesai || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Alat:</strong> ${activity.alat || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Permasalahan:</strong> ${activity.permasalahan || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Tindakan:</strong> ${activity.tindakan || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Hasil:</strong> ${activity.hasil || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Status:</strong> ${activity.status || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Teknisi:</strong> ${teknisiArray.join(', ') || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Putus:</strong> ${activity.waktu_terputus || '-'}</p>`;
                    activityHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Lampiran:</strong> ${lampiranArray.length > 0 ? lampiranArray.length + ' file' : '-'}</p>`;
                    activityHTML += `</div>`;
                });
                activityHTML += '</div>';
                targetElement.innerHTML = activityHTML;
            } else if (result.success) {
                const message = dinasToFilter 
                    ? `Tidak ada kegiatan ditemukan untuk dinas ${dinasToFilter} tanggal ini.`
                    : 'Tidak ada kegiatan ditemukan untuk tanggal ini.';
                targetElement.innerHTML = `<p class="italic text-gray-500">${message}</p>`;
            } else {
                 targetElement.innerHTML = `<p class="text-red-500">Gagal memuat kegiatan: ${result.message || 'Error tidak diketahui'}</p>`;
            }
        } catch (error) {
            console.error("Gagal mengambil detail kegiatan:", error);
            targetElement.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat memuat kegiatan.</p>';
        }
    };

    const showDetailModal = (data) => {
        const modalTitle = document.getElementById('detailModalTitle');
        const reportSection = document.getElementById('reportDetailSection');
        const activitySection = document.getElementById('activityDetailSection');
        modalTitle.textContent = 'Detail Laporan';
        reportSection.style.display = 'block';
        activitySection.style.display = 'block';

        let reportContentHTML = '';
        if (data.type === 'Harian') {
            reportContentHTML = `
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Tipe:</strong> ${data.type}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Tanggal:</strong> ${formatDateForDisplay(data.tanggal)}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Dinas:</strong> ${data.dinas}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Mantek:</strong> ${data.mantek}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Print:</strong> ${data.print}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Group:</strong> ${data.grup}</p>`;
        } else {
             let alatDisplay = '-';
             
             // --- PERBAIKAN 2: Cek "ALL Equipment" ---
             if (data.nama_alat === "ALL Equipment") {
                alatDisplay = 'Semua Alat';
             } else {
                 try {
                    const alatArray = JSON.parse(data.nama_alat || '[]');
                    if (alatArray.length > 0) {
                        alatDisplay = alatArray.join(', ');
                    }
                 } catch(e) {}
             }
             // --- AKHIR PERBAIKAN 2 ---

             const tanggalMulai = formatDateForDisplay(data.tanggal);
             const tanggalSelesai = data.sampai ? formatDateForDisplay(data.sampai) : '...';
             const periode = `${tanggalMulai} - ${tanggalSelesai}`;

             reportContentHTML = `
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Tipe:</strong> ${data.type}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Nama Alat:</strong> ${alatDisplay}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Periode:</strong> ${periode}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Print:</strong> ${data.print}</p>
                <p class="text-base"><strong class="font-medium text-gray-500 w-24 inline-block">Group:</strong> ${data.grup}</p>`;
        }
        detailContent.innerHTML = reportContentHTML;

        if (data.print === 'YA') { // Jika print = YA, baru tampilkan link
            const oldLink = document.getElementById('generatePdfLink');
            if (oldLink) oldLink.replaceWith(oldLink.cloneNode(true)); // Remove old event listener

            pdfLinkContainer.innerHTML = `<a href="#" id="generatePdfLink" class="inline-flex items-center text-indigo-600 hover:underline"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>Generate Laporan PDF</a>`;
            
            document.getElementById('generatePdfLink').addEventListener('click', async (e) => {
                e.preventDefault();
                Swal.fire({ title: 'Membuat PDF...', text: 'Mohon tunggu', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
                
                let result;
                if (data.type === 'Harian') {
                    result = await window.api.generateCnsdReportPdf({
                        date: data.tanggal,
                        shift: data.dinas,
                        mantekName: data.mantek,
                        reportType: data.type
                    });
                } else { // Ini untuk laporan Bulanan
                    result = await window.api.generateCnsdMonthlyReportPdf({
                        startDate: data.tanggal,
                        endDate: data.sampai || data.tanggal, // Jika 'sampai' kosong, anggap 1 hari
                        group: data.grup,
                        namaAlat: data.nama_alat
                    });
                }
                
                Swal.close();
                if (result.success) {
                    const openResult = await window.api.openPdf(result.filePath);
                    if (!openResult.success) Swal.fire('Gagal Membuka PDF', openResult.message, 'error');
                } else {
                    Swal.fire('Gagal Membuat PDF', result.message, 'error');
                }
            });
            pdfLinkContainer.style.display = 'block';
        } else {
             pdfLinkContainer.innerHTML = '';
             pdfLinkContainer.style.display = 'none';
        }

        if (data.type === 'Harian') {
            activitySection.style.display = 'block';
            const dinasFilter = data.dinas;
            fetchAndDisplayActivityDetails(data.tanggal, 'activityDetailContent', dinasFilter);
        } else { 
            activitySection.style.display = 'block';
            fetchAndDisplayMonthlyActivities(data.tanggal, data.sampai, 'activityDetailContent');
        }

        openModal(detailModal);
    };

    const showScheduleModal = (data) => {
        const titleElement = scheduleModal.querySelector('h2');
        if (titleElement) titleElement.textContent = 'Detail Jadwal';
        let contentHTML = '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const tanggal = formatDateForDisplay(data.tanggal, options);

        if (data.type === 'Harian') {
            contentHTML = `<p class="text-base"><strong class="font-medium text-gray-500 w-32 inline-block">Tipe Laporan:</strong> Laporan Harian</p><p class="text-base"><strong class="font-medium text-gray-500 w-32 inline-block">Tanggal:</strong> ${tanggal}</p>`;
        } else {
            const sampai = data.sampai ? formatDateForDisplay(data.sampai, options) : 'Tidak ditentukan';
            contentHTML = `<p class="text-base"><strong class="font-medium text-gray-500 w-32 inline-block">Tipe Laporan:</strong> Laporan Bulanan</p><p class="text-base"><strong class="font-medium text-gray-500 w-32 inline-block">Dari Tanggal:</strong> ${tanggal}</p><p class="text-base"><strong class="font-medium text-gray-500 w-32 inline-block">Sampai Tanggal:</strong> ${sampai}</p>`;
        }
        contentHTML += `<hr class="my-3 border-gray-200"><h4 class="font-semibold mb-2">Jadwal Dinas Tanggal Ini:</h4><div id="schedule-details-content" class="text-xs space-y-2">Memuat jadwal...</div>`;
        scheduleContent.innerHTML = contentHTML;
        openModal(scheduleModal);
    };

    const showActivityOnlyModal = (data) => {
        const titleElement = scheduleModal.querySelector('h2');
        if (titleElement) titleElement.textContent = 'Detail Kegiatan';
        scheduleContent.innerHTML = `<div id="standalone-activity-content"><p class="italic text-gray-500">Memuat kegiatan...</p></div>`;
        openModal(scheduleModal);
        
        if (data.type === 'Harian') {
            const dinasFilter = data.dinas;
            fetchAndDisplayActivityDetails(data.tanggal, 'standalone-activity-content', dinasFilter);
        } else { 
            fetchAndDisplayMonthlyActivities(data.tanggal, data.sampai, 'standalone-activity-content');
        }
    };

    const fetchAndDisplayMonthlyActivities = async (startDate, endDate, targetElementId) => {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.error(`Target elemen #${targetElementId} tidak ditemukan.`);
            return;
        }
        targetElement.innerHTML = '<p class="italic text-gray-500">Memuat kegiatan bulanan...</p>';

        try {
            const result = await window.api.getCnsdActivitiesByDateRange(startDate, endDate || startDate);

            if (result.success && result.data.length > 0) {
                const activitiesByDate = result.data.reduce((acc, activity) => {
                    const date = activity.tanggal; 
                    const dateStr = new Date(date).toLocaleDateString('en-CA'); 
                    if (!acc[dateStr]) {
                        acc[dateStr] = [];
                    }
                    acc[dateStr].push(activity);
                    return acc;
                }, {});

                let html = '<div class="space-y-2">';
                Object.keys(activitiesByDate).sort().forEach(dateStr => { 
                    const activities = activitiesByDate[dateStr];
                    const displayDate = formatDateForDisplay(dateStr, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    
                    let detailHtml = '<div class="space-y-4 mt-2">';
                    activities.forEach((activity, index) => {
                        const teknisiArray = activity.teknisi ? (typeof activity.teknisi === 'string' ? JSON.parse(activity.teknisi) : activity.teknisi) : [];
                        const lampiranArray = activity.lampiran ? (typeof activity.lampiran === 'string' ? JSON.parse(activity.lampiran) : activity.lampiran) : [];
                        
                        detailHtml += `<div class="${index > 0 ? 'pt-4 border-t-2 border-gray-300' : ''}">`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Kode:</strong> ${activity.kode || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Dinas:</strong> ${activity.dinas || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Mulai:</strong> ${activity.waktu_mulai || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Selesai:</strong> ${activity.waktu_selesai || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Alat:</strong> ${activity.alat || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Permasalahan:</strong> ${activity.permasalahan || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Tindakan:</strong> ${activity.tindakan || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Hasil:</strong> ${activity.hasil || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Status:</strong> ${activity.status || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Teknisi:</strong> ${teknisiArray.join(', ') || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Waktu Putus:</strong> ${activity.waktu_terputus || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-40 inline-block">Lampiran:</strong> ${lampiranArray.length > 0 ? lampiranArray.length + ' file' : '-'}</p>`;
                        detailHtml += `</div>`;
                    });
                    detailHtml += '</div>';

                    html += `
                        <div class="monthly-activity-card border rounded-md">
                            <button class="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span class="font-semibold text-airnav-blue">${displayDate}</span>
                                <span class="text-sm text-gray-600">${activities.length} kegiatan</span>
                            </button>
                            <div class="monthly-activity-detail p-4 border-t border-gray-200 hidden max-h-96 overflow-y-auto">
                                ${detailHtml}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                targetElement.innerHTML = html;

                targetElement.querySelectorAll('.monthly-activity-card button').forEach(button => {
                    button.addEventListener('click', () => {
                        const detailElement = button.nextElementSibling;
                        detailElement.classList.toggle('hidden');
                    });
                });

            } else if (result.success) {
                targetElement.innerHTML = '<p class="italic text-gray-500">Tidak ada kegiatan ditemukan untuk rentang tanggal ini.</p>';
            } else {
                targetElement.innerHTML = `<p class="text-red-500">Gagal memuat kegiatan: ${result.message || 'Error tidak diketahui'}</p>`;
            }
        } catch (error) {
            console.error("Gagal mengambil detail kegiatan bulanan:", error);
            targetElement.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat memuat kegiatan.</p>';
        }
    };

    const fetchAndDisplayScheduleDetails = async (tanggal, dinasToFilter = null) => {
        const scheduleDetailsContent = document.getElementById('schedule-details-content');
        if (!scheduleDetailsContent) {
            console.error("Element #schedule-details-content tidak ditemukan");
            return;
        }
        
        scheduleDetailsContent.innerHTML = '<p class="text-gray-500 italic">Memuat jadwal...</p>';

        try {
            const result = await window.api.getCnsdScheduleByDate(tanggal);

            if (result.success && result.data.length > 0) {
                
                const filteredData = dinasToFilter
                    ? result.data.filter(schedule => schedule.dinas && schedule.dinas.toUpperCase() === dinasToFilter.toUpperCase())
                    : result.data;

                if (filteredData.length === 0) {
                     const message = dinasToFilter
                         ? `Tidak ada jadwal dinas ditemukan untuk dinas ${dinasToFilter} tanggal ini.`
                         : 'Tidak ada jadwal dinas ditemukan untuk tanggal ini.';
                     scheduleDetailsContent.innerHTML = `<p class="text-gray-500 italic">${message}</p>`;
                     return;
                }

                let scheduleHTML = '<div class="space-y-3">';
                filteredData.forEach(shift => {
                    scheduleHTML += `<div class="p-2 border rounded bg-gray-50">`;
                    scheduleHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">ID Jadwal:</strong> ${shift.schedule_id_custom || '-'}</p>`;
                    scheduleHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Dinas:</strong> ${shift.dinas}</p>`;
                    for(let i=1; i<=6; i++){
                        if(shift[`teknisi_${i}`]) {
                            scheduleHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Teknisi ${i}:</strong> ${shift[`teknisi_${i}`]}</p>`;
                        }
                    }
                    scheduleHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Kode:</strong> ${shift.kode || '-'}</p>`;
                    scheduleHTML += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Grup:</strong> ${shift.grup || '-'}</p>`;
                    scheduleHTML += `</div>`;
                });
                scheduleHTML += '</div>';
                scheduleDetailsContent.innerHTML = scheduleHTML;
            } else if (result.success) { // Kalo sukses tapi datanya 0
                const message = dinasToFilter
                    ? `Tidak ada jadwal dinas ditemukan untuk dinas ${dinasToFilter} tanggal ini.`
                    : 'Tidak ada jadwal dinas ditemukan untuk tanggal ini.';
                scheduleDetailsContent.innerHTML = `<p class="text-gray-500 italic">${message}</p>`;
            } else { // Kalo API-nya yang error
                 scheduleDetailsContent.innerHTML = `<p class="text-red-500">${result.message || 'Gagal mengambil data jadwal.'}</p>`;
            }
        } catch (error) {
            console.error("Gagal mengambil detail jadwal:", error);
            scheduleDetailsContent.innerHTML = '<p class="text-red-500">Gagal memuat jadwal.</p>';
        }
    };

    const fetchAndDisplayMonthlySchedules = async (startDate, endDate, targetElementId) => {
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.error(`Target elemen #${targetElementId} tidak ditemukan.`);
            return;
        }
        targetElement.innerHTML = '<p class="italic text-gray-500">Memuat jadwal bulanan...</p>';

        try {
            // 1. Panggil API baru kita
            const result = await window.api.getCnsdScheduleByDateRange(startDate, endDate || startDate);

            if (result.success && result.data.length > 0) {
                // 2. Kelompokkan data berdasarkan tanggal
                const schedulesByDate = result.data.reduce((acc, schedule) => {
                    const date = schedule.tanggal;
                    const dateStr = new Date(date).toLocaleDateString('en-CA');
                    if (!acc[dateStr]) {
                        acc[dateStr] = [];
                    }
                    acc[dateStr].push(schedule);
                    return acc;
                }, {});

                // 3. Render card harian yang bisa di-klik
                let html = '<div class="space-y-2">';
                Object.keys(schedulesByDate).sort().forEach(dateStr => {
                    const schedules = schedulesByDate[dateStr]; // Ini array [ {dinas: PAGI...}, {dinas: SIANG...} ]
                    const displayDate = formatDateForDisplay(dateStr, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    
                    // Buat HTML detail untuk card ini
                    let detailHtml = '<div class="space-y-4 mt-2">';
                    schedules.forEach((shift, index) => { // 'shift' adalah satu objek jadwal
                        // Pakai garis tebal pemisah
                        detailHtml += `<div class="${index > 0 ? 'pt-4 border-t-2 border-gray-300' : ''}">`; 
                        detailHtml += `<p class="text-base"><strong class="font-medium text-airnav-blue">${shift.dinas}</strong></p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">ID Jadwal:</strong> ${shift.schedule_id_custom || '-'}</p>`;
                        for(let i=1; i<=6; i++){
                            if(shift[`teknisi_${i}`]) {
                                detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Teknisi ${i}:</strong> ${shift[`teknisi_${i}`]}</p>`;
                            }
                        }
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Kode:</strong> ${shift.kode || '-'}</p>`;
                        detailHtml += `<p class="text-base"><strong class="font-medium text-gray-600 w-24 inline-block">Grup:</strong> ${shift.grup || '-'}</p>`;
                        detailHtml += `</div>`;
                    });
                    detailHtml += '</div>';

                    // Buat card-nya
                    html += `
                        <div class="monthly-activity-card border rounded-md">
                            <button class="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span class="font-semibold text-airnav-blue">${displayDate}</span>
                                <span class="text-sm text-gray-600">${schedules.length} dinas</span>
                            </button>
                            <div class="monthly-activity-detail p-4 border-t border-gray-200 hidden max-h-96 overflow-y-auto">
                                ${detailHtml}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                targetElement.innerHTML = html;

                // 4. Tambahin click listener untuk buka/tutup card
                targetElement.querySelectorAll('.monthly-activity-card button').forEach(button => {
                    button.addEventListener('click', () => {
                        const detailElement = button.nextElementSibling;
                        detailElement.classList.toggle('hidden');
                    });
                });

            } else if (result.success) {
                targetElement.innerHTML = '<p class="italic text-gray-500">Tidak ada jadwal ditemukan untuk rentang tanggal ini.</p>';
            } else {
                targetElement.innerHTML = `<p class="text-red-500">Gagal memuat jadwal: ${result.message || 'Error tidak diketahui'}</p>`;
            }
        } catch (error) {
            console.error("Gagal mengambil detail jadwal bulanan:", error);
            targetElement.innerHTML = '<p class="text-red-500">Terjadi kesalahan saat memuat jadwal.</p>';
        }
    };

    const populateEquipmentChecklistModal = () => {
        equipmentChecklistContainer.innerHTML = '';
        if (equipmentNames.length === 0) {
            equipmentChecklistContainer.innerHTML = '<p class="text-red-500">Daftar peralatan gagal dimuat.</p>';
            return;
        }

        let allChecked = true; 
        equipmentNames.forEach(name => {
            const isChecked = selectedMonthlyEquipment.includes(name);
            if (!isChecked) {
                allChecked = false; 
            }
            equipmentChecklistContainer.innerHTML += `
                <label class="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" value="${name}" ${isChecked ? 'checked' : ''}>
                    <span class="text-gray-700">${name}</span>
                </label>
            `;
        });
        
        selectAllEquipmentCheckbox.checked = allChecked; 
    };

    const openEquipmentChecklistModal = () => {
        populateEquipmentChecklistModal();
        openModal(equipmentChecklistModal);
    };

    const showDataModal = (data = null) => {
        const isEdit = data !== null;
        currentDataId = isEdit ? data.id : null;
        modalTitle.textContent = isEdit ? 'Edit Data' : 'Tambah Data';
        const todayStr = new Date().toLocaleDateString('en-CA');

        selectedMonthlyEquipment = [];
        namaAlatDisplay.value = 'Pilih Alat...';

        const isHarian = !isEdit || data.type === 'Harian';
        if (isHarian) { 
            setActiveButton(harianBtn, bulananBtn); 
            harianForm.classList.remove('hidden'); 
            bulananForm.classList.add('hidden'); 
        } else { 
            setActiveButton(bulananBtn, harianBtn); 
            bulananForm.classList.remove('hidden'); 
            harianForm.classList.add('hidden'); 
        }

        document.getElementById('tanggal-harian').value = (isEdit && data.type === 'Harian') ? new Date(data.tanggal).toLocaleDateString('en-CA') : todayStr;
        const activeDinasValue = (isEdit && data.type === 'Harian') ? data.dinas : 'MALAM';
        dinasButtons.forEach(btn => {
            const isActive = btn.textContent === activeDinasValue;
            btn.classList.toggle('bg-airnav-blue', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('text-gray-700', !isActive);
        });
        document.getElementById('mantek').value = (isEdit && data.type === 'Harian') ? data.mantek : '';
        handleToggleButton(printToggleHarian, (isEdit && data.type === 'Harian') ? data.print : 'YA');
        document.getElementById('group-harian').value = (isEdit && data.type === 'Harian') ? data.grup : 'CNSD';

        if (isEdit && data.type === 'Bulanan') {
            
            // --- PERBAIKAN 3: Cek "ALL Equipment" ---
            if (data.nama_alat === "ALL Equipment") {
                selectedMonthlyEquipment = [...equipmentNames]; // Salin semua nama alat
            } else {
                try {
                    selectedMonthlyEquipment = JSON.parse(data.nama_alat || '[]');
                } catch (e) {
                    console.error("Gagal parse nama_alat (Bulanan):", data.nama_alat);
                    selectedMonthlyEquipment = [];
                }
            }
            // --- AKHIR PERBAIKAN 3 ---
            
            if (selectedMonthlyEquipment.length === equipmentNames.length && equipmentNames.length > 0) {
                 namaAlatDisplay.value = 'Semua Alat';
            } else if (selectedMonthlyEquipment.length > 0) {
                namaAlatDisplay.value = `${selectedMonthlyEquipment.length} alat dipilih`;
            } else {
                namaAlatDisplay.value = 'Pilih Alat...';
            }
            
            document.getElementById('tanggal-bulanan').value = new Date(data.tanggal).toLocaleDateString('en-CA');
            document.getElementById('sampai').value = data.sampai ? new Date(data.sampai).toLocaleDateString('en-CA') : '';
            handleToggleButton(printToggleBulanan, data.print);
            document.getElementById('group-bulanan').value = data.grup;
        } else {
            namaAlatDisplay.value = 'Pilih Alat...';
            document.getElementById('tanggal-bulanan').value = todayStr;
            document.getElementById('sampai').value = '';
            handleToggleButton(printToggleBulanan, 'YA');
            document.getElementById('group-bulanan').value = 'CNSD';
        }

        openModal(dataModal);
    };

    const handleSave = async () => {
        let data;
        const isHarian = !harianForm.classList.contains('hidden');

        if (isHarian) {
            const tanggal = document.getElementById('tanggal-harian').value;
            const mantek = document.getElementById('mantek').value;
            if (!tanggal || !mantek) {
                Swal.fire('Input Tidak Lengkap', 'Kolom Tanggal dan Mantek wajib diisi.', 'warning');
                return;
            }
            data = {
                type: 'Harian', tanggal,
                dinas: document.querySelector('.dinas-btn.bg-airnav-blue').textContent,
                mantek, print: printToggleHarian.textContent,
                grup: document.getElementById('group-harian').value,
                nama_alat: null, sampai: null
            };
        } else {
            const tanggal = document.getElementById('tanggal-bulanan').value;
            if (selectedMonthlyEquipment.length === 0 || !tanggal) {
                Swal.fire('Input Tidak Lengkap', 'Kolom Nama Alat dan Tanggal wajib diisi.', 'warning');
                return;
            }

            // --- PERBAIKAN 4: Cek "Semua Alat" ---
            let namaAlatData;
            if (selectedMonthlyEquipment.length === equipmentNames.length && equipmentNames.length > 0) {
                namaAlatData = "ALL Equipment";
            } else {
                namaAlatData = JSON.stringify(selectedMonthlyEquipment);
            }
            // --- AKHIR PERBAIKAN 4 ---

            data = {
                type: 'Bulanan', 
                nama_alat: namaAlatData, // Gunakan data yg sudah diproses
                tanggal,
                sampai: document.getElementById('sampai').value || null,
                print: printToggleBulanan.textContent,
                grup: document.getElementById('group-bulanan').value,
                dinas: null, mantek: null
            };
        }

        if (currentDataId) data.id = currentDataId;

        const result = await window.api.saveCnsdSaveData(data);
        if (result.success) {
            Swal.fire({ title: 'Berhasil!', text: result.message, icon: 'success', timer: 1500, showConfirmButton: false });
            loadAndRenderData();
            closeModal(dataModal);
        } else {
            Swal.fire('Gagal!', result.message, 'error');
        }
    };

    const confirmDelete = (id) => {
        Swal.fire({
            title: 'Hapus Data', text: "Anda yakin ingin menghapus data ini?", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#D92D20', cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleteResult = await window.api.deleteCnsdSaveData(id);
                if (deleteResult.success) {
                    Swal.fire('Dihapus!', deleteResult.message, 'success');
                    loadAndRenderData();
                } else {
                    Swal.fire('Gagal!', deleteResult.message, 'error');
                }
            }
        });
    };

    const loadInitialData = async () => {
        const equipResult = await window.api.getCnsdEquipment();
        if (equipResult.success) {
            equipmentNames = equipResult.data;
        } else {
            console.error("Gagal memuat daftar peralatan CNSD.");
        }
        loadAndRenderData();
    };


    // --- Event Listeners ---
    openModalBtn.addEventListener('click', () => showDataModal(null));
    closeModalBtn.addEventListener('click', () => closeModal(dataModal));
    cancelBtn.addEventListener('click', () => closeModal(dataModal));
    saveBtn.addEventListener('click', handleSave);

    closeDetailModalBtn.addEventListener('click', () => closeModal(detailModal));
    detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeModal(detailModal); });

    closeScheduleModalBtn.addEventListener('click', () => closeModal(scheduleModal));
    scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) closeModal(scheduleModal); });

    namaAlatDisplay.addEventListener('click', openEquipmentChecklistModal);
    closeChecklistModalBtn.addEventListener('click', () => closeModal(equipmentChecklistModal));
    equipmentChecklistModal.addEventListener('click', (e) => { if (e.target === equipmentChecklistModal) closeModal(equipmentChecklistModal); });
    
    selectAllEquipmentCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const allCheckboxes = equipmentChecklistContainer.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(box => {
            box.checked = isChecked;
        });
    });
    
    saveChecklistBtn.addEventListener('click', () => {
        selectedMonthlyEquipment = [];
        const checkedBoxes = equipmentChecklistContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(box => {
            selectedMonthlyEquipment.push(box.value);
        });
        
        if (selectedMonthlyEquipment.length === equipmentNames.length && equipmentNames.length > 0) {
            namaAlatDisplay.value = 'Semua Alat';
        } else if (selectedMonthlyEquipment.length > 0) {
            namaAlatDisplay.value = `${selectedMonthlyEquipment.length} alat dipilih`;
        } else {
            namaAlatDisplay.value = 'Pilih Alat...';
        }
        
        closeModal(equipmentChecklistModal);
    });

    harianBtn.addEventListener('click', () => { setActiveButton(harianBtn, bulananBtn); harianForm.classList.remove('hidden'); bulananForm.classList.add('hidden'); });
    bulananBtn.addEventListener('click', () => { setActiveButton(bulananBtn, harianBtn); bulananForm.classList.remove('hidden'); harianForm.classList.add('hidden'); });

    dinasButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            dinasButtons.forEach(btn => {
                btn.classList.remove('bg-airnav-blue', 'text-white');
                btn.classList.add('text-gray-700');
            });
            button.classList.add('bg-airnav-blue', 'text-white');
        });
    });

    [printToggleHarian, printToggleBulanan].forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            const currentState = button.textContent;
            handleToggleButton(button, currentState === 'YA' ? 'TIDAK' : 'YA');
        });
    });

    cardContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.bg-white.border');
        if (!card) return;
        const allData = { ...card.dataset };

        if (e.target.closest('.schedule-icon')) {
            showScheduleModal(allData);
            const scheduleDate = allData.tanggal;
            if (allData.type === 'Harian') {
                const dinasFilter = allData.dinas;
                // Panggil fungsi 'Harian' (yang udah ada & udah bener)
                fetchAndDisplayScheduleDetails(scheduleDate, dinasFilter);
            } else {
                // Panggil fungsi 'Bulanan' (yang baru kita buat)
                const endDate = allData.sampai;
                fetchAndDisplayMonthlySchedules(scheduleDate, endDate, 'schedule-details-content');
            }
        } else if (e.target.closest('.document-icon')) {
            showActivityOnlyModal(allData);
        } else if (e.target.closest('.edit-icon')) {
            showDataModal(allData);
        } else if (e.target.closest('.delete-icon')) {
            confirmDelete(allData.id);
        } else {
            showDetailModal(allData); 
        }
    });

    // --- Inisialisasi ---
    loadInitialData();
});