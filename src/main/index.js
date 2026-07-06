const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1500,
        height: 950,
        minWidth: 1000,
        minHeight: 640,
        backgroundColor: '#0f1117',
        title: 'VideoReel Pro',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '..', 'preload.js')
        }
    });

    // Load the real Video Reel application (reel/index.html), NOT the root page.
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'reel', 'index.html'));

    mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
    createWindow();
    buildMenu();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function send(channel) {
    if (mainWindow) mainWindow.webContents.send(channel);
}

function buildMenu() {
    const template = [
        {
            label: 'Datei',
            submenu: [
                { label: 'Neues Projekt', accelerator: 'CmdOrCtrl+N', click: () => send('menu:new-project') },
                { label: 'Projekt speichern', accelerator: 'CmdOrCtrl+S', click: () => send('menu:save-project') },
                { type: 'separator' },
                {
                    label: 'Video importieren…', accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const r = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [{ name: 'Video', extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi'] }]
                        });
                        if (!r.canceled && r.filePaths[0]) {
                            mainWindow.webContents.send('menu:import-video', r.filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                { label: 'Beenden', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
            ]
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { role: 'undo', label: 'Rückgängig' },
                { role: 'redo', label: 'Wiederholen' },
                { type: 'separator' },
                { role: 'cut', label: 'Ausschneiden' },
                { role: 'copy', label: 'Kopieren' },
                { role: 'paste', label: 'Einfügen' },
                { role: 'selectAll', label: 'Alles auswählen' }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                { role: 'reload', label: 'Neu laden' },
                { role: 'toggleDevTools', label: 'Entwicklertools' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom zurücksetzen' },
                { role: 'zoomIn', label: 'Vergrößern' },
                { role: 'zoomOut', label: 'Verkleinern' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Vollbild' }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Kurzanleitung',
                    click: () => dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'VideoReel Pro – Kurzanleitung',
                        message: 'So erstellst du ein Reel',
                        detail:
                            '1.  Video per Drag & Drop oder „Video importieren“ laden\n' +
                            '2.  Optional Musik und ein Bild hinzufügen\n' +
                            '3.  „Szenen analysieren“ klicken – die besten Momente werden erkannt\n' +
                            '4.  Hook generieren, Musik synchronisieren, Effekte wählen\n' +
                            '5.  Titel, Beschreibung und Hashtags eintragen\n' +
                            '6.  Plattform wählen (TikTok / Instagram / YouTube) und exportieren'
                    })
                },
                {
                    label: 'Über VideoReel Pro',
                    click: () => dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Über VideoReel Pro',
                        message: `VideoReel Pro  v${app.getVersion()}`,
                        detail: 'Professioneller Video-Reel-Generator für Windows.\nSzenenerkennung · Musik-Sync · Hooks · Untertitel · Export.'
                    })
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---- Minimal, safe IPC (never throws if renderer calls it) ----
ipcMain.handle('app:info', () => ({ version: app.getVersion(), platform: process.platform }));
ipcMain.handle('dialog:open-file', (e, options) => dialog.showOpenDialog(mainWindow, options || {}));
ipcMain.handle('dialog:save-file', (e, options) => dialog.showSaveDialog(mainWindow, options || {}));
ipcMain.handle('dialog:message', (e, options) => dialog.showMessageBox(mainWindow, options || {}));
ipcMain.handle('system:open-url', (e, url) => shell.openExternal(url));
