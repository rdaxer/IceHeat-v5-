/**
 * Tools API - Local FFmpeg, ImageMagick, MediaInfo
 * Renderer Process Bridge
 */
const ToolsAPI = (() => {
    const isElectron = typeof window !== 'undefined' && window.electron;

    return {
        /**
         * Überprüfe installierte Tools
         */
        async checkTools() {
            if (!isElectron) {
                console.warn('Tools API: Not in Electron environment');
                return { allInstalled: false };
            }

            try {
                return await window.electron.tools.getToolInfo();
            } catch (error) {
                console.error('Tools check failed:', error);
                return { allInstalled: false, error: error.message };
            }
        },

        /**
         * Konvertiere Video mit lokalen FFmpeg
         * @param {string} inputPath - Input video path
         * @param {string} outputPath - Output video path
         * @param {object} options - Encoding options (codec, bitrate, preset, etc)
         * @param {function} onProgress - Progress callback
         */
        async encodeVideo(inputPath, outputPath, options = {}, onProgress = null) {
            if (!isElectron) {
                console.warn('Tools API: Not in Electron environment');
                return { success: false };
            }

            try {
                const defaultOptions = {
                    codec: 'h264',
                    bitrate: '5000k',
                    preset: 'medium',
                    fps: 30,
                    resolution: '1920x1080'
                };

                const finalOptions = { ...defaultOptions, ...options };

                return await window.electron.tools.encodeVideo(
                    inputPath,
                    outputPath,
                    finalOptions
                );
            } catch (error) {
                console.error('Video encoding failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Generiere Thumbnail aus Video
         */
        async generateThumbnail(inputPath, outputPath, timeOffset = '00:00:01') {
            if (!isElectron) {
                console.warn('Tools API: Not in Electron environment');
                return { success: false };
            }

            try {
                return await window.electron.tools.generateThumbnail(inputPath, outputPath);
            } catch (error) {
                console.error('Thumbnail generation failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Extrahiere Video-Metadaten
         */
        async getVideoMetadata(filePath) {
            if (!isElectron) {
                console.warn('Tools API: Not in Electron environment');
                return null;
            }

            try {
                return await window.electron.tools.getVideoMetadata(filePath);
            } catch (error) {
                console.error('Metadata extraction failed:', error);
                return null;
            }
        },

        /**
         * Preset Profiles für verschiedene Plattformen
         */
        presets: {
            tiktok: {
                codec: 'h264',
                bitrate: '3000k',
                preset: 'fast',
                fps: 30,
                resolution: '1080x1920'
            },
            instagram: {
                codec: 'h264',
                bitrate: '4000k',
                preset: 'medium',
                fps: 30,
                resolution: '1080x1350'
            },
            youtube: {
                codec: 'h264',
                bitrate: '8000k',
                preset: 'slow',
                fps: 60,
                resolution: '1440x2560'
            },
            twitter: {
                codec: 'h264',
                bitrate: '3000k',
                preset: 'fast',
                fps: 30,
                resolution: '1200x675'
            },
            '4k': {
                codec: 'h265',
                bitrate: '15000k',
                preset: 'slow',
                fps: 60,
                resolution: '3840x2160'
            }
        },

        /**
         * Quick Encode mit Preset
         */
        async encodeWithPreset(inputPath, outputPath, presetName, onProgress = null) {
            if (!this.presets[presetName]) {
                console.error(`Unknown preset: ${presetName}`);
                return { success: false, error: 'Unknown preset' };
            }

            return await this.encodeVideo(
                inputPath,
                outputPath,
                this.presets[presetName],
                onProgress
            );
        }
    };
})();
