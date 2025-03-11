'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase }: TrumpSelectionPanelProps) {
  // 只在亮主阶段显示
  if (gamePhase !== 'trumpSelection') {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-40 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">选择主牌花色</div>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onSelectTrump(null)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          >
            NT (无主)
          </button>
          <button
            onClick={() => onSelectTrump('S')}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          >
            ♠️ 黑桃
          </button>
          <button
            onClick={() => onSelectTrump('H')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          >
            ♥️ 红桃
          </button>
          <button
            onClick={() => onSelectTrump('C')}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          >
            ♣️ 梅花
          </button>
          <button
            onClick={() => onSelectTrump('D')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          >
            ♦️ 方块
          </button>
        </div>
      </div>
    </div>
  );
}