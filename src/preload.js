const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getAppInfo: () => ipcRenderer.invoke('app:info'),

    openFile: (options) => ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),
    showMessage: (options) => ipcRenderer.invoke('dialog:message', options),

    // Menu -> renderer events
    onMenuNewProject: (cb) => ipcRenderer.on('menu:new-project', () => cb()),
    onMenuSaveProject: (cb) => ipcRenderer.on('menu:save-project', () => cb()),
    onMenuImportVideo: (cb) => ipcRenderer.on('menu:import-video', (e, p) => cb(p)),

    system: {
        openUrl: (url) => ipcRenderer.invoke('system:open-url', url)
    }
});
