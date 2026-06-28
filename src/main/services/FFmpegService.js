const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');
const log = require('electron-log');

/**
 * FFmpegService - Local FFmpeg Binary Management & Video Encoding
 * Handles H.264, H.265, VP9 encoding with GPU acceleration support
 */
class FFmpegService {
    constructor() {
        this.ffmpegPath = null;
        this.ffprobePath = null;
        this.isReady = false;
        this.initializeToolPaths();
    }

    /**
     * Initialize FFmpeg tool paths
     */
    initializeToolPaths() {
        // Try multiple locations for portable FFmpeg
        const possiblePaths = [
            // Assets directory (bundled with app)
            path.join(app.getAppPath(), 'assets', 'tools', 'ffmpeg', 'ffmpeg.exe'),
            // User data directory
            path.join(app.getPath('userData'), 'tools', 'ffmpeg', 'ffmpeg.exe'),
            // System PATH (fallback)
            'ffmpeg.exe'
        ];

        for (const toolPath of possiblePaths) {
            if (this.fileExistsSync(toolPath)) {
                this.ffmpegPath = toolPath;
                this.ffprobePath = path.join(path.dirname(toolPath), 'ffprobe.exe');
                this.isReady = true;
                log.info('FFmpeg found at:', this.ffmpegPath);
                return;
            }
        }

        log.warn('FFmpeg not found in any expected location');
    }

