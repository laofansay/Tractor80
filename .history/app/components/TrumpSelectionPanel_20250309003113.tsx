'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase }: TrumpSelectionPanelProps) {
  // 只在亮主阶段显示
  if (gamePhase !== 'trumpSelection') {
    //return null;
  }

  return (
    <div className="absolute bottom-4 left-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-row">

        <button
          onClick={() => onSelectTrump(null)}
          className="w-10 h-10 bg-white hover:bg-slate-100 text-black rounded-md transition-colors text-xm flex items-center justify-center"
          title="升级"
        >
          2/2
        </button>
        <button
          onClick={() => onSelectTrump(null)}
          className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors text-sm flex items-center justify-center"
          title="无主"
        >
          NT
        </button>
        <button
          onClick={() => onSelectTrump('S')}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors text-4xl flex items-center justify-center"
          title="黑桃"
        >
          ♠️
        </button>
        <button
          onClick={() => onSelectTrump('H')}
          className="w-10 h-10 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors text-4xl flex items-center justify-center"
          title="红桃"
        >
          ♥️
        </button>
        <button
          onClick={() => onSelectTrump('C')}
          className="w-10 h-10 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors text-4xl flex items-center justify-center"
          title="梅花"
        >
          ♣️
        </button>
        <button
          onClick={() => onSelectTrump('D')}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-4xl flex items-center justify-center"
          title="方块"
        >
          ♦️
        </button>
      </div>
    </div>
  );
}