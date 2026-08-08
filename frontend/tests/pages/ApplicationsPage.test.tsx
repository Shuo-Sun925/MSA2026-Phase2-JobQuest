import { render, screen, waitFor, within } from "@testing-library/react";
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
	blockerProceedMock,
	blockerResetMock,
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
	blockerProceedMock: vi.fn(),
	blockerResetMock: vi.fn(),
}));

let paramsState: { applicationId?: string };
let blockerState: {
	state: "unblocked" | "blocked";
	proceed: typeof blockerProceedMock;
	reset: typeof blockerResetMock;
};
let formScrollIntoViewMock: ReturnType<typeof vi.fn>;

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
		useBlocker: () => blockerState,
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
		formScrollIntoViewMock = vi.fn();
		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			configurable: true,
			value: formScrollIntoViewMock,
		});
		Object.defineProperty(window, "requestAnimationFrame", {
			configurable: true,
			value: (callback: FrameRequestCallback) => {
				callback(0);
				return 1;
			},
		});

		paramsState = {};
		blockerState = {
			state: "unblocked",
			proceed: blockerProceedMock,
			reset: blockerResetMock,
		};
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
		blockerProceedMock.mockReset();
		blockerResetMock.mockReset();

		listApplicationsMock.mockResolvedValue([]);
		loadApplicationByIdMock.mockResolvedValue(createApplication());
		createApplicationMock.mockResolvedValue(createApplication({ id: 7, status: "Saved", appliedDate: null }));
		updateApplicationMock.mockResolvedValue(createApplication({ companyName: "Updated Co" }));
		deleteApplicationMock.mockResolvedValue(undefined);

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
		expect(screen.getByText("Filtered results")).toBeInTheDocument();
	});

	it("positions the new application form and focuses company name on entry", async () => {
		renderApplicationsPage();

		const companyNameInput = await screen.findByLabelText(/Company Name/i);

		await waitFor(() => {
			expect(formScrollIntoViewMock).toHaveBeenCalledTimes(1);
			expect(companyNameInput).toHaveFocus();
		});
	});

	it("shows Clear draft in create mode and hides it in edit mode", () => {
		const { unmount } = renderApplicationsPage();

		expect(screen.getByRole("button", { name: "Clear draft" })).toBeInTheDocument();
		unmount();

		paramsState = { applicationId: "1" };
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			selectedApplication: createApplication(),
			activeApplicationId: 1,
		};

		renderApplicationsPage();

		expect(screen.queryByRole("button", { name: "Clear draft" })).not.toBeInTheDocument();
	});

	it("creates a new application directly from the form", async () => {
		renderApplicationsPage();
		const user = userEvent.setup();

		await user.type(screen.getByLabelText(/Company Name/i), "  Fabrikam  ");
		await user.type(screen.getByLabelText(/Job Title/i), "  Product Designer  ");
		await user.click(screen.getByRole("button", { name: "Save Application" }));

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

	it("asks for confirmation before clearing a create draft", async () => {
		renderApplicationsPage();
		const user = userEvent.setup();

		await user.type(screen.getByLabelText(/Company Name/i), "Contoso");
		await user.click(screen.getByRole("button", { name: "Clear draft" }));

		expect(screen.getByRole("dialog", { name: "Clear this draft?" })).toBeInTheDocument();
		expect(screen.getByText("This will remove all information currently entered in the form.")).toBeInTheDocument();
	});

	it("keeps draft values when clear confirmation is cancelled", async () => {
		renderApplicationsPage();
		const user = userEvent.setup();
		const companyNameInput = screen.getByLabelText(/Company Name/i);

		await user.type(companyNameInput, "Contoso");
		await user.click(screen.getByRole("button", { name: "Clear draft" }));

		const dialog = screen.getByRole("dialog", { name: "Clear this draft?" });
		await user.click(within(dialog).getByRole("button", { name: /^Cancel$/i }));

		expect(screen.queryByRole("dialog", { name: "Clear this draft?" })).not.toBeInTheDocument();
		expect(companyNameInput).toHaveValue("Contoso");
	});

	it("clears the create draft without calling APIs and refocuses company name", async () => {
		renderApplicationsPage();
		const user = userEvent.setup();
		const companyNameInput = screen.getByLabelText(/Company Name/i);
		const jobTitleInput = screen.getByLabelText(/Job Title/i);
		const locationInput = screen.getByLabelText(/^Location$/i);
		const jobLinkInput = screen.getByLabelText(/Job Link/i);
		const statusInput = screen.getByLabelText(/^Status$/i);
		const appliedDateInput = screen.getByLabelText(/Applied Date/i);
		const nextFollowUpInput = screen.getByLabelText(/Next Follow-up Date/i);
		const notesInput = screen.getByLabelText(/Notes/i);

		await user.type(companyNameInput, "Contoso");
		await user.type(jobTitleInput, "Engineer");
		await user.type(locationInput, "Auckland");
		await user.type(jobLinkInput, "https://example.com/job");
		await user.selectOptions(statusInput, "Applied");
		await user.type(appliedDateInput, "2026-08-04");
		await user.type(nextFollowUpInput, "2026-08-12");
		await user.type(notesInput, "Important notes");

		await user.click(screen.getByRole("button", { name: "Clear draft" }));

		const dialog = screen.getByRole("dialog", { name: "Clear this draft?" });
		await user.click(within(dialog).getByRole("button", { name: /^Clear draft$/i }));

		expect(createApplicationMock).not.toHaveBeenCalled();
		expect(updateApplicationMock).not.toHaveBeenCalled();
		expect(companyNameInput).toHaveValue("");
		expect(jobTitleInput).toHaveValue("");
		expect(locationInput).toHaveValue("");
		expect(jobLinkInput).toHaveValue("");
		expect(statusInput).toHaveValue("Saved");
		expect(appliedDateInput).toHaveValue("");
		expect(nextFollowUpInput).toHaveValue("");
		expect(notesInput).toHaveValue("");
		expect(companyNameInput).toHaveFocus();
		expect(formScrollIntoViewMock).toHaveBeenCalledTimes(2);
	});

	it("updates an existing application and supports deleting it", async () => {
		paramsState = { applicationId: "1" };
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [createApplication()],
			selectedApplication: createApplication(),
			activeApplicationId: 1,
		};
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
			expect(navigateMock).toHaveBeenCalledWith("/applications", { replace: true });
		});

		await user.click(screen.getByRole("button", { name: "Delete Application" }));

		await waitFor(() => {
			expect(deleteApplicationMock).toHaveBeenCalledWith(1);
			expect(navigateMock).toHaveBeenCalledWith("/applications", { replace: true });
		});
	});

	it("stays on the edit page when saving changes fails", async () => {
		paramsState = { applicationId: "1" };
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [createApplication()],
			selectedApplication: createApplication(),
			activeApplicationId: 1,
			requestError: "Server unavailable",
		};
		updateApplicationMock.mockRejectedValue(new Error("Server unavailable"));

		renderApplicationsPage();
		const user = userEvent.setup();

		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		await waitFor(() => {
			expect(updateApplicationMock).toHaveBeenCalledTimes(1);
		});

		expect(navigateMock).not.toHaveBeenCalledWith("/applications", { replace: true });
		expect(screen.getByText("We couldn't save this application yet.")).toBeInTheDocument();
		expect(screen.getByText("Server unavailable")).toBeInTheDocument();
	});

	it("shows a professional leave-page warning when navigation is blocked by unsaved changes", async () => {
		blockerState = {
			state: "blocked",
			proceed: blockerProceedMock,
			reset: blockerResetMock,
		};

		renderApplicationsPage();
		const user = userEvent.setup();

		expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeInTheDocument();
		expect(screen.getByText("If you leave this page now, your unsaved application changes will be lost.")).toBeInTheDocument();

		const resetCallsBefore = blockerResetMock.mock.calls.length;
		await user.click(screen.getByRole("button", { name: "Stay on this page" }));
		expect(blockerResetMock).toHaveBeenCalledTimes(resetCallsBefore + 1);

		const proceedCallsBefore = blockerProceedMock.mock.calls.length;
		await user.click(screen.getByRole("button", { name: "Leave page" }));
		expect(blockerProceedMock).toHaveBeenCalledTimes(proceedCallsBefore + 1);
	});

	it("refreshes applications when the page mounts even if cached data exists", async () => {
		jobApplicationsStoreState = {
			...jobApplicationsStoreState,
			applications: [createApplication()],
			hasLoadedList: true,
		};

		renderApplicationsPage();

		await waitFor(() => {
			expect(listApplicationsMock).toHaveBeenCalledTimes(1);
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