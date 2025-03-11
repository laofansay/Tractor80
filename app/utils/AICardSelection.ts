/**
 * AI玩家出牌策略工具
 */

import { Position } from '../components/constant/Constant';

/**
 * 比较两张牌的大小
 * @param card1 第一张牌
 * @param card2 第二张牌
 * @param leadingSuit 首出牌花色
 * @param trumpSuit 主牌花色
 * @returns 正数表示card1大，负数表示card2大，0表示相等
 */
const compareCards = (card1: [], card2: [], leadingSuit: string, trumpSuit: string | null): number => {
    const suit1 = card1.charAt(0);
    const suit2 = card2.charAt(0);
    const value1 = card1.substring(1);
    const value2 = card2.substring(1);

    // 大小王最大
    if (suit1 === 'B') return 1;
    if (suit2 === 'B') return -1;
    if (suit1 === 'J' && suit1 === '0') return 1;
    if (suit2 === 'J' && suit2 === '0') return -1;

    // 主牌大于非主牌
    const isTrump1 = trumpSuit && suit1 === trumpSuit;
    const isTrump2 = trumpSuit && suit2 === trumpSuit;
    if (isTrump1 && !isTrump2) return 1;
    if (!isTrump1 && isTrump2) return -1;

    // 如果都是主牌或都不是主牌
    if (isTrump1 === isTrump2) {
        // 如果花色相同，比较点数
        if (suit1 === suit2) {
            const num1 = value1 === '1' ? 14 : parseInt(value1) || 0;
            const num2 = value2 === '1' ? 14 : parseInt(value2) || 0;
            return num1 - num2;
        }
        // 如果花色不同，但有一个是首出花色
        else if (suit1 === leadingSuit) {
            return 1;
        }
        else if (suit2 === leadingSuit) {
            return -1;
        }
    }

    // 其他情况，花色不同且都不是主牌或首出花色，保持原顺序
    return 0;
};

/**
 * 按牌值排序
 * @param cards 要排序的牌
 * @param trumpSuit 主牌花色
 * @returns 排序后的牌
 */
const sortCardsByValue = (cards: string[], trumpSuit: string | null): string[] => {
    return [...cards].sort((a, b) => {
        const suitA = a.charAt(0);
        const suitB = b.charAt(0);
        const valueA = a.substring(1);
        const valueB = b.substring(1);

        // 大小王最大
        if (suitA === 'B') return -1;
        if (suitB === 'B') return 1;
        if (suitA === 'J') return -1;
        if (suitB === 'J') return 1;

        // 主牌花色大于其他花色
        if (trumpSuit) {
            if (suitA === trumpSuit && suitB !== trumpSuit) return -1;
            if (suitA !== trumpSuit && suitB === trumpSuit) return 1;
        }

        // 同花色比较点数
        if (suitA === suitB) {
            const numA = valueA === '1' ? 14 : parseInt(valueA); // A当作14点
            const numB = valueB === '1' ? 14 : parseInt(valueB);
            return numB - numA; // 从大到小排序
        }

        // 不同花色且都不是主牌，保持原顺序
        return 0;
    });
};

/**
 * AI玩家选择要出的牌
 * @param cards AI玩家手牌
 * @param currentRoundData 当前回合出牌情况
 * @param trumpSuit 主牌花色
 * @returns 选择出的牌
 */
