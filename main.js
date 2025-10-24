// main.js

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios'); 
const Papa = require('papaparse');

const saltRounds = 10;

const formatDateForDisplay = (dateInput, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) => {
    if (!dateInput) return '-';
    let dateObject;
    try {
        dateObject = new Date(dateInput);
         if (isNaN(dateObject.getTime())) throw new Error("Invalid initial date");
    } catch (e) {
         console.error("Error parsing initial date for PDF:", dateInput, e);
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
        console.error("Error formatting date display for PDF:", dateInput, e);
        return 'Invalid Date';
    }
};

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
    if (!win || win.isDestroyed()) {
            console.log('[Fetch Schedule] Window tidak valid atau sudah dihancurkan.');
            return; // Tambah pengecekan win.isDestroyed()
        }

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
        const win = createWindow(); 
    
        win.webContents.on('did-finish-load', () => {
            console.log('[Startup] Renderer siap. Memanggil fetchScheduleData pertama kali...');
            fetchScheduleData(win); // Panggilan pertama dipindah ke sini
        });
        console.log('[Startup] SetInterval untuk refresh jadwal dimulai (10 detik).');
        setInterval(() => {
            console.log('[Interval] Memanggil fetchScheduleData...'); // Tambahin log buat interval
            fetchScheduleData(win);
        }, 10000); // Refresh setiap 5 menit
    
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
        shell.openExternal(EDIT_URL); 
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

// --- HANDLERS UNTUK SAVE DATA CNSD ---

ipcMain.handle('db:get-cnsd-savedata', async () => {
    try {
        const [rows] = await dbConnection.query("SELECT * FROM cnsd_savedata ORDER BY tanggal DESC, id DESC");
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil savedata cnsd:', error);
        return { success: false, data: [] };
    }
});

ipcMain.handle('db:save-cnsd-savedata', async (event, data) => {
    try {
        const { id, ...dataToSave } = data;
        if (id) { // Update data
            await dbConnection.query('UPDATE cnsd_savedata SET ? WHERE id = ?', [dataToSave, id]);
            return { success: true, message: 'Data berhasil diperbarui!' };
        } else { // Insert data baru
            await dbConnection.query('INSERT INTO cnsd_savedata SET ?', dataToSave);
            return { success: true, message: 'Data berhasil disimpan!' };
        }
    } catch (error) {
        console.error('Error menyimpan savedata cnsd:', error);
        return { success: false, message: `Database Error: ${error.message}` };
    }
});

ipcMain.handle('db:delete-cnsd-savedata', async (event, id) => {
    try {
        await dbConnection.query('DELETE FROM cnsd_savedata WHERE id = ?', [id]);
        return { success: true, message: 'Data berhasil dihapus.' };
    } catch (error) {
        console.error('Error menghapus savedata cnsd:', error);
        return { success: false, message: 'Gagal menghapus data.' };
    }
});

ipcMain.handle('db:get-cnsd-schedule-by-date', async (event, tanggal) => {
    try {
        // Ambil SEMUA kolom yang relevan
        const [rows] = await dbConnection.query(
            'SELECT schedule_id_custom, dinas, teknisi_1, teknisi_2, teknisi_3, teknisi_4, teknisi_5, teknisi_6, kode, grup FROM schedules_cnsd WHERE tanggal = ? ORDER BY FIELD(dinas, "PAGI", "SIANG", "MALAM")',
            [tanggal]
        );

        if (rows.length === 0) {
            return { success: true, data: [] };
        }

        // Tidak perlu format ulang, kirim data apa adanya
        return { success: true, data: rows };

    } catch (error) {
        console.error('Error mengambil jadwal cnsd by date:', error);
        return { success: false, message: 'Gagal mengambil data jadwal.', data: [] };
    }
});

ipcMain.handle('db:get-cnsd-activities-by-date', async (event, tanggal) => {
    try {
        // Ambil semua kolom kecuali id, created_at, updated_at
        const [rows] = await dbConnection.query(
            `SELECT kode, dinas, tanggal, waktu_mulai, waktu_selesai, alat, 
                    permasalahan, tindakan, hasil, status, teknisi, 
                    waktu_terputus, lampiran 
             FROM cnsd_activities 
             WHERE tanggal = ? 
             ORDER BY waktu_mulai ASC`, // Urutkan berdasarkan waktu mulai
            [tanggal]
        );

        return { success: true, data: rows };

    } catch (error) {
        console.error('Error mengambil kegiatan cnsd by date:', error);
        return { success: false, message: 'Gagal mengambil data kegiatan terkait.', data: [] };
    }
});

