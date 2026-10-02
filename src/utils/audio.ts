/**
 * Web Speech API native audio synthesis for English pronunciation
 */
class AudioPronunciationService {
  private synth: SpeechSynthesis | null = null;
  private englishVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer natural US/UK English voices
    const preferred = voices.find(
      (v) =>
        (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    );
    this.englishVoice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  public speak(text: string, rate: number = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // Stop any pending utterance
      const cleanText = text.replace(/_+/g, 'blank');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (this.englishVoice) {
        utterance.voice = this.englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const audioService = new AudioPronunciationService();
