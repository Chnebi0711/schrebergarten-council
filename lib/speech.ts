export interface VoiceConfig {
  pitch: number;           // 0–2 (1 = normal)
  rate: number;            // 0.1–10 (1 = normal)
  preferredNames: string[];    // English — partial matches tried in order
  preferredNamesDE?: string[]; // German  — partial matches tried in order
}

export const AGENT_VOICE_CONFIG: Record<string, VoiceConfig> = {
  // English: Microsoft voices first (Windows/Edge), Google voices as Chrome fallback.
  // German:  Microsoft Online voices first (Katja/Conrad), then desktop voices,
  //          then Google Deutsch, then any available de-DE voice.

  pollinator: {
    pitch: 1.5, rate: 1.05,
    preferredNames:   ["Aria", "Zira", "Maisie", "UK English Female", "US English"],
    preferredNamesDE: ["Petra", "Hedda", "Katja", "Deutsch"],
  },
  soil: {
    pitch: 0.55, rate: 0.72,
    preferredNames:   ["Guy", "David", "Mark", "Eric", "US English"],
    preferredNamesDE: ["Stefan", "Conrad", "Markus", "Deutsch"],
  },
  hedgehog: {
    pitch: 1.25, rate: 1.05,
    preferredNames:   ["Michelle", "Ana", "Jenny", "US English"],
    preferredNamesDE: ["Anna", "Katja", "Hedda", "Deutsch"],
  },
  snail: {
    pitch: 0.75, rate: 0.65,
    preferredNames:   ["George", "Brian", "Oliver", "UK English Male", "US English"],
    preferredNamesDE: ["Stefan", "Conrad", "Yannick", "Deutsch"],
  },
  biodiversity: {
    pitch: 1.2, rate: 0.74,
    preferredNames:   ["Fiona", "Moira", "Libby", "Phoebe", "Hollie", "UK English Female", "US English"],
    preferredNamesDE: ["Hedda", "Katja", "Petra", "Anna", "Deutsch"],
  },
  neighbor: {
    pitch: 0.72, rate: 0.84,
    preferredNames:   ["Thomas", "Ryan", "Oliver", "UK English Male", "US English"],
    preferredNamesDE: ["Conrad", "Stefan", "Markus", "Yannick", "Deutsch"],
  },
  moderator: {
    pitch: 1.05, rate: 0.82,
    preferredNames:   ["Sonia", "Emma", "Olivia", "Libby", "UK English Female", "US English"],
    preferredNamesDE: ["Katja", "Anna", "Petra", "Hedda", "Deutsch"],
  },
};

function getVoice(config: VoiceConfig, lang = "en"): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Filter to the right language family
  const langPrefix  = lang === "de" ? "de" : "en";
  const langVoices  = voices.filter((v) => v.lang.startsWith(langPrefix));

  // Pick the preferred name list
  const names = lang === "de"
    ? (config.preferredNamesDE ?? [])
    : config.preferredNames;

  // Try preferred names in order (partial, case-insensitive match)
  for (const name of names) {
    const match = langVoices.find((v) =>
      v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (match) return match;
  }

  // Fall back to any voice in the target language, then any voice at all
  return langVoices[0] ?? voices[0] ?? null;
}

/**
 * Unlock speech synthesis on iOS — must be called directly inside a user
 * gesture handler (e.g. button click). Speaks a silent utterance so that
 * subsequent async calls are not blocked by iOS's autoplay policy.
 */
export function unlockSpeech(): void {
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore — not all browsers expose speechSynthesis
  }
}

export function speak(
  text: string,
  agentId: string,
  onEnd?: () => void,
  lang = "en"
): SpeechSynthesisUtterance {
  window.speechSynthesis.cancel();

  const config    = AGENT_VOICE_CONFIG[agentId] ?? AGENT_VOICE_CONFIG.moderator;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch  = config.pitch;
  utterance.rate   = config.rate;
  utterance.volume = 1;

  const setVoiceAndSpeak = () => {
    const voice = getVoice(config, lang);
    if (voice) utterance.voice = voice;
    console.log(
      `[Speech][${lang}] ${agentId} → "${voice?.name ?? "browser default"}" (pitch ${config.pitch}, rate ${config.rate})`
    );

    if (onEnd) {
      // iOS often does not fire onend — use onerror + a duration-based timeout
      // as fallbacks so speakAsync always resolves and the council can continue.
      const wordCount    = text.trim().split(/\s+/).length;
      const estimatedMs  = Math.max(2500, (wordCount / (140 * config.rate)) * 60_000) + 2000;

      let finished = false;
      const finish = () => { if (!finished) { finished = true; onEnd(); } };

      utterance.onend  = finish;
      utterance.onerror = finish;
      setTimeout(finish, estimatedMs);
    }

    window.speechSynthesis.speak(utterance);
  };

  // Voices may not be loaded yet — wait if needed.
  // On iOS, voiceschanged may never fire — fall back after 500 ms.
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak();
  } else {
    let voicesFired = false;
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      if (!voicesFired) { voicesFired = true; setVoiceAndSpeak(); }
    }, { once: true });
    setTimeout(() => {
      if (!voicesFired) { voicesFired = true; setVoiceAndSpeak(); }
    }, 500);
  }

  return utterance;
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}
