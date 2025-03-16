// 扑克牌花色
const suits = [
    { code: "S", symbol: "♠", order: 4 }, // 黑桃
    { code: "H", symbol: "♥", order: 3 }, // 红桃
    { code: "C", symbol: "♣", order: 2 }, // 梅花
    { code: "D", symbol: "♦", order: 1 }, // 方块
   
] as const;

// 定义花色优先级
const suitOrder: Record<string, number> = {
    "S": 4, // 黑桃
    "H": 3, // 红桃
    "C": 2, // 梅花
    "D": 1  // 方块
};

const values = [
    "2", "A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3",
] as const; // 2最大，其余从A-K依次递减
// 大小王
const jokers = [
    { code: "BJ", display: "🃏 小王" },
    { code: "RJ", display: "🃏 大王" },
] as const;

// 生成54张牌
export const deck: string[] = [
    ...suits.flatMap(({ code, symbol }) =>
        values.map(value => `${code}${value}`) // 例: "♠A", "♦10"
    ),
    ...jokers.map(({ code }) => code), // 小王 & 大王
];

// 🎴 **洗牌方法 (Fisher-Yates)**
export const shuffleDeck = (cards: string[]): string[] => {
    const shuffled = [...cards]; // 复制数组，防止修改原始数据
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 生成 0 ~ i 之间的随机索引
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 交换位置
    }
    return shuffled;
};
// 定义牌型
export enum CardType {
    SINGLE, // 单张
    SEQUENCE, // 顺子（连牌）
    UNKNOWN, // 未知牌型
}

const cardValueMap: Record<string, number> = {
    "RJ": 99, "BJ": 98, "A": 14, "K": 13, "Q": 12, "J": 11,
    "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2,
};

// 计算分值牌（5、10、K）
const scoreCards = new Set(["5", "10", "K"]);

// 获取单张牌的数值
const getCardValue = (card: string, trumpSuit: string, trumpPoint: string): number => {
    const value = card.slice(1); // 获取数值部分
    const suit = card.charAt(0); // 获取花色部分

    let score = cardValueMap[value] ?? 0;

    if (card === 'RJ' || card === 'RJ') {
        score = cardValueMap[card] ?? 0;
        return score;
    }

    // **无主（NT）模式时**
    if (trumpSuit === 'NT') {
        if (value === trumpPoint) {
            return 97; // 无主模式的主点牌直接赋值最高权重
        }
        return score;
    }

    // **区分主点牌和副点牌**
    const isTrumpPoint = value === trumpPoint;
    const isTrumpSuit = suit === trumpSuit;
    if (isTrumpPoint) {
        if (isTrumpSuit) {
            score = 97; // **主点牌**
        } else {
            score = 96; // **副点牌**
        }
    } else if (isTrumpSuit) {
        score = score + 5 * 13; // **主花色的其他牌**
    }
    return score;

};

// 获取第一次出牌的花色
export const getCardSuit = (cards: string[], trumpSuit: string, trumpPoint: string): string  => {

    const firstCard = cards[0]; // 获取第一张牌（应该取第一张，而不是最后一张）
    const suit = firstCard.charAt(0); // 获取花色（首字符）
    const value = firstCard.slice(1); // 获取点数部分
    // 判断是否是主牌（大小王 or 主点牌）
    if (value === trumpPoint || firstCard === "RJ" || firstCard === "BJ") {
        return trumpSuit !== "NT" ? trumpSuit : "NT";
    }
    return suit; // 返回正常花色

};

// 计算牌的分值
export const calculateScore = (cards: string[], trumpSuit: string, trumpPoint: string): number => {
    return cards.reduce((sum, card) => {
        const value = card.slice(1);
        return sum + (scoreCards.has(value) ? getCardValue(card, trumpSuit, trumpPoint) : 0);
    }, 0);
};
// 计算牌的分值
export const calculateScorPoint = (cards: string[], trumpSuit: string, trumpPoint: string): Record<string, number>  => {
    const cardMap: Record<string, number> = {}; 
     cards.map(card => {
        cardMap[card]= getCardValue(card, trumpSuit, trumpPoint) ;
    });
    return cardMap;
};

// 判断牌型
export const getCardType = (cards: string[], trumpSuit: string, trumpPoint: string): CardType => {
    if (cards.length === 1) return CardType.SINGLE;

    // 检测是否为顺子（必须按大小排序 & 无重复）
    const sortedValues = cards.map(c => getCardValue(c, trumpSuit, trumpPoint)).sort((a, b) => a - b);
    for (let i = 1; i < sortedValues.length; i++) {
        if (sortedValues[i] !== sortedValues[i - 1] + 1) return CardType.UNKNOWN;
    }
    return CardType.SEQUENCE;
};

// 比较两手牌的大小（同牌型）
export const compareCards = (
    hand1: string[],
    hand2: string[],
    trumpSuit: string, // 主牌花色，如 'S'（黑桃）
    trumpPoint: string // 主牌点数，如 '5'
): number => {
    // 计算 hand1 和 hand2 的总分
    const hand1Score = hand1.reduce((total, card) => total + getCardValue(card, trumpSuit, trumpPoint), 0);
    const hand2Score = hand2.reduce((total, card) => total + getCardValue(card, trumpSuit, trumpPoint), 0);
    console.log(hand1, hand1Score, hand2, hand2Score);
    return hand2Score > hand1Score ? 1 : 0;
};


// 判断是否为有效出牌
export const isValidPlay = (current: string[], previous: string[] | null, trumpSuit: string, trumpPoint: string): boolean => {
    if (!previous) return true; // 第一手牌可以随意出
    if (current.length !== previous.length) return false; // 长度不同不能出
    if (getCardType(current, trumpSuit, trumpPoint) !== getCardType(previous, trumpSuit, trumpPoint)) return false; // 牌型不同不能出
    //先出第一手需要的花色，没有则随意
    return true;
};



// 获取单张牌的数值
export const getCardOrderValue = (card: string, trumpSuit: string, trumpPoint: string): number => {
    const value = card.slice(1); // 获取数值部分
    const suit = card.charAt(0); // 获取花色部分
    let score = cardValueMap[value] ?? 0;
    if (card === 'RJ' || card === 'BJ') {
        score = cardValueMap[card] ?? 0;
        return score;
    }
    // **区分主点牌和副点牌**
    const isTrumpPoint = value === trumpPoint;
    const isTrumpSuit = suit === trumpSuit;

    if (isTrumpPoint) {
        if (isTrumpSuit) {
            score = 97; // **主点牌**
        } else {
            score = 96 - (4 - suitOrder[suit]);; // **副点牌**
        }
    } else if (isTrumpSuit) {
        score = score + 5 * 13
    } else {
        score = score + suitOrder[suit] * 13;
    }
    return score;
};

// 卡牌排序函数（基于分值 + 花色排序）
export const sortCards = (cards: string[], trumpSuit: string, trumpPoint: string): string[] => {
    return cards.sort((a, b) => {
        const valueA = getCardOrderValue(a, trumpSuit, trumpPoint);
        const valueB = getCardOrderValue(b, trumpSuit, trumpPoint);
        return valueB - valueA;
    });
};