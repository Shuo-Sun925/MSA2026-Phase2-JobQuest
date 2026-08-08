import { describe, expect, it } from "vitest";
import { getLevelProgress } from "../src/helpers/levelProgress";

describe("getLevelProgress", () => {
	it.each([
		{ totalPoints: 0, currentLevel: 1, nextLevel: 2, nextLevelTarget: 50, xpToNextLevel: 50, progressPercent: 0 },
		{ totalPoints: 49, currentLevel: 1, nextLevel: 2, nextLevelTarget: 50, xpToNextLevel: 1, progressPercent: 98 },
		{ totalPoints: 50, currentLevel: 2, nextLevel: 3, nextLevelTarget: 100, xpToNextLevel: 50, progressPercent: 0 },
		{ totalPoints: 99, currentLevel: 2, nextLevel: 3, nextLevelTarget: 100, xpToNextLevel: 1, progressPercent: 98 },
		{ totalPoints: 100, currentLevel: 3, nextLevel: 4, nextLevelTarget: 200, xpToNextLevel: 100, progressPercent: 0 },
		{ totalPoints: 199, currentLevel: 3, nextLevel: 4, nextLevelTarget: 200, xpToNextLevel: 1, progressPercent: 99 },
		{ totalPoints: 200, currentLevel: 4, nextLevel: 5, nextLevelTarget: 350, xpToNextLevel: 150, progressPercent: 0 },
		{ totalPoints: 349, currentLevel: 4, nextLevel: 5, nextLevelTarget: 350, xpToNextLevel: 1, progressPercent: 99 },
	])(
		"maps $totalPoints XP to the correct next-level target",
		({ totalPoints, currentLevel, nextLevel, nextLevelTarget, xpToNextLevel, progressPercent }) => {
			expect(getLevelProgress(totalPoints)).toMatchObject({
				currentLevel,
				nextLevel,
				nextLevelTarget,
				xpToNextLevel,
				progressPercent,
				isMaxLevel: false,
			});
		},
	);

	it("marks level 5 as max level without a fake level 6 target", () => {
		expect(getLevelProgress(350)).toMatchObject({
			currentLevel: 5,
			nextLevel: null,
			nextLevelTarget: null,
			xpToNextLevel: 0,
			progressPercent: 100,
			isMaxLevel: true,
		});

		expect(getLevelProgress(700)).toMatchObject({
			currentLevel: 5,
			nextLevel: null,
			nextLevelTarget: null,
			xpToNextLevel: 0,
			progressPercent: 100,
			isMaxLevel: true,
		});
	});
});