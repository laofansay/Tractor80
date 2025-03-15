'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';
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
              onDeclare={() => {}}
              onPlayCard={() => {}}
            />
          </div>

          {/* 西方玩家 */}
          <div className="row-start-2">
            <CardArea 
              position="west"
              cards={players.west.cards}
              isDealer={players.west.isDealer}
              gamePhase={gamePhase}
              onDeclare={() => {}}
              onPlayCard={() => {}}
            />
          </div>

          {/* 东方玩家 */}
          <div className="col-start-3 row-start-2">
            <CardArea 
              position="east"
              cards={players.east.cards}
              isDealer={players.east.isDealer}
              gamePhase={gamePhase}
              onDeclare={() => {}}
              onPlayCard={() => {}}
            />
          </div>

          {/* 南方玩家 */}
          <div className="col-start-2 row-start-3">
            <CardArea 
              position="south"
              cards={players.south.cards}
              isDealer={players.south.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={true}
              onDeclare={() => {}}
              onPlayCard={() => {}}
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

        {/* 管理面板 */}
        <AdminPanel 
          onInitialize={() => {
            // 初始化游戏逻辑
            const shuffledDeck = shuffleDeck(deck);
            // 分发卡牌给玩家
            setPlayers(prev => ({
              ...prev,
              north: { ...prev.north, cards: shuffledDeck.slice(0, 13) },
              east: { ...prev.east, cards: shuffledDeck.slice(13, 26) },
              south: { ...prev.south, cards: shuffledDeck.slice(26, 39) },
              west: { ...prev.west, cards: shuffledDeck.slice(39, 52) }
            }));
            setGamePhase('dealing');
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
  const [centralSelectedCards, setCentralSelectedCards] = useState<string[]>([]);
  const { points, addCardToCamp, cleanPoint }: {
    points: PointsState;
    addCardToCamp: (camp: Camp, card: string, points: number) => void;
    cleanPoint: (camp: Camp) => void;
  } = usePoints();
  const { roundState, setLeadingSuit, setLeadingPlayer, setCardGroup, nextRound } = useGameRoundTracker();
  const [gamePhase, setGamePhase] = useState<GamePhase>('initial');
  const [redUpLevel, setRedUpLevel] = useState<number>(2);
  const [blueUpLevel, setBlueUpLevel] = useState<number>(2);
  const [players, setPlayers] = useState<Record<Position, Player>>({
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

// ... rest of the file remains unchanged ...
