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
import { usePoints, PointsState } from "./hooks/usePoints";

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

  const [deckCards, setDeckCards] = useState<string[]>([]);

  const handleInitialize = () => {
    const shuffledDeck = shuffleDeck(deck);
    setPlayers(prev => ({
      ...prev,
      obs: {
        ...prev.obs,
        cards: shuffledDeck,
        trumpSuit: 'H'
      },
      north: { ...prev.north, cards: [], isDdeclareTrump: false },
      east: { ...prev.east, cards: [], isDdeclareTrump: false },
      south: { ...prev.south, cards: [], isDdeclareTrump: false },
      west: { ...prev.west, cards: [], isDdeclareTrump: false }
    }));
  };

  const handlePlayCard = (cards: string[], position: Position) => {
    // 处理出牌逻辑
    // ...
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-start-2 row-start-2">
            <DeckArea 
              cards={players.obs.cards}
              gamePhase={gamePhase}
              onDealComplete={() => setGamePhase('trumpSelection')}
              onDealCard={(card, position) => {
                setPlayers(prev => {
                  const newPlayers = {
                    ...prev,
                    [position]: {
                      ...prev[position],
                      cards: [...prev[position].cards, card]
                    },
                    obs: {
                      ...prev.obs,
                      cards: prev.obs.cards.filter(c => c !== card)
                    }
                  };

                  // 检查是否已发完48张牌
                  if (newPlayers.obs.cards.length === 6) {
                    // 确保每人12张牌
                    const playerCards = {
                      north: newPlayers.north.cards,
                      east: newPlayers.east.cards,
                      south: newPlayers.south.cards,
                      west: newPlayers.west.cards
                    };
                    
                    if (playerCards.north.length === 12 &&
                        playerCards.east.length === 12 &&
                        playerCards.south.length === 12 &&
                        playerCards.west.length === 12) {
                      setGamePhase('trumpSelection');
                    }
                  }

                  return newPlayers;
                });
              }}
              northPlayedCards={players.north.currentRound.north}
              eastPlayedCards={players.obs.currentRound.east}
              southPlayedCards={players.obs.currentRound.south}
              westPlayedCards={players.obs.currentRound.west}
            />
          </div>

          <div className="col-start-2">
            <CardArea 
              position="north"
              cards={players.north.cards}
              isDealer={players.north.isDealer}
              gamePhase={gamePhase}
              onDeclare={() => {}}
              onPlayCard={(cards) => handlePlayCard(cards, 'north')}
            />
          </div>

          <div className="row-start-2">
            <CardArea 
              position="west"
              cards={players.west.cards}
              isDealer={players.west.isDealer}
              gamePhase={gamePhase}
              onDeclare={() => {}}
              onPlayCard={(cards) => handlePlayCard(cards, 'west')}
            />
          </div>

          <div className="col-start-3 row-start-2">
            <CardArea 
              position="east"
              cards={players.east.cards}
              isDealer={players.east.isDealer}
              gamePhase={gamePhase}
              onDeclare={() => {}}
              onPlayCard={(cards) => handlePlayCard(cards, 'east')}
            />
          </div>

          <div className="col-start-2 row-start-3">
            <CardArea 
              position="south"
              cards={players.south.cards}
              isDealer={players.south.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={true}
              isTrumpSuit={true}
              onDeclare={() => {}}
              onPlayCard={(cards) => handlePlayCard(cards, 'south')}
            />
          </div>
        </div>

        <ScorePanel 
          points={points}
          rulingParty={players.south.camp}
          redUpLevel={redUpLevel}
          blueUpLevel={blueUpLevel}
        />

        <TrumpSelectionPanel
          onSelectTrump={(trumpSuit) => {
            setPlayers(prev => ({
              ...prev,
              north: { ...prev.north, isDdeclareTrump: false },
              east: { ...prev.east, isDdeclareTrump: false },
              south: { ...prev.south, isDdeclareTrump: true },
              west: { ...prev.west, isDdeclareTrump: false },
              obs: {
                ...prev.obs,
                trumpSuit: trumpSuit || ''
              }
            }));
          }}
          gamePhase={gamePhase}
          availableSuits={[]}
          trumpSuit={players.obs.trumpSuit!}
          playerCards={players.south.cards}
          isSouthPlayer={true}
          isTrumpDeclared={!!(players.south.isDdeclareTrump || 
                            players.north.isDdeclareTrump || 
                            players.east.isDdeclareTrump || 
                            players.west.isDdeclareTrump)}
        />

        <AdminPanel 
          onInitialize={handleInitialize}
          onDeal={() => {
            setGamePhase('dealing');
          }}
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
    north: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'red', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] }
    },
    east: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'blue', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] }
    },
    south: { 
      cards: [], 
      isDealer: false, 
      isBot: false, 
      camp: 'red', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] }
    },
    west: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'blue', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] }
    },
    obs: {
      cards: [], 
      isDealer: false, 
      isObs: true, 
      camp: 'red', 
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
      trumpSuit: 'H'
    } as const,
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
