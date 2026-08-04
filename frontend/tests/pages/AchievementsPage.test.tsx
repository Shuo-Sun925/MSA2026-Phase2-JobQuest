import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AchievementsPage from "../../src/pages/AchievementsPage";
import type { AchievementResponse } from "../../src/types/achievement";

const { toggleThemeMock, logoutMock, loadAchievementsMock } = vi.hoisted(() => ({
	toggleThemeMock: vi.fn(),
	logoutMock: vi.fn(),
	loadAchievementsMock: vi.fn(),
}));

type AuthStoreState = {
	currentUser: { userId: number; username: string; createdAt: string } | null;
	logout: typeof logoutMock;
};

type AchievementsStoreState = {
	achievements: AchievementResponse[];
	hasLoadedAchievements: boolean;
	isLoadingAchievements: boolean;
	requestError: string;
	loadAchievements: typeof loadAchievementsMock;
};

let authStoreState: AuthStoreState;
let achievementsStoreState: AchievementsStoreState;

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

vi.mock("../../src/store/useAchievementsStore", () => ({
	useAchievementsStore: (selector?: (state: AchievementsStoreState) => unknown) => {
		return typeof selector === "function" ? selector(achievementsStoreState) : achievementsStoreState;
	},
}));

function createAchievement(overrides: Partial<AchievementResponse> = {}): AchievementResponse {
	return {
		id: 1,
		name: "First Application",
		description: "Create your first job application.",
		icon: "rocket",
		conditionType: "applications_created",
		targetValue: 1,
		isUnlocked: false,
		unlockedAt: null,
		...overrides,
	};
}

function renderAchievementsPage() {
	return render(
		<MemoryRouter>
			<AchievementsPage />
		</MemoryRouter>,
	);
}

describe("AchievementsPage", () => {
	beforeEach(() => {
		toggleThemeMock.mockReset();
		logoutMock.mockReset();
		loadAchievementsMock.mockReset();
		loadAchievementsMock.mockResolvedValue([]);

		authStoreState = {
			currentUser: {
				userId: 1,
				username: "alice",
				createdAt: "2026-08-01T00:00:00.000Z",
			},
			logout: logoutMock,
		};

		achievementsStoreState = {
			achievements: [],
			hasLoadedAchievements: false,
			isLoadingAchievements: true,
			requestError: "",
			loadAchievements: loadAchievementsMock,
		};
	});

	it("handles loading, locked and unlocked achievements, and error rendering", () => {
		const { rerender } = renderAchievementsPage();

		expect(screen.getByText("Loading achievements...")).toBeInTheDocument();

		achievementsStoreState = {
			...achievementsStoreState,
			achievements: [
				createAchievement({
					id: 1,
					name: "First Application",
					isUnlocked: true,
					unlockedAt: "2026-08-01T00:00:00.000Z",
				}),
				createAchievement({
					id: 2,
					name: "Offer Hunter",
					description: "Reach the offer stage.",
				}),
			],
			hasLoadedAchievements: true,
			isLoadingAchievements: false,
		};

		rerender(
			<MemoryRouter>
				<AchievementsPage />
			</MemoryRouter>,
		);

		expect(screen.getByAltText("First Application")).toBeInTheDocument();
		expect(screen.getByAltText("Offer Hunter")).toBeInTheDocument();
		expect(screen.getByText("Reach the offer stage.")).toBeInTheDocument();
		expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
		expect(screen.getByText("New")).toBeInTheDocument();

		achievementsStoreState = {
			...achievementsStoreState,
			requestError: "Backend unavailable",
		};

		rerender(
			<MemoryRouter>
				<AchievementsPage />
			</MemoryRouter>,
		);

		expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
	});
});