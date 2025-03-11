'use client';

export class SoundEffect {
  private static instance: SoundEffect;
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  public static getInstance(): SoundEffect {
    if (!SoundEffect.instance) {
      SoundEffect.instance = new SoundEffect();
    }
    return SoundEffect.instance;
  }

  /**
   * 预加载音效
   * @param soundId 音效ID
   * @param soundPath 音效文件路径
   */
  public preloadSound(soundId: string, soundPath: string): void {
    if (typeof window === 'undefined') return; // 服务器端不执行
    
    if (!this.audioElements.has(soundId)) {
      const audio = new Audio(soundPath);
      audio.preload = 'auto';
      this.audioElements.set(soundId, audio);
    }
  }

  /**
   * 播放音效
   * @param soundId 音效ID
   */
  public playSound(soundId: string): void {
    if (typeof window === 'undefined') return; // 服务器端不执行
    
    const audio = this.audioElements.get(soundId);
    if (audio) {
      // 重置音频以便重复播放
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error(`播放音效 ${soundId} 失败:`, error);
      });
    } else {
      console.warn(`音效 ${soundId} 未预加载`);
    }
  }

  /**
   * 停止播放音效
   * @param soundId 音效ID
   */
  public stopSound(soundId: string): void {
    if (typeof window === 'undefined') return; // 服务器端不执行
    
    const audio = this.audioElements.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
}

// 导出单例实例
export const soundEffect = SoundEffect.getInstance();