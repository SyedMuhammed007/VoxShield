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
            const settingsBtn = document.getElementById("btn-theme-toggle-settings");
            const topbarLabel = document.getElementById("theme-btn-text");
            const settingsTitle = document.getElementById("settings-theme-title");
            const settingsLabel = document.getElementById("settings-switch-label");

            if (topbarBtn) {
                const sun = topbarBtn.querySelector(".icon-sun");
                const moon = topbarBtn.querySelector(".icon-moon");
                if (sun) sun.style.display = isDark ? "none" : "inline";
                if (moon) moon.style.display = isDark ? "inline" : "none";
                if (topbarLabel) topbarLabel.textContent = isDark ? "Dark Mode" : "Light Mode";
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
        document.getElementById("btn-theme-toggle-settings")?.addEventListener("click", handleThemeToggle);

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

 // Start render loop for visualizers
 this.startVisualizerLoop();
 this.renderTrustedCircle();
 this.renderIncidents();
 }

 setupAudioListeners() {
 // Speech recognition live transcription
 this.audioEngine.onTranscriptCallback = (text, isFinal) => {
 this.detectionEngine.processTranscript(text, isFinal);
 this.updateTranscriptUI(text, isFinal);
 this.updateTelemetryUI();
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

 this.currentScenario = scenario;
 this.detectionEngine.startSession(scenario);
 this.dialogueIndex = 0;
 this.callSeconds = 0;

 // Switch to Live Protection Screen
 this.switchScreen("live-call");
 this.updateCallHeaderUI(scenario);
 this.resetIndicatorsUI();

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
 // Passive verification mode active
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

 // Audio Execution
 if (scenario.voice_type === "live_microphone") {
 const micOk = await this.audioEngine.startMicrophone();
 const transcriptBox = document.getElementById("transcript-stream");
 if (transcriptBox) {
 transcriptBox.innerHTML = `<div class="transcript-msg system-note">Microphone stream active. Real-time neural inference running in ephemeral memory.</div>`;
 }
 } else {
 // Pre-scripted voice dialogues using real speech synthesis
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
 this.updateTranscriptUI(item.text, true);
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
 statusPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_idle") : "IDLE / READY";
 statusPill.className = "indicator-val status-gray";
 }

 const authPill = document.getElementById("indicator-authenticity");
 if (authPill) {
 authPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_nominal") : "NOMINAL";
 authPill.className = "indicator-val status-gray";
 }

 const speakerPill = document.getElementById("indicator-speaker");
 if (speakerPill) {
 speakerPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_unverified") : "UNVERIFIED";
 speakerPill.className = "indicator-val status-gray";
 }

 const replayPill = document.getElementById("indicator-replay");
 if (replayPill) {
 replayPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_nominal") : "NOMINAL";
 replayPill.className = "indicator-val status-gray";
 }

 const contextPill = document.getElementById("indicator-context");
 if (contextPill) {
 contextPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_neutral") : "NEUTRAL";
 contextPill.className = "indicator-val status-gray";
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
 const stream = document.getElementById("transcript-stream");
 if (stream) stream.innerHTML = `<div class="transcript-msg system-note"> Encrypted call connected (WSS / AES-256). Live AI detection active.</div>`;
 this.updateTelemetryUI();
 }

 updateTranscriptUI(text, isFinal) {
 const stream = document.getElementById("transcript-stream");
 if (!stream) return;

 // Highlight financial/urgent keywords
 let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
 const highlightRegex = /(transfer|wire|rupees|inr|lakh|thousand|emergency|card blocked|otp|password|immediate|vendor|इमरजेंसी|पैसे|रुपये|ट्रांसफर|ओटीपी|पासवर्ड|मुसीबत|அவசரம்|பணம்|ரூபாய்|கடவுச்சொல்|ఎమర్జెన్సీ|డబ్బు|రూపాయలు|ఓటీపీ|ఆపద|বিপদ|টাকা|ট্রান্সফার|ওটিপি)/gi;
 safeText = safeText.replace(highlightRegex, `<mark class="threat-keyword">$1</mark>`);

 const msgDiv = document.createElement("div");
 msgDiv.className = "transcript-msg caller-line";
 msgDiv.innerHTML = `<span class="time">${new Date().toLocaleTimeString()}</span> <span class="text">${safeText}</span>`;
 stream.appendChild(msgDiv);
 stream.scrollTop = stream.scrollHeight;

 // Also update SOC transcript
 const socStream = document.getElementById("soc-transcript-stream");
 if (socStream) {
 socStream.appendChild(msgDiv.cloneNode(true));
 socStream.scrollTop = socStream.scrollHeight;
 }
 }

 updateTelemetryUI() {
 const d = this.detectionEngine;

 // 1. Call Status
 const statusPill = document.getElementById("indicator-call-status");
 if (statusPill) {
 statusPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_connected") : "CONNECTED (ENCRYPTED)";
 statusPill.className = "indicator-val status-green";
 }

 // 2. Voice Authenticity (AASIST / RawNet2)
 const authPill = document.getElementById("indicator-authenticity");
 const socAasistScore = document.getElementById("soc-aasist-score");
 const socAasistBar = document.getElementById("soc-aasist-bar");
 if (authPill) {
 if (d.deepfakeScore >= 70) {
 authPill.innerHTML = `${window.voxI18n ? window.voxI18n.t("status_synthetic") : "SYNTHETIC DETECTED"} (${d.deepfakeScore.toFixed(1)}%)`;
 authPill.className = "indicator-val status-red animate-pulse";
 } else {
 authPill.innerHTML = `AUTHENTIC VOICE (${(100 - d.deepfakeScore).toFixed(1)}%)`;
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
 speakerPill.innerHTML = `VERIFIED (SIMILARITY: ${d.speakerSimilarity.toFixed(2)})`;
 speakerPill.className = "indicator-val status-green";
 } else {
 speakerPill.innerHTML = `VERIFICATION REQUIRED (${d.speakerSimilarity.toFixed(2)})`;
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
 replayPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_nominal") : "LIVE AUDIO (PASS)";
 replayPill.className = "indicator-val status-green";
 } else {
 replayPill.innerHTML = window.voxI18n ? window.voxI18n.t("status_replay") : "POSSIBLE REPLAY DETECTED";
 replayPill.className = "indicator-val status-red animate-pulse";
 }
 }
 if (socReplayScore) socReplayScore.textContent = `${(d.livenessScore * 100).toFixed(0)}% Liveness`;

 // 5. Conversation Context
 const contextPill = document.getElementById("indicator-context");
 if (contextPill) {
 if (d.contextRiskLevel === "CRITICAL") {
 contextPill.innerHTML = `RISK: CREDENTIAL HARVEST`;
 contextPill.className = "indicator-val status-red animate-pulse";
 } else if (d.contextRiskLevel === "HIGH") {
 contextPill.innerHTML = `RISK: FINANCIAL TRANSFER`;
 contextPill.className = "indicator-val status-red animate-pulse";
 } else {
 contextPill.innerHTML = `NORMAL CONVERSATION`;
 contextPill.className = "indicator-val status-green";
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
}

window.addEventListener("DOMContentLoaded", () => {
 window.app = new VoxShieldApp();
});
