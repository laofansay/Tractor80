import { useState } from "react";
import { calculateScorPoint } from "../utils/poker";
import { Position } from "../components/constant/Constant";

// 出牌类型（支持多种组合）
export enum CardType {
    SINGLE = "单张",
    PAIR = "对子",
    TRACTOR = "拖拉机", // 连续的对子
}

// 卡牌类型的数量映射
export interface CardTypeGroup {
    cardType: CardType;
    total: number;
}

// 回合数据类型
export interface RoundState {
    leadingSuit: string; // 出牌花色
    cardTypeGroup: CardTypeGroup[]; // 出牌类型及其数量的数组
    leadingPlayer: Position; // 最大玩家
    roundNumber: number; // 回合数
}

// **React 组件 Hook 版本**
export function useGameRoundTracker() {
    // 使用 useState 管理 roundState
    const [roundState, setRoundState] = useState<RoundState>({
        leadingSuit: "",
        leadingPlayer: 'obs',
        cardTypeGroup: [],
        roundNumber: 0,
    });

    // 设置出牌花色
    const setLeadingSuit = (suit: string) => {
        setRoundState(prev => ({ ...prev, leadingSuit: suit }));
    };

    // 设置当前最大玩家
    const setLeadingPlayer = (player: Position) => {
        setRoundState(prev => ({ ...prev, leadingPlayer: player }));
    };

    const setCardGroup = (cards: string[], trumpSuit: string, trumpPoint: string) => {
        setRoundState(prev => ({ ...prev, cardTypeGroup: checkCardGroup(cards, trumpSuit, trumpPoint) }));
    };


    // 进入下一回合
    const nextRound = () => {
        setRoundState(prev => ({
            ...prev,
            roundNumber: prev.roundNumber + 1
        }));
    };
  // 进入下一回合
  const initRound = () => {
    setRoundState(prev => ({
        ...prev,
        roundNumber:0
    }));
};

    // 计算每种出牌的组合
    const checkCardGroup = (cards: string[], trumpSuit: string, trumpPoint: string): CardTypeGroup[] => {
        if (cards.length === 0) return [];

        // 统计牌的数量
        const cardMap: Record<string, number> = calculateScorPoint(cards, trumpSuit, trumpPoint);
        const pairCards: Record<string, number> = {};  // 记录对子
        const singleCards: Record<string, number> = {}; // 记录单张

        // 遍历 `cardMap` 进行分类（对子 & 单张）
        Object.entries(cardMap).forEach(([value, count]) => {
            const pairCount = Math.floor(count / 2);
            if (pairCount > 0) {
                pairCards[value] = pairCount; // 存入对子个数
            }
            if (count % 2 !== 0) {
                singleCards[value] = 1; // 余下的单张
            }
        });

        let result: CardTypeGroup[] = [];

        // 处理拖拉机
        const { groups, remainingPairs } = checkTractor(pairCards);
        result = result.concat(groups);

        // 处理对子
        result = result.concat(checkPair(remainingPairs));

        // 处理单张
        result = result.concat(checkSingle(singleCards));

        return result;
    };

    // 检查拖拉机（连续的对子）
    const checkTractor = (cardMap: Record<string, number>): { groups: CardTypeGroup[], remainingPairs: Record<string, number> } => {
        if (Object.keys(cardMap).length === 0) return { groups: [], remainingPairs: {} };

        // 获取对子牌值并排序
        let pairValues = Object.keys(cardMap)
            .map(Number)
            .sort((a, b) => a - b);

        let groups: CardTypeGroup[] = [];
        let remainingPairs: Record<string, number> = { ...cardMap };

        let tempTractor: number[] = [];

        for (let i = 0; i < pairValues.length; i++) {
            if (i > 0 && pairValues[i] === pairValues[i - 1] + 1) {
                tempTractor.push(pairValues[i]);
            } else {
                if (tempTractor.length > 1) {
                    groups.push({ cardType: CardType.TRACTOR, total: tempTractor.length * 2 });
                    tempTractor.forEach(value => {
                        delete remainingPairs[value];
                    });
                }
                tempTractor = [pairValues[i]];
            }
        }

        if (tempTractor.length > 1) {
            groups.push({ cardType: CardType.TRACTOR, total: tempTractor.length * 2 });
            tempTractor.forEach(value => {
                delete remainingPairs[value];
            });
        }

        return { groups, remainingPairs };
    };

    // 检查对子
    const checkPair = (cardMap: Record<string, number>): CardTypeGroup[] => {
        if (Object.keys(cardMap).length === 0) return [];

        let totalPairs = Object.keys(cardMap).length;
        return [{ cardType: CardType.PAIR, total: totalPairs }];
    };

    // 检查单张
    const checkSingle = (cardMap: Record<string, number>): CardTypeGroup[] => {
        if (Object.keys(cardMap).length === 0) return [];

        let totalSingles = Object.keys(cardMap).length;
        return [{ cardType: CardType.SINGLE, total: totalSingles }];
    };

    // 初始化显示所有牌
    const initializeCards = () => {
        // 在这里添加初始化显示所有牌的逻辑
    };

    // 发牌给4名玩家
    const dealCards = () => {
        // 在这里添加发牌给4名玩家的逻辑，并添加动画和音效
    };

    return {
        roundState,
        setLeadingSuit,
        setCardGroup,
        setLeadingPlayer,
        nextRound,
        initRound,
        initializeCards,
        dealCards,
    };
}
