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
    onSelectBottomCards?: (selectedCards: string[]) => void;
};

export function CardArea({ position, cards, isDealer, gamePhase, onDeclare, onPlayCard, onSelectBottomCards }: CardAreaProps) {
    // 用于跟踪扣底阶段选中的卡牌
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    
    // 处理亮主
    const handleDeclare = () => {
        if (gamePhase === 'trumpSelection') {
            onDeclare();
        }
    };

    // 处理卡牌点击
    const handleCardClick = (card: string) => {
        if (gamePhase === 'playing') {
            onPlayCard(card);
        } else if (gamePhase === 'bottomCards' && isDealer) {
            // 在扣底阶段，处理卡牌选择
            if (selectedCards.includes(card)) {
                // 如果卡牌已经被选中，则取消选择
                setSelectedCards(selectedCards.filter(c => c !== card));
            } else {
                // 如果卡牌未被选中且未达到6张上限，则选择它
                if (selectedCards.length < 6) {
                    setSelectedCards([...selectedCards, card]);
                }
            }
        }
    };
    
    // 提交选中的底牌
    const handleSubmitBottomCards = () => {
        if (gamePhase === 'bottomCards' && isDealer && selectedCards.length === 6 && onSelectBottomCards) {
            onSelectBottomCards(selectedCards);
            setSelectedCards([]);
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
                        <div 
                            key={index} 
                            onClick={() => handleCardClick(card)}
                            className={`${gamePhase === 'bottomCards' && selectedCards.includes(card) ? 'transform scale-110 ring-2 ring-yellow-400' : ''}`}
                        >
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

                {/* 扣底阶段提示和按钮 */}
                {gamePhase === 'bottomCards' && isDealer && (
                    <div className="mt-2 flex flex-col items-center">
                        <div className="text-yellow-300 text-sm mb-1">
                            请选择6张牌扣底 ({selectedCards.length}/6)
                        </div>
                        {selectedCards.length === 6 && (
                            <button
                                onClick={handleSubmitBottomCards}
                                className="mt-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-md transition-colors"
                            >
                                确认扣底
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}