import api from "./api";
import type {
	ProgressResponse,
	ProgressSummaryResponse,
	WeeklyGoalProgressResponse,
} from "../types/progress";

export async function fetchProgress(): Promise<ProgressResponse> {
	const response = await api.get<ProgressResponse>("/progress");

	return response.data;
}

export async function fetchProgressSummary(): Promise<ProgressSummaryResponse> {
	const response = await api.get<ProgressSummaryResponse>("/progress/summary");

	return response.data;
}

export async function fetchWeeklyGoalProgress(): Promise<WeeklyGoalProgressResponse> {
	const response = await api.get<WeeklyGoalProgressResponse>("/progress/weekly-goal-progress");

	return response.data;
}