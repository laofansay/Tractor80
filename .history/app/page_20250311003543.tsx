'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
import { soundEffect } from './components/SoundEffect';
import { ScorePanel } from './components/ScorePanel';
import { TrumpSelectionPanel } from './components/TrumpSelectionPanel';

import { GamePhase, Position, Player } from './components/constant/Constant';

export default function Home() {
  // 游戏状态管理
  const [gamePhase, setGamePhase] = useState < GamePhase > ('initial');

  const [redUpLevel, setRedUpLevel] = useState < string > ('2');
  const [blueUpLevel, setBlueUpLevel] = useState < string > ('2');

  const [players, setPlayers] = useState < Record < Position, Player>> ({
    north: { cards: [], isDealer: false, isBot: true, camp: 'red', isDdeclareTrump: false },
    east: { cards: [], isDealer: false, isBot: true, camp: 'blue', isDdeclareTrump: false },
    south: { cards: [], isDealer: false, isBot: false, camp: 'red', isDdeclareTrump: false },
    west: { cards: [], isDealer: false, isBot: true, camp: 'blue', isDdeclareTrump: false },
    obs: {
      cards: [], isDealer: false, isObs: true, camp: null, RecCards: [], currentRound: [],
      lastRound: [], trumpSuit: ''
    },
  });


  //高主玩家
  const [dealerPosition, setDealerPosition] = useState < Position | null > (null);
  const [currentPlayer, setCurrentPlayer] = useState < Position | null > (null);

  const [roundCount, setRoundCount] = useState < number > (0);

  // 可选择的主牌花色状态
  const [availableSuits, setAvailableSuits] = useState < string[any] > ([]);

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

    // 更新当前回合的出牌记录（存储在obs中）
    const newCurrentRound = { position, cards };
    newPlayers.obs = {
      ...newPlayers.obs,
      currentRound: newCurrentRound
    };
    setPlayers(newPlayers);

    // 为每张牌播放一次出牌音效
    cards.forEach((_, index) => {
      setTimeout(() => {
        soundEffect.playSound('playCard');
      }, index * 100); // 每张牌之间间隔100毫秒
    });

    // 设置下一个出牌玩家
    const nextPlayer = getNextPlayer(position);
    setCurrentPlayer(nextPlayer);



    // 检查当前回合是否所有玩家都已出牌
    const allPlayersPlayed = ['north', 'east', 'south', 'west'].every(position =>
      newPlayers.obs.currentRound[position]?.length > 0
    );
    if (allPlayersPlayed) {
      // 保存当前回合记录到上一回合
      const newPlayers = { ...players };
      newPlayers.obs.lastRound = newPlayers.obs.currentRound;
      newPlayers.obs.currentRound = { north: [], east: [], south: [], west: [] };
      setPlayers(newPlayers);

      // 将上一回合的牌添加到玩家的cards中
      Object.entries(newPlayers.obs.lastRound).forEach(([position, cards]) => {
        if (cards.length > 0) {
          newPlayers[position].recCards = [...newPlayers[position].recCards, ...cards];
        }
      });
      setPlayers(newPlayers);

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

    // 将选中的牌添加到obs玩家的cards数组中
    newPlayers.obs.cards = [...selectedCards];
    setPlayers(newPlayers);

    // 进入出牌阶段
    setGamePhase('playing');

    // 设置庄家为第一个出牌的玩家
    setCurrentPlayer(dealerPosition);
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
    setGamePhase('initial');

    // 重置玩家状态，将所有牌发给OBS玩家，同OBS执行所有的，发牌..操作 玩家设置为庄家
    setPlayers({
      north: { cards: [], isDealer: false, isBot: true, camp: 'red' },
      east: { cards: [], isDealer: false, isBot: true, camp: 'blue' },
      south: { cards: [], isDealer: true, isBot: false, camp: 'red' },
      west: { cards: [], isDealer: false, isBot: true, camp: 'blue' },
      obs: {
        cards: newDeck, isDealer: false, isObs: true, camp: null,
        currMcurrentRoundrgeback: { north: [], east: [], south: [], west: [] },
        lastRound: { north: [], east: [], south: [], west: [] }
      }
    });

    // 重置其他游戏状态
    setDealerPosition(null);
    setCurrentPlayer(null);
    setRoundCount(0);
    // 重置得分和升级点数
    setScores({
      north: 0,
      east: 0,
      south: 0,
      west: 0
    });
    setRedUpLevel('2');
    setBlueUpLevel('2');
  };

  //发牌
  const dealCards = () => {
    if (gamePhase !== 'initial' || players.obs.cards.length === 0) return;
    setGamePhase('dealing');
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    let cardIndex = 0;
    let playerIndex = 0;
    const dealNextCard = () => {
      if (cardIndex >= 48) {
        // 发牌结束，进入下一阶段
        setGamePhase(dealerPosition === null ? 'trumpSelection' : 'pickBottomCards');
        return;
      }
      setPlayers(prevPlayers => {
        const updatedPlayers = { ...prevPlayers };
        const position = positions[playerIndex];
        if (updatedPlayers.obs.cards.length === 0) return prevPlayers;
        // 取出一张牌
        const card = updatedPlayers.obs.cards[0];
        updatedPlayers.obs.cards = updatedPlayers.obs.cards.slice(1);
        // 添加到该玩家的手牌
        updatedPlayers[position].cards = [...updatedPlayers[position].cards, card];
        console.log('发牌:', position, card);
        // 播放发牌音效
        if (soundLoaded) {
          try {
            soundEffect.playSound('dealCard');
          } catch (error) {
            console.error('播放发牌音效失败:', error);
          }
        }

        // 亮主逻辑
        declareTrump(position, card);
        return updatedPlayers;
      });
      // 继续发下一张牌
      cardIndex++;
      playerIndex = (playerIndex + 1) % 4;
      setTimeout(dealNextCard, 100);
    };

    dealNextCard();
  };

  //亮主
  const declareTrump = (position: Position, card: string) => {

    console.log('亮主:', gamePhase, dealerPosition);
    if (gamePhase !== 'dealing' || dealerPosition !== null) return;

    setPlayers(prevPlayers => {
      const newPlayers = { ...prevPlayers };
      let trumpSuit: string | null = null;
      let newDealerPosition: Position | null = null;

      if (newPlayers[position].isBot) {
        const suits = ['S', 'H', 'D', 'C'];
        const playerCards = newPlayers[position].cards;

        for (const suit of suits) {
          if (playerCards.includes(`${suit}2`)) {
            const sameSuitCards = playerCards.filter(c => c.charAt(0) === suit);
            const has5_10_K = playerCards.some(c =>
              c.charAt(0) === suit && ['5', '10', 'K'].includes(c.substring(1))
            );

            if (sameSuitCards.length >= 2 || has5_10_K) {
              trumpSuit = suit;
              newDealerPosition = position;
              break;
            }
          }
        }
      } else if (card) {
        const cardValue = card.substring(1);
        const cardSuit = card.charAt(0);

        if (cardValue === '2' || cardValue === 'J' || cardValue === 'B') {
          setAvailableSuits(prevSuits => [...prevSuits, cardValue === '2' ? cardSuit : cardValue]);
          setGamePhase('trumpSelection');
          return;
        }

        trumpSuit = cardSuit;
        newDealerPosition = position;
      }

      if (trumpSuit && newDealerPosition) {
        newPlayers.obs.trumpSuit = trumpSuit;
        newPlayers[newDealerPosition].isDealer = true;
        newPlayers[newDealerPosition].isDeclareTrump = true;

        setDealerPosition(newDealerPosition);
        setGamePhase('pickBottomCards');
        setCurrentPlayer(newDealerPosition);
      }

      return newPlayers;
    });
  };



  // 庄家拾底
  const pickBottomCards = () => {
    if (gamePhase !== 'pickBottomCards' || !dealerPosition) return;

    // 从OBS玩家的cards中获取最后6张牌作为底牌
    const newPlayers = { ...players };
    const obsCards = [...newPlayers.obs.cards];

    // 获取obs.cards中的最后6张牌
    const lastSixCards = obsCards.slice(-6);

    // 将这6张牌添加到庄家手牌中
    newPlayers[dealerPosition].cards = [...newPlayers[dealerPosition].cards, ...lastSixCards];

    // 从obs.cards中移除这6张牌
    newPlayers.obs.cards = obsCards.slice(0, obsCards.length - 6);

    // 更新状态
    setPlayers(newPlayers);
    //setBottomCards(lastSixCards); // 保存底牌以便后续使用
    setGamePhase('bottomCards');

    // 确保当前玩家仍然是庄家
    setCurrentPlayer(dealerPosition);
  };


  //玩家选择花色亮主
  const selectTrump = (suit: string | null) => {
    if (gamePhase !== 'trumpSelection') return;

    // 设置主牌花色
    setTrumpSuit(suit);

    // 进入扣底阶段
    setGamePhase('pickBottomCards');

    // 如果有庄家，设置当前玩家为庄家并更新玩家状态
    if (dealerPosition) {
      // 更新玩家状态，确保庄家标识正确显示
      const newPlayers = { ...players };
      // 重置所有玩家的庄家状态
      Object.keys(newPlayers).forEach(pos => {
        if (pos !== 'obs' && newPlayers[pos]) {
          newPlayers[pos].isDealer = pos === dealerPosition;
        }
      });

      // 更新玩家状态
      setPlayers(newPlayers);
      setCurrentPlayer(dealerPosition);
    }
  };


  // AI玩家自动操作
  useEffect(() => {
    // 只有在游戏进行中且当前玩家不是南方玩家(用户控制)时才执行AI操作
    if (currentPlayer && currentPlayer.isBot) {
      // 添加延迟，模拟AI思考时间
      const aiThinkingTime = Math.random() * 1000 + 500; // 500-1500ms的随机时间

      const aiTimeout = setTimeout(() => {
        // 亮主阶段的AI决策
        if (gamePhase === 'trumpSelection') {

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
  const selectCardsToPlay = (cards: string[], currentRoundData: Record<Position, string[]>, trumpSuit: string | null): string[] => {
    // 如果是该回合第一个出牌的玩家，选择一张牌出
    const isFirstPlayer = Object.values(currentRoundData).every(cards => cards.length === 0);

    if (isFirstPlayer) {
      // 第一个出牌，选择一张中等大小的牌
      const sortedCards = sortCardsByValue(cards, trumpSuit);
      const middleIndex = Math.floor(sortedCards.length / 2);
      return [sortedCards[middleIndex]];
    } else {
      // 跟牌，需要根据已经出的牌来决定
      // 找出第一个出牌的玩家和他出的牌
      let firstPlayerCards: string[] = [];
      for (const [pos, playedCards] of Object.entries(currentRoundData)) {
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



  // 处理升级点数的函数
  const handleUpgrade = (camp: 'red' | 'blue') => {
    // 升级点数顺序：2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A, 王
    const upgradeOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', 'NT'];

    if (camp === 'red') {
      const currentIndex = upgradeOrder.indexOf(redUpLevel);
      if (currentIndex < upgradeOrder.length - 1) {
        setRedUpLevel(upgradeOrder[currentIndex + 1]);
      }
    } else {
      const currentIndex = upgradeOrder.indexOf(blueUpLevel);
      if (currentIndex < upgradeOrder.length - 1) {
        setBlueUpLevel(upgradeOrder[currentIndex + 1]);
      }
    }
  };





  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="relative w-full max-w-6xl aspect-square p-12 rounded-3xl bg-green-800/30 backdrop-blur-md shadow-2xl border border-green-600/20">
        {/* 得分面板 */}
        <ScorePanel scores={scores} dealerPosition={dealerPosition} redUpLevel={redUpLevel} blueUpLevel={blueUpLevel} />

        {/* 北方玩家区域 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 transform transition-transform hover:scale-105">
          <CardArea
            position="north"
            cards={players.north.cards}
            isDealer={players.north.isDealer}
            isCurrentPlayer={currentPlayer === 'north'}
            trumpSuit={players.obs.trumpSuit}
            isTrumpSuit={players.north.isDdeclareTrump}
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
            trumpSuit={players.obs.trumpSuit}
            isTrumpSuit={players.west.isDdeclareTrump}
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
            trumpSuit={players.obs.trumpSuit}
            isTrumpSuit={players.east.isDdeclareTrump}
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
            trumpSuit={players.obs.trumpSuit}
            isTrumpSuit={players.south.isDdeclareTrump}
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
          {players.obs.cards.length > 0 && (
            <div className="text-green-200 text-sm transition-all duration-300">
              <div className="flex items-center justify-center">
                <div className="relative w-12 h-16 bg-white rounded-md shadow-md overflow-hidden border-2 border-green-500 mb-2">
                  {players.obs.cards.length > 1 && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500 to-blue-500 opacity-70"></div>
                  )}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                    {players.obs.cards.length}
                  </div>
                </div>
              </div>
              <div className="animate-pulse">{players.obs.cards.length}张牌</div>
            </div>
          )}

          {gamePhase === 'dealing' && (
            <div className="text-yellow-300 text-sm mt-2 animate-pulse">发牌中...</div>
          )}



          {/* 显示主牌花色 */}
          {players.obs.trumpSuit && (
            <div className="mt-2 text-yellow-300 text-sm font-semibold">
              主牌花色:
              {players.obs.trumpSuit === 'S' && '♠️ 黑桃'}
              {players.obs.trumpSuit === 'H' && '♥️ 红桃'}
              {players.obs.trumpSuit === 'C' && '♣️ 梅花'}
              {players.obs.trumpSuit === 'D' && '♦️ 方块'}
              {players.obs.trumpSuit === '' && ' NT'}
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
              {!showLastRound && Object.entries(players.obs.currMcurrentRoundrgeback).map(([pos, cards]) => (
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
                  {Object.entries(players.obs.lastRound).map(([pos, cards]) => (
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
          deckLength={players.obs.cards.length}
        />
        {/* 亮主选择面板 */}
        <TrumpSelectionPanel
          onSelectTrump={selectTrump}
          gamePhase={gamePhase}
          availableSuits={availableSuits}
          trumpSuit={players.obs.trumpSuit}
        />
      </div>
    </main>
  );
}
