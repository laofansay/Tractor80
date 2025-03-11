'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
  availableSuits: string;
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase, availableSuits, }: TrumpSelectionPanelProps) {
  // 只在亮主阶段显示
  if (gamePhase !== 'trumpSelection') {
    //return null;
  }

  return (
    <div className="absolute bottom-4 left-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => onSelectTrump(null)}
            className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors text-sm flex items-center justify-center"
            title="无主"
          >
            NT
          </button>
          <button
            onClick={() => onSelectTrump('S')}
            className={`w-10 h-10 ${availableSuits.includes('S') ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' : 'bg-gray-500 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="黑桃"
            disabled={!availableSuits.includes('S')}
          >
            ♠️
          </button>
          <button
            onClick={() => onSelectTrump('H')}
            className={`w-10 h-10 ${availableSuits.includes('H') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-red-400 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="红桃"
            disabled={!availableSuits.includes('H')}
          >
            ♥️
          </button>
          <button
            onClick={() => onSelectTrump('C')}
            className={`w-10 h-10 ${availableSuits.includes('C') ? 'bg-green-700 hover:bg-green-600 cursor-pointer' : 'bg-green-500 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="梅花"
            disabled={!availableSuits.includes('C')}
          >
            ♣️
          </button>
          <button
            onClick={() => onSelectTrump('D')}
            className={`w-10 h-10 ${availableSuits.includes('D') ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-blue-400 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
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