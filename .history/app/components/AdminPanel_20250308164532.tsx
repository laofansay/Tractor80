'use client';

import { useState } from 'react';

type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';

type AdminPanelProps = {
  onInitialize: () => void;
  onDeal: () => void;
  onPickBottomCards: () => void;
  onBottomCards: () => void;
  onStartPlaying: () => void;
  gamePhase: GamePhase;
  deckLength: number;
  bottomCardsLength: number;
};

export function AdminPanel({
  onInitialize,
  onDeal,
  onBottomCards,
  onStartPlaying,
  gamePhase,
  deckLength,
  bottomCardsLength
}: AdminPanelProps) {
  
  return (
    <div className="absolute bottom-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">游戏控制面板</div>
        
        {gamePhase === 'initial' && (
          <button 
            onClick={onInitialize}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm"
          >
            初始化牌堆
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
        
        {gamePhase === 'trumpSelection' && (
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