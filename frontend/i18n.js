/**
 * VoxShield - Multi-Language Internationalization (i18n) Engine
 * Comprehensive translations for:
 * English (en), Hindi (hi), Tamil (ta), Telugu (te), Bengali (bn).
 * Directly coordinates UI translations, speech recognition locale, and speech synthesis voices.
 */

window.VOX_TRANSLATIONS = {
    en: {
        "app_title": "VoxShield",
        "app_badge": "",
        "app_tagline": "Real-Time Voice Biometric Firewall",
        "device_protected": "Device Protection Active",
        "soc_telemetry": "SOC Telemetry",
        "island_active": "VoxShield Active",
        "header_title": "VoxShield Guard",
        "header_sub": "Real-time call protection",
        "stat_clone_acc": "Clone Accuracy",
        "stat_latency": "Latency Cutoff",
        "stat_dpdp": "Zero Audio Stored",
        "test_scenarios_title": "TEST CALL SCENARIOS",
        "real_audio_badge": "Real Audio",

        "sc_authentic_name": "Aarav Sharma",
        "sc_authentic_tag": "Enrolled Baseline",
        "sc_authentic_sub": "Family member • Legitimate voice sample",

        "sc_deepfake_name": "AI Voice Clone Scam",
        "sc_deepfake_tag": "High Threat",
        "sc_deepfake_sub": "Spoofed caller • Urgent extortion demand",

        "sc_replay_name": "Acoustic Replay Attack",
        "sc_replay_tag": "Transducer Cutoff",
        "sc_replay_sub": "Recorded voice replay • OTP interception",

        "sc_mic_name": "Direct Microphone Test",
        "sc_mic_tag": "Hardware DSP",
        "sc_mic_sub": "Stream your live speech through the engine",

        "dpdp_title": "DPDP Act 2023 Compliant",
        "dpdp_desc": "Raw audio is analyzed strictly in temporary RAM and immediately discarded. Zero audio files are saved.",

        "srtp_encrypted": "SRTP ENCRYPTED CALL • VOXSHIELD ACTIVE",
        "call_status": "CALL STATUS",
        "synthesis": "SYNTHESIS (AASIST)",
        "speaker": "SPEAKER (ECAPA)",
        "replay": "REPLAY DETECT",
        "semantic_vector": "SEMANTIC COERCION VECTOR",
        "status_idle": "IDLE / READY",
        "status_connected": "CONNECTED (ENCRYPTED)",
        "status_nominal": "NOMINAL",
        "status_unverified": "UNVERIFIED",
        "status_neutral": "NEUTRAL",
        "status_synthetic": "SYNTHETIC DETECTED",
        "status_replay": "REPLAY DETECTED",
        "status_safe": "VERIFIED SAFE",

        "call_transcript_title": "REAL-TIME TRANSCRIPT & ACOUSTIC NLP",
        "call_transcript_ph": "Awaiting live voice stream...",

        "dock_mute": "Mute",
        "dock_unmute": "Unmute",
        "dock_push": "Push Verify",
        "dock_block": "Block Call",
        "dock_end": "End Call",

        "tab_shield": "Shield",
        "tab_live_call": "Live Call",
        "tab_circle": "Circle",
        "tab_incidents": "Incidents",
        "tab_settings": "Settings",

        "trusted_title": "Trusted Circle",
        "trusted_sub": "Enrolled Biometric Baselines",
        "btn_add_contact": "+ Add Contact",
        "tc_col_name": "Contact Name",
        "tc_col_status": "Status",
        "tc_col_enrolled": "Enrolled Date",
        "tc_empty": "No contacts enrolled yet. Add family or colleagues to protect their voiceprints.",

        "incidents_title": "Incident Ledger",
        "incidents_sub": "Tamper-Evident Security Log",
        "inc_empty": "No security incidents logged. All calls verified.",
        "inc_caller": "Caller ID:",
        "inc_vector": "Attack Vector:",
        "inc_trigger": "Context Trigger:",
        "inc_action": "Action Taken:",
        "inc_compliance": "DPDP Act 2023 (TTL Auto-Expiry)",
        "inc_zero_retention": "Audio Discarded (Zero Retention)",

        "settings_title": "Settings",
        "settings_sub": "Security Policies & Models",
        "sec_appearance": "APPEARANCE & THEME",
        "theme_light_title": "Light Theme (Active)",
        "theme_dark_title": "Dark Mode (Active)",
        "theme_desc": "Switch between executive Light Mode and Dark Cyberpunk theme.",
        "btn_toggle_theme": "Toggle Theme",

        "sec_language": "VOICE & INTERFACE LANGUAGE",
        "lang_desc": "Voice recognition and synthesizers dynamically adapt to your selected language.",

        "sec_defense": "DEFENSE ENGINE",
        "aasist_title": "AASIST-v2 Synthesis Threshold",
        "aasist_desc": "Alert cutoff for phase vocoder anomalies",
        "ecapa_title": "ECAPA Speaker Verification",
        "ecapa_desc": "Cosine distance required for baseline pass",
        "filter_title": "Acoustic Replay Filter",
        "filter_desc": "Detect loudspeaker frequency cutoffs",

        "sec_privacy": "PRIVACY & COMPLIANCE",
        "retention_title": "Zero Audio Retention",
        "retention_desc": "DPDP Act 2023 ephemeral RAM buffer only",
        "purge_title": "Log Auto-Purge TTL",
        "purge_desc": "Cryptographic incident metadata expiry",

        "modal_enroll_title": "Enroll Voice Biometric Profile",
        "modal_name_ph": "Full Name (e.g., Sarah Miller)",
        "modal_phone_ph": "Phone (+91 ...)",
        "modal_relation_ph": "Relation (e.g., Sister)",
        "btn_cancel": "Cancel",
        "btn_save": "Save Voiceprint",

        "soc_title": "Dual SOC Telemetry",
        "soc_sub": "Real-time Neural Feature Pipeline",
        "soc_spectral_density": "SPECTRAL ENERGY DENSITY",
        "soc_harmonics": "PHASE VOCODER HARMONICS",
        "soc_stream": "LIVE TELEMETRY STREAM",
        "soc_toggle_focus": "Focus View",
        "soc_toggle_dual": "Dual SOC View"
    },

    hi: {
        "app_title": "वॉक्सशील्ड मोबाइल",
        "app_badge": "v3.4 प्रोडक्शन",
        "app_tagline": "रीयल-टाइम मोबाइल वॉयस बायोमेट्रिक सुरक्षा",
        "device_protected": "डिवाइस सुरक्षा सक्रिय",
        "soc_telemetry": "एसओसी टेलीमेट्री",
        "island_active": "वॉक्सशील्ड सक्रिय",
        "header_title": "वॉक्सशील्ड गार्ड",
        "header_sub": "बायोमेट्रिक कॉल सुरक्षा सक्रिय है",
        "stat_clone_acc": "क्लोन सटीकता",
        "stat_latency": "विलंबता कटऑफ",
        "stat_dpdp": "शून्य ऑडियो संग्रहीत",
        "test_scenarios_title": "परीक्षण कॉल परिदृश्य",
        "real_audio_badge": "वास्तविक ऑडियो",

        "sc_authentic_name": "आरव शर्मा",
        "sc_authentic_tag": "प्रमाणित बेसलाइन",
        "sc_authentic_sub": "परिवार के सदस्य • वैध वॉयस नमूना",

        "sc_deepfake_name": "एआई वॉयस क्लोन फ्रॉड",
        "sc_deepfake_tag": "गंभीर खतरा",
        "sc_deepfake_sub": "नकली कॉलर • तत्काल पैसे की मांग",

        "sc_replay_name": "ध्वनि रीप्ले हमला",
        "sc_replay_tag": "ट्रांसड्यूसर कटऑफ",
        "sc_replay_sub": "रिकॉर्डेड आवाज का रीप्ले • ओटीपी चोरी",

        "sc_mic_name": "डायरेक्ट माइक्रोफोन टेस्ट",
        "sc_mic_tag": "हार्डवेयर डीएसपी",
        "sc_mic_sub": "इंजन के माध्यम से अपनी आवाज लाइव टेस्ट करें",

        "dpdp_title": "डीपीडीपी अधिनियम 2023 अनुपालित",
        "dpdp_desc": "ऑडियो केवल रैम में विश्लेषित किया जाता है और तुरंत नष्ट कर दिया जाता है। शून्य ऑडियो स्टोर किया जाता है।",

        "srtp_encrypted": "एसआरटीपी एन्क्रिप्टेड कॉल • वॉक्सशील्ड सक्रिय",
        "call_status": "कॉल स्थिति",
        "synthesis": "सिंथेसिस (AASIST)",
        "speaker": "स्पीकर पहचान (ECAPA)",
        "replay": "रीप्ले पहचान",
        "semantic_vector": "वित्तीय दबाव वेक्टर",
        "status_idle": "तैयार / निष्क्रिय",
        "status_connected": "सुरक्षित कनेक्टेड",
        "status_nominal": "सामान्य",
        "status_unverified": "असत्यापित",
        "status_neutral": "तटस्थ",
        "status_synthetic": "एआई क्लोन का पता चला",
        "status_replay": "रीप्ले का पता चला",
        "status_safe": "प्रमाणित सुरक्षित",

        "call_transcript_title": "रीयल-टाइम वॉयस ट्रांसक्रिप्ट और एनएलपी",
        "call_transcript_ph": "लाइव आवाज की प्रतीक्षा कर रहा है...",

        "dock_mute": "म्यूट",
        "dock_unmute": "अनम्यूट",
        "dock_push": "पुश सत्यापन",
        "dock_block": "कॉल ब्लॉक",
        "dock_end": "कॉल समाप्त",

        "tab_shield": "सुरक्षा",
        "tab_live_call": "लाइव कॉल",
        "tab_circle": "सर्कल",
        "tab_incidents": "घटनाएं",
        "tab_settings": "सेटिंग्स",

        "trusted_title": "विश्वसनीय दायरा",
        "trusted_sub": "नामांकित बायोमेट्रिक बेसलाइन",
        "btn_add_contact": "+ नया संपर्क जोड़ें",
        "tc_col_name": "संपर्क नाम",
        "tc_col_status": "स्थिति",
        "tc_col_enrolled": "नामांकन तिथि",
        "tc_empty": "अभी कोई संपर्क नामांकित नहीं है। वॉयसप्रिंट सुरक्षित करने के लिए परिवार जोड़ें।",

        "incidents_title": "सुरक्षा घटना रजिस्टर",
        "incidents_sub": "छेड़छाड़-रोधी सुरक्षा लॉग",
        "inc_empty": "कोई सुरक्षा घटना दर्ज नहीं। सभी कॉल सुरक्षित रहे।",
        "inc_caller": "कॉलर आईडी:",
        "inc_vector": "हमला प्रकार:",
        "inc_trigger": "पहचाना गया दबाव:",
        "inc_action": "की गई कार्रवाई:",
        "inc_compliance": "डीपीडीपी अधिनियम 2023 (स्वतः-समाप्ति)",
        "inc_zero_retention": "ऑडियो नष्ट (शून्य संग्रहण)",

        "settings_title": "सेटिंग्स",
        "settings_sub": "सुरक्षा नीतियां और मॉडल",
        "sec_appearance": "दिखावट और थीम",
        "theme_light_title": "लाइट थीम (सक्रिय)",
        "theme_dark_title": "डार्क मोड (सक्रिय)",
        "theme_desc": "शानदार लाइट मोड और डार्क साइबरपंक थीम के बीच स्विच करें।",
        "btn_toggle_theme": "थीम बदलें",

        "sec_language": "आवाज और इंटरफ़ेस भाषा",
        "lang_desc": "आवाज पहचान और वॉयस सिंथेसाइज़र आपकी चुनी हुई भाषा के अनुसार काम करते हैं।",

        "sec_defense": "सुरक्षा इंजन",
        "aasist_title": "AASIST-v2 सिंथेसिस थ्रेशोल्ड",
        "aasist_desc": "आर्टिफिशियल वॉयस कटऑफ सीमा",
        "ecapa_title": "ECAPA वक्ता सत्यापन",
        "ecapa_desc": "बेसलाइन मिलान के लिए आवश्यक समानता",
        "filter_title": "अकौस्टिक रीप्ले फ़िल्टर",
        "filter_desc": "लाउडस्पीकर आवृत्ति कटऑफ पहचान",

        "sec_privacy": "गोपनीयता और अनुपालन",
        "retention_title": "शून्य ऑडियो भंडारण",
        "retention_desc": "डीपीडीपी 2023 के तहत केवल अस्थायी रैम बफर",
        "purge_title": "लॉग स्वतः-समाप्ति टीटीएल",
        "purge_desc": "क्रिप्टोग्राफिक घटना मेटाडेटा अवधि",

        "modal_enroll_title": "बायोमेट्रिक वॉयस प्रोफाइल नामांकित करें",
        "modal_name_ph": "पूरा नाम (उदा. आरव शर्मा)",
        "modal_phone_ph": "फोन नंबर (+91 ...)",
        "modal_relation_ph": "संबंध (उदा. भाई / मित्र)",
        "btn_cancel": "रद्द करें",
        "btn_save": "वॉयसप्रिंट सहेजें",

        "soc_title": "दोहरी एसओसी टेलीमेट्री",
        "soc_sub": "रीयल-टाइम न्यूरल सिग्नल पाइपलाइन",
        "soc_spectral_density": "स्पेक्ट्रल ऊर्जा घनत्व",
        "soc_harmonics": "फेज वोकोडर हार्मोनिक्स",
        "soc_stream": "लाइव टेलीमेट्री स्ट्रीम",
        "soc_toggle_focus": "फोकस दृश्य",
        "soc_toggle_dual": "दोहरा एसओसी दृश्य"
    },

    ta: {
        "app_title": "வாக்ஸ்ஷீல்ட் மொபைல்",
        "app_badge": "v3.4 தயாரிப்பு",
        "app_tagline": "நேரலை பயோமெட்ரிக் அழைப்புப் பாதுகாப்பு",
        "device_protected": "சாதனப் பாதுகாப்பு செயலில்",
        "soc_telemetry": "SOC தொலை அளவியல்",
        "island_active": "வாக்ஸ்ஷீல்ட் செயலில்",
        "header_title": "வாக்ஸ்ஷீல்ட் கார்ட்",
        "header_sub": "பயோமெட்ரிக் அழைப்பு பாதுகாப்பு செயலில் உள்ளது",
        "stat_clone_acc": "குளோன் துல்லியம்",
        "stat_latency": "தாமத வரம்பு",
        "stat_dpdp": "ஆடியோ சேமிக்கப்படவில்லை",
        "test_scenarios_title": "சோதனை அழைப்பு சூழல்கள்",
        "real_audio_badge": "உண்மை ஆடியோ",

        "sc_authentic_name": "ஆரவ் சர்மா",
        "sc_authentic_tag": "உறுதிப்படுத்தப்பட்டது",
        "sc_authentic_sub": "குடும்ப உறுப்பினர் • உண்மையான குரல்",

        "sc_deepfake_name": "AI குரல் குளோனிங் மோசடி",
        "sc_deepfake_tag": "உயர் ஆபத்து",
        "sc_deepfake_sub": "போலி அழைப்பாளர் • உடனடி பணப்பறிப்பு",

        "sc_replay_name": "ஒலி மறுஒளிபரப்பு தாக்குதல்",
        "sc_replay_tag": "ஒலிபெருக்கி வடிகட்டி",
        "sc_replay_sub": "பதிவு செய்யப்பட்ட ஒலி • OTP திருட்டு",

        "sc_mic_name": "நேரடி மைக்ரோஃபோன் சோதனை",
        "sc_mic_tag": "ஹார்டுவேர் DSP",
        "sc_mic_sub": "உங்கள் குரலை என்ஜினில் நேரடியாக சோதிக்கவும்",

        "dpdp_title": "DPDP சட்டம் 2023 இணக்கம்",
        "dpdp_desc": "ஆடியோ தற்காலிக ரேமில் மட்டுமே பகுப்பாய்வு செய்யப்பட்டு உடனடியாக அழிக்கப்படுகிறது.",

        "srtp_encrypted": "SRTP என்க்ரிப்ட் செய்யப்பட்ட அழைப்பு",
        "call_status": "அழைப்பு நிலை",
        "synthesis": "செயற்கைக் குரல் (AASIST)",
        "speaker": "குரல் சரிபார்ப்பு (ECAPA)",
        "replay": "மறுஒளிபரப்பு கண்டறிதல்",
        "semantic_vector": "பணப்பறிப்பு வெக்டார்",
        "status_idle": "தயார் நிலை",
        "status_connected": "இணைக்கப்பட்டது",
        "status_nominal": "சாதாரணம்",
        "status_unverified": "சரிபார்க்கப்படவில்லை",
        "status_neutral": "நடுநிலை",
        "status_synthetic": "செயற்கைக் குரல் கண்டறியப்பட்டது",
        "status_replay": "ரீப்ளே கண்டறியப்பட்டது",
        "status_safe": "பாதுகாப்பானது",

        "call_transcript_title": "நேரலை குரல் உரை மற்றும் NLP",
        "call_transcript_ph": "குரல் கேட்க காத்திருக்கிறது...",

        "dock_mute": "ஒலி நிறுத்து",
        "dock_unmute": "ஒலி இயக்கு",
        "dock_push": "புஷ் சரிபார்ப்பு",
        "dock_block": "தடு",
        "dock_end": "முடி",

        "tab_shield": "பாதுகாப்பு",
        "tab_live_call": "அழைப்பு",
        "tab_circle": "வட்டம்",
        "tab_incidents": "சம்பவங்கள்",
        "tab_settings": "அமைப்புகள்",

        "trusted_title": "நம்பகமான வட்டம்",
        "trusted_sub": "பதிவுசெய்யப்பட்ட பயோமெட்ரிக் தளங்கள்",
        "btn_add_contact": "+ புதிய தொடர்பு",
        "tc_col_name": "பெயர்",
        "tc_col_status": "நிலை",
        "tc_col_enrolled": "தேதி",
        "tc_empty": "தொடர்புகள் ஏதுமில்லை. குடும்பத்தினரின் குரலை இணைக்கவும்.",

        "incidents_title": "சம்பவப் பதிவு",
        "incidents_sub": "பாதுகாப்பு பதிவு",
        "inc_empty": "சம்பவங்கள் எதுவும் பதிவாகவில்லை.",
        "inc_caller": "அழைப்பாளர்:",
        "inc_vector": "தாக்குதல் வகை:",
        "inc_trigger": "அச்சுறுத்தல்:",
        "inc_action": "நடவடிக்கை:",
        "inc_compliance": "DPDP சட்டம் 2023",
        "inc_zero_retention": "ஆடியோ சேமிக்கப்படவில்லை",

        "settings_title": "அமைப்புகள்",
        "settings_sub": "பாதுகாப்புக் கொள்கைகள்",
        "sec_appearance": "தோற்றம் மற்றும் தீம்",
        "theme_light_title": "லைட் தீம் (செயலில்)",
        "theme_dark_title": "டார்க் மோட் (செயலில்)",
        "theme_desc": "லைட் மோட் மற்றும் டார்க் தீம் இடையே மாற்றவும்.",
        "btn_toggle_theme": "தீம் மாற்று",

        "sec_language": "குரல் மற்றும் இடைமுக மொழி",
        "lang_desc": "குரல் அறிதல் மற்றும் ஒலி உங்கள் மொழிக்கு ஏற்ப மாற்றியமைக்கப்படுகிறது.",

        "sec_defense": "பாதுகாப்பு என்ஜின்",
        "aasist_title": "AASIST-v2 வரம்பு",
        "aasist_desc": "செயற்கைக் குரல் கண்டறிதல் வரம்பு",
        "ecapa_title": "ECAPA சரிபார்ப்பு",
        "ecapa_desc": "குரல் ஒற்றுமை வரம்பு",
        "filter_title": "ரீப்ளே வடிகட்டி",
        "filter_desc": "ஒலிபெருக்கி அதிர்வெண் வடிகட்டி",

        "sec_privacy": "தனியுரிமை",
        "retention_title": "பூஜ்ஜிய ஆடியோ சேமிப்பு",
        "retention_desc": "DPDP 2023 தற்காலிக ரேம் மட்டுமே",
        "purge_title": "பதிவு தானியங்கி அழிப்பு",
        "purge_desc": "பாதுகாப்பு பதிவுகளின் காலாவதி",

        "modal_enroll_title": "பயோமெட்ரிக் குரல் பதிவு",
        "modal_name_ph": "முழுப் பெயர்",
        "modal_phone_ph": "தொலைபேசி எண்",
        "modal_relation_ph": "உறவுமுறை",
        "btn_cancel": "ரத்து",
        "btn_save": "சேமி",

        "soc_title": "இரட்டை SOC தொலை அளவியல்",
        "soc_sub": "நரம்பியல் சிக்னல் குழாய்",
        "soc_spectral_density": "ஸ்பெக்ட்ரல் ஆற்றல் அடர்த்தி",
        "soc_harmonics": "ஹார்மோனிக்ஸ் பகுப்பாய்வு",
        "soc_stream": "நேரலை ஸ்ட்ரீம்",
        "soc_toggle_focus": "கவனம் பார்வை",
        "soc_toggle_dual": "இரட்டை பார்வை"
    },

    te: {
        "app_title": "వాక్స్‌షీల్డ్ మొబైల్",
        "app_badge": "v3.4 ప్రొడక్షన్",
        "app_tagline": "రియల్ టైమ్ మొబైల్ వాయిస్ బయోమెట్రిక్ రక్షణ",
        "device_protected": "పరికరం రక్షణ యాక్టివ్",
        "soc_telemetry": "SOC టెలిమెట్రీ",
        "island_active": "వాక్స్‌షీల్డ్ యాక్టివ్",
        "header_title": "వాక్స్‌షీల్డ్ గార్డ్",
        "header_sub": "బయోమెట్రిక్ కాల్ రక్షణ యాక్టివ్‌గా ఉంది",
        "stat_clone_acc": "క్లోన్ కచ్చితత్వం",
        "stat_latency": "లేటెన్సీ పరిమితి",
        "stat_dpdp": "జీరో ఆడియో స్టోర్డ్",
        "test_scenarios_title": "టెస్ట్ కాల్ దృశ్యాలు",
        "real_audio_badge": "నిజమైన ఆడియో",

        "sc_authentic_name": "ఆరవ్ శర్మ",
        "sc_authentic_tag": "నమోదైన వ్యక్తి",
        "sc_authentic_sub": "కుటుంబ సభ్యుడు • నిజమైన వాయిస్",

        "sc_deepfake_name": "AI వాయిస్ క్లోన్ స్కామ్",
        "sc_deepfake_tag": "అధిక ప్రమాదం",
        "sc_deepfake_sub": "నకిలీ కాలర్ • అత్యవసర డబ్బు డిమాండ్",

        "sc_replay_name": "వాయిస్ రీప్లే దాడి",
        "sc_replay_tag": "ట్రాన్స్‌డ్యూసర్ కటాఫ్",
        "sc_replay_sub": "రికార్డ్ చేసిన ఆడియో • OTP దొంగతనం",

        "sc_mic_name": "డైరెక్ట్ మైక్రోఫోన్ టెస్ట్",
        "sc_mic_tag": "హార్డ్‌వేర్ DSP",
        "sc_mic_sub": "మీ నిజమైన వాయిస్‌ని నేరుగా పరీక్షించండి",

        "dpdp_title": "DPDP చట్టం 2023 అనుకూలం",
        "dpdp_desc": "ఆడియో కేవలం తాత్కాలిక ర్యామ్‌లో మాత్రమే విశ్లేషించబడి వెంటనే తొలగించబడుతుంది.",

        "srtp_encrypted": "SRTP ఎన్‌క్రిప్టెడ్ కాల్",
        "call_status": "కాల్ స్థితి",
        "synthesis": "సింథసిస్ (AASIST)",
        "speaker": "వాయిస్ సరిపోలిక (ECAPA)",
        "replay": "రీప్లే గుర్తింపు",
        "semantic_vector": "ఆర్థిక ఒత్తిడి వెక్టర్",
        "status_idle": "సిద్ధంగా ఉంది",
        "status_connected": "కనెక్ట్ చేయబడింది",
        "status_nominal": "సాధారణం",
        "status_unverified": "ధృవీకరించబడలేదు",
        "status_neutral": "తటస్థం",
        "status_synthetic": "నకిలీ వాయిస్ గుర్తించబడింది",
        "status_replay": "రీప్లే గుర్తించబడింది",
        "status_safe": "సురక్షితమైనది",

        "call_transcript_title": "రియల్-టైమ్ వాయిస్ ట్రాన్స్‌క్రిప్ట్ & NLP",
        "call_transcript_ph": "వాయిస్ కోసం వేచి చూస్తోంది...",

        "dock_mute": "మ్యూట్",
        "dock_unmute": "అన్‌మ్యూట్",
        "dock_push": "పుష్ ధృవీకరణ",
        "dock_block": "కాల్ బ్లాక్",
        "dock_end": "కాల్ ముగించు",

        "tab_shield": "రక్షణ",
        "tab_live_call": "లైవ్ కాల్",
        "tab_circle": "సర్కిల్",
        "tab_incidents": "సంఘటనలు",
        "tab_settings": "సెట్టింగులు",

        "trusted_title": "విశ్వసనీయ సర్కిల్",
        "trusted_sub": "నమోదిత బయోమెట్రిక్ బేస్‌లైన్‌లు",
        "btn_add_contact": "+ కొత్త పరిచయం",
        "tc_col_name": "పేరు",
        "tc_col_status": "స్థితి",
        "tc_col_enrolled": "తేదీ",
        "tc_empty": "పరిచయాలు ఏవీ లేవు. మీ కుటుంబ సభ్యుల వాయిస్‌ని నమోదు చేయండి.",

        "incidents_title": "సంఘటనల లెడ్జర్",
        "incidents_sub": "రక్షణ లాగ్",
        "inc_empty": "ఎలాంటి భద్రతా సంఘటనలు నమోదు కాలేదు.",
        "inc_caller": "కాలర్ ID:",
        "inc_vector": "దాడి రకం:",
        "inc_trigger": "ఒత్తిడి సంకేతం:",
        "inc_action": "తీసుకున్న చర్య:",
        "inc_compliance": "DPDP చట్టం 2023",
        "inc_zero_retention": "ఆడియో తొలగించబడింది",

        "settings_title": "సెట్టింగులు",
        "settings_sub": "భద్రతా విధానాలు",
        "sec_appearance": "రూపురేఖలు & థీమ్",
        "theme_light_title": "లైట్ థీమ్ (యాక్టివ్)",
        "theme_dark_title": "డార్క్ మోడ్ (యాక్టివ్)",
        "theme_desc": "లైట్ మోడ్ మరియు డార్క్ థీమ్ మధ్య మారండి.",
        "btn_toggle_theme": "థీమ్ మార్చండి",

        "sec_language": "వాయిస్ & ఇంటర్‌ఫేస్ భాష",
        "lang_desc": "వాయిస్ గుర్తింపు మరియు ఉచ్చారణ మీ భాషకు అనుగుణంగా మారుతుంది.",

        "sec_defense": "డిఫెన్స్ ఇంజిన్",
        "aasist_title": "AASIST-v2 పరిమితి",
        "aasist_desc": "సింథటిక్ వాయిస్ కటాఫ్",
        "ecapa_title": "ECAPA ధృవీకరణ",
        "ecapa_desc": "వాయిస్ సరిపోలిక కొలత",
        "filter_title": "రీప్లే ఫిల్టర్",
        "filter_desc": "లౌడ్‌స్పీకర్ ఫ్రీక్వెన్సీ గుర్తింపు",

        "sec_privacy": "గోప్యత",
        "retention_title": "జీరో ఆడియో స్టోరేజ్",
        "retention_desc": "DPDP 2023 తాత్కాలిక ర్యామ్ మాత్రమే",
        "purge_title": "లాగ్ ఆటో-ఎక్స్‌పైరీ",
        "purge_desc": "క్రిప్టోగ్రాఫిక్ లాగ్ ముగింపు",

        "modal_enroll_title": "వాయిస్ ప్రొఫైల్ నమోదు చేయండి",
        "modal_name_ph": "పూర్తి పేరు",
        "modal_phone_ph": "ఫోన్ నంబర్",
        "modal_relation_ph": "సంబంధం",
        "btn_cancel": "రద్దు",
        "btn_save": "సేవ్ చేయండి",

        "soc_title": "ద్వంద్వ SOC టెలిమెట్రీ",
        "soc_sub": "రియల్ టైమ్ సిగ్నల్ ప్రాసెసింగ్",
        "soc_spectral_density": "స్పెక్ట్రల్ ఎనర్జీ",
        "soc_harmonics": "హార్మోనిక్స్ విశ్లేషణ",
        "soc_stream": "లైవ్ టెలిమెట్రీ స్ట్రీమ్",
        "soc_toggle_focus": "ఫోకస్ వ్యూ",
        "soc_toggle_dual": "డ్యూయల్ వ్యూ"
    },

    bn: {
        "app_title": "ভক্সশিল্ড মোবাইল",
        "app_badge": "v3.4 প্রোডাকশন",
        "app_tagline": "রিয়েল-টাইম ভয়েস বায়োমেট্রিক সুরক্ষা",
        "device_protected": "ডিভাইস সুরক্ষা সক্রিয়",
        "soc_telemetry": "এসওসি টেলিমেট্রি",
        "island_active": "ভক্সশিল্ড সক্রিয়",
        "header_title": "ভক্সশিল্ড গার্ড",
        "header_sub": "বায়োমেট্রিক কল সুরক্ষা সক্রিয় আছে",
        "stat_clone_acc": "ক্লোন নির্ভুলতা",
        "stat_latency": "বিলম্বতা কাটঅফ",
        "stat_dpdp": "জিরো অডিও সংরক্ষিত",
        "test_scenarios_title": "টেস্ট কল দৃশ্যপট",
        "real_audio_badge": "আসল অডিও",

        "sc_authentic_name": "আরভ শর্মা",
        "sc_authentic_tag": "নিবন্ধিত ব্যক্তি",
        "sc_authentic_sub": "পরিবারের সদস্য • বৈধ ভয়েস নমুনা",

        "sc_deepfake_name": "এআই ভয়েস ক্লোন স্ক্যাম",
        "sc_deepfake_tag": "উচ্চ ঝুঁকি",
        "sc_deepfake_sub": "নকল কলার • অবিলম্বে টাকার দাবি",

        "sc_replay_name": "অ্যাকোস্টিক রিপ্লে আক্রমণ",
        "sc_replay_tag": "স্পিকার কাটঅফ",
        "sc_replay_sub": "রেকর্ড করা অডিও • ওটিপি হাতিয়ে নেওয়া",

        "sc_mic_name": "সরাসরি মাইক্রোফোন পরীক্ষা",
        "sc_mic_tag": "হার্ডওয়্যার ডিএসপি",
        "sc_mic_sub": "ইঞ্জিনের মাধ্যমে আপনার আসল ভয়েস টেস্ট করুন",

        "dpdp_title": "ডিপিডিপি আইন ২০২৩ সম্মত",
        "dpdp_desc": "অডিও শুধুমাত্র অস্থায়ী র‍্যামে বিশ্লেষণ করে সাথে সাথে মুছে ফেলা হয়।",

        "srtp_encrypted": "এসআরটিপি এনক্রিপ্ট করা কল",
        "call_status": "কলের স্থিতি",
        "synthesis": "সিন্থেটিক সনাক্তকরণ (AASIST)",
        "speaker": "ভয়েস যাচাই (ECAPA)",
        "replay": "রিপ্লে সনাক্তকরণ",
        "semantic_vector": "আর্থিক চাপের মাত্রা",
        "status_idle": "প্রস্তুত",
        "status_connected": "সংযুক্ত (এনক্রিপ্ট)",
        "status_nominal": "স্বাভাবিক",
        "status_unverified": "যাচাইহীন",
        "status_neutral": "নিরপেক্ষ",
        "status_synthetic": "নকল ভয়েস শনাক্ত হয়েছে",
        "status_replay": "রিপ্লে শনাক্ত হয়েছে",
        "status_safe": "সুরক্ষিত ও নিরাপদ",

        "call_transcript_title": "রিয়েল-টাইম ভয়েস ট্রান্সক্রিপ্ট এবং এনএলপি",
        "call_transcript_ph": "ভয়েসের জন্য অপেক্ষা করা হচ্ছে...",

        "dock_mute": "মিউট",
        "dock_unmute": "আনমিউট",
        "dock_push": "পুশ যাচাই",
        "dock_block": "কল ব্লক",
        "dock_end": "কল শেষ",

        "tab_shield": "সুরক্ষা",
        "tab_live_call": "লাইভ কল",
        "tab_circle": "সার্কেল",
        "tab_incidents": "ঘটনা",
        "tab_settings": "সেটিংস",

        "trusted_title": "বিশ্বস্ত বৃত্ত",
        "trusted_sub": "নিবন্ধিত বায়োমেট্রিক বেসলাইন",
        "btn_add_contact": "+ নতুন যোগাযোগ",
        "tc_col_name": "নাম",
        "tc_col_status": "অবস্থা",
        "tc_col_enrolled": "তারিখ",
        "tc_empty": "কোনো পরিচিতি যোগ করা হয়নি। পরিবারের ভয়েস সুরক্ষিত করুন।",

        "incidents_title": "ঘটনা রেজিস্টার",
        "incidents_sub": "নিরাপত্তা লগ",
        "inc_empty": "কোনো নিরাপত্তা লঙ্ঘন রেকর্ড হয়নি।",
        "inc_caller": "কলার আইডি:",
        "inc_vector": "আক্রমণের ধরন:",
        "inc_trigger": "চাপের সংকেত:",
        "inc_action": "গৃহীত ব্যবস্থা:",
        "inc_compliance": "ডিপিডিপি আইন ২০২৩",
        "inc_zero_retention": "অডিও অবিলম্বে ধ্বংসকৃত",

        "settings_title": "সেটিংস",
        "settings_sub": "নিরাপত্তা নীতি",
        "sec_appearance": "চেহারা এবং থিম",
        "theme_light_title": "লাইট থিম (সক্রিয়)",
        "theme_dark_title": "ডার্ক মোড (সক্রিয়)",
        "theme_desc": "লাইট মোড এবং ডার্ক থিমের মধ্যে পরিবর্তন করুন।",
        "btn_toggle_theme": "থিম পরিবর্তন",

        "sec_language": "ভয়েস ও ইন্টারফেস ভাষা",
        "lang_desc": "স্পিচ রিকগনিশন এবং ভয়েস ইঞ্জিন আপনার ভাষায় অভিযোজিত হয়।",

        "sec_defense": "ডিফেন্স ইঞ্জিন",
        "aasist_title": "AASIST-v2 থ্রেশহোল্ড",
        "aasist_desc": "সিন্থেটিক ভয়েস ফিল্টার",
        "ecapa_title": "ECAPA স্পিকার যাচাই",
        "ecapa_desc": "ভয়েস ম্যাচিং সীমা",
        "filter_title": "রিপ্লে ফিল্টার",
        "filter_desc": "লাউডস্পিকার ফ্রিকোয়েন্সি সনাক্তকরণ",

        "sec_privacy": "গোপনীয়তা",
        "retention_title": "জিরো অডিও স্টোরেজ",
        "retention_desc": "ডিপিডিপি ২০২৩ অনুযায়ী অস্থায়ী র‍্যামে বিশ্লেষণ",
        "purge_title": "লগ স্বয়ংক্রিয় সমাপ্তি",
        "purge_desc": "নিরাপত্তা লগের মেয়াদ",

        "modal_enroll_title": "বায়োমেট্রিক প্রোফাইল নথিভুক্ত করুন",
        "modal_name_ph": "পুরো নাম",
        "modal_phone_ph": "ফোন নম্বর",
        "modal_relation_ph": "সম্পর্ক",
        "btn_cancel": "বাতিল",
        "btn_save": "সংরক্ষণ করুন",

        "soc_title": "দ্বৈত এসওসি টেলিমেট্রি",
        "soc_sub": "রিয়েল-টাইম নিউরাল সিগন্যাল",
        "soc_spectral_density": "বর্ণালী শক্তি ঘনত্ব",
        "soc_harmonics": "হারমোনিক্স বিশ্লেষণ",
        "soc_stream": "লাইভ টেলিমেট্রি স্ট্রিম",
        "soc_toggle_focus": "ফোকাস ভিউ",
        "soc_toggle_dual": "দ্বৈত ভিউ"
    }
};

