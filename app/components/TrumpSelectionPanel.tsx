'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
  availableSuits: string[];
  trumpSuit: string;
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase, availableSuits, trumpSuit }: TrumpSelectionPanelProps) {
  // 检查是否已经选择了主牌
  const hasTrumpSelected = trumpSuit !== '';

  // 只在亮主阶段显示面板
  if (gamePhase !== 'trumpSelection') {
    //return null;
  }

  // 获取当前选中花色的显示名称
  const getTrumpSuitDisplay = () => {
    if (!trumpSuit) return '';

    const suitMap: Record<string, string> = {
      'NT': '无主',
      'S': '♠️ 黑桃',
      'H': '♥️ 红桃',
      'C': '♣️ 梅花',
      'D': '♦️ 方块'
    };

    return suitMap[trumpSuit] || '';
  };

  return (
    <div className="absolute bottom-4 left-4 p-4 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="text-white text-sm font-medium mb-1 flex justify-between items-center">
          <span>选择主牌花色</span>
          {hasTrumpSelected && (
            <span className="text-yellow-400 font-bold text-sm">
              已选: {getTrumpSuitDisplay()}
            </span>
          )}
        </div>

        <div className="flex flex-row gap-2">
          <button
            onClick={() => onSelectTrump('NT')}
            className={`w-12 h-12 ${(availableSuits.includes('J') || availableSuits.includes('B'))
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-sm font-bold flex items-center justify-center
              ${trumpSuit === 'NT' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800' : ''}`}
            title="无主"
            disabled={!(availableSuits.includes('J') || availableSuits.includes('B'))}
          >
            NT
          </button>
          <button
            onClick={() => onSelectTrump('S')}
            className={`w-12 h-12 ${availableSuits.includes('S')
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center
              ${trumpSuit === 'S' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800' : ''}`}
            title="黑桃"
            disabled={!availableSuits.includes('S')}
          >
            ♠️
          </button>
          <button
            onClick={() => onSelectTrump('H')}
            className={`w-12 h-12 ${availableSuits.includes('H')
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center
              ${trumpSuit === 'H' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800' : ''}`}
            title="红桃"
            disabled={!availableSuits.includes('H')}
          >
            ♥️
          </button>
          <button
            onClick={() => onSelectTrump('C')}
            className={`w-12 h-12 ${availableSuits.includes('C')
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center
              ${trumpSuit === 'C' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800' : ''}`}
            title="梅花"
            disabled={!availableSuits.includes('C')}
          >
            ♣️
          </button>
          <button
            onClick={() => onSelectTrump('D')}
            className={`w-12 h-12 ${availableSuits.includes('D')
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center
              ${trumpSuit === 'D' ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-gray-800' : ''}`}
            title="方块"
            disabled={!availableSuits.includes('D')}
          >
            ♦️
          </button>
        </div>
      </div>
    </div>
  );
}