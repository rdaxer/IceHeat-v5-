/**
 * Filmora API - Renderer Process Bridge
 * Kommuniziert mit Main Process über Electron IPC
 */
const FilmoraAPI = (() => {
    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electron;

    return {
        /**
         * Erkenne Filmora Installation
         */
        async detect() {
            if (!isElectron) {
                console.warn('Filmora API: Not in Electron environment');
                return { installed: false };
            }

            try {
                return await window.electron.filmora.detect();
            } catch (error) {
                console.error('Filmora detection failed:', error);
                return { installed: false, error: error.message };
            }
        },

        /**
         * Starte Filmora
         */
        async launch(projectPath = null) {
            if (!isElectron) {
                console.warn('Filmora API: Not in Electron environment');
                return { success: false };
            }

            try {
                return await window.electron.filmora.launch(projectPath);
            } catch (error) {
                console.error('Filmora launch failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Exportiere Reel zu Filmora Project
         */
        async exportProject(videoData) {
            if (!isElectron) {
                console.warn('Filmora API: Not in Electron environment');
                return { success: false };
            }

            try {
                const data = {
                    title: videoData.title || 'IceHeat Reel',
                    duration: videoData.duration || 0,
                    fps: videoData.fps || 30,
                    resolution: videoData.resolution || '1080p',
                    metadata: videoData.metadata || {}
                };

                return await window.electron.filmora.exportProject(data);
            } catch (error) {
                console.error('Filmora export failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Importiere Filmora Project Output
         */
        async importProject(projectPath) {
            if (!isElectron) {
                console.warn('Filmora API: Not in Electron environment');
                return { success: false };
            }

            try {
                return await window.electron.filmora.importProject(projectPath);
            } catch (error) {
                console.error('Filmora import failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Überprüfe Filmora Status
         */
        async checkStatus() {
            if (!isElectron) {
                return {
                    installed: false,
                    isReady: false,
                    error: 'Not in Electron environment'
                };
            }

            const detection = await this.detect();
            if (!detection.installed) {
                return {
                    installed: false,
                    isReady: false,
                    message: 'Filmora nicht installiert'
                };
            }

            return {
                installed: true,
                isReady: true,
                path: detection.path,
                version: detection.version,
                licensed: detection.licensed
            };
        }
    };
})();
