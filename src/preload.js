const { contextBridge, ipcRenderer } = require('electron');

// Sichere Context Bridge für IPC
contextBridge.exposeInMainWorld('electron', {
    // App Info
    getAppInfo: () => ipcRenderer.invoke('app:info'),

    // File Dialogs
    openFile: (options) => ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),
    showMessage: (options) => ipcRenderer.invoke('dialog:message', options),

    // Menu Events (Renderer → Main Listen)
    onMenuNewProject: (callback) => ipcRenderer.on('menu:new-project', callback),
    onMenuOpenProject: (callback) => ipcRenderer.on('menu:open-project', (event, path) => callback(path)),
    onMenuSaveProject: (callback) => ipcRenderer.on('menu:save-project', callback),
    onMenuSettings: (callback) => ipcRenderer.on('menu:settings', callback),
    onMenuToolsSettings: (callback) => ipcRenderer.on('menu:tools-settings', callback),

    // Update Events
    onUpdateAvailable: (callback) => ipcRenderer.on('update:available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update:downloaded', callback),
    quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),

    // Filmora Integration
    filmora: {
        detect: () => ipcRenderer.invoke('filmora:detect'),
        launch: () => ipcRenderer.invoke('filmora:launch'),
        exportProject: (data) => ipcRenderer.invoke('filmora:export-project', data),
        importProject: (path) => ipcRenderer.invoke('filmora:import-project', path)
    },

    // Pro-Tools Integration
    tools: {
        getToolInfo: () => ipcRenderer.invoke('tools:get-info'),
        encodeVideo: (input, output, options) =>
            ipcRenderer.invoke('tools:encode-video', { input, output, options }),
        generateThumbnail: (input, output) =>
            ipcRenderer.invoke('tools:generate-thumbnail', { input, output }),
        getVideoMetadata: (input) =>
            ipcRenderer.invoke('tools:get-metadata', { input })
    },

    // System Integration
    system: {
        openExplorer: (path) => ipcRenderer.invoke('system:open-explorer', path),
        openUrl: (url) => ipcRenderer.invoke('system:open-url', url),
        getSystemInfo: () => ipcRenderer.invoke('system:get-info')
    }
});

console.log('Electron preload script loaded');
