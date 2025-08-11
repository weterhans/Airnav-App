// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Fungsi buat bikin jendela aplikasi
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'logo Airnav Indo.png'), // Ganti 'logo_aplikasi.png' dengan nama file ikonmu
    webPreferences: {
      // Preload script ini jadi "jembatan" antara backend (main.js) dan frontend (tampilan web)
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Muat file HTML sebagai tampilan utama aplikasi
  win.maximize();
  win.loadFile('index.html');
};

// Panggil fungsi createWindow pas aplikasi udah siap
app.whenReady().then(() => {
  createWindow();

  // Buat jendela baru kalo ikon di-klik (buat macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Tutup aplikasi kalo semua jendela ditutup (kecuali di macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});