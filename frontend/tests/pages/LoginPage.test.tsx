import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../../src/pages/LoginPage";

const { navigateMock, loginMock, resetErrorMock, toggleThemeMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	loginMock: vi.fn(),
	resetErrorMock: vi.fn(),
	toggleThemeMock: vi.fn(),
}));

type AuthStoreState = {
	session: { userId: number; username: string; token: string; expiresAt: string } | null;
	login: typeof loginMock;
	isSubmitting: boolean;
	requestError: string;
	resetError: typeof resetErrorMock;
};

let authStoreState: AuthStoreState;

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("../../src/hooks/useDashboardTheme", () => ({
	useDashboardTheme: () => ({
		theme: "dark",
		toggleTheme: toggleThemeMock,
	}),
}));

vi.mock("../../src/store/useAuthStore", () => ({
	useAuthStore: (selector?: (state: AuthStoreState) => unknown) => {
		return typeof selector === "function" ? selector(authStoreState) : authStoreState;
	},
}));

function renderLoginPage() {
	return render(
		<MemoryRouter>
			<LoginPage />
		</MemoryRouter>,
	);
}

describe("LoginPage", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		loginMock.mockReset();
		resetErrorMock.mockReset();
		toggleThemeMock.mockReset();

		authStoreState = {
			session: null,
			login: loginMock,
			isSubmitting: false,
			requestError: "",
			resetError: resetErrorMock,
		};
	});

	it("renders the login form fields and actions", () => {
		renderLoginPage();

		expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Log In →" })).toBeInTheDocument();
	});

	it("enforces required validation before submit", async () => {
		renderLoginPage();
		const user = userEvent.setup();

		const usernameInput = screen.getByRole("textbox", { name: "Username" });
		const passwordInput = screen.getByLabelText("Password");

		expect(usernameInput).toBeRequired();
		expect(passwordInput).toBeRequired();
		expect(usernameInput).toBeInvalid();
		expect(passwordInput).toBeInvalid();

		await user.click(screen.getByRole("button", { name: "Log In →" }));

		expect(resetErrorMock).not.toHaveBeenCalled();
		expect(loginMock).not.toHaveBeenCalled();
	});

	it("submits trimmed credentials through the auth store", async () => {
		loginMock.mockResolvedValue({});
		renderLoginPage();
		const user = userEvent.setup();

		await user.type(screen.getByRole("textbox", { name: "Username" }), "  alice  ");
		await user.type(screen.getByLabelText("Password"), "password123");
		await user.click(screen.getByRole("button", { name: "Log In →" }));

		await waitFor(() => {
			expect(resetErrorMock).toHaveBeenCalledTimes(1);
			expect(loginMock).toHaveBeenCalledWith({
				username: "alice",
				password: "password123",
			});
		});
	});

	it("shows the current login error state", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
		loginMock.mockRejectedValue(new Error("Invalid username or password."));
		authStoreState = {
			...authStoreState,
			requestError: "Invalid username or password.",
		};

		renderLoginPage();
		const user = userEvent.setup();

		await user.type(screen.getByRole("textbox", { name: "Username" }), "alice");
		await user.type(screen.getByLabelText("Password"), "wrong-password");
		await user.click(screen.getByRole("button", { name: "Log In →" }));

		await waitFor(() => {
			expect(loginMock).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		expect(screen.getByText("Invalid username or password.")).toBeInTheDocument();
		consoleErrorSpy.mockRestore();
	});
});