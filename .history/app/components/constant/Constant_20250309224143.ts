type GamePhase = 'initial' | 'dealing' | 'trumpSelection' | 'pickBottomCards' | 'bottomCards' | 'playing';
type Position = 'north' | 'east' | 'south' | 'west' | 'obs';
type Camp = 'red' | 'blue';

type Player = {
    cards: string[];
    isDealer: boolean;
    selectedCards: string[];
};