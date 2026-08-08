import axios from "axios";
import { create } from "zustand";
import { configureApiAuth } from "../services/api";
import { useAchievementsStore } from "./useAchievementsStore";
import { useJobApplicationsStore } from "./useJobApplicationsStore";
import { useProgressStore } from "./useProgressStore";
import type {
	AuthRequest,
	AuthSession,
	CurrentUserResponse,
} from "../types/auth";
import {
	clearStoredSession,
	fetchCurrentUser,
	getStoredAccessToken,
	getStoredSession,
	isSessionExpired,
	login as loginRequest,
	register as registerRequest,
} from "../services/authService";

interface AuthStoreState {
	session: AuthSession | null;
	currentUser: CurrentUserResponse | null;
	isSubmitting: boolean;
	isLoadingProfile: boolean;
	requestError: string;
	statusMessage: string;
	register: (request: AuthRequest) => Promise<AuthSession>;
	login: (request: AuthRequest) => Promise<AuthSession>;
	loadCurrentUser: () => Promise<void>;
	logout: (message?: string) => void;
	handleUnauthorized: () => void;
	resetError: () => void;
}

let sessionExpiryTimeout: number | null = null;
let currentUserRequest: Promise<void> | null = null;

function clearSessionExpiryTimeout() {
	if (sessionExpiryTimeout !== null) {
		window.clearTimeout(sessionExpiryTimeout);
		sessionExpiryTimeout = null;
	}
}

function buildSignedOutState(message: string, requestError = "") {
	useAchievementsStore.getState().resetStore();
	useJobApplicationsStore.getState().resetStore();
	useProgressStore.getState().resetStore();

	return {
		session: null,
		currentUser: null,
		isSubmitting: false,
		isLoadingProfile: false,
		requestError,
		statusMessage: message,
	};
}

function clearSessionWithMessage(
	set: (partial: Partial<AuthStoreState>) => void,
	message: string,
	requestError = "",
) {
	clearSessionExpiryTimeout();
	clearStoredSession();
	set(buildSignedOutState(message, requestError));
}

function syncSessionExpiry() {
	clearSessionExpiryTimeout();

	const session = useAuthStore.getState().session;

	if (!session) {
		return;
	}

	if (isSessionExpired(session.expiresAt)) {
		useAuthStore
			.getState()
			.logout("Your session has expired. Please sign in again.");
		return;
	}

	const expiresAtMs = Date.parse(session.expiresAt);

	if (Number.isNaN(expiresAtMs)) {
		useAuthStore
			.getState()
			.logout("Your session has expired. Please sign in again.");
		return;
	}

	sessionExpiryTimeout = window.setTimeout(() => {
		useAuthStore
			.getState()
			.logout("Your session has expired. Please sign in again.");
	}, Math.max(expiresAtMs - Date.now(), 0));
}

function getAuthErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	if (axios.isAxiosError(error)) {
		const responseMessage = error.response?.data?.message;

		if (typeof responseMessage === "string") {
			return responseMessage;
		}

		if (!error.response) {
			return "Unable to reach the backend. Make sure the API is running.";
		}

		switch (error.response.status) {
			case 400:
				return "The submitted data is invalid. Please review the input.";

			case 401:
				return "The username or password is incorrect.";

			case 409:
				return "That username is already in use.";

			case 429:
				return "Too many requests. Please try again later.";

			case 500:
				return "The server encountered an error. Please try again later.";

			default:
				return fallbackMessage;
		}
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return fallbackMessage;
}

const initialSession = getStoredSession();

export const useAuthStore = create<AuthStoreState>((set) => ({
	session: initialSession,
	currentUser: null,
	isSubmitting: false,
	isLoadingProfile: false,
	requestError: "",
	statusMessage: initialSession
		? `Restored local session for ${initialSession.username}`
		: "Ready to connect to the Auth API",

	async register(request) {
		set({
			isSubmitting: true,
			requestError: "",
			statusMessage: "Registering...",
		});

		try {
			const session = await registerRequest(request);

			set({
				session,
				currentUser: null,
				requestError: "",
				statusMessage: `Registration succeeded for ${session.username}`,
			});

			return session;
		} catch (error) {
			const message = getAuthErrorMessage(
				error,
				"Registration failed. Please try again later.",
			);

			set({
				session: null,
				currentUser: null,
				requestError: message,
				statusMessage: "Registration failed.",
			});

			throw error;
		} finally {
			set({
				isSubmitting: false,
			});
		}
	},

	async login(request) {
		set({
			isSubmitting: true,
			requestError: "",
			statusMessage: "Signing in...",
		});

		try {
			const session = await loginRequest(request);

			set({
				session,
				currentUser: null,
				requestError: "",
				statusMessage: `Sign-in succeeded for ${session.username}`,
			});

			return session;
		} catch (error) {
			const message = getAuthErrorMessage(
				error,
				"Sign-in failed. Please try again later.",
			);

			set({
				session: null,
				currentUser: null,
				requestError: message,
				statusMessage: "Sign-in failed.",
			});

			throw error;
		} finally {
			set({
				isSubmitting: false,
			});
		}
	},

	loadCurrentUser() {
		if (currentUserRequest) {
			return currentUserRequest;
		}

		set({
			requestError: "",
			isLoadingProfile: true,
			statusMessage: "Loading the protected endpoint...",
		});

		currentUserRequest = fetchCurrentUser()
			.then((currentUser) => {
				set({
					currentUser,
					requestError: "",
					statusMessage: `Protected endpoint request succeeded for ${currentUser.username}`,
				});
			})
			.catch((error) => {
				const message = getAuthErrorMessage(
					error,
					"Failed to load the current user.",
				);

				set({
					currentUser: null,
					requestError: message,
					statusMessage: "Protected endpoint request failed.",
				});
				throw error;
			})
			.finally(() => {
				currentUserRequest = null;
				set({ isLoadingProfile: false });
			});

		return currentUserRequest;
	},

	logout(message = "Local session cleared. The user has been signed out.") {
		currentUserRequest = null;
		clearSessionWithMessage(set, message);
	},

	handleUnauthorized() {
		currentUserRequest = null;
		clearSessionWithMessage(
			set,
			"The JWT is expired or invalid. The local session has been cleared.",
			"The sign-in state is no longer valid. Please sign in again.",
		);
	},

	resetError() {
		set({ requestError: "" });
	},
}));

useAuthStore.subscribe((state, previousState) => {
	if (state.session !== previousState.session) {
		syncSessionExpiry();
	}
});

if (typeof window !== "undefined") {
	syncSessionExpiry();

	window.addEventListener("focus", syncSessionExpiry);
	window.addEventListener("pageshow", syncSessionExpiry);
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") {
			syncSessionExpiry();
		}
	});
}

configureApiAuth({
	getAccessToken: () => getStoredAccessToken(),
	onUnauthorized: () => useAuthStore.getState().handleUnauthorized(),
});
