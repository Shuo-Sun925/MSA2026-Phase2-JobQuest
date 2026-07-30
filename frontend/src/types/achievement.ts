export interface AchievementResponse {
	id: number;
	name: string;
	description: string;
	icon: string | null;
	conditionType: string;
	targetValue: number;
	isUnlocked: boolean;
	unlockedAt: string | null;
}