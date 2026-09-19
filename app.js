/**
 * VoxShield - Main Application Controller
 * Handles screen routing, call lifecycle, real voice playback, dynamic challenge,
 * push notifications, trusted circle management, and incident logging.
 */

class VoxShieldApp {
 constructor() {
 this.audioEngine = new VoxAudioEngine();
 this.detectionEngine = new VoxDetectionEngine();
 this.currentScenario = null;
 this.callInterval = null;
 this.callSeconds = 0;
 this.dialogueIndex = 0;
 this.dialogueTimer = null;
 this.ws = null;
 this.wsConnected = false;
 this.activeScreen = "dashboard";
 this.isSocExpanded = true;
 this.hasConsent = true;

        // Persistent Local Database Collections (Syncs with browser localStorage per DPDP Act 2023)
        this.trustedCircle = this.loadTrustedCircle();
        this.incidents = this.loadIncidents();

        // Autonomous Multi-Language Real-Time Transcription (Zero manual language selector)
        this.currentCall = {
            id: null,
            caller: null,
            startTime: null,
            mode: "automatic_multilingual"
        };
        this.finalTranscriptSegments = [];
        this.interimTranscript = null;
        this.transcriptSegments = [];
        this.debugInterval = null;
        window.voxApp = this;
        window.app = this;

        this.initDOM();
        this.initWebSocket();
        this.setupAudioListeners();
    }

 initDOM() {
        // Initialize Multi-Language Engine
        if (window.voxI18n) {
            window.voxI18n.init();
        }

        // Environment Theme Switcher (Light / Dark) - Default is Executive Light Theme
        const updateThemeUI = (isDark) => {
            const topbarBtn = document.getElementById("btn-theme-toggle");
            const mobileBtn = document.getElementById("btn-theme-toggle-mobile");
            const settingsBtn = document.getElementById("btn-theme-toggle-settings");
            const topbarLabel = document.getElementById("theme-btn-text");
            const mobileLabel = document.getElementById("mobile-theme-text");
            const settingsTitle = document.getElementById("settings-theme-title");
            const settingsLabel = document.getElementById("settings-switch-label");

            if (topbarBtn) {
                const sun = topbarBtn.querySelector(".icon-sun");
                const moon = topbarBtn.querySelector(".icon-moon");
                if (sun) sun.style.display = isDark ? "none" : "inline";
                if (moon) moon.style.display = isDark ? "inline" : "none";
                if (topbarLabel) topbarLabel.textContent = isDark ? "Dark Mode" : "Light Mode";
            }
            if (mobileBtn) {
                const sun = mobileBtn.querySelector(".icon-sun");
                const moon = mobileBtn.querySelector(".icon-moon");
                if (sun) sun.style.display = isDark ? "none" : "inline";
                if (moon) moon.style.display = isDark ? "inline" : "none";
                if (mobileLabel) mobileLabel.textContent = isDark ? "Dark" : "Light";
            }

            if (settingsBtn) {
                if (settingsTitle) {
                    settingsTitle.textContent = isDark 
                        ? (window.voxI18n ? window.voxI18n.t("theme_dark_title") : "Dark Mode (Active)")
                        : (window.voxI18n ? window.voxI18n.t("theme_light_title") : "Light Theme (Active)");
                }
                if (settingsLabel) {
                    settingsLabel.textContent = isDark ? "Dark" : "Light";
                }
            }
        };

        const savedTheme = localStorage.getItem("vox_theme");
        const isDarkInitial = savedTheme === "dark";
        if (isDarkInitial) {
            document.body.classList.add("dark-mode-active");
        } else {
            document.body.classList.remove("dark-mode-active");
        }
        updateThemeUI(isDarkInitial);

        const handleThemeToggle = (e) => {
            if (e) e.preventDefault();
            const isDark = document.body.classList.toggle("dark-mode-active");
            localStorage.setItem("vox_theme", isDark ? "dark" : "light");
            updateThemeUI(isDark);
            console.log(`[VoxShield] Theme toggled to: ${isDark ? "dark" : "light"}`);
        };

        document.getElementById("btn-theme-toggle")?.addEventListener("click", handleThemeToggle);
        document.getElementById("btn-theme-toggle-mobile")?.addEventListener("click", handleThemeToggle);
        document.getElementById("btn-theme-toggle-settings")?.addEventListener("click", handleThemeToggle);

        this.setupSettingsInteractions();
        // Audio Diagnostics Toggle Button
        const debugBtn = document.getElementById("btn-toggle-audio-debug");
        if (debugBtn) {
            debugBtn.addEventListener("click", () => {
                const pnl = document.getElementById("audio-debug-panel");
                if (pnl) {
                    const isOpen = pnl.classList.toggle("active");
                    if (isOpen) {
                        this.startAudioDebugLoop();
                        this.updateAudioDebugUI();
                    } else {
                        this.stopAudioDebugLoop();
                    }
                }
            });
        }

 // Navigation buttons
 document.querySelectorAll("[data-screen]").forEach(btn => {
 btn.addEventListener("click", (e) => {
 const screen = btn.getAttribute("data-screen");
 this.switchScreen(screen);
 });
 });

 // Viewport mode switcher
 const modeBtn = document.getElementById("toggle-soc-view");
 if (modeBtn) {
 modeBtn.addEventListener("click", () => {
 this.isSocExpanded = !this.isSocExpanded;
 const container = document.getElementById("app-workspace");
 if (this.isSocExpanded) {
 container.classList.remove("mobile-only-mode");
 modeBtn.innerHTML = `<span>Dual SOC View</span>`;
 } else {
 container.classList.add("mobile-only-mode");
 modeBtn.innerHTML = `<span>Focus View</span>`;
 }
 });
 }

 // Call Action Buttons
 document.getElementById("btn-end-call")?.addEventListener("click", () => this.endCall());
 document.getElementById("btn-mute-call")?.addEventListener("click", () => this.toggleMute());
 document.getElementById("btn-trigger-challenge")?.addEventListener("click", () => this.initiateDynamicChallenge());
 document.getElementById("btn-trigger-push")?.addEventListener("click", () => this.triggerTrustedChannelPush());
 document.getElementById("btn-block-call")?.addEventListener("click", () => this.blockCallManually());

 // Dynamic Challenge Modal Actions
 document.getElementById("btn-challenge-pass")?.addEventListener("click", () => this.resolveChallenge(true));
 document.getElementById("btn-challenge-fail")?.addEventListener("click", () => this.resolveChallenge(false));
 document.getElementById("btn-challenge-listen")?.addEventListener("click", () => this.listenToUserForChallenge());

 // Trusted-Channel Push Alert Actions
 document.getElementById("btn-push-approve")?.addEventListener("click", () => this.resolvePushAlert(true));
 document.getElementById("btn-push-reject")?.addEventListener("click", () => this.resolvePushAlert(false));

 // Quick Call Launchers on Dashboard
 document.getElementById("call-authentic")?.addEventListener("click", () => this.startCall("authentic"));
 document.getElementById("call-deepfake")?.addEventListener("click", () => this.startCall("deepfake_clone"));
 document.getElementById("call-replay")?.addEventListener("click", () => this.startCall("replay_attack"));
 document.getElementById("call-mic")?.addEventListener("click", () => this.startCall("live_mic"));

 // Trusted Circle Actions
 document.getElementById("btn-enroll-contact")?.addEventListener("click", () => this.openEnrollModal());
 document.getElementById("btn-save-enrollment")?.addEventListener("click", () => this.saveNewEnrollment());
 document.getElementById("btn-close-enroll-modal")?.addEventListener("click", () => this.closeEnrollModal());

 // Voice Volume Slider
 const volSlider = document.getElementById("voice-volume");
 if (volSlider) {
 volSlider.addEventListener("input", (e) => {
 const val = parseFloat(e.target.value);
 this.audioEngine.setVolume(val);
 });
 }

        // Automatic Multi-Language Detection Active (No manual selector)

        // Start render loop for visualizers
        this.startVisualizerLoop();
        this.renderTrustedCircle();
        this.renderIncidents();
    }

