'use client';

import { useState } from 'react';
import { Card } from './Card';

type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';
type Position = 'north' | 'east' | 'south' | 'west';

type AdminPanelProps = {
    onInitialize: () => void;
    onDeal: () => void;
    onPickBottomCards: () => void;
    onBottomCards: () => void;
    onStartPlaying: () => void;
    gamePhase: GamePhase;
    deckLength: number;
    bottomCardsLength: number;
    lastRound?: Record<Position, string[]>;
    roundCount?: number;
};

export function AdminPanel({
    onInitialize,
    onDeal,
    onPickBottomCards,
    onBottomCards,
    onStartPlaying,
    gamePhase,
    deckLength,
    bottomCardsLength,
    lastRound = { north: [], east: [], south: [], west: [] },
    roundCount = 0
}: AdminPanelProps) {
    // 控制是否显示上一轮出牌记录
    const [showLastRound, setShowLastRound] = useState(false);

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

                {gamePhase === 'initial' && deckLength > 0 && (
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

                {gamePhase === 'bottomCards' && (
                    <button
                        onClick={onStartPlaying}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors text-sm"
                    >
                        开始出牌
                    </button>
                )}

                {/* 查看上一轮出牌按钮 - 只在出牌阶段且有上一轮记录时显示 */}
                {gamePhase === 'playing' && roundCount > 0 && (
                    <button
                        onClick={() => setShowLastRound(!showLastRound)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors text-sm"
                    >
                        {showLastRound ? '隐藏上一轮' : '查看上一轮'}
                    </button>
                )}

                {/* 显示上一轮出牌记录 */}
                {showLastRound && gamePhase === 'playing' && roundCount > 0 && (
                    <div className="mt-2 p-2 bg-gray-700/70 rounded-md">
                        <div className="text-yellow-300 text-xs mb-2">第{roundCount}轮出牌记录:</div>
                        {Object.entries(lastRound).map(([pos, cards]) => (
                            cards.length > 0 && (
                                <div key={pos} className="flex items-center justify-between text-xs text-white mb-1">
                                    <span>{pos === 'north' ? '北' : pos === 'south' ? '南' : pos === 'east' ? '东' : '西'}:</span>
                                    <div className="flex space-x-1">
                                        {cards.map((card, index) => (
                                            <div key={index} className="transform scale-50">
                                                <Card card={card} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
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