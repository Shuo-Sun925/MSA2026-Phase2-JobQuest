import axios from "axios";
import { create } from "zustand";
import {
	createJobApplication,
	deleteJobApplication,
	getJobApplicationById,
	listJobApplications,
	updateJobApplication,
} from "../services/jobApplicationsService";
import type {
	JobApplicationFieldErrors,
	JobApplicationResponse,
	JobApplicationUpsertRequest,
} from "../types/jobApplication";

interface JobApplicationsStoreState {
	applications: JobApplicationResponse[];
	selectedApplication: JobApplicationResponse | null;
	activeApplicationId: number | null;
	hasLoadedList: boolean;
	isLoadingList: boolean;
	isLoadingDetails: boolean;
	isSubmitting: boolean;
	isDeleting: boolean;
	requestError: string;
	validationErrors: JobApplicationFieldErrors;
	statusMessage: string;
	listApplications: () => Promise<JobApplicationResponse[]>;
	loadApplicationById: (id: number) => Promise<JobApplicationResponse>;
	createApplication: (
		request: JobApplicationUpsertRequest,
	) => Promise<JobApplicationResponse>;
	updateApplication: (
		id: number,
		request: JobApplicationUpsertRequest,
	) => Promise<JobApplicationResponse>;
	deleteApplication: (id: number) => Promise<void>;
	resetStore: () => void;
	clearSelection: () => void;
	clearValidationErrors: (fields?: (keyof JobApplicationFieldErrors)[]) => void;
	resetStatus: (message?: string) => void;
}

const INITIAL_STATUS_MESSAGE = "Ready to connect to the Applications API";

function createInitialApplicationsState() {
	return {
		applications: [] as JobApplicationResponse[],
		selectedApplication: null,
		activeApplicationId: null,
		hasLoadedList: false,
		isLoadingList: false,
		isLoadingDetails: false,
		isSubmitting: false,
		isDeleting: false,
		requestError: "",
		validationErrors: {},
		statusMessage: INITIAL_STATUS_MESSAGE,
	};
}

