'use client';

import { compareCards } from './cardUtils';

/**
 * 比较同一家玩家的牌的大小
 * @param cards 玩家的牌数组
 * @param trumpSuit 主牌花色（可选）
 * @returns 排序后的牌数组，从大到小排序
 */
export const comparePlayerCards = (cards: string[], trumpSuit?: string | null): string[] => {
  // 复制数组，避免修改原数组
  return [...cards].sort((a, b) => -compareCards(a, b, trumpSuit));
};

/**
 * 获取玩家手牌中最大的牌
 * @param cards 玩家的牌数组
 * @param trumpSuit 主牌花色（可选）
 * @returns 最大的牌
 */
export const getHighestCard = (cards: string[], trumpSuit?: string | null): string | null => {
  if (!cards || cards.length === 0) return null;
  
  return comparePlayerCards(cards, trumpSuit)[0];
};

/**
 * 判断一组牌是否能够战胜另一组牌
 * @param attackingCards 进攻的牌组
 * @param defendingCards 防守的牌组
 * @param trumpSuit 主牌花色（可选）
 * @returns boolean 是否能够战胜
 */
export const canDefeatCards = (attackingCards: string[], defendingCards: string[], trumpSuit?: string | null): boolean => {
  if (!attackingCards || attackingCards.length === 0) return false;
  if (!defendingCards || defendingCards.length === 0) return true;
  
  // 获取两组牌中的最大牌
  const highestAttackingCard = getHighestCard(attackingCards, trumpSuit);
  const highestDefendingCard = getHighestCard(defendingCards, trumpSuit);
  
  if (!highestAttackingCard) return false;
  if (!highestDefendingCard) return true;
  
  // 比较最大牌的大小
  return compareCards(highestAttackingCard, highestDefendingCard, trumpSuit) > 0;
};