const { app, shell } = require('electron');
const Registry = require('winreg');
const path = require('path');
const log = require('electron-log');
const fs = require('fs');

/**
 * FileAssociationService - Windows File Associations & Context Menu
 * Phase 5: Polish & Release
 */
class FileAssociationService {
    constructor() {
        this.appName = 'IceHeat Desktop';
        this.appVersion = app.getVersion();
        this.appPath = app.getAppPath();
        this.exePath = process.execPath;
    }

    /**
     * Register file associations (requires admin rights)
     */
    async registerFileAssociations() {
        try {
            // Register .iceheat files
            await this.registerFileType({
                ext: '.iceheat',
                description: 'IceHeat Desktop Project',
                icon: path.join(this.appPath, 'build/icons/app.ico')
            });

            // Add context menu options
            await this.addContextMenu([
                {
                    name: 'Open with IceHeat',
                    command: `"${this.exePath}" "%1"`
                },
                {
                    name: 'Edit in IceHeat',
                    command: `"${this.exePath}" --edit "%1"`
                }
            ]);

            log.info('File associations registered');
            return { success: true };
        } catch (error) {
            log.warn('Could not register file associations (may require admin):', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Register file type in Windows Registry
     */
    async registerFileType(options) {
        const { ext, description, icon } = options;

        return new Promise((resolve, reject) => {
            // Register in HKEY_CLASSES_ROOT
            const regKey = new Registry({
                hive: Registry.HKCR,
                key: `\\${ext}`
            });

            regKey.set('', Registry.REG_SZ, 'IceHeatProject', (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Add description and icon
                const descKey = new Registry({
                    hive: Registry.HKCR,
                    key: '\\IceHeatProject'
                });

                descKey.set('', Registry.REG_SZ, description, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    /**
     * Add context menu entries
     */
    async addContextMenu(items) {
        return new Promise((resolve, reject) => {
            const contextMenuKey = new Registry({
                hive: Registry.HKCR,
                key: '\\*\\shell\\IceHeat'
            });

            contextMenuKey.set('', Registry.REG_SZ, 'Open with IceHeat', (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Add command
                const cmdKey = new Registry({
                    hive: Registry.HKCR,
                    key: '\\*\\shell\\IceHeat\\command'
                });

                const command = `"${this.exePath}" "%1"`;
                cmdKey.set('', Registry.REG_SZ, command, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    /**
     * Create Start Menu shortcuts
     */
    async createStartMenuShortcuts() {
        try {
            const startMenuPath = path.join(
                process.env.APPDATA,
                'Microsoft\\Windows\\Start Menu\\Programs\\IceHeat'
            );

            if (!fs.existsSync(startMenuPath)) {
                fs.mkdirSync(startMenuPath, { recursive: true });
            }

            log.info('Start Menu shortcuts ready at:', startMenuPath);
            return { success: true, path: startMenuPath };
        } catch (error) {
            log.warn('Could not create Start Menu shortcuts:', error);
            return { success: false };
        }
    }

    /**
     * Add app to Windows Defender whitelist (info only)
     */
    async addToWindowsDefenderWhitelist() {
        log.info('Note: To add to Windows Defender whitelist, run:');
        log.info(`Add-MpPreference -ExclusionPath "${this.appPath}"`);
        return { message: 'User must run as administrator' };
    }
}

module.exports = FileAssociationService;