const JOB_APPLICATION_VALIDATION_FIELD_MAP: Record<string, keyof JobApplicationFieldErrors> = {
	AppliedDate: "appliedDate",
	CompanyName: "companyName",
	JobLink: "jobLink",
	JobTitle: "jobTitle",
	Location: "location",
	NextFollowUpDate: "nextFollowUpDate",
	Notes: "notes",
	Status: "status",
	appliedDate: "appliedDate",
	companyName: "companyName",
	jobLink: "jobLink",
	jobTitle: "jobTitle",
	location: "location",
	nextFollowUpDate: "nextFollowUpDate",
	notes: "notes",
	status: "status",
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getStringProperty(
	record: Record<string, unknown>,
	propertyName: string,
): string | null {
	const value = record[propertyName];

	return typeof value === "string" ? value : null;
}

function getValidationErrorsMessage(data: unknown): string | null {
	if (!isRecord(data)) {
		return null;
	}

	const errors = data.errors;

	if (!isRecord(errors)) {
		return null;
	}

	const messages = Object.values(errors).flatMap((entry) => {
		if (!Array.isArray(entry)) {
			return [] as string[];
		}

		return entry.filter(
			(message): message is string => typeof message === "string",
		);
	});

	return messages.length > 0 ? messages.join(" ") : null;
}

function getValidationErrorFieldName(propertyName: string): keyof JobApplicationFieldErrors | null {
	const normalizedPropertyName = propertyName.replace(/^\$\.?/, "");
	const simplePropertyName = normalizedPropertyName.split(".").at(-1) ?? normalizedPropertyName;

	return JOB_APPLICATION_VALIDATION_FIELD_MAP[simplePropertyName] ?? null;
}

function getValidationErrors(data: unknown): JobApplicationFieldErrors {
	if (!isRecord(data)) {
		return {};
	}

	const errors = data.errors;

	if (!isRecord(errors)) {
		return {};
	}

	const validationErrors: JobApplicationFieldErrors = {};

	for (const [propertyName, entry] of Object.entries(errors)) {
		const fieldName = getValidationErrorFieldName(propertyName);

		if (!fieldName || !Array.isArray(entry)) {
			continue;
		}

		const firstMessage = entry.find(
			(message): message is string => typeof message === "string" && message.length > 0,
		);

		if (firstMessage) {
			validationErrors[fieldName] = firstMessage;
		}
	}

	return validationErrors;
}

function getUpdatedAtTimestamp(application: JobApplicationResponse): number {
	const timestamp = Date.parse(application.updatedAt);

	return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function sortApplicationsByUpdatedAtDesc(
	applications: JobApplicationResponse[],
): JobApplicationResponse[] {
	return [...applications].sort((leftApplication, rightApplication) => {
		const timestampDifference =
			getUpdatedAtTimestamp(rightApplication)
			- getUpdatedAtTimestamp(leftApplication);

		if (timestampDifference !== 0) {
			return timestampDifference;
		}

		return rightApplication.id - leftApplication.id;
	});
}

function getApplicationsErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	if (axios.isAxiosError(error)) {
		const responseData = error.response?.data;

		if (isRecord(responseData)) {
			const responseMessage = getStringProperty(
				responseData,
				"message",
			);

			if (responseMessage) {
				return responseMessage;
			}

			const validationErrorsMessage =
				getValidationErrorsMessage(responseData);

			if (validationErrorsMessage) {
				return validationErrorsMessage;
			}

			const responseTitle = getStringProperty(
				responseData,
				"title",
			);

			if (responseTitle) {
				return responseTitle;
			}
		}

		if (!error.response) {
			return "Unable to reach the backend. Make sure the API is running.";
		}

		switch (error.response.status) {
			case 400:
				return "The application payload is invalid. Review the request fields and retry.";

			case 401:
				return "The current session is no longer authorized.";

				case 403:
					return "You are not allowed to access this application.";

			case 404:
				return "The requested application was not found for the current user.";

				case 409:
					return "The requested change conflicts with the current application state.";

				case 429:
					return "Too many requests. Please retry later.";

			case 500:
				return "The server failed to process the application request.";

			default:
				return fallbackMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallbackMessage;
}

function getApplicationsValidationErrors(error: unknown): JobApplicationFieldErrors {
	if (!axios.isAxiosError(error)) {
		return {};
	}

	return getValidationErrors(error.response?.data);
}

function upsertApplication(
	applications: JobApplicationResponse[],
	application: JobApplicationResponse,
): JobApplicationResponse[] {
	const nextApplications = applications.filter(
		(currentApplication) => currentApplication.id !== application.id,
	);

	return sortApplicationsByUpdatedAtDesc([
		application,
		...nextApplications,
	]);
}

export const useJobApplicationsStore = create<JobApplicationsStoreState>((set, get) => ({
	...createInitialApplicationsState(),

	async listApplications() {
		if (get().isLoadingList) {
			return get().applications;
		}

		set({
			isLoadingList: true,
			requestError: "",
			validationErrors: {},
			statusMessage: "Loading applications...",
		});

		try {
			const applications = sortApplicationsByUpdatedAtDesc(
				await listJobApplications(),
			);

			set((state) => {
				const stillSelected = state.activeApplicationId !== null
					? applications.find(
						(application) => application.id === state.activeApplicationId,
					) ?? null
					: null;

				return {
					applications,
					hasLoadedList: true,
					selectedApplication: stillSelected,
					activeApplicationId: stillSelected?.id ?? null,
					statusMessage: applications.length
						? `Loaded ${applications.length} application(s).`
						: "Loaded applications successfully. The list is currently empty.",
				};
			});

			return applications;
		} catch (error) {
			const message = getApplicationsErrorMessage(
				error,
				"Failed to load applications.",
			);

			set({
				requestError: message,
				validationErrors: {},
				statusMessage: "Application list request failed.",
			});

			throw error;
		} finally {
			set({
				isLoadingList: false,
			});
		}
	},

	async loadApplicationById(id) {
		set({
			isLoadingDetails: true,
			requestError: "",
			validationErrors: {},
			statusMessage: `Loading application ${id}...`,
		});

		try {
			const application = await getJobApplicationById(id);

			set((state) => ({
				applications: upsertApplication(state.applications, application),
				selectedApplication: application,
				activeApplicationId: application.id,
				statusMessage: `Loaded application ${application.id} successfully.`,
			}));

			return application;
		} catch (error) {
			const message = getApplicationsErrorMessage(
				error,
				"Failed to load application details.",
			);

			const shouldClearSelection =
				axios.isAxiosError(error)
				&& error.response?.status === 404;

			set({
				selectedApplication: shouldClearSelection ? null : get().selectedApplication,
				activeApplicationId: shouldClearSelection ? null : get().activeApplicationId,
				requestError: message,
				validationErrors: {},
				statusMessage: "Application details request failed.",
			});

			throw error;
		} finally {
			set({
				isLoadingDetails: false,
			});
		}
	},

	async createApplication(request) {
		set({
			isSubmitting: true,
			requestError: "",
			validationErrors: {},
			statusMessage: "Creating application...",
		});

		try {
			const application = await createJobApplication(request);

			set((state) => ({
				applications: upsertApplication(state.applications, application),
				selectedApplication: application,
				activeApplicationId: application.id,
				hasLoadedList: true,
				validationErrors: {},
				statusMessage: `Created application ${application.id} successfully.`,
			}));

			return application;
		} catch (error) {
			const message = getApplicationsErrorMessage(
				error,
				"Failed to create the application.",
			);

			set({
				requestError: message,
				validationErrors: getApplicationsValidationErrors(error),
				statusMessage: "Application create request failed.",
			});

			throw error;
		} finally {
			set({
				isSubmitting: false,
			});
		}
	},

	async updateApplication(id, request) {
		set({
			isSubmitting: true,
			requestError: "",
			validationErrors: {},
			statusMessage: `Updating application ${id}...`,
		});

		try {
			const application = await updateJobApplication(id, request);

			set((state) => ({
				applications: upsertApplication(state.applications, application),
				selectedApplication: application,
				activeApplicationId: application.id,
				validationErrors: {},
				statusMessage: `Updated application ${application.id} successfully.`,
			}));

			return application;
		} catch (error) {
			const message = getApplicationsErrorMessage(
				error,
				"Failed to update the application.",
			);

			set({
				requestError: message,
				validationErrors: getApplicationsValidationErrors(error),
				statusMessage: "Application update request failed.",
			});

			throw error;
		} finally {
			set({
				isSubmitting: false,
			});
		}
	},

	async deleteApplication(id) {
		set({
			isDeleting: true,
			requestError: "",
			validationErrors: {},
			statusMessage: `Deleting application ${id}...`,
		});

		try {
			await deleteJobApplication(id);

			set((state) => ({
				applications: state.applications.filter(
					(application) => application.id !== id,
				),
				selectedApplication:
					state.selectedApplication?.id === id
						? null
						: state.selectedApplication,
				activeApplicationId:
					state.activeApplicationId === id ? null : state.activeApplicationId,
				statusMessage: `Deleted application ${id} successfully.`,
			}));
		} catch (error) {
			const message = getApplicationsErrorMessage(
				error,
				"Failed to delete the application.",
			);

			set({
				requestError: message,
				validationErrors: {},
				statusMessage: "Application delete request failed.",
			});

			throw error;
		} finally {
			set({
				isDeleting: false,
			});
		}
	},

	resetStore() {
		set(createInitialApplicationsState());
	},

	clearSelection() {
		set({
			selectedApplication: null,
			activeApplicationId: null,
			requestError: "",
			validationErrors: {},
			statusMessage: "Selection cleared.",
		});
	},

	clearValidationErrors(fields) {
		if (!fields || fields.length === 0) {
			set({
				validationErrors: {},
			});
			return;
		}

		set((state) => {
			const nextValidationErrors = { ...state.validationErrors };

			for (const field of fields) {
				delete nextValidationErrors[field];
			}

			return {
				validationErrors: nextValidationErrors,
			};
		});
	},

	resetStatus(message = "Applications sandbox is ready for the next request.") {
		set({
			requestError: "",
			validationErrors: {},
			statusMessage: message,
		});
	},
}));