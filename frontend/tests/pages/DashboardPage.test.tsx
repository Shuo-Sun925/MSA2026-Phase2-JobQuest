import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../../src/pages/DashboardPage";
import type { AchievementResponse } from "../../src/types/achievement";
import type { JobApplicationResponse } from "../../src/types/jobApplication";

const {
	toggleThemeMock,
	logoutMock,
	loadProgressMock,
	loadSummaryMock,
	loadWeeklyGoalProgressMock,
	loadAchievementsMock,
	listApplicationsMock,
} = vi.hoisted(() => ({
	toggleThemeMock: vi.fn(),
	logoutMock: vi.fn(),
	loadProgressMock: vi.fn(),
	loadSummaryMock: vi.fn(),
	loadWeeklyGoalProgressMock: vi.fn(),
	loadAchievementsMock: vi.fn(),
	listApplicationsMock: vi.fn(),
}));

type AuthStoreState = {
	currentUser: { userId: number; username: string; createdAt: string } | null;
	logout: typeof logoutMock;
};

type ProgressStoreState = {
	progress: {
		totalPoints: number;
		currentLevel: number;
		currentStreak: number;
		lastActivityDate: string | null;
		weeklyGoal: number;
	} | null;
	summary: {
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
	} | null;
	weeklyGoalProgress: {
		weeklyGoal: number;
		appliedThisWeek: number;
		remainingApplications: number;
		isGoalMet: boolean;
		weekStartDate: string;
		weekEndDate: string;
	} | null;
	hasLoadedProgress: boolean;
	hasLoadedSummary: boolean;
	hasLoadedWeeklyGoalProgress: boolean;
	loadProgress: typeof loadProgressMock;
	loadSummary: typeof loadSummaryMock;
	loadWeeklyGoalProgress: typeof loadWeeklyGoalProgressMock;
	requestError: string;
};

type AchievementsStoreState = {
	achievements: AchievementResponse[];
	hasLoadedAchievements: boolean;
	loadAchievements: typeof loadAchievementsMock;
};

type JobApplicationsStoreState = {
	applications: JobApplicationResponse[];
	hasLoadedList: boolean;
	isLoadingList: boolean;
	listApplications: typeof listApplicationsMock;
};

let authStoreState: AuthStoreState;
let progressStoreState: ProgressStoreState;
let achievementsStoreState: AchievementsStoreState;
let jobApplicationsStoreState: JobApplicationsStoreState;

vi.mock("../../src/hooks/useDashboardTheme", () => ({
	useDashboardTheme: () => ({
		theme: "dark",
		toggleTheme: toggleThemeMock,
	}),
}));

vi.mock("../../src/store/useAuthStore", () => ({
	useAuthStore: (selector?: (state: AuthStoreState) => unknown) => {
		return typeof selector === "function" ? selector(authStoreState) : authStoreState;
	},
}));

vi.mock("../../src/store/useProgressStore", () => ({
	useProgressStore: (selector?: (state: ProgressStoreState) => unknown) => {
		return typeof selector === "function" ? selector(progressStoreState) : progressStoreState;
	},
}));

vi.mock("../../src/store/useAchievementsStore", () => ({
	useAchievementsStore: (selector?: (state: AchievementsStoreState) => unknown) => {
		return typeof selector === "function" ? selector(achievementsStoreState) : achievementsStoreState;
	},
}));

vi.mock("../../src/store/useJobApplicationsStore", () => ({
	useJobApplicationsStore: (selector?: (state: JobApplicationsStoreState) => unknown) => {
		return typeof selector === "function" ? selector(jobApplicationsStoreState) : jobApplicationsStoreState;
	},
}));

function renderDashboardPage() {
	return render(
		<MemoryRouter>
			<DashboardPage />
		</MemoryRouter>,
	);
}

function createAchievement(overrides: Partial<AchievementResponse> = {}): AchievementResponse {
	return {
		id: 1,
		name: "First Application",
		description: "Create your first job application.",
		icon: "rocket",
		conditionType: "applications_created",
		targetValue: 1,
		isUnlocked: true,
		unlockedAt: "2026-08-01T00:00:00.000Z",
		...overrides,
	};
}

function createApplication(overrides: Partial<JobApplicationResponse> = {}): JobApplicationResponse {
	return {
		id: 1,
		companyName: "Contoso",
		jobTitle: "Engineer",
		location: "Auckland",
		jobLink: null,
		status: "Applied",
		appliedDate: "2026-08-01",
		nextFollowUpDate: null,
		notes: null,
		createdAt: "2026-08-01T00:00:00.000Z",
		updatedAt: "2026-08-01T00:00:00.000Z",
		...overrides,
	};
}

