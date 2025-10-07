// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    register: (userData) => ipcRenderer.invoke('db:register', userData),
    login: (username, password) => ipcRenderer.invoke('db:login', username, password),

    // PASTIKAN BARIS DI BAWAH INI ADA DAN TIDAK ADA TYPO
    updateProfile: (userData) => ipcRenderer.invoke('db:update-profile', userData)
});