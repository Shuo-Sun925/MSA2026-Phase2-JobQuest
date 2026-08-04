import api from "./api";
import type {
	JobApplicationResponse,
	JobApplicationUpsertRequest,
} from "../types/jobApplication";

export async function listJobApplications(): Promise<JobApplicationResponse[]> {
	const response = await api.get<JobApplicationResponse[]>("/jobapplications");

	return response.data;
}

export async function getJobApplicationById(
	id: number,
): Promise<JobApplicationResponse> {
	const response = await api.get<JobApplicationResponse>(`/jobapplications/${id}`);

	return response.data;
}

export async function createJobApplication(
	request: JobApplicationUpsertRequest,
): Promise<JobApplicationResponse> {
	const response = await api.post<JobApplicationResponse>("/jobapplications", request);

	return response.data;
}

export async function updateJobApplication(
	id: number,
	request: JobApplicationUpsertRequest,
): Promise<JobApplicationResponse> {
	const response = await api.put<JobApplicationResponse>(`/jobapplications/${id}`, request);

	return response.data;
}

export async function deleteJobApplication(id: number): Promise<void> {
	await api.delete(`/jobapplications/${id}`);
}