'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
import { soundEffect } from './components/SoundEffect';
import { ScorePanel } from './components/ScorePanel';
import { TrumpSelectionPanel } from './components/TrumpSelectionPanel';
import { toast } from './components/Toast';
import { selectCardsToPlay } from './utils/AICardSelection';
import { validateCardPlay } from './utils/gameRules';
import { useToast } from "@/components/ui/use-toast";


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
      cards: [], isDealer: false, isObs: true, camp: null, recCards: [], currentRound: {},
      lastRound: {}, trumpSuit: ''
    },
  });

  const { toast } = useToast();
  //高主玩家
  const [dealerPosition, setDealerPosition] = useState < Position | null > (null);
  const [currentPlayer, setCurrentPlayer] = useState < Position | null > (null);

  const [roundCount, setRoundCount] = useState < number > (0);

  // 可选择的主牌花色状态
  const [availableSuits, setAvailableSuits] = useState < string[any] > ([]);

  // 添加主牌花色状态
  //const [trumpSuit, setTrumpSuit] = useState < string | null > (null);

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
      }

      // 延迟检查，给音频加载一些时间
      setTimeout(checkSoundLoaded, 1000);
    } catch (error) {
      console.error('音效加载失败:', error);
    }
  }, []);

  // 出牌
  const playCard = (position: Position, cards: string[]) => {
    if (gamePhase !== 'playing' || position !== currentPlayer || cards.length === 0) return;

    // 验证出牌是否符合规则
    const currentRound = players.obs.currentRound || {};
    const validationResult = validateCardPlay(position, cards, currentRound);
    if (!validationResult.valid) {
      alert(validationResult.message);
      return;
    }

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
    newPlayers.obs = {
      ...newPlayers.obs,
      currentRound: {
        ...newPlayers.obs.currentRound, // 先复制原有的 currentRound
        [position]: cards // 更新当前 position 的出牌记录
      }
    };
    setPlayers(newPlayers);

    // 为每张牌播放一次出牌音效
    cards.forEach((_, index) => {
      setTimeout(() => {
        soundEffect.playSound('playCard');
      }, index * 100); // 每张牌之间间隔100毫秒
    });



    // 检查当前回合是否所有玩家都已出牌
    const allPlayersPlayed = ['north', 'east', 'south', 'west'].every(position =>
      newPlayers.obs.currentRound?.[position]?.length > 0
    );
    //当前回合结束
    if (allPlayersPlayed) {
      newPlayers.obs = {
        ...newPlayers.obs,
        recRound: [
          ...(newPlayers.obs.recRound || []), // 追加到 recRound
          ...Object.values(newPlayers.obs.lastRound).flat() // lastRound 的所有牌合并
        ],
        lastRound: { ...newPlayers.obs.currentRound },
        currentRound: []
      };
      setPlayers(newPlayers);

      // 增加回合计数
      setRoundCount(roundCount + 1);
      //计算本回合4名玩家谁也的牌的点数大 则下一回合由该玩家先出牌

    } else {
      // 设置下一个出牌玩家
      const nextPlayer = getNextPlayer(position);
      setCurrentPlayer(nextPlayer);
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
      south: { cards: [], isDealer: false, isBot: false, camp: 'red' },
      west: { cards: [], isDealer: false, isBot: true, camp: 'blue' },
      obs: {
        cards: newDeck, isDealer: false, isObs: true, camp: null,
        currentRound: { north: [], east: [], south: [], west: [] },
        lastRound: { north: [], east: [], south: [], west: [] },
        recCards: [],
        trumpSuit: ''
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
    // 从OBS玩家的cards中获取牌
    const newPlayers = { ...players };
    const obsCards = [...newPlayers.obs.cards];
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    let cardIndex = 0;
    let playerIndex = 0;
    let isDealerPosition = false;

    // 创建发牌动画函数
    const dealNextCard = () => {
      if (cardIndex < 48) { // 48张牌给玩家（每人12张）
        const position = positions[playerIndex];
        //发出的牌
        const card = obsCards.shift(); // 从obsCards中移除第一张牌
        if (card) {
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
          // 更新obs牌堆
          newPlayers.obs.cards = newPlayers.obs.cards.slice(1);
          // 更新计数器
          cardIndex++;
          playerIndex = (playerIndex + 1) % 4;
          // 更新界面
          setPlayers({ ...newPlayers });
          console.log('发牌:', card);

          // 在每发一张牌后直接调用declareTrump函数
          // 只有在庄家未确定且处于发牌阶段时才尝试亮主
          if (!isDealerPosition) {
            // 使用返回值判断亮主是否成功
            const result = declareTrump(position, card);
            isDealerPosition = result.success;
            // 继续发下一张牌
            setTimeout(dealNextCard, 100);
          } else {
            // 已经有庄家，继续发牌
            setTimeout(dealNextCard, 100);
          }
        }
      } else {
        // 发牌完成后，如果还没有亮主，则设置为亮主阶段, 否则设置为拾底阶段
        if (!isDealerPosition) {
          // 没有玩家亮主，进入亮主阶段
          setGamePhase('trumpSelection');
        } else {
          // 已经有庄家，进入拾底阶段
          setGamePhase('pickBottomCards');
          setCurrentPlayer(dealerPosition); // 设置当前玩家为庄家
        }
      }
    };
    // 开始发牌动画
    dealNextCard();
  };




  // 选择庄家并设置主牌花色，亮主
  const declareTrump = (position: Position, card?: string): { success: boolean; } => {
    // 如果已经有庄家了，直接返回，避免重复亮主
    if (dealerPosition !== null) return { success: false };

    // 使用本地变量跟踪当前设置的庄家，避免依赖异步状态更新
    const newPlayers = { ...players };
    console.log('亮主计算:', position);

    // 再次检查是否已经有庄家，防止多个bot玩家同时亮主
    // 这是一个额外的安全检查，因为React状态更新是异步的
    if (dealerPosition !== null) return { success: false };

    const suits = ['S', 'H', 'D', 'C'];
    const playerCards = newPlayers[position].cards;
    // 机器人玩家的亮主逻辑
    if (playerCards.length < 1) return { success: false };
    if (newPlayers[position].isBot) {
      // 检查每种花色
      for (const suit of suits) {
        // 检查是否有该花色的2
        if (playerCards.includes(suit + '2')) {
          // 统计该花色的牌数量
          const sameSuitCards = playerCards.filter(c => c.charAt(0) === suit);
          // 检查是否有该花色的5、10或K
          const has5_10_K = playerCards.some(c =>
            c.charAt(0) === suit && ['5', '10', 'K'].includes(c.substring(1)));
          // 如果该花色牌数量至少有3张且有5、10、K中任意一张，则亮主
          if (sameSuitCards.length >= 1 && has5_10_K) {
            // 最后一次检查是否已经有庄家
            if (dealerPosition !== null) return { success: false };

            setAvailableSuits([suit]);

            // 使用本地变量记录庄家位置，避免依赖异步状态更新
            const currentDealerPosition = position;

            newPlayers[position].isDealer = true;
            newPlayers[position].trumpSuit = suit;
            newPlayers[position].isDdeclareTrump = true;
            newPlayers.obs.trumpSuit = suit;
            setDealerPosition(position); // 更新庄家位置
            setCurrentPlayer(currentDealerPosition); // 设置当前玩家为庄家
            // 更新界面 - 修正为更新整个players对象
            setPlayers(newPlayers);

            // 亮主后立即返回成功结果，确保不会继续检查其他花色
            return { success: true };
          }
        }
      }
    } else {
      console.log('玩家亮主检查:', card);
      const suit = card.charAt(0);
      const cardValue = card.substring(1);
      if (cardValue === '2' || cardValue === '0') {
        setAvailableSuits(prevSuits => [...prevSuits, suit]);
        //setGamePhase('trumpSelection'); // 设置为亮主阶段
      }
    }

    // 默认返回未亮主成功
    return { success: false };
  };


  // 庄家拾底 - 增强版AI逻辑
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
    setGamePhase('bottomCards');

    // 确保当前玩家仍然是庄家
    setCurrentPlayer(dealerPosition);

    // 如果庄家是机器人，自动执行扣底操作
    if (newPlayers[dealerPosition].isBot) {
      // 给机器人一点思考时间，模拟真实玩家思考
      const thinkingTime = Math.random() * 1000 + 1000; // 1000-2000ms的随机时间

      setTimeout(() => {
        console.log('AI玩家自动扣底');
        const aiCards = [...newPlayers[dealerPosition].cards];
        const cardsToDiscard = selectCardsToDiscard(aiCards, players.obs.trumpSuit);
        handleBottomCards(cardsToDiscard);

        // AI玩家扣底后，自动进入出牌阶段
        setTimeout(() => {
          startPlayingPhase();
        }, 1000);
      }, thinkingTime);
    }
  };

  // AI自动开始游戏阶段
  const startPlayingPhase = () => {
    if (gamePhase === 'bottomCards' && dealerPosition) {
      setGamePhase('playing');
      setCurrentPlayer(dealerPosition); // 设置庄家为第一个出牌的玩家
    }
  };

  // 监听扣底完成，自动进入出牌阶段
  useEffect(() => {
    if (gamePhase === 'bottomCards' && players.obs.cards.length === 6 && dealerPosition && players[dealerPosition].isBot) {
      // 如果是AI玩家扣底完成，自动进入出牌阶段
      setTimeout(() => {
        startPlayingPhase();
      }, 1000);
    }
  }, [gamePhase, players.obs.cards.length, dealerPosition]);


  //玩家选择花色亮主
  const selectTrump = (suit: string | null) => {
    // 如果已经有庄家了或者不在亮主阶段，直接返回
    if (dealerPosition !== null) return;
    if (gamePhase !== 'trumpSelection') return;
    console.log('玩家算主:', suit);

    // 再次检查是否已经有庄家，防止多个玩家同时亮主
    if (dealerPosition !== null) return;

    setAvailableSuits([suit]);
    const newPlayers = { ...players };
    // 使用本地变量记录庄家位置，避免依赖异步状态更新
    const currentDealerPosition = 'south'; // 玩家位置固定为south
    setDealerPosition(currentDealerPosition);
    newPlayers[currentDealerPosition].isDealer = true;
    newPlayers[currentDealerPosition].trumpSuit = suit;
    newPlayers[currentDealerPosition].isDdeclareTrump = true;
    newPlayers.obs.trumpSuit = suit;
    setGamePhase('pickBottomCards');
    setCurrentPlayer(currentDealerPosition); // 设置当前玩家为庄家
    // 更新界面 - 修正为更新整个players对象
    setPlayers(newPlayers);
  };


  // AI玩家自动操作
  useEffect(() => {
    // 只有在游戏进行中且当前玩家是机器人时才执行AI操作
    if (currentPlayer && players[currentPlayer]?.isBot) {
      // 添加延迟，模拟AI思考时间
      const aiThinkingTime = Math.random() * 1000 + 500; // 500-1500ms的随机时间

      const aiTimeout = setTimeout(() => {
        // 亮主阶段的AI决策
        if (gamePhase === 'trumpSelection') {
          // 在亮主阶段，AI可以选择亮主或跳过
          // 这部分逻辑已经在declareTrump函数中实现
        }
        // 扣底阶段的AI决策（如果AI是庄家）
        else if (gamePhase === 'bottomCards' && dealerPosition === currentPlayer) {
          // 选择最弱的6张牌扣底
          const aiCards = [...players[currentPlayer].cards];
          const cardsToDiscard = selectCardsToDiscard(aiCards, players.obs.trumpSuit);

          // 执行扣底操作
          handleBottomCards(cardsToDiscard);
        }
        // 出牌阶段的AI决策
        else if (gamePhase === 'playing') {
          // 选择要出的牌
          const aiCards = players[currentPlayer].cards;
          // 获取当前回合的出牌情况
          const currentRoundData = players.obs.currentRound || {};
          // 使用从AICardSelection导入的方法选择要出的牌
          const cardsToPlay = selectCardsToPlay(aiCards, currentRoundData, players.obs.trumpSuit);

          // 执行出牌操作
          if (cardsToPlay.length > 0) {
            playCard(currentPlayer, cardsToPlay);
          }
        }
        // 拾底阶段的AI决策（如果AI是庄家）
        else if (gamePhase === 'pickBottomCards' && dealerPosition === currentPlayer) {
          // 自动执行拾底操作
          pickBottomCards();
        }
      }, aiThinkingTime);

      // 清理函数
      return () => clearTimeout(aiTimeout);
    }
  }, [currentPlayer, gamePhase, players, dealerPosition]);




  // 选择要扣的底牌（选择最弱的6张牌）- 增强版AI逻辑
  const selectCardsToDiscard = (cards: string[], trumpSuit: string | null): string[] => {
    // 对牌进行评分，分数越低越容易被选为底牌
    const cardScores = cards.map(card => {
      const suit = card.charAt(0);
      const value = card.substring(1);
      let score = 0;

      // 大小王得分最高，永远不会被扣底
      if (suit === 'B') return 150; // 大王
      if (suit === 'J') return 140;  // 小王

      // 主牌花色得分较高
      if (trumpSuit && suit === trumpSuit) {
        score += 30; // 提高主牌基础分

        // 主牌中的2、A、K得分更高
        if (value === '2') score += 25;
        if (value === '1') score += 24; // A
        if (value === 'K') score += 23;
        if (value === 'Q') score += 22;
        if (value === 'J') score += 21;
        if (value === '10') score += 20;
      }

      // 根据点数评分
      if (value === '1') score += 14; // A
      else if (value === 'K') score += 13;
      else if (value === 'Q') score += 12;
      else if (value === 'J') score += 11;
      else if (value === '10') score += 10;
      else if (value === '5') score += 8; // 5分牌
      else score += parseInt(value);

      // 统计同花色的牌数量
      const sameSuitCount = cards.filter(c => c.charAt(0) === suit).length;

      // 如果某花色牌很少，优先保留
      if (sameSuitCount <= 2) {
        score += 10; // 同花色牌少于等于2张时，大幅提高其分数
      } else if (sameSuitCount <= 4) {
        score += 5; // 同花色牌较少时，适当提高分数
      }

      // 如果某花色牌很多，可以适当扣一些
      if (sameSuitCount >= 7) {
        score -= 3; // 同花色牌很多时，适当降低分数
      }

      // 考虑牌的组合价值
      // 例如：如果有A和K，它们的组合价值高于单独的价值
      if (value === '1' || value === 'K' || value === 'Q') {
        const hasHigherCards = cards.some(c =>
          c.charAt(0) === suit &&
          (c.substring(1) === '1' || c.substring(1) === 'K' || c.substring(1) === 'Q') &&
          c !== card
        );
        if (hasHigherCards) {
          score += 5; // 有高牌组合时提高分数
        }
      }

      return score;
    });

    // 创建牌和分数的对象数组
    const cardWithScores = cards.map((card, index) => ({
      card,
      score: cardScores[index],
      suit: card.charAt(0),
      value: card.substring(1)
    }));

    // 按分数升序排序（分数低的排前面）
    cardWithScores.sort((a, b) => a.score - b.score);

    // 确保不会扣掉所有某一花色的牌
    const selectedCards = [];
    const remainingCards = [...cardWithScores];
    const suitCounts = {};

    // 统计每种花色的牌数量
    cards.forEach(card => {
      const suit = card.charAt(0);
      if (suit !== 'B' && suit !== 'J') { // 不统计大小王
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
      }
    });

    // 计算扣底后每种花色至少要保留的牌数
    const minCardsToKeep = {};
    Object.keys(suitCounts).forEach(suit => {
      // 如果是主牌花色，尽量多保留一些
      if (suit === trumpSuit) {
        minCardsToKeep[suit] = Math.max(2, Math.floor(suitCounts[suit] / 2));
      } else {
        // 非主牌花色，根据数量决定保留多少
        minCardsToKeep[suit] = Math.max(1, Math.floor(suitCounts[suit] / 3));
      }
    });

    // 选择6张牌扣底，同时确保每种花色至少保留一定数量的牌
    while (selectedCards.length < 6 && remainingCards.length > 0) {
      const card = remainingCards.shift();
      const suit = card.suit;

      // 如果不是大小王，检查是否可以扣掉
      if (suit !== 'B' && suit !== 'J') {
        // 计算如果扣掉这张牌后，该花色还剩多少张
        const remainingSuitCount = cards.filter(c =>
          c.charAt(0) === suit && !selectedCards.includes(c)
        ).length - 1;

        // 如果扣掉这张牌后，该花色的牌数量仍然满足最低要求，则可以扣掉
        if (remainingSuitCount >= minCardsToKeep[suit]) {
          selectedCards.push(card.card);
        } else {
          // 否则将这张牌放到队列末尾，尝试其他牌
          remainingCards.push(card);
        }
      } else {
        // 大小王不扣，放到队列末尾
        remainingCards.push(card);
      }

      // 防止无限循环
      if (remainingCards.length > 0 && remainingCards[0] === card) {
        // 如果队列头部的牌没有变化，说明所有牌都不满足条件
        // 在这种情况下，我们需要放宽条件

        // 首先尝试从非主牌中选择
        const nonTrumpCards = remainingCards.filter(c => c.suit !== trumpSuit && c.suit !== 'B' && c.suit !== 'J');
        if (nonTrumpCards.length > 0) {
          selectedCards.push(nonTrumpCards[0].card);
          remainingCards.splice(remainingCards.indexOf(nonTrumpCards[0]), 1);
        } else {
          // 如果没有非主牌，只能选择分数最低的牌
          selectedCards.push(remainingCards.shift().card);
        }
      }
    }

    // 如果选择的牌不足6张，从分数最低的牌中补足
    if (selectedCards.length < 6) {
      const additionalCards = cardWithScores
        .filter(card => !selectedCards.includes(card.card))
        .slice(0, 6 - selectedCards.length)
        .map(card => card.card);

      selectedCards.push(...additionalCards);
    }

    // 确保不会扣掉所有大牌
    const highCards = ['B0', 'J0']; // 大小王
    if (trumpSuit) {
      highCards.push(`${trumpSuit}2`); // 主2
      highCards.push(`${trumpSuit}1`); // 主A
    }

    // 检查是否所有高牌都被扣掉了
    const keptHighCards = cards.filter(card =>
      highCards.includes(card) && !selectedCards.includes(card)
    );

    // 如果没有保留任何高牌，尝试保留至少一张
    if (keptHighCards.length === 0) {
      // 找出被选中的高牌中分数最高的一张
      const selectedHighCards = selectedCards.filter(card => highCards.includes(card));
      if (selectedHighCards.length > 0) {
        // 找到一张非高牌替换它
        const nonHighCard = cardWithScores
          .filter(c => !highCards.includes(c.card) && !selectedCards.includes(c.card))
          .shift();

        if (nonHighCard) {
          // 替换一张高牌
          const highCardIndex = selectedCards.indexOf(selectedHighCards[0]);
          if (highCardIndex !== -1) {
            selectedCards.splice(highCardIndex, 1, nonHighCard.card);
          }
        }
      }
    }

    console.log('AI玩家选择扣底牌:', selectedCards);
    return selectedCards;
  };

  // 处理升级点数的函数

  // 处理升级点数的函数



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
        {dealerPosition} {gamePhase} {players.obs.currentRound.length}
        {players.obs.recCards.length}
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
              {!showLastRound && Object.entries(players.obs.currentRound).map(([pos, cards]) => (
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
