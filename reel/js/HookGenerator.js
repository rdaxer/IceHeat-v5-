/**
 * HookGenerator - Intelligente Hook-Generierung für mehr Klicks
 * Templates für verschiedene Stile, Text-Overlays, Effekte
 */
const HookGenerator = (() => {
    // Hook-Text Templates nach Stil.
    // Recherche-basiert (virale Reel-Regeln): 3–7 Wörter, Pattern-Interrupt,
    // Neugier-Lücke, konkreter Nutzen, Zielgruppen-Ansprache. Deutsch.
    const HOOK_TEMPLATES = {
        // Neugier-Lücke – der stärkste Hebel
        neugier: [
            '👀 Niemand redet darüber…',
            '🤫 Das verrät dir keiner',
            '🧐 Die meisten übersehen das',
            '👉 Bleib bis zum Ende dran',
            '🔍 Das wusstest du garantiert nicht',
            '😲 Das ändert wirklich alles',
            '💭 Warte auf Sekunde 10',
            '🚪 Das öffnet dir die Augen',
            '📌 Merk dir das für später',
            '🤔 Fast keiner weiß das',
            '⏳ Warte… gleich passiert es',
            '🔓 Das Geheimnis dahinter',
            '🫢 Ich hätte es nie gedacht',
            '🎯 Genau darum geht es',
            '🕳️ Gleich kommt der Twist',
            '👁️ Schau ganz genau hin…'
        ],
        // Steile Behauptung / Bold Claim
        behauptung: [
            '🔥 Das Beste, was du heute siehst',
            '💯 Vertrau mir, das funktioniert',
            '🚀 Das verändert dein Leben',
            '⚡ Der krasseste Trick überhaupt',
            '❌ Vergiss alles, was du kennst',
            '✅ Das ist der einzige Weg',
            '💥 Niemand macht das so',
            '🧠 Das musst du gesehen haben',
            '🥇 Der Gamechanger 2026',
            '😳 Ich glaub es selbst kaum',
            '💎 Dieser Tipp ist unbezahlbar',
            '🙌 Endlich sagt es mal jemand',
            '🚨 Das solltest du wissen',
            '🔝 Das ist nächstes Level'
        ],
        // Liste / Zahl
        liste: [
            '3️⃣ Dinge, die du wissen musst',
            '✋ 5 Fehler, die fast alle machen',
            '🔢 Nummer 2 überrascht dich',
            '📝 3 Dinge, die keiner sagt',
            '⚡ 3 Hacks in 30 Sekunden',
            '🎯 Die Top 3, die wirklich wirken',
            '📌 5 Gründe, warum es nicht klappt',
            '🥇 3 Dinge, die Profis anders machen',
            '💡 7 Tipps, die alles ändern',
            '❌ 3 Fehler – hör sofort auf!'
        ],
        // How-to / konkreter Nutzen
        tutorial: [
            '📚 So machst du das richtig',
            '💡 Der einfachste Weg dafür',
            '🛠️ In 3 Schritten erklärt',
            '🎓 So lernst du es in 60 Sek.',
            '✍️ Schreib dir das auf',
            '🔧 So geht es wirklich',
            '⚙️ Der Trick, den Profis nutzen',
            '✅ So sparst du dir Stunden',
            '🚀 So wirst du schnell besser',
            '🧠 Merk dir diesen Hack'
        ],
        // Story / Spannung
        story: [
            '😱 Warte auf das Ende…',
            '🎬 Du glaubst nicht, was dann passiert',
            '💔 Am Ende bist du sprachlos',
            '😮 Das hat keiner kommen sehen',
            '🍿 Bleib dran, es lohnt sich',
            '🌀 Der Twist am Schluss',
            '😰 Und dann… passierte DAS',
            '👀 Schau bis zur letzten Sekunde',
            '🔥 Die letzte Szene ist der Hammer',
            '⏳ Es wird immer besser…'
        ],
        // Fehler ansprechen
        fehler: [
            '🚫 Du machst das falsch',
            '❌ Hör sofort damit auf!',
            '😬 Diesen Fehler machen fast alle',
            '⚠️ Das ruiniert dein Ergebnis',
            '🙅 Bitte mach das NICHT',
            '🤦 Jahrelang falsch gemacht',
            '🔁 Deshalb klappt es bei dir nicht',
            '🛑 Stopp – bevor du das tust',
            '💸 Das kostet dich nur Zeit',
            '🧯 Genau das killt deine Reichweite'
        ],
        // Warnung / FOMO
        warnung: [
            '🚨 Nicht wegscrollen!',
            '⏰ Bevor es zu spät ist',
            '👀 Das siehst du nur hier',
            '🔥 Speicher das, bevor es weg ist',
            '📥 Das brauchst du später',
            '‼️ Verpass das bloß nicht',
            '⌛ Nur die wenigsten wissen das',
            '🎁 Das solltest du dir merken',
            '🧨 Das ändert gleich deine Meinung',
            '🔒 Bald redet jeder davon'
        ],
        // Frage
        frage: [
            '❓ Wusstest du das schon?',
            '🤨 Kennst du das Problem auch?',
            '🧠 Kannst du das besser?',
            '💬 Team A oder Team B?',
            '🤔 Warum macht das keiner?',
            '❔ Was würdest du tun?',
            '😏 Errätst du das Ende?',
            '🙋 Geht es dir auch so?',
            '📢 Ehrlich – wusstest du das?'
        ],
        // Relatable / POV
        relatable: [
            '😅 Ich fühl mich ertappt',
            '🙈 Sag, ich bin nicht allein',
            '😂 Wir alle kennen das',
            '🫠 POV: du kennst das zu gut',
            '💀 Warum bin ich genau so?',
            '🥴 Jeden. Einzelnen. Tag.',
            '😭 Viel zu real',
            '🤝 Das sind wir alle'
        ],
        // Klassiker (Germanisiert) – Kompatibilität mit alten Werten
        action: [
            '🔥 Warte, gleich kommt es!',
            '⚡ Einfach unglaublich!',
            '🚀 Das ist der Wahnsinn!',
            '😱 Warte bis zum Ende!',
            '🤯 Mir fehlen die Worte!',
            '💪 Das musst du sehen!',
            '🎯 Perfektes Timing!',
            '⭐ Absolut legendär!'
        ],
        comedy: [
            '😂 Ich kann nicht mehr!',
            '🤣 Zu lustig zum Aushalten',
            '😆 Das musst du sehen!',
            '😅 Warte auf die Pointe!',
            '💀 Ich bin tot 💀',
            '😏 Das eskalierte schnell',
            '🤪 Peinlich, aber goldig',
            '🍿 Warte bis zum Schluss!'
        ],
        suspense: [
            '😱 Warte drauf…',
            '🤔 Du glaubst es nicht…',
            '👀 Vertrau mir…',
            '🎬 Was passiert als Nächstes?',
            '⚠️ Schockierender Twist!',
            '🔮 Errätst du das Ende?',
            '😰 Oh nein…',
            '🕵️ Rätsel gelöst!'
        ],
        educational: [
            '📚 Lern diesen Trick!',
            '💡 Genialer Hack!',
            '🎓 Das ändert alles!',
            '🧠 Augen-öffnend!',
            '✨ Absoluter Gamechanger!',
            '📖 Must-know-Tipp!',
            '⚙️ Schritt-für-Schritt',
            '🔬 Endlich verständlich erklärt'
        ],
        lifestyle: [
            '✨ Reine Ästhetik!',
            '💅 Glow-up-Zeit!',
            '🏋️ Transformation!',
            '🧘 Einfach guttun',
            '🏡 Wohn-Goals!',
            '✈️ Reise-Inspiration!',
            '🍽️ Foodie-Träume!',
            '💄 Beauty-Hack!'
        ],
        music: [
            '🎵 Der Beat-Drop!',
            '🎶 Dieser Song aber…',
            '🔊 Lauter machen!',
            '🎧 Producer-Cut!',
            '🥁 Perfekt im Takt!',
            '🎹 Gänsehaut-Moment!',
            '🎼 Ein Meisterwerk!',
            '🎵 Banger-Alarm!'
        ]
    };

    // Reihenfolge & Anzeigenamen für die Stil-Auswahl
    const STYLE_LABELS = {
        neugier: '🔍 Neugier (stärkster Hook)',
        behauptung: '💥 Steile Behauptung',
        liste: '🔢 Liste / Zahl',
        tutorial: '📚 Tutorial / Nutzen',
        story: '🎬 Story / Spannung',
        fehler: '🚫 Fehler ansprechen',
        warnung: '🚨 Warnung / FOMO',
        frage: '❓ Frage',
        relatable: '😅 Relatable / POV',
        action: '⚡ Action / Schnell',
        comedy: '😂 Comedy',
        suspense: '😱 Suspense',
        educational: '🎓 Lehrreich',
        lifestyle: '✨ Lifestyle',
        music: '🎵 Musik'
    };
    function getStyles() { return Object.keys(STYLE_LABELS).map(k => ({ value: k, label: STYLE_LABELS[k] })); }

    // Hook-Effekte (Video-Effekte für erste Sekunden)
    const HOOK_EFFECTS = {
        action: {
            zoom: 'in',
            speed: 1.5,
            color: 'saturate',
            transition: 'zoom-cut'
        },
        comedy: {
            zoom: 'out',
            speed: 1.2,
            color: 'normal',
            transition: 'spin'
        },
        suspense: {
            zoom: 'subtle',
            speed: 0.8,
            color: 'desaturate',
            transition: 'fade'
        },
        educational: {
            zoom: 'in-slow',
            speed: 1.0,
            color: 'highlight',
            transition: 'wipe'
        },
        lifestyle: {
            zoom: 'in',
            speed: 1.0,
            color: 'warm',
            transition: 'fade'
        }
    };

    // Hook-Sounds (Empfehlung)
    const HOOK_SOUNDS = {
        action: ['punch.mp3', 'drum-hit.mp3', 'impact.mp3'],
        comedy: ['laugh-track.mp3', 'cartoon.mp3', 'boing.mp3'],
        suspense: ['tension.mp3', 'string-drop.mp3', 'whoosh.mp3'],
        educational: ['notification.mp3', 'success.mp3', 'ding.mp3'],
        lifestyle: ['sparkle.mp3', 'bells.mp3', 'chime.mp3']
    };

    // Generiere zufälligen Hook
    function generateHook(style = 'action') {
        const templates = HOOK_TEMPLATES[style] || HOOK_TEMPLATES.action;
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // Generiere mehrere Hook-Vorschläge
    function generateHookSuggestions(style = 'action', count = 5) {
        const templates = HOOK_TEMPLATES[style] || HOOK_TEMPLATES.action;
        const suggestions = [];
        const used = new Set();

        while (suggestions.length < count && suggestions.length < templates.length) {
            const text = templates[Math.floor(Math.random() * templates.length)];
            if (!used.has(text)) {
                suggestions.push(text);
                used.add(text);
            }
        }

        return suggestions;
    }

    // Hook-Konfiguration erstellen
    function createHookConfig(text, style = 'action', duration = 3) {
        return {
            text,
            style,
            duration,
            effect: HOOK_EFFECTS[style] || HOOK_EFFECTS.action,
            sound: HOOK_SOUNDS[style]?.[0] || null,
            position: 'top-center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            padding: '16px 24px',
            animation: 'slide-in-top',
            animationDuration: 0.5
        };
    }

    // Personalisiere Hook basierend auf Video-Content
    async function personalizeHook(videoFile, style = 'action') {
        try {
            // Vereinfachte Personalisierung: basierend auf Video-Länge
            const duration = videoFile.duration || 10;

            // Längere Videos → mehr "drama"
            if (duration > 30 && style === 'action') {
                return generateHook('suspense');
            }

            return generateHook(style);
        } catch (err) {
            console.warn('Hook personalization failed:', err);
            return generateHook(style);
        }
    }

    // Hook-Animationen definieren
    const ANIMATIONS = {
        'slide-in-top': {
            keyframes: [
                {transform: 'translateY(-100%)', opacity: 0},
                {transform: 'translateY(0)', opacity: 1}
            ],
            timing: {duration: 500, easing: 'ease-out'}
        },
        'pop-in': {
            keyframes: [
                {transform: 'scale(0)', opacity: 0},
                {transform: 'scale(1.1)', opacity: 1},
                {transform: 'scale(1)', opacity: 1}
            ],
            timing: {duration: 600, easing: 'ease-out'}
        },
        'fade-in': {
            keyframes: [
                {opacity: 0},
                {opacity: 1}
            ],
            timing: {duration: 400, easing: 'ease-in-out'}
        },
        'zoom-in': {
            keyframes: [
                {transform: 'scale(0.5)', opacity: 0},
                {transform: 'scale(1)', opacity: 1}
            ],
            timing: {duration: 500, easing: 'ease-out'}
        },
        'bounce-in': {
            keyframes: [
                {transform: 'scale(0.3)', opacity: 0},
                {transform: 'scale(1.05)', opacity: 1},
                {transform: 'scale(0.9)', opacity: 1},
                {transform: 'scale(1)', opacity: 1}
            ],
            timing: {duration: 600, easing: 'ease-out'}
        }
    };

    // Hook-Präsets für verschiedene Plattformen
    const PLATFORM_PRESETS = {
        tiktok: {
            duration: 2.5,
            fontSize: '56px',
            position: 'top-center',
            animation: 'pop-in'
        },
        instagram: {
            duration: 2.0,
            fontSize: '48px',
            position: 'top-center',
            animation: 'slide-in-top'
        },
        youtube: {
            duration: 3.0,
            fontSize: '44px',
            position: 'center',
            animation: 'fade-in'
        },
        twitter: {
            duration: 2.0,
            fontSize: '40px',
            position: 'top-center',
            animation: 'zoom-in'
        }
    };

    // Hook basierend auf Plattform optimieren
    function optimizeForPlatform(hookConfig, platform = 'tiktok') {
        const preset = PLATFORM_PRESETS[platform] || PLATFORM_PRESETS.tiktok;
        return {
            ...hookConfig,
            duration: preset.duration,
            fontSize: preset.fontSize,
            position: preset.position,
            animation: preset.animation
        };
    }

    // Kombiniere mehrere Hook-Elemente
    function createCompositeHook(hooks, duration = 5) {
        const segments = [];
        const segmentDuration = duration / hooks.length;

        hooks.forEach((hook, idx) => {
            segments.push({
                startTime: idx * segmentDuration,
                endTime: (idx + 1) * segmentDuration,
                text: hook,
                duration: segmentDuration
            });
        });

        return {
            type: 'composite',
            segments,
            totalDuration: duration
        };
    }

    // Hook Vorlage für verschiedene Nischen
    const NICHE_HOOKS = {
        fitness: [
            '💪 TRANSFORMATION INCOMING!',
            '🏋️ BEAST MODE ACTIVATED!',
            '🔥 NO PAIN, NO GAIN!',
            '⚡ FEEL THE PUMP!',
            '🎯 ABS IN 60 DAYS!'
        ],
        cooking: [
            '🍳 KITCHEN HACK!',
            '👨‍🍳 CHEF\'S SECRET!',
            '😋 YOUR TASTE BUDS WILL THANK YOU!',
            '🤤 LOOKS DELICIOUS!',
            '🔪 PRO TIP INCOMING!'
        ],
        travel: [
            '✈️ HIDDEN GEM!',
            '🌴 BUCKET LIST!',
            '🏖️ PARADISE FOUND!',
            '📸 INSTA-WORTHY!',
            '🗺️ MUST VISIT!'
        ],
        tech: [
            '⚡ GAME CHANGING!',
            '💻 TECH HACK!',
            '🤖 AI POWERED!',
            '🔌 NEXT LEVEL!',
            '📱 MIND BLOWN!'
        ],
        beauty: [
            '💄 GLOW UP TIME!',
            '✨ BEAUTY HACK!',
            '💅 FLAWLESS LOOK!',
            '🌟 RADIANT SKIN!',
            '👑 QUEEN STATUS!'
        ]
    };

    // Öffentliche API
    return {
        generateHook,
        generateHookSuggestions,
        getStyles,
        createHookConfig,
        personalizeHook,
        optimizeForPlatform,
        createCompositeHook,
        HOOK_TEMPLATES,
        HOOK_EFFECTS,
        ANIMATIONS,
        PLATFORM_PRESETS,
        NICHE_HOOKS
    };
})();
