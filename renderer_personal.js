document.addEventListener('DOMContentLoaded', () => {
    // Data lengkap karyawan
    const allData = [
        {no: 1, nik: '10010069', nama: 'AN NAUFAL', kelamin: 'L', jabatan: 'MANAGER FASILITAS TEKNIK', level: '16', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 2, nik: '10083259', nama: 'AGUS DERMAWAN MUCHSIN', kelamin: 'L', jabatan: 'MANAGER TEKNIK 1', level: '15', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 3, nik: '10083380', nama: 'EFRIED NARA PERKASA', kelamin: 'L', jabatan: 'MANAGER TEKNIK 3', level: '15', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 4, nik: '10083435', nama: 'ANDI WIBOWO', kelamin: 'L', jabatan: 'MANAGER TEKNIK 2', level: '15', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 5, nik: 'ASN83713', nama: 'NETTY SEPTA CRISILA', kelamin: 'P', jabatan: 'MANAGER TEKNIK 5', level: '15', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 6, nik: 'ASN83472', nama: 'MOCH. ICHSAN', kelamin: 'L', jabatan: 'SUPERVISOR TEKNIK TELEKOMUNIKASI', level: '14', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 7, nik: 'ASN83883', nama: 'WIDI HANDOKO', kelamin: 'L', jabatan: 'JUNIOR MANAGER FASILITAS PENUNJANG', level: '14', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 8, nik: '10010419', nama: 'NUR HUKIM', kelamin: 'L', jabatan: 'SUPERVISOR TEKNIK TELEKOMUNIKASI', level: '13', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 9, nik: '10010503', nama: 'PRIYOKO', kelamin: 'L', jabatan: 'SUPERVISOR TEKNIK PENUNJANG', level: '13', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 10, nik: '10010842', nama: 'FAJAR KUSUMA WARDANA', kelamin: 'L', jabatan: 'SUPERVISOR TEKNIK PENUNJANG', level: '13', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 11, nik: '10011057', nama: 'ADITYA HUZAIRI PUTRA', kelamin: 'L', jabatan: 'TEKNIK TELEKOMUNIKASI', level: '13', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 12, nik: '10010987', nama: 'KHOIRUL M. A.', kelamin: 'L', jabatan: 'TEKNIK PENUNJANG', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 13, nik: '10011234', nama: 'ARGO PRAGOLO', kelamin: 'L', jabatan: 'STAFF ADMINISTRASI', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 14, nik: '10011456', nama: 'FEBRI DWI C.', kelamin: 'L', jabatan: 'TEKNISI SENIOR', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 15, nik: '10011678', nama: 'M. YUSUF TRIONO', kelamin: 'L', jabatan: 'STAFF TEKNIK', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 16, nik: '10011890', nama: 'RIYAN FAUZI', kelamin: 'L', jabatan: 'TEKNISI LAPANGAN', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 17, nik: '10012123', nama: 'TEGUH MURDIYANTO', kelamin: 'L', jabatan: 'OPERATOR SISTEM', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 18, nik: '10012345', nama: 'YUSRI HANDOKO', kelamin: 'L', jabatan: 'TEKNISI JARINGAN', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 19, nik: '10012567', nama: 'MOH. SYAMSUDIN', kelamin: 'L', jabatan: 'STAFF DOKUMENTASI', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 20, nik: '10012789', nama: 'ADAM BUKHORI', kelamin: 'L', jabatan: 'HELPER TEKNIK', level: '12', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 21, nik: '10013001', nama: 'AMIRZAN RIDHO W.', kelamin: 'L', jabatan: 'STAFF ADMINISTRASI', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 22, nik: '10013223', nama: 'SILVY RETNO ANDRIANI', kelamin: 'P', jabatan: 'TEKNISI LISTRIK', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 23, nik: '10013445', nama: 'TRIA SABDA UTAMA', kelamin: 'L', jabatan: 'OPERATOR', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 24, nik: '10013667', nama: 'DANI RIDZAL', kelamin: 'L', jabatan: 'TEKNISI AC', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 25, nik: '10013889', nama: 'NUR SHELLA FIRDAUS ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 26, nik: '10013889', nama: 'YORDAN C.P ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 27, nik: '10013889', nama: 'ROHMADONI SURYA KAHFI DEWANATA ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 28, nik: '10013889', nama: 'SAFIRA SARASWATI ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 29, nik: '10013889', nama: 'ALDHI DESKA P. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 30, nik: '10013889', nama: 'ELVITA AGUSTINA ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 31, nik: '10013889', nama: 'RENDY PANCA A.P. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 32, nik: '10013889', nama: 'I KADEK DWIJA S. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 33, nik: '10013889', nama: 'DWIKI SETYO W. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 34, nik: '10013889', nama: 'WINDI TRI SETYAWATI ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 35, nik: '10013889', nama: 'IQBAL MUSTIKA ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 36, nik: '10013889', nama: 'SOFI DWI HIDAYATI ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 37, nik: '10013889', nama: 'YOGA ARIFAL P. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 38, nik: '10013889', nama: 'M. FEIZAR NOOR ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 39, nik: '10013889', nama: 'DWI PRASETYO ADI ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 40, nik: '10013889', nama: 'ANDHIKA BHASKARA J. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 41, nik: '10013889', nama: 'AGUSTINA ANGGREINI ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 42, nik: '10013889', nama: 'DWI PUJI RAHAYU ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 43, nik: '10013889', nama: 'FRISZA VRADANA ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 44, nik: '10013889', nama: 'M. AIDIN EFFENDI ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '11', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 45, nik: '10013889', nama: 'PANDU INDRAJA ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '10', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 46, nik: '10013889', nama: 'SEPTI RAHMAN SARI ', kelamin: 'P', jabatan: 'STAFF SUPPORT', level: '10', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 47, nik: '10013889', nama: 'FAJAR NUGROHO ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '10', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 48, nik: '10013889', nama: 'SAIFUL BAHRIS ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '9', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 49, nik: '10013889', nama: 'KARANG SAMUDRA ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '9', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 50, nik: '10013889', nama: 'ILMIN SYARIF H. ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '9', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 51, nik: '10013889', nama: 'ERAZUARDI ZULFAHMI ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '9', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 52, nik: '10013889', nama: 'BIAN PRASETIA H ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '8', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        {no: 53, nik: '10013889', nama: 'AHMAD MUJI YASIN ', kelamin: 'L', jabatan: 'STAFF SUPPORT', level: '8', lokasi: 'Cabang Surabaya', lokasiInduk: 'Surabaya'},
        
    ];

    let currentPage = 1;
    let entriesPerPage = 10;
    let filteredData = [...allData];

    // Fungsi untuk membuka modal
    window.openModal = (nama, pernium, jabatan, level) => {
        const modal = document.getElementById('workOrderModal');
        document.getElementById('modalPersonName').textContent = nama;
        document.getElementById('modalPernium').textContent = pernium;
        document.getElementById('modalNama').textContent = nama;
        document.getElementById('modalJabatan').textContent = jabatan;
        document.getElementById('modalLevel').textContent = level;
        document.getElementById('modalLokasi').textContent = 'Cabang Surabaya';
        document.getElementById('modalLokasiInduk').textContent = 'Surabaya';
        modal.classList.add('active');
    }

    // Fungsi untuk menutup modal
    window.closeModal = () => {
        const modal = document.getElementById('workOrderModal');
        modal.classList.remove('active');
    }

    // Menutup modal saat mengklik di luar area konten modal
    window.onclick = function(event) {
        const modal = document.getElementById('workOrderModal');
        if (event.target === modal) {
            closeModal();
        }
    }

    // Fungsi untuk merender ulang tabel
    const renderTable = () => {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const pageData = filteredData.slice(start, end);

        tableBody.innerHTML = '';
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.no}</td>
                <td>${row.nik}</td>
                <td>${row.nama}</td>
                <td>${row.kelamin}</td>
                <td>${row.jabatan}</td>
                <td>${row.level}</td>
                <td>${row.lokasi}</td>
                <td>${row.lokasiInduk}</td>
                <td><button class="action-btn" onclick="openModal('${row.nama}', '${row.nik}', '${row.jabatan}', '${row.level}')">👁</button></td>
            `;
            tableBody.appendChild(tr);
        });

        updatePagination();
        updateEntryInfo();
    }

    // Fungsi untuk memperbarui kontrol paginasi
    const updatePagination = () => {
        const paginationDiv = document.querySelector('.pagination');
        if (!paginationDiv) return;

        const totalPages = Math.ceil(filteredData.length / entriesPerPage);
        
        let paginationHTML = `<button class="page-btn" onclick="changePage('prev')">Previous</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        
        paginationHTML += `<button class="page-btn" onclick="changePage('next')">Next</button>`;
        paginationDiv.innerHTML = paginationHTML;
    }

    // Fungsi untuk memperbarui info jumlah entri
    const updateEntryInfo = () => {
        const entryInfo = document.querySelector('.entry-info');
        if (!entryInfo) return;

        const start = filteredData.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
        const end = Math.min(start + entriesPerPage - 1, filteredData.length);
        entryInfo.textContent = `Showing ${start} to ${end} of ${filteredData.length} entries`;
    }

    // Fungsi untuk mengubah halaman
    window.changePage = (page) => {
        const totalPages = Math.ceil(filteredData.length / entriesPerPage);
        
        if (page === 'prev') {
            if (currentPage > 1) currentPage--;
        } else if (page === 'next') {
            if (currentPage < totalPages) currentPage++;
        } else {
            currentPage = page;
        }
        
        renderTable();
    }

    // Event listener untuk pilihan jumlah entri per halaman
    const entriesSelect = document.getElementById('entriesSelect');
    if (entriesSelect) {
        entriesSelect.addEventListener('change', function() {
            entriesPerPage = parseInt(this.value);
            currentPage = 1;
            renderTable();
        });
    }

    // Fungsionalitas pencarian
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            filteredData = allData.filter(row => {
                return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(searchTerm)
                );
            });
            
            currentPage = 1;
            renderTable();
        });
    }

    // Event listener untuk klik item menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Render tabel saat pertama kali halaman dimuat
    renderTable();
});
