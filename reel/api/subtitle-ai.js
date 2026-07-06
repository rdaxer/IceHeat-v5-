/**
 * SubtitleAI – optionale automatische Untertitel per Spracherkennung.
 *
 * Zwei Wege:
 *   1) Browser-Spracherkennung (Web Speech API) – ohne Schlüssel, live diktiert
 *      (funktioniert in Chrome/Edge online). Gut, um Untertitel einzusprechen.
 *   2) KI-Transkription des Videos via OpenAI Whisper – falls ein OpenAI-
 *      Schlüssel hinterlegt ist. Transkribiert die Tonspur des hochgeladenen
 *      Videos automatisch.
 *
 * Beides optional; ohne Schlüssel/Netz läuft die App normal weiter.
 * (Anthropic/Claude transkribiert kein Audio – dafür wird Whisper genutzt.)
 */
const SubtitleAI = (() => {
    const KEY_LS = 'videoreel_openai_key';
    let memKey = '';

    function getKey() {
        try { const v = localStorage.getItem(KEY_LS); if (v) return v; } catch (e) {}
        return memKey;
    }
    function setKey(k) {
        memKey = k || '';
        try { k ? localStorage.setItem(KEY_LS, k) : localStorage.removeItem(KEY_LS); } catch (e) {}
    }
    function hasKey() { return !!getKey(); }
    function hasWebSpeech() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }

    function chunkText(text, wordsPerLine = 6) {
        const words = String(text || '').trim().split(/\s+/).filter(Boolean);
        const lines = [];
        for (let i = 0; i < words.length; i += wordsPerLine) {
            lines.push(words.slice(i, i + wordsPerLine).join(' '));
        }
        return lines;
    }

    // OpenAI Whisper: transkribiert die Video-/Audiodatei direkt (max. 25 MB).
    async function transcribeWhisper(blob, opts = {}) {
        const key = getKey();
        if (!key) throw new Error('Kein OpenAI-Schlüssel gesetzt (Einstellungen).');
        if (!blob) throw new Error('Kein Video vorhanden.');
        if (blob.size > 25 * 1024 * 1024) {
            throw new Error('Video größer als 25 MB (Whisper-Limit) – bitte kürzeres Video verwenden.');
        }
        const ext = (blob.type || '').includes('webm') ? 'webm' : 'mp4';
        const fd = new FormData();
        fd.append('file', blob, 'audio.' + ext);
        fd.append('model', 'whisper-1');
        fd.append('response_format', 'text');
        if (opts.language) fd.append('language', opts.language);

        const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + key },
            body: fd
        });
        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json()).error?.message || ''; } catch (e) {}
            throw new Error(`Whisper ${resp.status}${detail ? ': ' + detail : ''}`);
        }
        const text = await resp.text();
        return chunkText(text);
    }

    // Live-Diktat über die Browser-Spracherkennung. Ruft onLine(text) je Satz.
    // Gibt das Recognition-Objekt zurück (rec.stop() zum Beenden).
    function dictate(onLine, onEnd, lang) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) throw new Error('Spracherkennung im Browser nicht verfügbar.');
        const rec = new SR();
        rec.lang = lang || 'de-DE';
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = (e) => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) {
                    const t = (e.results[i][0].transcript || '').trim();
                    if (t) onLine(t);
                }
            }
        };
        rec.onerror = (e) => { if (onEnd) onEnd(e.error || 'error'); };
        rec.onend = () => { if (onEnd) onEnd(null); };
        rec.start();
        return rec;
    }

    return { getKey, setKey, hasKey, hasWebSpeech, transcribeWhisper, dictate };
})();
