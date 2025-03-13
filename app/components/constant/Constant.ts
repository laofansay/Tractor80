type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';
type Position = 'north' | 'east' | 'south' | 'west' | 'obs';
type Camp = 'red' | 'blue';

type Player = {
    cards: string[];
    isDealer: boolean;
    selectedCards?: string[];
    isBot?: boolean;
    isObs?: boolean;
    camp: Camp | null;
};


interface Point {
    cards: string[]; // 存储分数卡牌信息
    scores: number;  // 该阵营的总分数
    swap: boolean,    //是否交换库庄家
    offsetLevel: number, //升级偏移值
}


interface ScorePanelProps {
    points: Points;
    rulingParty: Camp,
    redUpLevel: string;
    blueUpLevel: string;

}
