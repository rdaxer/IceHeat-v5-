const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const UpdateService = require('./services/UpdateService');
const { registerIpcHandlers } = require('./ipc/handlers');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

let mainWindow;
let updateService;

// Erstelle das Hauptfenster
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, '../preload.js'),
            sandbox: true
        },
        icon: path.join(__dirname, '../../build/icons/app.ico')
    });

    // Load the app
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../../index.html')}`;

    mainWindow.loadURL(startUrl);

    // Open DevTools in Development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

// App Event Listeners
app.on('ready', async () => {
    createWindow();
    createApplicationMenu();
    registerIpcHandlers();

    // Initialize update service
    updateService = new UpdateService(mainWindow);

    // Schedule auto-update checks
    if (!isDev) {
        updateService.scheduleAutoCheck();
    } else {
        log.info('Development mode: Auto-updates disabled');
    }
});

app.on('window-all-closed', () => {
    // On Windows, typically applications will quit when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (mainWindow === null) {
        createWindow();
    }
});

// Create Application Menu
function createApplicationMenu() {
    const template = [
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Neues Projekt',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu:new-project');
                        }
                    }
                },
                {
                    label: 'Projekt öffnen',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [{ name: 'IceHeat Projects', extensions: ['iceheat'] }]
                        });
                        if (filePaths.length > 0) {
                            mainWindow.webContents.send('menu:open-project', filePaths[0]);
                        }
                    }
                },
                {
                    label: 'Speichern',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu:save-project');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Beenden',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                { role: 'toggleDevTools' },
                { role: 'toggleFullScreen' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Filmora öffnen',
                    click: async () => {
                        const result = await ipcMain.invoke('filmora:detect');
                        if (result.installed) {
                            await ipcMain.invoke('filmora:launch');
                        } else {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'Filmora nicht gefunden',
                                message: 'Bitte installieren Sie Wondershare Filmora zuerst.'
                            });
                        }
                    }
                },
                {
                    label: 'Pro-Tools verwalten',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu:tools-settings');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Einstellungen',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu:settings');
                        }
                    }
                }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Benutzerhandbuch',
                    click: async () => {
                        await shell.openExternal('https://github.com/rdaxer/IceHeat-v5-/wiki');
                    }
                },
                {
                    label: 'GitHub Repository',
                    click: async () => {
                        await shell.openExternal('https://github.com/rdaxer/IceHeat-v5-');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Auf Updates prüfen',
                    click: async () => {
                        const result = await autoUpdater.checkForUpdates();
                        if (!result.updateInfo.version || result.updateInfo.version === app.getVersion()) {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'Keine Updates verfügbar',
                                message: 'Sie verwenden bereits die neueste Version.'
                            });
                        }
                    }
                },
                {
                    label: 'Über IceHeat Desktop',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Über IceHeat Desktop',
                            message: `IceHeat Desktop v${app.getVersion()}`,
                            detail: 'Professionelle Video-Reel & Eisspeedway Management Anwendung\n\n© 2024 IceHeat Team'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// ===== IPC HANDLERS =====

// Demo Filmora Detection (wird später mit echter Registry-Logik ersetzt)
ipcMain.handle('filmora:detect', async () => {
    // TODO: Implement real Registry detection
    return {
        installed: false,
        path: null,
        version: null
    };
});

// Demo Filmora Launch
ipcMain.handle('filmora:launch', async () => {
    // TODO: Implement real Filmora launch
    return { success: false };
});

// Get App Info
ipcMain.handle('app:info', async () => {
    return {
        version: app.getVersion(),
        isDev: isDev,
        appPath: app.getAppPath(),
        userDataPath: app.getPath('userData')
    };
});

// File Dialog: Open
ipcMain.handle('dialog:open-file', async (event, options) => {
    return await dialog.showOpenDialog(mainWindow, options);
});

// File Dialog: Save
ipcMain.handle('dialog:save-file', async (event, options) => {
    return await dialog.showSaveDialog(mainWindow, options);
});

// Show message box
ipcMain.handle('dialog:message', async (event, options) => {
    return await dialog.showMessageBox(mainWindow, options);
});

module.exports = { app, mainWindow };
