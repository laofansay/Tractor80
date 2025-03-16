'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
import { DeckArea } from './components/DeckArea';
import soundEffect from './components/SoundEffect';
import { ScorePanel } from './components/ScorePanel';
import { TrumpSelectionPanel } from './components/TrumpSelectionPanel';
import { selectCardsToPlay } from './utils/AICardSelection';
import { validateCardPlay } from './utils/gameRules';
import { usePoints, PointsState } from "./hooks/usePoints"; // 假设 usePoints Hook 已定义


import { GamePhase, Position, Player, Camp } from './components/constant/Constant';
import { compareCards, shuffleDeck, getCardSuit, isValidPlay, deck, getCardType, calculateScore, sortCards, getCardOrderValue } from "./utils/poker";
import { useGameRoundTracker } from './hooks/useRoundTracker';




export default function Page() {
  const {
    centralSelectedCards,
    setCentralSelectedCards,
    points,
    addCardToCamp,
    cleanPoint,
    roundState,
    setLeadingSuit,
    setLeadingPlayer,
    setCardGroup,
    nextRound,
    gamePhase,
    setGamePhase,
    redUpLevel,
    setRedUpLevel,
    blueUpLevel,
    setBlueUpLevel,
    players,
    setPlayers
  } = useGameState();

  // 监控玩家手牌变化，处理亮主逻辑
  useEffect(() => {
    // 只在发牌阶段处理亮主逻辑
    if (gamePhase === 'dealing') {
      // 检查每个玩家的手牌
      const positions: Position[] = ['north', 'east', 'south', 'west'];

      for (const position of positions) {
        const playerCards = players[position].cards;

        // 检查是否有特殊牌（如2或大小王）
        const hasTrumpCard = playerCards.some(card => {
          const value = card.substring(1);
          const suit = card.substring(0, 1);
          return value === '2' || suit === 'J'; // 2或大小王
        });

        if (hasTrumpCard && playerCards.length >= 1) {
          // 如果有特殊牌且手牌数量足够，标记该玩家可以亮主
          setPlayers(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              isDdeclareTrump: true
            }
          }));
        }
      }
    }
  }, [
    gamePhase,
    players.north.cards,
    players.east.cards,
    players.south.cards,
    players.west.cards
  ]);

  // 处理发牌完成事件
  const handleDealComplete = () => {
    setGamePhase('trumpSelection');
  };

  // 处理选择主牌
  const handleSelectTrump = (trumpSuit: string | null) => {
    if (trumpSuit) {
      // 更新主牌信息
      setPlayers(prev => ({
        ...prev,
        obs: {
          ...prev.obs,
          trumpSuit: trumpSuit
        }
      }));
      // 进入下一阶段
      setGamePhase('pickBottomCards');
    }
  };

  // 处理玩家出牌
  const handlePlayCard = (position: Position, cards: string[]) => {
    // 验证出牌是否符合规则
    const validationResult = validateCardPlay(position, cards, players.obs.currentRound);

    if (!validationResult.valid) {
      // 如果出牌不符合规则，可以显示错误信息
      alert(validationResult.message);
      return;
    }

    // 更新玩家手牌
    setPlayers(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        cards: prev[position].cards.filter(card => !cards.includes(card))
      },
      obs: {
        ...prev.obs,
        currentRound: {
          ...prev.obs.currentRound,
          [position]: cards
        }
      }
    }));

    // 如果是首次出牌，设置首出花色
    const isFirstPlay = Object.values(players.obs.currentRound).every(cards => cards.length === 0);
    if (isFirstPlay) {
      const leadingSuit = getCardSuit(cards, players.obs.trumpSuit || '', '2');
      setLeadingSuit(leadingSuit || '');
      setLeadingPlayer(position);
    } else {
      // 比较当前出牌与当前最大牌
      const leadingPosition = roundState.leadingPlayer as Position;
      const leadingCards = players.obs.currentRound[leadingPosition] || [];

      if (leadingCards.length > 0) {
        const compareResult = compareCards(
          leadingCards,
          cards,
          players.obs.trumpSuit || '',
          '2'
        );

        if (compareResult === 0) {
          // 如果当前出牌更大，更新最大玩家
          setLeadingPlayer(position);
        }
      }
    }

    // 检查是否所有玩家都已出牌
    const nextPlayer = getNextPlayer(position);
    const allPlayed = nextPlayer === 'north';

    if (allPlayed) {
      // 回合结束，计算得分并开始新回合
      handleRoundEnd();
    } else {
      // 轮到下一个玩家出牌
      if (players[nextPlayer].isBot) {
        // AI玩家自动出牌
        setTimeout(() => {
          const aiCards = selectCardsToPlay(
            players[nextPlayer].cards,
            players.obs.currentRound,
            players.obs.trumpSuit || null
          );
          handlePlayCard(nextPlayer, aiCards);
        }, 1000);
      }
    }
  };

  // 获取下一个出牌玩家
  const getNextPlayer = (currentPosition: Position): Position => {
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    const currentIndex = positions.indexOf(currentPosition);
    return positions[(currentIndex + 1) % 4];
  };

  // 处理回合结束
  const handleRoundEnd = () => {
    // 获取当前回合的获胜玩家
    const winnerPosition = roundState.leadingPlayer as Position;
    const winnerCamp = players[winnerPosition].camp as Camp;

    // 计算本回合的得分
    let roundScore = 0;
    Object.values(players.obs.currentRound).forEach(cards => {
      cards.forEach(card => {
        const value = card.substring(1);
        if (value === '5') roundScore += 5;
        else if (value === '10' || value === 'K') roundScore += 10;
      });
    });

    // 添加得分到对应阵营
    if (roundScore > 0) {
      addCardToCamp(winnerCamp, '', roundScore);
    }

    // 保存当前回合到上一回合
    setPlayers(prev => ({
      ...prev,
      obs: {
        ...prev.obs,
        lastRound: { ...prev.obs.currentRound },
        currentRound: {
          north: [],
          east: [],
          south: [],
          west: [],
          obs: []
        }
      }
    }));

    // 进入下一回合
    nextRound();

    // 检查是否所有玩家手牌都已出完
    const allCardsPlayed = Object.values(players).every(player =>
      player.isObs || player.cards.length === 0
    );

    if (allCardsPlayed) {
      // 游戏结束，可以显示结算界面或重新开始
      alert('游戏结束！');
      // 这里可以添加游戏结束的逻辑
    } else {
      // 设置下一回合的首出玩家
      setTimeout(() => {
        if (players[winnerPosition].isBot) {
          // AI玩家自动出牌
          const aiCards = selectCardsToPlay(
            players[winnerPosition].cards,
            players.obs.currentRound,
            players.obs.trumpSuit || null
          );
          handlePlayCard(winnerPosition, aiCards);
        }
      }, 1000);
    }
  };

  // 获取可用的花色
  const getAvailableSuits = () => {
    // 这里简化处理，实际游戏中可能需要根据玩家手牌决定
    return ['S', 'H', 'C', 'D', 'J', 'B'];
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto">
        {/* 游戏主界面 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 北方玩家 */}
          <div className="col-start-2">
            <CardArea
              position="north"
              cards={players.north.cards}
              isDealer={players.north.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={roundState.leadingPlayer === 'north' || Object.values(players.obs.currentRound).every(cards => cards.length === 0)}
              trumpSuit={players.obs.trumpSuit || null}
              trumpPoint="2"
              isFirstPlayer={Object.values(players.obs.currentRound).every(cards => cards.length === 0)}
              isLeadingPlayer={roundState.leadingPlayer === 'north'}
              onDeclare={() => { }}
              onPlayCard={(cards) => handlePlayCard('north', cards)}
            />
          </div>

          {/* 西方玩家 */}
          <div className="row-start-2">
            <CardArea
              position="west"
              cards={players.west.cards}
              isDealer={players.west.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={roundState.leadingPlayer === 'west' || (Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0)}
              trumpSuit={players.obs.trumpSuit || null}
              trumpPoint="2"
              isFirstPlayer={Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0}
              isLeadingPlayer={roundState.leadingPlayer === 'west'}
              onDeclare={() => { }}
              onPlayCard={(cards) => handlePlayCard('west', cards)}
            />
          </div>

          {/* 中央牌堆区域 */}
          <div className="col-start-2 row-start-2">
            <DeckArea
              cards={deck}
              gamePhase={gamePhase}
              onDealComplete={handleDealComplete}
              northPlayedCards={players.obs.currentRound.north}
              eastPlayedCards={players.obs.currentRound.east}
              southPlayedCards={players.obs.currentRound.south}
              westPlayedCards={players.obs.currentRound.west}
            />
          </div>

          {/* 东方玩家 */}
          <div className="col-start-3 row-start-2">
            <CardArea
              position="east"
              cards={players.east.cards}
              isDealer={players.east.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={roundState.leadingPlayer === 'east' || (Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0 && players.obs.currentRound.west.length > 0)}
              trumpSuit={players.obs.trumpSuit || null}
              trumpPoint="2"
              isFirstPlayer={Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0 && players.obs.currentRound.west.length > 0}
              isLeadingPlayer={roundState.leadingPlayer === 'east'}
              onDeclare={() => { }}
              onPlayCard={(cards) => handlePlayCard('east', cards)}
            />
          </div>

          {/* 南方玩家 */}
          <div className="col-start-2 row-start-3">
            <CardArea
              position="south"
              cards={players.south.cards}
              isDealer={players.south.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={roundState.leadingPlayer === 'south' || (Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0 && players.obs.currentRound.west.length > 0 && players.obs.currentRound.east.length > 0)}
              trumpSuit={players.obs.trumpSuit || null}
              trumpPoint="2"
              isFirstPlayer={Object.values(players.obs.currentRound).every(cards => cards.length === 0) && players.obs.currentRound.north.length > 0 && players.obs.currentRound.west.length > 0 && players.obs.currentRound.east.length > 0}
              isLeadingPlayer={roundState.leadingPlayer === 'south'}
              onDeclare={() => { }}
              onPlayCard={(cards) => handlePlayCard('south', cards)}
            />
          </div>
        </div>

        {/* 得分面板 */}
        <ScorePanel
          points={points}
          rulingParty={players.south.camp}
          redUpLevel={redUpLevel}
          blueUpLevel={blueUpLevel}
        />

        {/* 亮主选择面板 */}
        <TrumpSelectionPanel
          onSelectTrump={handleSelectTrump}
          gamePhase={gamePhase}
          availableSuits={getAvailableSuits()}
          trumpSuit={players.obs.trumpSuit || ''}
        />

        {/* 管理面板 */}
        <AdminPanel
          onInitialize={() => {
            // 初始化游戏逻辑
            const shuffledDeck = shuffleDeck(deck);
            // 分发卡牌给玩家
            setPlayers(prev => ({
              ...prev,
              north: { ...prev.north, cards: shuffledDeck.slice(0, 11) },
              east: { ...prev.east, cards: shuffledDeck.slice(12, 23) },
              south: { ...prev.south, cards: shuffledDeck.slice(24, 36) },
              west: { ...prev.west, cards: shuffledDeck.slice(37, 48) }
            }));
            setGamePhase('dealing');
            // 预加载发牌音效
            soundEffect.preloadSound('dealCard', '/sounds/deal-card.mp3');
          }}
          onDeal={() => setGamePhase('trumpSelection')}
          onPickBottomCards={() => setGamePhase('bottomCards')}
          onBottomCards={() => setGamePhase('playing')}
          onStartPlaying={() => setGamePhase('playing')}
          gamePhase={gamePhase}
          deckLength={deck.length}
        />
      </div>
    </div>
  );
}

// 创建自定义hook管理游戏状态
function useGameState() {
  const [centralSelectedCards, setCentralSelectedCards] = useState < string[] > ([]);
  const { points, addCardToCamp, cleanPoint }: {
    points: PointsState;
    addCardToCamp: (camp: Camp, card: string, points: number) => void;
    cleanPoint: (camp: Camp) => void;
  } = usePoints();
  const { roundState, setLeadingSuit, setLeadingPlayer, setCardGroup, nextRound } = useGameRoundTracker();
  const [gamePhase, setGamePhase] = useState < GamePhase > ('initial');
  const [redUpLevel, setRedUpLevel] = useState < number > (2);
  const [blueUpLevel, setBlueUpLevel] = useState < number > (2);
  const [players, setPlayers] = useState < Record < Position, Player>> ({
    north: { cards: [], isDealer: false, isBot: true, camp: 'red', isDdeclareTrump: false },
    east: { cards: [], isDealer: false, isBot: true, camp: 'blue', isDdeclareTrump: false },
    south: { cards: [], isDealer: false, isBot: false, camp: 'red', isDdeclareTrump: false },
    west: { cards: [], isDealer: false, isBot: true, camp: 'blue', isDdeclareTrump: false },
    obs: {
      cards: [],
      isDealer: false,
      isObs: true,
      camp: null,
      recCards: [],
      currentRound: {
        north: [],
        east: [],
        south: [],
        west: [],
        obs: []
      },
      lastRound: {
        north: [],
        east: [],
        south: [],
        west: [],
        obs: []
      },
      trumpSuit: ''
    },
  });

  return {
    centralSelectedCards,
    setCentralSelectedCards,
    points,
    addCardToCamp,
    cleanPoint,
    roundState,
    setLeadingSuit,
    setLeadingPlayer,
    setCardGroup,
    nextRound,
    gamePhase,
    setGamePhase,
    redUpLevel,
    setRedUpLevel,
    blueUpLevel,
    setBlueUpLevel,
    players,
    setPlayers
  };
}
