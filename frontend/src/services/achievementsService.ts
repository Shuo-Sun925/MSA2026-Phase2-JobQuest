import api from "./api";
import type { AchievementResponse } from "../types/achievement";

export async function listAchievements(): Promise<AchievementResponse[]> {
	const response = await api.get<AchievementResponse[]>("/achievements");

	return response.data;
}