'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import soundEffect from './SoundEffect';
import { Position } from './constant/Constant';

type DeckAreaProps = {
    cards: string[];
    gamePhase: string;
    onDealComplete?: () => void;
    onDealCard?: (card: string, position: Position) => void;
    onDeclareTrump?: (card: string, position: Position) => void;
    northPlayedCards?: string[];
    eastPlayedCards?: string[];
    southPlayedCards?: string[];
    westPlayedCards?: string[];
};

export function DeckArea({
    cards,
    gamePhase,
    onDealComplete,
    onDealCard,
    onDeclareTrump,
    northPlayedCards = [],
    eastPlayedCards = [],
    southPlayedCards = [],
    westPlayedCards = []
}: DeckAreaProps) {
    const [visibleCards, setVisibleCards] = useState<string[]>(cards);
    const [dealingCard, setDealingCard] = useState<{
        card: string;
        position: string;
        isAnimating: boolean;
    } | null>(null);
    const [positionIndex, setPositionIndex] = useState(0);

    useEffect(() => {
        if (gamePhase === 'dealing' && cards.length > 0) {
            const positions: Position[] = ['north', 'east', 'south', 'west'];
            let cardIndex = 0;
            // 预加载音效
            soundEffect.preloadSound('dealCard', '/sounds/deal-card.mp3');
            const dealInterval = setInterval(() => {
                if (cardIndex >= 48) { // 发完48张牌
                    clearInterval(dealInterval);
                    setDealingCard(null);
                    if (onDealComplete) {
                        onDealComplete();
                    }
                    return;
                }
    
                // 播放发牌音效
                soundEffect.playSound('dealCard');
    
                // 设置当前发出的牌和目标位置
                const currentCard = cards[cardIndex];
                const targetPosition = positions[positionIndex];
    
                setDealingCard({
                    card: currentCard,
                    position: targetPosition,
                    isAnimating: true
                });
    
                console.log(`发牌: ${currentCard} -> ${targetPosition}`);
    
                // 通知父组件，给当前玩家发一张牌
                if (onDealCard) {
                    onDealCard(currentCard, targetPosition);
                }
    
                // 通知父组件进行亮主（如果需要）
                if (onDeclareTrump) {
                    onDeclareTrump(currentCard, targetPosition);
                }
    
                // 从可见牌堆中移除已发出的牌
                setVisibleCards(prev => prev.filter(card => card !== currentCard));
    
                // 轮流给下一个玩家发牌
                cardIndex++;
                setPositionIndex(prev => (prev + 1) % 4);
            }, 100); // 每200毫秒发一张牌
    
            return () => clearInterval(dealInterval);
        }
    }, [gamePhase, cards, onDealComplete, onDealCard, onDeclareTrump]);
    
   

    // 渲染玩家出的牌
    const renderPlayedCards = (cards: string[], position: string) => {
        if (!cards || cards.length === 0) return null;

        return (
            <div className="flex justify-center items-center">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`${position === 'east' ? 'rotate-90' : position === 'west' ? '-rotate-90' : ''} -mx-2 first:ml-0 last:mr-0`}
                    >
                        <Card card={card} size="small" />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className='relative p-4 bg-green-700/30 rounded-xl backdrop-blur-sm border border-green-600/20 shadow-lg min-h-[400px] flex flex-col justify-between'>
            {/* 北方玩家出牌区域 */}
            <div className="w-full flex justify-center mb-4">
                <div className="text-green-100 text-xs mb-1">北方出牌</div>
                {renderPlayedCards(northPlayedCards, 'north')}
            </div>

            <div className="flex justify-between items-center">
                {/* 西方玩家出牌区域 */}
                <div className="flex flex-col items-center mr-4">
                    <div className="text-green-100 text-xs mb-1">西方出牌</div>
                    {renderPlayedCards(westPlayedCards, 'west')}
                </div>

                {/* 中央牌堆区域 */}
                <div className="flex flex-col items-center">
                    <div className="text-green-100 font-medium mb-2 text-lg">牌堆</div>
                    <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-lg shadow-xl">
                        <div className="absolute">
                            {/* 显示牌堆最上面的牌 */}
                            <Card card={cards[0]} />
                            {/* 显示牌堆数量 */}
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold rounded-full w-8 h-8 flex items-center justify-center ring-2 ring-white">
                                {cards.length}
                            </div>
                        </div>

                        {/* 发牌动画 */}
                        {dealingCard && (
                            <div
                                className={`absolute transition-all duration-300 transform ${getPositionClass(dealingCard.position)} animate-card-deal`}
                                onAnimationEnd={() => setDealingCard(null)}
                            >
                                <Card card={dealingCard.card} size="small"  />
                            </div>
                        )}
                    </div>
                </div>


                {/* 东方玩家出牌区域 */}
                <div className="flex flex-col items-center ml-4">
                    <div className="text-green-100 text-xs mb-1">东方出牌</div>
                    {renderPlayedCards(eastPlayedCards, 'east')}
                </div>
            </div>

            {/* 南方玩家出牌区域 */}
            <div className="w-full flex justify-center mt-4">
                <div className="text-green-100 text-xs mb-1">南方出牌</div>
                {renderPlayedCards(southPlayedCards, 'south')}
            </div>
        </div>
    );
}

// 根据目标位置返回对应的CSS类
function getPositionClass(position: string): string {
    switch (position) {
        case 'north':
            return 'animate-fly-to-north';
        case 'east':
            return 'animate-fly-to-east';
        case 'south':
            return 'animate-fly-to-south';
        case 'west':
            return 'animate-fly-to-west';
        default:
            return '';
    }
}
