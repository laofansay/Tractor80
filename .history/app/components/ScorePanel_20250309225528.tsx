import React from 'react';
import { Position } from './constant/Constant';

interface ScorePanelProps {
  scores: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  dealerPosition: Position;
}

export function ScorePanel({ scores, dealerPosition }: ScorePanelProps) {
  // 计算庄家和闲家的总分
  const dealerScore = scores[dealerPosition];
  const nonDealerScore = Object.entries(scores)
    .filter(([position]) => position !== dealerPosition)
    .reduce((total, [_, score]) => total + score, 0);

  // 计算红蓝阵营的总分
  const redTeamScore = scores.north + scores.south;
  const blueTeamScore = scores.east + scores.west;

  return (
    <div className="absolute top-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">得分面板</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-red-400">红队 (北/南)</span>
            <span className="text-red-400 font-medium ml-4">{redTeamScore}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">蓝队 (东/西)</span>
            <span className="text-blue-400 font-medium ml-4">{blueTeamScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}