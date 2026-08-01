import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import { useAuthStore } from "../store/useAuthStore";
import { useJobApplicationsStore } from "../store/useJobApplicationsStore";
import {
	EMPTY_JOB_APPLICATION_DRAFT,
	JOB_APPLICATION_STATUSES,
	toJobApplicationDraft,
	toJobApplicationUpsertRequest,
	type JobApplicationDraft,
	type JobApplicationFieldErrors,
	type JobApplicationFieldName,
	type JobApplicationResponse,
} from "../types/jobApplication";

type ApplicationDraftMode = "create" | "edit";
type ApplicationEditorStage = "edit" | "review";
type ApplicationFormAlert = {
	tone: "error" | "info";
	title: string;
	message: string;
};

const LOCATION_SUGGESTIONS = [
	"Auckland",
	"Auckland CBD",
	"Auckland Central",
	"Albany",
	"Christchurch",
	"Dunedin",
	"Hamilton",
	"Lower Hutt",
	"Mount Eden",
	"New Lynn",
	"Newmarket",
	"Palmerston North",
	"Porirua",
	"Queenstown",
	"Remote",
	"Riccarton",
	"Takapuna",
	"Tauranga",
	"Wellington",
	"Wellington Central",
];

function isValidJobLink(value: string) {
	try {
		const url = new URL(value);

		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function validateApplicationDraft(
	draft: JobApplicationDraft,
	draftMode: ApplicationDraftMode,
): JobApplicationFieldErrors {
	const errors: JobApplicationFieldErrors = {};
	const companyName = draft.companyName.trim();
	const jobTitle = draft.jobTitle.trim();
	const location = draft.location.trim();
	const jobLink = draft.jobLink.trim();
	const notes = draft.notes.trim();

	if (!companyName) {
		errors.companyName = "Company name is required.";
	} else if (companyName.length > 100) {
		errors.companyName = "Company name cannot exceed 100 characters.";
	}

	if (!jobTitle) {
		errors.jobTitle = "Job title is required.";
	} else if (jobTitle.length > 150) {
		errors.jobTitle = "Job title cannot exceed 150 characters.";
	}

	if (location.length > 150) {
		errors.location = "Location cannot exceed 150 characters.";
	}

	if (jobLink) {
		if (jobLink.length > 500) {
			errors.jobLink = "Job link cannot exceed 500 characters.";
		} else if (!isValidJobLink(jobLink)) {
			errors.jobLink = "Job link must be a valid URL.";
		}
	}

	if (notes.length > 2000) {
		errors.notes = "Notes cannot exceed 2000 characters.";
	}

	if (draft.status === "Saved" && draft.appliedDate) {
		errors.appliedDate = "A saved job application cannot have an applied date.";
	}

	if (draft.appliedDate && draft.nextFollowUpDate && draft.nextFollowUpDate < draft.appliedDate) {
		errors.nextFollowUpDate = "Next follow-up date cannot be before the applied date.";
	}

	if (
		draftMode === "create"
		&& draft.status === "Withdrawn"
		&& draft.appliedDate
		&& draft.nextFollowUpDate
	) {
		errors.nextFollowUpDate = "A withdrawn application should not have a follow-up date.";
	}

	return errors;
}

function getFieldClassName(error?: string, isWide = false) {
	const baseClassName = isWide ? "application-editor__field application-editor__wide-field" : "application-editor__field";

	return error ? `${baseClassName} application-editor__field--error` : baseClassName;
}

function getReviewValue(value: string) {
	return value.trim() ? value.trim() : "Not provided";
}

function DashboardIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M4 4h7v7H4Zm9 0h7v5h-7ZM4 13h5v7H4Zm7 3h9v4h-9Z" fill="currentColor" />
		</svg>
	);
}

function ApplicationsIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M7 4h8l4 4v12H7zM15 4v4h4M9 12h8M9 16h8"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function AchievementIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="m12 3 2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.2 1-5.5-4-3.9 5.5-.8Z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function ProgressIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M5 17 10 12l3 3 6-7M5 7v10h14"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function LogoutIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M10 7V5h8v14h-8v-2M14 12H4m0 0 3-3m-3 3 3 3"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function SearchIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<path d="m20 20-4.2-4.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
		</svg>
	);
}

function BellIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 5a4 4 0 0 0-4 4v2.7c0 .5-.2 1-.5 1.4L6 15h12l-1.5-1.9a2.3 2.3 0 0 1-.5-1.4V9a4 4 0 0 0-4-4Zm-1.2 13a1.2 1.2 0 0 0 2.4 0"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function HelpIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
			<path d="M9.8 9.4a2.6 2.6 0 1 1 4.3 2c-.8.7-1.4 1.1-1.4 2.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
			<circle cx="12" cy="16.8" r=".9" fill="currentColor" />
		</svg>
	);
}

function BriefcaseIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1m-12 3h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm0 0V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2M10 13h4"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function LocationIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 20s6-4.8 6-10a6 6 0 1 0-12 0c0 5.2 6 10 6 10Z"
				fill="none"
				stroke="currentColor"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
			<circle cx="12" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
		</svg>
	);
}

function LinkIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M10 14 8.6 15.4a3 3 0 1 1-4.2-4.2L7 8.6a3 3 0 0 1 4.2 0M14 10l1.4-1.4a3 3 0 1 1 4.2 4.2L17 15.4a3 3 0 0 1-4.2 0M9 12h6"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function StatusIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M7 12h10M7 8h10M7 16h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
		</svg>
	);
}

function NotesIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M8 4h8l4 4v12H8zM16 4v4h4M10 12h8M10 16h8"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M4 7h16M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V5h6v2"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function getDashboardNavClassName(isActive: boolean) {
	return isActive ? "dashboard-nav__item dashboard-nav__item--active" : "dashboard-nav__item";
}

function formatShortDate(value: string | null) {
	if (!value) {
		return "No date";
	}

	const parsedDate = Date.parse(value);

	if (Number.isNaN(parsedDate)) {
		return value;
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
	}).format(parsedDate);
}

function getApplicationMeta(application: JobApplicationResponse) {
	return application.location ?? application.status;
}