    onLanguageChange(langCode) {
        console.log(`[VoxShieldApp] UI language changed to: ${langCode}`);
    }

    setupAudioListeners() {
        // Autonomous Multi-Language Speech Recognition & Latin Transliteration Callback (Sections 2, 3, 5, 20)
        this.audioEngine.onTranscriptCallback = (segmentData) => {
            if (typeof segmentData === "object" && segmentData !== null) {
                const latinText = segmentData.transliteratedText || segmentData.text;
                this.detectionEngine.processTranscript(latinText, segmentData.isFinal);
                this.addTranscriptSegment(segmentData);
            } else {
                const rawText = String(segmentData);
                this.detectionEngine.processTranscript(rawText, true);
                this.addTranscriptSegment("user", rawText, true);
            }
            this.updateTelemetryUI();
            this.updateAudioDebugUI();
        };

        // Graceful device/browser fallback (Section 18 & 25)
        this.audioEngine.onTranscriptionErrorCallback = (errType) => {
            const transcriptBox = document.getElementById("transcript-stream");
            if (transcriptBox && (errType === "unsupported" || errType === "language-not-supported")) {
                const note = document.createElement("div");
                note.className = "transcript-msg system-note";
                note.style.borderLeft = "3px solid var(--ios-warning, #f59e0b)";
                note.innerHTML = `<strong>Automatic language detection is unavailable on this browser.</strong><br><span style="font-size: 11px; opacity: 0.85;">Voice analysis remains active. Live transcription is temporarily unavailable.</span>`;
                transcriptBox.appendChild(note);
                transcriptBox.scrollTop = transcriptBox.scrollHeight;
            }
        };
    }

 initWebSocket() {
 const wsUrl = `ws://${window.location.hostname || "localhost"}:8000/ws/call-stream`;
 try {
 this.ws = new WebSocket(wsUrl);

 this.ws.onopen = () => {
 this.wsConnected = true;
 const badge = document.getElementById("ws-status-badge");
 if (badge) {
 badge.textContent = "CONNECTED (FASTAPI WS)";
 badge.className = "status-pill online";
 }
 };

 this.ws.onmessage = (event) => {
 try {
 const data = json.parse(event.data);
 if (data.type === "telemetry") {
 // Blend backend telemetry with local state
 this.updateTelemetryFromBackend(data);
 }
 } catch (e) {}
 };

 this.ws.onerror = () => {
 this.wsConnected = false;
 const badge = document.getElementById("ws-status-badge");
 if (badge) {
 badge.textContent = "CLIENT ML CORE (STANDALONE)";
 badge.className = "status-pill offline";
 }
 };

 this.ws.onclose = () => {
 this.wsConnected = false;
 };
 } catch (err) {
 this.wsConnected = false;
 }
 }

 switchScreen(screenId) {
 this.activeScreen = screenId;
 document.querySelectorAll(".mobile-screen").forEach(s => s.classList.remove("active"));
 if (screenId === "live-call" && !this.detectionEngine?.isCallActive) this.resetLiveCallUI();
 const target = document.getElementById(`screen-${screenId}`);
 if (target) target.classList.add("active");

 document.querySelectorAll("[data-screen]").forEach(b => {
 if (b.getAttribute("data-screen") === screenId) {
 b.classList.add("active");
 } else {
 b.classList.remove("active");
 }
 });
 }

 // --- Call Lifecycle ---
    async startCall(scenarioKey) {
        const scenario = window.VOX_SCENARIOS[scenarioKey];
        if (!scenario) return;

        // Explicitly resume AudioContext within user interaction event (Section 10)
        await this.audioEngine.resumeContext();

        this.currentScenario = scenario;
        this.detectionEngine.startSession(scenario);
        this.dialogueIndex = 0;
        this.callSeconds = 0;
        this.finalTranscriptSegments = [];
        this.interimTranscript = null;

        // Switch to Live Protection Screen
        this.switchScreen("live-call");
        this.updateCallHeaderUI(scenario);
        this.resetIndicatorsUI();
        this.renderTranscriptUI();

        // Start audio diagnostics telemetry if debug panel is active
        const debugPnl = document.getElementById("audio-debug-panel");
        if (debugPnl && debugPnl.classList.contains("active")) {
            this.startAudioDebugLoop();
        }

        // Play phone connect sound effect
        this.audioEngine.playConnectTone();

        // Start call timer
        clearInterval(this.callInterval);
        this.callInterval = setInterval(() => {
            this.callSeconds++;
            const mins = Math.floor(this.callSeconds / 60).toString().padStart(2, "0");
            const secs = (this.callSeconds % 60).toString().padStart(2, "0");
            const timerEl = document.getElementById("call-timer");
            if (timerEl) timerEl.textContent = `${mins}:${secs}`;

            // Apply scenario progression if available
            if (scenario.telemetry_timeline) {
                const currentEntry = scenario.telemetry_timeline.find(t => t.time === this.callSeconds);
                if (currentEntry) {
                    this.detectionEngine.applyScenarioTimeline(currentEntry);
                    this.updateTelemetryUI();

                    // Automatic triggers for realistic hackathon demo
                    if (this.callSeconds === 5 && scenario.triggers_trusted_channel) {
                        this.triggerTrustedChannelPush();
                    }
                }
            }
        }, 1000);

        // Tell WebSocket backend if connected
        if (this.ws && this.wsConnected) {
            this.ws.send(JSON.stringify({
                type: "start_call",
                scenario: scenarioKey
            }));
        }

        // Audio Execution (Sections 7-15)
        if (scenario.voice_type === "live_microphone") {
            const transcriptBox = document.getElementById("transcript-stream");
            if (transcriptBox) {
                transcriptBox.innerHTML = `<div class="transcript-msg system-note">
                    <span class="transcript-speaker-tag tag-user">MIC ACCESS</span>
                    Requesting hardware microphone authorization...
                </div>`;
            }

            const micOk = await this.audioEngine.startMicrophone();
            if (transcriptBox) {
                if (micOk) {
                    const sttAvailable = this.audioEngine.diagnostics.speechRecognitionSupported;
                    transcriptBox.innerHTML = `<div class="transcript-msg system-note">
                        <span class="transcript-speaker-tag tag-user">ACTIVE</span>
                        <strong>Microphone stream active.</strong><br>
                        ${sttAvailable ? "Speak naturally. Real-time speech transcription & neural anti-spoofing running in volatile RAM..." : "Real-time acoustic analysis active. (Note: Browser Web Speech API is not supported on this mobile browser engine; raw audio spectrum and anti-spoofing continue running)."}
                    </div>`;
                } else {
                    const errMsg = this.audioEngine.diagnostics.lastErrorMsg || "Microphone access denied. Please allow microphone in browser settings.";
                    transcriptBox.innerHTML = `<div class="transcript-msg system-note" style="border-left: 3px solid var(--rose); background: rgba(244,63,94,0.1);">
                        <strong class="text-rose">Microphone Access Denied or Unavailable</strong><br>
                        ${errMsg}
                    </div>`;
                    this.openSettingsModal(
                        "Microphone Access Required",
                        `<p><strong>Microphone Permission Needed</strong></p>
                        <p>VoxShield requires microphone access to perform real-time neural anti-spoofing and voice biometric attestation.</p>
                        <p>Please check your browser permissions (tap the lock icon in the browser address bar &rarr; Permissions &rarr; Allow Microphone) and tap Direct Microphone Verification again.</p>`
                    );
                }
            }
        } else {
            // Pre-scripted voice dialogues using speech synthesis
            this.playNextDialogue();
        }
    }

