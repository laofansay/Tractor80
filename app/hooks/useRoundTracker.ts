import { useState } from "react";

// 出牌类型（支持多种组合）
export enum CardType {
    SINGLE = "单张",
    PAIR = "对子",
    TRACTOR = "拖拉机", // 连续的对子
}

// 卡牌类型的数量映射
export interface CardTypeGroup {
    cardType: CardType;
    count: number;
}

// 回合数据类型
export interface RoundState {
    leadingSuit: string; // 出牌花色
    cardTypeGroup: CardTypeGroup[]; // 出牌类型及其数量的数组
    leadingPlayer: string; // 最大玩家
    roundNumber: number; // 回合数
}

// **React 组件 Hook 版本**
export function useGameRoundTracker() {
    // 使用 useState 管理 roundState
    const [roundState, setRoundState] = useState<RoundState>({
        leadingSuit: "",
        leadingPlayer: "",
        cardTypeGroup: [],
        roundNumber: 1
    });

    // 设置出牌花色
    const setLeadingSuit = (suit: string) => {
        setRoundState(prev => ({ ...prev, leadingSuit: suit }));
    };

    // 设置当前最大玩家
    const setLeadingPlayer = (player: string) => {
        setRoundState(prev => ({ ...prev, leadingPlayer: player }));
    };

    // 计算每种出牌类型的数量
    const calculateCardTypeCount = (types: CardType[]): CardTypeGroup[] => {
        const countMap: { [key in CardType]?: number } = {};

        // 统计每个类型的数量
        types.forEach(type => {
            if (!countMap[type]) {
                countMap[type] = 0;
            }
            countMap[type]! += 1;
        });

        // 转换成对象数组
        return Object.entries(countMap).map(([key, count]) => ({
            cardType: key as CardType,
            count
        }));
    };

    // 计算每种出牌的组合
    const calculateCardType = (cards: string[]): CardTypeGroup[] => {

        if (cards.length === 0) return [];

        // 1. 统计牌的数量
        const cardMap: Record<string, number> = {};
        for (const card of cards) {
            const value = card.slice(1); // 取数值部分
            cardMap[value] = (cardMap[value] || 0) + 1;


            // 2. 分类统计
            const singleCards: string[] = []; // 单张
            const pairCards: string[] = []; // 对子
            const tripleCards: string[] = []; // 三张
            const fourCards: string[] = []; // 四张

            for (const [value, count] of Object.entries(cardMap)) {
                if (count === 1) singleCards.push(value);
                if (count === 2) pairCards.push(value);
                if (count === 3) tripleCards.push(value);
                if (count === 4) fourCards.push(value);
            }

            const result: CardTypeGroup[] = [];

            // 3. 先识别拖拉机（连续对子）
            pairCards.sort((a, b) => parseInt(a) - parseInt(b)); // 排序
            const tractors: string[][] = [];
            let tempTractor: string[] = [];

            for (let i = 0; i < pairCards.length; i++) {
                if (i > 0 && parseInt(pairCards[i]) === parseInt(pairCards[i - 1]) + 1) {
                    tempTractor.push(pairCards[i]);
                } else {
                    if (tempTractor.length > 1) tractors.push([...tempTractor]);
                    tempTractor = [pairCards[i]];
                }
            }
            if (tempTractor.length > 1) tractors.push(tempTractor);

            // 4. 处理不同的牌型
            if (tractors.length > 0) {
                if (tractors.length > 1) {
                    result.push({ cardType: CardType.N_TRACTOR, count: tractors.length }); // 不连续多个拖拉机
                } else {
                    result.push({ cardType: CardType.TRACTOR, count: tractors[0].length }); // 拖拉机
                }
            }

            // 5. 处理对子
            if (pairCards.length > 0) {
                if (tractors.length === 0) {
                    result.push({ cardType: CardType.N_PAIR, count: pairCards.length }); // 多个不连续对子
                }
            }

            // 6. 处理单张
            if (singleCards.length > 1) {
                result.push({ cardType: CardType.SHUAIPAI, count: singleCards.length }); // 连续单张
            } else if (singleCards.length === 1) {
                result.push({ cardType: CardType.SINGLE, count: 1 });
            }

            return result;
        };

        // 设置出牌类型（支持多个类型）及其数量
        const setCardTypes = (cards: string[]) => {
            setRoundState(prev => ({
                ...prev,
                cardTypeGroup: calculateCardType(cards)
            }));
        };

        // 进入下一回合
        const nextRound = () => {
            setRoundState(prev => ({ ...prev, roundNumber: prev.roundNumber + 1 }));
        };

        return {
            roundState,
            setLeadingSuit,
            setLeadingPlayer,
            setCardTypes,
            nextRound
        };
    }
