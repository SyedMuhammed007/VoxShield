/**
 * VoxShield — Audio Scenarios & Voice Dialogues
 * Contains pre-scripted, highly realistic voice call scenarios with real speech text,
 * acoustic parameters, telemetry progressions, and multi-lingual voice dialogues.
 * Supports: English (en), Hindi (hi), Tamil (ta), Telugu (te), and Bengali (bn).
 */

window.VOX_SCENARIOS = {
    authentic: {
        id: "authentic",
        name: "Authentic Contact (Sarah Miller)",
        caller_name: "Sarah Miller",
        relation: "Sister / Trusted Circle",
        phone: "+91 98765 43210",
        avatar: "SM",
        avatar_bg: "#10b981",
        voice_type: "human_natural",
        pitch_base: 218,
        speech_rate: 1.0,
        pitch_variance: 0.25,
        target_contact_id: "tc_01",
        description: "A genuine, casual phone call from an enrolled family member with natural prosody and matching voiceprint.",
        dialogues: [
            { text: "Hey! Are you free right now? I was thinking about lunch.", delay: 800 },
            { text: "I found this really great Italian place near the tech park you'd love.", delay: 3200 },
            { text: "Let me know if one o'clock works for you. No rush, talk soon!", delay: 3500 }
        ],
        dialogues_i18n: {
            en: [
                { text: "Hey! Are you free right now? I was thinking about lunch.", delay: 800 },
                { text: "I found this really great Italian place near the tech park you'd love.", delay: 3200 },
                { text: "Let me know if one o'clock works for you. No rush, talk soon!", delay: 3500 }
            ],
            hi: [
                { text: "नमस्ते! क्या आप अभी फ्री हैं? मैं लंच के बारे में सोच रही थी।", delay: 800 },
                { text: "मुझे टेक पार्क के पास एक बहुत बढ़िया रेस्टोरेंट मिला है जो आपको पसंद आएगा।", delay: 3200 },
                { text: "अगर दोपहर एक बजे का समय ठीक लगे तो मुझे बताइएगा। कोई जल्दी नहीं, जल्द बात करते हैं!", delay: 3500 }
            ],
            ta: [
                { text: "வணக்கம்! நீங்கள் இப்போது ஃப்ரீயா? மதிய உணவு பற்றி யோசித்துக்கொண்டிருந்தேன்.", delay: 800 },
                { text: "டெக் பார்க் அருகில் ஒரு நல்ல ரெஸ்டாரன்ட் பார்த்தேன், உங்களுக்கு மிகவும் பிடிக்கும்.", delay: 3200 },
                { text: "ஒரு மணிக்கு சரியா இருந்தால் சொல்லுங்கள். அவசரம் இல்லை, பிறகு பேசலாம்!", delay: 3500 }
            ],
            te: [
                { text: "నమస్తే! మీరు ఇప్పుడు ఖాళీగా ఉన్నారా? లంచ్ గురించి ఆలోచిస్తున్నాను.", delay: 800 },
                { text: "టెక్ పార్క్ దగ్గర మీకు బాగా నచ్చే ఒక మంచి రెస్టారెంట్ చూశాను.", delay: 3200 },
                { text: "ఒంటి గంటకి కుదిరితే చెప్పండి. తొందరేమీ లేదు, త్వరలో మాట్లాడుకుందాం!", delay: 3500 }
            ],
            bn: [
                { text: "হ্যালো! তুমি কি এখন ফ্রি আছো? লাঞ্চের কথা ভাবছিলাম।", delay: 800 },
                { text: "টেক পার্কের কাছে খুব সুন্দর একটা রেস্তোরাঁ পেয়েছি, তোমার ভালো লাগবে।", delay: 3200 },
                { text: "একটার সময় ঠিক হলে জানিও। কোনো তাড়া নেই, পরে কথা বলছি!", delay: 3500 }
            ]
        },
        telemetry_timeline: [
            { time: 1, deepfake: 3.2, speaker: 0.94, liveness: 0.97, context: "NORMAL_CASUAL", decision: "VERIFIED" },
            { time: 4, deepfake: 2.8, speaker: 0.95, liveness: 0.95, context: "NORMAL_CASUAL", decision: "VERIFIED" },
            { time: 8, deepfake: 4.1, speaker: 0.93, liveness: 0.96, context: "NORMAL_CASUAL", decision: "VERIFIED" }
        ]
    },

    deepfake_clone: {
        id: "deepfake_clone",
        name: "AI Voice Clone Scam (David Chen - CFO)",
        caller_name: "David Chen (Spoofed)",
        relation: "CFO / High Risk Impersonation",
        phone: "+91 91234 56789",
        avatar: "DC",
        avatar_bg: "#ef4444",
        voice_type: "ai_clone_robotic",
        pitch_base: 130,
        speech_rate: 1.15,
        pitch_variance: 0.04, // Unnaturally flat prosody typical of neural TTS
        target_contact_id: "tc_02",
        description: "An urgent financial emergency scam using an AI-cloned voice. Triggers AASIST synthetic detection, NLP financial context, and passive verification.",
        dialogues: [
            { text: "Hey, listen carefully. I'm in a huge emergency right now and my corporate card is blocked.", delay: 900 },
            { text: "I need you to authorize an immediate wire transfer of one lakh fifty thousand rupees to vendor account nine zero one right away.", delay: 3400 },
            { text: "If we don't clear this within twenty minutes, our servers will be shut down! Please do not call back, just transfer now!", delay: 3800 }
        ],
        dialogues_i18n: {
            en: [
                { text: "Hey, listen carefully. I'm in a huge emergency right now and my corporate card is blocked.", delay: 900 },
                { text: "I need you to authorize an immediate wire transfer of one lakh fifty thousand rupees to vendor account nine zero one right away.", delay: 3400 },
                { text: "If we don't clear this within twenty minutes, our servers will be shut down! Please do not call back, just transfer now!", delay: 3800 }
            ],
            hi: [
                { text: "ध्यान से सुनिए! मैं इस वक्त बहुत बड़ी इमरजेंसी में फंसा हूँ और मेरा कॉर्पोरेट कार्ड ब्लॉक हो गया है।", delay: 900 },
                { text: "मुझे वेंडर अकाउंट 901 में तुरंत एक लाख पचास हजार रुपये का वायर ट्रांसफर चाहिए, बिल्कुल अभी।", delay: 3400 },
                { text: "अगर बीस मिनट में पेमेंट नहीं हुआ तो हमारे सर्वर बंद हो जाएंगे! फोन मत करिए, तुरंत पैसे ट्रांसफर कीजिए!", delay: 3800 }
            ],
            ta: [
                { text: "கவனமாகக் கேளுங்கள்! நான் இப்போது பெரும் அவசரச் சிக்கலில் உள்ளேன், எனது கார்டு முடக்கப்பட்டுள்ளது.", delay: 900 },
                { text: "வெண்டர் கணக்கு 901-க்கு உடனடியாக ஒரு லட்சத்து ஐம்பதாயிரம் ரூபாயை உடனே அனுப்ப வேண்டும்.", delay: 3400 },
                { text: "இருபது நிமிடங்களில் பணம் செலுத்தவில்லை என்றால் சர்வர் முடக்கப்படும்! மீண்டும் அழைக்க வேண்டாம், உடனே அனுப்புங்கள்!", delay: 3800 }
            ],
            te: [
                { text: "జాగ్రత్తగా వినండి! నేను ప్రస్తుతం పెద్ద ఎమర్జెన్సీలో ఉన్నాను, నా కార్పొరేట్ కార్డ్ బ్లాక్ అయింది.", delay: 900 },
                { text: "వెండర్ అకౌంట్ 901 కి వెంటనే ఒక లక్ష యాభై వేల రూపాయల వైర్ ట్రాన్స్ఫర్ చెయ్యాలి.", delay: 3400 },
                { text: "ఇరవై నిమిషాల్లో చెల్లించకపోతే సర్వర్లు షట్ డౌన్ అవుతాయి! ఫోన్ చేయకండి, వెంటనే ట్రాన్స్ఫర్ చేయండి!", delay: 3800 }
            ],
            bn: [
                { text: "মন দিয়ে শুনুন! আমি এখন খুব বড় বিপদে পড়েছি এবং আমার কর্পোরেট কার্ড ব্লক হয়ে গেছে।", delay: 900 },
                { text: "ভেন্ডার অ্যাকাউন্ট ৯০১-এ এখনই দেড় লাখ টাকা অবিলম্বে ট্রান্সফার করতে হবে।", delay: 3400 },
                { text: "কুড়ি মিনিটের মধ্যে টাকা না দিলে আমাদের সার্ভার বন্ধ হয়ে যাবে! ফোন করবেন না, এখনই ট্রান্সফার করুন!", delay: 3800 }
            ]
        },
        telemetry_timeline: [
            { time: 1, deepfake: 78.4, speaker: 0.65, liveness: 0.72, context: "URGENCY_DETECTED", decision: "VERIFICATION REQUIRED" },
            { time: 4, deepfake: 96.8, speaker: 0.58, liveness: 0.61, context: "FINANCIAL_TRANSFER_INR_150000", decision: "IMPERSONATION DETECTED" },
            { time: 8, deepfake: 98.9, speaker: 0.52, liveness: 0.54, context: "HIGH_STAKES_EXTORTION", decision: "IMPERSONATION DETECTED" }
        ],
        triggers_challenge: false,
        triggers_trusted_channel: true,
        channel_alert_details: {
            contact_name: "David Chen (Real Device)",
            amount: "INR 1,50,000",
            purpose: "Emergency Vendor Settlement",
            target_account: "ICICI ...9014"
        }
    },

    replay_attack: {
        id: "replay_attack",
        name: "Pre-recorded Replay Attack (KYC Bot)",
        caller_name: "Secure Bank Verification Bot",
        relation: "Unverified / Telecom Spoof",
        phone: "+91 98000 11223",
        avatar: "RB",
        avatar_bg: "#f59e0b",
        voice_type: "replay_loop",
        pitch_base: 175,
        speech_rate: 0.95,
        pitch_variance: 0.02,
        target_contact_id: null,
        description: "A pre-recorded acoustic replay attack attempting to harvest OTPs. Silero VAD flags the absence of natural breathing dynamics.",
        dialogues: [
            { text: "Automated alert from Federal Security Desk. Your bank account access has been temporarily restricted.", delay: 800 },
            { text: "To unlock your account, please read out the six-digit one-time password sent to your registered mobile number now.", delay: 3600 },
            { text: "Failure to verify your one-time password within sixty seconds will result in permanent account suspension.", delay: 3800 }
        ],
        dialogues_i18n: {
            en: [
                { text: "Automated alert from Federal Security Desk. Your bank account access has been temporarily restricted.", delay: 800 },
                { text: "To unlock your account, please read out the six-digit one-time password sent to your registered mobile number now.", delay: 3600 },
                { text: "Failure to verify your one-time password within sixty seconds will result in permanent account suspension.", delay: 3800 }
            ],
            hi: [
                { text: "केंद्रीय सुरक्षा डेस्क से स्वचालित चेतावनी। आपके बैंक खाते तक पहुंच को अस्थायी रूप से रोक दिया गया है।", delay: 800 },
                { text: "खाता सक्रिय करने के लिए, अपने पंजीकृत मोबाइल नंबर पर आया छह अंकों का वन-टाइम पासवर्ड बोलें।", delay: 3600 },
                { text: "साठ सेकंड के भीतर ओटीपी सत्यापित न करने पर आपका खाता स्थायी रूप से निलंबित कर दिया जाएगा।", delay: 3800 }
            ],
            ta: [
                { text: "வங்கிப் பாதுகாப்புப் பிரிவிலிருந்து தானியங்கி எச்சரிக்கை. உங்கள் வங்கிக் கணக்கு தற்காலிகமாக முடக்கப்பட்டுள்ளது.", delay: 800 },
                { text: "கணக்கை மீண்டும் இயக்க, பதிவுசெய்த எண்ணிற்கு வந்த ஆறு இலக்க ஒருமுறை கடவுச்சொல்லைக் கூறுங்கள்.", delay: 3600 },
                { text: "அறுபது வினாடிகளுக்குள் கடவுச்சொல்லை உறுதிப்படுத்தாவிட்டால் கணக்கு நிரந்தரமாக ரத்து செய்யப்படும்.", delay: 3800 }
            ],
            te: [
                { text: "సెక్యూరిటీ డెస్క్ నుండి ఆటోమేటెడ్ హెచ్చరిక. మీ బ్యాంక్ ఖాతా యాక్సెస్ తాత్కాలికంగా నిలిపివేయబడింది.", delay: 800 },
                { text: "ఖాతాను పునరుద్ధరించడానికి, రిజిస్టర్డ్ నంబర్‌కు వచ్చిన ఆరు అంకెల వన్-టైమ్ పాస్‌వర్డ్‌ను చదవండి.", delay: 3600 },
                { text: "అరవై సెకన్లలో ఓటీపీ ధృవీకరించకపోతే మీ ఖాతా శాశ్వతంగా సస్పెండ్ చేయబడుతుంది.", delay: 3800 }
            ],
            bn: [
                { text: "ব্যাংক সুরক্ষা ডেস্ক থেকে স্বয়ংক্রিয় সতর্কতা। আপনার ব্যাংক অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে।", delay: 800 },
                { text: "অ্যাকাউন্ট চালু করতে আপনার নিবন্ধিত মোবাইলে পাঠানো ছয় অঙ্কের ওটিপি পাসওয়ার্ডটি বলুন।", delay: 3600 },
                { text: "ষাট সেকেন্ডের মধ্যে ওটিপি যাচাই না করলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করে দেওয়া হবে।", delay: 3800 }
            ]
        },
        telemetry_timeline: [
            { time: 1, deepfake: 45.2, speaker: 0.40, liveness: 0.28, context: "ACCOUNT_ALERT", decision: "VERIFICATION REQUIRED" },
            { time: 4, deepfake: 62.0, speaker: 0.35, liveness: 0.12, context: "OTP_CREDENTIAL_HARVESTING", decision: "IMPERSONATION DETECTED" },
            { time: 8, deepfake: 68.5, speaker: 0.31, liveness: 0.08, context: "HIGH_RISK_PHISHING", decision: "IMPERSONATION DETECTED" }
        ],
        triggers_challenge: false,
        triggers_trusted_channel: false
    },

    live_mic: {
        id: "live_mic",
        name: "Live Microphone (Your Real Voice)",
        caller_name: "Live User Mic Feed",
        relation: "Hardware DSP Mode",
        phone: "LOCAL_AUDIO_INPUT",
        avatar: "MC",
        avatar_bg: "#0ea5e9",
        voice_type: "live_microphone",
        pitch_base: 180,
        speech_rate: 1.0,
        pitch_variance: 0.3,
        target_contact_id: null,
        description: "Captures your actual voice from your microphone in real-time, extracting live acoustic features, pitch contours, and performing live speech recognition in your selected language!",
        dialogues: [
            { text: "[Speak into your microphone now to test live voice detection, pitch tracking, and speech transcription]", delay: 0 }
        ],
        dialogues_i18n: {
            en: [{ text: "[Speak into your microphone now to test live voice detection, pitch tracking, and speech transcription]", delay: 0 }],
            hi: [{ text: "[लाइव वॉयस डिटेक्शन, पिच ट्रैकिंग और स्पीच ट्रांसक्रिप्शन के लिए अपने माइक्रोफोन में बोलें]", delay: 0 }],
            ta: [{ text: "[நேரலை குரல் கண்டறிதல், சுருதி கண்காணிப்பு மற்றும் உரை மொழிபெயர்ப்பை சோதிக்க மைக்ரோஃபோனில் பேசுங்கள்]", delay: 0 }],
            te: [{ text: "[లైవ్ వాయిస్ డిటెక్షన్, పిచ్ ట్రాకింగ్ మరియు స్పీచ్ ట్రాన్స్‌క్రిప్షన్‌ని పరీక్షించడానికి మైక్రోఫోన్‌లో మాట్లాడండి]", delay: 0 }],
            bn: [{ text: "[লাইভ ভয়েস শনাক্তকরণ, পিচ ট্র্যাকিং এবং স্পিচ ট্রান্সক্রিপশন পরীক্ষা করতে মাইক্রোফোনে কথা বলুন]", delay: 0 }]
        },
        telemetry_timeline: []
    }
};
