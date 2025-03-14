export type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';
export type Position = 'north' | 'east' | 'south' | 'west' | 'obs';
export type Camp = 'red' | 'blue';

export type Player = {
    cards: string[];
    isDealer: boolean;
    selectedCards?: string[];
    isBot?: boolean;
    isObs?: boolean;
    camp: Camp | null;
};


export interface Point {
    cards: string[]; // 存储分数卡牌信息
    scores: number;  // 该阵营的总分数
    swap: boolean,    //是否交换库庄家
    offsetLevel: number, //升级偏移值
}


export interface ScorePanelProps {
    points: {
      red: {
        scores: number;
        cards: any[];
      };
      blue: {
        scores: number;
        cards: any[];
      };
    };
    rulingParty: "red" | "blue" | string;
    redUpLevel: number;
    blueUpLevel: number;
  }

