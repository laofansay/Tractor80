'use client';

import { useState } from 'react';
import { Card } from './Card';
import { GamePhase, Position } from './constant/Constant';

type AdminPanelProps = {
    onInitialize: () => void;
    onDeal: () => void;
    onPickBottomCards: () => void;
    onBottomCards: () => void;
    onStartPlaying: () => void;
    gamePhase: GamePhase;
    deckLength: number;
};

export function AdminPanel({
    onInitialize,
    onDeal,
    onPickBottomCards,
    onBottomCards,
    onStartPlaying,
    gamePhase,
    deckLength,
}: AdminPanelProps) {

    return (
        <div className="absolute bottom-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
            <div className="flex flex-col gap-2">
                <div className="text-white text-sm mb-2 font-medium">游戏控制面板</div>

                {(gamePhase === 'initial' || gamePhase === 'playing') && (
                    <button
                        onClick={onInitialize}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm"
                    >
                        {gamePhase === 'playing' ? '重新开始' : '初始化牌堆'}
                    </button>
                )}
                {(gamePhase === 'initial' ) && (
                    <button
                        onClick={onDeal}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors text-sm"
                    >
                        开始发牌
                    </button>
                )}
                {gamePhase === 'pickBottomCards' && (
                    <button
                        onClick={onPickBottomCards}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition-colors text-sm"
                    >
                        庄家拾底
                    </button>
                )}

                {gamePhase === 'bottomCards' && (
                    <button
                        onClick={onBottomCards}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition-colors text-sm"
                    >
                        庄家扣底
                    </button>
                )}

                <div className="text-gray-300 text-xs mt-2">
                    当前阶段:
                    {gamePhase === 'initial' && '初始化'}
                    {gamePhase === 'dealing' && '发牌中'}
                    {gamePhase === 'trumpSelection' && '亮主阶段'}
                    {gamePhase === 'pickBottomCards' && '庄家拾底'}
                    {gamePhase === 'bottomCards' && '庄家扣底'}
                    {gamePhase === 'playing' && '出牌阶段'}
                </div>
            </div>
        </div>
    );
}