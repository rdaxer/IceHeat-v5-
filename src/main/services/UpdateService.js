const { app, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const fs = require('fs').promises;
const path = require('path');

/**
 * UpdateService - Advanced Auto-Update System with electron-updater
 */
class UpdateService {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.updateState = {
            checking: false,
            available: false,
            downloaded: false,
            version: null,
            error: null
        };

        this.setupAutoUpdater();
    }

    /**
     * Setup electron-updater Listeners
     */
    setupAutoUpdater() {
        // Configure auto-updater
        autoUpdater.checkForUpdatesAndNotify = false; // Handle manually
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = false;

        // Listen for update available
        autoUpdater.on('update-available', (info) => {
            log.info('Update available:', info);
            this.updateState.available = true;
            this.updateState.version = info.version;
            this.notifyUpdateAvailable(info);
        });

        // Listen for update not available
        autoUpdater.on('update-not-available', (info) => {
            log.info('Update not available');
            this.updateState.available = false;
            this.notifyUpdateNotAvailable();
        });

        // Listen for update downloaded
        autoUpdater.on('update-downloaded', (info) => {
            log.info('Update downloaded:', info);
            this.updateState.downloaded = true;
            this.updateState.version = info.version;
            this.notifyUpdateDownloaded(info);
        });

        // Listen for download progress
        autoUpdater.on('download-progress', (progressObj) => {
            log.debug('Download progress:', {
                percent: progressObj.percent,
                transferred: progressObj.transferred,
                total: progressObj.total,
                bytesPerSecond: progressObj.bytesPerSecond
            });

            // Send progress to renderer
            if (this.mainWindow) {
                this.mainWindow.webContents.send('update:progress', {
                    percent: progressObj.percent,
                    bytesPerSecond: progressObj.bytesPerSecond,
                    transferred: Math.round(progressObj.transferred / 1024 / 1024),
                    total: Math.round(progressObj.total / 1024 / 1024)
                });
            }
        });

        // Listen for errors
        autoUpdater.on('error', (error) => {
            log.error('Auto-updater error:', error);
            this.updateState.error = error.message;
            this.notifyUpdateError(error);
        });

        // Register IPC handlers
        this.registerIpcHandlers();
    }

    /**
     * Register IPC Handlers
     */
    registerIpcHandlers() {
        // Check for updates
        ipcMain.handle('updater:check-for-updates', async () => {
            return await this.checkForUpdates();
        });

        // Get update status
        ipcMain.handle('updater:get-status', async () => {
            return this.getStatus();
        });

        // Quit and install
        ipcMain.handle('updater:quit-and-install', async () => {
            autoUpdater.quitAndInstall();
        });

        // Skip update
        ipcMain.handle('updater:skip-update', async () => {
            this.updateState.available = false;
            this.updateState.version = null;
            return { success: true };
        });

        // Download update manually
        ipcMain.handle('updater:download-update', async () => {
            if (this.updateState.available && !this.updateState.downloaded) {
                await autoUpdater.downloadUpdate();
                return { success: true, message: 'Download started' };
            }
            return { success: false, message: 'No update available' };
        });
    }

    /**
     * Check for updates
     */
    async checkForUpdates() {
        if (this.updateState.checking) {
            return { checking: true };
        }

        try {
            this.updateState.checking = true;
            const result = await autoUpdater.checkForUpdates();

            return {
                available: !!result.updateInfo,
                version: result.updateInfo?.version || null,
                releaseNotes: result.updateInfo?.releaseNotes || null,
                error: null
            };
        } catch (error) {
            log.error('Check for updates failed:', error);
            return {
                available: false,
                error: error.message
            };
        } finally {
            this.updateState.checking = false;
        }
    }

    /**
     * Get current update status
     */
    getStatus() {
        return {
            ...this.updateState,
            appVersion: app.getVersion()
        };
    }

    /**
     * Notify: Update Available
     */
    notifyUpdateAvailable(info) {
        if (!this.mainWindow) return;

        this.mainWindow.webContents.send('update:available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes,
            files: info.files.map(f => ({
                url: f.url,
                sha512: f.sha512,
                size: Math.round(f.size / 1024 / 1024) // Convert to MB
            }))
        });

        // Optional: Show dialog
        if (process.env.NODE_ENV !== 'development') {
            this.showUpdateDialog(info.version);
        }
    }

    /**
     * Notify: Update Not Available
     */
    notifyUpdateNotAvailable() {
        if (!this.mainWindow) return;
        this.mainWindow.webContents.send('update:not-available');
    }

    /**
     * Notify: Update Downloaded
     */
    notifyUpdateDownloaded(info) {
        if (!this.mainWindow) return;

        this.mainWindow.webContents.send('update:downloaded', {
            version: info.version,
            releaseDate: info.releaseDate
        });

        // Show install dialog
        this.showInstallDialog(info.version);
    }

    /**
     * Notify: Update Error
     */
    notifyUpdateError(error) {
        if (!this.mainWindow) return;

        this.mainWindow.webContents.send('update:error', {
            message: error.message,
            code: error.code
        });

        log.error('Update error notified to renderer:', error.message);
    }

    /**
     * Show Update Available Dialog
     */
    async showUpdateDialog(version) {
        if (!this.mainWindow) return;

        const response = await dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Update verfügbar',
            message: `IceHeat Desktop v${version} ist verfügbar`,
            detail: 'Eine neue Version steht zum Download zur Verfügung. Sie wird automatisch heruntergeladen.',
            buttons: ['Jetzt herunterladen', 'Später', 'Nicht mehr zeigen'],
            defaultId: 0,
            cancelId: 1
        });

        if (response.response === 0) {
            // User clicked "Jetzt herunterladen"
            this.mainWindow.webContents.send('menu:update-check-manual');
        } else if (response.response === 2) {
            // User clicked "Nicht mehr zeigen"
            this.updateState.available = false;
        }
    }

    /**
     * Show Install Dialog
     */
    async showInstallDialog(version) {
        if (!this.mainWindow) return;

        const response = await dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'Update bereit',
            message: `IceHeat Desktop v${version} wurde heruntergeladen`,
            detail: 'Bitte starten Sie die Anwendung neu, um das Update zu installieren.',
            buttons: ['Jetzt neustarten', 'Später'],
            defaultId: 0
        });

        if (response.response === 0) {
            // User clicked "Jetzt neustarten"
            autoUpdater.quitAndInstall();
        }
    }

    /**
     * Auto-check für Updates (täglich)
     */
    scheduleAutoCheck() {
        // Check immediately on startup
        this.checkForUpdates();

        // Then check every 24 hours
        setInterval(async () => {
            log.info('Scheduled auto-update check...');
            await this.checkForUpdates();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Dispose service
     */
    dispose() {
        // Cleanup listeners if needed
        log.info('UpdateService disposed');
    }
}

module.exports = UpdateService;
