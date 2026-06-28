/**
 * HookGenerator - Intelligente Hook-Generierung für mehr Klicks
 * Templates für verschiedene Stile, Text-Overlays, Effekte
 */
const HookGenerator = (() => {
    // Hook-Text Templates nach Stil
    const HOOK_TEMPLATES = {
        action: [
            '🔥 JUST WAIT FOR IT!',
            '⚡ INSANE!',
            '💯 JUST WOW!',
            '🚀 THIS IS CRAZY!',
            '😱 WAIT TIL THE END!',
            '🤯 MIND BLOWN!',
            '💪 UNBELIEVABLE!',
            '🎯 PERFECT!',
            '⭐ LEGENDARY!',
            '🔔 UNMISSABLE!'
        ],
        comedy: [
            '😂 THIS IS HILARIOUS!',
            '🤣 CAN\'T STOP LAUGHING!',
            '😆 YOU GOTTA SEE THIS!',
            '🤪 FUNNIEST EVER!',
            '😅 OMG SO FUNNY!',
            '👀 WAIT FOR THE ENDING!',
            '💀 DEAD! 💀',
            '😏 THAT ESCALATED QUICKLY',
            '😬 AWKWARD AF!',
            '🤣 WATCH TILL END!'
        ],
        suspense: [
            '😱 WAIT FOR IT...',
            '🤔 YOU WON\'T BELIEVE...',
            '👀 TRUST ME...',
            '❓ HOW DOES THIS...',
            '🎬 WHAT HAPPENS NEXT?',
            '⚠️ SHOCKING TWIST!',
            '🔮 GUESS THE ENDING!',
            '😰 OH NO!',
            '🕵️ MYSTERY SOLVED!',
            '💔 YOU\'LL CRY AT END'
        ],
        educational: [
            '📚 LEARN THIS TRICK!',
            '💡 AMAZING HACK!',
            '🎓 THIS CHANGES EVERYTHING!',
            '🧠 MIND-OPENING!',
            '✨ GAME CHANGER!',
            '📖 MUST-KNOW TIP!',
            '🔬 SCIENCE EXPLAINED!',
            '💻 CODING HACK!',
            '🎨 DESIGN TIP!',
            '⚙️ HOW-TO GUIDE!'
        ],
        lifestyle: [
            '✨ AESTHETIC GOALS!',
            '💅 GLOW UP!',
            '👗 STYLE GOALS!',
            '🏋️ TRANSFORMATION!',
            '🧘 FEELING GOOD!',
            '🏡 HOME GOALS!',
            '✈️ TRAVEL INSPIRATION!',
            '🍽️ FOODIE GOALS!',
            '💄 BEAUTY HACK!',
            '🎵 VIBES!'
        ],
        music: [
            '🎵 BEAT DROP!',
            '🎶 THIS SONG THO!',
            '🎤 VOCALS ON POINT!',
            '🔊 TURN IT UP!',
            '🎸 GUITAR SOLO!',
            '🎹 PIANO MOMENT!',
            '🥁 RHYTHM GAME!',
            '🎧 PRODUCER\'S CUT!',
            '🎼 MASTERPIECE!',
            '🎵 BANGER ALERT!'
        ]
    };

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
