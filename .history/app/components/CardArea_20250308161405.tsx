'use client';

import { useState } from 'react';
import { Card } from './Card';

type Position = 'north' | 'east' | 'south' | 'west';

type CardAreaProps = {
  position: Position;
};

export function CardArea({ position }: CardAreaProps) {
  const [cards, setCards] = useState<string[]>([]);
  const [isDealer, setIsDealer] = useState(false);
  
  // 玩家亮主成为庄家的函数
  const declareTrump = () => {
    // 只有在发牌阶段才能亮主
    // 这里需要与全局游戏状态关联
    setIsDealer(true);
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
            <Card key={index} card={card} />
          ))}
        </div>
        
        {/* 亮主按钮 */}
        <button 
          onClick={declareTrump}
          className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-md transition-colors"
          disabled={isDealer}
        >
          亮主
        </button>
      </div>
    </div>
  );
}