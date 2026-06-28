/**
 * MusicSync - BPM-Erkennung, Beat Detection, Audio-Synchronisation
 */
const MusicSync = (() => {
    const MIN_BPM = 60;
    const MAX_BPM = 200;

    // Dekodiere Audio-Daten
    async function decodeAudio(audioData) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return new Promise((resolve, reject) => {
            audioContext.decodeAudioData(
                audioData.slice(0),
                resolve,
                reject
            );
        });
    }

    // Erkenne BPM mittels Onset Detection
    async function detectBPM(audioBuffer) {
        try {
            // Erstelle Spectral Flux für Onset Detection
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;

            // Einfacher Ansatz: Energie-Analyse
            const energy = analyzeEnergy(audioBuffer);
            const onsets = detectOnsets(energy);

            if (onsets.length < 2) {
                return {
                    bpm: 120, // Fallback
                    confidence: 0.3,
                    beats: []
                };
            }

            // Berechne inter-onset intervals
            const intervals = [];
            for (let i = 1; i < onsets.length; i++) {
                intervals.push(onsets[i] - onsets[i - 1]);
            }

            // Finde häufigste Intervall-Länge (wahrscheinlich BPM)
            const bpm = findMostLikelyBPM(intervals, audioBuffer.sampleRate);

            return {
                bpm: Math.round(bpm),
                confidence: 0.7,
                beats: generateBeats(audioBuffer.duration, bpm),
                onsets: onsets
            };
        } catch (err) {
            console.error('BPM detection error:', err);
            return {
                bpm: 120,
                confidence: 0,
                beats: []
            };
        }
    }

    // Analysiere Energie des Audio-Signals
    function analyzeEnergy(audioBuffer) {
        const rawData = audioBuffer.getChannelData(0);
        const blockSize = audioBuffer.sampleRate / 30; // ~30 Blöcke pro Sekunde
        const energy = [];

        for (let i = 0; i < rawData.length; i += blockSize) {
            let sum = 0;
            for (let j = 0; j < blockSize && i + j < rawData.length; j++) {
                sum += rawData[i + j] * rawData[i + j];
            }
            energy.push(Math.sqrt(sum / blockSize));
        }

        return energy;
    }

    // Erkenne Onsets (Anfang von Noten/Beats)
    function detectOnsets(energy, threshold = 0.3) {
        const onsets = [];
        const mean = energy.reduce((a, b) => a + b) / energy.length;
        const std = Math.sqrt(
            energy.reduce((a, b) => a + (b - mean) ** 2) / energy.length
        );

        for (let i = 1; i < energy.length; i++) {
            const diff = energy[i] - energy[i - 1];
            if (diff > threshold * std) {
                onsets.push(i);
            }
        }

        return onsets;
    }

    // Finde wahrscheinlichste BPM
    function findMostLikelyBPM(intervals, sampleRate) {
        // Konvertiere Sample-Differenzen zu Millisekunden
        const msIntervals = intervals.map(i => (i / sampleRate) * 1000);

        // Berechne BPM für jeden Interval
        const bpms = msIntervals.map(ms => 60000 / ms);

        // Filtere unrealistische BPMs
        const validBpms = bpms.filter(b => b >= MIN_BPM && b <= MAX_BPM);

        if (validBpms.length === 0) {
            return 120;
        }

        // Finde häufigste BPM (Modus)
        const bpmCounts = {};
        validBpms.forEach(bpm => {
            const rounded = Math.round(bpm / 5) * 5; // Runde auf 5er
            bpmCounts[rounded] = (bpmCounts[rounded] || 0) + 1;
        });

        return Object.entries(bpmCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    }

    // Generiere Beats basierend auf BPM
    function generateBeats(duration, bpm) {
        const beats = [];
        const beatInterval = 60 / bpm; // Sekunden pro Beat

        for (let time = 0; time < duration; time += beatInterval) {
            beats.push({
                timestamp: time,
                strength: 1.0
            });
        }

        return beats;
    }

    // Synchronisiere Video-Clips zu Music Beats
    function syncClipsToBeats(clips, beats, duration) {
        if (!beats || beats.length === 0) {
            return clips;
        }

        const syncedClips = [];
        let currentBeatIdx = 0;

        clips.forEach((clip, idx) => {
            const clipDuration = clip.end - clip.start;

            // Finde nächsten Beat
            while (currentBeatIdx < beats.length && beats[currentBeatIdx].timestamp < duration) {
                const beatTime = beats[currentBeatIdx].timestamp;

                if (Math.abs(beatTime - (clip.start + clipDuration / 2)) < beatDuration * 2) {
                    // Dieser Clip sollte zu diesem Beat passen
                    syncedClips.push({
                        ...clip,
                        snapToBeat: currentBeatIdx,
                        beatTime: beatTime
                    });
                    currentBeatIdx++;
                    break;
                }

                currentBeatIdx++;
            }

            if (syncedClips.length === idx) {
                syncedClips.push(clip); // Clip konnte nicht synchronisiert werden
            }
        });

        return syncedClips;
    }

    // Erkenne 4/4 Takt und Breaks
    function analyzeTimeSignature(beats) {
        // Vereinfachte Annahme: 4/4 Takt
        const measures = [];
        for (let i = 0; i < beats.length; i += 4) {
            measures.push({
                beats: beats.slice(i, i + 4),
                startBeat: i,
                strength: beats[i].strength
            });
        }

        return {
            timeSignature: '4/4',
            measures: measures,
            beatsPerMeasure: 4
        };
    }

    // Finde beste Schnitt-Punkte basierend auf Musik
    function findCutPoints(duration, bpm, style = 'quarter') {
        const beats = generateBeats(duration, bpm);
        const cutPoints = [];

        const intervals = {
            'beat': 1,
            'half-beat': 0.5,
            'quarter': 0.25,
            'eighth': 0.125
        };

        const interval = intervals[style] || 0.25;

        beats.forEach((beat, idx) => {
            if (idx % (1 / interval) === 0) {
                cutPoints.push({
                    timestamp: beat.timestamp,
                    strength: beat.strength,
                    type: 'suggested-cut'
                });
            }
        });

        return cutPoints;
    }

    // Öffentliche API
    return {
        detectBPM,
        generateBeats,
        syncClipsToBeats,
        analyzeTimeSignature,
        findCutPoints,
        decodeAudio,
        detectOnsets,
        analyzeEnergy
    };
})();
