'use client';

type CardProps = {
  card: string;
};

export function Card({ card }: CardProps) {
  // 解析卡牌字符串，例如 "H10" 表示红桃10
  const suit = card.charAt(0);
  const value = card.substring(1);
  
  // 根据花色确定颜色
  const getSuitColor = () => {
    switch(suit) {
      case 'H': // 红桃
      case 'D': // 方块
        return 'text-red-500';
      case 'S': // 黑桃
      case 'C': // 梅花
        return 'text-gray-800';
      case 'J': // 小王
        return 'text-blue-500';
      case 'B': // 大王
        return 'text-red-600';
      default:
        return 'text-gray-800';
    }
  };
  
  // 获取花色符号
  const getSuitSymbol = () => {
    switch(suit) {
      case 'H': return '♥';
      case 'D': return '♦';
      case 'S': return '♠';
      case 'C': return '♣';
      case 'J': return '小';
      case 'B': return '大';
      default: return '';
    }
  };
  
  // 获取卡牌值显示
  const getValueDisplay = () => {
    if (suit === 'J') return '王';
    if (suit === 'B') return '王';
    
    switch(value) {
      case '1': return 'A';
      case '11': return 'J';
      case '12': return 'Q';
      case '13': return 'K';
      default: return value;
    }
  };
  
  return (
    <div className={`w-12 h-16 bg-white rounded-md shadow-md flex flex-col items-center justify-center ${getSuitColor()} relative overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer`}>
      <div className="absolute top-1 left-1 text-xs font-bold">
        {getValueDisplay()}
      </div>
      <div className="text-xl">
        {getSuitSymbol()}
      </div>
      <div className="absolute bottom-1 right-1 text-xs font-bold transform rotate-180">
        {getValueDisplay()}
      </div>
    </div>
  );
}