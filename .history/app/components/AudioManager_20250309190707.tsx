'use client';

/**
 * 音频管理器类
 * 提供音效加载、播放和错误处理功能
 */
export class AudioManager {
  private static instance: AudioManager;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private fallbackMode: boolean = false;
  private audioEnabled: boolean = true;
  
  private constructor() {
    // 私有构造函数，确保单例模式
    this.checkAudioSupport();
  }
  
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  /**
   * 检查浏览器是否支持音频
   */
  private checkAudioSupport(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const audio = new Audio();
      this.audioEnabled = !!audio && typeof audio.play === 'function';
      if (!this.audioEnabled) {
        console.warn('当前环境不支持音频播放');
      }
    } catch (error) {
      console.error('检查音频支持时出错:', error);
      this.audioEnabled = false;
    }
  }
  
  /**
   * 预加载音效
   * @param soundId 音效ID
   * @param soundPath 音效文件路径
   * @param fallbackSoundPath 备用音效路径（可选）
   */
  public preloadSound(soundId: string, soundPath: string, fallbackSoundPath?: string): void {
    if (typeof window === 'undefined' || !this.audioEnabled) return;
    
    if (!this.audioElements.has(soundId)) {
      try {
        // 确保路径正确，添加基础URL前缀
        const fullPath = soundPath.startsWith('/') ? soundPath : `/${soundPath}`;
        const baseUrl = window.location.origin;
        const absolutePath = new URL(fullPath, baseUrl).toString();
        
        const audio = new Audio();
        audio.preload = 'auto';
        
        // 添加加载错误处理
        audio.addEventListener('error', (e) => {
          const errorDetails = {
            code: audio.error?.code,
            message: audio.error?.message,
            path: absolutePath
          };
          console.error(`音效 ${soundId} 加载失败:`, errorDetails);
          
          // 尝试加载备用音效
          if (fallbackSoundPath && !this.fallbackMode) {
            console.log(`尝试加载备用音效: ${fallbackSoundPath}`);
            this.fallbackMode = true;
            this.preloadSound(soundId, fallbackSoundPath);
          }
        });
        
        // 添加加载成功处理
        audio.addEventListener('canplaythrough', () => {
          console.log(`音效 ${soundId} 加载成功，可以播放`);
        });
        
        // 设置音频源
        audio.src = absolutePath;
        
        this.audioElements.set(soundId, audio);
      } catch (error) {
        console.error(`音效 ${soundId} 初始化失败:`, error);
      }
    }
  }
  
  /**
   * 播放音效
   * @param soundId 音效ID
   * @returns 是否成功播放
   */
  public playSound(soundId: string): boolean {
    if (typeof window === 'undefined' || !this.audioEnabled) return false;
    
    const audio = this.audioElements.get(soundId);
    if (audio) {
      // 检查音频是否已加载并可以播放
      if (audio.error) {
        console.error(`音效 ${soundId} 无法播放，加载失败:`, audio.error);
        return false;
      }
      
      // 检查音频是否已经加载足够的数据可以播放
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA or higher
        console.warn(`音效 ${soundId} 尚未加载完成，无法播放`);
        return false;
      }
      
      try {
        // 重置音频以便重复播放
        audio.currentTime = 0;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error(`播放音效 ${soundId} 失败:`, error);
          });
        }
        return true;
      } catch (error) {
        console.error(`播放音效 ${soundId} 时出错:`, error);
        return false;
      }
    } else {
      console.warn(`音效 ${soundId} 未预加载`);
      return false;
    }
  }
  
  /**
   * 停止播放音效
   * @param soundId 音效ID
   */
  public stopSound(soundId: string): void {
    if (typeof window === 'undefined' || !this.audioEnabled) return;
    
    const audio = this.audioElements.get(soundId);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.error(`停止音效 ${soundId} 时出错:`, error);
      }
    }
  }
  
  /**
   * 检查音效是否已加载并可以播放
   * @param soundId 音效ID
   * @returns 是否可以播放
   */
  public canPlaySound(soundId: string): boolean {
    if (typeof window === 'undefined' || !this.audioEnabled) return false;
    
    const audio = this.audioElements.get(soundId);
    if (!audio) return false;
    
    // 检查音频元素是否有错误
    if (audio.error) return false;
    
    // 检查音频是否已经加载足够的数据可以播放
    return audio.readyState >= 2; // HAVE_CURRENT_DATA or higher
  }
  
  /**
   * 启用或禁用所有音效
   * @param enabled 是否启用音效
   */
  public setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
  }
  
  /**
   * 获取音效是否启用
   * @returns 音效是否启用
   */
  public isAudioEnabled(): boolean {
    return this.audioEnabled;
  }
  
  /**
   * 创建一个简单的音效（用于在无法加载外部音效时使用）
   * @param frequency 频率（赫兹）
   * @param duration 持续时间（毫秒）
   * @param volume 音量（0-1）
   * @returns 音频元素
   */
  public createToneSound(frequency: number = 440, duration: number = 200, volume: number = 0.5): HTMLAudioElement | null {
    if (typeof window === 'undefined' || !this.audioEnabled) return null;
    
    try {
      // 检查是否支持Web Audio API
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn('当前浏览器不支持Web Audio API');
        return null;
      }
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      
      // 创建振荡器
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      // 创建音量控制
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      
      // 连接节点
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // 创建音频元素
      const audio = new Audio();
      
      // 开始振荡
      oscillator.start();
      
      // 设置定时器停止振荡
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, duration);
      
      return audio;
    } catch (error) {
      console.error('创建音效失败:', error);
      return null;
    }
  }
}

// 导出单例实例
export const audioManager = AudioManager.getInstance();