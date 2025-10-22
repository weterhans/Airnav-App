// main.js

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');
const axios = require('axios'); 
const Papa = require('papaparse');

const saltRounds = 10;

// --- PERSIAPAN FOLDER ---
// Buat folder untuk menyimpan file jika belum ada
const signaturesDir = path.join(__dirname, 'signatures');
if (!fs.existsSync(signaturesDir)) {
    fs.mkdirSync(signaturesDir);
}
const avatarsDir = path.join(__dirname, 'avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir);
}
const attachmentsDir = path.join(__dirname, 'attachments');
if (!fs.existsSync(attachmentsDir)) {
    fs.mkdirSync(attachmentsDir);
}


// --- KONEKSI DATABASE ---
const dbConnection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'airnav_logbook_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();


// --- FUNGSI UTAMA APLIKASI ---
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280, // Ukuran bisa disesuaikan
        height: 720,
        icon: path.join(__dirname, 'img/airnav.ico'), // Pastikan path icon benar
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      });
    
      win.maximize();
      win.loadFile('index.html');
      return win;
};

// Fungsi baru untuk mengecek koneksi database saat startup
async function checkDbConnection() {
    try {
        const connection = await dbConnection.getConnection();
        connection.release(); // Lepaskan koneksi setelah berhasil
        console.log('Koneksi database berhasil.');
        return true;
    } catch (error) {
        console.error('Gagal terhubung ke database:', error.message);
        return false;
    }
}

async function fetchScheduleData(win) {
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTgyK8hLDZajIXckdGcBuV9W4zVgT_QGqVK7irDc0fqPUNHgpxai2X9Pk6vj5qz22xBozTruWkWx8z/pub?output=csv'; // URL CSV Anda

    if (!win) return;

    try {
        console.log('--- Memulai Fetch Jadwal ---');
        const response = await axios.get(GOOGLE_SHEET_URL);
        const parseResult = Papa.parse(response.data, { header: false });

        // 1. Membersihkan data
        const cleanedRows = parseResult.data.filter(row =>
            Array.isArray(row) && row.length > 3 && row[1] && row[1].trim() !== '' && row[3] && row[3].trim() !== ''
        );
        console.log(`Data bersih: ${cleanedRows.length} baris valid.`);

        // 2. Setup tanggal & kolom
        const today = new Date();
        const displayDate = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const todayDate = today.getDate();
        const offsetColumns = 4; // NO, NAMA, KELAS JABATAN, JABATAN
        const columnIndexForToday = offsetColumns + todayDate - 1;

        // 3. Kamus shift
        const shiftDictionary = { 'P': 'PAGI', 'S': 'SIANG', 'M': 'MALAM' };

        // 4. Wadah Kategori
        let managerSchedule = [];
        let cnsSchedule = [];
        let tfpSchedule = [];

        // 5. Proses dan kategorikan (LOGIKA BARU YANG MENANGANI "MT x")
        console.log('Mulai kategorisasi (Revisi Final MT)...');
        for (const row of cleanedRows) {
            const name = row[1];
            const jabatan = row[3].toUpperCase().trim(); // Jabatan dari Google Sheet (dibersihkan)
            const shiftCode = row[columnIndexForToday] ? row[columnIndexForToday].trim().toUpperCase() : '';

            if (shiftDictionary[shiftCode]) {
                const scheduleEntry = { name: name, shift: shiftDictionary[shiftCode] };

                // Cek #1: Apakah jabatan DIMULAI DENGAN "MT" ATAU mengandung "PT MT"?
                if (jabatan.startsWith('MT') || jabatan.includes('PT MT')) {
                    managerSchedule.push(scheduleEntry);
                }
                // Cek #2: Jika BUKAN manager, apakah jabatannya mengandung 'TFP'?
                else if (jabatan.includes('TFP')) {
                    tfpSchedule.push(scheduleEntry); // Akan mencakup 'SPV TFP'
                }
                // Cek #3: Jika BUKAN manager dan BUKAN TFP, anggap CNS.
                else {
                    cnsSchedule.push(scheduleEntry); // Akan mencakup 'Teknik 1', 'Teknik 2', dll.
                }
            }
        }
        console.log(`Hasil kategorisasi: M(${managerSchedule.length}), C(${cnsSchedule.length}), T(${tfpSchedule.length})`);


        // --- Blok Pengurutan (Tidak Berubah) ---
        console.log('Mulai pengurutan...');
        const shiftOrder = { 'PAGI': 1, 'SIANG': 2, 'MALAM': 3 };
        const sortByShift = (a, b) => {
            const orderA = shiftOrder[a.shift] || 99;
            const orderB = shiftOrder[b.shift] || 99;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.name.localeCompare(b.name);
         };
        managerSchedule.sort(sortByShift);
        cnsSchedule.sort(sortByShift);
        tfpSchedule.sort(sortByShift);
        console.log('Pengurutan selesai.');
        // --- Akhir Blok Pengurutan ---


        const payload = {
            displayDate: displayDate,
            manager: managerSchedule,
            tfp: tfpSchedule,
            cns: cnsSchedule
        };

        console.log(`Mengirim payload terurut ke renderer.`);
        win.webContents.send('update-schedule', payload);

    } catch (error) {
        console.error('!!! ERROR DI fetchScheduleData !!!:', error);
        win.webContents.send('schedule-error');
    }
}

