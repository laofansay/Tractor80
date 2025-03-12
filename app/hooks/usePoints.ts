import { useState } from "react";

// 定义 Camp（阵营）类型
// 定义 Points（分数数据）类型


// 定义整个状态类型
type PointsState = Record<Camp, Point>;

// 定义整个状态类型

// 创建 usePoints Hook
export function usePoints() {
    // 初始化状态
    const [points, setPoints] = useState<PointsState>({
        red: { cards: [], scores: 0, swap: false, offsetLevel: 0 },
        blue: { cards: [], scores: 0, swap: false, offsetLevel: 0 },
    });

    // **更新卡牌 & 计算分数**
    const addCardToCamp = (camp: Camp, card: string, cardScore: number) => {
        setPoints((prev) => ({
            ...prev,
            [camp]: {
                cards: [...prev[camp].cards, card], // 追加卡牌
                scores: prev[camp].scores + cardScore, // 计算总分
            },
        }));
    };


    // **清空卡牌 & 重置分数**
    const cleanPoint = (camp: Camp) => {
        setPoints((prev) => ({
            ...prev,
            [camp]: {
                cards: [],           // 清空卡牌
                scores: 0,           // 重置分数
                swap: prev[camp].swap, // 保持swap状态
                offsetLevel: prev[camp].offsetLevel, // 保持offsetLevel
            },
        }));
    };

    return { points, addCardToCamp, cleanPoint };
}