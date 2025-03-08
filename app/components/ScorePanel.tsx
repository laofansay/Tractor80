import React from 'react';

interface ScorePanelProps {
  scores: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  dealerPosition: Position;
}

type Position = 'north' | 'east' | 'south' | 'west';

export function ScorePanel({ scores, dealerPosition }: ScorePanelProps) {
  // 计算庄家和闲家的总分
  const dealerScore = scores[dealerPosition];
  const nonDealerScore = Object.entries(scores)
    .filter(([position]) => position !== dealerPosition)
    .reduce((total, [_, score]) => total + score, 0);

  return (
    <div className="absolute top-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">得分面板</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-yellow-300">庄家</span>
            <span className="text-yellow-300 font-medium ml-4">{dealerScore}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">闲家</span>
            <span className="text-yellow-300 font-medium ml-4">{nonDealerScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}