import axios from "axios";
import { create } from "zustand";
import {
	fetchProgress,
	fetchProgressSummary,
	fetchWeeklyGoalProgress,
	updateWeeklyGoal as updateWeeklyGoalRequest,
} from "../services/progressService";
import type {
	ProgressResponse,
	ProgressSummaryResponse,
	WeeklyGoalProgressResponse,
} from "../types/progress";

interface ProgressStoreState {
	progress: ProgressResponse | null;
	summary: ProgressSummaryResponse | null;
	weeklyGoalProgress: WeeklyGoalProgressResponse | null;
	hasLoadedProgress: boolean;
	hasLoadedSummary: boolean;
	hasLoadedWeeklyGoalProgress: boolean;
	isLoadingProgress: boolean;
	isLoadingSummary: boolean;
	isLoadingWeeklyGoalProgress: boolean;
	isUpdatingWeeklyGoal: boolean;
	requestError: string;
	statusMessage: string;
	weeklyGoalUpdateError: string;
	weeklyGoalUpdateSuccess: string;
	loadProgress: () => Promise<ProgressResponse>;
	loadSummary: () => Promise<ProgressSummaryResponse>;
	loadWeeklyGoalProgress: () => Promise<WeeklyGoalProgressResponse>;
	updateWeeklyGoal: (weeklyGoal: number) => Promise<ProgressResponse>;
	clearWeeklyGoalUpdateState: () => void;
	resetStore: () => void;
	resetStatus: (message?: string) => void;
}

const INITIAL_STATUS_MESSAGE = "Ready to connect to the Progress API";

