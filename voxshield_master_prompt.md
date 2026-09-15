# VoxShield — Master Build Prompt

**Project:** VoxShield — Real-Time Voice Call Impersonation & Deepfake Detection System
**Type:** Hackathon prototype (5-day build)
**Goal:** Detect AI-cloned voices, verify caller identity, catch replay attacks, understand conversation context, challenge suspicious callers, cross-verify high-stakes requests through a trusted channel, and log every incident — all in real time during a live call.

Use this document as the single source of truth when prompting an AI coding assistant (Claude Code, Cursor, etc.) to build this project. It contains the full tech stack, the end-to-end system flow, and the phase-by-phase build plan.

---

## 1. Project Summary

> **Incoming Voice → Real-Time Analysis → Clone Detection → Speaker Verification → Context Detection → Dynamic Challenge → Trusted-Channel Verification → Prevention → Incident Log**

VoxShield simulates a secure call environment (not real cellular interception) to demonstrate the full detection-and-prevention pipeline end-to-end, using a mobile app + real-time backend + ML models.

---

## 2. Final Tech Stack

### 2.1 ML Model Layer (Detection Engine)

| Component | Technology | Purpose |
|---|---|---|
| Core Framework | **PyTorch** | Model training + inference engine |
| Deepfake Detector | **AASIST** | Pretrained anti-spoofing model |
| Deepfake Detector (fallback) | **RawNet2** | Simpler alternative if AASIST setup is too heavy |
| Speaker Verification | **SpeechBrain (ECAPA-TDNN)** | Voiceprint matching, drift detection |
| Liveness — ASR | **Faster-Whisper** | Verifies spoken response to challenge phrases |
| Liveness — VAD | **Silero-VAD / WebRTC VAD** | Silence & breath-gap regularity detection |
| Prosody — Pitch | **Parselmouth** | F0 / pitch contour detection |
| Prosody — Energy | **Librosa** | Energy, speaking rate, spectral features |
| Prosody Classifier | **XGBoost / LightGBM** | Lightweight per-risk classifier |
| Fusion Model | **scikit-learn** | Combines all signals into final risk score |
| Dataset | **ASVspoof 2019/2021** + self-generated clones | Training + generalization testing |
| Evaluation Metrics | **EER, min t-DCF** | Standard anti-spoofing benchmark metrics |

### 2.2 Backend (Server / API Layer)

| Component | Technology | Why |
|---|---|---|
| Framework | **FastAPI** | Native WebSocket + `async`/`await` support |
| Language | **Python** | ML ecosystem compatibility |
| Real-time Protocol | **WebSocket** | Encrypted streaming, not request/response |
| Session Management | **asyncio** | Handles concurrent connections, chunk routing |
| Remote Alerts | **Firebase Cloud Messaging (FCM)** | Admin/device push notifications |
| Hosting | **Cloud VM / Local GPU machine** | Runs the live inference server |

### 2.3 Frontend (Mobile App)

| Component | Technology | Why |
|---|---|---|
| Framework | **Flutter** | Cross-platform (iOS + Android) |
| Language | **Dart** | Flutter's native language |
| Audio Capture | **`record` package** | Mic recording |
| Audio Playback | **`flutter_sound`** | Recording + playback |
| Real-time Client | **`web_socket_channel`** | WebSocket connection to backend |
| Risk UI | **`fl_chart`** | Live risk-score meter / graph |
| Notifications | **`flutter_local_notifications`** | On-device alerts |
| Auth | **Firebase Auth** | User/Admin role separation |

### 2.4 Database (Storage)

| Component | Technology | Why |
|---|---|---|
| Local Storage | **SQLite** | Lightweight on-device storage |
| Cloud Storage | **Firebase Firestore** | Real-time sync for logs/alerts |
| Voiceprint Storage | **AES-256 encrypted field** | Secure embedding storage |
| Log Retention | **TTL (Firestore) / cleanup script (SQLite)** | Auto-expiry, data minimization |
| Access Logs | **Separate audit table/collection** | Tracks who accessed what (role-based) |

### 2.5 Security & Privacy

| Component | Technology | Why |
|---|---|---|
| Transit Encryption | **WSS / TLS** | Encrypt audio in transit |
| Consent Flow | **Consent UI screen** | User/caller disclosure before capture |
| Data Minimization | **Discard after inference** | Never persist raw audio |
| Embedding Security | **AES-256 encryption** | Protect stored voiceprint |
| Access Control | **Role-based auth** | Admin vs. regular user |
| Human-in-the-Loop | **Alert + process** | No auto-block; human makes the final call |
| Retention Policy | **TTL / auto-expiry on logs** | Compliance with data-minimization principle |
| Compliance Reference | **DPDP Act 2023** | Legal grounding for India-based deployment |

