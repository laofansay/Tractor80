'use client';

import { useState, useEffect } from 'react';
import { CardArea } from './components/CardArea';
import { AdminPanel } from './components/AdminPanel';
import { Card } from './components/Card';

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
  const [currentPlayer, setCurrentPlayer] = useState < Position | null > (null);
  const [playedCards, setPlayedCards] = useState < string[] > ([]);
  const [currentRound, setCurrentRound] = useState < Record < Position, string[]>> ({ north: [], east: [], south: [], west: [] });
  const [lastRound, setLastRound] = useState < Record < Position, string[]>> ({ north: [], east: [], south: [], west: [] });
  const [roundCount, setRoundCount] = useState < number > (0);

  // 出牌
  const playCard1 = (position: Position, cards: string[]) => {
    if (gamePhase !== 'playing' || position !== currentPlayer || cards.length === 0) return;

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

    // 更新当前回合的出牌记录
    const newCurrentRound = { ...currentRound };
    newCurrentRound[position] = cards;
    setCurrentRound(newCurrentRound);

    // 设置下一个出牌玩家
    const nextPlayer = getNextPlayer(position);
    setCurrentPlayer(nextPlayer);

    // 如果是最后一个玩家出牌，则结束当前回合
    if (nextPlayer === getNextPlayer('west')) {
      // 保存当前回合记录到上一轮
      setLastRound(newCurrentRound);
      // 清空当前回合记录
      setCurrentRound({ north: [], east: [], south: [], west: [] });
      // 增加回合计数
      setRoundCount(roundCount + 1);
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

  // 出牌
  const playCard = (position: Position, cards: string[]) => {
    if (gamePhase !== 'playing' || position !== currentPlayer || cards.length === 0) return;

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

    // 设置下一个出牌玩家
    setCurrentPlayer(getNextPlayer(position));
  };

  // 初始化牌堆
  const initializeDeck = () => {
    // 创建一副54张牌的扑克牌（包括大小王）
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: string[] = [];

    // 添加普通牌
    for (const suit of suits) {
      for (const value of values) {
        newDeck.push(`${suit}${value}`);
      }
    }

    // 添加大小王
    newDeck.push('🃏R'); // 小王
    newDeck.push('🃏B'); // 大王

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
  };

  // 发牌
  const dealCards = () => {
    if (gamePhase !== 'initial' || deck.length !== 54) return;

    setGamePhase('dealing');

    // 复制当前牌堆
    const currentDeck = [...deck];
    const newPlayers = { ...players };

    // 每个玩家12张牌
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    positions.forEach(position => {
      newPlayers[position].cards = currentDeck.splice(0, 12);
    });

    // 剩下的6张作为底牌
    const remainingCards = currentDeck.splice(0, 6);

    // 随机选择一个玩家作为庄家
    const randomPosition = positions[Math.floor(Math.random() * 4)];
    newPlayers[randomPosition].isDealer = true;

    // 更新状态
    setPlayers(newPlayers);
    setDeck(currentDeck); // 应该为空数组
    setBottomCards(remainingCards);
    setDealerPosition(randomPosition);
    setGamePhase('pickBottomCards');
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
  };

  // 选择庄家
  const declareTrump = (position: Position) => {
    if (gamePhase !== 'trumpSelection') return;

    // 设置庄家
    const newPlayers = { ...players };
    Object.keys(newPlayers).forEach(pos => {
      newPlayers[pos as Position].isDealer = pos === position;
    });

    setPlayers(newPlayers);
    setDealerPosition(position);
    setGamePhase('pickBottomCards');
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

          {/* 显示当前回合的出牌情况 */}
          {gamePhase === 'playing' && (
            <div className="mt-4 w-full px-4">
              <div className="text-green-200 text-sm mb-2">第{roundCount + 1}回合</div>
              {Object.entries(currentRound).map(([pos, cards]) => (
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
      </div>
    </main>
  );
}
