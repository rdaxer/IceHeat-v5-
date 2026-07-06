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
        if (p.includes('1:1') || p.includes('square') || p.includes('quadrat')) return [1, 1];
        if (p.includes('4:5') || p.includes('feed')) return [4, 5];
        if (p.includes('16:9') || p.includes('landscape') || p.includes('quer') || p === 'twitter') return [16, 9];
        return [9, 16]; // TikTok / Reels / Shorts – Standard (Hochformat)
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

    const FILTER_CSS = {
        none: 'none',
        vivid: 'saturate(1.5) contrast(1.1)',
        warm: 'sepia(0.35) saturate(1.3)',
        cool: 'hue-rotate(-15deg) saturate(1.2) brightness(1.05)',
        bw: 'grayscale(1) contrast(1.1)',
        vintage: 'sepia(0.5) contrast(0.9) brightness(1.05)'
    };

    // Audio-Graph: Video-Ton (Gain) + optionale Musik (Gain, mit Fade)
    function buildAudioGraph(audioCtx, vEl, musicEl, audio) {
        const dest = audioCtx.createMediaStreamDestination();
        const videoGain = audioCtx.createGain();
        const musicGain = audioCtx.createGain();
        videoGain.connect(dest); musicGain.connect(dest);
        videoGain.gain.value = (audio.keepVideoAudio === false) ? 0 : 1;
        musicGain.gain.value = musicEl ? (audio.musicVolume != null ? audio.musicVolume : 0.8) : 0;
        try { audioCtx.createMediaElementSource(vEl).connect(videoGain); } catch (e) {}
        if (musicEl) { try { audioCtx.createMediaElementSource(musicEl).connect(musicGain); } catch (e) {} }
        return { dest, videoGain, musicGain };
    }
    function tickAudioGains(elapsed, total, audio, gains, videoFadeOut) {
        if (!gains) return;
        const vol = audio.musicVolume != null ? audio.musicVolume : 0.8;
        let mf = 1;
        if (audio.musicFadeIn && elapsed < 0.8) mf = elapsed / 0.8;
        else if (audio.musicFadeOut && elapsed > total - 0.8) mf = (total - elapsed) / 0.8;
        gains.musicGain.gain.value = vol * Math.max(0, Math.min(1, mf));
        let vf = (audio.keepVideoAudio === false) ? 0 : 1;
        if (videoFadeOut && elapsed > total - 1) vf *= Math.max(0, total - elapsed);
        gains.videoGain.gain.value = vf;
    }

    // Aktive Untertitel-Zeile für den aktuellen Zeitpunkt (gleichmäßig verteilt)
    function activeSubtitle(project, elapsed, total) {
        if (!project || !project.subsEnabled) return '';
        const subs = Array.isArray(project.subtitles) ? project.subtitles.filter(Boolean) : [];
        if (!subs.length || !total) return '';
        const lineDur = total / subs.length;
        return subs[Math.min(subs.length - 1, Math.floor(elapsed / lineDur))] || '';
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

        const fx = project.effects || {};
        const FILTER_CSS = {
            none: 'none',
            vivid: 'saturate(1.5) contrast(1.1)',
            warm: 'sepia(0.35) saturate(1.3)',
            cool: 'hue-rotate(-15deg) saturate(1.2) brightness(1.05)',
            bw: 'grayscale(1) contrast(1.1)',
            vintage: 'sepia(0.5) contrast(0.9) brightness(1.05)'
        };
        const filterCss = FILTER_CSS[fx.filter] || 'none';
        const overlayText = fx.textOverlay || '';
        const audio = project.audio || {};
        const hookDur = (project.timeline && project.timeline.hookDuration) || 3;

        // Audio: Video-Ton + optionale Musik mit getrennten Gains (Lautstärke/Fade)
        let audioCtx = null, gains = null, musicEl = null;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (project.music) {
                musicEl = document.createElement('audio');
                musicEl.src = URL.createObjectURL(blobFromMedia(project.music));
                musicEl.loop = true;
            }
            gains = buildAudioGraph(audioCtx, vEl, musicEl, audio);
        } catch (e) { gains = null; }

        const canvasStream = canvas.captureStream(fps);
        const tracks = canvasStream.getVideoTracks();
        const allTracks = gains ? tracks.concat(gains.dest.stream.getAudioTracks()) : tracks;
        const stream = new MediaStream(allTracks);

        const preferMp4 = String(options.format || 'mp4').toLowerCase().includes('mp4');
        const mime = pickMime(preferMp4);
        const bitrate = (parseInt(options.bitrate) || 6000) * 1000;
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: bitrate } : undefined);
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };

        const hookText = (project.timeline && (project.timeline.hook ||
            (project.timeline.hookConfig && project.timeline.hookConfig.text))) || '';

        function drawText(text, cy, sizeFactor) {
            const fontSize = Math.round(outW * sizeFactor);
            ctx.font = `900 ${fontSize}px Barlow, Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const lines = wrapLines(ctx, text, outW * 0.86);
            lines.forEach((ln, i) => {
                const ly = cy + i * fontSize * 1.15;
                ctx.lineWidth = fontSize * 0.18;
                ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                ctx.strokeText(ln, outW / 2, ly);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(ln, outW / 2, ly);
            });
        }

        function drawFrame() {
            const vw = vEl.videoWidth || outW, vh = vEl.videoHeight || outH;
            const scale = Math.max(outW / vw, outH / vh);
            const dw = vw * scale, dh = vh * scale;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, outW, outH);

            // Farb-Filter nur auf das Videobild anwenden
            ctx.filter = filterCss;
            ctx.drawImage(vEl, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
            ctx.filter = 'none';

            if (hookText && vEl.currentTime < hookDur) drawText(hookText, outH * 0.25, 0.075);
            if (overlayText) drawText(overlayText, outH * 0.86, 0.055);
            const sub = activeSubtitle(project, vEl.currentTime, maxDur);
            if (sub) drawText(sub, outH * 0.90, 0.045);

            // Ein-/Ausblenden (Fade)
            if (fx.fade) {
                const t = vEl.currentTime, d = maxDur;
                let a = 0;
                if (t < 0.5) a = 1 - t / 0.5;
                else if (t > d - 0.5) a = (t - (d - 0.5)) / 0.5;
                if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; ctx.fillRect(0, 0, outW, outH); }
            }

            // Lautstärke/Fade für Musik & Video-Ton
            tickAudioGains(vEl.currentTime, maxDur, audio, gains, fx.audioFade);
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

    // Auto-Reel: reiht die ausgewählten Szenen-Segmente zu einem Video zusammen.
    // segments: [{ start, end }] in Sekunden, chronologisch.
    async function exportReel(project, segments, options = {}, onProgress = () => {}) {
        if (!window.MediaRecorder) throw new Error('MediaRecorder wird nicht unterstützt');
        const videos = (project && project.videos) || [];
        if (!videos.length) throw new Error('Kein Video vorhanden');
        // Segmente können aus mehreren Quell-Videos stammen (videoIndex).
        // Nach Video gruppieren (minimiert Quell-Wechsel), darin chronologisch.
        segments = (segments || []).filter(s => s && s.end > s.start)
            .map(s => ({ start: s.start, end: s.end, videoIndex: s.videoIndex || 0 }))
            .sort((a, b) => (a.videoIndex - b.videoIndex) || (a.start - b.start));
        if (!segments.length) throw new Error('Keine Szenen ausgewählt');

        const fps = parseInt(options.fps) || 30;
        const height = parseInt(String(options.resolution).replace(/\D/g, '')) || 1080;
        const [aw, ah] = aspectFor(options.platform);
        const outH = Math.round(height / 2) * 2;
        const outW = Math.round(height * aw / ah / 2) * 2;
        const totalOut = segments.reduce((s, seg) => s + (seg.end - seg.start), 0);

        // Ein Video-Element, dessen Quelle bei Bedarf gewechselt wird. Die
        // MediaElementSource (Audio) bleibt über src-Wechsel hinweg gültig.
        const vEl = document.createElement('video');
        vEl.playsInline = true;
        let curVid = -1, curUrl = null;
        function loadVid(idx) {
            return new Promise((res, rej) => {
                const v = videos[idx] || videos[0];
                try { if (curUrl) URL.revokeObjectURL(curUrl); } catch (e) {}
                curUrl = URL.createObjectURL(blobFromMedia(v));
                vEl.onloadedmetadata = () => { curVid = idx; res(); };
                vEl.onerror = () => rej(new Error('Video konnte nicht geladen werden'));
                vEl.src = curUrl;
            });
        }
        await loadVid(segments[0].videoIndex || 0);

        const canvas = document.createElement('canvas');
        canvas.width = outW; canvas.height = outH;
        const ctx = canvas.getContext('2d');

        const fx = project.effects || {};
        const filterCss = FILTER_CSS[fx.filter] || 'none';
        const overlayText = fx.textOverlay || '';
        const hookText = (project.timeline && (project.timeline.hook ||
            (project.timeline.hookConfig && project.timeline.hookConfig.text))) || '';
        const audio = project.audio || {};
        const hookDur = (project.timeline && project.timeline.hookDuration) || 3;

        // Audio: Video-Ton + optionale Musik mit getrennten Gains (Lautstärke/Fade)
        let audioCtx = null, gains = null, musicEl = null;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (project.music) {
                musicEl = document.createElement('audio');
                musicEl.src = URL.createObjectURL(blobFromMedia(project.music));
                musicEl.loop = true;
            }
            gains = buildAudioGraph(audioCtx, vEl, musicEl, audio);
        } catch (e) { gains = null; }

        const cStream = canvas.captureStream(fps);
        const tracks = cStream.getVideoTracks().concat(gains ? gains.dest.stream.getAudioTracks() : []);
        const stream = new MediaStream(tracks);
        const mime = pickMime(String(options.format || 'mp4').toLowerCase().includes('mp4'));
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: (parseInt(options.bitrate) || 6000) * 1000 } : undefined);
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };

        function drawText(text, cy, sizeFactor) {
            const fs = Math.round(outW * sizeFactor);
            ctx.font = `900 ${fs}px Barlow, Arial, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            wrapLines(ctx, text, outW * 0.86).forEach((ln, i) => {
                const ly = cy + i * fs * 1.15;
                ctx.lineWidth = fs * 0.18; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(ln, outW / 2, ly);
                ctx.fillStyle = '#fff'; ctx.fillText(ln, outW / 2, ly);
            });
        }

        function seekTo(t) {
            return new Promise(res => {
                const on = () => { vEl.removeEventListener('seeked', on); res(); };
                vEl.addEventListener('seeked', on);
                vEl.currentTime = t;
            });
        }

        let segIdx = 0, outElapsed = 0, seeking = false;

        await new Promise(async (resolve, reject) => {
            rec.onstop = resolve;
            rec.onerror = e => reject((e && e.error) || new Error('Aufnahme-Fehler'));

            function draw() {
                const vw = vEl.videoWidth || outW, vh = vEl.videoHeight || outH;
                const scale = Math.max(outW / vw, outH / vh);
                const dw = vw * scale, dh = vh * scale;
                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, outW, outH);
                ctx.filter = filterCss;
                try { ctx.drawImage(vEl, (outW - dw) / 2, (outH - dh) / 2, dw, dh); } catch (e) {}
                ctx.filter = 'none';
                if (hookText && outElapsed < hookDur) drawText(hookText, outH * 0.25, 0.075);
                if (overlayText) drawText(overlayText, outH * 0.86, 0.055);
                const sub = activeSubtitle(project, outElapsed, totalOut);
                if (sub) drawText(sub, outH * 0.90, 0.045);
                if (fx.fade) {
                    let a = 0;
                    if (outElapsed < 0.5) a = 1 - outElapsed / 0.5;
                    else if (outElapsed > totalOut - 0.5) a = (outElapsed - (totalOut - 0.5)) / 0.5;
                    if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; ctx.fillRect(0, 0, outW, outH); }
                }
                tickAudioGains(outElapsed, totalOut, audio, gains, fx.audioFade);
            }

            let last = performance.now();
            async function tick() {
                if (seeking) { draw(); requestAnimationFrame(tick); return; }
                const now = performance.now(); const dt = (now - last) / 1000; last = now;
                draw();
                outElapsed = Math.min(totalOut, outElapsed + dt);
                onProgress(Math.min(99, Math.round(outElapsed / totalOut * 100)), `Reel… ${outElapsed.toFixed(1)}s / ${totalOut.toFixed(1)}s`);
                const seg = segments[segIdx];
                if (vEl.currentTime >= seg.end - 0.03 || vEl.ended) {
                    segIdx++;
                    if (segIdx >= segments.length) {
                        try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {}
                        vEl.pause(); if (musicEl) musicEl.pause();
                        return;
                    }
                    const nx = segments[segIdx];
                    seeking = true;
                    if ((nx.videoIndex || 0) !== curVid) {
                        // Quelle wechseln (nächstes Video)
                        try { vEl.pause(); } catch (e) {}
                        await loadVid(nx.videoIndex || 0);
                        await seekTo(nx.start);
                        try { await vEl.play(); } catch (e) {}
                    } else {
                        await seekTo(nx.start);
                    }
                    seeking = false; last = performance.now();
                }
                requestAnimationFrame(tick);
            }

            try { rec.start(100); } catch (e) { return reject(e); }
            try { if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume(); } catch (e) {}
            seeking = true; await seekTo(segments[0].start); seeking = false;
            try { await vEl.play(); } catch (e) {}
            if (musicEl) { try { musicEl.currentTime = 0; await musicEl.play(); } catch (e) {} }
            last = performance.now();
            requestAnimationFrame(tick);
            setTimeout(() => { try { if (rec.state !== 'inactive') rec.stop(); } catch (e) {} }, (totalOut + 10) * 1000);
        });

        const outType = mime && mime.indexOf('video/mp4') === 0 ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mime || 'video/webm' });
        onProgress(100, '✅ Reel fertig');
        try { URL.revokeObjectURL(vEl.src); } catch (e) {}
        if (musicEl) { try { URL.revokeObjectURL(musicEl.src); } catch (e) {} }
        return { blob, format: outType, size: blob.size, duration: totalOut, segments: segments.length };
    }

    return { exportVideo, exportReel };
})();
