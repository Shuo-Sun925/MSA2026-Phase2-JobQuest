import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProgressPage from "./ProgressPage";
import { useProgressStore } from "../store/useProgressStore";

const {
	logoutMock,
	fetchProgressMock,
	fetchProgressSummaryMock,
	fetchWeeklyGoalProgressMock,
	updateWeeklyGoalMock,
} = vi.hoisted(() => ({
	logoutMock: vi.fn(),
	fetchProgressMock: vi.fn(),
	fetchProgressSummaryMock: vi.fn(),
	fetchWeeklyGoalProgressMock: vi.fn(),
	updateWeeklyGoalMock: vi.fn(),
}));

vi.mock("../store/useAuthStore", () => ({
	useAuthStore: (selector?: (state: { logout: () => void }) => unknown) => {
		const state = { logout: logoutMock };
		return typeof selector === "function" ? selector(state) : state;
	},
}));

vi.mock("../services/progressService", () => ({
	fetchProgress: fetchProgressMock,
	fetchProgressSummary: fetchProgressSummaryMock,
	fetchWeeklyGoalProgress: fetchWeeklyGoalProgressMock,
	updateWeeklyGoal: updateWeeklyGoalMock,
}));

function renderProgressPage() {
	return render(
		<MemoryRouter>
			<ProgressPage />
		</MemoryRouter>,
	);
}

describe("ProgressPage weekly goal editor", () => {
	beforeEach(() => {
		logoutMock.mockReset();
		fetchProgressMock.mockReset();
		fetchProgressSummaryMock.mockReset();
		fetchWeeklyGoalProgressMock.mockReset();
		updateWeeklyGoalMock.mockReset();

		const state = useProgressStore.getState();

		useProgressStore.setState({
			...state,
			progress: {
				totalPoints: 120,
				currentLevel: 2,
				currentStreak: 4,
				lastActivityDate: "2026-07-31",
				weeklyGoal: 5,
			},
			summary: {
				totalApplications: 8,
				applicationsThisWeek: 2,
				savedCount: 1,
				appliedCount: 3,
				onlineAssessmentCount: 1,
				interviewCount: 1,
				offerCount: 0,
				rejectedCount: 2,
				withdrawnCount: 1,
				totalPoints: 120,
				currentLevel: 2,
				currentStreak: 4,
				lastActivityDate: "2026-07-31",
				weeklyGoal: 5,
				weeklyGoalProgress: 2,
				remainingApplications: 3,
				isGoalMet: false,
			},
			weeklyGoalProgress: {
				weeklyGoal: 5,
				appliedThisWeek: 2,
				remainingApplications: 3,
				isGoalMet: false,
				weekStartDate: "2026-07-28",
				weekEndDate: "2026-08-03",
			},
			hasLoadedProgress: true,
			hasLoadedSummary: true,
			hasLoadedWeeklyGoalProgress: true,
			isLoadingProgress: false,
			isLoadingSummary: false,
			isLoadingWeeklyGoalProgress: false,
			isUpdatingWeeklyGoal: false,
			requestError: "",
			statusMessage: "Ready",
			weeklyGoalUpdateError: "",
			weeklyGoalUpdateSuccess: "",
		});
	});

	it("shows the current weekly goal and completion text", () => {
		renderProgressPage();

		expect(screen.getByText("Current weekly goal")).toBeInTheDocument();
		expect(screen.getByText("5 applications")).toBeInTheDocument();
		expect(screen.getByText("2 of 5 applications completed")).toBeInTheDocument();
	});

	it("allows the user to choose a new goal and save it through the API", async () => {
		updateWeeklyGoalMock.mockResolvedValue({
			totalPoints: 120,
			currentLevel: 2,
			currentStreak: 4,
			lastActivityDate: "2026-07-31",
			weeklyGoal: 7,
		});

		renderProgressPage();
		const user = userEvent.setup();

		await user.click(screen.getByRole("button", { name: "7" }));
		await user.click(screen.getByRole("button", { name: "Save goal" }));

		await waitFor(() => {
			expect(updateWeeklyGoalMock).toHaveBeenCalledWith({ weeklyGoal: 7 });
		});

		expect(screen.getByText("Weekly goal updated to 7 applications.")).toBeInTheDocument();
		expect(screen.getByText("7 applications")).toBeInTheDocument();
		expect(screen.getByText("2 of 7 applications completed")).toBeInTheDocument();
	});

	it("shows a clear error message when saving fails", async () => {
		updateWeeklyGoalMock.mockRejectedValue(new Error("Server unavailable"));

		renderProgressPage();
		const user = userEvent.setup();

		await user.click(screen.getByRole("button", { name: "10" }));
		await user.click(screen.getByRole("button", { name: "Save goal" }));

		await waitFor(() => {
			expect(updateWeeklyGoalMock).toHaveBeenCalledWith({ weeklyGoal: 10 });
		});

		expect(screen.getByText("Server unavailable")).toBeInTheDocument();
	});
});