ipcMain.handle('db:get-cnsd-activities-by-date-range', async (event, startDate, endDate) => {
    try {
        // Jika endDate kosong, anggap aja rentangnya cuma 1 hari (startDate)
        const finalEndDate = endDate || startDate;

        const [rows] = await dbConnection.query(
            `SELECT * FROM cnsd_activities 
             WHERE tanggal BETWEEN ? AND ? 
             ORDER BY tanggal ASC, waktu_mulai ASC`,
            [startDate, finalEndDate]
        );
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil kegiatan cnsd by date range:', error);
        return { success: false, message: 'Gagal mengambil data kegiatan.', data: [] };
    }
});
ipcMain.handle('db:get-cnsd-schedule-by-date-range', async (event, startDate, endDate) => {
    try {
        // Jika endDate kosong, anggap aja rentangnya cuma 1 hari (startDate)
        const finalEndDate = endDate || startDate;

        const [rows] = await dbConnection.query(
            `SELECT * FROM schedules_cnsd 
             WHERE tanggal BETWEEN ? AND ? 
             ORDER BY tanggal ASC, FIELD(dinas, "PAGI", "SIANG", "MALAM")`,
            [startDate, finalEndDate]
        );
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error mengambil jadwal cnsd by date range:', error);
        return { success: false, message: 'Gagal mengambil data jadwal.', data: [] };
    }
});

