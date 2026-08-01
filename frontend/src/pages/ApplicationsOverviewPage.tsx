import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuthStore } from "../store/useAuthStore";
import { useJobApplicationsStore } from "../store/useJobApplicationsStore";
import type { JobApplicationResponse, JobApplicationStatus } from "../types/jobApplication";

type ApplicationFilter = "All" | JobApplicationStatus;

const APPLICATION_FILTERS: ApplicationFilter[] = [
	"All",
	"Saved",
	"Applied",
	"OnlineAssessment",
	"Interview",
	"Offer",
	"Rejected",
	"Withdrawn",
];

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

function PlusIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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

function FollowUpIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 7v5l3 2m5-2a8 8 0 1 1-2.3-5.6M16 4h4v4"
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

function getStatusLabel(status: JobApplicationStatus) {
	if (status === "OnlineAssessment") {
		return "Online Assessment";
	}

	return status;
}

function formatTimelineLabel(application: JobApplicationResponse) {
	const dateValue = application.appliedDate ?? application.updatedAt;
	const parsed = Date.parse(dateValue);

	if (Number.isNaN(parsed)) {
		return application.appliedDate ? "Applied recently" : "Updated recently";
	}

	const formatted = new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
	}).format(parsed);

	return application.appliedDate ? `Applied ${formatted}` : `Updated ${formatted}`;
}

function getFollowUpLabel(application: JobApplicationResponse) {
	if (!application.nextFollowUpDate) {
		return "No follow-up date";
	}

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const followUpDate = new Date(application.nextFollowUpDate);
	const normalizedFollowUp = new Date(
		followUpDate.getFullYear(),
		followUpDate.getMonth(),
		followUpDate.getDate(),
	);
	const diffDays = Math.round((normalizedFollowUp.getTime() - today.getTime()) / 86400000);

	if (diffDays < 0) {
		return "Follow-up overdue";
	}

	if (diffDays === 0) {
		return "Follow-up today";
	}

	const formatted = new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
	}).format(normalizedFollowUp);

	return `Follow-up ${formatted}`;
}

function getFollowUpTone(application: JobApplicationResponse) {
	if (!application.nextFollowUpDate) {
		return "applications-overview-card__meta-item--muted";
	}

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const followUpDate = new Date(application.nextFollowUpDate);
	const normalizedFollowUp = new Date(
		followUpDate.getFullYear(),
		followUpDate.getMonth(),
		followUpDate.getDate(),
	);

	if (normalizedFollowUp.getTime() < today.getTime()) {
		return "applications-overview-card__meta-item--danger";
	}

	if (normalizedFollowUp.getTime() === today.getTime()) {
		return "applications-overview-card__meta-item--accent";
	}

	return "applications-overview-card__meta-item--neutral";
}

function getStatusTone(status: JobApplicationStatus) {
	switch (status) {
		case "Applied":
			return "applications-overview-card__pill applications-overview-card__pill--applied";
		case "Interview":
			return "applications-overview-card__pill applications-overview-card__pill--interview";
		case "Offer":
			return "applications-overview-card__pill applications-overview-card__pill--offer";
		case "Rejected":
			return "applications-overview-card__pill applications-overview-card__pill--rejected";
		case "OnlineAssessment":
			return "applications-overview-card__pill applications-overview-card__pill--assessment";
		default:
			return "applications-overview-card__pill applications-overview-card__pill--saved";
	}
}

function getApplicationLogoMark(application: JobApplicationResponse) {
	const initials = application.companyName
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.join("");

	return initials || "JQ";
}

export default function ApplicationsOverviewPage() {
	const { currentUser, logout } = useAuthStore();
	const applications = useJobApplicationsStore((state) => state.applications);
	const hasLoadedList = useJobApplicationsStore((state) => state.hasLoadedList);
	const isLoadingList = useJobApplicationsStore((state) => state.isLoadingList);
	const listApplications = useJobApplicationsStore((state) => state.listApplications);
	const clearSelection = useJobApplicationsStore((state) => state.clearSelection);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<ApplicationFilter>("All");

	useEffect(() => {
		clearSelection();

		if (hasLoadedList || isLoadingList) {
			return;
		}

		void listApplications().catch(() => undefined);
	}, [clearSelection, hasLoadedList, isLoadingList, listApplications]);

	const visibleApplications = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		return applications.filter((application) => {
			const matchesFilter = activeFilter === "All" || application.status === activeFilter;
			const matchesQuery = !normalizedQuery || [
				application.companyName,
				application.jobTitle,
				application.location ?? "",
			].some((value) => value.toLowerCase().includes(normalizedQuery));

			return matchesFilter && matchesQuery;
		});
	}, [activeFilter, applications, searchQuery]);

	return (
		<main className="dashboard-shell">
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

				<button className="dashboard-logout" type="button" onClick={() => logout()}>
					<LogoutIcon />
					<span>Logout</span>
				</button>
			</aside>

			<section className="workspace-main">
				<header className="workspace-topbar">
					<label className="workspace-search" aria-label="Search jobs or tasks">
						<SearchIcon />
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search by company, role, or location..."
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

				<section className="applications-overview">
					<header className="applications-overview__header">
						<div className="applications-overview__copy">
							<p className="applications-overview__eyebrow">Tracking progress</p>
							<h1>My Applications</h1>
						</div>

						<Link className="applications-overview__add-button" to="/applications/new">
							<PlusIcon />
							<span>Add Application</span>
						</Link>
					</header>

					<div className="applications-overview__filters" aria-label="Application filters">
						{APPLICATION_FILTERS.map((filter) => (
							<button
								key={filter}
								type="button"
								className={
									filter === activeFilter
										? "applications-overview__filter applications-overview__filter--active"
										: "applications-overview__filter"
								}
								onClick={() => setActiveFilter(filter)}
							>
								{getStatusLabel(filter === "All" ? "Saved" : filter) === "Saved" && filter === "All"
									? "All"
									: getStatusLabel(filter as JobApplicationStatus)}
							</button>
						))}
					</div>

					{!hasLoadedList && isLoadingList ? (
						<p className="dashboard-empty-state">Loading your applications...</p>
					) : visibleApplications.length ? (
						<div className="applications-overview__grid">
							{visibleApplications.map((application) => (
								<Link key={application.id} className="applications-overview-card" to={`/applications/${application.id}`}>
									<div className="applications-overview-card__topline">
										<div className="applications-overview-card__logo">{getApplicationLogoMark(application)}</div>
										<div className="applications-overview-card__title-group">
											<div className="applications-overview-card__meta-row">
												<span className={getStatusTone(application.status)}>{getStatusLabel(application.status)}</span>
												<span className="applications-overview-card__date">{formatTimelineLabel(application)}</span>
											</div>
											<strong>{application.jobTitle}</strong>
											<p>{application.companyName}</p>
										</div>
									</div>

									<div className="applications-overview-card__footer">
										<div className="applications-overview-card__meta-item">
											<LocationIcon />
											<span>{application.location ?? "Remote or unspecified"}</span>
										</div>
										<div className={`applications-overview-card__meta-item ${getFollowUpTone(application)}`}>
											<FollowUpIcon />
											<span>{getFollowUpLabel(application)}</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="applications-overview__empty">
							<h2>No applications match this view yet.</h2>
							<p>Start a new application entry or change the search and status filters.</p>
							<Link className="applications-overview__add-button applications-overview__add-button--inline" to="/applications/new">
								<PlusIcon />
								<span>Add Application</span>
							</Link>
						</div>
					)}
				</section>
			</section>
		</main>
	);
}