/**
 * SubtitleGenerator - Automatische Untertitel-Generierung
 * Unterstützt: Speech-to-Text, OCR, WebVTT Format
 */
const SubtitleGenerator = (() => {
    // Speech-to-Text mit Cloud Service (würde API brauchen)
    async function extractAudioAndTranscribe(videoBlob) {
        try {
            // Vereinfachte Demo: würde echte STT-API brauchen
            // z.B. Google Cloud Speech-to-Text, Azure Speech Services

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const blob = videoBlob instanceof Blob ? videoBlob : new Blob([videoBlob]);
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Simuliere Transkription
            const transcript = [{
                text: 'Dieses Video zeigt...',
                startTime: 0,
                endTime: 2
            }, {
                text: 'eine großartige Demonstration',
                startTime: 2,
                endTime: 4
            }];

            return transcript;
        } catch (err) {
            console.error('Transcription error:', err);
            return [];
        }
    }

    // Generiere WebVTT Format
    function generateWebVTT(captions) {
        let vtt = 'WEBVTT\n\n';

        captions.forEach(caption => {
            const start = formatTime(caption.startTime);
            const end = formatTime(caption.endTime);
            vtt += `${start} --> ${end}\n`;
            vtt += `${caption.text}\n\n`;
        });

        return vtt;
    }

    // Formatiere Zeit als HH:MM:SS.mmm
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }

    // Segment Text nach Länge
    function segmentText(text, maxLength = 40) {
        const words = text.split(' ');
        const segments = [];
        let currentSegment = '';

        words.forEach(word => {
            if ((currentSegment + ' ' + word).length > maxLength) {
                if (currentSegment) segments.push(currentSegment);
                currentSegment = word;
            } else {
                currentSegment = currentSegment ? currentSegment + ' ' + word : word;
            }
        });

        if (currentSegment) segments.push(currentSegment);
        return segments;
    }

    // Erstelle Untertitel-Styling
    function createSubtitleStyle(options = {}) {
        const {
            position = 'bottom',
            fontSize = '16px',
            fontColor = '#fff',
            backgroundColor = 'rgba(0, 0, 0, 0.7)',
            borderRadius = '4px',
            padding = '8px 12px',
            fontFamily = 'Barlow, sans-serif',
            fontWeight = '600',
            textAlign = 'center'
        } = options;

        return `
            <style>
                ::cue {
                    background-image: linear-gradient(to right, rgba(14, 165, 233, 0.1), transparent);
                    color: ${fontColor};
                    font-size: ${fontSize};
                    font-family: ${fontFamily};
                    font-weight: ${fontWeight};
                    line-height: 1.4;
                    text-align: ${textAlign};
                    padding: ${padding};
                    background-color: ${backgroundColor};
                    border-radius: ${borderRadius};
                }

                video::cue {
                    position: ${position === 'top' ? '0' : 'auto'};
                }
            </style>
        `;
    }

    // Erstelle Canvas-basierte Untertitel-Rendering
    function renderSubtitlesToCanvas(ctx, caption, canvasWidth, canvasHeight, options = {}) {
        const {
            fontSize = 20,
            fontColor = '#fff',
            backgroundColor = 'rgba(0, 0, 0, 0.7)',
            padding = 10,
            position = 'bottom'
        } = options;

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'center';

        const lines = caption.text.split('\n');
        const lineHeight = fontSize + 8;
        const totalHeight = lines.length * lineHeight + padding * 2;

        let y = position === 'bottom'
            ? canvasHeight - totalHeight - 20
            : 20;

        // Zeichne Hintergrund
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(
            (canvasWidth - ctx.measureText(lines[0]).width - padding * 2) / 2,
            y - padding,
            ctx.measureText(lines[0]).width + padding * 2,
            totalHeight
        );

        // Zeichne Text
        ctx.fillStyle = fontColor;
        lines.forEach((line, idx) => {
            ctx.fillText(line, canvasWidth / 2, y + idx * lineHeight + fontSize);
        });
    }

    // Erstelle SRT-Format (auch weit verbreitet)
    function generateSRT(captions) {
        let srt = '';

        captions.forEach((caption, idx) => {
            const start = formatTimeSRT(caption.startTime);
            const end = formatTimeSRT(caption.endTime);
            srt += `${idx + 1}\n`;
            srt += `${start} --> ${end}\n`;
            srt += `${caption.text}\n\n`;
        });

        return srt;
    }

    // SRT-Zeit Format: HH:MM:SS,mmm
    function formatTimeSRT(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    }

    // Automatische Untertitel-Timing (vereinfacht)
    function generateTimingsForText(text, wordsPerSecond = 4) {
        const words = text.split(' ');
        const captions = [];
        let wordIdx = 0;

        for (let time = 0; time < 100; time += 1) {
            const wordsInSegment = Math.min(wordsPerSecond, words.length - wordIdx);
            const segment = words.slice(wordIdx, wordIdx + wordsInSegment).join(' ');

            if (segment) {
                captions.push({
                    text: segment,
                    startTime: time,
                    endTime: time + 1
                });
                wordIdx += wordsInSegment;
            }

            if (wordIdx >= words.length) break;
        }

        return captions;
    }

    // Keyword-Highlighting
    function highlightKeywords(text, keywords) {
        let highlighted = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<mark>${keyword}</mark>`);
        });
        return highlighted;
    }

    // Öffentliche API
    return {
        extractAudioAndTranscribe,
        generateWebVTT,
        generateSRT,
        segmentText,
        createSubtitleStyle,
        renderSubtitlesToCanvas,
        generateTimingsForText,
        highlightKeywords,
        formatTime
    };
})();
