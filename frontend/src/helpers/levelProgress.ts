const LEVEL_START_THRESHOLDS = [0, 50, 100, 200, 350] as const;

export type LevelProgress = {
	currentLevel: number;
	currentLevelStart: number;
	nextLevel: number | null;
	nextLevelTarget: number | null;
	xpToNextLevel: number;
	progressPercent: number;
	isMaxLevel: boolean;
};

export function getLevelProgress(totalPoints: number): LevelProgress {
	const safeTotalPoints = Math.max(0, totalPoints);
	let currentLevel = 1;

	for (let index = LEVEL_START_THRESHOLDS.length - 1; index >= 0; index -= 1) {
		if (safeTotalPoints >= LEVEL_START_THRESHOLDS[index]) {
			currentLevel = index + 1;
			break;
		}
	}

	const currentLevelStart = LEVEL_START_THRESHOLDS[currentLevel - 1];
	const nextLevel = currentLevel < LEVEL_START_THRESHOLDS.length ? currentLevel + 1 : null;
	const nextLevelTarget = nextLevel === null ? null : LEVEL_START_THRESHOLDS[currentLevel];
	const xpToNextLevel = nextLevelTarget === null ? 0 : Math.max(nextLevelTarget - safeTotalPoints, 0);
	const progressPercent =
		nextLevelTarget === null
			? 100
			: Math.min(
				100,
				Math.max(
					0,
					Math.round(
						((safeTotalPoints - currentLevelStart) /
							(nextLevelTarget - currentLevelStart)) *
							100,
					),
				),
			);

	return {
		currentLevel,
		currentLevelStart,
		nextLevel,
		nextLevelTarget,
		xpToNextLevel,
		progressPercent,
		isMaxLevel: nextLevel === null,
	};
}