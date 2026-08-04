import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../../src/pages/ApplicationsPage";
import type { JobApplicationResponse } from "../../src/types/jobApplication";

const {
	navigateMock,
	toggleThemeMock,
	logoutMock,
	listApplicationsMock,
	loadApplicationByIdMock,
	createApplicationMock,
	updateApplicationMock,
	deleteApplicationMock,
	clearSelectionMock,
	clearValidationErrorsMock,
	resetStatusMock,
} = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	toggleThemeMock: vi.fn(),
	logoutMock: vi.fn(),
	listApplicationsMock: vi.fn(),
	loadApplicationByIdMock: vi.fn(),
	createApplicationMock: vi.fn(),
	updateApplicationMock: vi.fn(),
	deleteApplicationMock: vi.fn(),
	clearSelectionMock: vi.fn(),
	clearValidationErrorsMock: vi.fn(),
	resetStatusMock: vi.fn(),
}));

let paramsState: { applicationId?: string };

type AuthStoreState = {
	currentUser: { userId: number; username: string; createdAt: string } | null;
	logout: typeof logoutMock;
};

type JobApplicationsStoreState = {
	applications: JobApplicationResponse[];
	selectedApplication: JobApplicationResponse | null;
	activeApplicationId: number | null;
	hasLoadedList: boolean;
	isLoadingList: boolean;
	isLoadingDetails: boolean;
	isSubmitting: boolean;
	isDeleting: boolean;
	requestError: string;
	validationErrors: Record<string, string>;
	statusMessage: string;
	listApplications: typeof listApplicationsMock;
	loadApplicationById: typeof loadApplicationByIdMock;
	createApplication: typeof createApplicationMock;
	updateApplication: typeof updateApplicationMock;
	deleteApplication: typeof deleteApplicationMock;
	clearSelection: typeof clearSelectionMock;
	clearValidationErrors: typeof clearValidationErrorsMock;
	resetStatus: typeof resetStatusMock;
};

let authStoreState: AuthStoreState;
let jobApplicationsStoreState: JobApplicationsStoreState;

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

	return {
		...actual,
		useNavigate: () => navigateMock,
		useParams: () => paramsState,
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

vi.mock("../../src/store/useJobApplicationsStore", () => ({
	useJobApplicationsStore: (selector?: (state: JobApplicationsStoreState) => unknown) => {
		return typeof selector === "function"
			? selector(jobApplicationsStoreState)
			: jobApplicationsStoreState;
	},
}));

function createApplication(overrides: Partial<JobApplicationResponse> = {}): JobApplicationResponse {
	return {
		id: 1,
		companyName: "Contoso",
		jobTitle: "Engineer",
		location: "Auckland",
		jobLink: null,
		status: "Applied",
		appliedDate: "2026-08-01",
		nextFollowUpDate: null,
		notes: "Initial note",
		createdAt: "2026-08-01T00:00:00.000Z",
		updatedAt: "2026-08-01T00:00:00.000Z",
		...overrides,
	};
}

function renderApplicationsPage() {
	return render(
		<MemoryRouter>
			<ApplicationsPage />
		</MemoryRouter>,
	);
}

describe("ApplicationsPage", () => {
	beforeEach(() => {
		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			configurable: true,
			value: vi.fn(),
		});

		paramsState = {};
		navigateMock.mockReset();
		toggleThemeMock.mockReset();
		logoutMock.mockReset();
		listApplicationsMock.mockReset();
		loadApplicationByIdMock.mockReset();
		createApplicationMock.mockReset();
		updateApplicationMock.mockReset();
		deleteApplicationMock.mockReset();
		clearSelectionMock.mockReset();
		clearValidationErrorsMock.mockReset();
		resetStatusMock.mockReset();

		authStoreState = {
			currentUser: {
				userId: 1,
				username: "alice",
				createdAt: "2026-08-01T00:00:00.000Z",
			},
			logout: logoutMock,
		};

		jobApplicationsStoreState = {
			applications: [],
			selectedApplication: null,
			activeApplicationId: null,
			hasLoadedList: true,
			isLoadingList: false,
			isLoadingDetails: false,
			isSubmitting: false,
			isDeleting: false,
			requestError: "",
			validationErrors: {},
			statusMessage: "Ready",
			listApplications: listApplicationsMock,
			loadApplicationById: loadApplicationByIdMock,
			createApplication: createApplicationMock,
			updateApplication: updateApplicationMock,
			deleteApplication: deleteApplicationMock,
			clearSelection: clearSelectionMock,
			clearValidationErrors: clearValidationErrorsMock,
			resetStatus: resetStatusMock,
		};
	});

	it("renders application records and keeps the draft workspace usable when no records match", async () => {
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [createApplication()],
		};

		renderApplicationsPage();
		const user = userEvent.setup();

		expect(screen.getByText("Application Records")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Engineer/i })).toBeInTheDocument();

		await user.type(screen.getByRole("searchbox", { name: "Search applications" }), "missing");

		expect(screen.queryByRole("button", { name: /Engineer/i })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /New draft/i })).toBeInTheDocument();
		expect(screen.getByText("1 saved application(s)")).toBeInTheDocument();
	});

	it("creates a new application through the review flow", async () => {
		createApplicationMock.mockResolvedValue(createApplication({ id: 7, status: "Saved", appliedDate: null }));
		renderApplicationsPage();
		const user = userEvent.setup();

		await user.type(screen.getByLabelText(/Company Name/i), "  Fabrikam  ");
		await user.type(screen.getByLabelText(/Job Title/i), "  Product Designer  ");
		await user.click(screen.getByRole("button", { name: "Review Application" }));

		expect(screen.getByRole("heading", { name: "Review Application" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Create Application" }));

		await waitFor(() => {
			expect(createApplicationMock).toHaveBeenCalledWith({
				companyName: "Fabrikam",
				jobTitle: "Product Designer",
				location: null,
				jobLink: null,
				status: "Saved",
				appliedDate: null,
				nextFollowUpDate: null,
				notes: null,
			});
			expect(navigateMock).toHaveBeenCalledWith("/applications", { replace: true });
		});
	});

	it("updates an existing application and supports deleting it", async () => {
		paramsState = { applicationId: "1" };
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [createApplication()],
			selectedApplication: createApplication(),
			activeApplicationId: 1,
		};
		updateApplicationMock.mockResolvedValue(createApplication({ companyName: "Updated Co" }));
		deleteApplicationMock.mockResolvedValue(undefined);

		renderApplicationsPage();
		const user = userEvent.setup();

		const companyInput = screen.getByDisplayValue("Contoso");
		await user.clear(companyInput);
		await user.type(companyInput, "Updated Co");
		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		await waitFor(() => {
			expect(updateApplicationMock).toHaveBeenCalledWith(1, expect.objectContaining({
				companyName: "Updated Co",
			}));
		});

		await user.click(screen.getByRole("button", { name: "Delete Application" }));

		await waitFor(() => {
			expect(deleteApplicationMock).toHaveBeenCalledWith(1);
			expect(navigateMock).toHaveBeenCalledWith("/applications", { replace: true });
		});
	});

	it("shows the current API error state when the store reports a failure", () => {
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			requestError: "Server unavailable",
		};

		renderApplicationsPage();

		expect(screen.getByText("We couldn't save this application yet.")).toBeInTheDocument();
		expect(screen.getByText("Server unavailable")).toBeInTheDocument();
	});
});