// Logika saat aplikasi siap dijalankan (dengan pengecekan koneksi)
app.whenReady().then(async () => {
    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
        const win = createWindow(); // Perbaikan #1: Simpan jendela ke dalam variabel 'win'
    
        fetchScheduleData(win); // Perbaikan #2: Sekarang 'win' punya referensi yang benar
        setInterval(() => fetchScheduleData(win), 300000);
    
    } else {
        // Jika gagal, tampilkan pesan error yang jelas dan tutup aplikasi
        dialog.showErrorBox(
            'Koneksi Database Gagal',
            'Tidak dapat terhubung ke database. Pastikan Laragon dan layanan MySQL sudah berjalan sebelum membuka aplikasi.'
        );
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// --- BAGIAN LOGIKA IPC (BACKEND) ---
ipcMain.handle('open-sheet', () => {
    console.log(">>> Handler 'open-sheet' di main.js TERPANGGIL!");
    const EDIT_URL = 'https://docs.google.com/spreadsheets/d/1MJk_RV_ufGHr11bKyMQMxxDlQqv_6GhpZ9rPYSkELy8/edit';
    console.log(`Mencoba membuka link eksternal: ${EDIT_URL}`);
    try {
        shell.openExternal(EDIT_URL); // Gunakan shell yang sudah diimpor
        console.log(">>> shell.openExternal SUKSES dipanggil.");
        return { success: true };
    } catch (error) {
        console.error('!!! Gagal saat memanggil shell.openExternal !!!:', error);
        return { success: false, message: 'Gagal membuka link.' };
    }
});

// Handle permintaan REGISTER
ipcMain.handle('db:register', async (event, userData) => {
    // 1. Tambahkan 'role' saat mengambil data
    const { username, fullname, email, role, password, signatureDataUrl } = userData;
    try {
        const [existing] = await dbConnection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return { success: false, message: 'Username atau Email sudah terdaftar!' };
        }

        const base64Data = signatureDataUrl.replace(/^data:image\/png;base64,/, "");
        const signatureFileName = `signature-${username}-${Date.now()}.png`;
        const signaturePath = path.join(signaturesDir, signatureFileName);
        fs.writeFileSync(signaturePath, base64Data, 'base64');

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Tambahkan 'role' ke dalam query INSERT
        await dbConnection.query(
            'INSERT INTO users (username, fullname, email, role, password, signature_url) VALUES (?, ?, ?, ?, ?, ?)',
            [username, fullname, email, role, hashedPassword, signaturePath] // 3. Tambahkan variabel 'role' di sini
        );
        return { success: true, message: 'Registrasi berhasil!' };
    } catch (error) {
        console.error('Error registrasi:', error);
        return { success: false, message: 'Terjadi kesalahan pada server.' };
    }
});

// Handle permintaan LOGIN
ipcMain.handle('db:login', async (event, username, password) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return { success: false, message: 'Username tidak ditemukan.' };
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return { success: true, user: user }; 
        } else {
            return { success: false, message: 'Password salah.' };
        }
    } catch (error) {
        console.error('Main Process: Terjadi ERROR saat login:', error);
        return { success: false, message: 'Terjadi kesalahan pada server. Cek terminal.' };
    }
});

