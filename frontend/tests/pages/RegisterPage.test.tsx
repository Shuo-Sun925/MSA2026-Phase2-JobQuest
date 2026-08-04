import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "../../src/pages/RegisterPage";

const { navigateMock, registerMock, resetErrorMock, toggleThemeMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	registerMock: vi.fn(),
	resetErrorMock: vi.fn(),
	toggleThemeMock: vi.fn(),
}));

type AuthStoreState = {
	session: { userId: number; username: string; token: string; expiresAt: string } | null;
	register: typeof registerMock;
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

function renderRegisterPage() {
	return render(
		<MemoryRouter>
			<RegisterPage />
		</MemoryRouter>,
	);
}

describe("RegisterPage", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		registerMock.mockReset();
		resetErrorMock.mockReset();
		toggleThemeMock.mockReset();

		authStoreState = {
			session: null,
			register: registerMock,
			isSubmitting: false,
			requestError: "",
			resetError: resetErrorMock,
		};
	});

	it("shows a mismatch error and blocks submit when passwords differ", async () => {
		renderRegisterPage();
		const user = userEvent.setup();

		await user.type(screen.getByRole("textbox", { name: "Username" }), "new-user");
		await user.type(screen.getByLabelText("Password"), "password123");
		await user.type(screen.getByLabelText("Confirm Password"), "different123");
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		expect(resetErrorMock).toHaveBeenCalledTimes(1);
		expect(registerMock).not.toHaveBeenCalled();
		expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
	});

	it("submits trimmed registration details through the auth store", async () => {
		registerMock.mockResolvedValue({});
		renderRegisterPage();
		const user = userEvent.setup();

		await user.type(screen.getByRole("textbox", { name: "Username" }), "  new-user  ");
		await user.type(screen.getByLabelText("Password"), "password123");
		await user.type(screen.getByLabelText("Confirm Password"), "password123");
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(registerMock).toHaveBeenCalledWith({
				username: "new-user",
				password: "password123",
			});
		});
	});
});