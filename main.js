// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Method untuk berkomunikasi dengan main process jika diperlukan
  openPath: (path) => ipcRenderer.invoke('dialog:openFile', path),
  
  // Method untuk handle sistem operasi info
  platform: process.platform,
  
  // Method untuk handle app version jika diperlukan
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Method untuk print functionality yang lebih baik
  printToPDF: (options) => ipcRenderer.invoke('app:printToPDF', options),
  
  // Method untuk handle file operations jika diperlukan di masa depan
  saveFile: (filename, data) => ipcRenderer.invoke('file:save', filename, data),
  readFile: (filename) => ipcRenderer.invoke('file:read', filename)
});

// Window event listeners untuk optimasi
window.addEventListener('DOMContentLoaded', () => {
  // Fungsi yang akan dijalankan setelah DOM selesai dimuat
  console.log('Electron app loaded successfully');
  
  // Optional: Add any initialization code here
  const appVersion = document.getElementById('app-version');
  if (appVersion) {
    // Set version info if element exists
    appVersion.textContent = `v${process.env.npm_package_version || '1.0.0'}`;
  }
});

// Security: Disable node integration in renderer
delete window.module;
delete window.process;
delete window.Buffer;
delete window.global;