// Handle permintaan UPDATE PROFIL
ipcMain.handle('db:update-profile', async (event, userData) => {
    // [DEBUG] Tampilkan semua data yang diterima dari frontend
    console.log('--- Menerima permintaan update profil ---');
    console.log('Data yang diterima:', userData);

    const { id, fullname, username, phone_number, avatarDataUrl, currentAvatarUrl, signatureDataUrl, currentSignatureUrl } = userData;
    try {
        let avatarPath = currentAvatarUrl;
        let oldAvatarPathToDelete = null;

        let signaturePath = currentSignatureUrl;
        let oldSignaturePathToDelete = null;

        // Proses avatar baru jika ada
        if (avatarDataUrl) {
            console.log('Memproses avatar baru...');
            oldAvatarPathToDelete = currentAvatarUrl;
            const base64Data = avatarDataUrl.replace(/^data:image\/[a-z]+;base64,/, "");
            const avatarFileName = `avatar-${id}-${Date.now()}.png`;
            avatarPath = path.join(avatarsDir, avatarFileName);
            fs.writeFileSync(avatarPath, base64Data, 'base64');
            console.log('Avatar baru disimpan di:', avatarPath);
        }

        // Proses tanda tangan baru jika ada
        if (signatureDataUrl) {
            console.log('Memproses tanda tangan baru...');
            oldSignaturePathToDelete = currentSignatureUrl;
            const base64Data = signatureDataUrl.replace(/^data:image\/png;base64,/, "");
            const signatureFileName = `signature-${id}-${Date.now()}.png`;
            signaturePath = path.join(signaturesDir, signatureFileName);
            fs.writeFileSync(signaturePath, base64Data, 'base64');
            console.log('Tanda tangan baru disimpan di:', signaturePath);
        }

        await dbConnection.query(
            'UPDATE users SET fullname = ?, username = ?, phone_number = ?, avatar_url = ?, signature_url = ? WHERE id = ?',
            [fullname, username, phone_number, avatarPath, signaturePath, id]
        );
        console.log('Database berhasil di-update.');

        // --- Logika untuk menghapus file lama ---
        if (oldSignaturePathToDelete) {
            console.log('Mencoba menghapus tanda tangan lama di path:', oldSignaturePathToDelete);
            console.log('Apakah file lama ada? (existsSync):', fs.existsSync(oldSignaturePathToDelete));
            if (fs.existsSync(oldSignaturePathToDelete)) {
                try {
                    fs.unlinkSync(oldSignaturePathToDelete);
                    console.log('SUKSES: File tanda tangan lama berhasil dihapus.');
                } catch (unlinkError) {
                    console.error('GAGAL: Gagal menghapus file tanda tangan lama:', unlinkError);
                }
            }
        }
        if (oldAvatarPathToDelete) {
            console.log('Mencoba menghapus avatar lama di path:', oldAvatarPathToDelete);
            console.log('Apakah file lama ada? (existsSync):', fs.existsSync(oldAvatarPathToDelete));
            if (fs.existsSync(oldAvatarPathToDelete)) {
                try {
                    fs.unlinkSync(oldAvatarPathToDelete);
                    console.log('SUKSES: File avatar lama berhasil dihapus.');
                } catch (unlinkError) {
                    console.error('GAGAL: Gagal menghapus file avatar lama:', unlinkError);
                }
            }
        }
        
        const [rows] = await dbConnection.query('SELECT * FROM users WHERE id = ?', [id]);
        return { success: true, message: 'Profil berhasil diperbarui!', user: rows[0] };

    } catch (error) {
        console.error('Error update profil:', error);
        return { success: false, message: 'Gagal memperbarui profil.' };
    }
});

// --- HANDLERS UNTUK JADWAL CNSD ---

