'use client';

import React from 'react';

type TrumpSelectionPanelProps = {
  onSelectTrump: (trumpSuit: string | null) => void;
  gamePhase: string;
  availableSuits: string[];
  trumpSuit: string[];
};

export function TrumpSelectionPanel({ onSelectTrump, gamePhase, availableSuits, trumpSuit }: TrumpSelectionPanelProps) {
  // 只在亮主阶段显示
  if (gamePhase !== 'trumpSelection') {
    //return null;
  }

  return (
    <div className="absolute bottom-4 left-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => trumpSuit.length === 0 ? onSelectTrump(null) : null}
            className={`w-10 h-10 ${trumpSuit.length === 0 ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-sm flex items-center justify-center`}
            title="无主"
            disabled={trumpSuit.length > 0}
          >
            NT
          </button>
          <button
            onClick={() => trumpSuit.length === 0 && availableSuits.includes('S') ? onSelectTrump('S') : null}
            className={`w-10 h-10 ${trumpSuit.length === 0 && availableSuits.includes('S') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="黑桃"
            disabled={trumpSuit.length > 0 || !availableSuits.includes('S')}
          >
            ♠️
          </button>
          <button
            onClick={() => trumpSuit.length === 0 && availableSuits.includes('H') ? onSelectTrump('H') : null}
            className={`w-10 h-10 ${trumpSuit.length === 0 && availableSuits.includes('H') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="红桃"
            disabled={trumpSuit.length > 0 || !availableSuits.includes('H')}
          >
            ♥️
          </button>
          <button
            onClick={() => trumpSuit.length === 0 && availableSuits.includes('C') ? onSelectTrump('C') : null}
            className={`w-10 h-10 ${trumpSuit.length === 0 && availableSuits.includes('C') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="梅花"
            disabled={trumpSuit.length > 0 || !availableSuits.includes('C')}
          >
            ♣️
          </button>
          <button
            onClick={() => trumpSuit.length === 0 && availableSuits.includes('D') ? onSelectTrump('D') : null}
            className={`w-10 h-10 ${trumpSuit.length === 0 && availableSuits.includes('D') ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'} text-white rounded-md transition-colors text-4xl flex items-center justify-center`}
            title="方块"
            disabled={trumpSuit.length > 0 || !availableSuits.includes('D')}
          >
            ♦️
          </button>
        </div>
      </div>
    </div>
  );
}