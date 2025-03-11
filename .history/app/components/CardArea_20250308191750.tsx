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
    isCurrentPlayer?: boolean;
    onDeclare: () => void;
    onPlayCard: (card: string) => void;
    onSelectBottomCards?: (selectedCards: string[]) => void;
    onSkipTrump?: () => void;
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
};

export function CardArea({ position, cards, isDealer, gamePhase, isCurrentPlayer = false, onDeclare, onPlayCard, onSelectBottomCards }: CardAreaProps) {
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
    
    // 处理跳过亮主
    const handleSkipTrump = () => {
        if (gamePhase === 'trumpSelection' && isCurrentPlayer && onSkipTrump) {
            onSkipTrump();
        }
    };

    // 处理卡牌点击
    const handleCardClick = (card: string) => {
        if (gamePhase === 'playing') {
            if (isCurrentPlayer) {
                // 在出牌阶段，处理卡牌选择
                if (selectedCards.includes(card)) {
                    // 如果卡牌已经被选中，则取消选择
                    setSelectedCards(selectedCards.filter(c => c !== card));
                } else {
                    // 如果卡牌未被选中，则选择它
                    setSelectedCards([...selectedCards, card]);
                }
            } else {
                // 如果不是当前玩家，直接出牌
                onPlayCard(card);
            }
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

    // 处理出牌
    const handlePlayCards = () => {
        if (gamePhase === 'playing' && isCurrentPlayer && selectedCards.length > 0) {
            // 将选中的牌一张一张地传递给onPlayCard
            selectedCards.forEach(card => onPlayCard(card));
            // 清空选中的牌
            setSelectedCards([]);
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

                {/* 亮主按钮和跳过按钮 - 只在亮主阶段且是当前玩家时显示 */}
                {gamePhase === 'trumpSelection' && isCurrentPlayer && (
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleDeclare}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-md transition-colors"
                        >
                            亮主(成为庄家)
                        </button>
                        <button
                            onClick={handleSkipTrump}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors"
                        >
                            跳过
                        </button>
                    </div>
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

                {/* 出牌阶段的出牌按钮 */}
                {gamePhase === 'playing' && isCurrentPlayer && (
                    <div className="mt-2">
                        <button
                            onClick={handlePlayCards}
                            disabled={selectedCards.length === 0}
                            className={`px-3 py-1 text-xs rounded-md ${selectedCards.length > 0 ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                        >
                            出牌 ({selectedCards.length}张)
                        </button>
                    </div>
                )}

                {/* 当前出牌玩家指示器 */}
                {isCurrentPlayer && gamePhase === 'playing' && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                        当前出牌
                    </div>
                )}
            </div>
        </div>
    );
}