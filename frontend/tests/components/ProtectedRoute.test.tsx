import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const { loadCurrentUserMock, logoutMock } = vi.hoisted(() => ({
	loadCurrentUserMock: vi.fn(),
	logoutMock: vi.fn(),
}));

type AuthStoreState = {
	session: { userId: number; username: string; token: string; expiresAt: string } | null;
	currentUser: { userId: number; username: string; createdAt: string } | null;
	isLoadingProfile: boolean;
	requestError: string;
	loadCurrentUser: typeof loadCurrentUserMock;
	logout: typeof logoutMock;
};

let authStoreState: AuthStoreState;

vi.mock("../../src/store/useAuthStore", () => ({
	useAuthStore: (selector?: (state: AuthStoreState) => unknown) => {
		return typeof selector === "function" ? selector(authStoreState) : authStoreState;
	},
}));

function renderProtectedRoute(initialEntry = "/dashboard") {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Routes>
				<Route
					path="/dashboard"
					element={(
						<ProtectedRoute>
							<div>Secret dashboard</div>
						</ProtectedRoute>
					)}
				/>
				<Route path="/login" element={<div>Login screen</div>} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("ProtectedRoute", () => {
	beforeEach(() => {
		loadCurrentUserMock.mockReset();
		logoutMock.mockReset();

		authStoreState = {
			session: null,
			currentUser: null,
			isLoadingProfile: false,
			requestError: "",
			loadCurrentUser: loadCurrentUserMock,
			logout: logoutMock,
		};
	});

	it("redirects unauthenticated users to the login route", () => {
		renderProtectedRoute();

		expect(screen.getByText("Login screen")).toBeInTheDocument();
		expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
	});

	it("loads the current user before rendering protected content", async () => {
		loadCurrentUserMock.mockResolvedValue(undefined);
		authStoreState = {
			...authStoreState,
			session: {
				userId: 1,
				username: "alice",
				token: "token",
				expiresAt: "2026-08-04T00:00:00.000Z",
			},
			isLoadingProfile: true,
		};

		const { rerender } = renderProtectedRoute();

		expect(screen.getByRole("heading", { name: "Loading your session" })).toBeInTheDocument();

		authStoreState = {
			...authStoreState,
			isLoadingProfile: false,
			currentUser: {
				userId: 1,
				username: "alice",
				createdAt: "2026-08-01T00:00:00.000Z",
			},
		};

		rerender(
			<MemoryRouter initialEntries={["/dashboard"]}>
				<Routes>
					<Route
						path="/dashboard"
						element={(
							<ProtectedRoute>
								<div>Secret dashboard</div>
							</ProtectedRoute>
						)}
					/>
					<Route path="/login" element={<div>Login screen</div>} />
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
		});
	});

	it("shows the error recovery actions when profile loading fails", async () => {
		loadCurrentUserMock.mockResolvedValue(undefined);
		authStoreState = {
			...authStoreState,
			session: {
				userId: 1,
				username: "alice",
				token: "token",
				expiresAt: "2026-08-04T00:00:00.000Z",
			},
			requestError: "Session expired.",
		};

		renderProtectedRoute();
		const user = userEvent.setup();

		expect(screen.getByText("Session expired.")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Retry" }));
		await user.click(screen.getByRole("button", { name: "Sign Out" }));

		expect(loadCurrentUserMock).toHaveBeenCalledTimes(2);
		expect(logoutMock).toHaveBeenCalledTimes(1);
	});
});