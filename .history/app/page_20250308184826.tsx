'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';

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
    north: { cards: [], isDealer: false },
    east: { cards: [], isDealer: false },
    south: { cards: [], isDealer: false },
    west: { cards: [], isDealer: false }
  });
  const [deck, setDeck] = useState < string[] > ([]);
  const [bottomCards, setBottomCards] = useState < string[] > ([]);
  const [dealerPosition, setDealerPosition] = useState < Position | null > (null);
  const [currentPlayer, setCurrentPlayer] = useState<Position | null>(null);
  const [playedCards, setPlayedCards] = useState<string[]>([]);

  // 初始化牌堆
  const initializeDeck = () => {
    const suits = ['H', 'D', 'S', 'C']; // 红桃、方块、黑桃、梅花
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

    let newDeck: string[] = [];

    // 生成52张普通牌
    suits.forEach(suit => {
      values.forEach(value => {
        newDeck.push(`${suit}${value}`);
      });
    });

    // 添加大小王
    newDeck.push('J0'); // 小王
    newDeck.push('B0'); // 大王

    // 洗牌
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    setDeck(newDeck);
    setGamePhase('initial');

    // 重置玩家状态
    setPlayers({
      north: { cards: [], isDealer: false },
      east: { cards: [], isDealer: false },
      south: { cards: [], isDealer: false },
      west: { cards: [], isDealer: false }
    });
    setDealerPosition(null);
    setBottomCards([]);
  };

  // 发牌
  const dealCards = () => {
    setGamePhase('dealing');

    // 模拟发牌动画
    let currentDeck = [...deck];
    let newPlayers = { ...players };

    // 每个玩家12张牌
    const positions: Position[] = ['north', 'east', 'south', 'west'];

    // 模拟发牌过程（简化版，实际应用中可以添加动画效果）
    positions.forEach(position => {
      newPlayers[position].cards = currentDeck.splice(0, 12);
    });

    // 剩余6张作为底牌
    setBottomCards(currentDeck);
    setPlayers(newPlayers);
    setDeck([]);

    // 发牌后进入选择庄家阶段
    setGamePhase('trumpSelection');
  };

  // 玩家亮主成为庄家
  const declareTrump = (position: Position) => {
    if (gamePhase !== 'trumpSelection' || dealerPosition !== null) return;

    // 设置庄家
    setDealerPosition(position);

    const newPlayers = { ...players };
    Object.keys(newPlayers).forEach(pos => {
      newPlayers[pos as Position].isDealer = pos === position;
    });

    setPlayers(newPlayers);
    setGamePhase('pickBottomCards');
  };

  // 庄家拾底
  const pickBottomCards = () => {
    if (gamePhase !== 'pickBottomCards' || !dealerPosition) return;

    // 将底牌加入庄家的牌组
    const newPlayers = { ...players };
    newPlayers[dealerPosition].cards = [...newPlayers[dealerPosition].cards, ...bottomCards];
    setPlayers(newPlayers);
    setBottomCards([]);

    // 进入扣底阶段
    setGamePhase('bottomCards');
  };

  // 庄家扣底
  const handleBottomCards = (selectedCards: string[]) => {
    if (gamePhase !== 'bottomCards' || !dealerPosition || selectedCards.length !== 6) return;

    // 庄家选择6张牌扣底
    const newPlayers = {...players};
    const dealerCards = [...newPlayers[dealerPosition].cards, ...bottomCards];

    // 移除选中的牌
    selectedCards.forEach(card => {
      const index = dealerCards.indexOf(card);
      if (index !== -1) {
        dealerCards.splice(index, 1);
      }
    });

    newPlayers[dealerPosition].cards = dealerCards;
    setPlayers(newPlayers);
    setBottomCards(selectedCards); // 扣底的牌归属BOT玩家

    // 进入出牌阶段，设置庄家为当前出牌玩家
    setGamePhase('playing');
    setCurrentPlayer(dealerPosition);
  };

  // 获取下一个玩家位置
  const getNextPlayer = (currentPos: Position): Position => {
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    const currentIndex = positions.indexOf(currentPos);
    return positions[(currentIndex + 1) % 4];
  };

  // 出牌
  const playCard = (position: Position, cards: string[]) => {
    if (gamePhase !== 'playing' || position !== currentPlayer || cards.length === 0) return;

    const newPlayers = {...players};
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

    // 设置下一个出牌玩家
    setCurrentPlayer(getNextPlayer(position));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="relative w-full max-w-6xl aspect-square p-12 rounded-3xl bg-green-800/30 backdrop-blur-md shadow-2xl border border-green-600/20">
        {/* 北方玩家区域 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 transform transition-transform hover:scale-105">
          <CardArea
            position="north"
            cards={players.north.cards}
            isDealer={players.north.isDealer}
            isCurrentPlayer={currentPlayer === 'north'}
            onDeclare={() => declareTrump('north')}
            onPlayCard={(card) => playCard('north', [card])}
            onSelectBottomCards={handleBottomCards}
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
            onDeclare={() => declareTrump('west')}
            onPlayCard={(card) => playCard('west', [card])}
            onSelectBottomCards={handleBottomCards}
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
            onDeclare={() => declareTrump('east')}
            onPlayCard={(card) => playCard('east', [card])}
            onSelectBottomCards={handleBottomCards}
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
            onDeclare={() => declareTrump('south')}
            onPlayCard={(card) => playCard('south', [card])}
            onSelectBottomCards={handleBottomCards}
            gamePhase={gamePhase}
          />
        </div>

        {/* 中央牌堆区域 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 aspect-square bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl border border-green-700/50 backdrop-blur-lg transform transition-all duration-300 hover:scale-105 hover:shadow-green-900/50 flex flex-col items-center justify-center">
          <span className="text-green-100 text-xl font-semibold tracking-wider mb-2">牌堆</span>

          {/* 显示牌堆或底牌 */}
          {deck.length > 0 && (
            <div className="text-green-200 text-sm">{deck.length}张牌</div>
          )}

          {bottomCards.length > 0 && (
            <div className="text-yellow-200 text-sm">{bottomCards.length}张底牌</div>
          )}

          {gamePhase === 'bottomCards' && dealerPosition && (
            <div className="mt-2 text-white text-xs">
              庄家正在查看底牌
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
        />
      </div>
    </main>
  );
}
