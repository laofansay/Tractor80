export function calculateLevelChange(score: number, currentLevel: number): number {
    let levelChange = 0;

    if (score === 0) {
        levelChange = 3;
    } else if (score >= 20 && score < 35) {
        levelChange = 2;
    } else if (score >= 35 && score < 40) {
        levelChange = 1;
    } else if (score >= 40 && score < 60) {
        levelChange = -1;
    } else if (score >= 60 && score < 80) {
        levelChange = -2;
    } else if (score >= 80) {
        levelChange = -3;
    }

    return currentLevel + levelChange;
}