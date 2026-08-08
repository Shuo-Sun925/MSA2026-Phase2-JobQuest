import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../src/store/useAuthStore";
import { useProgressStore } from "../src/store/useProgressStore";

const { fetchCurrentUserMock, fetchProgressMock } = vi.hoisted(() => ({
	fetchCurrentUserMock: vi.fn(),
	fetchProgressMock: vi.fn(),
}));

vi.mock("../src/services/authService", () => ({
	clearStoredSession: vi.fn(),
	fetchCurrentUser: fetchCurrentUserMock,
	getStoredAccessToken: vi.fn(() => null),
	getStoredSession: vi.fn(() => null),
	isSessionExpired: vi.fn(() => false),
	login: vi.fn(),
	register: vi.fn(),
}));

vi.mock("../src/services/progressService", () => ({
	fetchProgress: fetchProgressMock,
	fetchProgressSummary: vi.fn(),
	fetchWeeklyGoalProgress: vi.fn(),
	updateWeeklyGoal: vi.fn(),
}));

describe("request deduplication", () => {
	beforeEach(() => {
		fetchCurrentUserMock.mockReset();
		fetchProgressMock.mockReset();

		useAuthStore.setState({
			session: null,
			currentUser: null,
			isSubmitting: false,
			isLoadingProfile: false,
			requestError: "",
			statusMessage: "Ready to connect to the Auth API",
		});

		useProgressStore.getState().resetStore();
	});

	it("reuses an in-flight progress request", async () => {
		let resolveProgress: ((value: {
			totalPoints: number;
			currentLevel: number;
			currentStreak: number;
			lastActivityDate: string | null;
			weeklyGoal: number;
		}) => void) | undefined;

		fetchProgressMock.mockReturnValue(
			new Promise((resolve) => {
				resolveProgress = resolve;
			}),
		);

		const firstRequest = useProgressStore.getState().loadProgress();
		const secondRequest = useProgressStore.getState().loadProgress();

		expect(fetchProgressMock).toHaveBeenCalledTimes(1);
		expect(secondRequest).toBe(firstRequest);

		resolveProgress?.({
			totalPoints: 120,
			currentLevel: 3,
			currentStreak: 4,
			lastActivityDate: "2026-08-08",
			weeklyGoal: 5,
		});

		await expect(firstRequest).resolves.toMatchObject({
			totalPoints: 120,
			currentLevel: 3,
		});
		await expect(secondRequest).resolves.toMatchObject({
			totalPoints: 120,
			currentLevel: 3,
		});
	});

	it("reuses an in-flight current user request", async () => {
		let resolveCurrentUser: ((value: {
			userId: number;
			username: string;
			createdAt: string;
		}) => void) | undefined;

		fetchCurrentUserMock.mockReturnValue(
			new Promise((resolve) => {
				resolveCurrentUser = resolve;
			}),
		);

		const firstRequest = useAuthStore.getState().loadCurrentUser();
		const secondRequest = useAuthStore.getState().loadCurrentUser();

		expect(fetchCurrentUserMock).toHaveBeenCalledTimes(1);
		expect(secondRequest).toBe(firstRequest);

		resolveCurrentUser?.({
			userId: 1,
			username: "alice",
			createdAt: "2026-08-08T00:00:00.000Z",
		});

		await Promise.all([firstRequest, secondRequest]);

		expect(useAuthStore.getState().currentUser).toMatchObject({
			userId: 1,
			username: "alice",
		});
	});
});