'use client';

import React, { useEffect, useState } from 'react';
import { Position } from './constant/Constant';

type TrumpSelectionPanelProps = {
  onSwearTrump:(trumpSuit: string, position: Position) => void;
  gamePhase: string;
  availableSuits: string[];
  trumpSuit: string | null;

};

export function TrumpSelectionPanel({ onSwearTrump, gamePhase, availableSuits, trumpSuit, }: TrumpSelectionPanelProps) {
  return (
    <div className="absolute bottom-4 left-4 p-4 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-2"> 
          <button
            onClick={() => onSwearTrump('NT','south')}
            className={`w-12 h-12 ${(availableSuits.includes('R') || availableSuits.includes('B'))  ||  trumpSuit === 'NT' 
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-sm font-bold flex items-center justify-center`}
            title="无主"
            disabled={!(availableSuits.includes('R') || availableSuits.includes('B'))}
          >
            NT
          </button>
          <button
            onClick={() => onSwearTrump('S','south')}
            className={`w-12 h-12 ${availableSuits.includes('S') ||trumpSuit === 'S'
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center`}
            title="黑桃"
            disabled={!availableSuits.includes('S')}
          >
            ♠️
          </button>
          <button
            onClick={() => onSwearTrump('H','south')}
            className={`w-12 h-12 ${availableSuits.includes('H') ||trumpSuit === 'H'
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center`}
            title="红桃"
            disabled={!availableSuits.includes('H')}
          >
            ♥️
          </button>
          <button
            onClick={() => onSwearTrump('C','south')}
            className={`w-12 h-12 ${availableSuits.includes('C') ||trumpSuit === 'C'
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-md'
              : 'bg-gray-700 opacity-60 cursor-not-allowed'} 
              text-white rounded-md transition-colors text-3xl flex items-center justify-center`}
            title="梅花"
            disabled={!availableSuits.includes('C')}
          >
            ♣️
          </button>
          <button
            onClick={() => onSwearTrump('D','south')}
            className={`w-12 h-12 ${availableSuits.includes('D') ||trumpSuit === 'D'
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
