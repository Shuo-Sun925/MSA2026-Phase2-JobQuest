import axios from "axios";
import { create } from "zustand";
import { listAchievements } from "../services/achievementsService";
import type { AchievementResponse } from "../types/achievement";

interface AchievementsStoreState {
	achievements: AchievementResponse[];
	hasLoadedAchievements: boolean;
	isLoadingAchievements: boolean;
	requestError: string;
	statusMessage: string;
	loadAchievements: () => Promise<AchievementResponse[]>;
	resetStore: () => void;
	resetStatus: (message?: string) => void;
}

const INITIAL_STATUS_MESSAGE = "Ready to connect to the Achievements API";

function createInitialAchievementsState() {
	return {
		achievements: [] as AchievementResponse[],
		hasLoadedAchievements: false,
		isLoadingAchievements: false,
		requestError: "",
		statusMessage: INITIAL_STATUS_MESSAGE,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getAchievementsErrorMessage(
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
			case 401:
				return "The current session is no longer authorized.";

			case 403:
				return "You are not allowed to access these achievements.";

			case 429:
				return "Too many requests. Please retry later.";

			case 500:
				return "The server failed to process the achievements request.";

			default:
				return fallbackMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallbackMessage;
}

function sortAchievements(
	achievements: AchievementResponse[],
): AchievementResponse[] {
	return [...achievements].sort((leftAchievement, rightAchievement) => {
		if (leftAchievement.isUnlocked !== rightAchievement.isUnlocked) {
			return leftAchievement.isUnlocked ? -1 : 1;
		}

		const leftUnlockedAt = leftAchievement.unlockedAt ? Date.parse(leftAchievement.unlockedAt) : Number.NEGATIVE_INFINITY;
		const rightUnlockedAt = rightAchievement.unlockedAt ? Date.parse(rightAchievement.unlockedAt) : Number.NEGATIVE_INFINITY;
		const timestampDifference = rightUnlockedAt - leftUnlockedAt;

		if (timestampDifference !== 0) {
			return timestampDifference;
		}

		return leftAchievement.id - rightAchievement.id;
	});
}

export const useAchievementsStore = create<AchievementsStoreState>((set, get) => ({
	...createInitialAchievementsState(),

	async loadAchievements() {
		if (get().isLoadingAchievements) {
			return get().achievements;
		}

		set({
			isLoadingAchievements: true,
			requestError: "",
			statusMessage: "Loading achievements...",
		});

		try {
			const achievements = sortAchievements(await listAchievements());

			set({
				achievements,
				hasLoadedAchievements: true,
				statusMessage: achievements.length
					? `Loaded ${achievements.length} achievement(s).`
					: "Loaded achievements successfully. The list is currently empty.",
			});

			return achievements;
		} catch (error) {
			const message = getAchievementsErrorMessage(
				error,
				"Failed to load achievements.",
			);

			set({
				requestError: message,
				statusMessage: "Achievements request failed.",
			});

			throw error;
		} finally {
			set({ isLoadingAchievements: false });
		}
	},

	resetStore() {
		set(createInitialAchievementsState());
	},

	resetStatus(message = "Achievements sandbox is ready for the next request.") {
		set({
			requestError: "",
			statusMessage: message,
		});
	},
}));