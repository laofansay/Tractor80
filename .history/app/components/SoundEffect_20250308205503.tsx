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
      try {
        // 确保路径正确，添加基础URL前缀
        const fullPath = soundPath.startsWith('/') ? soundPath : `/${soundPath}`;
        const baseUrl = window.location.origin;
        const absolutePath = new URL(fullPath, baseUrl).toString();
        
        const audio = new Audio(absolutePath);
        audio.preload = 'auto';
        
        // 添加加载错误处理
        audio.addEventListener('error', (e) => {
          const errorDetails = {
            code: audio.error?.code,
            message: audio.error?.message,
            path: absolutePath
          };
          console.error(`音效 ${soundId} 加载失败:`, errorDetails);
        });
        
        // 添加加载成功处理
        audio.addEventListener('canplaythrough', () => {
          console.log(`音效 ${soundId} 加载成功，可以播放`);
        });
        
        this.audioElements.set(soundId, audio);
      } catch (error) {
        console.error(`音效 ${soundId} 初始化失败:`, error);
      }
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
      // 检查音频是否已加载并可以播放
      if (audio.error) {
        console.error(`音效 ${soundId} 无法播放，加载失败:`, audio.error);
        return;
      }
      
      // 检查音频是否已经加载足够的数据可以播放
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA or higher
        console.warn(`音效 ${soundId} 尚未加载完成，无法播放`);
        return;
      }
      
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
  
  /**
   * 检查音效是否已加载并可以播放
   * @param soundId 音效ID
   * @returns 是否可以播放
   */
  public canPlaySound(soundId: string): boolean {
    if (typeof window === 'undefined') return false; // 服务器端不执行
    
    const audio = this.audioElements.get(soundId);
    if (!audio) return false;
    
    // 检查音频元素是否有错误
    if (audio.error) return false;
    
    // 检查音频是否已经加载足够的数据可以播放
    return audio.readyState >= 2; // HAVE_CURRENT_DATA or higher
  }
}

// 导出单例实例
export const soundEffect = SoundEffect.getInstance();