// HANDLER BARU UNTUK GENERATE PDF LAPORAN CNSD
ipcMain.handle('generate:cnsd-report-pdf', async (event, reportInfo) => {
    const { date, shift, mantekName } = reportInfo; // Hapus reportType karena sudah pasti Harian

    try {
        console.log(`Mulai generate PDF untuk ${date} shift ${shift}`);

        // 1. Ambil Jadwal Personel & Mantek Signature
        const [scheduleRows] = await dbConnection.query(
            `SELECT s.teknisi_1, s.teknisi_2, s.teknisi_3, s.teknisi_4, s.teknisi_5, s.teknisi_6,
                    u_mantek.signature_url as mantek_signature
             FROM schedules_cnsd s
             LEFT JOIN users u_mantek ON u_mantek.fullname = ?
             WHERE s.tanggal = ? AND s.dinas = ?`,
            [mantekName, date, shift]
        );

        let schedule = {};
        let mantekSignaturePath = null;
        if (scheduleRows.length > 0) {
            schedule = scheduleRows[0];
            mantekSignaturePath = schedule.mantek_signature;
        } else {
            console.warn('Jadwal tidak ditemukan, mencoba ambil signature Mantek saja.');
            const [mantekUser] = await dbConnection.query('SELECT signature_url FROM users WHERE fullname = ?', [mantekName]);
            if (mantekUser.length === 0) throw new Error('Jadwal dinas dan data Mantek tidak ditemukan.');
            mantekSignaturePath = mantekUser[0].signature_url;
            for(let i=1; i<=6; i++) schedule[`teknisi_${i}`] = null;
        }

        const technicianNames = [schedule.teknisi_1, schedule.teknisi_2, schedule.teknisi_3, schedule.teknisi_4, schedule.teknisi_5, schedule.teknisi_6]
                                .filter(name => name && name !== '-' && name.trim() !== '');
        const technicianSignatures = {};
        if (technicianNames.length > 0) {
            const queryPlaceholders = technicianNames.map(() => '?').join(',');
            const [userRows] = await dbConnection.query(
                `SELECT fullname, signature_url FROM users WHERE fullname IN (${queryPlaceholders})`,
                technicianNames
            );
            userRows.forEach(user => {
                 if (user.signature_url && typeof user.signature_url === 'string' && !user.signature_url.startsWith('data:image')) {
                     technicianSignatures[user.fullname] = user.signature_url;
                 } else {
                      console.warn(`Paraf tidak valid atau bukan path file untuk ${user.fullname}`);
                 }
            });
        }
        console.log('Data jadwal & paraf diambil.');

        // 2. Ambil Laporan Daily untuk Status Peralatan
        const [dailyReportRows] = await dbConnection.query(
            'SELECT equipment_status FROM daily_cnsd_reports WHERE tanggal = ? AND dinas = ? ORDER BY id DESC LIMIT 1',
            [date, shift]
        );

        let equipmentStatus = {};
        if (dailyReportRows.length > 0 && dailyReportRows[0].equipment_status) {
            
            // --- PERBAIKAN: Samakan logikanya dengan di renderer_daily_cnsd.js ---
            // Cek dulu tipenya, karena driver mysql2 otomatis parse kolom JSON
            const dbStatus = dailyReportRows[0].equipment_status;
            
            if (typeof dbStatus === 'string') {
                // Kalo ternyata string, baru kita parse
                try {
                    equipmentStatus = JSON.parse(dbStatus || '{}');
                } catch (e) { 
                    console.error("Gagal parse string equipment_status:", e); 
                }
            } else if (typeof dbStatus === 'object' && dbStatus !== null) {
                // Kalo udah objek, langsung pake
                equipmentStatus = dbStatus;
            } else {
                 console.warn("equipment_status punya tipe data aneh atau null:", typeof dbStatus);
            }
            // --- END PERBAIKAN ---

        } else {
             console.warn(`Laporan daily tidak ditemukan/kosong untuk ${date} shift ${shift}.`);
        }
        console.log('Data status peralatan diambil.');

        // 3. Ambil Daftar Peralatan
        const [equipmentRows] = await dbConnection.query("SELECT name FROM cnsd_equipment ORDER BY id ASC");
        const equipmentList = equipmentRows.map(r => r.name);
        console.log('Daftar peralatan diambil.');

        // --- Mulai Membuat PDF ---
        const doc = new PDFDocument({ size: 'A4', margin: 20 });
        const tempDir = app.getPath('temp');
        const pdfFileName = `Laporan_CNSD_${shift}_${date.replace(/-/g, '')}_${Date.now()}.pdf`;
        const pdfPath = path.join(tempDir, pdfFileName);
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        const airNavBlue = '#255A9B';
        const pageMargin = 20;
        const pageWidth = doc.page.width - pageMargin * 2;
        const tableRightEdge = doc.page.width - pageMargin;
        const logoPath = path.join(__dirname, 'img/airnav_logo.png');


        // --- HALAMAN 1: KONDISI PERALATAN ---
        // Header
        const logoY_page2 = pageMargin;
        const logoWidth_page2 = 50; // Tentukan lebar logo di sini
        const logoX_page2 = doc.page.width - pageMargin - logoWidth_page2; // PERBAIKAN: Posisi X dihitung dari lebar logo

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, logoX_page2, logoY_page2, { width: logoWidth_page2 });
            // MODIFIKASI: Ubah font ke Times-Roman
            doc.fontSize(8).fillColor(airNavBlue).font('Times-Roman') // Sesuai permintaan
                .text('AirNav Indonesia', logoX_page2, logoY_page2 + 55, { width: logoWidth_page2, align: 'center' });
        }

        doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`TANGGAL : ${new Date(date + 'T00:00:00Z').toLocaleDateString('id-ID', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric'})}`, pageMargin, pageMargin + 50);
        doc.text(`DINAS   : ${shift.toUpperCase()}`, pageMargin, pageMargin + 65);

        // MODIFIKASI: Tambahkan garis horizontal hitam
        const lineY_page2 = pageMargin + 80; // Posisi Y untuk garis (sedikit di bawah teks logo)
        doc.strokeColor('black')
        .lineWidth(1)
        .moveTo(pageMargin, lineY_page2)
        .lineTo(doc.page.width - pageMargin, lineY_page2)
        .stroke();

        // Atur posisi Y untuk konten selanjutnya (menggantikan doc.moveDown(3))
        doc.y = lineY_page2 + 10; // Beri jarak 10pt dari garis

        // Judul Tabel Peralatan
        const titleYEquip = doc.y; // Judul akan dimulai dari sini
        doc.rect(pageMargin, titleYEquip, pageWidth, 20).fill(airNavBlue);
        doc.fontSize(11).fillColor('white').font('Helvetica-Bold')
           .text('KONDISI HARIAN PERALATAN', pageMargin, titleYEquip + 5, { align: 'center' });
        doc.moveDown();

        // Tabel Peralatan
        const tableTopEquip = doc.y;
        const colEq1X = pageMargin;      // No
        const colEq2X = colEq1X + 30;    // Alat
        const colEq3X = colEq2X + 150;   // Status
        const colEq4X = colEq3X + 100;   // Keterangan
        const rowHeightEquip = 18;
        doc.lineWidth(1).strokeColor('black');

        // Header Tabel Peralatan
        doc.fontSize(9).fillColor('black').font('Helvetica-Bold');
        const headerYEquip = tableTopEquip;
        const headerHeightEquip = 20;
        const headerTextYEquip = headerYEquip + 6;
        doc.rect(colEq1X, headerYEquip, colEq2X-colEq1X, headerHeightEquip).stroke(); doc.text('NO', colEq1X, headerTextYEquip, {width: colEq2X-colEq1X, align: 'center'});
        doc.rect(colEq2X, headerYEquip, colEq3X-colEq2X, headerHeightEquip).stroke(); doc.text('ALAT', colEq2X, headerTextYEquip, {width: colEq3X-colEq2X, align: 'center'});
        doc.rect(colEq3X, headerYEquip, colEq4X-colEq3X, headerHeightEquip).stroke(); doc.text('STATUS', colEq3X, headerTextYEquip, { width: colEq4X-colEq3X, align: 'center' });
        doc.rect(colEq4X, headerYEquip, tableRightEdge-colEq4X, headerHeightEquip).stroke(); doc.text('KETERANGAN', colEq4X, headerTextYEquip, {width: tableRightEdge-colEq4X, align: 'center'});

        // Isi Tabel Peralatan
        doc.font('Helvetica').fontSize(9);
        let currentYEquip = headerYEquip + headerHeightEquip;
        equipmentList.forEach((equipName, index) => {
            if (currentYEquip + rowHeightEquip > doc.page.height - pageMargin) { // Check pagination
                doc.addPage();
                currentYEquip = pageMargin;
                 // Draw header again
                 doc.font('Helvetica-Bold');
                 doc.rect(colEq1X, currentYEquip, colEq2X-colEq1X, headerHeightEquip).stroke(); doc.text('NO', colEq1X, currentYEquip + 6, {width: colEq2X-colEq1X, align: 'center'});
                 doc.rect(colEq2X, currentYEquip, colEq3X-colEq2X, headerHeightEquip).stroke(); doc.text('ALAT', colEq2X, currentYEquip + 6, {width: colEq3X-colEq2X, align: 'center'});
                 doc.rect(colEq3X, currentYEquip, colEq4X-colEq3X, headerHeightEquip).stroke(); doc.text('STATUS', colEq3X, currentYEquip + 6, { width: colEq4X-colEq3X, align: 'center' });
                 doc.rect(colEq4X, currentYEquip, tableRightEdge-colEq4X, headerHeightEquip).stroke(); doc.text('KETERANGAN', colEq4X, currentYEquip + 6, {width: tableRightEdge-colEq4X, align: 'center'});
                 currentYEquip += headerHeightEquip;
                 doc.font('Helvetica');
            }

            const equipId = equipName.toLowerCase().replace(/[\s\(\)\.\-\/:]/g, '');
            const statusInfo = equipmentStatus[equipId] || { status: 'NORMAL', keterangan: '' };
            const status = statusInfo.status || 'NORMAL';
            const keterangan = statusInfo.keterangan || '';

            doc.rect(colEq1X, currentYEquip, colEq2X-colEq1X, rowHeightEquip).stroke(); doc.text(`${index + 1}`, colEq1X, currentYEquip + 5, {width: colEq2X-colEq1X, align: 'center'});
            doc.rect(colEq2X, currentYEquip, colEq3X-colEq2X, rowHeightEquip).stroke(); doc.text(equipName, colEq2X + 5, currentYEquip + 5, { width: colEq3X-colEq2X - 10 });
            doc.rect(colEq3X, currentYEquip, colEq4X-colEq3X, rowHeightEquip).stroke(); doc.text(status, colEq3X, currentYEquip + 5, { width: colEq4X-colEq3X, align: 'center' });
            doc.rect(colEq4X, currentYEquip, tableRightEdge-colEq4X, rowHeightEquip).stroke(); doc.text(keterangan, colEq4X + 5, currentYEquip + 5, { width: tableRightEdge-colEq4X - 10 });

            currentYEquip += rowHeightEquip;
        });

        doc.addPage();
        // --- Halaman 2: Personel ---
        // Header
        const logoY_page1 = pageMargin;
        const logoWidth_page1 = 50; // Tentukan lebar logo di sini
        const logoX_page1 = doc.page.width - pageMargin - logoWidth_page1; // PERBAIKAN: Posisi X dihitung dari lebar logo

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, logoX_page1, logoY_page1, { width: logoWidth_page1 });
            // MODIFIKASI: Ubah font ke Times-Roman
            doc.fontSize(8).fillColor(airNavBlue).font('Times-Roman') // Sesuai permintaan
            .text('AirNav Indonesia', logoX_page1, logoY_page1 + 55, { width: logoWidth_page1, align: 'center' }); // Posisi teks di bawah logo
        }

        doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`TANGGAL : ${new Date(date + 'T00:00:00Z').toLocaleDateString('id-ID', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric'})}`, pageMargin, pageMargin + 50);
        doc.text(`DINAS   : ${shift.toUpperCase()}`, pageMargin, pageMargin + 65);

        // MODIFIKASI: Tambahkan garis horizontal hitam
        const lineY_page1 = pageMargin + 80; // Posisi Y untuk garis (sedikit di bawah teks logo)
        doc.strokeColor('black')
        .lineWidth(1) // Pakai 0.5pt biar rapi
        .moveTo(pageMargin, lineY_page1)
        .lineTo(doc.page.width - pageMargin, lineY_page1)
        .stroke();

        // Atur posisi Y untuk konten selanjutnya (menggantikan doc.moveDown(3))
        doc.y = lineY_page1 + 10; // Beri jarak 10pt dari garis

        // Judul Tabel Personel
        const titleYPersonel = doc.y; // Judul akan dimulai dari sini
        doc.rect(pageMargin, titleYPersonel, pageWidth, 20).fill(airNavBlue);
        doc.fontSize(11).fillColor('white').font('Helvetica-Bold')
           .text('PERSONEL YANG BERDINAS', pageMargin, titleYPersonel + 5, { align: 'center' });
        doc.moveDown();

        // Tabel Personel
        const tableTopPersonel = doc.y;
        const col1X = pageMargin;      // NO Kiri
        const col2X = col1X + 20;     // NAMA Kiri
        const col3X = col2X + 180;    // PARAF Kiri
        const col4X = col3X + 80;     // NO Kanan
        const col5X = col4X + 20;     // NAMA Kanan
        const col6X = col5X + 180;    // PARAF Kanan
        const rowHeight = 35;
        doc.lineWidth(1).strokeColor('black');

        // Header Tabel Personel
        doc.fontSize(9).fillColor('black').font('Helvetica-Bold');
        const headerY = tableTopPersonel;
        const headerHeight = 20;
        const headerTextY = headerY + 6;
        doc.rect(col1X, headerY, col2X-col1X, headerHeight).stroke(); doc.text('NO', col1X, headerTextY, {width: col2X-col1X, align:'center'});
        doc.rect(col2X, headerY, col3X-col2X, headerHeight).stroke(); doc.text('NAMA', col2X, headerTextY, {width: col3X-col2X, align:'center'});
        doc.rect(col3X, headerY, col4X-col3X, headerHeight).stroke(); doc.text('PARAF', col3X, headerTextY,{width: col4X-col3X, align:'center'});
        doc.rect(col4X, headerY, col5X-col4X, headerHeight).stroke(); doc.text('NO', col4X, headerTextY, {width: col5X-col4X, align:'center'});
        doc.rect(col5X, headerY, col6X-col5X, headerHeight).stroke(); doc.text('NAMA', col5X, headerTextY, {width: col6X-col5X, align:'center'});
        doc.rect(col6X, headerY, tableRightEdge-col6X, headerHeight).stroke(); doc.text('PARAF', col6X, headerTextY, {width: tableRightEdge-col6X, align:'center'});

        // Isi Tabel Personel
        for (let i = 0; i < 3; i++) {
            const y = headerY + headerHeight + (i * rowHeight);

            // --- Gambar 6 kotak untuk baris ini ---
            doc.rect(col1X, y, col2X - col1X, rowHeight).stroke();       // No Kiri
            doc.rect(col2X, y, col3X - col2X, rowHeight).stroke();       // Nama Kiri
            doc.rect(col3X, y, col4X - col3X, rowHeight).stroke();       // Paraf Kiri
            doc.rect(col4X, y, col5X - col4X, rowHeight).stroke();       // No Kanan
            doc.rect(col5X, y, col6X - col5X, rowHeight).stroke();       // Nama Kanan
            doc.rect(col6X, y, tableRightEdge - col6X, rowHeight).stroke(); // Paraf Kanan

            // --- Isi Kolom Kiri (Teknisi 1-5) ---
            const noKiri = `${i + 1}.`;
            const techNameKiri = technicianNames[i]; // Data index 0..4
            const techParafKiri = techNameKiri ? technicianSignatures[techNameKiri] : null;
            const parafWidthKiri = col4X - col3X - 10;

            doc.text(noKiri, col1X, y + 12, {width: col2X-col1X, align:'center'}); // Tulis No. Kiri
            if (techNameKiri) {
                doc.text(techNameKiri, col2X + 5, y + 12); // Tulis Nama Kiri
                if (techParafKiri && fs.existsSync(techParafKiri)) {
                    try {
                        // Gambar Paraf Kiri
                        doc.image(techParafKiri, col3X + 5, y + 3, { fit: [parafWidthKiri, rowHeight - 6], align: 'center', valign: 'center' });
                    } catch (imgError) { console.error(`Gagal memuat paraf ${techNameKiri}:`, imgError); }
                }
            }
            
            // --- Isi Kolom Kanan (Teknisi 6+) ---
            const noKanan = `${i + 1 + 3}.`; // No. 6, 7, 8, 9, 10
            const techNameKanan = technicianNames[i + 5]; // Data index 5 (jika ada)
            const techParafKanan = techNameKanan ? technicianSignatures[techNameKanan] : null;
            const parafWidthKanan = tableRightEdge - col6X - 10;

            doc.text(noKanan, col4X, y + 12, {width: col5X-col4X, align:'center'}); // Tulis No. Kanan
            if (techNameKanan) {
                doc.text(techNameKanan, col5X + 5, y + 12); // Tulis Nama Kanan
                if (techParafKanan && fs.existsSync(techParafKanan)) {
                    try {
                        // Gambar Paraf Kanan
                        doc.image(techParafKanan, col6X + 5, y + 3, { fit: [parafWidthKanan, rowHeight - 6], align: 'center', valign: 'center' });
                    } catch (imgError) { console.error(`Gagal memuat paraf ${techNameKanan}:`, imgError); }
                }
            }
        }
        doc.y = headerY + headerHeight + (5 * rowHeight); // Posisi Y setelah baris ke-5

        // Bagian Mengetahui
        const signatureX = col5X;
        const signatureWidth = tableRightEdge - col5X;
        
        // Tentukan Y-nya persis di bawah tabel
        const signatureY = doc.y + 10; 

        // Tulis "Mengetahui," dan "MANTEK"
        doc.fontSize(10).font('Helvetica').text('Mengetahui,', signatureX, signatureY, { align: 'center', width: signatureWidth });
        doc.text('MANTEK', signatureX, signatureY + 12, { align: 'center', width: signatureWidth });

        // Tentukan posisi dan tinggi gambar tanda tangan
        const signatureImageY = signatureY + 30;
        const signatureImageHeight = 50;

        if (mantekSignaturePath && fs.existsSync(mantekSignaturePath)) {
            try {
                // Gambar tanda tangan kalo ada
                doc.image(mantekSignaturePath, signatureX, signatureImageY, { fit: [150, signatureImageHeight], align: 'center' });
            } catch (imgError) { 
                console.error(`Gagal memuat ttd Mantek ${mantekName}:`, imgError); 
            }
        }

        // Tentukan posisi Y untuk nama (DI BAWAH area gambar)
        const nameY = signatureImageY + signatureImageHeight + 5; // Y Ttd + Tinggi Ttd + spasi

        // Tulis nama Mantek
        doc.font('Helvetica-Bold').text(mantekName || 'N/A', signatureX, nameY, { align: 'center', width: signatureWidth, underline: false });

        // Finalisasi PDF
        doc.end();

        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                console.log(`PDF berhasil dibuat: ${pdfPath}`);
                resolve({ success: true, filePath: pdfPath });
            });
            writeStream.on('error', (err) => {
                console.error('Gagal menulis PDF:', err);
                reject({ success: false, message: 'Gagal membuat file PDF.' });
            });
        });

    } catch (error) {
        console.error('Error saat generate PDF CNSD:', error);
        return { success: false, message: error.message || 'Terjadi kesalahan saat membuat PDF.' };
    }
});