class VoxI18n {
    constructor() {
        this.currentLang = localStorage.getItem("vox_lang") || "en";
    }

    t(key) {
        const langDict = window.VOX_TRANSLATIONS[this.currentLang] || window.VOX_TRANSLATIONS.en;
        if (langDict && langDict[key] !== undefined) {
            return langDict[key];
        }
        return window.VOX_TRANSLATIONS.en[key] || key;
    }

    setLanguage(lang) {
        if (!window.VOX_TRANSLATIONS[lang]) return;
        this.currentLang = lang;
        localStorage.setItem("vox_lang", lang);

        // 1. Update text elements
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            const translation = this.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // 2. Update placeholder attributes
        document.querySelectorAll("[data-i18n-ph]").forEach(el => {
            const key = el.getAttribute("data-i18n-ph");
            const translation = this.t(key);
            if (translation) {
                el.setAttribute("placeholder", translation);
            }
        });

        // 3. Update all language pill active states across topbar, mobile header, and settings
        document.querySelectorAll("[data-lang-select]").forEach(btn => {
            if (btn.getAttribute("data-lang-select") === lang) {
                btn.classList.add("active-lang");
            } else {
                btn.classList.remove("active-lang");
            }
        });

        // 4. Update audio engine speech recognition language and voices
        if (window.app && window.app.audioEngine) {
            window.app.audioEngine.setLanguage(lang);
        }

        // 5. Trigger dynamic app views update
        if (window.app && typeof window.app.onLanguageChange === "function") {
            window.app.onLanguageChange(lang);
        }

        console.log(`[VoxI18n] Language switched to: ${lang}`);
    }

    init() {
        // Wire all language selector buttons everywhere on the page
        document.querySelectorAll("[data-lang-select]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const lang = btn.getAttribute("data-lang-select");
                this.setLanguage(lang);
            };
        });

        this.setLanguage(this.currentLang);
    }
}

window.voxI18n = new VoxI18n();

// Auto-initialize when ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        window.voxI18n.init();
    });
} else {
    window.voxI18n.init();
}
