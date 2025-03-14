import React from 'react';
import { Card } from './Card';
import { Crown } from "lucide-react";
import { ScorePanelProps } from './constant/Constant';


export function ScorePanel({ points, rulingParty, redUpLevel, blueUpLevel }: ScorePanelProps) {



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
              {sorceCards && sorceCards.length && (
                sorceCards.map((card, index) => (
                  <div
                    key={index}
                    className='transform hover:translate-y-[-0.5rem] transition-transform translate-y-[-0.5rem] ring-2 ring-yellow-500/30 rounded-sm'
                  >
                    <Card card={card} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}