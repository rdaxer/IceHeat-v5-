/**
 * Filmora Export API - Professional Filmora Integration
 * Phase 4: Advanced Filmora Project Export/Import
 */
const FilmoraExportAPI = (() => {
    const isElectron = typeof window !== 'undefined' && window.electron;

    return {
        /**
         * Check Filmora Installation & Status
         */
        async checkStatus() {
            if (!isElectron) {
                return { installed: false, message: 'Not in Electron' };
            }

            try {
                const status = await window.electron.filmora?.detect?.() || {
                    installed: false
                };
                return status;
            } catch (error) {
                console.error('Filmora status check failed:', error);
                return { installed: false, error: error.message };
            }
        },

        /**
         * Export Reel as Filmora Project
         */
        async exportAsFilmoraProject(videoPath, metadata = {}) {
            if (!isElectron) {
                return { success: false, message: 'Not in Electron' };
            }

            try {
                const result = await window.electron.filmora?.exportProject?.({
                    videoPath,
                    title: metadata.title || 'IceHeat Reel',
                    duration: metadata.duration || 10,
                    fps: metadata.fps || 30,
                    resolution: metadata.resolution || '1080x1920',
                    platform: metadata.platform || 'tiktok',
                    hashtags: metadata.hashtags || [],
                    description: metadata.description || '',
                    metadata
                }) || { success: false };

                if (result.success) {
                    console.log('✅ Filmora project created:', result.projectPath);
                }

                return result;
            } catch (error) {
                console.error('Filmora export failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Open project in Filmora
         */
        async openInFilmora(projectPath = null) {
            if (!isElectron) {
                return { success: false };
            }

            try {
                const result = await window.electron.filmora?.launch?.(projectPath) || {
                    success: false
                };
                return result;
            } catch (error) {
                console.error('Failed to open Filmora:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Export and open in Filmora (combined)
         */
        async exportAndOpen(videoPath, metadata = {}) {
            // First export as project
            const exportResult = await this.exportAsFilmoraProject(videoPath, metadata);

            if (!exportResult.success) {
                return exportResult;
            }

            // Then open in Filmora
            const openResult = await this.openInFilmora(exportResult.projectPath);

            return {
                success: openResult.success,
                projectPath: exportResult.projectPath,
                message: 'Project exported and opened in Filmora'
            };
        },

        /**
         * Get Filmora Templates
         */
        async getTemplates() {
            if (!isElectron) {
                return { templates: [] };
            }

            try {
                const result = await window.electron.filmora?.getTemplates?.() || {
                    templates: []
                };
                return result;
            } catch (error) {
                console.error('Failed to get templates:', error);
                return { templates: [], error: error.message };
            }
        },

        /**
         * Get Filmora Presets (Exports)
         */
        async getExportPresets() {
            if (!isElectron) {
                return { presets: [] };
            }

            try {
                const result = await window.electron.filmora?.getPresets?.() || {
                    presets: []
                };
                return result;
            } catch (error) {
                console.error('Failed to get presets:', error);
                return { presets: [], error: error.message };
            }
        },

        /**
         * Platform-optimized Filmora settings
         */
        platformSettings: {
            tiktok: {
                resolution: '1080x1920',
                fps: 30,
                aspectRatio: '9:16',
                maxDuration: 180,
                template: 'TikTok Trending',
                effects: ['Zoom', 'Fade', 'Beat Sync']
            },
            instagram: {
                resolution: '1080x1350',
                fps: 30,
                aspectRatio: '4:5',
                maxDuration: 60,
                template: 'Instagram Reel',
                effects: ['Fade', 'Slide', 'Music Sync']
            },
            youtube: {
                resolution: '1440x2560',
                fps: 60,
                aspectRatio: '9:16',
                maxDuration: 300,
                template: 'YouTube Shorts',
                effects: ['Professional', 'Cinematic', '4K']
            },
            youtube_shorts: {
                resolution: '1080x1920',
                fps: 60,
                aspectRatio: '9:16',
                maxDuration: 60,
                template: 'Shorts - Dynamic',
                effects: ['Trending', 'Music Sync', 'Text']
            },
            twitter: {
                resolution: '1200x675',
                fps: 30,
                aspectRatio: '16:9',
                maxDuration: 120,
                template: 'Twitter/X',
                effects: ['Minimal', 'Clean', 'Text']
            }
        },

        /**
         * Generate Filmora project with platform settings
         */
        async exportForPlatform(videoPath, platform = 'tiktok', customMetadata = {}) {
            const settings = this.platformSettings[platform];
            if (!settings) {
                return { success: false, error: `Unknown platform: ${platform}` };
            }

            const metadata = {
                ...customMetadata,
                platform,
                resolution: settings.resolution,
                fps: settings.fps,
                maxDuration: settings.maxDuration
            };

            return await this.exportAsFilmoraProject(videoPath, metadata);
        },

        /**
         * Import edited Filmora project back
         */
        async importFilmoraProject(projectPath) {
            if (!isElectron) {
                return { success: false };
            }

            try {
                const result = await window.electron.filmora?.importProject?.(projectPath) || {
                    success: false
                };
                return result;
            } catch (error) {
                console.error('Failed to import Filmora project:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * List templates by category
         */
        async getTemplatesByCategory(category = 'trending') {
            const allTemplates = await this.getTemplates();

            if (!allTemplates.templates) {
                return [];
            }

            return allTemplates.templates.filter(t => t.category === category);
        },

        /**
         * Get recommended Filmora settings for video
         */
        async getRecommendedSettings(duration, resolution) {
            // Return Filmora settings based on video properties
            return {
                fps: resolution.includes('4k') ? 60 : 30,
                bitrate: resolution.includes('1080') ? '8000k' : '5000k',
                profile: resolution.includes('4k') ? '4K Professional' : 'Standard HD',
                estimatedRenderTime: this.estimateRenderTime(duration)
            };
        },

        /**
         * Estimate render time in Filmora
         */
        estimateRenderTime(durationSeconds) {
            // Very rough estimate: 1 minute video takes ~30-60 seconds to render
            const renderTimeSeconds = (durationSeconds / 60) * 45; // Average 45 seconds per minute

            const minutes = Math.floor(renderTimeSeconds / 60);
            const seconds = Math.floor(renderTimeSeconds % 60);

            return {
                estimated: `${minutes}m ${seconds}s`,
                min: `${Math.floor(minutes * 0.5)}m`,
                max: `${Math.ceil(minutes * 1.5)}m`,
                message: `Rendering usually takes ${minutes}-${Math.ceil(minutes * 1.5)} minutes`
            };
        },

        /**
         * Check Filmora version
         */
        async getVersion() {
            const status = await this.checkStatus();
            return {
                version: status.version || 'unknown',
                installed: status.installed,
                licensed: status.licensed
            };
        }
    };
})();