---

## 3. System Architecture

```text
                    USER (Flutter App)
                         │
                Mic Capture (record pkg)
                         │
              WebSocket Stream (WSS/TLS)
                         │
                  FastAPI Backend
                    (async/asyncio)
                         │
       ┌─────────────────┼──────────────────┐
       ▼                 ▼                   ▼
 Deepfake Detection  Speaker Verification  Liveness Check
 (AASIST/RawNet2)    (SpeechBrain ECAPA)   (Silero-VAD +
       │                   │                Faster-Whisper)
       │                   │                     │
       └───────────────────┼─────────────────────┘
                            ▼
                    Prosody Analysis
             (Parselmouth pitch + Librosa energy)
                            ▼
                Prosody Classifier (XGBoost/LightGBM)
                            ▼
                Fusion Model (scikit-learn)
                            ▼
                    Security Engine
                            │
       ┌────────────────────┼─────────────────────┐
       ▼                    ▼                      ▼
Dynamic Challenge     Trusted-Channel          Replay Detection
                        Verification
       │                    │                      │
       └────────────────────┼──────────────────────┘
                            ▼
                    SECURITY DECISION
                    /        |        \
              VERIFIED  VERIFICATION  IMPERSONATION
                  │      REQUIRED         DETECTED
                  ▼          │                │
            Continue Call    │                ▼
                              │          Alert + Block
                              │                │
                              └────────────────┘
                                     ▼
                            Incident Center
                        (Firestore/SQLite, AES-256,
                              TTL retention)
```

---

## 4. Full End-to-End Process Flow

### Step 1 — Call Starts
```text
User taps "Start Secure Call" (Flutter)
        ↓
Consent screen shown (disclosure before capture)
        ↓
Microphone permission requested
        ↓
Mic turns ON → audio streams to backend over WSS
```

### Step 2 — Real-Time Audio Processing
```text
Raw audio chunk arrives at FastAPI backend
        ↓
Buffered into ~1 second windows
        ↓
Features extracted: MFCC, Mel Spectrogram, spectral features (Librosa)
```

### Step 3 — Voice Authenticity Check (Deepfake Detection)
```text
Extracted features → AASIST / RawNet2
        ↓
   ┌────┴────┐
 REAL      SYNTHETIC
   ↓            ↓
🟢 AUTHENTIC   🔴 SYNTHETIC VOICE DETECTED
```

### Step 4 — Speaker Verification
```text
Voice sample → SpeechBrain (ECAPA-TDNN) embedding
        ↓
Compared against Trusted Circle voiceprints (AES-256 encrypted)
        ↓
   ┌────┴────┐
MATCH      NO MATCH
   ↓            ↓
🟢 VERIFIED   ⚠️ VERIFICATION REQUIRED
```

### Step 5 — Liveness / Replay Attack Detection
```text
Silero-VAD checks silence/breath-gap regularity
        ↓
   ┌────┴────┐
LIVE       REPLAYED
   ↓            ↓
🟢 LIVE AUDIO   🔴 POSSIBLE REPLAY DETECTED
```

### Step 6 — Prosody Analysis
```text
Parselmouth → pitch/F0 contour
Librosa → energy, speaking rate
        ↓
XGBoost/LightGBM prosody classifier → risk signal
```

### Step 7 — Live Transcription + Context Detection
```text
Audio → Faster-Whisper (speech-to-text)
        ↓
Live transcript displayed in app
        ↓
Context module scans text for: money transfer, OTP request,
password reset, urgent payment, confidential info, account access
        ↓
   ┌────┴────┐
NORMAL      SENSITIVE REQUEST
   ↓            ↓
Continue    🔴 SENSITIVE REQUEST DETECTED
```

### Step 8 — Fusion Model Decision
```text
All signals (deepfake score, speaker match, liveness,
prosody risk, context flag) → scikit-learn fusion model
        ↓
Final Risk Assessment
```

### Step 9 — Dynamic Voice Challenge (if risk detected)
```text
System generates random phrase at runtime (not pre-set)
        ↓
"Please say: Blue Tiger 47"
        ↓
Caller repeats it → Faster-Whisper verifies speech
        ↓
   ┌────┴────┐
 PASS        FAIL
   ↓            ↓
🟢 VERIFIED   🔴 VERIFICATION FAILED
```

### Step 10 — Trusted-Channel Cross Verification (high-stakes requests)
```text
Suspicious financial/sensitive request detected
        ↓
FCM push notification sent to the REAL person's registered device
        ↓
"Did you actually request this ₹X transfer?"
        ↓
   ┌────┴────┐
 YES          NO
   ↓            ↓
🟢 Approved   🚨 IMPERSONATION CONFIRMED
```

