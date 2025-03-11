'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
  availableSuits: string[];
  trumpSuit: string;
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase, availableSuits, trumpSuit }: TrumpSelectionPanelProps) {
  // 只在亮主阶段显示
  if (gamePhase !== 'trumpSelection') {
    //return null;
  }
  const selectTrump = (suit: string | null) => {
    console.log('玩家亮主:', suit);
    if (gamePhase !== 'trumpSelection') return;

    // 设置主牌花色
  }
  return (
    <div className="absolute bottom-4 left-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div>{availableSuits}</div>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => selectTrump('NT')}
            className={`w-10 h-10 ${(availableSuits.includes('J') || availableSuits.includes('B')) ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-sm flex items-center justify-center`}
            title="无主"
          >
            NT
          </button>
          <button
            onClick={() => selectTrump('S')}
            className={`w-10 h-10 ${availableSuits.includes('S') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="黑桃"
          >
            ♠️
          </button>
          <button
            onClick={() => selectTrump('H')}
            className={`w-10 h-10 ${availableSuits.includes('H') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="红桃"
          >
            ♥️
          </button>
          <button
            onClick={() => selectTrump('C')}
            className={`w-10 h-10 ${availableSuits.includes('C') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="梅花"
          >
            ♣️
          </button>
          <button
            onClick={() => onSelectTrump('D')}
            className={`w-10 h-10 ${availableSuits.includes('D') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="方块"
          >
            ♦️
          </button>
        </div>
      </div>
    </div >
  );
}