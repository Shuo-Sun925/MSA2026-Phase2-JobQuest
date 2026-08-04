export interface ProgressResponse {
	totalPoints: number;
	currentLevel: number;
	currentStreak: number;
	lastActivityDate: string | null;
	weeklyGoal: number;
}

export interface ProgressSummaryResponse {
	totalApplications: number;
	applicationsThisWeek: number;
	savedCount: number;
	appliedCount: number;
	onlineAssessmentCount: number;
	interviewCount: number;
	offerCount: number;
	rejectedCount: number;
	withdrawnCount: number;
	totalPoints: number;
	currentLevel: number;
	currentStreak: number;
	lastActivityDate: string | null;
	weeklyGoal: number;
	weeklyGoalProgress: number;
	remainingApplications: number;
	isGoalMet: boolean;
}

export interface WeeklyGoalProgressResponse {
	weeklyGoal: number;
	appliedThisWeek: number;
	remainingApplications: number;
	isGoalMet: boolean;
	weekStartDate: string;
	weekEndDate: string;
}

export interface UpdateWeeklyGoalRequest {
	weeklyGoal: number;
}