function createInitialProgressState() {
	return {
		progress: null as ProgressResponse | null,
		summary: null as ProgressSummaryResponse | null,
		weeklyGoalProgress: null as WeeklyGoalProgressResponse | null,
		hasLoadedProgress: false,
		hasLoadedSummary: false,
		hasLoadedWeeklyGoalProgress: false,
		isLoadingProgress: false,
		isLoadingSummary: false,
		isLoadingWeeklyGoalProgress: false,
		isUpdatingWeeklyGoal: false,
		requestError: "",
		statusMessage: INITIAL_STATUS_MESSAGE,
		weeklyGoalUpdateError: "",
		weeklyGoalUpdateSuccess: "",
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getProgressErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	if (axios.isAxiosError(error)) {
		const responseData = error.response?.data;

		if (isRecord(responseData)) {
			const responseMessage = responseData.message;

			if (typeof responseMessage === "string") {
				return responseMessage;
			}

			const responseTitle = responseData.title;

			if (typeof responseTitle === "string") {
				return responseTitle;
			}
		}

		if (!error.response) {
			return "Unable to reach the backend. Make sure the API is running.";
		}

		switch (error.response.status) {
			case 400:
				return "The submitted weekly goal is invalid.";

			case 401:
				return "The current session is no longer authorized.";

			case 403:
				return "You are not allowed to access this progress data.";

			case 429:
				return "Too many requests. Please retry later.";

			case 500:
				return "The server failed to process the progress request.";

			default:
				return fallbackMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallbackMessage;
}

function updateSummaryWeeklyGoal(
	summary: ProgressSummaryResponse | null,
	weeklyGoal: number,
): ProgressSummaryResponse | null {
	if (!summary) {
		return null;
	}

	const remainingApplications = Math.max(
		weeklyGoal - summary.weeklyGoalProgress,
		0,
	);

	return {
		...summary,
		weeklyGoal,
		remainingApplications,
		isGoalMet: summary.weeklyGoalProgress >= weeklyGoal,
	};
}

function updateWeeklyGoalProgressState(
	weeklyGoalProgress: WeeklyGoalProgressResponse | null,
	weeklyGoal: number,
): WeeklyGoalProgressResponse | null {
	if (!weeklyGoalProgress) {
		return null;
	}

	const remainingApplications = Math.max(
		weeklyGoal - weeklyGoalProgress.appliedThisWeek,
		0,
	);

	return {
		...weeklyGoalProgress,
		weeklyGoal,
		remainingApplications,
		isGoalMet: weeklyGoalProgress.appliedThisWeek >= weeklyGoal,
	};
}

export const useProgressStore = create<ProgressStoreState>((set, get) => ({
	...createInitialProgressState(),

	async loadProgress() {
		if (get().isLoadingProgress) {
			return get().progress ?? await fetchProgress();
		}

		set({
			isLoadingProgress: true,
			requestError: "",
			weeklyGoalUpdateError: "",
			statusMessage: "Loading progress...",
		});

		try {
			const progress = await fetchProgress();

			set({
				progress,
				hasLoadedProgress: true,
				statusMessage: "Loaded /progress successfully.",
			});

			return progress;
		} catch (error) {
			const message = getProgressErrorMessage(error, "Failed to load progress.");

			set({
				requestError: message,
				statusMessage: "Progress request failed.",
			});

			throw error;
		} finally {
			set({ isLoadingProgress: false });
		}
	},

	async loadSummary() {
		if (get().isLoadingSummary) {
			return get().summary ?? await fetchProgressSummary();
		}

		set({
			isLoadingSummary: true,
			requestError: "",
			weeklyGoalUpdateError: "",
			statusMessage: "Loading progress summary...",
		});

		try {
			const summary = await fetchProgressSummary();

			set({
				summary,
				hasLoadedSummary: true,
				statusMessage: "Loaded /progress/summary successfully.",
			});

			return summary;
		} catch (error) {
			const message = getProgressErrorMessage(
				error,
				"Failed to load progress summary.",
			);

			set({
				requestError: message,
				statusMessage: "Progress summary request failed.",
			});

			throw error;
		} finally {
			set({ isLoadingSummary: false });
		}
	},

	async loadWeeklyGoalProgress() {
		if (get().isLoadingWeeklyGoalProgress) {
			return get().weeklyGoalProgress ?? await fetchWeeklyGoalProgress();
		}

		set({
			isLoadingWeeklyGoalProgress: true,
			requestError: "",
			weeklyGoalUpdateError: "",
			statusMessage: "Loading weekly goal progress...",
		});

		try {
			const weeklyGoalProgress = await fetchWeeklyGoalProgress();

			set({
				weeklyGoalProgress,
				hasLoadedWeeklyGoalProgress: true,
				statusMessage: "Loaded /progress/weekly-goal-progress successfully.",
			});

			return weeklyGoalProgress;
		} catch (error) {
			const message = getProgressErrorMessage(
				error,
				"Failed to load weekly goal progress.",
			);

			set({
				requestError: message,
				statusMessage: "Weekly goal progress request failed.",
			});

			throw error;
		} finally {
			set({ isLoadingWeeklyGoalProgress: false });
		}
	},

	async updateWeeklyGoal(weeklyGoal) {
		if (get().isUpdatingWeeklyGoal) {
			return get().progress ?? await fetchProgress();
		}

		set({
			isUpdatingWeeklyGoal: true,
			weeklyGoalUpdateError: "",
			weeklyGoalUpdateSuccess: "",
			requestError: "",
			statusMessage: "Saving weekly goal...",
		});

		try {
			const progress = await updateWeeklyGoalRequest({ weeklyGoal });

			set((state) => ({
				progress,
				hasLoadedProgress: true,
				summary: updateSummaryWeeklyGoal(state.summary, progress.weeklyGoal),
				weeklyGoalProgress: updateWeeklyGoalProgressState(
					state.weeklyGoalProgress,
					progress.weeklyGoal,
				),
				weeklyGoalUpdateSuccess: `Weekly goal updated to ${progress.weeklyGoal} applications.`,
				statusMessage: "Weekly goal updated successfully.",
			}));

			return progress;
		} catch (error) {
			const message = getProgressErrorMessage(
				error,
				"Failed to update the weekly goal.",
			);

			set({
				weeklyGoalUpdateError: message,
				statusMessage: "Weekly goal update failed.",
			});

			throw error;
		} finally {
			set({ isUpdatingWeeklyGoal: false });
		}
	},

	clearWeeklyGoalUpdateState() {
		set({
			weeklyGoalUpdateError: "",
			weeklyGoalUpdateSuccess: "",
		});
	},

	resetStore() {
		set(createInitialProgressState());
	},

	resetStatus(message = "Progress sandbox is ready for the next request.") {
		set({
			requestError: "",
			statusMessage: message,
		});
	},
}));