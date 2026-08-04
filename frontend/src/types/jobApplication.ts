export const JOB_APPLICATION_STATUSES = [
	"Saved",
	"Applied",
	"OnlineAssessment",
	"Interview",
	"Offer",
	"Rejected",
	"Withdrawn",
] as const;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export interface JobApplicationResponse {
	id: number;
	companyName: string;
	jobTitle: string;
	location: string | null;
	jobLink: string | null;
	status: JobApplicationStatus;
	appliedDate: string | null;
	nextFollowUpDate: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface JobApplicationUpsertRequest {
	companyName: string;
	jobTitle: string;
	location: string | null;
	jobLink: string | null;
	status: JobApplicationStatus;
	appliedDate: string | null;
	nextFollowUpDate: string | null;
	notes: string | null;
}

export interface JobApplicationDraft {
	companyName: string;
	jobTitle: string;
	location: string;
	jobLink: string;
	status: JobApplicationStatus;
	appliedDate: string;
	nextFollowUpDate: string;
	notes: string;
}

export type JobApplicationFieldName = keyof JobApplicationDraft;
export type JobApplicationFieldErrors = Partial<Record<JobApplicationFieldName, string>>;

export const EMPTY_JOB_APPLICATION_DRAFT: JobApplicationDraft = {
	companyName: "",
	jobTitle: "",
	location: "",
	jobLink: "",
	status: "Saved",
	appliedDate: "",
	nextFollowUpDate: "",
	notes: "",
};

export function toJobApplicationUpsertRequest(
	draft: JobApplicationDraft,
): JobApplicationUpsertRequest {
	return {
		companyName: draft.companyName.trim(),
		jobTitle: draft.jobTitle.trim(),
		location: normalizeOptionalText(draft.location),
		jobLink: normalizeOptionalText(draft.jobLink),
		status: draft.status,
		appliedDate: normalizeOptionalText(draft.appliedDate),
		nextFollowUpDate: normalizeOptionalText(draft.nextFollowUpDate),
		notes: normalizeOptionalText(draft.notes),
	};
}

export function toJobApplicationDraft(
	application: JobApplicationResponse,
): JobApplicationDraft {
	return {
		companyName: application.companyName,
		jobTitle: application.jobTitle,
		location: application.location ?? "",
		jobLink: application.jobLink ?? "",
		status: application.status,
		appliedDate: application.appliedDate ?? "",
		nextFollowUpDate: application.nextFollowUpDate ?? "",
		notes: application.notes ?? "",
	};
}

function normalizeOptionalText(value: string): string | null {
	const normalizedValue = value.trim();

	return normalizedValue ? normalizedValue : null;
}
