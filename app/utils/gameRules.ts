/**
 * 游戏规则模块 - 管理升级游戏的规则逻辑
 */

import { Position } from '../components/constant/Constant';
import { getCardSuit } from './poker';

/**
 * 检查出牌是否符合规则
 * @param position 当前出牌玩家位置
 * @param cards 要出的牌
 * @param currentRound 当前回合的出牌记录
 * @returns 返回检查结果，包含是否合法和错误信息
 */
export const validateCardPlay = (
    position: Position,
    cards: string[],
    currentRound: Record<Position, string[]>
): { valid: boolean; message?: string } => {
    // 基本检查：必须出牌
    if (cards.length === 0) {
        return { valid: false, message: '请选择要出的牌' };
    }

    // 检查出牌数量是否与首位出牌玩家相同
    const positions: Position[] = ['north', 'east', 'south', 'west'];

    // 找到第一个出牌的玩家
    const firstPlayer = positions.find(pos => currentRound[pos]?.length > 0);

    // 如果不是第一个出牌的玩家，检查出牌张数是否一致
    if (firstPlayer && firstPlayer !== position) {
        const firstPlayerCardCount = currentRound[firstPlayer].length;
        if (cards.length !== firstPlayerCardCount) {
            return {
                valid: false,
                message: `请出${firstPlayerCardCount}张牌，与第一位出牌玩家相同`
            };
        }

        // 检查花色是否符合规则
        const firstPlayerCards = currentRound[firstPlayer];
        const leadingSuit = getCardSuit(firstPlayerCards, '', '2'); // 获取首出花色

        // 获取当前玩家手牌中与首出花色相同的牌
        const sameSuitCards = cards.filter(card => getCardSuit([card], '', '2') === leadingSuit);

        // 如果玩家有与首出花色相同的牌，必须出该花色的牌
        if (leadingSuit && sameSuitCards.length === 0) {
            // 检查玩家手牌中是否有首出花色的牌
            const playerCards = currentRound[position] || [];
            const hasSameSuitCard = playerCards.some(card => getCardSuit([card], '', '2') === leadingSuit);

            if (hasSameSuitCard) {
                return {
                    valid: false,
                    message: `必须出${leadingSuit}花色的牌`
                };
            }
        }
    }

    // 所有检查通过
    return { valid: true };
};

/**
 * 检查是否可以亮主
 * @param position 玩家位置
 * @param card 当前牌
 * @param dealerPosition 当前庄家位置
 * @returns 是否可以亮主
 */
export const canDeclareTrump = (
    position: Position,
    card: string,
    dealerPosition: Position | null
): boolean => {
    // 如果已经有庄家了，不能再亮主
    if (dealerPosition !== null) return false;

    // 检查牌是否为2或大小王
    const cardValue = card.substring(1);
    return cardValue === '2' || cardValue === '0';
};

/**
 * 检查是否可以扣底
 * @param position 玩家位置
 * @param selectedCards 选中的牌
 * @param dealerPosition 庄家位置
 * @param gamePhase 游戏阶段
 * @returns 检查结果
 */
export const validateBottomCards = (
    position: Position,
    selectedCards: string[],
    dealerPosition: Position | null,
    gamePhase: string
): { valid: boolean; message?: string } => {
    // 检查是否在扣底阶段
    if (gamePhase !== 'bottomCards') {
        return { valid: false, message: '当前不是扣底阶段' };
    }

    // 检查是否是庄家
    if (position !== dealerPosition) {
        return { valid: false, message: '只有庄家可以扣底' };
    }

    // 检查扣底牌数是否为6张
    if (selectedCards.length !== 6) {
        return { valid: false, message: '请选择6张牌作为底牌' };
    }

    return { valid: true };
};