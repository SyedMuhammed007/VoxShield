/**
 * VoxShield - Audio & Voice Engine
 * Handles real-time Web Audio API signal processing, synthetic/natural voice playback,
 * multi-lingual live microphone streaming, frequency spectrum analysis, and sound effects.
 * Supports dynamic language adaptation for English, Hindi, Tamil, Telugu, and Bengali.
 * Enhanced for mobile browser compatibility (Android Chrome, iOS Safari, desktop).
 */

/**
 * Central Language Configuration for Live Transcription & Voice Analysis (Section 3)
 * Reference: Preserves exact working Hindi configuration ('hi-IN') and standardizes across languages.
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

class VoxAudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.masterGain = null;
        this.highpass = null;
        this.lowpass = null;
        this.micStream = null;
        this.micSource = null;
        this.synth = window.speechSynthesis;
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

        // Multi-language recognition & synthesis configuration (Section 3 & 4)
        const initialLang = localStorage.getItem("vox_transcription_lang") || localStorage.getItem("vox_lang") || "english";
        const langConfig = this.getLanguageConfig(initialLang);
        this.currentTranscriptionLangKey = langConfig.key;
        this.currentLangCode = langConfig.code;
        this.targetLang = langConfig.locale;

        // Internal Audio Diagnostics Tracker (Sections 11 & 25)
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
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
            activeLanguage: this.targetLang
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

    mapLanguageCode(langCode) {
        return this.getLanguageConfig(langCode).locale;
    }

    setLanguage(langCode) {
        const langConfig = this.getLanguageConfig(langCode);
        this.currentTranscriptionLangKey = langConfig.key;
        this.currentLangCode = langConfig.code;
        this.targetLang = langConfig.locale;
        this.diagnostics.activeLanguage = langConfig.locale;

        console.log(`[VoxAudioEngine] Language set to: ${langConfig.label} (${langConfig.locale})`);

        if (this.isMicActive) {
            // Section 10: Seamlessly switch live speech recognition to new locale without stopping mic capture
            this.startSpeechRecognition(langConfig.key);
        }

        this.loadVoices();
        return langConfig;
    }

    initContextNodes() {
        if (!this.ctx) return;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.82;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Telephone bandpass filter (simulates cellular call acoustic profile)
        this.highpass = this.ctx.createBiquadFilter();
        this.highpass.type = "highpass";
        this.highpass.frequency.setValueAtTime(280, this.ctx.currentTime);

        this.lowpass = this.ctx.createBiquadFilter();
        this.lowpass.type = "lowpass";
        this.lowpass.frequency.setValueAtTime(3400, this.ctx.currentTime);

        this.highpass.connect(this.lowpass);
        this.lowpass.connect(this.analyser);
        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
    }

    async resumeContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initContextNodes();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            try {
                await this.ctx.resume();
                console.log("[VoxAudioEngine] AudioContext resumed, state:", this.ctx.state);
            } catch(e) {
                console.warn("[VoxAudioEngine] AudioContext resume failed:", e);
            }
        }
        if (this.ctx) {
            this.diagnostics.audioContextState = this.ctx.state;
        }
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.initContextNodes();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        if (this.ctx) {
            this.diagnostics.audioContextState = this.ctx.state;
        }
    }

    loadVoices() {
        if (!this.synth) return;
        const update = () => {
            this.voices = this.synth.getVoices() || [];
        };
        update();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = update;
        }
    }

    // --- Live Microphone Audio & Speech-to-Text Pipeline (Sections 8-15) ---
    async startMicrophone() {
        await this.resumeContext();
        this.isRecognitionIntentionallyStopped = false;

        // Check getUserMedia support
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        if (!hasMediaDevices && !navigator.getUserMedia && !navigator.webkitGetUserMedia) {
            this.diagnostics.permission = "unsupported";
            this.diagnostics.lastErrorMsg = "Microphone capture API not supported in this browser.";
            console.error("[VoxAudioEngine]", this.diagnostics.lastErrorMsg);
            return false;
        }

        try {
            let stream;
            if (hasMediaDevices) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: false,
                        autoGainControl: true
                    }
                });
            } else {
                const legacyGetMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia).bind(navigator);
                stream = await new Promise((resolve, reject) => {
                    legacyGetMedia({ audio: true }, resolve, reject);
                });
            }

            this.micStream = stream;
            this.diagnostics.permission = "granted";
            this.diagnostics.streamActive = true;

            const tracks = this.micStream.getAudioTracks();
            if (tracks.length > 0) {
                this.diagnostics.trackEnabled = tracks[0].enabled;
                this.diagnostics.trackLabel = tracks[0].label || "Microphone Hardware Track";
            }

            if (!this.ctx) {
                await this.resumeContext();
            }

            this.micSource = this.ctx.createMediaStreamSource(this.micStream);
            this.micSource.connect(this.analyser);
            this.isMicActive = true;

            // Start Speech-to-Text Engine
            this.startSpeechRecognition(this.currentLangCode);

            return true;
        } catch (err) {
            console.error("[VoxAudioEngine] Microphone access failed:", err);
            const isDenied = (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
            this.diagnostics.permission = isDenied ? "denied" : "failed";
            this.diagnostics.lastErrorMsg = isDenied
                ? "Microphone access denied. Please allow microphone access in your browser settings to enable voice analysis."
                : (err.message || "Microphone initialization failed.");
            return false;
        }
    }

    // One Unified Transcription Engine (Section 4)
    startTranscription(language) {
        return this.startSpeechRecognition(language);
    }

    startSpeechRecognition(langInput) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.diagnostics.speechRecognitionSupported = !!SpeechRec;

        // Resolve language configuration (Section 3: central language configuration)
        const langConfig = this.getLanguageConfig(langInput || this.currentTranscriptionLangKey || this.currentLangCode);
        this.currentTranscriptionLangKey = langConfig.key;
        this.currentLangCode = langConfig.code;
        this.targetLang = langConfig.locale;
        this.diagnostics.activeLanguage = langConfig.locale;

        if (!SpeechRec) {
            this.diagnostics.speechRecognitionStatus = "unavailable";
            console.warn("[VoxAudioEngine] Web Speech Recognition API not available in this browser.");
            if (this.onTranscriptionErrorCallback) {
                this.onTranscriptionErrorCallback("unsupported", langConfig);
            }
            return false;
        }

        // Prevent multiple concurrent recognition instances (Section 17)
        if (this.isRecognizing && this.recognition) {
            if (this.recognition.lang === langConfig.locale) {
                return true;
            }
            console.log(`[VoxAudioEngine] Language switch requested (${this.recognition.lang} -> ${langConfig.locale}). Re-initializing...`);
        }

        try {
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

            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.maxAlternatives = 1;
            rec.lang = langConfig.locale;

            this.recognition = rec;
            this.isRecognizing = false;

            rec.onstart = () => {
                this.isRecognizing = true;
                this.diagnostics.speechRecognitionStatus = "listening";
                console.log(`[VoxAudioEngine] Speech recognition active: ${langConfig.label} (${rec.lang})`);
            };

            rec.onresult = (event) => {
                let interim = "";
                let finalChunk = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const item = event.results[i];
                    if (item.isFinal) {
                        finalChunk += item[0].transcript;
                    } else {
                        interim += item[0].transcript;
                    }
                }

                // Forward transcript chunks preserving native script without automatic translation (Sections 5, 6, 7, 8, 14)
                if (finalChunk.trim()) {
                    this.diagnostics.transcriptEventsCount++;
                    this.diagnostics.lastTranscriptTime = new Date().toLocaleTimeString();
                    if (this.onTranscriptCallback) {
                        this.onTranscriptCallback(finalChunk.trim(), true, langConfig.key, langConfig.locale);
                    }
                }
                if (interim.trim()) {
                    this.diagnostics.transcriptEventsCount++;
                    this.diagnostics.lastTranscriptTime = new Date().toLocaleTimeString();
                    if (this.onTranscriptCallback) {
                        this.onTranscriptCallback(interim.trim(), false, langConfig.key, langConfig.locale);
                    }
                }
            };

            rec.onerror = (event) => {
                console.warn(`[VoxAudioEngine] Speech recognition notification (${langConfig.label}):`, event.error);
                this.diagnostics.lastErrorMsg = event.error;

                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    this.diagnostics.speechRecognitionStatus = "permission_denied";
                    this.isRecognitionIntentionallyStopped = true;
                    if (this.onTranscriptionErrorCallback) {
                        this.onTranscriptionErrorCallback(event.error, langConfig);
                    }
                } else if (event.error === "language-not-supported") {
                    console.warn(`[VoxAudioEngine] Language ${rec.lang} (${langConfig.label}) not supported on device.`);
                    this.diagnostics.speechRecognitionStatus = "lang_unsupported";
                    if (this.onTranscriptionErrorCallback) {
                        this.onTranscriptionErrorCallback("language-not-supported", langConfig);
                    }
                } else if (event.error === "no-speech") {
                    this.diagnostics.speechRecognitionStatus = "listening";
                } else if (event.error === "audio-capture") {
                    this.diagnostics.speechRecognitionStatus = "audio_capture_busy";
                }
            };

            rec.onend = () => {
                this.isRecognizing = false;
                console.log(`[VoxAudioEngine] Speech recognition ended (${langConfig.label}). isMicActive:`, this.isMicActive);

                // Section 16: Handle mobile recognition auto-restart using the CURRENT language (do NOT accidentally revert to another language!)
                if (this.isMicActive && !this.isRecognitionIntentionallyStopped) {
                    this.diagnostics.speechRecognitionStatus = "restarting";
                    clearTimeout(this.recognitionRestartTimer);
                    this.recognitionRestartTimer = setTimeout(() => {
                        if (this.isMicActive && !this.isRecognitionIntentionallyStopped && !this.isRecognizing) {
                            this.startSpeechRecognition(this.currentTranscriptionLangKey);
                        }
                    }, 150);
                } else {
                    this.diagnostics.speechRecognitionStatus = "stopped";
                }
            };

            rec.start();
            return true;
        } catch (err) {
            console.error(`[VoxAudioEngine] Could not start speech recognition for ${langConfig.label}:`, err);
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
        utterance.lang = this.targetLang || "en-IN";

        // Assign natural voice if available
        if (this.voices.length > 0) {
            const langPrefix = this.targetLang.split("-")[0];
            const matchingVoices = this.voices.filter(v => v.lang.startsWith(langPrefix) || v.lang.startsWith(this.targetLang));
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
        // Inject synthetic frequency harmonics into analyser for realistic visualizer animation
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

        // Neon Glow effect
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

        const bufferLength = 64; // Subsampled for fast 60fps rendering
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            // Gradient cyan to emerald
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
