'use client';

import { useState } from 'react';
import { Card } from './Card';

type Position = 'north' | 'east' | 'south' | 'west';
type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';

type CardAreaProps = {
    position: Position;
    cards: string[];
    isDealer: boolean;
    gamePhase: GamePhase;
    onDeclare: () => void;
    onPlayCard: (card: string) => void;
};

export function CardArea({ position, cards, isDealer, gamePhase, onDeclare, onPlayCard }: CardAreaProps) {
    // 处理亮主
    const handleDeclare = () => {
        if (gamePhase === 'trumpSelection') {
            onDeclare();
        }
    };

    // 处理出牌
    const handlePlayCard = (card: string) => {
        if (gamePhase === 'playing') {
            onPlayCard(card);
        }
    };

    return (
        <div className="relative p-4 bg-green-700/30 rounded-xl backdrop-blur-sm border border-green-600/20 shadow-lg">
            <div className="flex flex-col items-center">
                <div className="mb-2 text-green-100 font-medium">
                    {position === 'north' && '北方玩家'}
                    {position === 'east' && '东方玩家'}
                    {position === 'south' && '南方玩家'}
                    {position === 'west' && '西方玩家'}
                    {isDealer && ' (庄家)'}
                </div>

                <div className="flex justify-center flex-wrap gap-1">
                    {cards.map((card, index) => (
                        <div key={index} onClick={() => handlePlayCard(card)}>
                            <Card card={card} />
                        </div>
                    ))}
                </div>

                {/* 亮主按钮 - 只在选择庄家阶段显示 */}
                {gamePhase === 'trumpSelection' && !isDealer && (
                    <button
                        onClick={handleDeclare}
                        className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-md transition-colors"
                    >
                        亮主
                    </button>
                )}

                {/* 扣底阶段提示 */}
                {gamePhase === 'bottomCards' && isDealer && (
                    <div className="mt-2 text-yellow-300 text-sm">
                        请选择6张牌扣底
                    </div>
                )}
            </div>
        </div>
    );
}