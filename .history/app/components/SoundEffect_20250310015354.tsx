'use client';

import { audioManager } from './AudioManager';

export class SoundEffect {
    static #instance;

    constructor() {
        // 私有构造函数，确保单例模式
    }

    public static getInstance(): SoundEffect {
        if (!SoundEffect.#instance) {
            SoundEffect.#instance = new SoundEffect();
        }
        return SoundEffect.#instance;
    }

    /**
     * 预加载音效
     * @param soundId 音效ID
     * @param soundPath 音效文件路径
     * @param fallbackSoundPath 备用音效路径（可选）
     */
    public preloadSound(soundId: string, soundPath: string, fallbackSoundPath?: string): void {
        if (typeof window === 'undefined') return; // 服务器端不执行

        // 使用AudioManager来处理音频加载
        audioManager.preloadSound(soundId, soundPath, fallbackSoundPath);
    }

    /**
     * 播放音效
     * @param soundId 音效ID
     * @returns 是否成功播放
     */
    public playSound(soundId: string): boolean {
        if (typeof window === 'undefined') return false; // 服务器端不执行

        // 使用AudioManager来处理音频播放
        return audioManager.playSound(soundId);
    }

    /**
     * 停止播放音效
     * @param soundId 音效ID
     */
    public stopSound(soundId: string): void {
        if (typeof window === 'undefined') return; // 服务器端不执行

        // 使用AudioManager来处理音频停止
        audioManager.stopSound(soundId);
    }

    /**
     * 检查音效是否已加载并可以播放
     * @param soundId 音效ID
     * @returns 是否可以播放
     */
    public canPlaySound(soundId: string): boolean {
        if (typeof window === 'undefined') return false; // 服务器端不执行

        // 使用AudioManager来检查音频是否可以播放
        return audioManager.canPlaySound(soundId);
    }
    
    /**
     * 启用或禁用所有音效
     * @param enabled 是否启用音效
     */
    public setAudioEnabled(enabled: boolean): void {
        audioManager.setAudioEnabled(enabled);
    }
    
    /**
     * 获取音效是否启用
     * @returns 音效是否启用
     */
    public isAudioEnabled(): boolean {
        return audioManager.isAudioEnabled();
    }
}

// 导出单例实例
export const soundEffect = SoundEffect.getInstance();