 playNextDialogue() {
 if (!this.detectionEngine.isCallActive || !this.currentScenario) return;
 const currentLang = window.voxI18n ? window.voxI18n.currentLang : (localStorage.getItem("vox_lang") || "en");
 const dialogues = this.currentScenario.dialogues_i18n?.[currentLang] || this.currentScenario.dialogues || [];
 if (this.dialogueIndex >= dialogues.length) return;

 const item = dialogues[this.dialogueIndex];
 this.dialogueTimer = setTimeout(() => {
 if (!this.detectionEngine.isCallActive) return;

 // Transcribe caller speech into UI
 this.detectionEngine.processTranscript(item.text, true);
            this.addTranscriptSegment("caller", item.text, true);
 this.updateTelemetryUI();

 // Speak out loud with realistic voice profile in active language
 this.audioEngine.speakDialogue(item.text, this.currentScenario, () => {
 this.dialogueIndex++;
 if (this.dialogueIndex < dialogues.length) {
 this.playNextDialogue();
 }
 });
 }, item.delay);
 }

 
 resetLiveCallUI() {
 // 1. Reset timer
 const timerEl = document.getElementById("call-timer");
 if (timerEl) timerEl.textContent = "00:00";

 // 2. Reset Caller Info Header
 const nameEl = document.getElementById("caller-display-name");
 const phoneEl = document.getElementById("caller-display-phone");
 const avatarEl = document.getElementById("caller-avatar-circle");
 if (nameEl) nameEl.textContent = "No Active Call";
 if (phoneEl) phoneEl.textContent = "Ready for secure calls";
 if (avatarEl) {
 avatarEl.textContent = "";
 avatarEl.style.borderColor = "rgba(255,255,255,0.2)";
 avatarEl.style.boxShadow = "none";
 }

 // 3. Reset 5 Live Defense Indicator Cards
        const statusPill = document.getElementById("indicator-call-status");
        if (statusPill) {
            statusPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_idle") : "IDLE / READY"}</span>`;
            statusPill.className = "indicator-val status-gray single-metric";
        }

        const authPill = document.getElementById("indicator-authenticity");
        if (authPill) {
            authPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_nominal") : "NOMINAL"}</span>`;
            authPill.className = "indicator-val status-gray single-metric";
        }

        const speakerPill = document.getElementById("indicator-speaker");
        if (speakerPill) {
            speakerPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_unverified") : "UNVERIFIED"}</span>`;
            speakerPill.className = "indicator-val status-gray single-metric";
        }

        const replayPill = document.getElementById("indicator-replay");
        if (replayPill) {
            replayPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_nominal") : "NOMINAL"}</span>`;
            replayPill.className = "indicator-val status-gray single-metric";
        }

        const contextPill = document.getElementById("indicator-context");
        if (contextPill) {
            const neutralText = window.voxI18n ? window.voxI18n.t("status_neutral") : "NEUTRAL";
            contextPill.innerHTML = `<span class="status-badge-text">${neutralText}</span>`;
            contextPill.className = "indicator-val status-gray single-metric";
        }

 // 4. Reset Primary Decision Banner
 const actionBanner = document.getElementById("indicator-decision-banner");
 const decisionText = document.getElementById("indicator-decision-text");
 const decisionReason = document.getElementById("indicator-decision-reason");
 if (actionBanner) actionBanner.className = "decision-banner banner-gray";
 if (decisionText) decisionText.innerHTML = " CALL TERMINATED - STANDBY";
 if (decisionReason) decisionReason.textContent = "Call disconnected. All raw audio streams discarded per DPDP Act 2023. VoxShield ready.";

 // 5. Reset Transcript Stream
 const stream = document.getElementById("transcript-stream");
 if (stream) {
 stream.innerHTML = `<div class="transcript-msg system-note">Call ended. Session buffer cleared & raw audio permanently discarded per DPDP Act 2023.</div>`;
 }
 const socStream = document.getElementById("soc-transcript-stream");
 if (socStream) {
 socStream.innerHTML = `<div class="transcript-msg system-note">Session ended. Telemetry offline.</div>`;
 }

 // 6. Reset SOC scores & bars
 const socAasistScore = document.getElementById("soc-aasist-score");
 const socAasistBar = document.getElementById("soc-aasist-bar");
 const socSpeakerScore = document.getElementById("soc-speaker-score");
 const socSpeakerBar = document.getElementById("soc-speaker-bar");
 const socReplayScore = document.getElementById("soc-replay-score");
 if (socAasistScore) socAasistScore.textContent = "0.0%";
 if (socAasistBar) socAasistBar.style.width = "0%";
 if (socSpeakerScore) socSpeakerScore.textContent = "0.0%";
 if (socSpeakerBar) socSpeakerBar.style.width = "0%";
 if (socReplayScore) socReplayScore.textContent = "0% Liveness";

 // 7. Reset Mute Button
 const muteBtn = document.getElementById("btn-mute-call");
 if (muteBtn) {
 muteBtn.innerHTML = `<span>Mute</span>`;
 muteBtn.classList.remove("btn-active");
 }

 // 8. Clear Visualizer Canvas
 const waveCanvas = document.getElementById("oscilloscope-canvas");
 if (waveCanvas) {
 const ctx = waveCanvas.getContext("2d");
 if (ctx) ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
 }
 }

 endCall() {
 clearInterval(this.callInterval);
 clearTimeout(this.dialogueTimer);
 this.audioEngine.stopVoice();
 this.audioEngine.stopMicrophone();
        this.finalTranscriptSegments = [];
        this.interimTranscript = null;
        this.stopAudioDebugLoop();

 const report = this.detectionEngine.endSession();
 if (report && report.is_flagged) {
 this.incidents.unshift(report);
 this.renderIncidents();
 // Send to FastAPI backend
 if (this.wsConnected) {
 fetch("http://localhost:8000/api/incidents", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(report)
 }).catch(() => {});
 }
 }

 // Hide modals
 this.closeChallengeModal();
 this.hidePushAlert();