// Handle untuk MENGAMBIL DAFTAR TEKNISI dari tabel users
ipcMain.handle('db:get-technicians', async () => {
    try {
        // Ambil semua user dengan role 'Teknisi'
        const [rows] = await dbConnection.query("SELECT fullname FROM users WHERE role = 'Teknisi' ORDER BY fullname ASC");
        return { success: true, data: rows.map(r => r.fullname) };
    } catch (error) {
        console.error('Error mengambil data teknisi:', error);
        return { success: false, data: [] };
    }
});

// Handle untuk MENYIMPAN JADWAL BARU
ipcMain.handle('db:save-cnsd-schedule', async (event, scheduleData) => {
    try {
        // Ambil data teknisi ke-6
        const { schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup } = scheduleData;
        await dbConnection.query(
            // Tambahkan teknisi_6 ke query
            'INSERT INTO schedules_cnsd (schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup]
        );
        return { success: true, message: 'Jadwal berhasil disimpan!' };
    } catch (error) {
        console.error('Error menyimpan jadwal CNSD:', error);
        return { success: false, message: 'Gagal menyimpan jadwal.' };
    }
});

// Handle untuk MENGAMBIL SEMUA JADWAL
ipcMain.handle('db:get-cnsd-schedules', async () => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM schedules_cnsd ORDER BY tanggal DESC');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil jadwal CNSD:', error);
        return { success: false, data: [] };
    }
});

// Handle untuk MENGAMBIL SATU JADWAL berdasarkan ID
ipcMain.handle('db:get-cnsd-schedule-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM schedules_cnsd WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil jadwal by ID:', error);
        return { success: false, message: 'Gagal mengambil detail jadwal.' };
    }
});

// Handle untuk MENG-UPDATE JADWAL yang sudah ada
ipcMain.handle('db:update-cnsd-schedule', async (event, scheduleData) => {
    try {
        // Ambil data teknisi ke-6
        const { id, schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup } = scheduleData;
        await dbConnection.query(
            // Tambahkan teknisi_6 ke query
            'UPDATE schedules_cnsd SET schedule_id_custom = ?, tanggal = ?, hari = ?, dinas = ?, teknisi_1 = ?, teknisi_2 = ?, teknisi_3 = ?, teknisi_4 = ?, teknisi_5 = ?, teknisi_6 = ?, kode = ?, grup = ? WHERE id = ?',
            [schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup, id]
        );
        return { success: true, message: 'Jadwal berhasil diperbarui!' };
    } catch (error) {
        console.error('Error mengupdate jadwal CNSD:', error);
        return { success: false, message: 'Gagal memperbarui jadwal.' };
    }
});

ipcMain.handle('db:get-technicians-by-schedule', async (event, { tanggal, dinas }) => {
    try {
        console.log(`Menerima dari frontend: Tanggal=${tanggal}, Dinas=${dinas}`);

        const [rows] = await dbConnection.query(
            'SELECT teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6 FROM schedules_cnsd WHERE tanggal = ? AND dinas = ?',
            [tanggal, dinas]
        );
        console.log('Hasil query database:', rows);

        if (rows.length === 0) {
            return { success: true, data: [] }; // Tidak ada jadwal, kembalikan array kosong
        }

        const schedule = rows[0];
        // Ubah objek teknisi menjadi array, dan buang yang isinya kosong atau null
        const technicianNames = Object.values(schedule).filter(name => name && name !== '-' && name.trim() !== '');
        
        return { success: true, data: technicianNames };

    } catch (error) {
        console.error('Error mengambil teknisi by schedule:', error);
        return { success: false, message: 'Gagal mengambil data teknisi dari jadwal.', data: [] };
    }
});

// --- HANDLERS UNTUK DAILY CNSD ---

// 1. Mengambil daftar peralatan CNSD
ipcMain.handle('db:get-cnsd-equipment', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT name FROM cnsd_equipment ORDER BY id ASC");
        return { success: true, data: rows.map(r => r.name) };
    } catch (error) {
        console.error('Error mengambil data equipment cnsd:', error);
        return { success: false, data: [] };
    }
});

