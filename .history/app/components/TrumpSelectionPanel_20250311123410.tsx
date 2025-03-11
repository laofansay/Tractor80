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
    return null;
  }
  
  // 检查是否已经选择了主牌
  const hasTrumpSelected = trumpSuit !== '';
  
  return (
    <div className="absolute bottom-4 left-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">选择主牌花色</div>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => onSelectTrump('NT')}
            className={`w-10 h-10 ${(availableSuits.includes('J') || availableSuits.includes('B')) ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-sm flex items-center justify-center`}
            title="无主"
            disabled={hasTrumpSelected || !(availableSuits.includes('J') || availableSuits.includes('B'))}
          >
            NT
          </button>
          <button
            onClick={() => onSelectTrump('S')}
            className={`w-10 h-10 ${availableSuits.includes('S') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="黑桃"
            disabled={hasTrumpSelected || !availableSuits.includes('S')}
          >
            ♠️
          </button>
          <button
            onClick={() => onSelectTrump('H')}
            className={`w-10 h-10 ${availableSuits.includes('H') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="红桃"
            disabled={hasTrumpSelected || !availableSuits.includes('H')}
          >
            ♥️
          </button>
          <button
            onClick={() => onSelectTrump('C')}
            className={`w-10 h-10 ${availableSuits.includes('C') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="梅花"
            disabled={hasTrumpSelected || !availableSuits.includes('C')}
          >
            ♣️
          </button>
          <button
            onClick={() => onSelectTrump('D')}
            className={`w-10 h-10 ${availableSuits.includes('D') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="方块"
            disabled={hasTrumpSelected || !availableSuits.includes('D')}
          >
            ♦️
          </button>
        </div>
        {hasTrumpSelected && (
          <div className="text-green-400 text-xs mt-2">已选择主牌，等待进入下一阶段</div>
        )}
      </div>
    </div >
  );
}