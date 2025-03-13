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


    // **获取分数** 
    const getEnemySorce = (camp: Camp): number => {
        if (camp === 'red') {
            return points.blue.scores
        } else {
            return points.red.scores
        }
    };

    //已算庄家是否可以升级
    const canUpgrade = (camp: Camp): number => {
        const source = getEnemySorce(camp); // 获取敌方分数
        let upgradePoints = 0; // 升级点数，默认0
        if (source === 0) {
            return 3; // 敌方得0分，不升级
        } else if (source >= 5 && source <= 20) {
            upgradePoints = 2; // 5-25分，不变
        } else if (source >= 25 && source <= 40) {
            upgradePoints = 1; // 30-39分，升1级
        } else if (source >= 45 && source < 55) {
            upgradePoints = -1; // 45-54分，降1级
        } else if (source >= 55 && source < 65) {
            upgradePoints = -2; // 55-64分，降2级
        } else if (source >= 75) {
            upgradePoints = -3; // 75分及以上，降2级
        }
        return upgradePoints;
    };

    // **清空卡牌 & 重置分数**
    const cleanPoint = (camp: Camp) => {
        setPoints((prev) => ({
            ...prev,
            [camp]: {
                cards: [],           // 清空分值卡牌
                scores: 0,           // 重置分数
                swap: prev[camp].swap, // 保持swap状态
                offsetLevel: prev[camp].offsetLevel, // 保持offsetLevel
            },
        }));
    };
    return { points, addCardToCamp, cleanPoint };
}