'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import soundEffect from './SoundEffect';

type DeckAreaProps = {
    cards: string[];
    gamePhase: string;
    onDealComplete?: () => void;
    // 添加四个方向玩家出的牌
    northPlayedCards?: string[];
    eastPlayedCards?: string[];
    southPlayedCards?: string[];
    westPlayedCards?: string[];
};

export function DeckArea({
    cards,
    gamePhase,
    onDealComplete,
    northPlayedCards = [],
    eastPlayedCards = [],
    southPlayedCards = [],
    westPlayedCards = []
}: DeckAreaProps) {
    const [visibleCards, setVisibleCards] = useState < string[] > (cards);
    const [dealingCard, setDealingCard] = useState < {
        card: string;
        position: string;
        isAnimating: boolean;
    } | null > (null);

    // 处理发牌动画
    useEffect(() => {
        if (gamePhase === 'dealing' && cards.length > 0) {
            const positions = ['north', 'east', 'south', 'west'];
            let cardIndex = 0;
            let positionIndex = 0;

            // 预加载音效
            soundEffect.preloadSound('dealCard', '/sounds/deal-card.mp3');

            const dealInterval = setInterval(() => {
                if (cardIndex >= 52) { // 52张牌发完
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
                setDealingCard({
                    card: currentCard,
                    position: positions[positionIndex],
                    isAnimating: true
                });

                // 从可见牌堆中移除已发出的牌
                setVisibleCards(prev => prev.filter(card => card !== currentCard));

                // 更新索引
                positionIndex = (positionIndex + 1) % 4;
                cardIndex++;
            }, 200); // 每200毫秒发一张牌

            return () => clearInterval(dealInterval);
        }
    }, [gamePhase, cards, onDealComplete]);

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
                    <div className="text-green-100 font-medium mb-2">牌堆</div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        {visibleCards.length > 0 && (
                            <div className="absolute">
                                {/* 显示牌堆最上面的牌 */}
                                <Card card={visibleCards[0]} />

                                {/* 显示牌堆数量 */}
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                    {visibleCards.length}
                                </div>
                            </div>
                        )}

                        {/* 发牌动画 */}
                        {dealingCard && (
                            <div
                                className={`absolute transition-all duration-200 ${getPositionClass(dealingCard.position)}`}
                                onAnimationEnd={() => setDealingCard(null)}
                            >
                                <Card card={dealingCard.card} size="small" />
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