export const selectCardsToPlay = (cards: string[], currentRoundData: Record<Position, string[]>, trumpSuit: string | null): string[] => {
    // 如果是该回合第一个出牌的玩家，智能选择牌出
    const isFirstPlayer = Object.values(currentRoundData).every(cards => !cards || cards.length === 0);

    if (isFirstPlayer) {
        // 第一个出牌，优先选择非主牌的中小牌
        const sortedCards = sortCardsByValue(cards, trumpSuit);

        // 如果只有一张牌，直接出
        if (sortedCards.length === 1) return [sortedCards[0]];

        // 尝试找出非主牌的中小牌
        const nonTrumpCards = trumpSuit ? cards.filter(card => card.charAt(0) !== trumpSuit && card.charAt(0) !== 'B' && card.charAt(0) !== 'J') :
            cards.filter(card => card.charAt(0) !== 'B' && card.charAt(0) !== 'J');

        if (nonTrumpCards.length > 0) {
            // 有非主牌，选择中等偏小的牌
            const sortedNonTrump = sortCardsByValue(nonTrumpCards, trumpSuit);
            const index = Math.min(Math.floor(sortedNonTrump.length * 0.7), sortedNonTrump.length - 1);
            return [sortedNonTrump[index]];
        }

        // 如果没有非主牌，选择中等偏小的牌
        const index = Math.min(Math.floor(sortedCards.length * 0.7), sortedCards.length - 1);
        return [sortedCards[index]];
    } else {
        // 跟牌，需要根据已经出的牌来决定
        // 找出第一个出牌的玩家和他出的牌
        let firstPlayerCards: string[] = [];
        for (const [pos, playedCards] of Object.entries(currentRoundData)) {
            if (playedCards && playedCards.length > 0) {
                firstPlayerCards = playedCards;
                break;
            }
        }

        if (firstPlayerCards.length === 0) return [cards[0]]; // 安全检查

        // 获取第一张牌的花色
        const leadingSuit = firstPlayerCards[0].charAt(0);

        // 检查是否是大小王
        const isJoker = leadingSuit === 'B' || leadingSuit === 'J';

        // 筛选出相同花色的牌
        const sameSuitCards = isJoker ? [] : cards.filter(card => card.charAt(0) === leadingSuit);

        // 检查是否有大小王
        const jokers = cards.filter(card => card.charAt(0) === 'B' || card.charAt(0) === 'J');

        // 检查是否有主牌
        const trumpCards = trumpSuit ? cards.filter(card => card.charAt(0) === trumpSuit) : [];

        if (sameSuitCards.length > 0) {
            // 有相同花色的牌
            const sortedSameSuitCards = sortCardsByValue(sameSuitCards, trumpSuit);

            // 如果是最后一个出牌的玩家，尝试判断是否能赢得这一轮
            const allPlayersPlayed = Object.values(currentRoundData).filter(c => c && c.length > 0).length === 3;

            if (allPlayersPlayed) {
                // 找出当前最大的牌
                let highestCard = firstPlayerCards[0];
                for (const [_, playedCards] of Object.entries(currentRoundData)) {
                    if (playedCards && playedCards.length > 0) {
                        const card = playedCards[0];
                        // 比较牌的大小
                        if (compareCards(card, highestCard, leadingSuit, trumpSuit) > 0) {
                            highestCard = card;
                        }
                    }
                }

                // 尝试找出能赢的牌
                for (const card of sortedSameSuitCards) {
                    if (compareCards(card, highestCard, leadingSuit, trumpSuit) > 0) {
                        return [card]; // 出最小的能赢的牌
                    }
                }
            }

            // 如果没有能赢的牌或不是最后一个出牌的玩家，出最小的牌
            return [sortedSameSuitCards[sortedSameSuitCards.length - 1]];
        } else if (trumpCards.length > 0 && (isJoker || leadingSuit !== trumpSuit)) {
            // 没有相同花色但有主牌，且首出的不是主牌或是大小王
            const sortedTrumpCards = sortCardsByValue(trumpCards, trumpSuit);
            return [sortedTrumpCards[sortedTrumpCards.length - 1]]; // 出最小的主牌
        } else if (jokers.length > 0 && cards.length > 1) {
            // 没有相同花色和主牌但有大小王，且不是最后一张牌
            const nonJokers = cards.filter(card => card.charAt(0) !== 'B' && card.charAt(0) !== 'J');
            if (nonJokers.length > 0) {
                const sortedNonJokers = sortCardsByValue(nonJokers, trumpSuit);
                return [sortedNonJokers[sortedNonJokers.length - 1]]; // 出最小的非王牌
            }
        }

        // 没有相同花色的牌或只剩王牌，出最小的一张
        const sortedCards = sortCardsByValue(cards, trumpSuit);
        return [sortedCards[sortedCards.length - 1]];
    }
};