/**
 * Serviço de Text-to-Speech usando Web Speech API
 */
class TTSService {
  private synth: SpeechSynthesis | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    } else {
      console.warn('⚠️ Text-to-Speech não suportado neste navegador');
    }
  }

  /**
   * Fala um texto em português
   */
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): void {
    if (!this.synth || !this.enabled) {
      console.log('TTS desabilitado ou não suportado');
      return;
    }

    // Cancelar qualquer fala em andamento
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    // Tentar encontrar uma voz em português
    const voices = this.synth.getVoices();
    const ptVoice = voices.find(voice => voice.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      console.log('🔊 TTS iniciado:', text);
    };

    utterance.onend = () => {
      console.log('🔊 TTS concluído');
    };

    utterance.onerror = (event) => {
      console.error('❌ Erro no TTS:', event.error);
    };

    this.synth.speak(utterance);
  }

  /**
   * Para a fala atual
   */
  stop(): void {
    this.synth?.cancel();
  }

  /**
   * Ativa ou desativa o TTS
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Verifica se TTS está disponível
   */
  isAvailable(): boolean {
    return this.synth !== null;
  }

  /**
   * Carrega as vozes disponíveis (necessário em alguns navegadores)
   */
  loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve([]);
        return;
      }

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        this.synth.onvoiceschanged = () => {
          resolve(this.synth!.getVoices());
        };
      }
    });
  }
}

export const ttsService = new TTSService();