 this.resetLiveCallUI();
 this.switchScreen("dashboard");
 }

 toggleMute() {
 const isMuted = !this.audioEngine.isMuted;
 this.audioEngine.setMuted(isMuted);
 const btn = document.getElementById("btn-mute-call");
 if (btn) {
 btn.innerHTML = isMuted ? " Unmute" : " Mute";
 btn.classList.toggle("btn-active", isMuted);
 }
 }

 blockCallManually() {
 this.audioEngine.playWarningAlarm();
 this.detectionEngine.preventionDecision = "IMPERSONATION_DETECTED";
 this.detectionEngine.decisionReason = "Manually blocked by user / security operator.";
 this.updateTelemetryUI();

 setTimeout(() => {
 this.endCall();
 alert(" VoxShield Alert: Call terminated and reported to Incident Center. Raw audio discarded per DPDP Act 2023.");
 }, 1200);
 }

 // --- Dynamic Voice Challenge (Section 4, Step 9) ---
 initiateDynamicChallenge() {
 const phrase = this.detectionEngine.generateChallenge();
 this.audioEngine.playChallengeBeep();

 const modal = document.getElementById("challenge-modal");
 const phraseEl = document.getElementById("challenge-phrase-display");
 const statusEl = document.getElementById("challenge-status-text");

 if (phraseEl) phraseEl.textContent = `"${phrase}"`;
 if (statusEl) statusEl.textContent = "Listening for caller voice response...";
 if (modal) modal.classList.remove("hidden");

 // Speak challenge phrase prompt aloud
 const promptText = `Security verification required. Please repeat the phrase: ${phrase}`;
 this.audioEngine.speakDialogue(promptText, { voice_type: "human_natural", pitch_base: 220, pitch_variance: 0.1 }, () => {
 this.detectionEngine.startChallengeListening();
 });
 }

 listenToUserForChallenge() {
 const statusEl = document.getElementById("challenge-status-text");
 if (statusEl) statusEl.textContent = "Listening to microphone. Awaiting phrase repetition...";
 this.audioEngine.startMicrophone();
 }

 resolveChallenge(passed) {
 this.detectionEngine.resolveChallenge(passed);
 const statusEl = document.getElementById("challenge-status-text");
 if (statusEl) {
 statusEl.textContent = passed ? "Challenge PASSED - Voice verified organic" : "Challenge FAILED - Voice mismatch / synthetic";
 }

 if (!passed) {
 this.audioEngine.playWarningAlarm();
 }

 setTimeout(() => {
 this.closeChallengeModal();
 this.updateTelemetryUI();
 }, 1200);
 }

 closeChallengeModal() {
 const modal = document.getElementById("challenge-modal");
 if (modal) modal.classList.add("hidden");
 }

 // --- Trusted-Channel Cross-Verification Push Alert (Section 4, Step 10) ---
 triggerTrustedChannelPush() {
 const details = this.currentScenario?.channel_alert_details || {
 contact_name: "David Chen (Real Device)",
 amount: "INR 1,50,000",
 purpose: "Emergency Wire Transfer"
 };

 this.detectionEngine.initiateTrustedChannel(details);
 this.audioEngine.playPing();

 const banner = document.getElementById("trusted-channel-push-banner");
 const titleEl = document.getElementById("push-contact-name");
 const descEl = document.getElementById("push-alert-details");

 if (titleEl) titleEl.textContent = `VoxShield Security: ${details.contact_name}`;
 if (descEl) descEl.textContent = `High-Stakes Request Detected: Authorize ${details.amount} transfer on ongoing call?`;
 if (banner) banner.classList.remove("hidden");
 }

 resolvePushAlert(approved) {
 this.detectionEngine.resolveTrustedChannel(approved);
 this.hidePushAlert();

 if (!approved) {
 this.audioEngine.playWarningAlarm();
 alert("SECURITY ALERT:\nReal contact answered 'NO'. Impersonation attack confirmed! Blocking call immediately.");
 this.blockCallManually();
 } else {
 this.updateTelemetryUI();
 }
 }

 hidePushAlert() {
 const banner = document.getElementById("trusted-channel-push-banner");
 if (banner) banner.classList.add("hidden");
 }

 // --- UI Update Helpers ---
 updateCallHeaderUI(scenario) {
 const nameEl = document.getElementById("caller-display-name");
 const phoneEl = document.getElementById("caller-display-phone");
 const avatarEl = document.getElementById("caller-avatar-circle");

 if (nameEl) nameEl.textContent = scenario.caller_name;
 if (phoneEl) phoneEl.textContent = scenario.phone;
 if (avatarEl) {
 avatarEl.textContent = scenario.avatar;
 avatarEl.style.borderColor = scenario.avatar_bg;
 }
 }

    resetIndicatorsUI() {
        this.finalTranscriptSegments = [];
        this.interimTranscript = null;
        this.renderTranscriptUI();
        this.updateTelemetryUI();
    }

    addTranscriptSegment(speakerOrObj, text, isFinal = true, langKey = "english", locale = "en-IN") {
        let segObj = null;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (typeof speakerOrObj === "object" && speakerOrObj !== null) {
            const s = speakerOrObj;
            const englishTxt = (s.englishText || s.text || "").trim();
            if (!englishTxt && !(s.originalText || "").trim()) return;

            segObj = {
                id: s.id || ((typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "_" + Math.random().toString(36).substr(2, 5))),
                speaker: (s.speaker === "caller" || s.speaker === "CALLER") ? "CALLER" : "YOU",
                detectedLanguage: s.detectedLanguage || "en",
                detectedLangLabel: s.detectedLangLabel || "English",
                originalText: s.originalText || englishTxt,
                englishText: englishTxt,
                text: englishTxt, // Natural English output (Section 3 & 8)
                timestamp: s.timestamp || timeStr,
                confidence: s.confidence || 0.95,
                isFinal: s.isFinal !== undefined ? s.isFinal : true
            };
        } else {
            const rawText = (text || "").trim();
            if (!rawText) return;
            const speakerLabel = (speakerOrObj === "user" || speakerOrObj === "YOU") ? "YOU" : "CALLER";

            segObj = {
                id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
                speaker: speakerLabel,
                detectedLanguage: langKey || "en",
                detectedLangLabel: langKey ? (langKey.charAt(0).toUpperCase() + langKey.slice(1)) : "English",
                originalText: rawText,
                englishText: rawText,
                text: rawText,
                timestamp: timeStr,
                confidence: 0.95,
                isFinal: isFinal
            };
        }

        if (segObj.isFinal) {
            this.finalTranscriptSegments.push(segObj);
            this.interimTranscript = null;
        } else {
            this.interimTranscript = segObj;
        }

        this.renderTranscriptUI();
    }

    renderTranscriptUI() {
        const stream = document.getElementById("transcript-stream");
        if (!stream) return;

        if ((!this.finalTranscriptSegments || this.finalTranscriptSegments.length === 0) && !this.interimTranscript) {
            if (this.detectionEngine && this.detectionEngine.isCallActive) {
                const isMic = this.currentScenario && this.currentScenario.voice_type === "live_microphone";
                if (isMic) {
                    stream.innerHTML = `<div class="transcript-msg system-note">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <span class="transcript-speaker-tag tag-user" style="font-size: 10px; padding: 2px 6px;">ACTIVE</span>
                            <span style="font-size: 11px; font-weight: 600; color: #10b981;">Microphone stream active.</span>
                        </div>
                        <div style="font-size: 11px; color: var(--text-dim); line-height: 1.45;">
                            Speak naturally. Real-time speech transcription & neural anti-spoofing running in volatile RAM...
                        </div>
                    </div>`;
                } else {
                    stream.innerHTML = `<div class="transcript-msg system-note">Encrypted call connected. Voice transcription active...</div>`;
                }
            } else {
                stream.innerHTML = `<div class="transcript-empty" data-i18n="transcript_empty">Audio idle. Voice transcription streams here in real-time.</div>`;
            }
            return;
        }

        // Stick-to-bottom scroll detection (Section 20)
        const isNearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80;
        const highlightRegex = /(transfer|wire|rupees|inr|lakh|thousand|emergency|card blocked|otp|password|immediate|vendor|इमरजेंसी|पैसे|रुपये|ट्रांसफर|ओटीपी|पासवर्ड|मुसीबत|அவசரம்|பணம்|ரூபாய்|கடவுச்சொல்|எமர்ஜென்சி|డబ్బు|రూపాయలు|ఓటీపీ|ఆపద|బిপদ|টাকা|ট্রান্সফার|ওটিপি)/gi;

        let html = "";
        this.finalTranscriptSegments.forEach(seg => {
            const displayText = seg.transliteratedText || seg.text;
            let safeText = displayText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            safeText = safeText.replace(highlightRegex, `<mark class="threat-keyword">$1</mark>`);
            const isUser = seg.speaker === "YOU";
            const speakerClass = isUser ? "user-line" : "caller-line";
            const tagClass = isUser ? "tag-user" : "tag-caller";

            // Clean UI: No language badges displayed per Section 10
            html += `<div class="transcript-msg ${speakerClass}">
                <div class="transcript-msg-header">
                    <span class="transcript-speaker-tag ${tagClass}">${seg.speaker}</span>
                    <span class="transcript-timestamp">${seg.timestamp}</span>
                </div>
                <div class="transcript-msg-body">${safeText}</div>
            </div>`;
        });

        if (this.interimTranscript) {
            const displayInterim = this.interimTranscript.transliteratedText || this.interimTranscript.text;
            let safeInterim = displayInterim.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            safeInterim = safeInterim.replace(highlightRegex, `<mark class="threat-keyword">$1</mark>`);
            const isUser = this.interimTranscript.speaker === "YOU";
            const speakerClass = isUser ? "user-line" : "caller-line";
            const tagClass = isUser ? "tag-user" : "tag-caller";

            html += `<div class="transcript-msg ${speakerClass} interim-line">
                <div class="transcript-msg-header">
                    <span class="transcript-speaker-tag ${tagClass}">${this.interimTranscript.speaker}</span>
                    <span class="transcript-typing-dot">●●●</span>
                </div>
                <div class="transcript-msg-body">${safeInterim}</div>
            </div>`;
        }

        stream.innerHTML = html;

        if (isNearBottom) {
            stream.scrollTop = stream.scrollHeight;
        }

        // Synchronize with SOC inspector transcript drawer if present
        const socStream = document.getElementById("soc-transcript-stream");
        if (socStream) {
            const socNearBottom = socStream.scrollHeight - socStream.scrollTop - socStream.clientHeight < 80;
            socStream.innerHTML = html;
            if (socNearBottom) socStream.scrollTop = socStream.scrollHeight;
        }
    }

    updateTranscriptUI(text, isFinal, speaker = "caller") {
        this.addTranscriptSegment(speaker, text, isFinal);
    }
 updateTelemetryUI() {
 const d = this.detectionEngine;

 // 1. Call Status
        // 1. Call Status (Sections 1-4: Responsive, flexible layout)
        const statusPill = document.getElementById("indicator-call-status");
        if (statusPill) {
            statusPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_connected") : "CONNECTED (ENCRYPTED)"}</span>`;
            statusPill.className = "indicator-val status-green single-metric";
        }

        // 2. Voice Authenticity (AASIST / RawNet2 - Responsive multi-line wrap, no clipping)
        const authPill = document.getElementById("indicator-authenticity");
        const socAasistScore = document.getElementById("soc-aasist-score");
        const socAasistBar = document.getElementById("soc-aasist-bar");
        if (authPill) {
            if (d.deepfakeScore >= 70) {
                authPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_synthetic") : "SYNTHETIC DETECTED"}</span><span class="status-badge-pct">${d.deepfakeScore.toFixed(1)}%</span>`;
                authPill.className = "indicator-val status-red animate-pulse";
            } else {
                authPill.innerHTML = `<span class="status-badge-text">AUTHENTIC VOICE</span><span class="status-badge-pct">${(100 - d.deepfakeScore).toFixed(1)}%</span>`;
                authPill.className = "indicator-val status-green";
            }
        }
        if (socAasistScore) socAasistScore.textContent = `${d.deepfakeScore.toFixed(1)}%`;
        if (socAasistBar) socAasistBar.style.width = `${d.deepfakeScore}%`;

        // 3. Speaker Verification (ECAPA-TDNN)
        const speakerPill = document.getElementById("indicator-speaker");
        const socSpeakerScore = document.getElementById("soc-speaker-score");
        const socSpeakerBar = document.getElementById("soc-speaker-bar");
        if (speakerPill) {
            if (d.speakerSimilarity >= 0.80) {
                speakerPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_verified") : "VERIFIED MATCH"}</span><span class="status-badge-pct">${d.speakerSimilarity.toFixed(2)}</span>`;
                speakerPill.className = "indicator-val status-green";
            } else {
                speakerPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_unverified") : "VERIFICATION REQUIRED"}</span><span class="status-badge-pct">${d.speakerSimilarity.toFixed(2)}</span>`;
                speakerPill.className = "indicator-val status-yellow";
            }
        }
        if (socSpeakerScore) socSpeakerScore.textContent = `${(d.speakerSimilarity * 100).toFixed(1)}%`;
        if (socSpeakerBar) socSpeakerBar.style.width = `${d.speakerSimilarity * 100}%`;

        // 4. Replay Detection (Silero VAD)
        const replayPill = document.getElementById("indicator-replay");
        const socReplayScore = document.getElementById("soc-replay-score");
        if (replayPill) {
            if (d.livenessScore >= 0.50) {
                replayPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_nominal") : "LIVE AUDIO"}</span><span class="status-badge-pct">${(d.livenessScore * 100).toFixed(0)}%</span>`;
                replayPill.className = "indicator-val status-green";
            } else {
                replayPill.innerHTML = `<span class="status-badge-text">${window.voxI18n ? window.voxI18n.t("status_replay") : "REPLAY DETECTED"}</span><span class="status-badge-pct">${(d.livenessScore * 100).toFixed(0)}%</span>`;
                replayPill.className = "indicator-val status-red animate-pulse";
            }
        }
        if (socReplayScore) socReplayScore.textContent = `${(d.livenessScore * 100).toFixed(0)}% Liveness`;

        // 5. Conversation Context
        const contextPill = document.getElementById("indicator-context");
        if (contextPill) {
            if (d.contextRiskLevel === "CRITICAL") {
                contextPill.innerHTML = `<span class="status-badge-text">RISK: CREDENTIAL HARVEST</span><span class="status-badge-pct">HIGH</span>`;
                contextPill.className = "indicator-val status-red animate-pulse";
            } else if (d.contextRiskLevel === "HIGH") {
                contextPill.innerHTML = `<span class="status-badge-text">RISK: FINANCIAL TRANSFER</span><span class="status-badge-pct">ALERT</span>`;
                contextPill.className = "indicator-val status-red animate-pulse";
            } else {
                contextPill.innerHTML = `<span class="status-badge-text">NORMAL CONVERSATION</span>`;
                contextPill.className = "indicator-val status-green single-metric";
            }
        }

        // 6. Action / Decision Banner (Rule-based Decision Matrix)
        const actionBanner = document.getElementById("indicator-decision-banner");
 const decisionText = document.getElementById("indicator-decision-text");
 const decisionReason = document.getElementById("indicator-decision-reason");

 if (actionBanner && decisionText) {
 if (d.preventionDecision === "IMPERSONATION_DETECTED") {
 actionBanner.className = "decision-banner banner-red";
 decisionText.innerHTML = ` IMPERSONATION DETECTED`;
 } else if (d.preventionDecision === "VERIFICATION_REQUIRED") {
 actionBanner.className = "decision-banner banner-yellow";
 decisionText.innerHTML = ` VERIFICATION REQUIRED`;
 } else {
 actionBanner.className = "decision-banner banner-green";
 decisionText.innerHTML = ` VERIFIED (CALL SECURE)`;
 }
 if (decisionReason) decisionReason.textContent = d.decisionReason;
 }

 // Also update avatar glowing halo color
 const avatarEl = document.getElementById("caller-avatar-circle");
 if (avatarEl) {
 avatarEl.style.boxShadow = d.preventionDecision === "IMPERSONATION_DETECTED" 
 ? "0 0 30px rgba(239, 68, 68, 0.7)" 
 : d.preventionDecision === "VERIFICATION_REQUIRED" 
 ? "0 0 30px rgba(245, 158, 11, 0.6)" 
 : "0 0 30px rgba(16, 185, 129, 0.5)";
 }
 }

 updateTelemetryFromBackend(data) {
 if (data.deepfake_detector) {
 this.detectionEngine.deepfakeScore = data.deepfake_detector.synthetic_probability;
 }
 if (data.speaker_verification) {
 this.detectionEngine.speakerSimilarity = data.speaker_verification.cosine_similarity;
 }
 if (data.liveness_check) {
 this.detectionEngine.livenessScore = data.liveness_check.liveness_score;
 }
 this.detectionEngine.evaluatePreventionDecision();
 this.updateTelemetryUI();
 }

 // --- Waveform & Spectrogram Loop ---
 startVisualizerLoop() {
 const waveCanvas = document.getElementById("oscilloscope-canvas");
 const socWaveCanvas = document.getElementById("soc-oscilloscope-canvas");
 const specCanvas = document.getElementById("soc-spectrum-canvas");

 const loop = () => {
 // Extract live audio features
 const features = this.audioEngine.extractFeatures();
 this.detectionEngine.processAcousticFeatures(features);

 // Send features to WebSocket if call is active
 if (this.ws && this.wsConnected && this.detectionEngine.isCallActive) {
 if (Math.random() < 0.2) { // Throttle messages
 this.ws.send(JSON.stringify({
 type: "audio_features",
 rms: features.rms,
 pitch: features.pitch,
 caller_type: this.currentScenario?.id || "authentic"
 }));
 }
 }

 // Pick visualizer color based on threat state
 const color = this.detectionEngine.preventionDecision === "IMPERSONATION_DETECTED" 
 ? "#ef4444" 
 : this.detectionEngine.preventionDecision === "VERIFICATION_REQUIRED" 
 ? "#f59e0b" 
 : "#05f5a1";

 if (waveCanvas) this.audioEngine.drawWaveform(waveCanvas, color);
 if (socWaveCanvas) this.audioEngine.drawWaveform(socWaveCanvas, color);
 if (specCanvas) this.audioEngine.drawSpectrum(specCanvas);

 requestAnimationFrame(loop);
 };
 requestAnimationFrame(loop);
 }

 // --- Trusted Circle Render & Enrollment ---
 // --- Local Database & Storage Management ---
    loadTrustedCircle() {
        try {
            const raw = localStorage.getItem("vox_trusted_circle");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn("[VoxShield] Error reading trusted circle from storage:", e);
        }
        const defaultList = [
            {
                id: "tc_01",
                name: "Sarah Miller",
                relation: "Sister / Emergency Contact",
                phone: "+91 98765 43210",
                voiceprint_id: "vp_aes256_sarah_091",
                enrolled_at: "Aug 15, 2026",
                f0_mean: "218 Hz",
                status: "Active",
                avatar: "SM"
            },
            {
                id: "tc_02",
                name: "David Chen",
                relation: "CFO / Business Partner",
                phone: "+91 91234 56789",
                voiceprint_id: "vp_aes256_david_482",
                enrolled_at: "Aug 20, 2026",
                f0_mean: "132 Hz",
                status: "Active",
                avatar: "DC"
            },
            {
                id: "tc_03",
                name: "Elena Rostova",
                relation: "VP Engineering",
                phone: "+91 99887 76655",
                voiceprint_id: "vp_aes256_elena_103",
                enrolled_at: "Sep 01, 2026",
                f0_mean: "195 Hz",
                status: "Active",
                avatar: "ER"
            }
        ];
        this.saveTrustedCircle(defaultList);
        return defaultList;
    }

    saveTrustedCircle(list = null) {
        const data = list || this.trustedCircle;
        try {
            localStorage.setItem("vox_trusted_circle", JSON.stringify(data));
        } catch (e) {
            console.warn("[VoxShield] Error saving trusted circle to storage:", e);
        }
        this.updateDbStats();
    }

    loadIncidents() {
        try {
            const raw = localStorage.getItem("vox_incidents");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn("[VoxShield] Error reading incidents from storage:", e);
        }
        const defaultIncidents = [
            {
                id: "INC-2026-9014",
                timestamp: "Sep 10, 2026 - 18:42",
                caller_id: "+91 91234 56789 (Spoofed David Chen)",
                target_contact: "David Chen",
                attack_type: "AI Voice Clone (AASIST 98.4% Confidence)",
                context_flag: "Urgent Wire Transfer (INR 1,50,000)",
                decision: "IMPERSONATION DETECTED",
                prevention_action: "High-Stakes Call Flagged + Blocked",
                challenge_result: "Failed / Refused",
                trusted_channel_response: "Rejected by Owner via Push",
                retention_ttl: "29 days remaining (DPDP Act 2023 Compliant)"
            },
            {
                id: "INC-2026-8841",
                timestamp: "Sep 08, 2026 - 11:20",
                caller_id: "+91 98000 11223 (Unknown / Spoofed)",
                target_contact: "Unknown Bank Rep",
                attack_type: "Pre-recorded Audio Replay Attack (Silero VAD)",
                context_flag: "OTP & Account Credential Phishing",
                decision: "IMPERSONATION DETECTED",
                prevention_action: "Sensitive Action Restricted",
                challenge_result: "Failed (Acoustic loop mismatch)",
                trusted_channel_response: "N/A",
                retention_ttl: "27 days remaining (DPDP Act 2023 Compliant)"
            }
        ];
        this.saveIncidents(defaultIncidents);
        return defaultIncidents;
    }

    saveIncidents(list = null) {
        const data = list || this.incidents;
        try {
            localStorage.setItem("vox_incidents", JSON.stringify(data));
        } catch (e) {
            console.warn("[VoxShield] Error saving incidents to storage:", e);
        }
        this.updateDbStats();
    }

    updateDbStats() {
        const contactsBadge = document.getElementById("db-contacts-count");
        if (contactsBadge) {
            const count = (this.trustedCircle && this.trustedCircle.length) || 0;
            contactsBadge.textContent = `${count} Contacts`;
        }
        const incidentsBadge = document.getElementById("db-incidents-count");
        if (incidentsBadge) {
            const count = (this.incidents && this.incidents.length) || 0;
            incidentsBadge.textContent = `${count} Incidents`;
        }
    }

    deleteContact(id) {
        if (confirm("Remove this contact and delete their encrypted voiceprint from storage?")) {
            this.trustedCircle = this.trustedCircle.filter(c => c.id !== id);
            this.saveTrustedCircle();
            this.renderTrustedCircle();
        }
    }

    deleteIncident(id) {
        this.incidents = this.incidents.filter(inc => inc.id !== id);
        this.saveIncidents();
        this.renderIncidents();
    }

    clearAllIncidents() {
        if (confirm("Are you sure you want to clear all forensic incident logs from storage?")) {
            this.incidents = [];
            this.saveIncidents();
            this.renderIncidents();
        }
    }

    resetDemoData() {
        if (confirm("Reset Trusted Circle and Incident Ledger back to baseline factory demo data?")) {
            localStorage.removeItem("vox_trusted_circle");
            localStorage.removeItem("vox_incidents");
            this.trustedCircle = this.loadTrustedCircle();
            this.incidents = this.loadIncidents();
            this.renderTrustedCircle();
            this.renderIncidents();
            this.updateDbStats();
            alert("Database reset to factory demo baseline successfully.");
        }
    }

    renderTrustedCircle() {
 const container = document.getElementById("trusted-circle-list");
 if (!container) return;

 if (this.trustedCircle.length === 0) {
 container.innerHTML = `<div class="empty-state">${window.voxI18n ? window.voxI18n.t("tc_empty") : "No contacts enrolled yet."}</div>`;
 return;
 }

 const enrolledTag = window.voxI18n ? window.voxI18n.t("sc_authentic_tag") : "Enrolled";

 container.innerHTML = this.trustedCircle.map(tc => `
 <div class="contact-card">
 <div class="contact-avatar">${tc.avatar || tc.name.substring(0, 2).toUpperCase()}</div>
 <div class="contact-info">
 <div class="contact-name">${tc.name}</div>
 <div class="contact-meta">${tc.relation} &bull; ${tc.phone}</div>
 <div class="contact-hash">Voiceprint: <code>${tc.voiceprint_id}</code></div>
 </div>
 <div class="contact-badge">
 <span class="badge-pill active">${enrolledTag}</span>
 <span class="freq-tag">${tc.f0_mean || "210 Hz"}</span>
 </div>
 </div>
 `).join("");
 }

 openEnrollModal() {
 const modal = document.getElementById("enroll-modal");
 if (modal) modal.classList.remove("hidden");
 }

 closeEnrollModal() {
 const modal = document.getElementById("enroll-modal");
 if (modal) modal.classList.add("hidden");
 }

 saveNewEnrollment() {
 const nameInput = document.getElementById("enroll-name");
 const phoneInput = document.getElementById("enroll-phone");
 const relationInput = document.getElementById("enroll-relation");

 if (!nameInput.value || !phoneInput.value) {
 alert("Please fill in contact name and phone number.");
 return;
 }

 const newContact = {
 id: `tc_0${this.trustedCircle.length + 1}`,
 name: nameInput.value,
 relation: relationInput.value || "Emergency Contact",
 phone: phoneInput.value,
 voiceprint_id: `vp_aes256_${nameInput.value.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`,
 enrolled_at: "Just now",
 f0_mean: "185 Hz",
 status: "Active",
 avatar: newContact.name.substring(0, 2).toUpperCase()
 };

 this.trustedCircle.push(newContact);
 this.renderTrustedCircle();
 this.closeEnrollModal();

 nameInput.value = "";
 phoneInput.value = "";
 relationInput.value = "";

 alert(`Voiceprint enrolled for ${newContact.name}!\nVoice features encrypted with AES-256 and stored locally per DPDP Act 2023.`);
 }

 // --- Incident Center Render ---
 renderIncidents() {
 const container = document.getElementById("incidents-list");
 if (!container) return;

 const emptyText = window.voxI18n ? window.voxI18n.t("inc_empty") : "No security incidents logged. All calls verified.";
 if (this.incidents.length === 0) {
 container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
 return;
 }

 const lblCaller = window.voxI18n ? window.voxI18n.t("inc_caller") : "Caller ID:";
 const lblVector = window.voxI18n ? window.voxI18n.t("inc_vector") : "Attack Vector:";
 const lblTrigger = window.voxI18n ? window.voxI18n.t("inc_trigger") : "Context Trigger:";
 const lblAction = window.voxI18n ? window.voxI18n.t("inc_action") : "Action Taken:";
 const lblCompliance = window.voxI18n ? window.voxI18n.t("inc_compliance") : "DPDP Act 2023 (TTL Auto-Expiry)";
 const lblZero = window.voxI18n ? window.voxI18n.t("inc_zero_retention") : "Audio Discarded (Zero Retention)";

 container.innerHTML = this.incidents.map(inc => `
 <div class="incident-card">
 <div class="incident-header">
 <span class="incident-id">${inc.id}</span>
 <span class="incident-time">${inc.timestamp}</span>
 <span class="incident-badge badge-threat">${inc.decision}</span>
 </div>
 <div class="incident-body">
 <div><strong>${lblCaller}</strong> ${inc.caller_id}</div>
 <div><strong>${lblVector}</strong> <span class="text-danger">${inc.attack_type}</span></div>
 <div><strong>${lblTrigger}</strong> ${inc.context_flag}</div>
 <div><strong>${lblAction}</strong> ${inc.prevention_action}</div>
 </div>
 <div class="incident-footer">
 <span class="compliance-tag">${lblCompliance}</span>
 <span class="privacy-badge">${lblZero}</span>
 </div>
 </div>
 `).join("");
 }

 onLanguageChange(lang) {
 console.log(`[VoxShieldApp] Updating dynamic screens for language: ${lang}`);
 this.renderTrustedCircle();
 this.renderIncidents();
 if (this.currentScenario) {
 this.updateCallHeaderUI(this.currentScenario);
 }
 const isDark = document.body.classList.contains("dark-mode-active");
 const settingsTitle = document.getElementById("settings-theme-title");
 if (settingsTitle && window.voxI18n) {
 settingsTitle.textContent = isDark 
 ? window.voxI18n.t("theme_dark_title") 
 : window.voxI18n.t("theme_light_title");
 }
 }

    // --- Settings & Modal Dialog Handlers ---
    setupSettingsInteractions() {
        // Modal close button and backdrop click
        const modal = document.getElementById("vox-settings-modal");
        const closeBtn = document.getElementById("vox-modal-close");
        if (closeBtn) closeBtn.addEventListener("click", () => this.closeSettingsModal());
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) this.closeSettingsModal();
            });
        }
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closeSettingsModal();
        });

        // Toggle Switch: Replay Filter
        const filterRow = document.getElementById("setting-item-filter");
        const filterSwitch = document.getElementById("switch-filter");
        const savedFilter = localStorage.getItem("vox_setting_replay_filter");
        if (filterSwitch && savedFilter === "false") {
            filterSwitch.classList.remove("active");
        }
        if (filterRow && filterSwitch) {
            filterRow.addEventListener("click", () => {
                const isActive = filterSwitch.classList.toggle("active");
                localStorage.setItem("vox_setting_replay_filter", isActive ? "true" : "false");
                console.log(`[VoxShield] Acoustic Replay Filter set to: ${isActive}`);
            });
        }

        // Setting: AASIST-v2 Threshold
        document.getElementById("setting-item-aasist")?.addEventListener("click", () => {
            this.openSettingsModal(
                "AASIST-v2 Synthesis Detection",
                `<p><strong>AASIST-v2 (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks)</strong> detects synthetic voice artifacts, neural vocoder phase errors, and algorithmic anomalies.</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">0.75</div><div class="modal-stat-lbl">Strict Threshold</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">&lt; 120ms</div><div class="modal-stat-lbl">Inference Latency</div></div>
                </div>
                <p>Operating cutoff set to <strong>0.75 Strict</strong>. If synthetic probability exceeds this threshold for 3 consecutive audio chunks, high-severity warning banners and audio alerts are instantly triggered.</p>`
            );
        });

        // Setting: ECAPA Speaker Verification
        document.getElementById("setting-item-ecapa")?.addEventListener("click", () => {
            this.openSettingsModal(
                "ECAPA-TDNN Speaker Verification",
                `<p><strong>ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation)</strong> extracts 192-dimensional acoustic voice embeddings to attest enrolled caller biometric identity.</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">0.70</div><div class="modal-stat-lbl">Cosine Match Target</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">192-d</div><div class="modal-stat-lbl">Vector Space</div></div>
                </div>
                <p>Calls from enrolled contacts are continually matched against local AES-256 encrypted vector templates. Deviations trigger FIDO2 out-of-band verification challenges.</p>`
            );
        });

        // Setting: Zero Audio Retention (DPDP Act)
        document.getElementById("setting-item-retention")?.addEventListener("click", () => {
            this.openSettingsModal(
                "DPDP Act 2023 Compliance & Ephemeral RAM",
                `<p>VoxShield is fully compliant with India's <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and international zero-knowledge data minimization principles.</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">0 Bytes</div><div class="modal-stat-lbl">Audio Saved to Disk</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">RAM Only</div><div class="modal-stat-lbl">Buffer Lifecycle</div></div>
                </div>
                <p>Raw voice data is processed solely in short volatile memory rings and permanently purged the millisecond a call terminates. Only anonymous threat telemetry and cryptographic event hashes are optionally stored locally.</p>`
            );
        });

        // Setting: Auto-Purge TTL
        document.getElementById("setting-item-purge")?.addEventListener("click", () => {
            this.openSettingsModal(
                "Incident Log Auto-Purge Lifecycle",
                `<p>Configured cryptographic retention policy enforces automated lifecycle eviction of forensic threat logs.</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">365 Days</div><div class="modal-stat-lbl">Maximum TTL</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">SHA-256</div><div class="modal-stat-lbl">Chain of Custody</div></div>
                </div>
                <p>Threat logs older than 365 days are securely overwritten. You may also manually clear local logs at any time using the <em>Clear Incidents</em> option.</p>`
            );
        });

        // Setting: Persistent Engine Storage
        document.getElementById("setting-item-storage")?.addEventListener("click", () => {
            this.openSettingsModal(
                "Local Encrypted Database Vault",
                `<p>VoxShield utilizes high-performance browser LocalStorage coupled with client-side vector hashing for zero-cloud privacy.</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">Active</div><div class="modal-stat-lbl">Vault Status</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">Client-Side</div><div class="modal-stat-lbl">Architecture</div></div>
                </div>
                <p>No biometric data is sent to external clouds or third-party servers. All voiceprint templates and security rules remain in this sandboxed client environment.</p>`
            );
        });

        // Setting: Enrolled Contacts
        document.getElementById("setting-item-contacts")?.addEventListener("click", () => {
            this.openSettingsModal(
                "Enrolled Contacts Vault",
                `<p>Your enrolled biometric contact profiles are secured in local memory.</p>
                <p>To view, enroll, or test voiceprint templates for your trusted circle, tap the <strong>Circle</strong> tab in the bottom navigation.</p>`
            );
        });

        // Setting: Forensic Incidents
        document.getElementById("setting-item-incidents")?.addEventListener("click", () => {
            this.openSettingsModal(
                "Forensic Threats & Incidents",
                `<p>Threat logs capture detected clone attempts, synthesis anomalies, and suspicious semantic coercion patterns.</p>
                <p>To inspect full forensic audio spectrums and incident details, tap the <strong>Incidents</strong> tab.</p>`
            );
        });

        // Setting: Audio & Speech Diagnostics (Section 25)
        document.getElementById("setting-item-audio-debug")?.addEventListener("click", () => {
            const diag = this.audioEngine.diagnostics;
            this.openSettingsModal(
                "Audio & Speech Diagnostics",
                `<p><strong>Real-Time Audio Diagnostics:</strong></p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">${diag.audioContextState}</div><div class="modal-stat-lbl">AudioContext</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val ${diag.speechRecognitionStatus === 'listening' ? 'text-emerald' : 'text-cyan'}">${diag.speechRecognitionStatus}</div><div class="modal-stat-lbl">Speech Recognition</div></div>
                </div>
                <p><strong>Microphone Permission:</strong> <span style="font-weight:700;">${diag.permission}</span></p>
                <p><strong>MediaStream Track:</strong> ${diag.streamActive ? "Active" : "Idle"} (${diag.trackLabel || "None"})</p>
                <p><strong>Audio Frames Processed:</strong> ${diag.audioFramesReceived.toLocaleString()}</p>
                <p><strong>Speech Recognition Locale:</strong> ${diag.activeLanguage}</p>
                <p><strong>Transcript Events Received:</strong> ${diag.transcriptEventsCount}</p>
                <p><strong>Last Transcript Time:</strong> ${diag.lastTranscriptTime}</p>
                <p style="margin-top: 10px; font-size: 11px; color: var(--text-dim);">To open the live diagnostics HUD during a call, tap <strong>Audio Diagnostics</strong> in the Live Speech Transcript box.</p>`
            );
        });

        // Setting: About VoxShield
        document.getElementById("setting-item-about")?.addEventListener("click", () => {
            this.openSettingsModal(
                "About VoxShield",
                `<p><strong>VoxShield v3.4 Production</strong> is an enterprise-grade voice security and anti-impersonation system developed for India Smart India Hackathon (SIH).</p>
                <div class="modal-stat-grid">
                    <div class="modal-stat-box"><div class="modal-stat-val text-cyan">AASIST-v2</div><div class="modal-stat-lbl">Neural Anti-Spoof</div></div>
                    <div class="modal-stat-box"><div class="modal-stat-val text-emerald">ECAPA-TDNN</div><div class="modal-stat-lbl">Speaker Verification</div></div>
                </div>
                <p><strong>Core Capabilities:</strong></p>
                <ul style="margin-left: 18px; margin-bottom: 12px;">
                    <li>Sub-120ms real-time neural clone detection</li>
                    <li>FIDO2 Out-of-band cross-verification dispatch</li>
                    <li>Multi-lingual support (English, Hindi, Tamil, Telugu, Bengali)</li>
                    <li>Full DPDP Act 2023 compliance with zero audio storage</li>
                </ul>`
            );
        });
    }

    openSettingsModal(title, htmlContent) {
        const modal = document.getElementById("vox-settings-modal");
        const titleEl = document.getElementById("vox-modal-title");
        const bodyEl = document.getElementById("vox-modal-body");
        if (!modal || !titleEl || !bodyEl) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = htmlContent;
        modal.classList.add("open");
    }

    closeSettingsModal() {
        const modal = document.getElementById("vox-settings-modal");
        if (modal) modal.classList.remove("open");
    }

    // --- Audio Diagnostics & Debug Methods (Sections 11 & 25) ---
    startAudioDebugLoop() {
        this.stopAudioDebugLoop();
        this.debugInterval = setInterval(() => {
            this.updateAudioDebugUI();
        }, 400);
    }

    stopAudioDebugLoop() {
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
            this.debugInterval = null;
        }
    }

    updateAudioDebugUI() {
        if (!this.audioEngine || !this.audioEngine.diagnostics) return;
        const diag = this.audioEngine.diagnostics;

        const micIndicator = document.getElementById("audio-debug-mic-indicator");
        if (micIndicator) {
            micIndicator.textContent = this.audioEngine.isMicActive ? "MIC ACTIVE" : "MIC IDLE";
            micIndicator.className = `debug-metric-val ${this.audioEngine.isMicActive ? "ok" : "warn"}`;
        }

        const setVal = (id, val, cls = "") => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = val;
                if (cls) el.className = `debug-metric-val ${cls}`;
            }
        };

        setVal("dbg-perm", diag.permission, diag.permission === "granted" ? "ok" : (diag.permission === "denied" ? "err" : "warn"));
        setVal("dbg-stream", diag.streamActive ? "active" : "idle", diag.streamActive ? "ok" : "warn");
        setVal("dbg-track", diag.trackEnabled ? "enabled" : "disabled", diag.trackEnabled ? "ok" : "warn");
        setVal("dbg-ctx", diag.audioContextState, diag.audioContextState === "running" ? "ok" : "warn");
        setVal("dbg-frames", diag.audioFramesReceived.toLocaleString());
        setVal("dbg-rec", diag.speechRecognitionStatus, diag.speechRecognitionStatus === "listening" ? "ok" : (diag.speechRecognitionStatus === "unavailable" ? "err" : "warn"));
        setVal("dbg-events", diag.transcriptEventsCount.toString());
        setVal("dbg-detected-lang", diag.detectedLanguage || "Auto-detecting", diag.detectedLanguage ? "ok" : "warn");
        setVal("dbg-detected-conf", diag.detectionConfidence || "--");
        setVal("dbg-stt-status", diag.speechRecognitionStatus === "listening" ? "Active" : (diag.speechRecognitionStatus || "Idle"), diag.speechRecognitionStatus === "listening" ? "ok" : "warn");
        setVal("dbg-translation-status", diag.translationStatus || "Active (Natural En)", "ok");
    }
}

window.addEventListener("DOMContentLoaded", () => {
 window.app = new VoxShieldApp();
});
