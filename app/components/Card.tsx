'use client';

type CardProps = {
  card: string;
  size?: 'normal' | 'small';
};

export function Card({ card, size = 'normal' }: CardProps) {
  if (!card) return null;

  const suit = card.charAt(0); // 提取花色
  const value = card.substring(1); // 提取数值

  // **花色符号**
  const suitSymbols: Record<string, string> = {
    H: '♥', D: '♦', S: '♠', C: '♣',
    B: '🃏', // 大王
    R: '🃏'  // 小王
  };

  // **确定颜色**
  const suitColors: Record<string, string> = {
    H: 'text-red-500', D: 'text-red-500',
    S: 'text-gray-800', C: 'text-gray-800',
    B: 'text-red-600', R: 'text-blue-500' // 大小王的颜色
  };

  // **转换 A, J, Q, K**
  const valueMap: Record<string, string> = {
    '1': 'A', '11': 'J', '12': 'Q', '13': 'K'
  };
  const displayValue = valueMap[value] || value;

  // **大小王处理**
  const isJoker = suit === 'B' || suit === 'R';

  // **JOKER 竖排显示**
  const jokerText = (
    <span className="tracking-[-2px] rotate-90 origin-left inline-block mx-1 ">
      JOKER
    </span>
  );
  // **卡片大小样式**
  const sizeClasses = size === 'small'
    ? 'w-8 h-12 text-xs p-1'
    : 'w-12 h-16 text-sm p-2';

  return (
    <div className={`relative flex flex-col items-center justify-center bg-white rounded-md shadow-md border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer ${sizeClasses} ${suitColors[suit]}`}>
      {/* 左上角，普通牌显示值，王牌竖排 */}
      <div className="absolute top-1 left-1 font-bold text-xs ">
        {isJoker ? jokerText : displayValue}
      </div>

      {/* 花色图标 */}
      <div className={size === 'small' ? 'text-lg' : 'text-xl'}>
        {suitSymbols[suit] || ''}
      </div>

      {/* 右下角，普通牌显示值，王牌竖排（翻转180度） */}
      <div className="absolute bottom-1 right-1 font-bold text-xs transform rotate-180">
        {isJoker ? jokerText : displayValue}
      </div>
    </div>
  );
}
