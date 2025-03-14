// 扑克牌花色
export enum Suit {
    NT = "NT",
    S = "S",
    H = "H",
    D = "D",
    C = "C",
    NONE="NONE"
}

export const suitProperties: Record<Suit, { symbol: string; order: number }> = {
    [Suit.NT]: { symbol: "NT", order: 5 },
    [Suit.S]: { symbol: "♠", order: 4 },
    [Suit.H]: { symbol: "♥", order: 3 },
    [Suit.D]: { symbol: "♦", order: 2 },
    [Suit.C]: { symbol: "♣", order: 1 },
    [Suit.NONE]: { symbol: "-", order: 0 }
} as const;

// **快速转换字符串到 Suit 类型**
const suitMap: Record<string, Suit> = {
    "NT": Suit.NT, "S": Suit.S, "H": Suit.H, "D": Suit.D, "C": Suit.C
};

export const convertToSuit = (s: string): Suit => {
    if (suitMap[s]) return suitMap[s];
    throw new Error(`Invalid suit string: ${s}`);
};

const values = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

// **大小王**
const jokers = [
    { code: "BJ", display: "🃏 小王" },
    { code: "RJ", display: "🃏 大王" },
] as const;

// **生成54张牌**
export const deck: string[] = [
    ...Object.entries(suitProperties).flatMap(([suit, { symbol }]) =>
        values.map(value => `${symbol}${value}`)
    ),
    ...jokers.map(({ code }) => code)
];

// **洗牌方法 (Fisher-Yates)**
export const shuffleDeck = (cards: string[]): string[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// **牌型**
export enum CardType {
    SINGLE,
    SEQUENCE,
    UNKNOWN
}

// **牌面分值**
const cardValueMap: Record<string, number> = {
    "RJ": 99, "BJ": 98, "A": 14, "K": 13, "Q": 12, "J": 11,
    "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2,
};

// **分数牌**
export const scoreCards = new Set(["5", "10", "K"]);

// **获取牌值**
export const getCardValue = (card: string, trumpSuit: Suit, trumpPoint: string): number => {
    if (card in cardValueMap) return cardValueMap[card]; // 大小王直接返回值

    const value = card.slice(1);
    const suit = convertToSuit(card.charAt(0));
    let score = cardValueMap[value] ?? 0;

    if (trumpSuit === Suit.NT) {
        return value === trumpPoint ? 97 : score;
    }

    if (value === trumpPoint) {
        return suit === trumpSuit ? 97 : 96;
    }

    return suit === trumpSuit ? score + 5 * 13 : score;
};

// **获取第一张牌的花色**
export const getCardSuit = (cards: string[], trumpSuit: Suit, trumpPoint: string): Suit  => {
    if (!cards.length) return Suit.NONE ;
    const [firstCard] = cards;
    const suit = firstCard.charAt(0);
    const value = firstCard.slice(1);

    if (value === trumpPoint || firstCard === "RJ" || firstCard === "BJ") {
        return Suit.NT ;
    }

    return convertToSuit(suit);
};

// **计算总分**
export const calculateScore = (cards: string[], trumpSuit: Suit, trumpPoint: string): number =>
    cards.reduce((sum, card) => sum + (scoreCards.has(card.slice(1)) ? getCardValue(card, trumpSuit, trumpPoint) : 0), 0);

// **获取单牌权重**
export const getCardOrderValue = (card: string, trumpSuit: Suit, trumpPoint: string): number => {
    if (card in cardValueMap) return cardValueMap[card];

    const value = card.slice(1);
    const suit = convertToSuit(card.charAt(0));
    let score = cardValueMap[value] ?? 0;

    if (value === trumpPoint) {
        return suit === trumpSuit ? 97 : 96 - (4 - suitProperties[trumpSuit].order) * 13;
    }

    return suit === trumpSuit ? score + 5 * 13 : score;
};

// **牌型判断**
export const getCardType = (cards: string[], trumpSuit: Suit, trumpPoint: string): CardType => {
    if (cards.length === 1) return CardType.SINGLE;

    const sortedValues = cards.map(c => getCardValue(c, trumpSuit, trumpPoint)).sort((a, b) => a - b);
    return sortedValues.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1) ? CardType.SEQUENCE : CardType.UNKNOWN;
};

// **出牌是否合法**
export const isValidPlay = (current: string[], previous: string[] | null, trumpSuit: Suit, trumpPoint: string): boolean =>
    !previous || (current.length === previous.length && getCardType(current, trumpSuit, trumpPoint) === getCardType(previous, trumpSuit, trumpPoint));

// **牌比较**
export const compareCards = (hand1: string[], hand2: string[], trumpSuit: Suit, trumpPoint: string): number => {
    const hand1Score = hand1.reduce((total, card) => total + getCardValue(card, trumpSuit, trumpPoint), 0);
    const hand2Score = hand2.reduce((total, card) => total + getCardValue(card, trumpSuit, trumpPoint), 0);
    return hand1Score >= hand2Score ? 0 : 1;
};

// **牌排序**
export const sortCards = (cards: string[], trumpSuit: Suit, trumpPoint: string): string[] =>
    cards.sort((a, b) => getCardOrderValue(b, trumpSuit, trumpPoint) - getCardOrderValue(a, trumpSuit, trumpPoint));
