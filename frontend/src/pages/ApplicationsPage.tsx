import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useJobApplicationsStore } from "../store/useJobApplicationsStore";
import {
	EMPTY_JOB_APPLICATION_DRAFT,
	JOB_APPLICATION_STATUSES,
	toJobApplicationDraft,
	toJobApplicationUpsertRequest,
	type JobApplicationDraft,
	type JobApplicationResponse,
} from "../types/jobApplication";

type ApplicationDraftMode = "create" | "edit";

export default function ApplicationsPage() {
	const applications = useJobApplicationsStore((state) => state.applications);
	const selectedApplication = useJobApplicationsStore((state) => state.selectedApplication);
	const activeApplicationId = useJobApplicationsStore((state) => state.activeApplicationId);
	const hasLoadedList = useJobApplicationsStore((state) => state.hasLoadedList);
	const isLoadingList = useJobApplicationsStore((state) => state.isLoadingList);
	const isLoadingDetails = useJobApplicationsStore((state) => state.isLoadingDetails);
	const isSubmitting = useJobApplicationsStore((state) => state.isSubmitting);
	const isDeleting = useJobApplicationsStore((state) => state.isDeleting);
	const requestError = useJobApplicationsStore((state) => state.requestError);
	const statusMessage = useJobApplicationsStore((state) => state.statusMessage);
	const listApplications = useJobApplicationsStore((state) => state.listApplications);
	const loadApplicationById = useJobApplicationsStore((state) => state.loadApplicationById);
	const createApplication = useJobApplicationsStore((state) => state.createApplication);
	const updateApplication = useJobApplicationsStore((state) => state.updateApplication);
	const deleteApplication = useJobApplicationsStore((state) => state.deleteApplication);
	const clearSelection = useJobApplicationsStore((state) => state.clearSelection);
	const resetStatus = useJobApplicationsStore((state) => state.resetStatus);
	const [draft, setDraft] = useState<JobApplicationDraft>(
		EMPTY_JOB_APPLICATION_DRAFT,
	);
	const [inspectId, setInspectId] = useState<string>("");
	const [draftMode, setDraftMode] = useState<ApplicationDraftMode>("create");
	const isMutating = isSubmitting || isDeleting;
	const isActionLocked = isMutating || isLoadingList || isLoadingDetails;

	useEffect(() => {
		if (hasLoadedList || isLoadingList) {
			return;
		}

		void listApplications().catch(() => undefined);
	}, [hasLoadedList, isLoadingList, listApplications]);

	useEffect(() => {
		if (!selectedApplication) {
			if (draftMode === "edit" && activeApplicationId === null) {
				setDraft(EMPTY_JOB_APPLICATION_DRAFT);
				setInspectId("");
				setDraftMode("create");
			}

			return;
		}

		setDraft(toJobApplicationDraft(selectedApplication));
		setInspectId(String(selectedApplication.id));
		setDraftMode("edit");
	}, [activeApplicationId, draftMode, selectedApplication]);

	const selectedSummary = useMemo(() => {
		if (!selectedApplication) {
			return "No application selected.";
		}

		return `${selectedApplication.companyName} / ${selectedApplication.jobTitle} / ${selectedApplication.status}`;
	}, [selectedApplication]);

	function updateDraftField<Key extends keyof JobApplicationDraft>(
		field: Key,
		value: JobApplicationDraft[Key],
	) {
		setDraft((currentDraft) => ({
			...currentDraft,
			[field]: value,
		}));
	}

	function startBlankDraft() {
		if (isActionLocked) {
			return;
		}

		clearSelection();
		setDraft(EMPTY_JOB_APPLICATION_DRAFT);
		setInspectId("");
		setDraftMode("create");
		resetStatus("Application draft reset.");
	}

	async function handleCreate() {
		if (isActionLocked) {
			return;
		}

		try {
			await createApplication(toJobApplicationUpsertRequest(draft));
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
			setDraft(EMPTY_JOB_APPLICATION_DRAFT);
			setInspectId("");
			setDraftMode("create");
		} catch {
			return;
		}
	}

	async function handleInspectById() {
		if (isActionLocked) {
			return;
		}

		const parsedId = Number(inspectId);

		if (!Number.isInteger(parsedId) || parsedId <= 0) {
			resetStatus("Enter a valid application ID before requesting details.");
			return;
		}

		try {
			await loadApplicationById(parsedId);
		} catch {
			return;
		}
	}

	function handleSelectApplication(application: JobApplicationResponse) {
		if (isActionLocked) {
			return;
		}

		setInspectId(String(application.id));
		void loadApplicationById(application.id).catch(() => undefined);
	}

	return (
		<main className="app-shell">
			<section className="app-hero">
				<p className="app-hero__eyebrow">Applications</p>
				<h1>Temporary Applications API sandbox</h1>
				<p className="app-hero__body">
					This page is intentionally task-focused. It exposes the real applications endpoints first,
					so loading, empty, error, and success states can be verified before polishing the UI.
				</p>
			</section>

			<section className="session-card">
				<div className="session-card__header">
					<div>
						<p className="auth-card__eyebrow">Module checklist</p>
						<h2>Request controls and runtime state</h2>
					</div>

					<span
						className={requestError ? "status-pill" : "status-pill status-pill--success"}
					>
						{requestError ? "Error present" : "Ready"}
					</span>
				</div>

				<div className="session-card__content">
					<div className="session-panel">
						<h3>Current request status</h3>
						<dl>
							<div>
								<dt>Message</dt>
								<dd>{statusMessage}</dd>
							</div>
							<div>
								<dt>List state</dt>
								<dd>
									{isLoadingList
										? "Loading"
										: hasLoadedList
											? `${applications.length} application(s)`
											: "Not requested yet"}
								</dd>
							</div>
							<div>
								<dt>Selected application</dt>
								<dd>{selectedSummary}</dd>
							</div>
						</dl>

						{requestError ? <p className="auth-form__error">{requestError}</p> : null}
					</div>

					<div className="session-panel">
						<h3>API operations</h3>
						<div className="stack-actions">
							<button
								className="secondary-button"
								type="button"
								onClick={() => void listApplications().catch(() => undefined)}
								disabled={isActionLocked}
							>
								{isLoadingList ? "Loading..." : "Reload Applications"}
							</button>

							<div className="inline-fields">
								<input
									type="number"
									min="1"
									value={inspectId}
									onChange={(event) => setInspectId(event.target.value)}
									placeholder="Application ID"
									disabled={isActionLocked}
								/>
								<button
									className="secondary-button"
									type="button"
									onClick={() => void handleInspectById()}
									disabled={isActionLocked}
								>
									{isLoadingDetails ? "Loading Details..." : "Load By ID"}
								</button>
							</div>

							<button
								className="secondary-button"
								type="button"
								onClick={startBlankDraft}
								disabled={isActionLocked}
							>
								Start Blank Draft
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="session-card">
				<div className="session-card__header">
					<div>
						<p className="auth-card__eyebrow">DTO mapping</p>
						<h2>Create or update application</h2>
					</div>
				</div>

				<form className="auth-form" onSubmit={(event) => event.preventDefault()}>
					<div className="application-form-grid">
						<label>
							<span>CompanyName</span>
							<input
								type="text"
								value={draft.companyName}
								onChange={(event) => updateDraftField("companyName", event.target.value)}
								placeholder="Contoso"
								disabled={isMutating}
							/>
						</label>

						<label>
							<span>JobTitle</span>
							<input
								type="text"
								value={draft.jobTitle}
								onChange={(event) => updateDraftField("jobTitle", event.target.value)}
								placeholder="Software Engineer"
								disabled={isMutating}
							/>
						</label>

						<label>
							<span>Location</span>
							<input
								type="text"
								value={draft.location}
								onChange={(event) => updateDraftField("location", event.target.value)}
								placeholder="Melbourne"
								disabled={isMutating}
							/>
						</label>

						<label>
							<span>JobLink</span>
							<input
								type="url"
								value={draft.jobLink}
								onChange={(event) => updateDraftField("jobLink", event.target.value)}
								placeholder="https://example.com/jobs/123"
								disabled={isMutating}
							/>
						</label>

						<label>
							<span>Status</span>
							<select
								value={draft.status}
								onChange={(event) =>
									updateDraftField("status", event.target.value as JobApplicationDraft["status"])
								}
								disabled={isMutating}
							>
								{JOB_APPLICATION_STATUSES.map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</select>
						</label>

						<label>
							<span>AppliedDate</span>
							<input
								type="date"
								value={draft.appliedDate}
								onChange={(event) => updateDraftField("appliedDate", event.target.value)}
								disabled={isMutating}
							/>
						</label>

						<label>
							<span>NextFollowUpDate</span>
							<input
								type="date"
								value={draft.nextFollowUpDate}
								onChange={(event) => updateDraftField("nextFollowUpDate", event.target.value)}
								disabled={isMutating}
							/>
						</label>

						<label className="application-form-grid__wide">
							<span>Notes</span>
							<textarea
								rows={5}
								value={draft.notes}
								onChange={(event) => updateDraftField("notes", event.target.value)}
								placeholder="Temporary testing notes"
								disabled={isMutating}
							/>
						</label>
					</div>

					<div className="route-actions">
						<button
							className="primary-button"
							type="button"
							onClick={() => void handleCreate()}
							disabled={isActionLocked}
						>
							{isSubmitting ? "Submitting..." : "Create Application"}
						</button>

						<button
							className="secondary-button"
							type="button"
							onClick={() => void handleUpdate()}
							disabled={isActionLocked || activeApplicationId === null}
						>
							Update Selected
						</button>

						<button
							className="secondary-button"
							type="button"
							onClick={() => void handleDelete()}
							disabled={isActionLocked || activeApplicationId === null}
						>
							{isDeleting ? "Deleting..." : "Delete Selected"}
						</button>
					</div>
				</form>
			</section>

			<section className="session-card">
				<div className="session-card__header">
					<div>
						<p className="auth-card__eyebrow">Response inspection</p>
						<h2>Current list payload</h2>
					</div>
				</div>

				{isLoadingList ? <p className="status-text">Loading applications...</p> : null}

				{!isLoadingList && hasLoadedList && applications.length === 0 ? (
					<p className="status-text">The API returned an empty list for this account.</p>
				) : null}

				{applications.length > 0 ? (
					<div className="application-list">
						{applications.map((application) => (
							<button
								key={application.id}
								type="button"
								className={
									application.id === activeApplicationId
										? "application-item application-item--active"
										: "application-item"
								}
								onClick={() => handleSelectApplication(application)}
									disabled={isActionLocked}
							>
								<strong>
									#{application.id} {application.companyName}
								</strong>
								<span>{application.jobTitle}</span>
								<span>{application.status}</span>
								<span>{application.updatedAt}</span>
							</button>
						))}
					</div>
				) : null}

				<div className="route-actions">
					<Link className="primary-button route-link" to="/dashboard">
						Back to Dashboard
					</Link>
				</div>
			</section>
		</main>
	);
}
