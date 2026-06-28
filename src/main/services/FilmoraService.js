const { spawn } = require('child_process');
const path = require('path');
const Registry = require('winreg');
const log = require('electron-log');

/**
 * FilmoraService - Filmora Registry Detection & Integration
 */
class FilmoraService {
    constructor() {
        this.filmoraPath = null;
        this.filmoraVersion = null;
        this.isFilmoraInstalled = false;
    }

    /**
     * Erkenne Filmora Installation via Windows Registry
     */
    async detectFilmora() {
        return new Promise((resolve) => {
            const regKey = new Registry({
                hive: Registry.HKLM,
                key: '\\Software\\Wondershare\\Filmora'
            });

            regKey.values((err, items) => {
                if (err) {
                    log.warn('Filmora not found in registry:', err);
                    resolve({
                        installed: false,
                        path: null,
                        version: null,
                        licensed: false
                    });
                    return;
                }

                const pathItem = items.find(i => i.name === 'InstallPath');
                const versionItem = items.find(i => i.name === 'Version');
                const licenseItem = items.find(i => i.name === 'LicenseStatus');

                if (pathItem) {
                    this.filmoraPath = pathItem.value;
                    this.filmoraVersion = versionItem?.value || 'unknown';
                    this.isFilmoraInstalled = true;

                    log.info(`Filmora detected: ${this.filmoraPath} (v${this.filmoraVersion})`);

                    resolve({
                        installed: true,
                        path: this.filmoraPath,
                        version: this.filmoraVersion,
                        licensed: licenseItem?.value === 'Licensed'
                    });
                } else {
                    resolve({
                        installed: false,
                        path: null,
                        version: null,
                        licensed: false
                    });
                }
            });
        });
    }

    /**
     * Starte Filmora mit optionalem Projekt
     */
    async launchFilmora(projectPath = null) {
        return new Promise((resolve, reject) => {
            if (!this.isFilmoraInstalled) {
                reject(new Error('Filmora ist nicht installiert'));
                return;
            }

            const filmoraExe = path.join(this.filmoraPath, 'Filmora.exe');
            const args = projectPath ? [projectPath] : [];

            try {
                const proc = spawn(filmoraExe, args, {
                    detached: true,
                    stdio: 'ignore'
                });

                proc.unref();
                log.info('Filmora launched successfully');
                resolve({ success: true });
            } catch (error) {
                log.error('Failed to launch Filmora:', error);
                reject(error);
            }
        });
    }

    /**
     * Exportiere IceHeat Reel als Filmora Project
     */
    async exportToFilmoraProject(videoPath, metadata = {}) {
        return new Promise(async (resolve, reject) => {
            if (!this.isFilmoraInstalled) {
                reject(new Error('Filmora ist nicht installiert'));
                return;
            }

            try {
                const fs = require('fs');
                const path = require('path');

                // Erstelle Filmora Project Dateistruktur
                const projectName = metadata.title || 'IceHeat Reel';
                const projectDir = path.join(
                    require('electron').app.getPath('documents'),
                    'Filmora Projects',
                    projectName
                );

                // Erstelle Verzeichnis
                if (!fs.existsSync(projectDir)) {
                    fs.mkdirSync(projectDir, { recursive: true });
                }

                // Erstelle .wfp Projekt-Datei (vereinfachtes XML Format)
                const wfpContent = this.generateFilmoraProjectXML({
                    projectName,
                    videoPath,
                    duration: metadata.duration || 10,
                    fps: metadata.fps || 30,
                    resolution: metadata.resolution || '1080x1920',
                    metadata
                });

                const projectFile = path.join(projectDir, `${projectName}.wfp`);
                fs.writeFileSync(projectFile, wfpContent);

                log.info('Filmora project created at:', projectFile);

                resolve({
                    success: true,
                    projectPath: projectFile,
                    projectDir: projectDir,
                    projectName: projectName
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generiere Filmora Project XML
     */
    generateFilmoraProjectXML(data) {
        const { projectName, videoPath, duration, fps, resolution, metadata } = data;
        const [width, height] = resolution.split('x').map(Number);

        return `<?xml version="1.0" encoding="utf-8"?>
<filmora_project version="13.0">
    <project_info>
        <name>${projectName}</name>
        <created>${new Date().toISOString()}</created>
        <duration>${duration}</duration>
        <fps>${fps}</fps>
        <width>${width}</width>
        <height>${height}</height>
    </project_info>

    <timeline>
        <track type="video">
            <clip>
                <source>${videoPath}</source>
                <start>0</start>
                <duration>${duration}</duration>
                <position>0</position>
                <speed>1.0</speed>
            </clip>
        </track>
    </timeline>

    <metadata>
        <title>${metadata.title || ''}</title>
        <description>${metadata.description || ''}</description>
        <hashtags>${(metadata.hashtags || []).join(', ')}</hashtags>
        <platform>${metadata.platform || 'tiktok'}</platform>
    </metadata>

    <effects>
        <!-- Auto-generated hooks and effects can be added here -->
    </effects>
</filmora_project>`;
    }

    /**
     * Importiere Filmora Project Output
     */
    async importFromFilmoraProject(projectPath) {
        return new Promise((resolve, reject) => {
            try {
                // TODO: Parse Filmora .wfp XML format
                log.info('Importing from Filmora project:', projectPath);
                resolve({
                    success: true,
                    projectPath: projectPath
                });
            } catch (error) {
                log.error('Failed to import Filmora project:', error);
                reject(error);
            }
        });
    }

    /**
     * Hole Filmora Templates
     */
    async getFilmoraTemplates() {
        return new Promise((resolve) => {
            if (!this.isFilmoraInstalled) {
                resolve({ templates: [] });
                return;
            }

            const templatesPath = path.join(
                this.filmoraPath,
                'Resources',
                'Templates'
            );

            // TODO: Read template directory
            const templates = [
                { id: 1, name: 'Fade', category: 'Transitions' },
                { id: 2, name: 'Zoom', category: 'Effects' },
                { id: 3, name: 'Shake', category: 'Effects' },
                { id: 4, name: 'Blur', category: 'Filters' }
            ];

            resolve({ templates: templates });
        });
    }

    /**
     * Hole Filmora Presets
     */
    async getFilmoraPresets() {
        return new Promise((resolve) => {
            const presets = [
                { id: 'tiktok', name: 'TikTok HD', resolution: '1080p', aspectRatio: '9:16' },
                { id: 'instagram', name: 'Instagram Reel', resolution: '1080p', aspectRatio: '9:16' },
                { id: 'youtube', name: 'YouTube Short', resolution: '1440p', aspectRatio: '9:16' },
                { id: '4k', name: '4K UHD', resolution: '2160p', aspectRatio: '16:9' },
                { id: '1080p60', name: '1080p 60fps', resolution: '1080p', aspectRatio: '16:9' }
            ];

            resolve({ presets: presets });
        });
    }

    /**
     * Überprüfe Filmora Installation & Lizenz
     */
    async checkFilmoraStatus() {
        const detection = await this.detectFilmora();
        return {
            installed: detection.installed,
            path: detection.path,
            version: detection.version,
            licensed: detection.licensed,
            isReady: detection.installed && detection.licensed
        };
    }
}

module.exports = FilmoraService;
