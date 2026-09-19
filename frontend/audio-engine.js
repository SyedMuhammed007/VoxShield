/**
 * VoxShield - Audio & Voice Engine
 * Handles real-time Web Audio API signal processing, synthetic/natural voice playback,
 * multi-lingual live microphone streaming, frequency spectrum analysis, and sound effects.
 * 
 * AUTOMATIC MULTI-LANGUAGE DETECTION & REAL-TIME ENGLISH TRANSLATION LAYER:
 * - Autonomous Language Identification across English, Hindi, Tamil, and Telugu (zero manual selection).
 * - Preserves the reference working Hindi pipeline ('hi-IN') and adaptively routes speech recognition.
 * - Translates all recognized speech into natural conversational English in real time.
 * - Stores detected language, confidence, and original native text internally for security analysis.
 * - Clean UI output: Displays pure English transcript without cluttering language badges.
 * - Dual-pipeline isolation: Voice analysis (AASIST, ECAPA, Liveness, Replay) operates concurrently on the raw audio stream.
 */

const TRANSCRIPTION_LANGUAGES = {
    english: {
        label: "English",
        locale: "en-IN",
        key: "english",
        code: "en"
    },
    hindi: {
        label: "Hindi",
        locale: "hi-IN",
        key: "hindi",
        code: "hi"
    },
    tamil: {
        label: "Tamil",
        locale: "ta-IN",
        key: "tamil",
        code: "ta"
    },
    telugu: {
        label: "Telugu",
        locale: "te-IN",
        key: "telugu",
        code: "te"
    }
};

if (typeof window !== "undefined") {
    window.TRANSCRIPTION_LANGUAGES = TRANSCRIPTION_LANGUAGES;
}

// Local conversational & security vocabulary dictionary (Offline Fallback)
const OFFLINE_TRANSLATION_DICT = {
    // Tamil Conversational & Security
    "வணக்கம்": "Hello",
    "நீங்கள் எப்படி இருக்கிறீர்கள்": "How are you?",
    "நீங்கள் எப்படி இருக்கிறீர்கள்?": "How are you?",
    "எப்படி இருக்கிறீர்கள்": "How are you?",
    "எப்படி இருக்கீங்க": "How are you?",
    "நலமா": "Are you doing well?",
    "நன்றி": "Thank you",
    "ரொம்ப நன்றி": "Thank you very much",
    "காப்பாற்றுங்கள்": "Please help me",
    "உதவி": "Help",
    "பணம்": "Money",
    "பணம் அனுப்புங்கள்": "Please send money",
    "ரூபாய்": "Rupees",
    "கடவுச்சொல்": "Password",
    "ஓடிபி": "OTP",
    "எமர்ஜென்சி": "Emergency",
    "அவசரம்": "Urgent emergency",
    "வங்கி": "Bank",
    "கணக்கு": "Account",
    "சரி": "Okay",
    "நான் பேசுகிறேன்": "I am speaking",
    "நீங்கள் யார்": "Who are you?",
    "நீங்கள் சொல்வது புரிகிறது": "I understand what you are saying",
    "என் குரல் கேட்கிறதா": "Can you hear my voice?",
    "vanakkam": "Hello",
    "epdi irukeenga": "How are you?",
    "epdi irukinga": "How are you?",
    "nandri": "Thank you",
    "romba nandri": "Thank you very much",
    "panam": "Money",

    // Hindi Conversational & Security
    "नमस्ते": "Hello",
    "नमस्कार": "Hello",
    "आप कैसे हैं": "How are you?",
    "आप कैसे हैं?": "How are you?",
    "सब ठीक है": "Everything is fine",
    "सब ठीक है?": "Is everything fine?",
    "आप अभी कहाँ हैं": "Where are you now?",
    "आप अभी कहाँ हैं?": "Where are you now?",
    "धन्यवाद": "Thank you",
    "शुक्रिया": "Thank you",
    "मदद कीजिए": "Please help me",
    "पैसे": "Money",
    "पैसे भेजो": "Transfer the money",
    "रुपये": "Rupees",
    "ओटीपी": "OTP",
    "पासवर्ड": "Password",
    "बैंक": "Bank",
    "खाता": "Account",
    "इमरजेंसी": "Emergency",
    "तुरंत": "Immediately",
    "ठीक है": "Okay",
    "हाँ": "Yes",
    "नहीं": "No",
    "सुनिए": "Listen",
    "मेरी आवाज़ आ रही है": "Can you hear my voice?",
    "क्या आप मुझे समझ सकते हैं": "Can you understand what I am saying?",
    "namaste": "Hello",
    "aap kaise ho": "How are you?",
    "kaha ja rahe ho": "Where are you going?",
    "shukriya": "Thank you",
    "theek hai": "Okay",

    // Telugu Conversational & Security
    "నమస్కారం": "Hello",
    "నమస్తే": "Hello",
    "మీరు ఎలా ఉన్నారు": "How are you?",
    "మీరు ఎలా ఉన్నారు?": "How are you?",
    "బాగున్నారా": "Are you doing fine?",
    "ధన్యవాదాలు": "Thank you",
    "సహాయం చేయండి": "Please help me",
    "డబ్బులు": "Money",
    "డబ్బు పంపండి": "Send money",
    "రూపాయలు": "Rupees",
    "ఓటీపీ": "OTP",
    "పాస్‌వర్డ్": "Password",
    "బ్యాంకు": "Bank",
    "ఖాతా": "Account",
    "ఆపద": "Emergency",
    "అత్యవసరం": "Urgent emergency",
    "సరే": "Okay",
    "చెప్పండి": "Tell me",
    "మీరు నన్ను అర్థం చేసుకుంటున్నారా": "Can you understand what I am saying?",
    "నా స్వరం వినబడుతుందా": "Can you hear my voice?",
    "namaskaram": "Hello",
    "meeru ela unnaru": "How are you?",
    "bagunnara": "Are you fine?",
    "dhanyavadalu": "Thank you",
    "sare": "Okay"
};

class VoxAudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.masterGain = null;
        this.highpass = null;
        this.lowpass = null;
        this.micStream = null;
        this.micSource = null;
        this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
        this.recognition = null;
        this.isMuted = false;
        this.volume = 0.85;
        this.isPlayingVoice = false;
        this.currentUtterance = null;
        this.onAudioFeatureCallback = null;
        this.onTranscriptCallback = null;
        this.onTranscriptionErrorCallback = null;
        this.onDiagnosticsUpdate = null;
        this.animFrameId = null;
        this.voices = [];
        this.isMicActive = false;
        this.isRecognizing = false;
        this.recognitionRestartTimer = null;
        this.isRecognitionIntentionallyStopped = false;

        // Automatic Language Detection & Recognition State (Zero Manual Selector)
        this.autoDetectMode = true;
        this.activeRecognitionLocale = "hi-IN"; // Reference Hindi pipeline as default base with Indian phonetic coverage
        this.detectedLanguage = "en";
        this.detectedLangLabel = "English";
        this.detectedConfidence = 0.95;
        this.lastUtteranceTime = 0;
        this.probeIndex = 0;
        this.candidateLocales = ["hi-IN", "ta-IN", "te-IN", "en-IN"];

        // Internal Audio Diagnostics Tracker (Section 11)
        const SpeechRec = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
        this.diagnostics = {
            permission: "prompt",
            streamActive: false,
            trackEnabled: false,
            trackLabel: "None",
            audioContextState: "uninitialized",
            audioFramesReceived: 0,
            rmsLevel: 0,
            speechRecognitionSupported: !!SpeechRec,
            speechRecognitionStatus: !!SpeechRec ? "idle" : "unavailable",
            transcriptEventsCount: 0,
            lastTranscriptTime: "none",
            lastErrorMsg: null,
            detectedLanguage: "Auto (detecting)",
            detectionConfidence: "--",
            translationStatus: "Active (Natural En)",
            activeLanguage: "Auto (hi/ta/te/en)"
        };

        this.loadVoices();
    }

    getLanguageConfig(langInput) {
        if (!langInput) return TRANSCRIPTION_LANGUAGES.english;
        const lower = String(langInput).trim().toLowerCase();
        if (TRANSCRIPTION_LANGUAGES[lower]) return TRANSCRIPTION_LANGUAGES[lower];
        for (const k in TRANSCRIPTION_LANGUAGES) {
            const item = TRANSCRIPTION_LANGUAGES[k];
            if (item.code === lower || item.locale.toLowerCase() === lower || item.label.toLowerCase() === lower) {
                return item;
            }
        }
        if (lower.startsWith("ta")) return TRANSCRIPTION_LANGUAGES.tamil;
        if (lower.startsWith("hi")) return TRANSCRIPTION_LANGUAGES.hindi;
        if (lower.startsWith("te")) return TRANSCRIPTION_LANGUAGES.telugu;
        if (lower.startsWith("en")) return TRANSCRIPTION_LANGUAGES.english;
        return TRANSCRIPTION_LANGUAGES.english;
    }

    setLanguage(langCode) {
        const langConfig = this.getLanguageConfig(langCode);
        this.targetLang = langConfig.locale;
        this.loadVoices();
        return langConfig;
    }

    /**
     * Automatic Language Identification from Transcript & Audio Features (Section 2 & 6)
     * Detects Tamil, Hindi, Telugu, and English.
     */
    detectLanguage(text) {
        if (!text || !text.trim()) {
            return { code: "en", label: "English", confidence: 0.95, locale: "en-IN" };
        }
        const str = text.trim();

        // 1. Script Analysis (instant, deterministic unicode ranges)
        if (/[\u0B80-\u0BFF]/.test(str)) {
            return { code: "ta", label: "Tamil", confidence: 0.96, locale: "ta-IN" };
        }
        if (/[\u0900-\u097F]/.test(str)) {
            return { code: "hi", label: "Hindi", confidence: 0.97, locale: "hi-IN" };
        }
        if (/[\u0C00-\u0C7F]/.test(str)) {
            return { code: "te", label: "Telugu", confidence: 0.95, locale: "te-IN" };
        }

        // 2. Lexical patterns for common romanized phrases (Hindi, Tamil, Telugu)
        const lower = str.toLowerCase();
        if (/\b(vanakkam|epdi|irukinga|irukeenga|nandri|theriyum|solunga|enna|romba|aama|illai|nalla|kaapathunga)\b/.test(lower)) {
            return { code: "ta", label: "Tamil", confidence: 0.93, locale: "ta-IN" };
        }
        if (/\b(namaste|kaise|hai|kya|bhai|kaha|rahe|ho|shukriya|kripya|bolo|theek|paisa|rupaye|madad)\b/.test(lower)) {
            return { code: "hi", label: "Hindi", confidence: 0.94, locale: "hi-IN" };
        }
        if (/\b(namaskaram|ela|unnaru|bagunnara|enti|cheppandi|meeru|dhanyavadalu|dabbu|sahayam)\b/.test(lower)) {
            return { code: "te", label: "Telugu", confidence: 0.93, locale: "te-IN" };
        }

        return { code: "en", label: "English", confidence: 0.95, locale: "en-IN" };
    }

    /**
     * Real-Time English Translation Layer (Section 3 & 8)
     * Preserves meaning and context; outputs natural English.
     */
    async translateToEnglish(text) {
        const trimmed = (text || "").trim();
        if (!trimmed) {
            return {
                englishText: "",
                detectedLanguage: "en",
                detectedLangLabel: "English",
                confidence: 0.95
            };
        }

        // Fast path: Pure ASCII English without Indian lexical keywords
        const isPureAscii = /^[\x00-\x7F]+$/.test(trimmed);
        const hasIndianLexicon = /\b(vanakkam|epdi|irukinga|irukeenga|nandri|namaste|kaise|kya|bhai|kaha|namaskaram|ela|unnaru|bagunnara)\b/i.test(trimmed);

        if (isPureAscii && !hasIndianLexicon) {
            return {
                englishText: trimmed,
                detectedLanguage: "en",
                detectedLangLabel: "English",
                confidence: 0.98
            };
        }

        // Primary: Real-time Neural Multilingual Translation (Google GTX endpoint)
        try {
            const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + encodeURIComponent(trimmed);
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const translated = (data[0] || []).map(seg => seg[0]).join("").trim();
                const detectedCode = data[2] || "auto";
                const labelMap = { ta: "Tamil", hi: "Hindi", te: "Telugu", en: "English" };
                const detectedLabel = labelMap[detectedCode] || (detectedCode ? detectedCode.toUpperCase() : "Detected");

                if (translated) {
                    return {
                        englishText: translated,
                        detectedLanguage: detectedCode,
                        detectedLangLabel: detectedLabel,
                        confidence: 0.95
                    };
                }
            }
        } catch (err) {
            console.warn("[VoxAudioEngine] Neural translation endpoint unavailable, using offline fallback:", err);
        }

        // Fallback: Local conversational & semantic dictionary
        return this.translateLocally(trimmed);
    }

    translateLocally(text) {
        const trimmed = text.trim();
        const det = this.detectLanguage(trimmed);

        // Exact match in dictionary
        if (OFFLINE_TRANSLATION_DICT[trimmed]) {
            return {
                englishText: OFFLINE_TRANSLATION_DICT[trimmed],
                detectedLanguage: det.code,
                detectedLangLabel: det.label,
                confidence: det.confidence
            };
        }

        // Lowercase check
        const lower = trimmed.toLowerCase().replace(/[?!.,]/g, "").trim();
        if (OFFLINE_TRANSLATION_DICT[lower]) {
            return {
                englishText: OFFLINE_TRANSLATION_DICT[lower],
                detectedLanguage: det.code,
                detectedLangLabel: det.label,
                confidence: det.confidence
            };
        }

        // Multi-word phrase matching
        for (const [nativePhrase, englishTranslation] of Object.entries(OFFLINE_TRANSLATION_DICT)) {
            if (trimmed.includes(nativePhrase)) {
                return {
                    englishText: englishTranslation,
                    detectedLanguage: det.code,
                    detectedLangLabel: det.label,
                    confidence: 0.91
                };
            }
        }

        return {
            englishText: trimmed,
            detectedLanguage: det.code,
            detectedLangLabel: det.label,
            confidence: 0.88
        };
    }

    initContextNodes() {
        if (!this.ctx) return;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.highpass = this.ctx.createBiquadFilter();
        this.highpass.type = "highpass";
        this.highpass.frequency.setValueAtTime(80, this.ctx.currentTime);

        this.lowpass = this.ctx.createBiquadFilter();
        this.lowpass.type = "lowpass";
        this.lowpass.frequency.setValueAtTime(8000, this.ctx.currentTime);

        this.highpass.connect(this.lowpass);
        this.lowpass.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initContextNodes();
                this.diagnostics.audioContextState = this.ctx.state;
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().then(() => {
                this.diagnostics.audioContextState = this.ctx ? this.ctx.state : "closed";
            }).catch(e => console.warn("[VoxAudioEngine] Context resume error:", e));
        }
    }

    async resumeContext() {
        this.initContext();
        if (this.ctx && this.ctx.state === "suspended") {
            try {
                await this.ctx.resume();
                this.diagnostics.audioContextState = this.ctx.state;
            } catch(e) {
                console.warn("[VoxAudioEngine] Context resume error:", e);
            }
        }
        return this.ctx ? this.ctx.state : "uninitialized";
    }

    loadVoices() {
        if (!this.synth) return;
        const update = () => {
            this.voices = this.synth.getVoices();
        };
        update();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = update;
        }
    }

    // --- Live Microphone Audio & Speech-to-Text Pipeline (Sections 2, 6, 17) ---
    async startMicrophone() {
        this.initContext();
        this.diagnostics.lastErrorMsg = null;

        if (this.ctx && this.ctx.state === "suspended") {
            try {
                await this.ctx.resume();
                this.diagnostics.audioContextState = this.ctx.state;
            } catch(e) {
                console.warn("[VoxAudioEngine] AudioContext resume failed:", e);
            }
        }

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("getUserMedia is not supported on this device/browser.");
            }

            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: { ideal: 44100 }
                },
                video: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.micStream = stream;
            this.isMicActive = true;
            this.isRecognitionIntentionallyStopped = false;

            const tracks = stream.getAudioTracks();
            if (tracks.length > 0) {
                const track = tracks[0];
                this.diagnostics.permission = "granted";
                this.diagnostics.streamActive = true;
                this.diagnostics.trackEnabled = track.enabled;
                this.diagnostics.trackLabel = track.label || "Default Microphone";
            }

            // Route raw stream into Web Audio AnalyserNode (Feeds AASIST, ECAPA, Liveness, Replay)
            if (this.ctx) {
                if (this.micSource) {
                    try { this.micSource.disconnect(); } catch(e) {}
                }
                this.micSource = this.ctx.createMediaStreamSource(stream);
                this.micSource.connect(this.analyser);
            }

            // Start Autonomous Multi-Language Speech Recognition Pipeline
            this.startSpeechRecognition();

            return true;
        } catch (err) {
            console.error("[VoxAudioEngine] Microphone access failed:", err);
            this.diagnostics.permission = "denied";
            this.diagnostics.lastErrorMsg = err.message || String(err);
            this.isMicActive = false;
            return false;
        }
    }

    startTranscription() {
        return this.startSpeechRecognition();
    }

    /**
     * Autonomous Adaptive Multi-Language Speech Recognition Engine (Section 2, 4, 6)
     * Starts listening with native locale; dynamically adapts to Tamil, Hindi, Telugu, or English.
     */
    startSpeechRecognition(forceLocale) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.diagnostics.speechRecognitionSupported = !!SpeechRec;

        const localeToUse = forceLocale || this.activeRecognitionLocale || "hi-IN";
        this.activeRecognitionLocale = localeToUse;

        if (!SpeechRec) {
            this.diagnostics.speechRecognitionStatus = "unavailable";
            console.warn("[VoxAudioEngine] Web Speech Recognition API not available in this browser.");
            if (this.onTranscriptionErrorCallback) {
                this.onTranscriptionErrorCallback("unsupported", { label: "Automatic" });
            }
            return false;
        }

        // Clean up previous instance
        if (this.recognition) {
            try {
                this.recognition.onstart = null;
                this.recognition.onresult = null;
                this.recognition.onerror = null;
                this.recognition.onend = null;
                this.recognition.abort();
            } catch(e) {}
            this.recognition = null;
        }

        try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.maxAlternatives = 1;
            rec.lang = localeToUse;

            this.recognition = rec;
            this.isRecognizing = false;

            rec.onstart = () => {
                this.isRecognizing = true;
                this.diagnostics.speechRecognitionStatus = "listening";
                console.log(`[VoxAudioEngine] Autonomous speech recognition active (probe: ${rec.lang})`);
            };

            rec.onresult = async (event) => {
                let interimNative = "";
                let finalChunkNative = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const item = event.results[i];
                    if (item.isFinal) {
                        finalChunkNative += item[0].transcript;
                    } else {
                        interimNative += item[0].transcript;
                    }
                }

                const rawText = (finalChunkNative || interimNative).trim();
                if (!rawText) return;

                // 1. Automatic Language Identification
                const langInfo = this.detectLanguage(rawText);
                this.detectedLanguage = langInfo.code;
                this.detectedLangLabel = langInfo.label;
                this.detectedConfidence = langInfo.confidence;

                // Update technical diagnostics (Section 11)
                this.diagnostics.detectedLanguage = `${langInfo.label} (${langInfo.code})`;
                this.diagnostics.detectionConfidence = `${Math.round(langInfo.confidence * 100)}%`;
                this.diagnostics.activeLanguage = rec.lang;
                this.diagnostics.transcriptEventsCount++;
                this.diagnostics.lastTranscriptTime = new Date().toLocaleTimeString();

                // 2. Seamless locale adaptation for multi-sentence continuity & code-switching
                if (langInfo.locale && langInfo.locale !== rec.lang) {
                    this.activeRecognitionLocale = langInfo.locale;
                }

                // 3. Multilingual Translation Layer to English (Section 3 & 8)
                if (finalChunkNative.trim()) {
                    const transRes = await this.translateToEnglish(finalChunkNative.trim());
                    if (this.onTranscriptCallback) {
                        this.onTranscriptCallback({
                            id: "seg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
                            speaker: "YOU",
                            detectedLanguage: transRes.detectedLanguage || langInfo.code,
                            detectedLangLabel: transRes.detectedLangLabel || langInfo.label,
                            originalText: finalChunkNative.trim(),
                            englishText: transRes.englishText,
                            text: transRes.englishText,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            confidence: transRes.confidence || langInfo.confidence,
                            isFinal: true
                        });
                    }
                } else if (interimNative.trim()) {
                    // Interim preview
                    const localPreview = this.translateLocally(interimNative.trim());
                    if (this.onTranscriptCallback) {
                        this.onTranscriptCallback({
                            id: "interim",
                            speaker: "YOU",
                            detectedLanguage: langInfo.code,
                            detectedLangLabel: langInfo.label,
                            originalText: interimNative.trim(),
                            englishText: localPreview.englishText,
                            text: localPreview.englishText,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            confidence: langInfo.confidence,
                            isFinal: false
                        });
                    }
                }
            };

            rec.onerror = (event) => {
                console.warn(`[VoxAudioEngine] Speech recognition notice (${rec.lang}):`, event.error);
                this.diagnostics.lastErrorMsg = event.error;

                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    this.diagnostics.speechRecognitionStatus = "permission_denied";
                    this.isRecognitionIntentionallyStopped = true;
                    if (this.onTranscriptionErrorCallback) {
                        this.onTranscriptionErrorCallback(event.error, { label: "Automatic" });
                    }
                } else if (event.error === "language-not-supported") {
                    console.warn(`[VoxAudioEngine] Locale ${rec.lang} not supported. Switching to fallback.`);
                    this.activeRecognitionLocale = "en-IN";
                } else if (event.error === "no-speech") {
                    this.diagnostics.speechRecognitionStatus = "listening";
                    // If user was speaking (VAD active) but no speech decoded, probe next Indian language locale
                    if (this.diagnostics.rmsLevel > 0.025) {
                        this.probeIndex = (this.probeIndex + 1) % this.candidateLocales.length;
                        this.activeRecognitionLocale = this.candidateLocales[this.probeIndex];
                    }
                }
            };

            rec.onend = () => {
                this.isRecognizing = false;
                console.log(`[VoxAudioEngine] Speech recognition ended. isMicActive:`, this.isMicActive);

                if (this.isMicActive && !this.isRecognitionIntentionallyStopped) {
                    this.diagnostics.speechRecognitionStatus = "restarting";
                    clearTimeout(this.recognitionRestartTimer);
                    this.recognitionRestartTimer = setTimeout(() => {
                        if (this.isMicActive && !this.isRecognitionIntentionallyStopped && !this.isRecognizing) {
                            this.startSpeechRecognition(this.activeRecognitionLocale);
                        }
                    }, 180);
                } else {
                    this.diagnostics.speechRecognitionStatus = "stopped";
                }
            };

            rec.start();
            return true;
        } catch (err) {
            console.error(`[VoxAudioEngine] Could not start autonomous speech recognition:`, err);
            this.diagnostics.speechRecognitionStatus = "failed_to_start";
            return false;
        }
    }

    stopMicrophone() {
        this.isMicActive = false;
        this.isRecognitionIntentionallyStopped = true;
        clearTimeout(this.recognitionRestartTimer);

        if (this.micStream) {
            this.micStream.getTracks().forEach(track => {
                try { track.stop(); } catch(e) {}
            });
            this.micStream = null;
        }
        if (this.micSource) {
            try { this.micSource.disconnect(); } catch(e) {}
            this.micSource = null;
        }
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) {}
            this.recognition = null;
        }
        this.isRecognizing = false;
        this.diagnostics.streamActive = false;
        this.diagnostics.trackEnabled = false;
        this.diagnostics.speechRecognitionStatus = "stopped";
    }

    // --- Sound Effects Synthesizer (Zero External Dependencies) ---
    playRingtone() {
        this.initContext();
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(480, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.setValueAtTime(0.18, now + 0.8);
        gain.gain.linearRampToValueAtTime(0, now + 0.9);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.95);
        osc2.stop(now + 0.95);
    }

    playConnectTone() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playWarningAlarm() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(850, now + 0.2);
        osc.frequency.linearRampToValueAtTime(400, now + 0.4);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    playPing() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    playChallengeBeep() {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // --- Scenario Dialogue Speech Synthesis ---
    speakDialogue(text, scenario, onEnd) {
        if (!this.synth) {
            if (onEnd) onEnd();
            return;
        }

        this.synth.cancel();
        this.initContext();

        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;
        this.isPlayingVoice = true;

        utterance.volume = this.isMuted ? 0 : this.volume;
        utterance.rate = scenario.speech_rate || 1.0;
        utterance.pitch = scenario.speech_pitch || 1.0;
        utterance.lang = "en-IN";

        // Assign natural voice if available
        if (this.voices.length > 0) {
            const matchingVoices = this.voices.filter(v => v.lang.startsWith("en"));
            if (matchingVoices.length > 0) {
                utterance.voice = matchingVoices[0];
            }
        }

        this.startWaveformSimulation();

        utterance.onend = () => {
            this.isPlayingVoice = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.warn("[VoxAudioEngine] Speech synthesis notification:", e);
            this.isPlayingVoice = false;
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

    startWaveformSimulation() {
        if (!this.analyser) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        osc.connect(g);
        g.connect(this.analyser);
        osc.start();
        setTimeout(() => {
            try {
                osc.stop();
                osc.disconnect();
            } catch(e) {}
        }, 3000);
    }

    stopVoice() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isPlayingVoice = false;
    }

    // --- Feature Extraction from AnalyserNode ---
    extractFeatures() {
        if (!this.analyser) return { rms: 0, pitch: 0, zcr: 0 };

        const bufferLength = this.analyser.fftSize;
        const timeData = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(timeData);

        // 1. RMS Energy
        let sumSquares = 0;
        let zeroCrossings = 0;
        for (let i = 0; i < bufferLength; i++) {
            sumSquares += timeData[i] * timeData[i];
            if (i > 0 && ((timeData[i] >= 0 && timeData[i - 1] < 0) || (timeData[i] < 0 && timeData[i - 1] >= 0))) {
                zeroCrossings++;
            }
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const zcr = zeroCrossings / bufferLength;

        // 2. Fundamental Frequency (f0 / Pitch via Autocorrelation)
        const pitch = this.calculatePitch(timeData, this.ctx ? this.ctx.sampleRate : 44100);

        // Update internal diagnostics
        this.diagnostics.audioFramesReceived++;
        this.diagnostics.rmsLevel = rms;

        return { rms, pitch, zcr };
    }

    calculatePitch(timeData, sampleRate) {
        let maxCorr = 0;
        let bestLag = -1;
        const minLag = Math.floor(sampleRate / 400); // 400 Hz max
        const maxLag = Math.floor(sampleRate / 70);  // 70 Hz min

        for (let lag = minLag; lag < maxLag; lag++) {
            let corr = 0;
            for (let i = 0; i < timeData.length - lag; i++) {
                corr += timeData[i] * timeData[i + lag];
            }
            if (corr > maxCorr) {
                maxCorr = corr;
                bestLag = lag;
            }
        }

        if (bestLag > 0 && maxCorr > 0.1) {
            return sampleRate / bestLag;
        }
        return 0;
    }

    // --- Canvas Oscilloscope Visualizer ---
    drawWaveform(canvas, color = "#00f0ff") {
        if (!canvas || !this.analyser) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = "rgba(10, 14, 23, 0.4)";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawSpectrum(canvas) {
        if (!canvas || !this.analyser) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = 64;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            const grad = ctx.createLinearGradient(0, height, 0, 0);
            grad.addColorStop(0, "rgba(6, 182, 212, 0.2)");
            grad.addColorStop(0.5, "#06b6d4");
            grad.addColorStop(1, "#10b981");

            ctx.fillStyle = grad;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    setVolume(val) {
        this.volume = parseFloat(val);
        if (this.masterGain && this.ctx && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }
}
