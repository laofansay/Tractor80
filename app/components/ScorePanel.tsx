import React from 'react';
import { Card } from './Card';
import { Crown } from "lucide-react";
import { ScorePanelProps } from './constant/Constant';
import { Position } from './constant/Constant';
import { useState } from 'react';


export function ScorePanel({ points, rulingParty, redUpLevel, blueUpLevel, lastRound }: ScorePanelProps & { lastRound?: Record<Position, string[]> }) {
  const [showLastRound, setShowLastRound] = useState(false);



  // 计算红蓝阵营的总分
  const redTeamScore = points.red.scores;
  const blueTeamScore = points.blue.scores;
  const sorceCards = ["red", "blue"].includes(rulingParty) ? points[rulingParty === 'red' ? 'blue' : 'red'].cards : [];
  return (
    <div className="absolute top-4 right-4 p-4 bg-gray-800/80 rounded-lg backdrop-blur-md border border-gray-700/50 shadow-xl">
      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          <h3 className="text-white text-sm font-medium mb-2 text-center">阵营得分</h3>
          {/* 红队信息 */}
          <div className="flex justify-between items-center text-sm border-b border-gray-700/70 pb-2">
            <div className="flex items-center space-x-2">
              {rulingParty === "red" && <Crown className="text-yellow-400 w-4 h-4 animate-pulse" />}
              <span className="text-red-400 font-semibold">红队 (北/南){redTeamScore}/{redUpLevel}</span>
            </div>
          </div>

          {/* 蓝队信息 */}
          <div className="flex justify-between items-center text-sm pt-2">
            <div className="flex items-center space-x-2">
              {rulingParty === "blue" && <Crown className="text-yellow-400 w-4 h-4 animate-pulse" />}
              <span className="text-blue-400 font-semibold">蓝队 (东/西){blueTeamScore}/{blueUpLevel}</span>
            </div>
          </div>

          {/* 得分卡片区域 */}
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <div className="flex justify-center items-center space-x-[-1.5rem] overflow-x-auto py-2 px-2 min-h-[6rem]">
              {sorceCards?.map((card, index) => (
                  <div
                    key={index}
                    className="transform hover:translate-y-[-0.25rem] transition-transform">
                    <Card card={card} />
                  </div>
                )
              )}
            </div>
          </div>

          {/* 上一轮卡牌按钮和展示区域 */}
          {lastRound && (
            <div className="mt-4 pt-2 border-t border-gray-700/50">
              <button
                onClick={() => setShowLastRound(!showLastRound)}
                className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
              >
                {showLastRound ? '隐藏上一轮' : '查看上一轮'}
              </button>
              
              {showLastRound && (
                <div className="mt-2 space-y-2">
                  {Object.entries(lastRound).map(([position, cards]) => (
                    cards.length > 0 && (
                      <div key={position} className="flex flex-col space-y-1">
                        <span className="text-gray-400 text-xs">
                          {position === 'north' && '北方'}
                          {position === 'east' && '东方'}
                          {position === 'south' && '南方'}
                          {position === 'west' && '西方'}
                        </span>
                        <div className="flex space-x-[-1rem] overflow-x-auto py-1">
                          {cards.map((card, index) => (
                            <div key={index} className="transform hover:translate-y-[-0.25rem] transition-transform">
                              <Card card={card} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}