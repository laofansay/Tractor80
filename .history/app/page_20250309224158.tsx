'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
import { soundEffect } from './components/SoundEffect';
import { ScorePanel } from './components/ScorePanel';
import { TrumpSelectionPanel } from './components/TrumpSelectionPanel';



export default function Home() {
  // 游戏状态管理
  const [gamePhase, setGamePhase] = useState < GamePhase > ('initial');
  const [red, setUpLevelNum] = useState < nu > (2 / 2');
  const [upLevelNum, setUpLevelNum] = useState < nu > (2 / 2');

  const [players, setPlayers] = useState < Record < Position, Player>> ({
    north: { cards: [], isDealer: false, isBot: true },
    east: { cards: [], isDealer: false, isBot: true },
    south: { cards: [], isDealer: false, isBot: false },
    west: { cards: [], isDealer: false, isBot: true },
    obs: { cards: [], isDealer: false, isObs: true },
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

    // 为每张牌播放一次出牌音效
    cards.forEach((_, index) => {
      setTimeout(() => {
        soundEffect.playSound('playCard');
      }, index * 100); // 每张牌之间间隔100毫秒
    });

    // 设置下一个出牌玩家
    const nextPlayer = getNextPlayer(position);
    setCurrentPlayer(nextPlayer);

    // 如果是最后一个玩家出牌，则结束当前回合
    if (nextPlayer === getFirstPlayerOfRound()) {
      // 保存当前回合记录到上一轮
      setLastRound(newCurrentRound);
      // 清空当前回合记录
      setCurrentRound({ north: [], east: [], south: [], west: [] });
      // 增加回合计数
      setRoundCount(roundCount + 1);
    }

    // 检查游戏是否结束（所有玩家手牌都出完）
    const isGameOver = Object.values(newPlayers).every(player => player.cards.length === 0);
    if (isGameOver) {
      // 游戏结束，显示结果
      setTimeout(() => {
        if (confirm(`游戏结束！共进行了${roundCount + 1}回合。\n\n是否要开始新的游戏？`)) {
          // 重新开始游戏
          initializeDeck();
        }
      }, 500); // 稍微延迟，让最后一张牌的状态更新完成
    }
  };

  // 获取下一个玩家位置
  const getNextPlayer = (currentPos: Position): Position => {
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    const currentIndex = positions.indexOf(currentPos);
    return positions[(currentIndex + 1) % 4];
  };

  // 处理庄家扣底
  const handleBottomCards = (selectedCards: string[]) => {
    if (gamePhase !== 'bottomCards' || !dealerPosition || selectedCards.length !== 6) return;

    // 从庄家手牌中移除选中的牌
    const newPlayers = { ...players };
    const dealerCards = [...newPlayers[dealerPosition].cards];

    // 移除所有选中的牌
    selectedCards.forEach(card => {
      const cardIndex = dealerCards.indexOf(card);
      if (cardIndex !== -1) {
        dealerCards.splice(cardIndex, 1);
      }
    });

    newPlayers[dealerPosition].cards = dealerCards;
    setPlayers(newPlayers);

    // 将选中的牌添加到底牌区域
    setBottomCards(selectedCards);

    // 进入出牌阶段
    setGamePhase('playing');

    // 设置庄家为第一个出牌的玩家
    setCurrentPlayer(dealerPosition);
  };

  // 获取当前回合第一位出牌玩家
  const getFirstPlayerOfRound = (): Position => {
    // 这里可以根据游戏规则确定第一位出牌玩家
    // 例如：可以是上一轮最大牌的玩家，或者庄家
    // 暂时简单返回北家
    return 'north';
  };

  // 初始化牌堆
  const initializeDeck = () => {
    // 创建一副54张牌的扑克牌（包括大小王）
    const suits = ['S', 'H', 'D', 'C']; // 使用字母代码：S-黑桃，H-红桃，D-方块，C-梅花
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: string[] = [];

    // 添加普通牌
    for (const suit of suits) {
      for (const value of values) {
        // 将A转换为1，以便于排序
        const cardValue = value === 'A' ? '1' : value;
        newDeck.push(`${suit}${cardValue}`);
      }
    }

    // 添加大小王
    newDeck.push('J0'); // 小王
    newDeck.push('B0'); // 大王

    // 洗牌算法 (Fisher-Yates shuffle)
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // 更新状态
    setDeck(newDeck);
    setGamePhase('initial');

    // 重置玩家状态
    setPlayers({
      north: { cards: [], isDealer: false, selectedCards: [] },
      east: { cards: [], isDealer: false, selectedCards: [] },
      south: { cards: [], isDealer: false, selectedCards: [] },
      west: { cards: [], isDealer: false, selectedCards: [] }
    });

    // 重置其他游戏状态
    setBottomCards([]);
    setDealerPosition(null);
    setCurrentPlayer(null);
    setPlayedCards([]);
    setCurrentRound({ north: [], east: [], south: [], west: [] });
    setLastRound({ north: [], east: [], south: [], west: [] });
    setRoundCount(0);
    setTrumpSuit(null); // 重置主牌花色
    // 重置得分
    setScores({
      north: 0,
      east: 0,
      south: 0,
      west: 0
    });
  };

  // 发牌
  const dealCards = () => {
    if (gamePhase !== 'initial' || deck.length !== 54) return;

    setGamePhase('dealing');

    // 复制当前牌堆
    const currentDeck = [...deck];
    const newPlayers = { ...players };
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    let cardIndex = 0;
    let playerIndex = 0;

    // 创建发牌动画函数
    const dealNextCard = () => {
      if (cardIndex < 48) { // 48张牌给玩家（每人12张）
        const position = positions[playerIndex];
        const card = currentDeck[cardIndex];

        // 播放发牌音效
        if (soundLoaded) {
          try {
            soundEffect.playSound('dealCard');
          } catch (error) {
            console.error('播放发牌音效失败:', error);
          }
        }

        // 更新玩家手牌
        newPlayers[position].cards = [...newPlayers[position].cards, card];
        setPlayers({ ...newPlayers });

        // 更新牌堆
        setDeck(currentDeck.slice(cardIndex + 1));

        // 更新计数器
        cardIndex++;
        playerIndex = (playerIndex + 1) % 4;

        // 如果当前玩家已经收到了12张牌，评估其手牌强度
        if (cardIndex % 12 === 0) {
          const playerPos = positions[(playerIndex + 3) % 4]; // 刚刚收到第12张牌的玩家
          const shouldDeclare = evaluateHandStrength(playerPos, newPlayers[playerPos].cards);
          console.log(`玩家 ${playerPos} 的手牌强度评估结果:`, shouldDeclare ? '建议亮主' : '建议不亮主');
        }

        // 继续发下一张牌
        setTimeout(dealNextCard, 100);
      } else {
        // 发完玩家的牌后，设置底牌
        const remainingCards = currentDeck.slice(cardIndex, cardIndex + 6);
        setBottomCards(remainingCards);
        setDeck([]);

        // 进入亮主阶段
        setGamePhase('trumpSelection');
        setCurrentPlayer('north');
      }
    };

    // 开始发牌动画
    dealNextCard();
  };

  // 庄家拾底
  const pickBottomCards = () => {
    if (gamePhase !== 'pickBottomCards' || !dealerPosition) return;

    // 将底牌添加到庄家手牌中
    const newPlayers = { ...players };
    newPlayers[dealerPosition].cards = [...newPlayers[dealerPosition].cards, ...bottomCards];

    // 更新状态
    setPlayers(newPlayers);
    setBottomCards([]);
    setGamePhase('bottomCards');

    // 确保当前玩家仍然是庄家
    setCurrentPlayer(dealerPosition);
  };

  // 选择庄家并设置主牌花色
  const declareTrump = (position: Position) => {
    if (gamePhase !== 'trumpSelection') return;

    // 获取玩家手牌中最大的花色作为主牌
    const playerCards = players[position].cards;
    let maxSuit = '';
    let maxValue = -1;

    // 遍历玩家手牌，找出点数最大的普通牌的花色
    playerCards.forEach(card => {
      const suit = card.charAt(0);
      const value = card.substring(1);
      // 跳过大小王
      if (suit !== 'J' && suit !== 'B') {
        const numValue = value === '1' ? 14 : parseInt(value); // A的值设为14
        if (numValue > maxValue) {
          maxValue = numValue;
          maxSuit = suit;
        }
      }
    });

    // 设置庄家
    const newPlayers = { ...players };
    Object.keys(newPlayers).forEach(pos => {
      newPlayers[pos as Position].isDealer = pos === position;
    });

    // 更新状态
    setPlayers(newPlayers);
    setDealerPosition(position);
    setTrumpSuit(maxSuit); // 设置主牌花色
    setGamePhase('pickBottomCards');
    setCurrentPlayer(position); // 设置当前玩家为庄家
  };

  // 选择主牌花色
  const selectTrump = (trumpSuit: string | null) => {
    if (gamePhase !== 'trumpSelection' || !dealerPosition) return;

    // 设置主牌花色
    setTrumpSuit(trumpSuit);
    // 进入拾底阶段
    setGamePhase('pickBottomCards');
  };

  // 跳过亮主，将机会传递给下一个玩家
  const skipTrump = (position: Position) => {
    if (gamePhase !== 'trumpSelection') return;

    // 获取下一个玩家
    const nextPlayer = getNextPlayer(position);

    // 如果已经轮询了一圈，没有人亮主，则随机选择一个玩家作为庄家
    if (nextPlayer === 'north') {
      // 随机选择一个玩家作为庄家
      const positions: Position[] = ['north', 'east', 'south', 'west'];
      const randomPosition = positions[Math.floor(Math.random() * 4)];

      // 设置庄家
      const newPlayers = { ...players };
      Object.keys(newPlayers).forEach(pos => {
        newPlayers[pos as Position].isDealer = pos === randomPosition;
      });

      // 随机选择一个花色作为主牌
      const suits = ['S', 'H', 'D', 'C'];
      const randomSuit = suits[Math.floor(Math.random() * 4)];

      // 更新状态
      setPlayers(newPlayers);
      setDealerPosition(randomPosition);
      setTrumpSuit(randomSuit);
      setGamePhase('pickBottomCards');
      setCurrentPlayer(randomPosition);
    } else {
      // 将机会传递给下一个玩家
      setCurrentPlayer(nextPlayer);
    }
  };

  // AI玩家自动操作
  useEffect(() => {
    // 只有在游戏进行中且当前玩家不是南方玩家(用户控制)时才执行AI操作
    if (currentPlayer && currentPlayer !== 'south') {
      // 添加延迟，模拟AI思考时间
      const aiThinkingTime = Math.random() * 1000 + 500; // 500-1500ms的随机时间

      const aiTimeout = setTimeout(() => {
        // 亮主阶段的AI决策
        if (gamePhase === 'trumpSelection') {
          // 获取当前AI玩家的手牌
          const aiCards = players[currentPlayer].cards;

          // 评估手牌强度决定是否亮主
          const shouldDeclare = evaluateHandStrength(aiCards);

          if (shouldDeclare) {
            // AI决定亮主
            declareTrump(currentPlayer);
          } else {
            // AI决定跳过
            skipTrump(currentPlayer);
          }
        }

        // 扣底阶段的AI决策（如果AI是庄家）
        else if (gamePhase === 'bottomCards' && dealerPosition === currentPlayer) {
          // 选择最弱的6张牌扣底
          const aiCards = [...players[currentPlayer].cards];
          const cardsToDiscard = selectCardsToDiscard(aiCards, trumpSuit);

          // 执行扣底操作
          handleBottomCards(cardsToDiscard);
        }

        // 出牌阶段的AI决策
        else if (gamePhase === 'playing') {
          // 选择要出的牌
          const aiCards = players[currentPlayer].cards;
          const cardsToPlay = selectCardsToPlay(aiCards, currentRound, trumpSuit);

          // 执行出牌操作
          if (cardsToPlay.length > 0) {
            playCard(currentPlayer, cardsToPlay);
          }
        }
      }, aiThinkingTime);

      // 清理函数
      return () => clearTimeout(aiTimeout);
    }
  }, [currentPlayer, gamePhase, players, dealerPosition]);

  // 评估手牌强度，决定是否亮主
  const evaluateHandStrength = (position: Position, cards: string[]): boolean => {
    // 计算手牌中的大牌数量（A、K、Q、J、大小王）
    let strongCards = 0;

    cards.forEach(card => {
      const suit = card.charAt(0);
      const value = card.substring(1);

      // 大小王
      if (suit === 'J' || suit === 'B') {
        strongCards += 2;
      }
      // A
      else if (value === '1') {
        strongCards += 1.5;
      }
      // K, Q, J
      else if (value === 'K' || value === 'Q' || value === 'J') {
        strongCards += 1;
      }
    });

    // 如果强牌数量超过阈值，则亮主
    // 随机因素：70%的概率按照强牌数量决定，30%的概率随机决定
    const randomFactor = Math.random() < 0.2;

    if (randomFactor) {
      return strongCards >= 5; // 如果有5张或以上的强牌，则亮主
    } else {
      return Math.random() < 0.4; // 30%的随机因素中，有40%的概率会亮主
    }
  };

  // 选择要扣的底牌（选择最弱的6张牌）
  const selectCardsToDiscard = (cards: string[], trumpSuit: string | null): string[] => {
    // 对牌进行评分，分数越低越容易被选为底牌
    const cardScores = cards.map(card => {
      const suit = card.charAt(0);
      const value = card.substring(1);
      let score = 0;

      // 大小王得分最高
      if (suit === 'B') return 100; // 大王
      if (suit === 'J') return 90;  // 小王

      // 主牌花色得分较高
      if (trumpSuit && suit === trumpSuit) {
        score += 20;
      }

      // 根据点数评分
      if (value === '1') score += 14; // A
      else if (value === 'K') score += 13;
      else if (value === 'Q') score += 12;
      else if (value === 'J') score += 11;
      else if (value === '10') score += 10;
      else score += parseInt(value);

      return score;
    });

    // 创建牌和分数的对象数组
    const cardWithScores = cards.map((card, index) => ({
      card,
      score: cardScores[index]
    }));

    // 按分数升序排序（分数低的排前面）
    cardWithScores.sort((a, b) => a.score - b.score);

    // 返回分数最低的6张牌
    return cardWithScores.slice(0, 6).map(item => item.card);
  };

  // 选择要出的牌
  const selectCardsToPlay = (cards: string[], currentRound: Record<Position, string[]>, trumpSuit: string | null): string[] => {
    // 如果是该回合第一个出牌的玩家，选择一张牌出
    const isFirstPlayer = Object.values(currentRound).every(cards => cards.length === 0);

    if (isFirstPlayer) {
      // 第一个出牌，选择一张中等大小的牌
      const sortedCards = sortCardsByValue(cards, trumpSuit);
      const middleIndex = Math.floor(sortedCards.length / 2);
      return [sortedCards[middleIndex]];
    } else {
      // 跟牌，需要根据已经出的牌来决定
      // 找出第一个出牌的玩家和他出的牌
      let firstPlayerCards: string[] = [];
      for (const [pos, playedCards] of Object.entries(currentRound)) {
        if (playedCards.length > 0) {
          firstPlayerCards = playedCards;
          break;
        }
      }

      if (firstPlayerCards.length === 0) return [cards[0]]; // 安全检查

      // 获取第一张牌的花色
      const leadingSuit = firstPlayerCards[0].charAt(0);

      // 筛选出相同花色的牌
      const sameSuitCards = cards.filter(card => card.charAt(0) === leadingSuit);

      if (sameSuitCards.length > 0) {
        // 有相同花色的牌，出最小的一张
        return [sameSuitCards[sameSuitCards.length - 1]];
      } else {
        // 没有相同花色的牌，出最小的一张
        const sortedCards = sortCardsByValue(cards, trumpSuit);
        return [sortedCards[sortedCards.length - 1]];
      }
    }
  };

  // 按牌面值排序（从大到小）
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

  // 添加可用花色状态
  const [availableSuits, setAvailableSuits] = useState < string[] > ([]);

  // 检查玩家手牌中是否有对应花色的2的逻辑
  const checkAvailableSuits = () => {
    if (gamePhase !== 'trumpSelection' || !currentPlayer) return;

    // 获取当前玩家的手牌
    const playerCards = players[currentPlayer].cards;
    const suits = ['S', 'H', 'D', 'C'];
    const available: string[] = [];

    // 检查每种花色是否有2
    suits.forEach(suit => {
      if (playerCards.includes(`${suit}2`)) {
        available.push(suit);
      }
    });

    // 更新可用花色状态
    setAvailableSuits(available);
  };

  // 在进入亮主阶段或当前玩家变化时检查可用花色
  useEffect(() => {
    if (gamePhase === 'trumpSelection') {
      checkAvailableSuits();
    }
  }, [gamePhase, currentPlayer, players]);


  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="relative w-full max-w-6xl aspect-square p-12 rounded-3xl bg-green-800/30 backdrop-blur-md shadow-2xl border border-green-600/20">
        {/* 得分面板 */}
        <ScorePanel scores={scores} dealerPosition={dealerPosition} />

        {/* 北方玩家区域 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 transform transition-transform hover:scale-105">
          <CardArea
            position="north"
            cards={players.north.cards}
            isDealer={players.north.isDealer}
            isCurrentPlayer={currentPlayer === 'north'}
            trumpSuit={trumpSuit}
            onDeclare={() => declareTrump('north')}
            onPlayCard={(cards) => playCard('north', cards)}
            onSelectBottomCards={handleBottomCards}
            onSkipTrump={() => skipTrump('north')}
            gamePhase={gamePhase}
          />
        </div>

        {/* 西方玩家区域 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 -rotate-90 transform transition-transform hover:scale-105">
          <CardArea
            position="west"
            cards={players.west.cards}
            isDealer={players.west.isDealer}
            isCurrentPlayer={currentPlayer === 'west'}
            trumpSuit={trumpSuit}
            onDeclare={() => declareTrump('west')}
            onPlayCard={(cards) => playCard('west', cards)}
            onSelectBottomCards={handleBottomCards}
            onSkipTrump={() => skipTrump('west')}
            gamePhase={gamePhase}
          />
        </div>

        {/* 东方玩家区域 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 rotate-90 transform transition-transform hover:scale-105">
          <CardArea
            position="east"
            cards={players.east.cards}
            isDealer={players.east.isDealer}
            isCurrentPlayer={currentPlayer === 'east'}
            trumpSuit={trumpSuit}
            onDeclare={() => declareTrump('east')}
            onPlayCard={(cards) => playCard('east', cards)}
            onSelectBottomCards={handleBottomCards}
            onSkipTrump={() => skipTrump('east')}
            gamePhase={gamePhase}
          />
        </div>

        {/* 南方玩家区域 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 transform transition-transform hover:scale-105">
          <CardArea
            position="south"
            cards={players.south.cards}
            isDealer={players.south.isDealer}
            isCurrentPlayer={currentPlayer === 'south'}
            trumpSuit={trumpSuit}
            onDeclare={() => declareTrump('south')}
            onPlayCard={(cards) => playCard('south', cards)}
            onSelectBottomCards={handleBottomCards}
            onSkipTrump={() => skipTrump('south')}
            gamePhase={gamePhase}
          />
        </div>

        {/* 中央牌堆区域 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 aspect-square bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl border border-green-700/50 backdrop-blur-lg transform transition-all duration-300 hover:scale-105 hover:shadow-green-900/50 flex flex-col items-center justify-center">
          <span className="text-green-100 text-xl font-semibold tracking-wider mb-2">牌堆</span>

          {/* 显示牌堆或底牌 */}
          {deck.length > 0 && (
            <div className="text-green-200 text-sm transition-all duration-300">
              <div className="flex items-center justify-center">
                <div className="relative w-12 h-16 bg-white rounded-md shadow-md overflow-hidden border-2 border-green-500 mb-2">
                  {deck.length > 1 && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500 to-blue-500 opacity-70"></div>
                  )}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                    {deck.length}
                  </div>
                </div>
              </div>
              <div className="animate-pulse">{deck.length}张牌</div>
            </div>
          )}

          {gamePhase === 'dealing' && (
            <div className="text-yellow-300 text-sm mt-2 animate-pulse">发牌中...</div>
          )}

          {bottomCards.length > 0 && (
            <div className="text-yellow-200 text-sm transition-all duration-300">
              <div className="flex items-center justify-center mt-2">
                <div className="relative w-12 h-16 bg-white rounded-md shadow-md overflow-hidden border-2 border-yellow-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-600 opacity-70"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                    {bottomCards.length}
                  </div>
                </div>
              </div>
              <div>{bottomCards.length}张底牌</div>
            </div>
          )}

          {/* 显示主牌花色 */}
          {trumpSuit && (
            <div className="mt-2 text-yellow-300 text-sm font-semibold">
              主牌花色:
              {trumpSuit === 'S' && '♠️ 黑桃'}
              {trumpSuit === 'H' && '♥️ 红桃'}
              {trumpSuit === 'C' && '♣️ 梅花'}
              {trumpSuit === 'D' && '♦️ 方块'}
            </div>
          )}

          {gamePhase === 'bottomCards' && dealerPosition && (
            <div className="mt-2 text-white text-xs">
              庄家正在查看底牌
            </div>
          )}

          {/* 显示当前回合的出牌情况 */}
          {gamePhase === 'playing' && (
            <div className="mt-4 w-full px-4">
              <div
                className="text-green-200 text-sm mb-2 font-semibold cursor-pointer hover:text-yellow-200 transition-colors"
                onClick={() => roundCount > 0 && setShowLastRound(!showLastRound)}
                title={roundCount > 0 ? "点击查看上一回合出牌情况" : ""}
              >
                第{roundCount + 1}回合
                {Object.values(players).every(player => player.cards.length === 0) &&
                  <span className="ml-2 text-yellow-300">(最终回合)</span>
                }
                {roundCount > 0 && (
                  <span className="ml-2 text-xs text-blue-300">
                    {showLastRound ? "[收起上一回合]" : "[查看上一回合]"}
                  </span>
                )}
              </div>

              {/* 显示当前回合出牌情况 */}
              {!showLastRound && Object.entries(currentRound).map(([pos, cards]) => (
                cards.length > 0 && (
                  <div key={pos} className="flex items-center justify-between text-xs text-white mb-1">
                    <span>
                      {pos === 'north' ? '北' : pos === 'south' ? '南' : pos === 'east' ? '东' : '西'}
                      {cards.length > 1 && `(${cards.length}张)`}:
                    </span>
                    <div className="flex space-x-1">
                      {cards.map((card, index) => (
                        <div key={index} className="transform scale-75">
                          <Card card={card} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* 显示上一回合出牌情况 */}
              {showLastRound && roundCount > 0 && (
                <div className="bg-green-900/50 p-2 rounded-md">
                  <div className="text-yellow-300 text-xs mb-2">第{roundCount}回合出牌记录:</div>
                  {Object.entries(lastRound).map(([pos, cards]) => (
                    cards.length > 0 && (
                      <div key={pos} className="flex items-center justify-between text-xs text-white mb-1">
                        <span>{pos === 'north' ? '北' : pos === 'south' ? '南' : pos === 'east' ? '东' : '西'}:</span>
                        <div className="flex space-x-1">
                          {cards.map((card, index) => (
                            <div key={index} className="transform scale-75">
                              <Card card={card} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 管理员面板 */}
        <AdminPanel
          onInitialize={initializeDeck}
          onDeal={dealCards}
          onPickBottomCards={pickBottomCards}
          onBottomCards={() => setGamePhase('bottomCards')}
          onStartPlaying={() => setGamePhase('playing')}
          gamePhase={gamePhase}
          deckLength={deck.length}
          bottomCardsLength={bottomCards.length}
          lastRound={lastRound}
          roundCount={roundCount}
        />
        {/* 亮主选择面板 */}
        <TrumpSelectionPanel
          onSelectTrump={selectTrump}
          gamePhase={gamePhase}
          availableSuits={availableSuits}
        />
      </div>
    </main>
  );
}
