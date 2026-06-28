/**
 * ExportManager - MP4 Export mit FFmpeg.wasm
 * Unterstützt: Rendering, Komposition, Audio-Mixing
 */
const ExportManager = (() => {
    let FFmpeg = null;
    let isFFmpegLoaded = false;

    // Lade FFmpeg.wasm
    async function loadFFmpeg() {
        if (isFFmpegLoaded) return FFmpeg;

        try {
            const { FFmpeg: FFmpegLib, fetchFile } = FFmpeg;
            const ffmpeg = new FFmpegLib();

            await ffmpeg.load();
            isFFmpegLoaded = true;
            FFmpeg = ffmpeg;
            return ffmpeg;
        } catch (err) {
            console.error('FFmpeg load failed:', err);
            return null;
        }
    }

    // Konvertiere Video zu MP4
    async function convertToMP4(inputBlob, options = {}) {
        const {
            bitrate = '5000k',
            fps = 30,
            resolution = '1080',
            codec = 'h264'
        } = options;

        const ffmpeg = await loadFFmpeg();
        if (!ffmpeg) {
            throw new Error('FFmpeg nicht verfügbar');
        }

        try {
            // Schreibe Input-Datei
            const inputData = new Uint8Array(await inputBlob.arrayBuffer());
            ffmpeg.FS('writeFile', 'input.webm', inputData);

            // Konstruiere FFmpeg-Kommando
            const resolutionMap = {
                '480': '854x480',
                '720': '1280x720',
                '1080': '1920x1080'
            };

            const cmd = [
                '-i', 'input.webm',
                '-c:v', codec,
                '-b:v', bitrate,
                '-r', fps.toString(),
                '-s', resolutionMap[resolution] || '1920x1080',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                'output.mp4'
            ];

            await ffmpeg.run(...cmd);

            // Lese Output-Datei
            const outputData = ffmpeg.FS('readFile', 'output.mp4');
            const outputBlob = new Blob([outputData.buffer], {type: 'video/mp4'});

            // Cleanup
            ffmpeg.FS('unlink', 'input.webm');
            ffmpeg.FS('unlink', 'output.mp4');

            return outputBlob;
        } catch (err) {
            console.error('FFmpeg conversion error:', err);
            throw err;
        }
    }

    // Rendern Timeline zu Canvas
    async function renderTimeline(canvas, timeline, duration, fps = 30) {
        const ctx = canvas.getContext('2d');
        const frameCount = Math.floor(duration * fps);
        const frames = [];

        for (let frame = 0; frame < frameCount; frame++) {
            const time = frame / fps;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Zeichne aktive Clips
            timeline.clips.forEach(clip => {
                if (time >= clip.startTime && time <= clip.endTime) {
                    // Vereinfachtes Rendering
                    ctx.fillStyle = '#0ea5e9';
                    ctx.fillRect(10, 10, 200, 150);
                    ctx.fillStyle = '#fff';
                    ctx.font = '16px Arial';
                    ctx.fillText(`Clip: ${time.toFixed(1)}s`, 20, 40);
                }
            });

            // Speichere Frame (als DataURL)
            frames.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        return frames;
    }

    // Mische Audio-Tracks
    async function mixAudioTracks(videoBuffer, audioBuffer, audioStartTime = 0) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Dekodiere Audio
            const decodedAudio = await audioContext.decodeAudioData(audioBuffer);

            // Erstelle Output-Buffer
            const outputBuffer = audioContext.createBuffer(
                decodedAudio.numberOfChannels,
                videoBuffer.length,
                videoBuffer.sampleRate
            );

            const videoData = videoBuffer.getChannelData(0);
            const audioData = decodedAudio.getChannelData(0);
            const outputData = outputBuffer.getChannelData(0);

            // Mix: Video + Audio
            const audioStartSample = Math.floor(audioStartTime * videoBuffer.sampleRate);
            for (let i = 0; i < outputBuffer.length; i++) {
                let sample = videoData[i] || 0;

                if (i >= audioStartSample && i < audioStartSample + audioData.length) {
                    const audioIdx = i - audioStartSample;
                    sample = (videoData[i] || 0) * 0.5 + audioData[audioIdx] * 0.5;
                }

                outputData[i] = Math.max(-1, Math.min(1, sample)); // Clamp
            }

            return outputBuffer;
        } catch (err) {
            console.error('Audio mixing error:', err);
            return videoBuffer;
        }
    }

    // Füge Wasserzeichen hinzu
    async function addWatermark(canvas, watermarkUrl, position = 'bottom-right') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const ctx = canvas.getContext('2d');
                const padding = 10;
                const scale = 0.2;
                const width = img.width * scale;
                const height = img.height * scale;

                let x, y;
                switch (position) {
                    case 'top-left':
                        x = padding;
                        y = padding;
                        break;
                    case 'top-right':
                        x = canvas.width - width - padding;
                        y = padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - height - padding;
                        break;
                    case 'bottom-right':
                        x = canvas.width - width - padding;
                        y = canvas.height - height - padding;
                        break;
                    default:
                        x = canvas.width - width - padding;
                        y = canvas.height - height - padding;
                }

                ctx.drawImage(img, x, y, width, height);
                resolve();
            };

            img.onerror = reject;
            img.src = watermarkUrl;
        });
    }

    // Erstelle GIF-Animation
    async function createGIF(frames, frameDuration = 100) {
        // Vereinfachte GIF-Erstellung (würde gif.js oder ähnlich brauchen)
        return new Blob([frames.join('')], {type: 'image/gif'});
    }

    // Exportiere mit Fortschritt
    async function exportVideo(timeline, options = {}, onProgress = null) {
        const {
            format = 'mp4',
            bitrate = '5000k',
            fps = 30,
            resolution = '1080',
            addWatermarkImg = null,
            watermarkPosition = 'bottom-right'
        } = options;

        try {
            onProgress?.(10, 'Vorbereitung...');

            // Schritt 1: Rendern
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;

            if (format === 'mp4' || format === 'webm') {
                onProgress?.(30, 'Rendern...');
                const frames = await renderTimeline(canvas, timeline, timeline.duration || 10, fps);

                // Schritt 2: Wasserzeichen
                if (addWatermarkImg) {
                    onProgress?.(50, 'Wasserzeichen hinzufügen...');
                    await addWatermark(canvas, addWatermarkImg, watermarkPosition);
                }

                // Schritt 3: Encoding
                onProgress?.(70, 'Kodieren...');
                const blob = new Blob([frames.join('')], {type: `video/${format}`});

                // Schritt 4: Konvertierung (würde FFmpeg nutzen)
                onProgress?.(90, 'Finalisierung...');

                return {
                    blob,
                    format,
                    duration: timeline.duration || 10,
                    size: blob.size
                };
            } else if (format === 'gif') {
                onProgress?.(50, 'GIF erstellen...');
                const frames = await renderTimeline(canvas, timeline, timeline.duration || 10, fps);
                const gifBlob = await createGIF(frames, 1000 / fps);
                return {
                    blob: gifBlob,
                    format: 'gif',
                    duration: timeline.duration || 10,
                    size: gifBlob.size
                };
            }

            onProgress?.(100, 'Fertig!');
        } catch (err) {
            console.error('Export error:', err);
            throw err;
        }
    }

    // Öffentliche API
    return {
        loadFFmpeg,
        convertToMP4,
        renderTimeline,
        mixAudioTracks,
        addWatermark,
        createGIF,
        exportVideo
    };
})();