// 2. Mengambil semua laporan harian CNSD
ipcMain.handle('db:get-cnsd-reports', async () => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM daily_cnsd_reports ORDER BY tanggal DESC, id DESC');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error saat mengambil laporan CNSD:', error);
        return { success: false, data: [] };
    }
});

// 3. Menyimpan laporan harian CNSD baru
ipcMain.handle('db:save-cnsd-report', async (event, reportData) => {
    try {
        const { report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, equipment_status } = reportData;
        await dbConnection.query(
            'INSERT INTO daily_cnsd_reports (report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, equipment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, JSON.stringify(equipment_status)]
        );
        return { success: true, message: 'Laporan berhasil disimpan!' };
    } catch (error) {
        console.error('Error saat menyimpan laporan CNSD:', error);
        return { success: false, message: 'Gagal menyimpan laporan ke database.' };
    }
});

// 4. Mengambil satu laporan harian berdasarkan ID
ipcMain.handle('db:get-cnsd-report-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM daily_cnsd_reports WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil laporan by ID:', error);
        return { success: false, message: 'Gagal mengambil detail laporan.' };
    }
});

// 5. Mengupdate laporan harian yang sudah ada
ipcMain.handle('db:update-cnsd-report', async (event, reportData) => {
    try {
        const { id, report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, equipment_status } = reportData;
        await dbConnection.query(
            'UPDATE daily_cnsd_reports SET report_id_custom = ?, dinas = ?, tanggal = ?, jam = ?, mantek = ?, acknowledge = ?, kode = ?, jadwal_dinas = ?, equipment_status = ? WHERE id = ?',
            [report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, JSON.stringify(equipment_status), id]
        );
        return { success: true, message: 'Laporan berhasil diperbarui!' };
    } catch (error) {
        console.error('Error mengupdate laporan CNSD:', error);
        return { success: false, message: 'Gagal memperbarui laporan.' };
    }
});

// --- HANDLERS UNTUK KEGIATAN CNSD ---

// 1. Mengambil semua data kegiatan
ipcMain.handle('db:get-cnsd-activities', async () => {
    try {
        // PERBAIKAN: Gunakan SELECT * untuk mengambil semua kolom
        const [rows] = await dbConnection.query("SELECT * FROM cnsd_activities ORDER BY tanggal DESC, id DESC");
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil kegiatan cnsd:', error);
        return { success: false, data: [] };
    }
});

// 2. Menyimpan atau Mengupdate kegiatan
ipcMain.handle('db:save-cnsd-activity', async (event, activityData) => {
    try {
        // Pisahkan data file (attachments) dari sisa data form
        const { id, attachments, teknisi, lampiran, ...restOfData } = activityData;
        const savedAttachmentPaths = [];

        // Proses setiap file lampiran baru yang diunggah
        if (attachments && attachments.length > 0) {
            attachments.forEach(file => {
                // Gunakan regex yang lebih robust untuk menangani berbagai tipe gambar
                const base64Data = file.data.replace(/^data:image\/[a-zA-Z0-9\+\-\.]+;base64,/, "");
                const newFileName = `attachment-${Date.now()}-${file.name}`;
                const filePath = path.join(attachmentsDir, newFileName);

                fs.writeFileSync(filePath, base64Data, 'base64');
                savedAttachmentPaths.push(filePath);
            });
        }

        const existingAttachments = JSON.parse(lampiran || '[]');
        const finalAttachmentPaths = [...existingAttachments, ...savedAttachmentPaths];

        const dataToSave = {
            ...restOfData,
            teknisi: JSON.stringify(teknisi),
            lampiran: JSON.stringify(finalAttachmentPaths) // Simpan array path file gabungan
        };

        if (id) { // Update
            await dbConnection.query('UPDATE cnsd_activities SET ? WHERE id = ?', [dataToSave, id]);
            return { success: true, message: 'Kegiatan berhasil diperbarui!' };
        } else { // Insert baru
             // Hapus properti 'id' jika ada dan nilainya null/undefined agar tidak masuk ke query INSERT
            delete dataToSave.id;
            await dbConnection.query('INSERT INTO cnsd_activities SET ?', [dataToSave]);
            return { success: true, message: 'Kegiatan berhasil disimpan!' };
        }
    } catch (error) {
        console.error('Error menyimpan kegiatan cnsd:', error);
        return { success: false, message: `Database Error: ${error.message}` };
    }
});