describe("DashboardPage", () => {
	beforeEach(() => {
		toggleThemeMock.mockReset();
		logoutMock.mockReset();
		loadProgressMock.mockReset();
		loadSummaryMock.mockReset();
		loadWeeklyGoalProgressMock.mockReset();
		loadAchievementsMock.mockReset();
		listApplicationsMock.mockReset();

		loadProgressMock.mockResolvedValue(undefined);
		loadSummaryMock.mockResolvedValue(undefined);
		loadWeeklyGoalProgressMock.mockResolvedValue(undefined);
		loadAchievementsMock.mockResolvedValue([]);
		listApplicationsMock.mockResolvedValue([]);

		authStoreState = {
			currentUser: {
				userId: 1,
				username: "alice",
				createdAt: "2026-08-01T00:00:00.000Z",
			},
			logout: logoutMock,
		};

		progressStoreState = {
			progress: {
				totalPoints: 120,
				currentLevel: 2,
				currentStreak: 4,
				lastActivityDate: "2026-08-01",
				weeklyGoal: 5,
			},
			summary: {
				totalApplications: 8,
				applicationsThisWeek: 3,
				savedCount: 1,
				appliedCount: 3,
				onlineAssessmentCount: 1,
				interviewCount: 2,
				offerCount: 1,
				rejectedCount: 1,
				withdrawnCount: 0,
				totalPoints: 120,
				currentLevel: 2,
				currentStreak: 4,
				lastActivityDate: "2026-08-01",
				weeklyGoal: 5,
				weeklyGoalProgress: 3,
				remainingApplications: 2,
				isGoalMet: false,
			},
			weeklyGoalProgress: {
				weeklyGoal: 5,
				appliedThisWeek: 3,
				remainingApplications: 2,
				isGoalMet: false,
				weekStartDate: "2026-07-28",
				weekEndDate: "2026-08-03",
			},
			hasLoadedProgress: true,
			hasLoadedSummary: true,
			hasLoadedWeeklyGoalProgress: true,
			loadProgress: loadProgressMock,
			loadSummary: loadSummaryMock,
			loadWeeklyGoalProgress: loadWeeklyGoalProgressMock,
			requestError: "",
		};

		achievementsStoreState = {
			achievements: [createAchievement(), createAchievement({ id: 2, name: "Job Hunter" })],
			hasLoadedAchievements: true,
			loadAchievements: loadAchievementsMock,
		};

		jobApplicationsStoreState = {
			applications: [createApplication(), createApplication({ id: 2, companyName: "Fabrikam" })],
			hasLoadedList: true,
			isLoadingList: false,
			listApplications: listApplicationsMock,
		};
	});

	it("renders summary data, progress, and recent activity cards", () => {
		renderDashboardPage();

		expect(screen.getByRole("heading", { name: /Welcome back, alice!/i })).toBeInTheDocument();
		expect(screen.getByText("Total apps")).toBeInTheDocument();
		expect(screen.getByText("8")).toBeInTheDocument();
		expect(screen.getByText("Level 2")).toBeInTheDocument();
		expect(screen.getByText("4 Day Streak")).toBeInTheDocument();
		expect(screen.getByText("Contoso")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Achievements" })).toBeInTheDocument();
	});

	it("triggers dashboard data loading and surfaces the empty/error state when no data is loaded", async () => {
		progressStoreState = {
			...progressStoreState,
			progress: null,
			summary: null,
			weeklyGoalProgress: null,
			hasLoadedProgress: false,
			hasLoadedSummary: false,
			hasLoadedWeeklyGoalProgress: false,
			requestError: "Backend unavailable",
		};

		achievementsStoreState = {
			...achievementsStoreState,
			achievements: [],
			hasLoadedAchievements: false,
		};

		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [],
			hasLoadedList: false,
			isLoadingList: false,
		};

		renderDashboardPage();

		await waitFor(() => {
			expect(loadProgressMock).toHaveBeenCalledTimes(1);
			expect(loadSummaryMock).toHaveBeenCalledTimes(1);
			expect(loadWeeklyGoalProgressMock).toHaveBeenCalledTimes(1);
			expect(loadAchievementsMock).toHaveBeenCalledTimes(1);
			expect(listApplicationsMock).toHaveBeenCalledTimes(1);
		});

		expect(screen.getByLabelText("Get started on JobQuest")).toBeInTheDocument();
		expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
	});
});