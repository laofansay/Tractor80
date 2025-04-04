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
import { init } from 'next/dist/compiled/webpack/webpack';

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
    initRound,
    gamePhase,
    setGamePhase,
    redUpLevel,
    setRedUpLevel,
    blueUpLevel,
    setBlueUpLevel,
    players,
    setPlayers,
    dealerPosition,
    setDealerPosition,
    availableSuits, setAvailableSuits ,
    currentPlayer, setCurrentPlayer,
    masterPlayerRound,
    setMasterPlayerRound
   } = useGameState();

  const [deckCards, setDeckCards] = useState<string[]>([]);



// 添加 useEffect 处理 bot 自动出牌
useEffect(() => {
  if (!currentPlayer || gamePhase !== 'playing') return;
  
  if (players[currentPlayer].isBot) {
    const timer = setTimeout(() => {
      handleAIPlay(currentPlayer);
    }, 800);
    
    return () => clearTimeout(timer);
  }
  if (players[dealerPosition].isBot) {
    const timer = setTimeout(() => {
      // 选择最小的6张牌扣底
      // const sortedCards = [...players[dealerPosition].cards].sort((a, b) => 
      //   getCardOrderValue(a, players.obs.trumpSuit) - getCardOrderValue(b, players.obs.trumpSuit)
      // );
      //const cardsToDiscard = sortedCards.slice(0, 6);
      //handleBottomCards(cardsToDiscard);
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [currentPlayer, gamePhase]);

  //洗牌
  const handleInitialize = () => {
    setGamePhase('initial')
    const shuffledDeck = shuffleDeck(deck);
    setPlayers(prev => ({
      ...prev,
      obs: {
        ...prev.obs,
        cards: shuffledDeck,
        trumpSuit: ''
      },
      north: { ...prev.north, cards: [], isDdeclareTrump: false },
      east: { ...prev.east, cards: [], isDdeclareTrump: false },
      south: { ...prev.south, cards: [], isDdeclareTrump: false },
      west: { ...prev.west, cards: [], isDdeclareTrump: false }
    }));
  };
 // 亮主：声明主权
 const onDeclareTrump = (card:string, position:Position) => {
  if (players.obs.isDdeclareTrump) return 
  if (gamePhase === 'dealing' && players[position].cards.length>0 &&  !players.obs.isDdeclareTrump) {
    
    if (players[position].isBot){
      const suits=['S','H','C','D']  ;
      for (const suit  of suits){
        if(players[position].cards.includes(suit+'2')){
          const has5_10_K=players[position].cards.includes(suit+'5') || players[position].cards.includes(suit+'10') || players[position].cards.includes(suit+'K');
          const sameSuitCards=players[position].cards.filter(c=>c.charAt(0)===suit); 
          if (has5_10_K && sameSuitCards.length>7){
            setDealerPosition(position);
            setPlayers(prev => ({
              ...prev,
              obs: {
                ...prev.obs,
                isDdeclareTrump: true,  
                isDealer:true,
                trumpSuit: suit
              },
              [position]: {
                ...prev[position],
                isDdeclareTrump: true
              }
            }));
              if( dealerPosition!="obs"){
                setDealerPosition(position)
              }

            setAvailableSuits([]);
            console.log('bot declare trump:',suit); 
          }
        }
      } 
    }else{
      //玩家亮主
      if(card.charAt(1)==='2' || card.charAt(0)=='B' || card.charAt(0)=='R'   ){
        setAvailableSuits(pre=> [...pre,card.charAt(0)]);
      } 
    }
  }
};





const onDealCard = (card:string, position:Position) => {
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
};

//面板亮主
const swearTrump = (suit:string ,position:Position) => {
    if (players.obs.isDdeclareTrump) return 
    if ((gamePhase === 'dealing'  ||gamePhase === 'trumpSelection') && ["B","R", suit].some(s => availableSuits.includes(s)) &&  !players.obs.isDdeclareTrump) {
      setDealerPosition (position);
      setPlayers(prev => ({
        ...prev,
        obs: {
          ...prev.obs,
          isDdeclareTrump: true,  
          trumpSuit: suit
        },
        [position]: {
          ...prev[position],
          isDdeclareTrump: true,
          isDealer:true
        }
      }));
        if( dealerPosition==null){
          setDealerPosition(position)
        }
      setAvailableSuits([]);
      setGamePhase('pickBottomCards')
      console.log(' south declare trump:',suit); 
  };
} 
  //发牌结束
  const onDealComplete = () => {
    if (!players.obs.isDdeclareTrump ) {
      setGamePhase('trumpSelection')
    }else{
      setGamePhase('pickBottomCards')
    }
      
  };
  // 庄家拾底
  const pickBottomCards = () => {
    if (gamePhase !== 'pickBottomCards' || !dealerPosition) return;
    // 获取OBS玩家的最后6张牌作为底牌
    const obsCards = players.obs.cards;
    const lastSixCards = obsCards.slice(-6);
    setPlayers(prev => ({
      ...prev,
      [dealerPosition]: {
        ...prev[dealerPosition],
        cards: [...prev[dealerPosition].cards, ...lastSixCards] // ✅ 正确合并牌
      },
      obs: {
        ...prev.obs,
        cards: obsCards.slice(0, obsCards.length - 6) // ✅ 更新OBS玩家的牌堆
      }
    }));

  
    console.log(players)
    // 更新状态
    //setBottomCards(lastSixCards); // 保存底牌以便后续使用
    setGamePhase('bottomCards'); //埋底阶段
    // 确保当前玩家仍然是庄家 
    setCurrentPlayer(dealerPosition);
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
    initRound;

  };

  

  // 处理玩家出牌
  const handlePlayCard = (cards: string[], position: Position) => {
    // 播放出牌音效
    soundEffect.preloadSound('playCard', '/sounds/send-card.mp3');
    soundEffect.playSound('playCard');
    // 验证出牌是否符合规则
    const validationResult = validateCardPlay(position, cards, players.obs.currentRound);

    if (!validationResult.valid) {
      // 如果出牌不符合规则，可以显示错误信息
      alert(validationResult.message);
     // return;
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
    const isFirstPlay =roundState.roundNumber==0
    if (isFirstPlay) {
      const leadingSuit = getCardSuit(cards, players.obs.trumpSuit , '2');
      setLeadingSuit(leadingSuit);
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

        if (compareResult === 1) {
          // 如果当前出牌更大，更新最大玩家
          setLeadingPlayer(position);
        }
      }
    }
    // 进入下一回合
    nextRound();
    // 设置下一个出牌玩家
    const nextPlayer = getNextPlayer(position);
    setCurrentPlayer(nextPlayer)

  };


// 出牌回合监听
useEffect(() => {
  if (gamePhase !== 'playing' || !dealerPosition) return;
    // 检查是否所有玩家都已出牌
    if (roundState.roundNumber===4) {
      // 回合结束，计算得分并开始新回合
      handleRoundEnd();
    }
}, [roundState.roundNumber, gamePhase]);




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
        if (value === '5') {
          roundScore += 5;
          addCardToCamp(winnerCamp, card, roundScore);
        }
        else if (value === '10' || value === 'K') {
          roundScore += 10;
          addCardToCamp(winnerCamp, card, roundScore);
        }

         
      });
    });

   
    initRound();

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

    // 检查是否最后一回合，一局结束
    const allCardsPlayed = Object.values(players).every(player =>
      player.isObs || player.cards.length === 0
    );
    // 重置庄家。根据得分判断庄家
    let position="south"
    setCurrentPlayer(winnerPosition);
    setDealerPosition("obs");
    if (allCardsPlayed) {
      // 游戏结束，可以显示结算界面或重新开始
      alert('游戏结束！');

      // 这里可以添加游戏结束的逻辑
       // 设置下一回合的首出玩家
      //设置下一局的庄家
      setPlayers(prev => ({
        ...prev,
       
        north: { 
          cards: [], 
          isDealer: position === 'north', 
          isBot: true, 
          camp: 'red', 
          isDdeclareTrump: false,
          currentRound: { north: [], east: [], south: [], west: [], obs: [] },
          lastRound: { north: [], east: [], south: [], west: [], obs: [] },
          trumpSuit: ''
        },
        east: { 
          cards: [], 
          isDealer: position === 'east', 
          isBot: true, 
          camp: 'blue', 
          isDdeclareTrump: false,
          currentRound: { north: [], east: [], south: [], west: [], obs: [] },
          lastRound: { north: [], east: [], south: [], west: [], obs: [] },  
          trumpSuit: ''
        },
        south: { 
          cards: [], 
          isDealer: position === 'south', 
          isBot: false, 
          camp: 'red', 
          isDdeclareTrump: false,
          currentRound: { north: [], east: [], south: [], west: [], obs: [] },
          lastRound: { north: [], east: [], south: [], west: [], obs: [] },
            trumpSuit: ''
        },
        west: { 
          cards: [], 
          isDealer: position === 'west', 
          isBot: true, 
          camp: 'blue', 
          isDdeclareTrump: false,
          currentRound: { north: [], east: [], south: [], west: [], obs: [] },
          lastRound: { north: [], east: [], south: [], west: [], obs: [] },
            trumpSuit: ''
          
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
          trumpSuit: ''}
      }));
      handleInitialize();
    } 
     
  };


  // 处理出牌逻辑
  // 处理AI玩家自动出牌
  const handleAIPlay = (position: Position) => {
    if (!players[position].isBot) return;
    // 使用AI策略选择要出的牌
    const selectedCards = selectCardsToPlay(
      players[position].cards,
      players.obs.currentRound,
      players.obs.trumpSuit
    );
    // 调用出牌函数
    handlePlayCard(selectedCards, position);
  };

 

  // 获取下一个玩家位置
  const getNextPlayer = (currentPos: Position): Position => {
    const positions: Position[] = ['north', 'east', 'south', 'west'];
    const currentIndex = positions.indexOf(currentPos);
    return positions[(currentIndex + 1) % 4];
  };
  

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-start-2 row-start-2">
            <DeckArea 
              cards={players.obs.cards}
              gamePhase={gamePhase}
              onDealComplete={onDealComplete }
              onDeclareTrump={onDeclareTrump }
              onDealCard={onDealCard}
              northPlayedCards={players.obs.currentRound.north}
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
              isCurrentPlayer={currentPlayer === 'north' }
              isTrumpSuit={players.north.isDdeclareTrump}
              trumpSuit={players.obs.trumpSuit}
              trumpPoint={null}
              onSelectBottomCards={handleBottomCards}
              onPlayCard={(cards) => handlePlayCard(cards, 'north')}
            />
          </div>

          <div className="row-start-2">
            <CardArea 
              position="west"
              cards={players.west.cards}
              isDealer={players.west.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={currentPlayer=== 'west' }
              trumpSuit={players.obs.trumpSuit}
              trumpPoint={null}
              onSelectBottomCards={handleBottomCards}
              onPlayCard={(cards) => handlePlayCard(cards, 'west')}
            />
          </div>

          <div className="col-start-3 row-start-2">
            <CardArea 
              position="east"
              cards={players.east.cards}
              isDealer={players.east.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={currentPlayer === 'east'}
              isTrumpSuit={players.east.isDdeclareTrump}
              trumpSuit={players.obs.trumpSuit}
              trumpPoint={null}
              onSelectBottomCards={handleBottomCards}
              onPlayCard={(cards) => handlePlayCard(cards, 'east')}
            />
          </div>

          <div className="col-start-2 row-start-3">
            <CardArea 
              position="south"
              cards={players.south.cards}
              isDealer={players.south.isDealer}
              gamePhase={gamePhase}
              isCurrentPlayer={currentPlayer=== 'south' }
              isTrumpSuit={players.south.isDdeclareTrump}
              trumpSuit={players.obs.trumpSuit}
              trumpPoint={null}
              onSelectBottomCards={handleBottomCards}
              onPlayCard={(cards) => handlePlayCard(cards, 'south')}
            />
          </div>
        </div>

        <ScorePanel 
          points={points}
          rulingParty={players.south.camp}
          redUpLevel={redUpLevel}
          blueUpLevel={blueUpLevel}
          lastRound={players.obs.lastRound}
        />

        <TrumpSelectionPanel
          onSwearTrump={swearTrump}
          gamePhase={gamePhase}
          availableSuits={availableSuits}
          trumpSuit={players.obs.trumpSuit!}
        />

        <AdminPanel 
          onInitialize={handleInitialize}
          onDeal={() => {
            setGamePhase('dealing');
          }}
          onPickBottomCards={pickBottomCards}
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
  const { roundState, setLeadingSuit, setLeadingPlayer, setCardGroup, nextRound,initRound } = useGameRoundTracker();
  const [gamePhase, setGamePhase] = useState<GamePhase>('initial');
  const [redUpLevel, setRedUpLevel] = useState<string>("2");
  const [blueUpLevel, setBlueUpLevel] = useState<string>("2");
  const [dealerPosition, setDealerPosition] = useState<Position>("obs");
  const [availableSuits, setAvailableSuits] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Position>();
  const [masterPlayerRound, setMasterPlayerRound] = useState<Position>("obs");

    


  const [players, setPlayers] = useState<Record<Position, Player>>({
    north: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'red', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] },
      trumpSuit: ''
    },
    east: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'blue', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] },  
      trumpSuit: ''
    },
    south: { 
      cards: [], 
      isDealer: false, 
      isBot: false, 
      camp: 'red', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] },
        trumpSuit: ''
    },
    west: { 
      cards: [], 
      isDealer: false, 
      isBot: true, 
      camp: 'blue', 
      isDdeclareTrump: false,
      currentRound: { north: [], east: [], south: [], west: [], obs: [] },
      lastRound: { north: [], east: [], south: [], west: [], obs: [] },
        trumpSuit: ''
      
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
      trumpSuit: ''
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
    initRound,
    gamePhase,
    setGamePhase,
    redUpLevel,
    setRedUpLevel,
    blueUpLevel,
    setBlueUpLevel,
    players,
    setPlayers,
    dealerPosition,
    setDealerPosition,
    availableSuits, setAvailableSuits,
    currentPlayer,
    setCurrentPlayer,
    masterPlayerRound,
    setMasterPlayerRound

  };
}