// HANDLER BARU UNTUK MEMBACA FILE SEBAGAI BASE64
ipcMain.handle('fs:read-file-base64', async (event, filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            // Baca file sebagai buffer, lalu konversi ke base64
            const fileBuffer = fs.readFileSync(filePath);
            const base64String = fileBuffer.toString('base64');
            
            // Coba tebak tipe MIME dari ekstensi file untuk Data URL yang valid
            const mimeType = path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
            
            return `data:${mimeType};base64,${base64String}`;
        }
        console.warn(`File not found at path: ${filePath}`);
        return null;
    } catch (error) {
        console.error(`Error reading file for preview: ${filePath}`, error);
        return null;
    }
});

// 3. Mengambil satu kegiatan berdasarkan ID
ipcMain.handle('db:get-cnsd-activity-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM cnsd_activities WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil kegiatan by ID:', error);
        return { success: false, data: null };
    }
});

// --- HANDLERS UNTUK WORK ORDER CNSD ---

// 1. Mengambil semua data work order
ipcMain.handle('db:get-cnsd-workorders', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM workorders_cnsd ORDER BY tanggal DESC, id DESC");
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil work order cnsd:', error);
        return { success: false, data: [] };
    }
});

// 2. Menyimpan atau Mengupdate work order
ipcMain.handle('db:save-cnsd-workorder', async (event, woData) => {
    try {
        const { id, ...dataToSave } = woData;

        if (dataToSave.output && Array.isArray(dataToSave.output)) {
            dataToSave.output = JSON.stringify(dataToSave.output);
        } else {
            dataToSave.output = JSON.stringify([]);
        }
        
        if (id && id !== '') { // Jika ada ID, berarti UPDATE
            await dbConnection.query('UPDATE workorders_cnsd SET ? WHERE id = ?', [dataToSave, id]);
            return { success: true, message: 'Work Order berhasil diperbarui!' };
        } else { // Jika tidak ada ID, berarti INSERT baru
            const [lastWo] = await dbConnection.query("SELECT id FROM workorders_cnsd ORDER BY id DESC LIMIT 1");
            const nextId = lastWo.length > 0 ? lastWo[0].id + 1 : 1;
            dataToSave.wo_id_custom = `WO-CNSD-${String(nextId).padStart(4, '0')}`;

            await dbConnection.query('INSERT INTO workorders_cnsd SET ?', dataToSave);
            return { success: true, message: 'Work Order berhasil disimpan!' };
        }
    } catch (error) {
        console.error('Error menyimpan work order cnsd:', error);
        return { success: false, message: `Database Error: ${error.message}` };
    }
});

// 3. Mengambil satu work order berdasarkan ID untuk diedit
ipcMain.handle('db:get-cnsd-workorder-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM workorders_cnsd WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil work order by ID:', error);
        return { success: false, data: null };
    }
});

// 4. Menghapus work order berdasarkan ID
ipcMain.handle('db:delete-cnsd-workorder', async (event, id) => {
    try {
        await dbConnection.query('DELETE FROM workorders_cnsd WHERE id = ?', [id]);
        return { success: true, message: 'Work Order berhasil dihapus.' };
    } catch (error) {
        console.error('Error menghapus work order:', error);
        return { success: false, message: 'Gagal menghapus work order.' };
    }
});

// --- HANDLERS UNTUK JADWAL TFP ---

ipcMain.handle('db:get-tfp-schedules', async () => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM schedules_tfp ORDER BY tanggal DESC');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil jadwal TFP:', error);
        return { success: false, data: [] };
    }
});

ipcMain.handle('db:save-tfp-schedule', async (event, scheduleData) => {
    try {
        const { schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup } = scheduleData;
        await dbConnection.query(
            'INSERT INTO schedules_tfp (schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup]
        );
        return { success: true, message: 'Jadwal TFP berhasil disimpan!' };
    } catch (error) {
        console.error('Error menyimpan jadwal TFP:', error);
        return { success: false, message: 'Gagal menyimpan jadwal.' };
    }
});

