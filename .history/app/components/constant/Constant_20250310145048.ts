

//   initial: 洗牌
// - dealing: 发牌，亮主
// - trumpSelection: 反主
// - pickBottomCards: 庄家拾底阶段，庄家查看底牌
// - bottomCards: 庄家扣底阶段，庄家选择要扣下的牌
//--炒底
// - playing: 出牌阶段，玩家轮流出牌进行游戏

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