// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Fungsi untuk Registrasi, Login, Profil
    register: (userData) => ipcRenderer.invoke('db:register', userData),
    login: (username, password) => ipcRenderer.invoke('db:login', username, password),
    updateProfile: (userData) => ipcRenderer.invoke('db:update-profile', userData),

    // Fungsi untuk Jadwal CNSD
    getTechnicians: () => ipcRenderer.invoke('db:get-technicians'),
    saveCnsdSchedule: (scheduleData) => ipcRenderer.invoke('db:save-cnsd-schedule', scheduleData),
    getCnsdSchedules: () => ipcRenderer.invoke('db:get-cnsd-schedules'),
    getCnsdScheduleById: (id) => ipcRenderer.invoke('db:get-cnsd-schedule-by-id', id),
    updateCnsdSchedule: (scheduleData) => ipcRenderer.invoke('db:update-cnsd-schedule', scheduleData),
    getTechniciansBySchedule: (data) => ipcRenderer.invoke('db:get-technicians-by-schedule', data),
    
    // Fungsi untuk Daily CNSD
    getCnsdEquipment: () => ipcRenderer.invoke('db:get-cnsd-equipment'),
    saveCnsdReport: (reportData) => ipcRenderer.invoke('db:save-cnsd-report', reportData),
    getCnsdReports: () => ipcRenderer.invoke('db:get-cnsd-reports'),
    getCnsdReportById: (id) => ipcRenderer.invoke('db:get-cnsd-report-by-id', id),
    updateCnsdReport: (reportData) => ipcRenderer.invoke('db:update-cnsd-report', reportData),

    // fungsi untuk Kegiatan CNSD
    getCnsdActivities: () => ipcRenderer.invoke('db:get-cnsd-activities'),
    saveCnsdActivity: (activityData) => ipcRenderer.invoke('db:save-cnsd-activity', activityData),
    getCnsdActivityById: (id) => ipcRenderer.invoke('db:get-cnsd-activity-by-id', id),
    readFileAsBase64: (filePath) => ipcRenderer.invoke('fs:read-file-base64', filePath),

    // Fungsi untuk Jadwal TFP
    getTfpSchedules: () => ipcRenderer.invoke('db:get-tfp-schedules'),
    saveTfpSchedule: (scheduleData) => ipcRenderer.invoke('db:save-tfp-schedule', scheduleData),
    getTfpScheduleById: (id) => ipcRenderer.invoke('db:get-tfp-schedule-by-id', id),
    updateTfpSchedule: (scheduleData) => ipcRenderer.invoke('db:update-tfp-schedule', scheduleData),

    // Fungsi untuk Daily TFP
    getTfpEquipment: () => ipcRenderer.invoke('db:get-tfp-equipment'),
    saveTfpReport: (reportData) => ipcRenderer.invoke('db:save-tfp-report', reportData),
    getTfpReports: () => ipcRenderer.invoke('db:get-tfp-reports'),
    getTfpReportById: (id) => ipcRenderer.invoke('db:get-tfp-report-by-id', id),
    updateTfpReport: (reportData) => ipcRenderer.invoke('db:update-tfp-report', reportData),

    // Fungsi untuk Kegiatan TFP
    getTfpActivities: () => ipcRenderer.invoke('db:get-tfp-activities'),
    saveTfpActivity: (activityData) => ipcRenderer.invoke('db:save-tfp-activity', activityData),
    getTfpActivityById: (id) => ipcRenderer.invoke('db:get-tfp-activity-by-id', id),

    //Fungsi untuk Work Order CNSD
    saveCnsdWorkorder: (data) => ipcRenderer.invoke('db:save-cnsd-workorder', data),
    getCnsdWorkorders: () => ipcRenderer.invoke('db:get-cnsd-workorders'),
    getCnsdWorkorderById: (id) => ipcRenderer.invoke('db:get-cnsd-workorder-by-id', id),
    deleteCnsdWorkorder: (id) => ipcRenderer.invoke('db:delete-cnsd-workorder', id),

    //Fungsi untuk Work Order TFP
    getTfpTechniciansBySchedule: (data) => ipcRenderer.invoke('db:get-tfp-technicians-by-schedule', data),
    saveTfpWorkorder: (data) => ipcRenderer.invoke('db:save-tfp-workorder', data),
    getTfpWorkorders: () => ipcRenderer.invoke('db:get-tfp-workorders'),
    getTfpWorkorderById: (id) => ipcRenderer.invoke('db:get-tfp-workorder-by-id', id),
    deleteTfpWorkorder: (id) => ipcRenderer.invoke('db:delete-tfp-workorder', id),
    
    // --- API UNTUK JADWAL GOOGLE SHEET ---
    onUpdateSchedule: (callback) => ipcRenderer.on('update-schedule', (event, data) => callback(data)),
    onScheduleError: (callback) => ipcRenderer.on('schedule-error', () => callback()),
    openSheet: () => ipcRenderer.invoke('open-sheet') // <-- Fungsi baru untuk buka sheet
});