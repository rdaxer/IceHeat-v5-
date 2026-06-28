const { Tray, Menu, BrowserWindow, app } = require('electron');
const path = require('path');
const log = require('electron-log');

/**
 * SystemTrayService - Windows System Tray Integration
 * Phase 5: Polish & Release
 */
class SystemTrayService {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.tray = null;
        this.initializeTray();
    }

    /**
     * Initialize system tray
     */
    initializeTray() {
        // Create tray icon
        const iconPath = path.join(__dirname, '../../build/icons/app.ico');
        this.tray = new Tray(iconPath);

        // Create context menu
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show/Hide',
                click: () => {
                    if (this.mainWindow) {
                        if (this.mainWindow.isVisible()) {
                            this.mainWindow.hide();
                        } else {
                            this.mainWindow.show();
                        }
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quick Export',
                submenu: [
                    { label: 'TikTok', click: () => this.quickExport('tiktok') },
                    { label: 'Instagram', click: () => this.quickExport('instagram') },
                    { label: 'YouTube', click: () => this.quickExport('youtube') }
                ]
            },
            {
                label: 'Check for Updates',
                click: () => {
                    if (this.mainWindow) {
                        this.mainWindow.webContents.send('menu:update-check-manual');
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Exit',
                click: () => {
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(contextMenu);

        // Click action: Show main window
        this.tray.on('click', () => {
            if (this.mainWindow) {
                if (this.mainWindow.isVisible()) {
                    this.mainWindow.focus();
                } else {
                    this.mainWindow.show();
                }
            }
        });

        log.info('System tray initialized');
    }

    /**
     * Set tray tooltip
     */
    setTooltip(text) {
        if (this.tray) {
            this.tray.setToolTip(text);
        }
    }

    /**
     * Show notification
     */
    displayBalloon(title, content) {
        if (this.tray) {
            this.tray.displayBalloon({
                title: title,
                content: content,
                icon: path.join(__dirname, '../../build/icons/app.ico')
            });
        }
    }

    /**
     * Update tray menu
     */
    updateMenu(newTemplate) {
        if (this.tray) {
            const menu = Menu.buildFromTemplate(newTemplate);
            this.tray.setContextMenu(menu);
        }
    }

    /**
     * Quick export shortcut
     */
    quickExport(platform) {
        if (this.mainWindow) {
            this.mainWindow.webContents.send('menu:quick-export', { platform });
        }
    }

    /**
     * Destroy tray
     */
    destroy() {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
        }
    }
}

module.exports = SystemTrayService;
