const { ipcMain } = require('electron');
const log = require('electron-log');
const FFmpegService = require('../services/FFmpegService');
const FilmoraService = require('../services/FilmoraService');

const ffmpegService = new FFmpegService();

/**
 * Register all IPC Handlers
 */
function registerIpcHandlers() {
    // ===== FFMPEG HANDLERS =====

    // Get FFmpeg status
    ipcMain.handle('ffmpeg:status', async () => {
        const version = await ffmpegService.getVersion();
        const hwAccel = await ffmpegService.getHardwareAccelerators();
        return {
            ready: ffmpegService.isReady,
            ...version,
            hwAccel
        };
    });

    // Encode video
    ipcMain.handle('ffmpeg:encode', async (event, inputPath, outputPath, options = {}) => {
        return new Promise((resolve, reject) => {
            ffmpegService.encodeVideo(inputPath, outputPath, options, (progress) => {
                // Send progress to renderer
                event.sender.send('ffmpeg:progress', progress);
            })
                .then(resolve)
                .catch(reject);
        });
    });

    // Get video metadata
    ipcMain.handle('ffmpeg:metadata', async (event, filePath) => {
        return await ffmpegService.getVideoMetadata(filePath);
    });

    // Generate thumbnail
    ipcMain.handle('ffmpeg:thumbnail', async (event, inputPath, outputPath, timeOffset = 1) => {
        return await ffmpegService.generateThumbnail(inputPath, outputPath, timeOffset);
    });

    // ===== FILMORA HANDLERS =====

    const filmoraService = new FilmoraService();

    // Detect Filmora
    ipcMain.handle('filmora:detect', async () => {
        return await filmoraService.detectFilmora();
    });

    // Launch Filmora
    ipcMain.handle('filmora:launch', async (event, projectPath = null) => {
        return await filmoraService.launchFilmora(projectPath);
    });

    // Export to Filmora Project
    ipcMain.handle('filmora:export', async (event, videoPath, metadata = {}) => {
        return await filmoraService.exportToFilmoraProject(videoPath, metadata);
    });

    // Get Filmora Status
    ipcMain.handle('filmora:status', async () => {
        return await filmoraService.checkFilmoraStatus();
    });

    // Get Filmora Templates
    ipcMain.handle('filmora:templates', async () => {
        return await filmoraService.getFilmoraTemplates();
    });

    // Get Filmora Presets
    ipcMain.handle('filmora:presets', async () => {
        return await filmoraService.getFilmoraPresets();
    });

    log.info('IPC Handlers registered successfully');
}

module.exports = { registerIpcHandlers };