### Step 11 — Prevention Engine (Rule-Based, No Numeric Score)
```text
IF synthetic voice detected           → Verification Required
IF sensitive request detected         → Additional Verification
IF speaker verification fails         → Block Sensitive Action
IF trusted-channel owner rejects      → BLOCK + ALERT
IF all verification succeeds          → ALLOW

Final states shown to user:
🟢 VERIFIED
🟡 VERIFICATION REQUIRED
🔴 IMPERSONATION DETECTED
```
Note: Human-in-the-loop — no auto-block without alert + human review process.

### Step 12 — Incident Logging
```text
Any flagged/blocked event → logged to Firestore/SQLite
        ↓
Stores: timestamp, caller, detection type, action taken
        ↓
Encrypted (AES-256), TTL-bound retention (auto-expiry)
        ↓
Visible in Incident Center (role-based access, audit log)
```

### Step 13 — Call Ends
```text
User ends call OR call auto-flagged/blocked
        ↓
Dashboard updates final status: Verified / Flagged / Blocked
        ↓
Raw audio discarded (never persisted — data minimization)
```

---

## 5. App Screens (Flutter)

1. **Login** — Firebase Auth (User/Admin roles)
2. **Dashboard** — overview of recent calls & status
3. **Live Protection** — real-time call screen with all live indicators
4. **Trusted Circle** — register/manage trusted voiceprints
5. **Verification** — dynamic challenge + trusted-channel confirmation UI
6. **Incident Center** — full log of flagged/blocked events
7. **Settings** — consent preferences, retention settings

### Live Protection Screen (example layout)
```text
CALL STATUS
🟢 CONNECTED

VOICE AUTHENTICITY
🔴 SYNTHETIC VOICE DETECTED

SPEAKER
⚠️ VERIFICATION REQUIRED

REPLAY
🟢 NOT DETECTED

CONVERSATION
🔴 FINANCIAL REQUEST

ACTION
🔐 VERIFICATION REQUIRED
```

---

## 6. 5-Day Build Schedule

| Day | Main Goal | Features |
|---|---|---|
| **Day 1** | Basic working application | Flutter app shell + FastAPI backend + WebSocket + mic audio capture |
| **Day 2** | AI voice security | Deepfake detection (AASIST/RawNet2) + Speaker Verification (SpeechBrain) |
| **Day 3** | Attack understanding | Liveness/Replay Detection (Silero-VAD) + Faster-Whisper transcription + Context Detection |
| **Day 4** | Active prevention | Dynamic Challenge + Trusted-Channel Verification (FCM) + Prevention Engine |
| **Day 5** | Final product | Incident Center + full integration + testing + UI polish + demo prep |

---

## 7. MVP Priority Order (if time runs short)

1. Real-time voice capture
2. Deepfake/clone detection
3. Speaker verification
4. Dynamic challenge
5. Context detection
6. Prevention engine (rule-based decision)
7. Trusted-channel verification
8. Incident Center

**Rule of thumb:** one complete attack scenario working end-to-end beats 20 half-working features.

---

## 8. Core Features Checklist

- [ ] Real-time voice analysis
- [ ] AI-generated voice (deepfake) detection
- [ ] Speaker verification against Trusted Circle
- [ ] Replay attack / liveness detection
- [ ] Continuous monitoring during call
- [ ] Live transcription (Faster-Whisper)
- [ ] Sensitive-request/context detection
- [ ] Dynamic runtime voice challenge
- [ ] Trusted Circle management
- [ ] Trusted-channel cross verification (FCM)
- [ ] Real-time alerts
- [ ] Sensitive-action restriction
- [ ] Incident Center with audit logs
- [ ] AES-256 encrypted voiceprint storage
- [ ] TTL-based log retention
- [ ] Firebase Auth (role-based: user/admin)
- [ ] Consent-first UI flow
- [ ] DPDP Act 2023–aligned data handling

---

## 9. Important Scope Note for Demo

**Do not attempt real cellular/WhatsApp call interception.** For the prototype, demonstrate via a **Flutter app → WebSocket → FastAPI → ML pipeline** simulated secure call environment. Framing for judges:

> "Our prototype demonstrates the real-time detection and prevention pipeline through a controlled, encrypted voice-call environment. The same security engine can later integrate with enterprise telephony/communication infrastructure."

---

## 10. How to Use This Prompt

When handing this to an AI coding assistant, say something like:

> "Using the VoxShield spec below, scaffold a FastAPI backend with WebSocket audio streaming and a Flutter frontend with the screens listed. Start with Day 1 of the build schedule."

Paste this entire document as context, then request one phase/day at a time for focused, manageable build steps.