export default function ApplicationsPage() {
	const navigate = useNavigate();
	const { applicationId } = useParams<{ applicationId?: string }>();
	const { currentUser, logout } = useAuthStore();
	const { theme, toggleTheme } = useDashboardTheme();
	const applications = useJobApplicationsStore((state) => state.applications);
	const selectedApplication = useJobApplicationsStore((state) => state.selectedApplication);
	const activeApplicationId = useJobApplicationsStore((state) => state.activeApplicationId);
	const hasLoadedList = useJobApplicationsStore((state) => state.hasLoadedList);
	const isLoadingList = useJobApplicationsStore((state) => state.isLoadingList);
	const isLoadingDetails = useJobApplicationsStore((state) => state.isLoadingDetails);
	const isSubmitting = useJobApplicationsStore((state) => state.isSubmitting);
	const isDeleting = useJobApplicationsStore((state) => state.isDeleting);
	const requestError = useJobApplicationsStore((state) => state.requestError);
	const validationErrors = useJobApplicationsStore((state) => state.validationErrors);
	const statusMessage = useJobApplicationsStore((state) => state.statusMessage);
	const listApplications = useJobApplicationsStore((state) => state.listApplications);
	const loadApplicationById = useJobApplicationsStore((state) => state.loadApplicationById);
	const createApplication = useJobApplicationsStore((state) => state.createApplication);
	const updateApplication = useJobApplicationsStore((state) => state.updateApplication);
	const deleteApplication = useJobApplicationsStore((state) => state.deleteApplication);
	const clearSelection = useJobApplicationsStore((state) => state.clearSelection);
	const clearValidationErrors = useJobApplicationsStore((state) => state.clearValidationErrors);
	const resetStatus = useJobApplicationsStore((state) => state.resetStatus);
	const [draft, setDraft] = useState<JobApplicationDraft>(
		EMPTY_JOB_APPLICATION_DRAFT,
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [draftMode, setDraftMode] = useState<ApplicationDraftMode>("create");
	const [editorStage, setEditorStage] = useState<ApplicationEditorStage>("edit");
	const [fieldErrors, setFieldErrors] = useState<JobApplicationFieldErrors>({});
	const [formAlert, setFormAlert] = useState<ApplicationFormAlert | null>(null);
	const [isLocationSuggestionsOpen, setIsLocationSuggestionsOpen] = useState(false);
	const formAlertRef = useRef<HTMLDivElement | null>(null);
	const isMutating = isSubmitting || isDeleting;
	const isActionLocked = isMutating || isLoadingList || isLoadingDetails;
	const mergedFieldErrors = useMemo(
		() => ({
			...validationErrors,
			...fieldErrors,
		}),
		[fieldErrors, validationErrors],
	);
	const visibleAlert = requestError
		? {
			tone: "error" as const,
			title: "We couldn't save this application yet.",
			message: requestError,
		}
		: formAlert;
	const isCreateReviewing = draftMode === "create" && editorStage === "review";
	const isEditingRoute = typeof applicationId === "string";

	useEffect(() => {
		if (hasLoadedList || isLoadingList) {
			return;
		}

		void listApplications().catch(() => undefined);
	}, [hasLoadedList, isLoadingList, listApplications]);

	useEffect(() => {
		if (!isEditingRoute) {
			clearSelection();
			setDraft(EMPTY_JOB_APPLICATION_DRAFT);
			setDraftMode("create");
			setEditorStage("edit");
			setFieldErrors({});
			setFormAlert(null);
			setIsLocationSuggestionsOpen(false);
			clearValidationErrors();
			return;
		}

		const parsedApplicationId = Number(applicationId);

		if (!Number.isInteger(parsedApplicationId) || parsedApplicationId <= 0) {
			navigate("/applications", { replace: true });
			return;
		}

		if (activeApplicationId === parsedApplicationId && selectedApplication?.id === parsedApplicationId) {
			return;
		}

		setFieldErrors({});
		setFormAlert(null);
		setIsLocationSuggestionsOpen(false);
		clearValidationErrors();
		void loadApplicationById(parsedApplicationId).catch(() => {
			navigate("/applications", { replace: true });
		});
	}, [
		activeApplicationId,
		applicationId,
		clearSelection,
		clearValidationErrors,
		navigate,
		isEditingRoute,
		loadApplicationById,
		selectedApplication,
	]);

	useEffect(() => {
		if (!selectedApplication) {
			if (draftMode === "edit" && activeApplicationId === null && isEditingRoute) {
				navigate("/applications", { replace: true });
				return;
			}

			if (draftMode === "edit" && activeApplicationId === null) {
				setDraft(EMPTY_JOB_APPLICATION_DRAFT);
				setDraftMode("create");
				setEditorStage("edit");
				setFieldErrors({});
				setFormAlert(null);
				setIsLocationSuggestionsOpen(false);
			}

			return;
		}

		setDraft(toJobApplicationDraft(selectedApplication));
		setDraftMode("edit");
		setEditorStage("edit");
		setFieldErrors({});
		setFormAlert(null);
		setIsLocationSuggestionsOpen(false);
	}, [activeApplicationId, draftMode, isEditingRoute, navigate, selectedApplication]);

	useEffect(() => {
		if (Object.keys(validationErrors).length === 0) {
			return;
		}

		setFieldErrors((currentErrors: JobApplicationFieldErrors) => ({
			...currentErrors,
			...validationErrors,
		}));

		if (draftMode === "create" && editorStage === "review") {
			setEditorStage("edit");
		}
	}, [draftMode, editorStage, validationErrors]);

	useEffect(() => {
		if (!visibleAlert || visibleAlert.tone !== "error") {
			return;
		}

		formAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [visibleAlert]);

	const filteredApplications = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		if (!normalizedQuery) {
			return applications.slice(0, 6);
		}

		return applications.filter((application) => {
			return [
				application.companyName,
				application.jobTitle,
				application.location ?? "",
				application.status,
			].some((value) => value.toLowerCase().includes(normalizedQuery));
		}).slice(0, 6);
	}, [applications, searchQuery]);

	const locationSuggestions = useMemo(() => {
		const normalizedQuery = draft.location.trim().toLowerCase();

		const startsWithMatches = LOCATION_SUGGESTIONS.filter((location) => {
			return normalizedQuery.length > 0
				&& location.toLowerCase().startsWith(normalizedQuery)
				&& location.toLowerCase() !== normalizedQuery;
		});

		const includesMatches = LOCATION_SUGGESTIONS.filter((location) => {
			return normalizedQuery.length > 0
				&& !location.toLowerCase().startsWith(normalizedQuery)
				&& location.toLowerCase().includes(normalizedQuery);
		});

		const suggestions = normalizedQuery.length > 0
			? [...startsWithMatches, ...includesMatches]
			: LOCATION_SUGGESTIONS;

		return suggestions.slice(0, 8);
	}, [draft.location]);

	function updateDraftField<Key extends keyof JobApplicationDraft>(
		field: Key,
		value: JobApplicationDraft[Key],
	) {
		setDraft((currentDraft) => ({
			...currentDraft,
			[field]: value,
		}));

		setFieldErrors((currentErrors: JobApplicationFieldErrors) => {
			const nextErrors = { ...currentErrors };
			delete nextErrors[field];

			if (field === "status" || field === "appliedDate" || field === "nextFollowUpDate") {
				delete nextErrors.appliedDate;
				delete nextErrors.nextFollowUpDate;
			}

			return nextErrors;
		});

		const fieldsToClear = [field] as JobApplicationFieldName[];

		if (field === "status" || field === "appliedDate" || field === "nextFollowUpDate") {
			fieldsToClear.push("appliedDate", "nextFollowUpDate");
		}

		clearValidationErrors(fieldsToClear);

		if (formAlert) {
			setFormAlert(null);
		}

		if (requestError) {
			resetStatus("Continue editing your application.");
		}
	}

	function handleLocationFocus() {
		setIsLocationSuggestionsOpen(true);
	}

	function handleLocationBlur() {
		window.setTimeout(() => {
			setIsLocationSuggestionsOpen(false);
		}, 120);
	}

	function handleLocationSuggestionSelect(location: string) {
		updateDraftField("location", location);
		setIsLocationSuggestionsOpen(false);
	}

	function validateCurrentDraft() {
		const nextFieldErrors = validateApplicationDraft(draft, draftMode);

		setFieldErrors(nextFieldErrors);

		if (Object.keys(nextFieldErrors).length === 0) {
			setFormAlert(null);
			return true;
		}

		setFormAlert({
			tone: "error",
			title: "Please fix the highlighted fields.",
			message: "Required fields are marked and invalid values are shown inline below.",
		});

		return false;
	}

	function startBlankDraft() {
		if (isActionLocked) {
			return;
		}

		clearSelection();
		setDraft(EMPTY_JOB_APPLICATION_DRAFT);
		setSearchQuery("");
		setDraftMode("create");
		setEditorStage("edit");
		setFieldErrors({});
		setFormAlert(null);
		setIsLocationSuggestionsOpen(false);
		clearValidationErrors();
		resetStatus("Application draft reset.");
	}

	async function handleCreate() {
		if (isActionLocked) {
			return;
		}

		try {
			const createdApplication = await createApplication(toJobApplicationUpsertRequest(draft));
			setSearchQuery("");
			setFieldErrors({});
			setFormAlert(null);
			clearValidationErrors();
			navigate(`/applications/${createdApplication.id}`, { replace: true });
		} catch {
			return;
		}
	}

	async function handleUpdate() {
		if (activeApplicationId === null || isActionLocked) {
			return;
		}

		try {
			await updateApplication(activeApplicationId, toJobApplicationUpsertRequest(draft));
			setFieldErrors({});
			setFormAlert(null);
			clearValidationErrors();
		} catch {
			return;
		}
	}

	async function handleDelete() {
		if (activeApplicationId === null || isActionLocked) {
			return;
		}

		try {
			await deleteApplication(activeApplicationId);
			navigate("/applications", { replace: true });
		} catch {
			return;
		}
	}

	function handleSelectApplication(application: JobApplicationResponse) {
		if (isActionLocked) {
			return;
		}

		setFieldErrors({});
		setFormAlert(null);
		setIsLocationSuggestionsOpen(false);
		clearValidationErrors();
		void loadApplicationById(application.id).catch(() => undefined);
	}

	function handleCancel() {
		if (draftMode === "create" && editorStage === "review") {
			setEditorStage("edit");
			setFormAlert(null);
			setIsLocationSuggestionsOpen(false);
			resetStatus("Returned to editing.");
			return;
		}

		if (draftMode === "edit" && selectedApplication) {
			setDraft(toJobApplicationDraft(selectedApplication));
			setFieldErrors({});
			setFormAlert(null);
			setIsLocationSuggestionsOpen(false);
			clearValidationErrors();
			resetStatus("Edits reverted.");
			return;
		}

		navigate("/applications", { replace: true });
	}

	async function handleSubmit() {
		if (!validateCurrentDraft()) {
			if (draftMode === "create" && editorStage === "review") {
				setEditorStage("edit");
			}

			return;
		}

		if (draftMode === "edit") {
			await handleUpdate();
			return;
		}

		if (editorStage === "edit") {
			setEditorStage("review");
			setFormAlert({
				tone: "info",
				title: "Review before create",
				message: "Double-check the summary below, then confirm to create the application.",
			});
			setIsLocationSuggestionsOpen(false);
			resetStatus("Review your application before creating it.");
			return;
		}

		await handleCreate();
	}

	function handleEditorKeyDown(event: KeyboardEvent<HTMLFormElement>) {
		if (event.key !== "Enter") {
			return;
		}
		if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement) {
			return;
		}

		event.preventDefault();
	}

	const dashboardShellClassName =
		theme === "dark" ? "dashboard-shell dashboard-shell--dark" : "dashboard-shell";

	return (
		<main className={dashboardShellClassName}>
			<aside className="dashboard-sidebar">
				<div className="dashboard-brand" aria-label="JobQuest">
					<img className="dashboard-brand__image" src={logo} alt="JobQuest" />
				</div>

				<nav className="dashboard-nav" aria-label="Dashboard navigation">
					<NavLink className={({ isActive }) => getDashboardNavClassName(isActive)} to="/dashboard">
						<DashboardIcon />
						<span>Dashboard</span>
					</NavLink>
					<NavLink className={({ isActive }) => getDashboardNavClassName(isActive)} to="/applications">
						<ApplicationsIcon />
						<span>Applications</span>
					</NavLink>
					<NavLink className={({ isActive }) => getDashboardNavClassName(isActive)} to="/achievements">
						<AchievementIcon />
						<span>Achievements</span>
					</NavLink>
					<NavLink className={({ isActive }) => getDashboardNavClassName(isActive)} to="/progress">
						<ProgressIcon />
						<span>Progress</span>
					</NavLink>
				</nav>

				<div className="dashboard-sidebar__spacer" />

				<div className="dashboard-sidebar__actions">
					<button
						className="dashboard-theme-toggle"
						type="button"
						onClick={toggleTheme}
						aria-pressed={theme === "dark"}
					>
						<span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
					</button>

					<button className="dashboard-logout" type="button" onClick={() => logout()}>
						<LogoutIcon />
						<span>Logout</span>
					</button>
				</div>
			</aside>

			<section className="workspace-main">
				<header className="workspace-topbar">
					<label className="workspace-search" aria-label="Search applications">
						<SearchIcon />
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder={draftMode === "edit" ? "Search jobs or tasks..." : "Search applications..."}
						/>
					</label>

					<div className="workspace-topbar__meta">
						<button className="workspace-icon-button" type="button" aria-label="Notifications">
							<BellIcon />
						</button>
						<button className="workspace-icon-button" type="button" aria-label="Help">
							<HelpIcon />
						</button>
						<div className="workspace-topbar__profile">
							<span>{currentUser?.username ?? "JobQuest User"}</span>
						</div>
					</div>
				</header>

				<section className="application-workspace">
					<header className="application-hero">
						<div className="application-hero__copy">
							<p className="application-hero__eyebrow">
								{draftMode === "edit" ? "Applications > Edit Application" : "Workspace"}
							</p>
							<h1>{draftMode === "edit" ? draft.jobTitle || "Edit Application" : "New Application"}</h1>
							{draftMode === "edit" ? (
								<div className="application-hero__meta">
									<span>{draft.companyName || "Unknown company"}</span>
									<span>{draft.location || "Location not provided"}</span>
								</div>
							) : (
								<p>
									Document your career milestones. Capture every detail of your journey
									towards your next role.
								</p>
							)}
						</div>

						{draftMode === "edit" ? (
							<button
								className="application-hero__danger"
								type="button"
								onClick={() => void handleDelete()}
								disabled={isActionLocked || activeApplicationId === null}
							>
								<TrashIcon />
								<span>{isDeleting ? "Deleting..." : "Delete Application"}</span>
							</button>
						) : null}
					</header>

					<div className="application-status-strip">
						<div>
							<strong>{statusMessage}</strong>
							<span>
								{isLoadingList
									? "Loading your applications..."
									: hasLoadedList
										? `${applications.length} saved application(s)`
										: "Application list not loaded yet."}
							</span>
						</div>
						<button
							className="application-status-strip__action"
							type="button"
							onClick={startBlankDraft}
							disabled={isActionLocked}
						>
							Create blank draft
						</button>
					</div>

					<section className="application-library">
						<div className="application-library__header">
							<h2>Application Records</h2>
							<span>{searchQuery ? "Filtered results" : "Recent records"}</span>
						</div>

						<div className="application-library__list">
							<button
								type="button"
								className={draftMode === "create" ? "application-library__item application-library__item--active" : "application-library__item"}
								onClick={startBlankDraft}
								disabled={isActionLocked}
							>
								<strong>New draft</strong>
								<span>Start a fresh application entry</span>
							</button>

							{filteredApplications.map((application) => (
								<button
									key={application.id}
									type="button"
									className={
										application.id === activeApplicationId
											? "application-library__item application-library__item--active"
											: "application-library__item"
									}
									onClick={() => handleSelectApplication(application)}
									disabled={isActionLocked}
								>
									<strong>{application.jobTitle}</strong>
									<span>
										{application.companyName}
										<span> • </span>
										{getApplicationMeta(application)}
									</span>
									<em>{application.appliedDate ? formatShortDate(application.appliedDate) : application.status}</em>
								</button>
							))}
						</div>
					</section>

					<form
						className={draftMode === "edit" ? "application-editor application-editor--edit" : "application-editor application-editor--create"}
						onKeyDown={handleEditorKeyDown}
						onSubmit={(event) => {
							event.preventDefault();
							void handleSubmit();
						}}
					>
						{visibleAlert ? (
							<div
								ref={formAlertRef}
								className={
									visibleAlert.tone === "error"
										? "application-editor__alert application-editor__alert--error"
										: "application-editor__alert application-editor__alert--info"
								}
								role={visibleAlert.tone === "error" ? "alert" : "status"}
							>
								<strong>{visibleAlert.title}</strong>
								<p>{visibleAlert.message}</p>
							</div>
						) : null}

						{draftMode === "edit" ? (
							<>
								<section className="application-editor__section">
									<div className="application-editor__section-header">
										<BriefcaseIcon />
										<h3>Role Details</h3>
									</div>
									<div className="application-editor__grid application-editor__grid--two">
										<label className={getFieldClassName(mergedFieldErrors.jobTitle)}>
											<span>Job Title <em className="application-editor__required">Required</em></span>
											<input
												type="text"
												value={draft.jobTitle}
												onChange={(event) => updateDraftField("jobTitle", event.target.value)}
												aria-invalid={mergedFieldErrors.jobTitle ? true : undefined}
												aria-describedby={mergedFieldErrors.jobTitle ? "jobTitle-error" : undefined}
												disabled={isMutating}
											/>
											{mergedFieldErrors.jobTitle ? <small id="jobTitle-error" className="application-editor__field-error">{mergedFieldErrors.jobTitle}</small> : null}
										</label>
										<label className={getFieldClassName(mergedFieldErrors.companyName)}>
											<span>Company <em className="application-editor__required">Required</em></span>
											<input
												type="text"
												value={draft.companyName}
												onChange={(event) => updateDraftField("companyName", event.target.value)}
												aria-invalid={mergedFieldErrors.companyName ? true : undefined}
												aria-describedby={mergedFieldErrors.companyName ? "companyName-error" : undefined}
												disabled={isMutating}
											/>
											{mergedFieldErrors.companyName ? <small id="companyName-error" className="application-editor__field-error">{mergedFieldErrors.companyName}</small> : null}
										</label>
										<label className={getFieldClassName(mergedFieldErrors.location)}>
											<span>Location</span>
											<div className="application-editor__autocomplete">
												<div className="application-editor__field-control">
													<LocationIcon />
													<input
														type="text"
														value={draft.location}
														onChange={(event) => updateDraftField("location", event.target.value)}
														onFocus={handleLocationFocus}
														onBlur={handleLocationBlur}
														placeholder="Type a city or region"
														aria-invalid={mergedFieldErrors.location ? true : undefined}
														aria-describedby={mergedFieldErrors.location ? "location-error" : undefined}
														disabled={isMutating}
														autoComplete="off"
													/>
												</div>
												{isLocationSuggestionsOpen && locationSuggestions.length > 0 ? (
													<div className="application-editor__suggestions" role="listbox" aria-label="Location suggestions">
														{locationSuggestions.map((location) => (
															<button
																key={location}
																className="application-editor__suggestion"
																type="button"
																onMouseDown={(event) => {
																	event.preventDefault();
																	handleLocationSuggestionSelect(location);
																}}
															>
																<span>{location}</span>
															</button>
														))}
													</div>
												) : null}
											</div>
											{mergedFieldErrors.location ? <small id="location-error" className="application-editor__field-error">{mergedFieldErrors.location}</small> : null}
										</label>
										<label className={getFieldClassName(mergedFieldErrors.jobLink)}>
											<span>Job URL</span>
											<input
												type="url"
												value={draft.jobLink}
												onChange={(event) => updateDraftField("jobLink", event.target.value)}
												aria-invalid={mergedFieldErrors.jobLink ? true : undefined}
												aria-describedby={mergedFieldErrors.jobLink ? "jobLink-error" : undefined}
												disabled={isMutating}
											/>
											{mergedFieldErrors.jobLink ? <small id="jobLink-error" className="application-editor__field-error">{mergedFieldErrors.jobLink}</small> : null}
										</label>
									</div>
								</section>

								<section className="application-editor__section">
									<div className="application-editor__section-header">
										<StatusIcon />
										<h3>Current Status</h3>
									</div>
									<div className="application-editor__grid application-editor__grid--two">
										<label className={getFieldClassName()}>
											<span>Application Status</span>
											<select
												value={draft.status}
												onChange={(event) => updateDraftField("status", event.target.value as JobApplicationDraft["status"])}
												disabled={isMutating}
											>
												{JOB_APPLICATION_STATUSES.map((status) => (
													<option key={status} value={status}>
														{status}
													</option>
												))}
											</select>
										</label>
										<label className={getFieldClassName(mergedFieldErrors.appliedDate)}>
											<span>Applied Date</span>
											<input
												type="date"
												value={draft.appliedDate}
												onChange={(event) => updateDraftField("appliedDate", event.target.value)}
												aria-invalid={mergedFieldErrors.appliedDate ? true : undefined}
												aria-describedby={mergedFieldErrors.appliedDate ? "appliedDate-error" : undefined}
												disabled={isMutating}
											/>
											{mergedFieldErrors.appliedDate ? <small id="appliedDate-error" className="application-editor__field-error">{mergedFieldErrors.appliedDate}</small> : null}
										</label>
									</div>
								</section>

								<section className="application-editor__section">
									<div className="application-editor__section-header">
										<NotesIcon />
										<h3>Notes</h3>
									</div>
									<label className={getFieldClassName(mergedFieldErrors.notes, true)}>
										<span>Notes</span>
										<textarea
											rows={6}
											value={draft.notes}
											onChange={(event) => updateDraftField("notes", event.target.value)}
											placeholder="Role emphasizes material design systems and complex data visualizations."
											aria-invalid={mergedFieldErrors.notes ? true : undefined}
											aria-describedby={mergedFieldErrors.notes ? "notes-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.notes ? <small id="notes-error" className="application-editor__field-error">{mergedFieldErrors.notes}</small> : null}
									</label>
								</section>
							</>
						) : isCreateReviewing ? (
							<section className="application-editor__card application-editor__card--review">
								<div className="application-review">
									<div className="application-review__header">
										<h3>Review Application</h3>
										<p>Check the details below before creating this record.</p>
									</div>

									<section className="application-review__section">
										<h4>Role Overview</h4>
										<div className="application-review__grid">
											<div className="application-review__item">
												<span>Company</span>
												<strong>{getReviewValue(draft.companyName)}</strong>
											</div>
											<div className="application-review__item">
												<span>Job Title</span>
												<strong>{getReviewValue(draft.jobTitle)}</strong>
											</div>
											<div className="application-review__item">
												<span>Location</span>
												<strong>{getReviewValue(draft.location)}</strong>
											</div>
											<div className="application-review__item">
												<span>Job Link</span>
												<strong>{getReviewValue(draft.jobLink)}</strong>
											</div>
										</div>
									</section>

									<section className="application-review__section">
										<h4>Tracking</h4>
										<div className="application-review__grid">
											<div className="application-review__item">
												<span>Status</span>
												<strong>{draft.status}</strong>
											</div>
											<div className="application-review__item">
												<span>Applied Date</span>
												<strong>{getReviewValue(draft.appliedDate)}</strong>
											</div>
											<div className="application-review__item">
												<span>Next Follow-up Date</span>
												<strong>{getReviewValue(draft.nextFollowUpDate)}</strong>
											</div>
										</div>
									</section>

									<section className="application-review__section">
										<h4>Notes</h4>
										<p className="application-review__notes">{getReviewValue(draft.notes)}</p>
									</section>
								</div>
							</section>
						) : (
							<section className="application-editor__card">
								<div className="application-editor__grid application-editor__grid--two">
									<label className={getFieldClassName(mergedFieldErrors.companyName)}>
										<span>Company Name <em className="application-editor__required">Required</em></span>
										<input
											type="text"
											value={draft.companyName}
											onChange={(event) => updateDraftField("companyName", event.target.value)}
											placeholder="e.g. Acme Corp"
											aria-invalid={mergedFieldErrors.companyName ? true : undefined}
											aria-describedby={mergedFieldErrors.companyName ? "create-companyName-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.companyName ? <small id="create-companyName-error" className="application-editor__field-error">{mergedFieldErrors.companyName}</small> : null}
									</label>

									<label className={getFieldClassName(mergedFieldErrors.jobTitle)}>
										<span>Job Title <em className="application-editor__required">Required</em></span>
										<input
											type="text"
											value={draft.jobTitle}
											onChange={(event) => updateDraftField("jobTitle", event.target.value)}
											placeholder="e.g. Senior Software Architect"
											aria-invalid={mergedFieldErrors.jobTitle ? true : undefined}
											aria-describedby={mergedFieldErrors.jobTitle ? "create-jobTitle-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.jobTitle ? <small id="create-jobTitle-error" className="application-editor__field-error">{mergedFieldErrors.jobTitle}</small> : null}
									</label>

									<label className={getFieldClassName(mergedFieldErrors.location)}>
										<span>Location</span>
										<div className="application-editor__autocomplete">
											<div className="application-editor__field-control">
												<LocationIcon />
												<input
													type="text"
													value={draft.location}
													onChange={(event) => updateDraftField("location", event.target.value)}
													onFocus={handleLocationFocus}
													onBlur={handleLocationBlur}
													placeholder="Type a city or region"
													aria-invalid={mergedFieldErrors.location ? true : undefined}
													aria-describedby={mergedFieldErrors.location ? "create-location-error" : undefined}
													disabled={isMutating}
													autoComplete="off"
												/>
											</div>
											{isLocationSuggestionsOpen && locationSuggestions.length > 0 ? (
												<div className="application-editor__suggestions" role="listbox" aria-label="Location suggestions">
													{locationSuggestions.map((location) => (
														<button
															key={location}
															className="application-editor__suggestion"
															type="button"
															onMouseDown={(event) => {
																event.preventDefault();
																handleLocationSuggestionSelect(location);
															}}
														>
															<span>{location}</span>
														</button>
													))}
												</div>
											) : null}
										</div>
										{mergedFieldErrors.location ? <small id="create-location-error" className="application-editor__field-error">{mergedFieldErrors.location}</small> : null}
									</label>

									<label className={getFieldClassName(mergedFieldErrors.jobLink)}>
										<span>Job Link</span>
										<div className="application-editor__field-control">
											<LinkIcon />
											<input
												type="url"
												value={draft.jobLink}
												onChange={(event) => updateDraftField("jobLink", event.target.value)}
												placeholder="https://example.com/job-post"
												aria-invalid={mergedFieldErrors.jobLink ? true : undefined}
												aria-describedby={mergedFieldErrors.jobLink ? "create-jobLink-error" : undefined}
												disabled={isMutating}
											/>
										</div>
										{mergedFieldErrors.jobLink ? <small id="create-jobLink-error" className="application-editor__field-error">{mergedFieldErrors.jobLink}</small> : null}
									</label>

									<label className={getFieldClassName()}>
										<span>Status</span>
										<select
											value={draft.status}
											onChange={(event) => updateDraftField("status", event.target.value as JobApplicationDraft["status"])}
											disabled={isMutating}
										>
											{JOB_APPLICATION_STATUSES.map((status) => (
												<option key={status} value={status}>
													{status}
												</option>
											))}
										</select>
									</label>

									<label className={getFieldClassName(mergedFieldErrors.appliedDate)}>
										<span>Applied Date</span>
										<input
											type="date"
											value={draft.appliedDate}
											onChange={(event) => updateDraftField("appliedDate", event.target.value)}
											aria-invalid={mergedFieldErrors.appliedDate ? true : undefined}
											aria-describedby={mergedFieldErrors.appliedDate ? "create-appliedDate-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.appliedDate ? <small id="create-appliedDate-error" className="application-editor__field-error">{mergedFieldErrors.appliedDate}</small> : null}
									</label>

									<label className={getFieldClassName(mergedFieldErrors.nextFollowUpDate)}>
										<span>Next Follow-up Date</span>
										<input
											type="date"
											value={draft.nextFollowUpDate}
											onChange={(event) => updateDraftField("nextFollowUpDate", event.target.value)}
											aria-invalid={mergedFieldErrors.nextFollowUpDate ? true : undefined}
											aria-describedby={mergedFieldErrors.nextFollowUpDate ? "create-nextFollowUpDate-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.nextFollowUpDate ? <small id="create-nextFollowUpDate-error" className="application-editor__field-error">{mergedFieldErrors.nextFollowUpDate}</small> : null}
									</label>

									<label className={getFieldClassName(mergedFieldErrors.notes, true)}>
										<span>Notes</span>
										<textarea
											rows={7}
											value={draft.notes}
											onChange={(event) => updateDraftField("notes", event.target.value)}
											placeholder="Key contacts, salary expectations, interview prep..."
											aria-invalid={mergedFieldErrors.notes ? true : undefined}
											aria-describedby={mergedFieldErrors.notes ? "create-notes-error" : undefined}
											disabled={isMutating}
										/>
										{mergedFieldErrors.notes ? <small id="create-notes-error" className="application-editor__field-error">{mergedFieldErrors.notes}</small> : null}
									</label>
								</div>
							</section>
						)}

						<div className="application-editor__actions">
							<button
								className="application-editor__ghost-button"
								type="button"
								onClick={handleCancel}
								disabled={isActionLocked}
							>
								{isCreateReviewing ? "Back to Edit" : "Cancel"}
							</button>
							<button className="application-editor__primary-button" type="submit" disabled={isActionLocked}>
								{draftMode === "edit"
									? isSubmitting
										? "Saving changes..."
										: "Save Changes"
									: isCreateReviewing
										? isSubmitting
											? "Creating application..."
											: "Create Application"
										: "Review Application"}
							</button>
						</div>
					</form>
				</section>
			</section>
		</main>
	);
}