ipcMain.handle('db:get-tfp-schedule-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM schedules_tfp WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil jadwal TFP by ID:', error);
        return { success: false, message: 'Gagal mengambil detail jadwal.' };
    }
});

ipcMain.handle('db:update-tfp-schedule', async (event, scheduleData) => {
    try {
        const { id, schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup } = scheduleData;
        await dbConnection.query(
            'UPDATE schedules_tfp SET schedule_id_custom = ?, tanggal = ?, hari = ?, dinas = ?, teknisi_1 = ?, teknisi_2 = ?, teknisi_3 = ?, teknisi_4 = ?, teknisi_5 = ?, teknisi_6 = ?, kode = ?, grup = ? WHERE id = ?',
            [schedule_id_custom, tanggal, hari, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup, id]
        );
        return { success: true, message: 'Jadwal TFP berhasil diperbarui!' };
    } catch (error) {
        console.error('Error mengupdate jadwal TFP:', error);
        return { success: false, message: 'Gagal memperbarui jadwal.' };
    }
});

// --- HANDLERS UNTUK DAILY TFP ---

ipcMain.handle('db:get-tfp-equipment', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT name FROM tfp_equipment ORDER BY id ASC");
        return { success: true, data: rows.map(r => r.name) };
    } catch (error) { console.error('Error get TFP equip:', error); return { success: false, data: [] }; }
});

ipcMain.handle('db:get-tfp-reports', async () => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM daily_tfp_reports ORDER BY tanggal DESC, id DESC');
        return { success: true, data: rows };
    } catch (error) { console.error('Error get TFP reports:', error); return { success: false, data: [] }; }
});

ipcMain.handle('db:save-tfp-report', async (event, reportData) => {
    try {
        const { report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, equipment_status } = reportData;
        await dbConnection.query(
            'INSERT INTO daily_tfp_reports SET ?',
            { report_id_custom, dinas, tanggal, jam, mantek, acknowledge, kode, jadwal_dinas, equipment_status: JSON.stringify(equipment_status) }
        );
        return { success: true, message: 'Laporan TFP berhasil disimpan!' };
    } catch (error) { console.error('Error save TFP report:', error); return { success: false, message: 'Gagal menyimpan laporan TFP.' }; }
});

ipcMain.handle('db:get-tfp-report-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM daily_tfp_reports WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) { console.error('Error get TFP report by id:', error); return { success: false, data: null }; }
});

ipcMain.handle('db:update-tfp-report', async (event, reportData) => {
    try {
        const { id, ...dataToUpdate } = reportData;
        dataToUpdate.equipment_status = JSON.stringify(dataToUpdate.equipment_status);
        await dbConnection.query('UPDATE daily_tfp_reports SET ? WHERE id = ?', [dataToUpdate, id]);
        return { success: true, message: 'Laporan TFP berhasil diperbarui!' };
    } catch (error) { console.error('Error update TFP report:', error); return { success: false, message: 'Gagal memperbarui laporan TFP.' }; }
});

// --- HANDLERS UNTUK KEGIATAN TFP ---

ipcMain.handle('db:get-tfp-activities', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM tfp_activities ORDER BY tanggal DESC, id DESC");
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil kegiatan tfp:', error);
        return { success: false, data: [] };
    }
});

ipcMain.handle('db:save-tfp-activity', async (event, activityData) => {
    try {
        const { id, attachments, teknisi, lampiran, ...restOfData } = activityData;
        const savedAttachmentPaths = [];

        if (attachments && attachments.length > 0) {
            attachments.forEach(file => {
                const base64Data = file.data.replace(/^data:image\/[a-zA-Z0-9\+\-\.]+;base64,/, "");
                const newFileName = `attachment-tfp-${Date.now()}-${file.name}`;
                const filePath = path.join(attachmentsDir, newFileName);
                fs.writeFileSync(filePath, base64Data, 'base64');
                savedAttachmentPaths.push(filePath);
            });
        }

        const existingAttachments = JSON.parse(lampiran || '[]');
        const finalAttachmentPaths = [...existingAttachments, ...savedAttachmentPaths];

        const dataToSave = {
            ...restOfData,
            teknisi: JSON.stringify(teknisi),
            lampiran: JSON.stringify(finalAttachmentPaths)
        };

        if (id) { // Update
            await dbConnection.query('UPDATE tfp_activities SET ? WHERE id = ?', [dataToSave, id]);
            return { success: true, message: 'Kegiatan TFP berhasil diperbarui!' };
        } else { // Insert baru
            delete dataToSave.id;
            await dbConnection.query('INSERT INTO tfp_activities SET ?', [dataToSave]);
            return { success: true, message: 'Kegiatan TFP berhasil disimpan!' };
        }
    } catch (error) {
        console.error('Error menyimpan kegiatan tfp:', error);
        return { success: false, message: `Database Error: ${error.message}` };
    }
});

