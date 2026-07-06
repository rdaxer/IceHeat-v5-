/**
 * AIEnhance – optionale KI-Veredelung vor dem Export (Claude).
 *
 * Ruft die Anthropic-API direkt aus dem Browser auf (kein Build/Server nötig)
 * und lässt Claude Opus 4.8 die Szenen-Vorschaubilder ansehen, um Hook,
 * Beschreibung, Hashtags und die besten Szenen vorzuschlagen.
 *
 * Der API-Schlüssel wird nur lokal (localStorage) gespeichert und direkt an
 * Anthropic gesendet. Alles hier ist optional – ohne Schlüssel läuft die App
 * unverändert offline weiter.
 */
const AIEnhance = (() => {
    const KEY_LS = 'videoreel_anthropic_key';
    const MODEL = 'claude-opus-4-8';
    const ENDPOINT = 'https://api.anthropic.com/v1/messages';

    // In-Memory-Fallback, falls localStorage (z. B. bei file://) blockiert ist,
    // damit der Schlüssel wenigstens für die laufende Sitzung funktioniert.
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

    function toImageBlock(dataUrl) {
        const m = /^data:(image\/[\w.+-]+);base64,(.+)$/.exec(dataUrl || '');
        if (!m) return null;
        return { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } };
    }

    async function enhance(opts = {}) {
        const key = getKey();
        if (!key) throw new Error('Kein Claude-API-Schlüssel gesetzt (Einstellungen).');

        const title = opts.title || '';
        const description = opts.description || '';
        const platform = opts.platform || 'tiktok';
        const scenes = opts.scenes || [];

        // Bis zu 8 Szenen-Vorschaubilder mitschicken; merken, welche Indizes.
        const imgs = [];
        const idxMap = [];
        for (let i = 0; i < scenes.length && imgs.length < 8; i++) {
            const block = toImageBlock(scenes[i] && scenes[i].thumbnail);
            if (block) { imgs.push(block); idxMap.push(i); }
        }

        const system = 'Du bist ein erfahrener Social-Media-Video-Editor. Antworte AUSSCHLIESSLICH mit einem einzigen JSON-Objekt, ohne Markdown, ohne Erklärung.';
        const instruction =
            `Optimiere die Metadaten für ein ${platform}-Reel.\n` +
            `Titel/Thema: ${title || '(keins angegeben)'}\n` +
            `Beschreibung: ${description || '(keine)'}\n` +
            (imgs.length
                ? `Es folgen ${imgs.length} Szenen-Vorschaubilder in Reihenfolge. Wähle die ${Math.min(5, imgs.length)} stärksten für ein packendes Reel.\n`
                : '') +
            `Gib JSON mit genau diesen Feldern zurück:\n` +
            `{"hook":"packender Text, max 8 Wörter","description":"1-2 Sätze","hashtags":["#tag1","#tag2"],"bestScenes":[0-basierte Indizes der gezeigten Bilder]}`;

        const content = [{ type: 'text', text: instruction }].concat(imgs);
        const body = { model: MODEL, max_tokens: 1024, system, messages: [{ role: 'user', content }] };

        const resp = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json()).error?.message || ''; } catch (e) {}
            throw new Error(`Claude-API ${resp.status}${detail ? ': ' + detail : ''}`);
        }

        const data = await resp.json();
        if (data.stop_reason === 'refusal') throw new Error('Anfrage von Claude abgelehnt.');
        const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
        const jsonStr = (text.match(/\{[\s\S]*\}/) || [text])[0];
        let out;
        try { out = JSON.parse(jsonStr); } catch (e) { throw new Error('Claude-Antwort war kein gültiges JSON.'); }

        const best = Array.isArray(out.bestScenes)
            ? out.bestScenes.map(i => idxMap[i]).filter(i => i != null)
            : [];
        return {
            hook: out.hook || '',
            description: out.description || '',
            hashtags: Array.isArray(out.hashtags) ? out.hashtags : [],
            bestScenes: best
        };
    }

    return { getKey, setKey, hasKey, enhance };
})();
