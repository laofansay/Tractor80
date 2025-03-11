import React from 'react';

interface ScorePanelProps {
  scores: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
}

export function ScorePanel({ scores }: ScorePanelProps) {
  return (
    <div className="absolute top-4 right-4 p-3 bg-gray-800/70 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="text-white text-sm mb-2 font-medium">得分面板</div>
        <div className="space-y-1">
          {Object.entries(scores).map(([position, score]) => (
            <div key={position} className="flex justify-between text-sm">
              <span className="text-gray-300">
                {position === 'north' ? '北方' :
                 position === 'south' ? '南方' :
                 position === 'east' ? '东方' : '西方'}
              </span>
              <span className="text-yellow-300 font-medium ml-4">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}