ipcMain.handle('db:get-tfp-activity-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM tfp_activities WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil kegiatan tfp by ID:', error);
        return { success: false, data: null };
    }
});

// --- HANDLERS UNTUK WORK ORDER TFP ---

// Mengambil teknisi dari jadwal TFP (bukan CNSD)
ipcMain.handle('db:get-tfp-technicians-by-schedule', async (event, { tanggal, dinas }) => {
    try {
        const [rows] = await dbConnection.query(
            'SELECT teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6 FROM schedules_tfp WHERE tanggal = ? AND dinas = ?',
            [tanggal, dinas]
        );
        if (rows.length === 0) return { success: true, data: [] };
        const schedule = rows[0];
        const technicianNames = Object.values(schedule).filter(name => name && name !== '-' && name.trim() !== '');
        return { success: true, data: technicianNames };
    } catch (error) {
        console.error('Error mengambil teknisi TFP by schedule:', error);
        return { success: false, data: [] };
    }
});

// Mengambil semua data work order TFP
ipcMain.handle('db:get-tfp-workorders', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM workorders_tfp ORDER BY tanggal DESC, id DESC");
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil work order tfp:', error);
        return { success: false, data: [] };
    }
});

// Menyimpan atau Mengupdate work order TFP
ipcMain.handle('db:save-tfp-workorder', async (event, woData) => {
    try {
        const { id, ...dataToSave } = woData;
        if (dataToSave.output && Array.isArray(dataToSave.output)) {
            dataToSave.output = JSON.stringify(dataToSave.output);
        } else {
            dataToSave.output = JSON.stringify([]);
        }
        if (id && id !== '') {
            await dbConnection.query('UPDATE workorders_tfp SET ? WHERE id = ?', [dataToSave, id]);
            return { success: true, message: 'Work Order TFP berhasil diperbarui!' };
        } else {
            const [lastWo] = await dbConnection.query("SELECT id FROM workorders_tfp ORDER BY id DESC LIMIT 1");
            const nextId = lastWo.length > 0 ? lastWo[0].id + 1 : 1;
            dataToSave.wo_id_custom = `WO-TFP-${String(nextId).padStart(4, '0')}`;
            await dbConnection.query('INSERT INTO workorders_tfp SET ?', dataToSave);
            return { success: true, message: 'Work Order TFP berhasil disimpan!' };
        }
    } catch (error) {
        console.error('Error menyimpan work order tfp:', error);
        return { success: false, message: `Database Error: ${error.message}` };
    }
});

// Mengambil satu work order TFP berdasarkan ID
ipcMain.handle('db:get-tfp-workorder-by-id', async (event, id) => {
    try {
        const [rows] = await dbConnection.query('SELECT * FROM workorders_tfp WHERE id = ?', [id]);
        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error mengambil work order tfp by ID:', error);
        return { success: false, data: null };
    }
});

// Menghapus work order TFP berdasarkan ID
ipcMain.handle('db:delete-tfp-workorder', async (event, id) => {
    try {
        await dbConnection.query('DELETE FROM workorders_tfp WHERE id = ?', [id]);
        return { success: true, message: 'Work Order TFP berhasil dihapus.' };
    } catch (error) {
        console.error('Error menghapus work order tfp:', error);
        return { success: false, message: 'Gagal menghapus work order TFP.' };
    }
});