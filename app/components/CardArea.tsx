'use client';

import { useState, useMemo } from 'react';
import { Card } from './Card';
import { sortCards } from '../utils/poker';


type CardAreaProps = {
    position: Position;
    cards: string[];
    isDealer: boolean;
    gamePhase: GamePhase;
    isCurrentPlayer?: boolean;
    trumpSuit?: string | null;
    trumpPoint?: string | null;
    isTrumpSuit?: boolean;
    isFirstPlayer?: boolean;
    isLeadingPlayer?: boolean;
    onDeclare: () => void;
    onPlayCard: (cards: string[]) => void;
    onSelectBottomCards?: (selectedCards: string[]) => void;
};



export function CardArea({ position, cards, isDealer, gamePhase, isCurrentPlayer = false,
    trumpSuit,
    trumpPoint,
    isTrumpSuit = false,
    isFirstPlayer = false,
    isLeadingPlayer = false,
    onPlayCard, onSelectBottomCards }: CardAreaProps) {
    // 用于跟踪扣底阶段选中的卡牌
    const [selectedCards, setSelectedCards] = useState < string[] > ([]);

    // 使用useMemo对卡牌进行排序，避免每次渲染都重新排序
    const sortedCards = useMemo(() => sortCards(cards, trumpSuit ?? 'NT', trumpPoint ?? '2'), [cards]);


    // 处理卡牌点击
    const handleCardClick = (card: string) => {
        if (gamePhase === 'playing' && isCurrentPlayer) {
            // 所有玩家选择卡牌后都需要点击出牌按钮
            if (selectedCards.includes(card)) {
                setSelectedCards(selectedCards.filter(c => c !== card));
            } else {
                setSelectedCards([...selectedCards, card]);
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
            // 将所有选中的牌一次性传递给onPlayCard
            onPlayCard(selectedCards);
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
        <div className={`relative p-4 bg-green-700/30 rounded-xl backdrop-blur-sm border border-green-600/20 shadow-lg ${position === 'east' || position === 'west' ? 'min-w-[100px] min-h-[400Px]' : ''
            } `}>
            <div className={`flex ${position === 'east' || position === 'west' ? 'flex-row items-center' : 'flex-col items-center'} `}>
                <div className={`${position === 'east' || position === 'west' ? 'mr-3' : 'mb-2'} text - green - 100 font - medium flex items - center gap - 2`}>
                    <span>
                        {position === 'north' && '北方玩家'}
                        {position === 'east' && '东方玩家'}
                        {position === 'south' && '南方玩家'}
                        {position === 'west' && '西方玩家'}
                        {isDealer && ' (庄家)'}
                    </span>
                    {isTrumpSuit && (
                        <div className='px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900'>
                            亮主
                        </div>
                    )}
                    {isFirstPlayer && (
                        <div className='px-2 py-0.5 rounded-full text-xs font-bold bg-blue-400 text-blue-900'>
                            首出
                        </div>
                    )}
                    {isLeadingPlayer && (
                        <div className='px-2 py-0.5 rounded-full text-xs font-bold bg-red-400 text-red-900'>
                            最大
                        </div>
                    )}
                </div>

                <div className={`flex justify - center items - center ${position === 'east' || position === 'west' ? 'flex-col space-y-[-2.5rem]' : 'space-x-[-1.5rem]'} overflow - x - auto py - 2 px - 4 min - h - [6rem]`}>                    {sortedCards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => handleCardClick(card)}
                        className={`transform ${position === 'east' ? 'rotate-90' : position === 'west' ? '-rotate-90' : ''} ${position === 'east' || position === 'west' ? 'hover:translate-x-[-0.5rem]' : 'hover:translate-y-[-0.5rem]'} transition - transform ${(gamePhase === 'bottomCards' || (gamePhase === 'playing' && isCurrentPlayer)) && selectedCards.includes(card) ? (position === 'east' || position === 'west' ? 'translate-x-[-0.5rem]' : 'translate-y-[-0.5rem]') + ' ring-2 ring-yellow-400' : ''} `}
                    >
                        <Card card={card} />
                    </div>
                ))}
                </div>


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



                {/* 当前出牌玩家指示器 */}
                {isCurrentPlayer && gamePhase === 'playing' && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                        当前出牌
                    </div>
                )}

                {/* 所有玩家出牌按钮 */}
                {gamePhase === 'playing' && isCurrentPlayer && selectedCards.length > 0 && (
                    <button
                        onClick={handlePlayCards}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors"
                    >
                        出牌
                    </button>
                )}
            </div>
        </div>
    );
}