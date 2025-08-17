
export class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private currentTrack: string | null = null;
  private volume: number = 0.3;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getAudioPath(filename: string): string {
    const basePath = import.meta.env.MODE === 'production' ? '/green-escape-adventure-kids' : '';
    return `${basePath}/audio/${filename}`;
  }

  public async loadTrack(filename: string): Promise<void> {
    if (this.currentTrack === filename && this.audio) {
      return;
    }

    this.stop();
    
    return new Promise((resolve, reject) => {
      this.audio = new Audio();
      this.audio.src = this.getAudioPath(filename);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('canplaythrough', () => {
        this.currentTrack = filename;
        resolve();
      }, { once: true });

      this.audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        reject(new Error(`Failed to load audio: ${filename}`));
      }, { once: true });

      // Start loading
      this.audio.load();
    });
  }

  public async play(): Promise<void> {
    if (!this.audio || !this.isEnabled) return;

    try {
      await this.audio.play();
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.pause();
    }
  }

  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
