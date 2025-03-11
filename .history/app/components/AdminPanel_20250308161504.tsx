'use client';

import { useState } from 'react';

type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'bottomCards' | 'playing';

export function AdminPanel() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('initial');
  const [deckCards, setDeckCards] = useState<string[]>([]);
  const [bottomCards, setBottomCards] = useState<string[]>([]);
  
  // 初始化牌堆
  const initializeDeck = () => {
    const suits = ['H', 'D', 'S', 'C']; // 红桃、方块、黑桃、梅花
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
    
    let deck: string[] = [];
    
    // 生成52张普通牌
    suits.forEach(suit => {
      values.forEach(value => {
        deck.push(`${suit}${value}`);
      });
    });
    
    // 添加大小王
    deck.push('J0'); // 小王
    deck.push('B0'); // 大王
    
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    setDeckCards(deck);
    setGamePhase('initial');
  };
  
  // 发牌
  const dealCards = () => {
    // 这里需要与全局游戏状态关联，将牌发给四名玩家
    setGamePhase('dealing');
    // 模拟发牌过程
    setTimeout(() => {
      // 发牌结束后，剩余6张牌作为底牌
      setBottomCards(deckCards.slice(0, 6));
      setDeckCards([]);
      setGamePhase('trumpSelection');
    }, 2000);
  };
  
  // 庄家扣底
  const handleBottomCards = () => {
    setGamePhase('bottomCards');
    // 这里需要实现庄家查看底牌并选择扣底的逻辑
  };
  
  // 开始出牌
  const startPlaying = () => {
    setGamePhase('playing');
  };
  
  return (
    <div className="absolute bottom-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">游戏控制面板</div>
        
        {gamePhase === 'initial' && (
          <button 
            onClick={initializeDeck}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm"
          >
            初始化牌堆
          </button>
        )}
        
        {gamePhase === 'initial' && deckCards.length > 0 && (
          <button 
            onClick={dealCards}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors text-sm"
          >
            开始发牌
          </button>
        )}
        
        {gamePhase === 'trumpSelection' && (
          <button 
            onClick={handleBottomCards}
            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition-colors text-sm"
          >
            庄家扣底
          </button>
        )}
        
        {gamePhase === 'bottomCards' && (
          <button 
            onClick={startPlaying}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors text-sm"
          >
            开始出牌
          </button>
        )}
        
        <div className="text-gray-300 text-xs mt-2">
          当前阶段: 
          {gamePhase === 'initial' && '初始化'}
          {gamePhase === 'dealing' && '发牌中'}
          {gamePhase === 'trumpSelection' && '选择庄家'}
          {gamePhase === 'bottomCards' && '庄家扣底'}
          {gamePhase === 'playing' && '出牌阶段'}
        </div>
      </div>
    </div>
  );
}