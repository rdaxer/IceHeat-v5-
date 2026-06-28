/**
 * VideoManager - Verwaltet Video-, Bild- und Musikdateien
 * Behandelt: Upload, Thumbnails, Metadaten, Storage
 */
const VideoManager = (() => {
    const DB_NAME = 'reel-generator-db';
    const DB_VERSION = 1;
    let db = null;

    // IndexedDB initialisieren
    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // Projects Store
                if (!database.objectStoreNames.contains('projects')) {
                    const projectStore = database.createObjectStore('projects', {keyPath: 'id'});
                    projectStore.createIndex('createdAt', 'createdAt', {unique: false});
                    projectStore.createIndex('title', 'title', {unique: false});
                }

                // Videos Store
                if (!database.objectStoreNames.contains('videos')) {
                    const videoStore = database.createObjectStore('videos', {keyPath: 'id'});
                    videoStore.createIndex('projectId', 'projectId', {unique: false});
                    videoStore.createIndex('createdAt', 'createdAt', {unique: false});
                }

                // Video Frames Store (für Szenen-Analyse)
                if (!database.objectStoreNames.contains('frames')) {
                    database.createObjectStore('frames', {keyPath: 'id'});
                }

                // Musik Store
                if (!database.objectStoreNames.contains('music')) {
                    database.createObjectStore('music', {keyPath: 'id'});
                }

                // Bilder Store
                if (!database.objectStoreNames.contains('images')) {
                    database.createObjectStore('images', {keyPath: 'id'});
                }

                // Export History
                if (!database.objectStoreNames.contains('exports')) {
                    const exportStore = database.createObjectStore('exports', {keyPath: 'id'});
                    exportStore.createIndex('projectId', 'projectId', {unique: false});
                    exportStore.createIndex('exportedAt', 'exportedAt', {unique: false});
                }
            };
        });
    }

    // Speichere Video
    async function saveVideo(projectId, file) {
        if (!db) await initDB();

        const id = Date.now() + Math.random();
        const videoData = {
            id,
            projectId,
            name: file.name,
            type: file.type,
            size: file.size,
            duration: 0,
            resolution: null,
            fps: 30,
            data: null,
            thumbnail: null,
            createdAt: new Date(),
            metadata: {}
        };

        // Lese Datei
        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        videoData.data = arrayBuffer;

        // Generiere Thumbnail
        try {
            videoData.thumbnail = await generateThumbnail(arrayBuffer, file.type);
        } catch (err) {
            console.warn('Fehler beim Thumbnail:', err);
        }

        // Extrahiere Metadaten
        try {
            videoData.metadata = await extractVideoMetadata(arrayBuffer);
            videoData.duration = videoData.metadata.duration || 0;
            videoData.resolution = videoData.metadata.resolution || null;
        } catch (err) {
            console.warn('Fehler beim Extrahieren von Metadaten:', err);
        }

        // Speichere in IndexedDB
        const tx = db.transaction('videos', 'readwrite');
        const store = tx.objectStore('videos');
        await new Promise((resolve, reject) => {
            const request = store.add(videoData);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        return videoData;
    }

    // Generiere Video-Thumbnail
    async function generateThumbnail(arrayBuffer, mimeType) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([arrayBuffer], {type: mimeType});
            const url = URL.createObjectURL(blob);
            const video = document.createElement('video');

            video.onloadedmetadata = () => {
                video.currentTime = 0.5;
            };

            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 40;
                canvas.height = 40;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, 40, 40);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };

            video.onerror = reject;
            video.src = url;
        });
    }

    // Extrahiere Video-Metadaten
    async function extractVideoMetadata(arrayBuffer) {
        return new Promise((resolve) => {
            const blob = new Blob([arrayBuffer]);
            const url = URL.createObjectURL(blob);
            const video = document.createElement('video');

            video.onloadedmetadata = () => {
                const metadata = {
                    duration: video.duration,
                    resolution: {
                        width: video.videoWidth,
                        height: video.videoHeight
                    },
                    aspectRatio: video.videoWidth / video.videoHeight
                };
                URL.revokeObjectURL(url);
                resolve(metadata);
            };

            video.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({duration: 0, resolution: null});
            };

            video.src = url;
        });
    }

    // Hole Video aus DB
    async function getVideo(videoId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readonly');
            const store = tx.objectStore('videos');
            const request = store.get(videoId);

            request.onerror = reject;
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Hole alle Videos eines Projekts
    async function getProjectVideos(projectId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readonly');
            const store = tx.objectStore('videos');
            const index = store.index('projectId');
            const request = index.getAll(projectId);

            request.onerror = reject;
            request.onsuccess = () => resolve(request.result || []);
        });
    }

    // Lösche Video
    async function deleteVideo(videoId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite');
            const store = tx.objectStore('videos');
            const request = store.delete(videoId);

            request.onerror = reject;
            request.onsuccess = resolve;
        });
    }

    // Speichere Musik
    async function saveMusic(file) {
        if (!db) await initDB();

        const id = Date.now();
        const musicData = {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            duration: 0,
            data: null,
            createdAt: new Date(),
            metadata: {}
        };

        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        musicData.data = arrayBuffer;

        // Extrahiere Audio-Metadaten
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            musicData.duration = audioBuffer.duration;
            musicData.metadata.sampleRate = audioBuffer.sampleRate;
            musicData.metadata.channels = audioBuffer.numberOfChannels;
        } catch (err) {
            console.warn('Fehler beim Audio-Dekodieren:', err);
        }

        const tx = db.transaction('music', 'readwrite');
        const store = tx.objectStore('music');
        await new Promise((resolve, reject) => {
            const request = store.add(musicData);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        return musicData;
    }

    // Hole Musik
    async function getMusic(musicId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('music', 'readonly');
            const store = tx.objectStore('music');
            const request = store.get(musicId);

            request.onerror = reject;
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Speichere Bild
    async function saveImage(file) {
        if (!db) await initDB();

        const id = Date.now() + Math.random();
        const imageData = {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            data: null,
            thumbnail: null,
            createdAt: new Date()
        };

        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        imageData.data = arrayBuffer;
        imageData.thumbnail = URL.createObjectURL(new Blob([arrayBuffer]));

        const tx = db.transaction('images', 'readwrite');
        const store = tx.objectStore('images');
        await new Promise((resolve, reject) => {
            const request = store.add(imageData);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        return imageData;
    }

    // Speichere Projekt
    async function saveProject(project) {
        if (!db) await initDB();

        const projectData = {
            ...project,
            id: project.id || Date.now(),
            createdAt: project.createdAt || new Date(),
            updatedAt: new Date()
        };

        const tx = db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');
        await new Promise((resolve, reject) => {
            const request = store.put(projectData);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        return projectData;
    }

    // Hole Projekt
    async function getProject(projectId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('projects', 'readonly');
            const store = tx.objectStore('projects');
            const request = store.get(projectId);

            request.onerror = reject;
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Hole alle Projekte
    async function getAllProjects() {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction('projects', 'readonly');
            const store = tx.objectStore('projects');
            const index = store.index('createdAt');
            const request = index.getAll();

            request.onerror = reject;
            request.onsuccess = () => {
                const projects = request.result || [];
                // Sortiere nach neuesten zuerst
                resolve(projects.reverse());
            };
        });
    }

    // Lösche Projekt
    async function deleteProject(projectId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(['projects', 'videos'], 'readwrite');

            // Lösche Projekt
            const projectStore = tx.objectStore('projects');
            const projectRequest = projectStore.delete(projectId);

            // Lösche zugehörige Videos
            const videoStore = tx.objectStore('videos');
            const videoIndex = videoStore.index('projectId');
            const videoRequest = videoIndex.getAll(projectId);

            videoRequest.onsuccess = () => {
                videoRequest.result.forEach(video => {
                    videoStore.delete(video.id);
                });
            };

            projectRequest.onsuccess = resolve;
            projectRequest.onerror = reject;
        });
    }

    // Speichere Export-Eintrag
    async function saveExport(projectId, exportData) {
        if (!db) await initDB();

        const entry = {
            id: Date.now(),
            projectId,
            ...exportData,
            exportedAt: new Date()
        };

        const tx = db.transaction('exports', 'readwrite');
        const store = tx.objectStore('exports');
        await new Promise((resolve, reject) => {
            const request = store.add(entry);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        return entry;
    }

    // Öffentliche API
    return {
        initDB,
        saveVideo,
        getVideo,
        getProjectVideos,
        deleteVideo,
        saveMusic,
        getMusic,
        saveImage,
        saveProject,
        getProject,
        getAllProjects,
        deleteProject,
        saveExport,
        extractVideoMetadata,
        generateThumbnail
    };
})();

// Initialize DB on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VideoManager.initDB().catch(err => console.error('DB init failed:', err));
    });
} else {
    VideoManager.initDB().catch(err => console.error('DB init failed:', err));
}
