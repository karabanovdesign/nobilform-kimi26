import type { VoiceState } from "./types";

// ===== SPEECH RECOGNITION =====
export function createSpeechRecognizer(
  lang: string,
  onResult: (text: string, isFinal: boolean) => void,
  onError: (err: string) => void,
): SpeechRecognition | null {
  const SpeechRecognitionAPI =
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    onError("Speech recognition not supported");
    return null;
  }

  const rec = new SpeechRecognitionAPI();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = lang === "ro" ? "ro-RO" : "ru-RU";
  rec.maxAlternatives = 1;

  rec.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = "";
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript, true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  rec.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(event.error);
  };

  return rec;
}

// ===== SPEECH SYNTHESIS =====
export function speak(text: string, lang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ro" ? "ro-RO" : "ru-RU";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => {
      if (lang === "ro") return v.lang.includes("ro") || v.lang.includes("md");
      return v.lang.includes("ru") || v.lang.includes("uk");
    });
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ===== VOICE SUPPORT CHECK =====
export function isVoiceSupported(): boolean {
  const hasRecognition =
    "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  const hasSynthesis = "speechSynthesis" in window;
  return hasRecognition && hasSynthesis;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices();
    if (voices && voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis?.addEventListener("voiceschanged", () => {
      resolve(window.speechSynthesis.getVoices());
    }, { once: true });
  });
}
