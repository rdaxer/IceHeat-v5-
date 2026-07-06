/**
 * ExportManager - echter Video-Export über die Chromium MediaRecorder-API.
 * Läuft komplett lokal (kein FFmpeg, keine CDN, kein API-Key, offline-fähig).
 *
 * Komponiert das Quellvideo (cover-fit) auf ein Canvas im Zielformat,
 * blendet den Hook-Text in den ersten 3 Sekunden ein, mischt Video-Ton
 * und optionale Musik und nimmt das Ganze als MP4 (falls unterstützt)
 * oder WebM auf.
 */
const ExportManager = (() => {

    function pickMime(preferMp4) {
        const mp4 = ['video/mp4;codecs=h264,aac', 'video/mp4'];
        const webm = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        const list = preferMp4 ? mp4.concat(webm) : webm;
        for (const c of list) {
            if (window.MediaRecorder && MediaRecorder.isTypeSupported(c)) return c;
        }
        return '';
    }

    function aspectFor(platform) {
        const p = String(platform || '').toLowerCase();
        if (p.includes('4:5')) return [4, 5];
        if (p.includes('16:9') || (p.includes('youtube') && !p.includes('short'))) return [16, 9];
        return [9, 16]; // TikTok / Reels / Shorts – Standard
    }

    function blobFromMedia(m) {
        return m.data instanceof Blob ? m.data : new Blob([m.data], { type: m.type || 'video/mp4' });
    }

    function wrapLines(ctx, text, maxW) {
        const words = String(text).split(/\s+/);
        const lines = [];
        let cur = '';
        for (const w of words) {
            const t = cur ? cur + ' ' + w : w;
            if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
            else cur = t;
        }
        if (cur) lines.push(cur);
        return lines.slice(0, 4);
    }

    async function exportVideo(project, options = {}, onProgress = () => {}) {
        if (!window.MediaRecorder) throw new Error('MediaRecorder wird nicht unterstützt');
        const video = project && project.videos && project.videos[0];
        if (!video) throw new Error('Kein Video zum Exportieren vorhanden');

        const fps = parseInt(options.fps) || 30;
        const height = parseInt(String(options.resolution).replace(/\D/g, '')) || 1080;
        const [aw, ah] = aspectFor(options.platform);
        const outH = Math.round(height / 2) * 2;
        const outW = Math.round(height * aw / ah / 2) * 2;

        // Quellvideo laden
        const vEl = document.createElement('video');
        vEl.playsInline = true;
        vEl.src = URL.createObjectURL(blobFromMedia(video));
        await new Promise((res, rej) => {
            vEl.onloadedmetadata = res;
            vEl.onerror = () => rej(new Error('Video konnte nicht geladen werden'));
        });
        const maxDur = Math.min(vEl.duration || 60, 60);

        // Canvas im Zielformat
        const canvas = document.createElement('canvas');
        canvas.width = outW; canvas.height = outH;
        const ctx = canvas.getContext('2d');

        // Audio: Video-Ton + optionale Musik zusammenmischen
        let audioDest = null, audioCtx = null, musicEl = null;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioDest = audioCtx.createMediaStreamDestination();
            try {
                const vNode = audioCtx.createMediaElementSource(vEl);
                vNode.connect(audioDest);
            } catch (e) { /* Video evtl. ohne Tonspur */ }
            if (project.music) {
                musicEl = document.createElement('audio');
                musicEl.src = URL.createObjectURL(blobFromMedia(project.music));
                musicEl.loop = true;
                try {
                    const mNode = audioCtx.createMediaElementSource(musicEl);
                    mNode.connect(audioDest);
                } catch (e) { /* ignore */ }
            }
        } catch (e) { audioDest = null; }

        const canvasStream = canvas.captureStream(fps);
        const tracks = canvasStream.getVideoTracks();
        const allTracks = audioDest ? tracks.concat(audioDest.stream.getAudioTracks()) : tracks;
        const stream = new MediaStream(allTracks);

        const preferMp4 = String(options.format || 'mp4').toLowerCase().includes('mp4');
        const mime = pickMime(preferMp4);
        const bitrate = (parseInt(options.bitrate) || 6000) * 1000;
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: bitrate } : undefined);
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };

        const hookText = (project.timeline && (project.timeline.hook ||
            (project.timeline.hookConfig && project.timeline.hookConfig.text))) || '';

        function drawFrame() {
            const vw = vEl.videoWidth || outW, vh = vEl.videoHeight || outH;
            const scale = Math.max(outW / vw, outH / vh);
            const dw = vw * scale, dh = vh * scale;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, outW, outH);
            ctx.drawImage(vEl, (outW - dw) / 2, (outH - dh) / 2, dw, dh);

            if (hookText && vEl.currentTime < 3) {
                const fontSize = Math.round(outW * 0.075);
                ctx.font = `900 ${fontSize}px Barlow, Arial, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const lines = wrapLines(ctx, hookText, outW * 0.86);
                const startY = outH * 0.25;
                lines.forEach((ln, i) => {
                    const ly = startY + i * fontSize * 1.15;
                    ctx.lineWidth = fontSize * 0.18;
                    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                    ctx.strokeText(ln, outW / 2, ly);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(ln, outW / 2, ly);
                });
            }
        }

        await new Promise(async (resolve, reject) => {
            rec.onstop = resolve;
            rec.onerror = e => reject((e && e.error) || new Error('Aufnahme-Fehler'));
            let raf = 0;
            const tick = () => {
                drawFrame();
                const pct = Math.min(99, Math.round((vEl.currentTime / maxDur) * 100));
                onProgress(pct, `Exportiere… ${vEl.currentTime.toFixed(1)}s / ${maxDur.toFixed(1)}s`);
                if (vEl.currentTime >= maxDur || vEl.ended) {
                    cancelAnimationFrame(raf);
                    try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {}
                    vEl.pause();
                    if (musicEl) musicEl.pause();
                    return;
                }
                raf = requestAnimationFrame(tick);
            };
            try { rec.start(100); } catch (e) { return reject(e); }
            try { if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume(); } catch (e) {}
            try { vEl.currentTime = 0; await vEl.play(); } catch (e) {}
            if (musicEl) { try { musicEl.currentTime = 0; await musicEl.play(); } catch (e) {} }
            raf = requestAnimationFrame(tick);
            // Sicherheits-Stopp
            setTimeout(() => { try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {} }, (maxDur + 6) * 1000);
        });

        const outType = mime && mime.indexOf('video/mp4') === 0 ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mime || 'video/webm' });
        onProgress(100, '✅ Export abgeschlossen');
        try { URL.revokeObjectURL(vEl.src); } catch (e) {}
        if (musicEl) { try { URL.revokeObjectURL(musicEl.src); } catch (e) {} }
        return { blob, format: outType, size: blob.size, duration: maxDur };
    }

    return { exportVideo };
})();
