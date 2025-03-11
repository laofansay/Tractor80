'use client';

// 定义花色优先级
const suitOrder: Record<string, number> = {
    'B': 0, // 大王
    'J': 1, // 小王
    'S': 2, // 黑桃
    'H': 3, // 红桃
    'C': 4, // 梅花
    'D': 5  // 方块
};

// 获取牌的点数值
const getCardValue = (value: string): number => {
    if (value === '0') return 100; // 王牌
    const numValue = parseInt(value);
    return numValue === 1 ? 14 : numValue; // A为14点，其他牌按实际点数
};

/**
 * 比较两张牌的大小
 * @param card1 第一张牌
 * @param card2 第二张牌
 * @param trumpSuit 主牌花色（可选）
 * @returns number 1表示card1大，-1表示card2大，0表示相等
 */
export const compareCards = (card1: string[], card2: string[], trumpSuit?: string | null): number => {
    const suit1 = card1[0].charAt(0);
    const suit2 = card2[0].charAt(0);
    const value1 = card1[0].substring(1);
    const value2 = card2[0].substring(1);

    // 处理大小王的情况
    if (suit1 === 'B' || suit1 === 'J' || suit2 === 'B' || suit2 === 'J') {
        if (suit1 === 'B' && suit2 !== 'B') return 1;
        if (suit2 === 'B' && suit1 !== 'B') return -1;
        if (suit1 === 'J' && suit2 !== 'B') return 1;
        if (suit2 === 'J' && suit1 !== 'B') return -1;
        if (suit1 === suit2) return 0;
    }

    // 处理主牌的情况
    if (trumpSuit) {
        if (suit1 === trumpSuit && suit2 !== trumpSuit) return 1;
        if (suit2 === trumpSuit && suit1 !== trumpSuit) return -1;
    }

    // 如果花色相同，比较点数
    if (suit1 === suit2) {
        const value1Num = getCardValue(value1);
        const value2Num = getCardValue(value2);
        if (value1Num > value2Num) return 1;
        if (value1Num < value2Num) return -1;
        return 0;
    }

    // 不同花色，按花色优先级比较
    return suitOrder[suit2] - suitOrder[suit1];
};