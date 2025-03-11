'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
import { soundEffect } from './components/SoundEffect';
import { ScorePanel } from './components/ScorePanel';
import { TrumpSelectionPanel } from './components/TrumpSelectionPanel';

type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';
type Position = 'north' | 'east' | 'south' | 'west';
type Player = {
  cards: string[];
  isDealer: boolean;
  selectedCards: string[];
};

export default function Home() {
  // 游戏状态管理
  const [gamePhase, setGamePhase] = useState < GamePhase > ('initial');
  const [players, setPlayers] = useState < Record < Position, Player>> ({
    north: { cards: [], isDealer: false, selectedCards: [] },
    east: { cards: [], isDealer: false, selectedCards: [] },
    south: { cards: [], isDealer: false, selectedCards: [] },
    west: { cards: [], isDealer: false, selectedCards: [] }
  });
  const [deck, setDeck] = useState < string[] > ([]);
  const [bottomCards, setBottomCards] = useState < string[] > ([]);
  const [dealerPosition, setDealerPosition] = useState < Position | null > (null);
  const [currentPlayer, setCurrentPlayer] = useState < Position | null > (null);
  const [playedCards, setPlayedCards] = useState < string[] > ([]);
  //当前回合
  const [currentRound, setCurrentRound] = useState < Record < Position, string[]>> ({ north: [], east: [], south: [], west: [] });
  //是一回合
  const [lastRound, setLastRound] = useState < Record < Position, string[]>> ({ north: [], east: [], south: [], west: [] });
  const [roundCount, setRoundCount] = useState < number > (0);
  // 添加主牌花色状态
  const [trumpSuit, setTrumpSuit] = useState < string | null > (null);
  // 添加显示上一回合状态
  const [showLastRound, setShowLastRound] = useState < boolean > (false);
  // 添加音效加载状态
  const [soundLoaded, setSoundLoaded] = useState < boolean > (false);
  // 添加得分状态
  const [scores, setScores] = useState < Record < Position, number>> ({
    north: 0,
    east: 0,
    south: 0,
    west: 0
  });

  // 预加载音效
  useEffect(() => {
    // 预加载发牌音效
    try {
      soundEffect.preloadSound('dealCard', '/sounds/deal-card.mp3');
      soundEffect.preloadSound('playCard', '/sounds/send-card.mp3'); // 预加载出牌音效

      // 检查音效是否成功加载
      const checkSoundLoaded = () => {
        if (soundEffect.canPlaySound('dealCard') && soundEffect.canPlaySound('playCard')) {
          console.log('音效加载成功');
          setSoundLoaded(true);
        } else {
          console.warn('发牌音效尚未加载完成，稍后重试...');
          setTimeout(checkSoundLoaded, 1000); // 1秒后重试
        }
      };

      // 延迟检查，给音频加载一些时间
      setTimeout(checkSoundLoaded, 1000);
    } catch (error) {
      console.error('音效加载失败:', error);
    }
  }, []);

  // AI玩家自动出牌逻辑
  useEffect(() => {
    // 只在出牌阶段且当前玩家不是南方玩家(人类玩家)时自动出牌
    if (gamePhase === 'playing' && currentPlayer && currentPlayer !== 'south') {
      // 给AI玩家一点思考时间，使游戏更自然
      const timer = setTimeout(() => {
        const aiPosition = currentPlayer;
        const aiCards = players[aiPosition].cards;

        if (aiCards.length > 0) {
          // 获取AI应该出的牌
          const cardsToPlay = getAICardToPlay(aiPosition, aiCards);
          // 调用出牌函数
          playCard(aiPosition, cardsToPlay);
        }
      }, 1000); // 1秒后AI出牌

      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentPlayer, players]);

  // AI玩家自动亮主逻辑
  useEffect(() => {
    // 只在亮主阶段且当前玩家不是南方玩家(人类玩家)时自动决定是否亮主
    if (gamePhase === 'trumpSelection' && currentPlayer && currentPlayer !== 'south') {
      // 给AI玩家一点思考时间
      const timer = setTimeout(() => {
        const aiPosition = currentPlayer;
        const aiCards = players[aiPosition].cards;

        // 评估手牌强度，决定是否亮主
        const shouldDeclare = evaluateHandStrength(aiCards);

        if (shouldDeclare) {
          // AI决定亮主
          declareTrump(aiPosition);
          // 选择最适合的花色作为主牌
          const bestTrumpSuit = getBestTrumpSuit(aiCards);
          selectTrump(bestTrumpSuit);
        } else {
          // AI决定跳过亮主
          skipTrump(aiPosition);
        }
      }, 1500); // 1.5秒后AI决定是否亮主

      return () => clearTimeout(timer);
    }
  }, [gamePhase, currentPlayer, players]);

  // AI玩家自动扣底逻辑
  useEffect(() => {
    // 只在扣底阶段且当前玩家不是南方玩家(人类玩家)时自动扣底
    if (gamePhase === 'bottomCards' && dealerPosition && dealerPosition !== 'south') {
      // 给AI玩家一点思考时间
      const timer = setTimeout(() => {
        const aiCards = players[dealerPosition].cards;

        if (aiCards.length > 0) {
          // 获取AI应该扣的底牌
          const cardsToBottom = getCardsForBottom(aiCards);
          // 调用扣底函数
          handleBottomCards(cardsToBottom);
        }
      }, 2000); // 2秒后AI扣底

      return () => clearTimeout(timer);
    }
  }, [gamePhase, dealerPosition, players]);

  // 评估手牌强度，决定是否亮主
  const evaluateHandStrength = (cards: string[]): boolean => {
    // 计算手牌中的大牌数量（A、K、Q、J、大小王）
    const highCards = cards.filter(card => {
      const value = card.substring(1);
      return value === '1' || value === 'K' || value === 'Q' || value === 'J' || value === '0';
    });

    // 计算每种花色的牌数
    const suitCounts: Record<string, number> = { 'S': 0, 'H': 0, 'D': 0, 'C': 0 };
    cards.forEach(card => {
      const suit = card.charAt(0);
      if (suit in suitCounts) {
        suitCounts[suit]++;
      }
    });

    // 找出最多的花色数量
    const maxSuitCount = Math.max(...Object.values(suitCounts));

    // 如果高牌数量大于等于4或者某一花色的牌数大于等于5，则决定亮主
    return highCards.length >= 4 || maxSuitCount >= 5;
  };

  // 获取最适合的主牌花色
  const getBestTrumpSuit = (cards: string[]): string => {
    // 计算每种花色的牌数和点数
    const suitStrength: Record<string, { count: number, points: number }> = {
      'S': { count: 0, points: 0 },
      'H': { count: 0, points: 0 },
      'D': { count: 0, points: 0 },
      'C': { count: 0, points: 0 }
    };

    cards.forEach(card => {
      const suit = card.charAt(0);
      const value = card.substring(1);

      if (suit in suitStrength) {
        suitStrength[suit].count++;

        // 计算点数：A=14, K=13, Q=12, J=11, 其他按面值
        let points = 0;
        if (value === '1') points = 14; // A
        else if (value === 'K') points = 13;
        else if (value === 'Q') points = 12;
        else if (value === 'J') points = 11;
        else points = parseInt(value) || 0;

        suitStrength[suit].points += points;
      }
    });

    // 找出最强的花色（先按数量，再按点数）
    let bestSuit = 'S';
    let maxStrength = 0;

    for (const [suit, { count, points }] of Object.entries(suitStrength)) {
      const strength = count * 10 + points; // 数量权重更大
      if (strength > maxStrength) {
        maxStrength = strength;
        bestSuit = suit;
      }
    }

    return bestSuit;
  };

  // 获取AI应该出的牌
  const getAICardToPlay = (position: Position, cards: string[]): string[] => {
    // 如果是第一个出牌的玩家
    if (Object.values(currentRound).every(cards => cards.length === 0)) {
      // 随机选择一张牌出
      const randomIndex = Math.floor(Math.random() * cards.length);
      return [cards[randomIndex]];
    }

    // 找出本轮第一个出牌的玩家和他出的牌
    let firstPlayerPos: Position | null = null;
    let firstPlayerCards: string[] = [];

    for (const [pos, posCards] of Object.entries(currentRound)) {
      if (posCards.length > 0) {
        firstPlayerPos = pos as Position;
        firstPlayerCards = posCards;
        break;
      }
    }

    if (!firstPlayerPos || firstPlayerCards.length === 0) {
      // 如果找不到第一个出牌的玩家，随机出牌
      const randomIndex = Math.floor(Math.random() * cards.length);
      return [cards[randomIndex]];
    }

    // 获取第一个出牌的花色
    const leadSuit = firstPlayerCards[0].charAt(0);

    // 找出手牌中与首牌同花色的牌
    const sameSuitCards = cards.filter(card => card.charAt(0) === leadSuit);

    if (sameSuitCards.length > 0) {
      // 有同花色的牌，随机选一张出
      const randomIndex = Math.floor(Math.random() * sameSuitCards.length);
      return [sameSuitCards[randomIndex]];
    } else {
      // 没有同花色的牌，随机选一张出
      const randomIndex = Math.floor(Math.random() * cards.length);
      return [cards[randomIndex]];
    }
  };

  // 获取AI应该扣的底牌
  const getCardsForBottom = (cards: string[]): string[] => {
    // 复制牌组进行排序和选择
    const sortedCards = [...cards];

    // 按照点数从小到大排序（2最小，A最大）
    sortedCards.sort((a, b) => {
      const valueA = a.substring(1);
      const valueB = b.substring(1);

      // 处理特殊牌
      if (valueA === '0') return 1; // 王牌放最后（保留）
      if (valueB === '0') return -1;

      // A牌
      if (valueA === '1') return 1; // A牌放最后（保留）
      if (valueB === '1') return -1;

      // 其他牌按数值比较
      return parseInt(valueA) - parseInt(valueB);
    });

    // 选择点数最小的6张牌作为底牌
    return sortedCards.slice(0, 6);
  };

  // 出牌
  const playCard = (position: Position, cards: string[]) => {
    if (gamePhase !== 'playing' || position !== currentPlayer || cards.length === 0) return;

    // 播放出牌音效
    if (soundLoaded) {
      try {
        soundEffect.playSound('playCard');
      } catch (error) {
        console.error('播放出牌音效失败:', error);
      }
    }

    const newPlayers = { ...players };
    const playerCards = [...newPlayers[position].cards];

    // 移除所有选中的牌
    cards.forEach(card => {
      const cardIndex = playerCards.indexOf(card);
      if (cardIndex !== -1) {
        playerCards.splice(cardIndex, 1);
      }
    });

    newPlayers[position].cards = playerCards;
    setPlayers(newPlayers);

    // 将打出的牌添加到牌堆
    setPlayedCards([...playedCards, ...cards]);

    // 更新当前回合的出牌记录
    const newCurrentRound = { ...currentRound };
    newCurrentRound[position] = cards;
    setCurrentRound(newCurrentRound);
