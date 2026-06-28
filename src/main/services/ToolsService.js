const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const log = require('electron-log');
const { app } = require('electron');
const FFmpegService = require('./FFmpegService');

/**
 * ToolsService - Local FFmpeg, ImageMagick, MediaInfo Management
 */
class ToolsService {
    constructor() {
        this.toolsPath = path.join(app.getPath('userData'), 'tools');
        this.ffmpegPath = path.join(this.toolsPath, 'ffmpeg', 'ffmpeg.exe');
        this.ffprobePath = path.join(this.toolsPath, 'ffmpeg', 'ffprobe.exe');
        this.convertPath = path.join(this.toolsPath, 'imagemagick', 'convert.exe');
        this.mediainfoPath = path.join(this.toolsPath, 'mediainfo', 'mediainfo.exe');
    }

    /**
     * Initialisiere Tools Verzeichnis
     */
    async initializeTools() {
        try {
            await fs.mkdir(this.toolsPath, { recursive: true });
            log.info('Tools directory initialized:', this.toolsPath);
            return { success: true };
        } catch (error) {
            log.error('Failed to initialize tools directory:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Überprüfe ob Tools installiert sind
     */
    async checkTools() {
        const tools = {
            ffmpeg: await this.fileExists(this.ffmpegPath),
            ffprobe: await this.fileExists(this.ffprobePath),
            imagemagick: await this.fileExists(this.convertPath),
            mediainfo: await this.fileExists(this.mediainfoPath)
        };

        return {
            toolsPath: this.toolsPath,
            tools: tools,
            allInstalled: Object.values(tools).every(v => v)
        };
    }

    /**
     * Überprüfe ob Datei existiert
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Führe FFmpeg Kommando aus
     */
    async executeFFmpeg(args, onProgress = null) {
        return new Promise((resolve, reject) => {
            if (!this.fileExists(this.ffmpegPath)) {
                reject(new Error('FFmpeg nicht installiert'));
                return;
            }

            try {
                const proc = spawn(this.ffmpegPath, args, {
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stderr = '';

                proc.stderr.on('data', (data) => {
                    stderr += data.toString();
                    // Parse progress from stderr
                    if (onProgress) {
                        const timeMatch = stderr.match(/time=(\d+):(\d+):(\d+)/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const seconds = parseInt(timeMatch[3]);
                            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                            onProgress({ progress: totalSeconds });
                        }
                    }
                });

                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve({ success: true });
                    } else {
                        reject(new Error(`FFmpeg exit code ${code}: ${stderr}`));
                    }
                });

                proc.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Konvertiere Video (H.264, H.265, VP9)
     */
    async encodeVideo(inputPath, outputPath, options = {}) {
        const {
            codec = 'h264',
            bitrate = '5000k',
            preset = 'medium',
            fps = 30,
            resolution = '1920x1080'
        } = options;

        const codecMap = {
            h264: 'libx264',
            h265: 'libx265',
            vp9: 'libvpx-vp9'
        };

        const presetMap = {
            ultrafast: 0,
            superfast: 1,
            veryfast: 2,
            faster: 3,
            fast: 4,
            medium: 5,
            slow: 6,
            slower: 7,
            veryslow: 8
        };

        const args = [
            '-i', inputPath,
            '-c:v', codecMap[codec],
            '-b:v', bitrate,
            '-preset', (presetMap[preset] || 5).toString(),
            '-r', fps.toString(),
            '-s', resolution,
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            '-y',
            outputPath
        ];

        log.info('Starting FFmpeg encode:', { inputPath, outputPath, options });

        return await this.executeFFmpeg(args);
    }

    /**
     * Generiere Thumbnail mit ImageMagick
     */
    async generateThumbnail(videoPath, outputPath, timeOffset = '00:00:01') {
        // Nutze FFmpeg für Thumbnail Extraction
        const args = [
            '-ss', timeOffset,
            '-i', videoPath,
            '-vframes', '1',
            '-vf', 'scale=160:90',
            '-y',
            outputPath
        ];

        log.info('Generating thumbnail:', { videoPath, outputPath });

        return await this.executeFFmpeg(args);
    }

    /**
     * Extrahiere Video-Metadaten
     */
    async getVideoMetadata(filePath) {
        return new Promise((resolve, reject) => {
            // Nutze ffprobe für Metadaten
            const args = [
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,r_frame_rate,duration,codec_name,codec_long_name',
                '-of', 'json',
                filePath
            ];

            try {
                const proc = spawn(this.ffprobePath, args);
                let output = '';

                proc.stdout.on('data', (data) => {
                    output += data.toString();
                });

                proc.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const data = JSON.parse(output);
                            const stream = data.streams[0];
                            resolve({
                                width: stream.width,
                                height: stream.height,
                                fps: this.parseFPS(stream.r_frame_rate),
                                duration: parseFloat(stream.duration),
                                codec: stream.codec_name,
                                codecLong: stream.codec_long_name
                            });
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(new Error(`ffprobe exit code ${code}`));
                    }
                });

                proc.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Parse FPS from "30/1" format
     */
    parseFPS(fpsString) {
        const [num, denom] = fpsString.split('/').map(Number);
        return Math.round(num / denom);
    }

    /**
     * Mische Audio-Tracks
     */
    async mixAudio(videoPath, audioPath, outputPath) {
        const args = [
            '-i', videoPath,
            '-i', audioPath,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            '-y',
            outputPath
        ];

        log.info('Mixing audio:', { videoPath, audioPath, outputPath });

        return await this.executeFFmpeg(args);
    }

    /**
     * Konvertiere Format
     */
    async convertFormat(inputPath, outputPath, targetFormat = 'mp4') {
        const args = [
            '-i', inputPath,
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-y',
            outputPath
        ];

        log.info('Converting format:', { inputPath, targetFormat });

        return await this.executeFFmpeg(args);
    }

    /**
     * Hole Tool Versionen
     */
    async getToolVersions() {
        return new Promise(async (resolve) => {
            const versions = {
                ffmpeg: null,
                imagemagick: null,
                mediainfo: null
            };

            try {
                // Get FFmpeg version
                const proc = spawn(this.ffmpegPath, ['-version']);
                let ffmpegOutput = '';
                proc.stdout.on('data', (data) => { ffmpegOutput += data; });
                proc.on('close', () => {
                    const match = ffmpegOutput.match(/ffmpeg version ([\d.]+)/);
                    if (match) versions.ffmpeg = match[1];
                    resolve(versions);
                });
            } catch (error) {
                log.warn('Failed to get tool versions:', error);
                resolve(versions);
            }
        });
    }
}

module.exports = ToolsService;
