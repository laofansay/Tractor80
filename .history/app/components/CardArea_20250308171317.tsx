'use client';

import { useState, useMemo } from 'react';
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

// 卡牌排序函数
const sortCards = (cards: string[]) => {
    // 定义花色顺序：大王(B)、小王(J)、黑桃(S)、红桃(H)、梅花(C)、方块(D)
    const suitOrder: Record<string, number> = {
        'B': 0, // 大王
        'J': 1, // 小王
        'S': 2, // 黑桃
        'H': 3, // 红桃
        'C': 4, // 梅花
        'D': 5  // 方块
    };

    // 定义点数顺序：A(1)最大，2最小
    const getCardValue = (value: string) => {
        if (value === '0') return 100; // 王牌
        const numValue = parseInt(value);
        // 将A设为最大，然后K、Q、J、10...2依次递减
        if (numValue === 1) return 14; // A牌
        if (numValue >= 11 && numValue <= 13) return numValue; // K、Q、J牌
        return numValue; // 其他牌
    };

    return [...cards].sort((a, b) => {
        const suitA = a.charAt(0);
        const suitB = b.charAt(0);
        const valueA = a.substring(1);
        const valueB = b.substring(1);

        // 先按花色排序
        if (suitA !== suitB) {
            return suitOrder[suitA] - suitOrder[suitB];
        }

        // 同花色按点数从大到小排序
        return getCardValue(valueB) - getCardValue(valueA);
    });
}
};

export function CardArea({ position, cards, isDealer, gamePhase, onDeclare, onPlayCard, onSelectBottomCards }: CardAreaProps) {
    // 用于跟踪扣底阶段选中的卡牌
    const [selectedCards, setSelectedCards] = useState < string[] > ([]);

    // 使用useMemo对卡牌进行排序，避免每次渲染都重新排序
    const sortedCards = useMemo(() => sortCards(cards), [cards]);

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

                <div className="flex justify-center items-center space-x-[-1.5rem] overflow-x-auto py-2 px-4 min-h-[6rem]">
                    {sortedCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(card)}
                            className={`transform hover:translate-y-[-0.5rem] transition-transform ${gamePhase === 'bottomCards' && selectedCards.includes(card) ? 'translate-y-[-0.5rem] ring-2 ring-yellow-400' : ''}`}
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