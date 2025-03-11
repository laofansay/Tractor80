'use client';

import { compareCards } from './cardUtils';
import { comparePlayerCards, getHighestCard, canDefeatCards } from './comparePlayerCards';

/**
 * 卡牌比较示例
 * 本文件展示了如何使用卡牌比较函数
 */

// 示例1：比较两张牌的大小
export const compareCardsExample = () => {
  const card1 = 'S1'; // 黑桃A
  const card2 = 'H1'; // 红桃A
  const trumpSuit = 'H'; // 主牌为红桃
  
  const result = compareCards(card1, card2, trumpSuit);
  
  if (result > 0) {
    console.log(`${card1} 大于 ${card2}`);
  } else if (result < 0) {
    console.log(`${card1} 小于 ${card2}`);
  } else {
    console.log(`${card1} 等于 ${card2}`);
  }
  
  // 输出: S1 小于 H1 (因为H是主牌)
};

// 示例2：对玩家的牌进行排序
export const sortPlayerCardsExample = () => {
  const playerCards = ['S5', 'H10', 'D2', 'C1', 'B0', 'J0', 'S1', 'H1'];
  const trumpSuit = 'D'; // 主牌为方块
  
  const sortedCards = comparePlayerCards(playerCards, trumpSuit);
  
  console.log('排序后的牌:', sortedCards);
  // 输出: ['B0', 'J0', 'D2', 'S1', 'H1', 'C1', 'S5', 'H10']
  // 排序顺序: 大王 > 小王 > 主牌 > 按花色和点数排序
};

// 示例3：获取玩家手牌中最大的牌
export const getHighestCardExample = () => {
  const playerCards = ['S5', 'H10', 'D2', 'C1', 'S1'];
  const trumpSuit = 'H'; // 主牌为红桃
  
  const highestCard = getHighestCard(playerCards, trumpSuit);
  
  console.log('最大的牌:', highestCard);
  // 输出: 'H10' (因为H是主牌)
};

// 示例4：判断一组牌是否能够战胜另一组牌
export const canDefeatCardsExample = () => {
  const attackingCards = ['S1', 'S2']; // 进攻的牌
  const defendingCards = ['H10', 'H5']; // 防守的牌
  const trumpSuit = 'H'; // 主牌为红桃
  
  const canDefeat = canDefeatCards(attackingCards, defendingCards, trumpSuit);
  
  console.log('能否战胜:', canDefeat);
  // 输出: false (因为H是主牌，所以H10比S1大)
};

/**
 * 在实际游戏中的应用
 * 
 * 1. 出牌时，可以使用compareCards来验证玩家出的牌是否符合规则
 * 2. AI玩家决策时，可以使用getHighestCard来选择最优的牌
 * 3. 计算得分时，可以使用canDefeatCards来判断哪位玩家赢得了当前回合
 * 4. 排序玩家手牌时，可以使用comparePlayerCards来按大小排序
 */