ipcMain.handle('generate:cnsd-monthly-report-pdf', async (event, reportInfo) => {
    try {
        const { startDate, endDate, group, namaAlat } = reportInfo;
        const finalEndDate = endDate || startDate; // Jaga-jaga kalo 'sampai' kosong

        // 1. Ambil data kegiatan dari database
        const [activities] = await dbConnection.query(
            `SELECT * FROM cnsd_activities 
             WHERE tanggal BETWEEN ? AND ? 
             ORDER BY tanggal ASC, waktu_mulai ASC`,
            [startDate, finalEndDate]
        );

        // 2. Format data untuk PDF
        const formattedActivities = activities.map(activity => {
            const date = new Date(activity.tanggal);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            
            let namaAlatDisplayForRow = activity.alat || '-'; // Nama alat spesifik per kegiatan
            // Jika laporan utamanya untuk "ALL Equipment", tampilkan itu
            if (namaAlat === "ALL Equipment") {
                namaAlatDisplayForRow = "ALL EQUIPMENT"; // Pakai huruf besar biar sama kayak contoh
            } 
            // Jika tidak, coba parse (kalau formatnya array)
            else if (namaAlatDisplayForRow.startsWith('[') && namaAlatDisplayForRow.endsWith(']')) { 
                try {
                    const alatArr = JSON.parse(namaAlatDisplayForRow);
                    if (Array.isArray(alatArr) && alatArr.length > 0) {
                        namaAlatDisplayForRow = alatArr.join(', ');
                    }
                } catch (e) { /* Biarin */ }
            }

            return {
                tanggal: formattedDate,
                waktu_mulai: activity.waktu_mulai || '-',
                waktu_selesai: activity.waktu_selesai || '-',
                nama_alat: namaAlat,
                kegiatan: activity.tindakan || '-',
                terputus: activity.waktu_terputus || '-'
            };
        });

        // 3. Konfigurasi PDF
        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        const tempDir = app.getPath('temp');
        const fileName = `LAPORAN_BULANAN_${group}_${startDate.replace(/-/g, '')}_${finalEndDate.replace(/-/g, '')}.pdf`;
        const filePath = path.join(tempDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // --- Definisikan Konstanta ---
        const airNavBlue = '#255A9B';
        const pageMargin = 20;
        const startX = pageMargin;
        const pageWidth = doc.page.width - (pageMargin * 2); // 595.28 - 60 = 535.28
        const logoPath = path.join(__dirname, 'img/airnav_logo.png');

        // --- Header PDF (Logo & Judul) ---
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, (doc.page.width / 2) - 30, pageMargin, { width: 60 });
        }
        doc.moveDown(4); // Space setelah logo
        
        let headerY = doc.y;
        doc.font('Times-Bold').fontSize(12).fillColor(airNavBlue)
           .text('AirNav Indonesia', startX, headerY, { width: pageWidth, align: 'center' });
        doc.moveDown(0.5);
        
        headerY = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('black')
           .text(`Daftar Kegiatan ${formatDateForDisplay(startDate, { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${formatDateForDisplay(finalEndDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
                 startX, headerY, { width: pageWidth, align: 'center' });
        doc.moveDown(2); // Space sebelum tabel

        // --- Definisi Kolom Tabel ---
        const col1X = startX;          // Tanggal (Width 70)
        const col2X = col1X + 70;      // Mulai (Width 40)
        const col3X = col2X + 40;      // Selesai (Width 40)
        const col4X = col3X + 40;      // Nama Alat (Width 90)
        const col5X = col4X + 90;      // Kegiatan (Width 235)
        const col6X = col5X + 235;     // Terputus (Width 60)
        const tableRightEdge = col6X + 60.28; // Pasin ke 535.28

        let currentY = doc.y;

        // --- Fungsi Helper buat gambar Header (biar bisa dipake di halaman baru) ---
        const drawHeader = () => {
            const headerTopY = currentY;
            const headerMidY = headerTopY + 15; // 15pt for top row
            const headerBottomY = headerTopY + 30; // 15pt for bottom row (total 30pt height)
            
            // --- PERBAIKAN LOGIKA PEWARNAAN ---
            
            // 1. Gambar Background Biru DULU
            doc.rect(col1X, headerTopY, tableRightEdge - col1X, 30).fill(airNavBlue);

            // 2. Set Font, Warna Teks, dan Warna Garis
            doc.font('Helvetica-Bold').fontSize(8);
            doc.fillColor('white');
            doc.strokeColor('black');

            // 3. Gambar TANGGAL (full height)
            doc.rect(col1X, headerTopY, col2X - col1X, 30).stroke();
            doc.text('TANGGAL', col1X, headerTopY + 11, { width: col2X - col1X, align: 'center' });

            // 4. Gambar JAM (top, spans 2 cols)
            doc.rect(col2X, headerTopY, col4X - col2X, 15).stroke();
            doc.text('JAM', col2X, headerTopY + 4, { width: col4X - col2X, align: 'center' });
            
            // 5. Gambar Mulai (bottom-left)
            doc.rect(col2X, headerMidY, col3X - col2X, 15).stroke();
            doc.text('Mulai', col2X, headerMidY + 4, { width: col3X - col2X, align: 'center' });
            
            // 6. Gambar Selesai (bottom-right)
            doc.rect(col3X, headerMidY, col4X - col3X, 15).stroke();
            doc.text('Selesai', col3X, headerMidY + 4, { width: col4X - col3X, align: 'center' });

            // 7. Gambar NAMA ALAT (full height)
            doc.rect(col4X, headerTopY, col5X - col4X, 30).stroke();
            doc.text('NAMA ALAT', col4X, headerTopY + 11, { width: col5X - col4X, align: 'center' });

            // 8. Gambar KEGIATAN (full height)
            doc.rect(col5X, headerTopY, col6X - col5X, 30).stroke();
            doc.text('KEGIATAN', col5X, headerTopY + 11, { width: col6X - col5X, align: 'center' });

            // 9. Gambar TERPUTUS (full height)
            doc.rect(col6X, headerTopY, tableRightEdge - col6X, 30).stroke();
            doc.text('TERPUTUS', col6X, headerTopY + 11, { width: tableRightEdge - col6X, align: 'center' });
            
            // 10. Set Y ke awal body dan balikin warna ke hitam
            currentY = headerBottomY; 
            doc.strokeColor('black').fillColor('black');
            // --- AKHIR PERBAIKAN ---
        };
        
        // --- Gambar Header Pertama Kali ---
        drawHeader();

        // --- Gambar Isi Tabel ---
        doc.font('Helvetica').fontSize(8).fillColor('black');
        const rowPadding = 3;
        
        formattedActivities.forEach(item => {
            // Estimasi tinggi baris berdasarkan teks terpanjang (Nama Alat & Kegiatan)
            const kegiatanHeight = doc.heightOfString(item.kegiatan, { width: col6X - col5X - (rowPadding * 2) });
            const namaAlatHeight = doc.heightOfString(item.nama_alat, { width: col5X - col4X - (rowPadding * 2) });
            const rowHeight = Math.max(kegiatanHeight, namaAlatHeight, 15) + (rowPadding * 2); // 15 = min height

            // Cek Pindah Halaman
            if (currentY + rowHeight > doc.page.height - pageMargin) {
                doc.addPage();
                currentY = pageMargin;
                drawHeader();
            }

            // Gambar Kotak/Garis (Borders)
            doc.rect(col1X, currentY, col2X - col1X, rowHeight).stroke();
            doc.rect(col2X, currentY, col3X - col2X, rowHeight).stroke();
            doc.rect(col3X, currentY, col4X - col3X, rowHeight).stroke();
            doc.rect(col4X, currentY, col5X - col4X, rowHeight).stroke();
            doc.rect(col5X, currentY, col6X - col5X, rowHeight).stroke();
            doc.rect(col6X, currentY, tableRightEdge - col6X, rowHeight).stroke();

            // Gambar Teks (dengan alignment)
            const textY = currentY + 7; // <-- GANTI DI SINI (dari rowPadding jadi 6)
        doc.text(item.tanggal, col1X, textY, { width: col2X - col1X, align: 'center' });
        doc.text(item.waktu_mulai, col2X, textY, { width: col3X - col2X, align: 'center' });
        doc.text(item.waktu_selesai, col3X, textY, { width: col4X - col3X, align: 'center' });
        doc.text(item.nama_alat, col4X + rowPadding, textY, { width: col5X - col4X - (rowPadding * 2), align: 'center' }); // Padding X tetep perlu
        doc.text(item.kegiatan, col5X + rowPadding, textY, { width: col6X - col5X - (rowPadding * 2), align: 'left' }); // Padding X tetep perlu
        doc.text(item.terputus, col6X, textY, { width: tableRightEdge - col6X, align: 'center' });
            
            currentY += rowHeight;
        });

        // Finalisasi PDF
        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`PDF Bulanan berhasil dibuat: ${filePath}`);
                resolve({ success: true, filePath: filePath });
            });
            stream.on('error', (err) => {
                console.error('Gagal menulis PDF Bulanan:', err);
                reject({ success: false, message: 'Gagal membuat file PDF.' });
            });
        });

    } catch (error) {
        console.error('Error saat generate PDF CNSD Bulanan:', error);
        return { success: false, message: error.message || 'Terjadi kesalahan saat membuat PDF.' };
    }
});

// HANDLER BARU UNTUK MEMBUKA FILE PDF
ipcMain.handle('open:pdf', async (event, filePath) => {
    try {
        await shell.openPath(filePath);
        return { success: true };
    } catch (error) {
        console.error('Failed to open PDF:', error);
        return { success: false, message: 'Gagal membuka file PDF.' };
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