    /**
     * Check if file exists (sync)
     */
    fileExistsSync(filePath) {
        try {
            require('fs').accessSync(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Main encoding method with progress tracking
     */
    async encodeVideo(inputPath, outputPath, options = {}, onProgress = null) {
        return new Promise((resolve, reject) => {
            if (!this.isReady) {
                reject(new Error('FFmpeg is not available'));
                return;
            }

            const {
                codec = 'h264',           // h264, h265, vp9
                bitrate = '5000k',
                preset = 'medium',         // ultrafast, fast, medium, slow, veryslow
                fps = 30,
                resolution = '1920x1080',
                audioCodec = 'aac',
                audioBitrate = '128k',
                audioSampleRate = '48000',
                pixelFormat = 'yuv420p',   // For compatibility
                hwaccel = null             // cuda, qsv, dxva2 (optional)
            } = options;

            try {
                const args = this.buildFFmpegArgs({
                    input: inputPath,
                    output: outputPath,
                    codec,
                    bitrate,
                    preset,
                    fps,
                    resolution,
                    audioCodec,
                    audioBitrate,
                    audioSampleRate,
                    pixelFormat,
                    hwaccel
                });

                log.info('Starting FFmpeg encode with args:', args);

                const process = spawn(this.ffmpegPath, args, {
                    stdio: ['ignore', 'pipe', 'pipe']
                });

                let stderrOutput = '';
                let totalDuration = 0;

                process.stderr.on('data', (data) => {
                    const output = data.toString();
                    stderrOutput += output;

                    // Parse total duration (from first Duration line)
                    if (!totalDuration) {
                        const durationMatch = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
                        if (durationMatch) {
                            const hours = parseInt(durationMatch[1]);
                            const minutes = parseInt(durationMatch[2]);
                            const seconds = parseFloat(durationMatch[3]);
                            totalDuration = hours * 3600 + minutes * 60 + seconds;
                        }
                    }

                    // Parse progress
                    if (onProgress && totalDuration > 0) {
                        const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const seconds = parseFloat(timeMatch[3]);
                            const currentTime = hours * 3600 + minutes * 60 + seconds;
                            const percent = Math.min((currentTime / totalDuration) * 100, 100);

                            onProgress({
                                percent: percent,
                                currentTime: currentTime,
                                totalDuration: totalDuration,
                                status: 'encoding'
                            });
                        }
                    }

                    // Parse bitrate from frame lines
                    const bitrateMatch = output.match(/bitrate=\s*([\d.]+)kbits/);
                    if (bitrateMatch && onProgress) {
                        onProgress((prev) => ({
                            ...prev,
                            bitrate: bitrateMatch[1]
                        }));
                    }
                });

                process.on('close', (code) => {
                    if (code === 0) {
                        log.info('FFmpeg encoding completed successfully');
                        resolve({
                            success: true,
                            outputPath: outputPath,
                            message: 'Video encoded successfully'
                        });
                    } else {
                        log.error('FFmpeg exited with code:', code);
                        reject(new Error(`FFmpeg failed with exit code ${code}: ${stderrOutput}`));
                    }
                });

                process.on('error', (error) => {
                    log.error('FFmpeg process error:', error);
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Build FFmpeg command arguments
     */
    buildFFmpegArgs(options) {
        const {
            input,
            output,
            codec,
            bitrate,
            preset,
            fps,
            resolution,
            audioCodec,
            audioBitrate,
            audioSampleRate,
            pixelFormat,
            hwaccel
        } = options;

        const args = [
            '-i', input,
            '-y'  // Overwrite output file
        ];

        // Hardware acceleration
        if (hwaccel === 'cuda') {
            args.push('-hwaccel', 'cuda');
        } else if (hwaccel === 'qsv') {
            args.push('-hwaccel', 'qsv');
        }

        // Video codec
        const codecMap = {
            h264: { codec: 'libx264', preset: 'medium' },
            h265: { codec: 'libx265', preset: 'medium' },
            vp9: { codec: 'libvpx-vp9', preset: 5 }
        };

        const selectedCodec = codecMap[codec] || codecMap.h264;
        args.push('-c:v', selectedCodec.codec);

        // Bitrate
        args.push('-b:v', bitrate);

        // Preset (quality/speed tradeoff)
        if (codec === 'vp9') {
            const presetMap = { ultrafast: 0, fast: 2, medium: 4, slow: 6, veryslow: 8 };
            args.push('-cpu-used', (presetMap[preset] || 4).toString());
        } else {
            args.push('-preset', preset);
        }

        // Frame rate
        args.push('-r', fps.toString());

        // Resolution
        args.push('-vf', `scale=${resolution.split('x')[0]}:${resolution.split('x')[1]}`);

        // Pixel format (for compatibility)
        if (codec !== 'vp9') {
            args.push('-pix_fmt', pixelFormat);
        }

        // Audio
        args.push('-c:a', audioCodec);
        args.push('-b:a', audioBitrate);
        args.push('-ar', audioSampleRate);

        // Output flags
        args.push('-movflags', '+faststart');  // Enable streaming
        args.push('-progress', 'pipe:2');       // Progress output

        args.push(output);

        return args;
    }

    /**
     * Extract metadata using ffprobe
     */
    async getVideoMetadata(filePath) {
        return new Promise((resolve, reject) => {
            if (!this.isReady) {
                reject(new Error('FFmpeg is not available'));
                return;
            }

            const args = [
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,r_frame_rate,duration,codec_name,bit_rate,nb_frames',
                '-of', 'json',
                filePath
            ];

            const process = spawn(this.ffprobePath, args);
            let output = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    try {
                        const data = JSON.parse(output);
                        if (data.streams && data.streams.length > 0) {
                            const stream = data.streams[0];
                            const [num, denom] = stream.r_frame_rate.split('/').map(Number);
                            resolve({
                                width: stream.width,
                                height: stream.height,
                                fps: Math.round(num / denom),
                                duration: parseFloat(stream.duration),
                                codec: stream.codec_name,
                                bitrate: parseInt(stream.bit_rate),
                                frames: parseInt(stream.nb_frames)
                            });
                        } else {
                            reject(new Error('No video stream found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error(`ffprobe failed with code ${code}`));
                }
            });

            process.on('error', reject);
        });
    }

    /**
     * Generate thumbnail from video
     */
    async generateThumbnail(inputPath, outputPath, timeOffset = 1) {
        const args = [
            '-ss', timeOffset.toString(),
            '-i', inputPath,
            '-vframes', '1',
            '-vf', 'scale=160:90',
            '-y',
            outputPath
        ];

        return new Promise((resolve, reject) => {
            const process = spawn(this.ffmpegPath, args);

            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, thumbnail: outputPath });
                } else {
                    reject(new Error(`Thumbnail generation failed with code ${code}`));
                }
            });

            process.on('error', reject);
        });
    }

    /**
     * Get available hardware accelerators
     */
    async getHardwareAccelerators() {
        if (!this.isReady) {
            return { available: [] };
        }

        return new Promise((resolve) => {
            const args = ['-hwaccels'];
            let output = '';

            const process = spawn(this.ffmpegPath, args);
            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', () => {
                const accelerators = output
                    .split('\n')
                    .filter(line => line.includes('hardware'))
                    .map(line => line.trim())
                    .filter(Boolean);

                resolve({
                    available: accelerators,
                    hasNVIDIA: accelerators.includes('cuda'),
                    hasIntel: accelerators.includes('qsv'),
                    hasAMD: accelerators.includes('dxva2')
                });
            });

            process.on('error', () => {
                resolve({ available: [] });
            });
        });
    }

    /**
     * Check FFmpeg version
     */
    async getVersion() {
        if (!this.isReady) {
            return { version: null, ready: false };
        }

        return new Promise((resolve) => {
            const process = spawn(this.ffmpegPath, ['-version']);
            let output = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.on('close', () => {
                const match = output.match(/ffmpeg version ([\d.]+)/);
                resolve({
                    version: match ? match[1] : 'unknown',
                    ready: true
                });
            });

            process.on('error', () => {
                resolve({ version: null, ready: false });
            });
        });
    }
}

module.exports = FFmpegService;
