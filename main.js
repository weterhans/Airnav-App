// main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');

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

// Logika saat aplikasi siap dijalankan (dengan pengecekan koneksi)
app.whenReady().then(async () => {
    const isDbConnected = await checkDbConnection();

    if (isDbConnected) {
        createWindow(); // Jika koneksi berhasil, tampilkan aplikasi
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