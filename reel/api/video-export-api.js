/**
 * Video Export API - Professional Video Encoding via Local FFmpeg
 * Phase 3: Local FFmpeg Integration
 */
const VideoExportAPI = (() => {
    const isElectron = typeof window !== 'undefined' && window.electron;

    return {
        /**
         * Check FFmpeg Status
         */
        async checkFFmpegStatus() {
            if (!isElectron) {
                return { ready: false, message: 'Not in Electron' };
            }

            try {
                const status = await window.electron.tools.getToolInfo?.() || {
                    ready: false
                };
                return status;
            } catch (error) {
                console.error('FFmpeg status check failed:', error);
                return { ready: false, error: error.message };
            }
        },

        /**
         * Encode Video with FFmpeg
         * @param {string} inputPath - Input video path
         * @param {string} outputPath - Output video path
         * @param {object} options - Encoding options
         * @param {function} onProgress - Progress callback (percent, eta, etc)
         */
        async encodeVideo(inputPath, outputPath, options = {}, onProgress = null) {
            if (!isElectron) {
                return { success: false, error: 'Not in Electron' };
            }

            try {
                const defaultOptions = {
                    codec: 'h264',
                    bitrate: '5000k',
                    preset: 'medium',
                    fps: 30,
                    resolution: '1920x1080',
                    audioCodec: 'aac',
                    audioBitrate: '128k',
                    hwaccel: null
                };

                const finalOptions = { ...defaultOptions, ...options };

                // Set up progress listener
                if (onProgress) {
                    const unsubscribe = this.onEncodingProgress(onProgress);
                }

                // Start encoding
                const result = await window.electron.tools?.encodeVideo?.(
                    inputPath,
                    outputPath,
                    finalOptions
                ) || { success: false };

                return result;
            } catch (error) {
                console.error('Video encoding failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Listen to encoding progress
         */
        onEncodingProgress(callback) {
            // Placeholder for IPC progress listener
            // Will be connected to electron:ffmpeg:progress events
            if (!isElectron) return () => {};

            const listener = (event, progress) => {
                callback(progress);
            };

            // Subscribe to progress (when IPC is ready)
            // window.electron.onFFmpegProgress?.(listener);

            // Return unsubscribe function
            return () => {
                // window.electron.offFFmpegProgress?.(listener);
            };
        },

        /**
         * Platform-optimized encoding presets
         */
        presets: {
            tiktok: {
                codec: 'h264',
                bitrate: '3000k',
                preset: 'fast',
                fps: 30,
                resolution: '1080x1920',
                audioCodec: 'aac',
                audioBitrate: '128k'
            },
            instagram: {
                codec: 'h264',
                bitrate: '4000k',
                preset: 'medium',
                fps: 30,
                resolution: '1080x1350',
                audioCodec: 'aac',
                audioBitrate: '192k'
            },
            youtube: {
                codec: 'h265',  // Better compression
                bitrate: '8000k',
                preset: 'slow',
                fps: 60,
                resolution: '1440x2560',
                audioCodec: 'aac',
                audioBitrate: '256k'
            },
            youtube_hd: {
                codec: 'h264',
                bitrate: '12000k',
                preset: 'slow',
                fps: 60,
                resolution: '1920x1080',
                audioCodec: 'aac',
                audioBitrate: '256k'
            },
            twitter: {
                codec: 'h264',
                bitrate: '3000k',
                preset: 'fast',
                fps: 30,
                resolution: '1200x675',
                audioCodec: 'aac',
                audioBitrate: '128k'
            },
            '4k': {
                codec: 'h265',
                bitrate: '15000k',
                preset: 'slow',
                fps: 60,
                resolution: '3840x2160',
                audioCodec: 'aac',
                audioBitrate: '320k'
            },
            hd: {
                codec: 'h264',
                bitrate: '5000k',
                preset: 'medium',
                fps: 30,
                resolution: '1920x1080',
                audioCodec: 'aac',
                audioBitrate: '192k'
            }
        },

        /**
         * Quick encode with platform preset
         */
        async encodeWithPreset(inputPath, outputPath, presetName, onProgress = null) {
            if (!this.presets[presetName]) {
                return {
                    success: false,
                    error: `Unknown preset: ${presetName}`
                };
            }

            return await this.encodeVideo(
                inputPath,
                outputPath,
                this.presets[presetName],
                onProgress
            );
        },

        /**
         * Get video metadata
         */
        async getMetadata(filePath) {
            if (!isElectron) {
                return null;
            }

            try {
                return await window.electron.tools?.getVideoMetadata?.(filePath) || null;
            } catch (error) {
                console.error('Metadata extraction failed:', error);
                return null;
            }
        },

        /**
         * Generate thumbnail from video
         */
        async generateThumbnail(inputPath, outputPath, timeOffset = 1) {
            if (!isElectron) {
                return { success: false };
            }

            try {
                return await window.electron.tools?.generateThumbnail?.(
                    inputPath,
                    outputPath
                ) || { success: false };
            } catch (error) {
                console.error('Thumbnail generation failed:', error);
                return { success: false, error: error.message };
            }
        },

        /**
         * Batch encode multiple videos
         */
        async batchEncode(jobs = [], onProgress = null) {
            const results = [];

            for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                onProgress?.({
                    jobIndex: i,
                    totalJobs: jobs.length,
                    jobName: job.name || `Job ${i + 1}`,
                    status: 'encoding'
                });

                const result = await this.encodeVideo(
                    job.input,
                    job.output,
                    job.options,
                    (progress) => {
                        onProgress?.({
                            jobIndex: i,
                            totalJobs: jobs.length,
                            jobName: job.name || `Job ${i + 1}`,
                            ...progress
                        });
                    }
                );

                results.push(result);
            }

            return {
                success: results.every(r => r.success),
                results: results
            };
        },

        /**
         * Estimate file size before encoding
         */
        async estimateFileSize(filePath, preset) {
            const metadata = await this.getMetadata(filePath);
            if (!metadata) return null;

            const presetOptions = this.presets[preset];
            const bitrate = parseInt(presetOptions.bitrate) * 1000; // Convert to bits
            const durationSeconds = metadata.duration;

            // Rough estimation: bitrate * duration / 8 (bits to bytes)
            const estimatedBytes = (bitrate * durationSeconds) / 8;
            const estimatedMB = estimatedBytes / (1024 * 1024);

            return {
                estimatedSize: Math.round(estimatedMB * 100) / 100,
                unit: 'MB',
                metadata: metadata
            };
        }
    };
})();
