/**
 * VoxShield — Audio & Voice Engine
 * Handles real-time Web Audio API signal processing, synthetic/natural voice playback,
 * multi-lingual live microphone streaming, frequency spectrum analysis, and sound effects.
 * Supports dynamic language adaptation for English, Hindi, Tamil, Telugu, and Bengali.
 */

class VoxAudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.masterGain = null;
        this.micStream = null;
        this.micSource = null;
        this.filterNode = null;
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isMuted = false;
        this.volume = 0.85;
        this.isPlayingVoice = false;
        this.currentUtterance = null;
        this.onAudioFeatureCallback = null;
        this.onTranscriptCallback = null;
        this.animFrameId = null;
        this.voices = [];
        this.isMicActive = false;

        // Multi-language recognition & synthesis configuration
        this.currentLangCode = localStorage.getItem("vox_lang") || "en";
        this.targetLang = this.mapLanguageCode(this.currentLangCode);

        this.initSpeechRecognition();
        this.loadVoices();
    }

    mapLanguageCode(langCode) {
        const langMap = {
            "en": "en-IN",
            "hi": "hi-IN",
            "ta": "ta-IN",
            "te": "te-IN",
            "bn": "bn-IN"
        };
        return langMap[langCode] || "en-IN";
    }

    setLanguage(langCode) {
        this.currentLangCode = langCode || "en";
        const mapped = this.mapLanguageCode(this.currentLangCode);
        this.targetLang = mapped;

        console.log(`[VoxAudioEngine] Language set to: ${this.currentLangCode} (Recognition locale: ${mapped})`);

        if (this.recognition) {
            this.recognition.lang = mapped;
            // If microphone is actively listening, restart recognition so the acoustic model switches
            if (this.isMicActive) {
                try {
                    this.recognition.stop();
                } catch(e) {}
                setTimeout(() => {
                    if (this.isMicActive && this.recognition) {
                        try {
                            this.recognition.lang = this.targetLang;
                            this.recognition.start();
                        } catch(e) {
                            console.warn("[VoxAudioEngine] Restart recognition error:", e);
                        }
                    }
                }, 120);
            }
        }

        this.loadVoices();
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
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
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
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

    initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            try {
                this.recognition = new SpeechRec();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = this.targetLang || "en-IN";

                this.recognition.onresult = (event) => {
                    let interim = "";
                    let final = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final += event.results[i][0].transcript;
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    const text = (final || interim).trim();
                    if (text && this.onTranscriptCallback) {
                        this.onTranscriptCallback(text, !!final);
                    }
                };

                this.recognition.onerror = (err) => {
                    // Ignore common harmless mic state notifications
                    if (err.error !== "no-speech" && err.error !== "aborted") {
                        console.warn("[VoxAudioEngine] Speech recognition notification:", err.error);
                    }
                };

                this.recognition.onend = () => {
                    // Automatically keep recognizer alive if live microphone is still active
                    if (this.isMicActive && this.recognition) {
                        try {
                            this.recognition.lang = this.targetLang || "en-IN";
                            this.recognition.start();
                        } catch(e) {}
                    }
                };
            } catch (err) {
                console.warn("[VoxAudioEngine] Could not initialize speech recognition:", err);
            }
        }
    }

    // --- Sound Effects Synthesizer (Zero External Dependencies) ---
    playRingtone() {
        this.initContext();
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
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1318.5, now); // E6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    // --- Synthetic / Natural Caller Voice Playback with Multi-Language Support ---
    speakDialogue(text, scenario, onEnd) {
        if (!this.synth) {
            if (onEnd) onEnd();
            return;
        }

        this.initContext();
        this.stopVoice();

        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        const langPrefix = (this.currentLangCode || "en").toLowerCase();

        // 1. First priority: match voice to the selected language
        let chosenVoice = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));

        // 2. If no regional voice is installed on user's OS, fall back to Indian/English voices
        if (!chosenVoice) {
            chosenVoice = this.voices.find(v => v.lang.toLowerCase().includes("in") || v.lang.toLowerCase().includes("en"));
        }

        if (chosenVoice) {
            utterance.voice = chosenVoice;
            utterance.lang = this.targetLang || chosenVoice.lang;
        } else {
            utterance.lang = this.targetLang || "en-IN";
        }

        // Configure voice parameters according to scenario persona
        if (scenario && scenario.voice_type === "ai_clone_robotic") {
            utterance.rate = 1.14;
            utterance.pitch = 0.86; // Flatter pitch typical of synthetic neural TTS
        } else if (scenario && scenario.voice_type === "human_natural") {
            utterance.rate = 1.0;
            utterance.pitch = 1.12; // Natural warmer human inflection
        } else if (scenario && scenario.voice_type === "replay_loop") {
            utterance.rate = 0.94;
            utterance.pitch = 0.90; // Fixed metallic replay cadence
        } else {
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
        }

        let simOscInterval = null;

        utterance.onstart = () => {
            this.isPlayingVoice = true;
            if (scenario) {
                simOscInterval = this.startWaveformSimulation(scenario);
            }
        };

        utterance.onend = () => {
            this.isPlayingVoice = false;
            if (simOscInterval) clearInterval(simOscInterval);
            if (onEnd) onEnd();
        };

        utterance.onerror = (err) => {
            this.isPlayingVoice = false;
            if (simOscInterval) clearInterval(simOscInterval);
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

    // Creates dynamic harmonic energy in the analyser while the voice is speaking
    startWaveformSimulation(scenario) {
        if (!this.ctx) return null;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = scenario.voice_type === "ai_clone_robotic" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(scenario.pitch_base || 180, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.0001, this.ctx.currentTime); // Inaudible to speaker, feeds AnalyserNode
        
        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start();

        const interval = setInterval(() => {
            if (!this.isPlayingVoice) {
                try { osc.stop(); } catch(e) {}
                clearInterval(interval);
                return;
            }
            const jitter = (Math.random() - 0.5) * ((scenario.pitch_variance || 0.1) * 40);
            osc.frequency.setValueAtTime((scenario.pitch_base || 180) + jitter, this.ctx.currentTime);
        }, 120);

        return interval;
    }

    stopVoice() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
        }
        this.isPlayingVoice = false;
        this.currentUtterance = null;
    }

    // --- Live Microphone Integration with Dynamic Language Locale ---
    async startMicrophone(onAudioData) {
        this.initContext();
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: false,
                    autoGainControl: true
                }
            });

            this.micSource = this.ctx.createMediaStreamSource(this.micStream);
            this.micSource.connect(this.analyser);
            this.isMicActive = true;

            if (this.recognition) {
                try {
                    this.recognition.lang = this.targetLang || "en-IN";
                    this.recognition.start();
                    console.log(`[VoxAudioEngine] Live Speech Recognition active in: ${this.recognition.lang}`);
                } catch(e) {
                    // Recognition might already be running
                }
            }

            return true;
        } catch (err) {
            console.error("[VoxAudioEngine] Microphone access failed:", err);
            return false;
        }
    }

    stopMicrophone() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        if (this.micSource) {
            try { this.micSource.disconnect(); } catch(e) {}
            this.micSource = null;
        }
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) {}
        }
        this.isMicActive = false;
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

        // 2. Fundamental Frequency (Autocorrelation)
        const pitch = this.calculatePitch(timeData, this.ctx.sampleRate);

        return { rms, pitch, zcr };
    }

    calculatePitch(timeData, sampleRate) {
        let bestOffset = -1;
        let bestCorrelation = 0;
        const minSamples = Math.floor(sampleRate / 400); // 400 Hz max pitch
        const maxSamples = Math.floor(sampleRate / 80);  // 80 Hz min pitch

        for (let offset = minSamples; offset < maxSamples; offset++) {
            let correlation = 0;
            for (let i = 0; i < maxSamples; i++) {
                correlation += Math.abs(timeData[i] - timeData[i + offset]);
            }
            correlation = 1 - (correlation / maxSamples);
            if (correlation > bestCorrelation && correlation > 0.88) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        }

        if (bestOffset !== -1) {
            return sampleRate / bestOffset;
        }
        return 0;
    }

    // --- Real-time Oscilloscope Waveform Renderer ---
    drawWaveform(canvas, color = "#06b6d4") {
        if (!this.analyser || !canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 2;
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
    }

    // --- Frequency Spectrum FFT Bars Renderer ---
    drawSpectrum(canvas) {
        if (!this.analyser || !canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barCount = 32;
        const barWidth = (width / barCount) - 2;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step];
            const percent = value / 255;
            const barHeight = height * percent;

            let gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            if (percent > 0.75) {
                gradient.addColorStop(0, "#06b6d4");
                gradient.addColorStop(1, "#f43f5e");
            } else {
                gradient.addColorStop(0, "#06b6d4");
                gradient.addColorStop(1, "#10b981");
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }
}

window.VoxAudioEngine = VoxAudioEngine;
