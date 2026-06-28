/**
 * SceneAnalyzer - Intelligente Szenenanalyse mit OpenCV.js
 * Erkennt: Szenenübergänge, Qualitätsscores, bewegungsintensive Sequenzen
 */
const SceneAnalyzer = (() => {
    const FRAME_INTERVAL = 0.5; // 0.5 Sekunden Intervall
    const HISTOGRAM_THRESHOLD = 30; // 30% Differenz für neuer Szene
    const SHARPNESS_THRESHOLD = 50; // Schärfe-Grenzwert

    // Extrahiere Frames aus Video
    async function extractFrames(videoFile, maxFrames = 100) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([videoFile.data || videoFile]);
            const url = URL.createObjectURL(blob);
            const video = document.createElement('video');
            const frames = [];

            video.onloadedmetadata = () => {
                const totalDuration = video.duration;
                const interval = Math.max(FRAME_INTERVAL, totalDuration / maxFrames);
                let currentTime = 0;
                let frameCount = 0;

                const extractFrame = () => {
                    if (currentTime >= totalDuration) {
                        URL.revokeObjectURL(url);
                        resolve(frames);
                        return;
                    }

                    video.currentTime = currentTime;
                    frameCount++;
                    currentTime += interval;
                };

                video.onseeked = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = 160;
                        canvas.height = 90;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, 160, 90);

                        frames.push({
                            index: frameCount - 1,
                            timestamp: video.currentTime,
                            canvas: canvas.toDataURL('image/jpeg', 0.6),
                            imageData: ctx.getImageData(0, 0, 160, 90)
                        });

                        if (frameCount <= maxFrames) {
                            extractFrame();
                        } else {
                            URL.revokeObjectURL(url);
                            resolve(frames);
                        }
                    } catch (err) {
                        console.error('Frame extraction error:', err);
                        URL.revokeObjectURL(url);
                        reject(err);
                    }
                };

                extractFrame();
            };

            video.onerror = reject;
            video.src = url;
        });
    }

    // Berechne Histogramm für Frame
    function getHistogram(imageData) {
        const data = imageData.data;
        const histogram = new Uint32Array(256);

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            histogram[Math.floor(gray)]++;
        }

        return histogram;
    }

    // Vergleiche zwei Histogramme (Chi-Square Distance)
    function compareHistograms(hist1, hist2) {
        let distance = 0;
        for (let i = 0; i < 256; i++) {
            const diff = hist1[i] - hist2[i];
            if (hist1[i] + hist2[i] > 0) {
                distance += (diff * diff) / (hist1[i] + hist2[i]);
            }
        }
        return Math.min(distance / 256, 100);
    }

    // Berechne Schärfe des Bildes (Laplacian Variance)
    function calculateSharpness(imageData) {
        const data = imageData.data;
        let laplacianSum = 0;
        let count = 0;

        // Einfache Laplacian-Filter
        for (let i = 0; i < data.length; i += 4) {
            if (i % (imageData.width * 4) > imageData.width * 4 - 8 &&
                i < data.length - imageData.width * 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                laplacianSum += gray * gray;
                count++;
            }
        }

        return Math.sqrt(laplacianSum / Math.max(count, 1));
    }

    // Erkenne Bewegungsintensität (Optical Flow Approximation)
    function estimateMotion(frame1, frame2) {
        const data1 = frame1.imageData.data;
        const data2 = frame2.imageData.data;
        let motionScore = 0;

        for (let i = 0; i < Math.min(data1.length, data2.length); i += 4) {
            const diff = Math.abs(data1[i] - data2[i]) +
                        Math.abs(data1[i + 1] - data2[i + 1]) +
                        Math.abs(data1[i + 2] - data2[i + 2]);
            motionScore += diff;
        }

        return Math.min((motionScore / (data1.length * 3)) * 100, 100);
    }

    // Erkenne Szenen automatisch
    async function detectScenes(videoFile, options = {}) {
        const {
            maxFrames = 100,
            minSceneDuration = 1,
            histogramThreshold = HISTOGRAM_THRESHOLD
        } = options;

        try {
            const frames = await extractFrames(videoFile, maxFrames);
            if (frames.length < 2) return [];

            const scenes = [];
            const histograms = frames.map(f => getHistogram(f.imageData));
            const sharpnesses = frames.map(f => calculateSharpness(f.imageData));

            let currentScene = {
                startIdx: 0,
                startTime: frames[0].timestamp,
                sharpness: sharpnesses[0],
                motion: 0,
                color: histograms[0]
            };

            for (let i = 1; i < frames.length; i++) {
                const histDiff = compareHistograms(histograms[i - 1], histograms[i]);
                const motionScore = estimateMotion(frames[i - 1], frames[i]);
                const sharpness = sharpnesses[i];

                // Erkenne Szenenübergang
                if (histDiff > histogramThreshold) {
                    if (frames[i].timestamp - currentScene.startTime >= minSceneDuration) {
                        scenes.push({
                            startTime: currentScene.startTime,
                            endTime: frames[i - 1].timestamp,
                            duration: frames[i - 1].timestamp - currentScene.startTime,
                            sharpness: currentScene.sharpness,
                            motion: currentScene.motion,
                            quality: calculateQuality(
                                currentScene.sharpness,
                                currentScene.motion
                            )
                        });
                    }

                    currentScene = {
                        startIdx: i,
                        startTime: frames[i].timestamp,
                        sharpness: sharpness,
                        motion: motionScore,
                        color: histograms[i]
                    };
                } else {
                    currentScene.motion = Math.max(currentScene.motion, motionScore);
                }
            }

            // Letzte Szene
            scenes.push({
                startTime: currentScene.startTime,
                endTime: frames[frames.length - 1].timestamp,
                duration: frames[frames.length - 1].timestamp - currentScene.startTime,
                sharpness: currentScene.sharpness,
                motion: currentScene.motion,
                quality: calculateQuality(
                    currentScene.sharpness,
                    currentScene.motion
                )
            });

            return scenes.filter(s => s.duration > 0);
        } catch (err) {
            console.error('Scene detection error:', err);
            return [];
        }
    }

    // Berechne Qualitätsscore (0-100)
    function calculateQuality(sharpness, motion) {
        // 50% Schärfe, 30% Bewegung, 20% Balance
        const sharpnessScore = Math.min(sharpness, 100);
        const motionScore = Math.max(0, 100 - motion); // Zu viel Unruhe ist schlecht

        // Ideal: mittlere Bewegung
        const motionBalance = motion > 20 && motion < 50 ? 100 : 60;

        return (sharpnessScore * 0.5 + motionScore * 0.3 + motionBalance * 0.2) / 100 * 100;
    }

    // Extrahiere beste Szenen
    function getTopScenes(scenes, count = 3) {
        return scenes
            .sort((a, b) => b.quality - a.quality)
            .slice(0, count)
            .sort((a, b) => a.startTime - b.startTime);
    }

    // Erkenne Schnitte und Übergänge
    async function detectTransitions(videoFile) {
        const frames = await extractFrames(videoFile, 50);
        if (frames.length < 2) return [];

        const transitions = [];
        const histograms = frames.map(f => getHistogram(f.imageData));

        for (let i = 1; i < histograms.length; i++) {
            const diff = compareHistograms(histograms[i - 1], histograms[i]);
            if (diff > 50) { // Starker Übergang
                transitions.push({
                    timestamp: frames[i].timestamp,
                    strength: Math.min(diff, 100),
                    type: 'cut'
                });
            }
        }

        return transitions;
    }

    // Öffentliche API
    return {
        detectScenes,
        getTopScenes,
        detectTransitions,
        extractFrames,
        calculateQuality,
        estimateMotion,
        calculateSharpness
    };
})();
