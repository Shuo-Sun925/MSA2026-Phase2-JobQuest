import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import { useAuthStore } from "../store/useAuthStore";
import { useProgressStore } from "../store/useProgressStore";

const WEEKLY_GOAL_OPTIONS = [3, 5, 7, 10] as const;

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

function FlameIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M13 3s1 2.5-1 5.5c-1.3 1.9 1 2.9 1 2.9s.4-1.6 2.2-2.7C17.8 7 18 4 18 4s3 3 3 8a9 9 0 1 1-18 0c0-3.8 2.2-6.5 4.1-8.3.4 2.4 2.2 3.7 2.2 3.7s-.2-2.4 1.6-4.4Z"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function TargetIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M6 4v16"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
			<path
				d="M6 6 16 9 6 12Z"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function CalendarIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M7 3v3m10-3v3M5 8h14M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z"
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

function formatDateLabel(value: string | null) {
	if (!value) {
		return "No activity yet";
	}

	const parsedDate = Date.parse(value);

	if (Number.isNaN(parsedDate)) {
		return value;
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(parsedDate);
}

export default function ProgressPage() {
	const { currentUser, logout } = useAuthStore();
	const { theme, toggleTheme } = useDashboardTheme();
	const progress = useProgressStore((state) => state.progress);
	const summary = useProgressStore((state) => state.summary);
	const weeklyGoalProgress = useProgressStore((state) => state.weeklyGoalProgress);
	const hasLoadedProgress = useProgressStore((state) => state.hasLoadedProgress);
	const hasLoadedSummary = useProgressStore((state) => state.hasLoadedSummary);
	const hasLoadedWeeklyGoalProgress = useProgressStore(
		(state) => state.hasLoadedWeeklyGoalProgress,
	);
	const isLoadingProgress = useProgressStore((state) => state.isLoadingProgress);
	const isLoadingSummary = useProgressStore((state) => state.isLoadingSummary);
	const isLoadingWeeklyGoalProgress = useProgressStore(
		(state) => state.isLoadingWeeklyGoalProgress,
	);
	const requestError = useProgressStore((state) => state.requestError);
	const isUpdatingWeeklyGoal = useProgressStore((state) => state.isUpdatingWeeklyGoal);
	const weeklyGoalUpdateError = useProgressStore((state) => state.weeklyGoalUpdateError);
	const weeklyGoalUpdateSuccess = useProgressStore((state) => state.weeklyGoalUpdateSuccess);
	const loadProgress = useProgressStore((state) => state.loadProgress);
	const loadSummary = useProgressStore((state) => state.loadSummary);
	const loadWeeklyGoalProgress = useProgressStore((state) => state.loadWeeklyGoalProgress);
	const updateWeeklyGoal = useProgressStore((state) => state.updateWeeklyGoal);
	const clearWeeklyGoalUpdateState = useProgressStore((state) => state.clearWeeklyGoalUpdateState);
	const isAnyLoading =
		isLoadingProgress || isLoadingSummary || isLoadingWeeklyGoalProgress;
	const totalPoints = progress?.totalPoints ?? summary?.totalPoints ?? 0;
	const currentLevel = progress?.currentLevel ?? summary?.currentLevel ?? 1;
	const currentStreak = progress?.currentStreak ?? summary?.currentStreak ?? 0;
	const weeklyGoal = weeklyGoalProgress?.weeklyGoal ?? summary?.weeklyGoal ?? progress?.weeklyGoal ?? 5;
	const [pendingWeeklyGoal, setPendingWeeklyGoal] = useState<number | null>(null);
	const selectedWeeklyGoal = pendingWeeklyGoal ?? weeklyGoal;
	const appliedThisWeek = weeklyGoalProgress?.appliedThisWeek ?? summary?.weeklyGoalProgress ?? 0;
	const remainingApplications = weeklyGoalProgress?.remainingApplications ?? summary?.remainingApplications ?? Math.max(weeklyGoal - appliedThisWeek, 0);
	const isGoalMet = weeklyGoalProgress?.isGoalMet ?? summary?.isGoalMet ?? false;
	const totalApplications = summary?.totalApplications ?? 0;
	const appliedCount = summary?.appliedCount ?? 0;
	const interviewCount = summary?.interviewCount ?? 0;
	const offerCount = summary?.offerCount ?? 0;
	const rejectedCount = summary?.rejectedCount ?? 0;
	const savedCount = summary?.savedCount ?? 0;
	const lastActivityDate = progress?.lastActivityDate ?? summary?.lastActivityDate ?? null;
	const nextLevelTarget = Math.max((currentLevel + 1) * 250, 250);
	const levelProgressPercent = Math.min(100, Math.round((totalPoints / nextLevelTarget) * 100));
	const weeklyProgressPercent = Math.min(100, Math.round((appliedThisWeek / Math.max(weeklyGoal, 1)) * 100));
	const isReady = hasLoadedProgress || hasLoadedSummary || hasLoadedWeeklyGoalProgress;
	const weeklyGoalCompletionText = `${appliedThisWeek} of ${weeklyGoal} applications completed`;
	const isSaveDisabled = isUpdatingWeeklyGoal || pendingWeeklyGoal === null || selectedWeeklyGoal === weeklyGoal;
	const dashboardShellClassName =
		theme === "dark" ? "dashboard-shell dashboard-shell--dark" : "dashboard-shell";

	useEffect(() => {
		if (!hasLoadedProgress) {
			void loadProgress().catch(() => undefined);
		}

		if (!hasLoadedSummary) {
			void loadSummary().catch(() => undefined);
		}

		if (!hasLoadedWeeklyGoalProgress) {
			void loadWeeklyGoalProgress().catch(() => undefined);
		}
	}, [
		hasLoadedProgress,
		hasLoadedSummary,
		hasLoadedWeeklyGoalProgress,
		loadProgress,
		loadSummary,
		loadWeeklyGoalProgress,
	]);

	async function handleSaveWeeklyGoal() {
		try {
			await updateWeeklyGoal(selectedWeeklyGoal);
			setPendingWeeklyGoal(null);
		} catch {
			return;
		}
	}

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

					<div className="dashboard-sidebar__session">
						<div className="dashboard-sidebar__account" aria-label="Signed in user">
							<span className="dashboard-sidebar__account-label">Signed in</span>
							<strong className="dashboard-sidebar__account-value">
								{currentUser?.username ?? "JobQuest User"}
							</strong>
						</div>

						<button className="dashboard-logout" type="button" onClick={() => logout()}>
							<LogoutIcon />
							<span>Logout</span>
						</button>
					</div>
				</div>
			</aside>

			<section className="dashboard-main progress-main">
				<section className="progress-hero">
					<div className="progress-hero__copy">
						<p className="progress-hero__eyebrow">Performance overview</p>
						<h1>Progress Centre</h1>
						<p>
							This is where your streak, level growth, weekly cadence, and pipeline
							movement live together.
						</p>
					</div>

					<div className="progress-hero__summary">
						<strong>{weeklyProgressPercent}%</strong>
						<span>This week</span>
					</div>
				</section>

				{requestError ? <p className="dashboard-inline-error">{requestError}</p> : null}

				{!isReady && isAnyLoading ? (
					<p className="dashboard-empty-state">Loading progress...</p>
				) : (
					<>
						<section className="dashboard-kpi-grid progress-kpi-grid">
							<article className="dashboard-kpi dashboard-kpi--cyan">
								<span>Total XP</span>
								<strong>{totalPoints}</strong>
							</article>
							<article className="dashboard-kpi dashboard-kpi--violet">
								<span>Current Level</span>
								<strong>Level {currentLevel}</strong>
							</article>
							<article className="dashboard-kpi dashboard-kpi--purple">
								<span>Weekly Goal</span>
								<strong>{appliedThisWeek} / {weeklyGoal}</strong>
							</article>
							<article className="dashboard-kpi">
								<span>Applications Tracked</span>
								<strong>{totalApplications}</strong>
							</article>
						</section>

						<section className="progress-layout">
							<div className="progress-layout__main">
								<article className="dashboard-level-card">
									<div className="dashboard-level-card__header">
										<div>
											<p>Level trajectory</p>
											<h2>{currentLevel}</h2>
										</div>
										<div className="dashboard-level-card__meta">
											<span>Next level</span>
											<strong>{Math.max(nextLevelTarget - totalPoints, 0)} XP to go</strong>
										</div>
									</div>

									<div className="dashboard-level-card__progress">
										<span style={{ width: `${levelProgressPercent}%` }} />
									</div>
								</article>

								<article className="progress-panel">
									<div className="progress-panel__header">
										<div>
											<p>Weekly target</p>
											<h2>{isGoalMet ? "Goal reached" : `${remainingApplications} to go`}</h2>
										</div>
										<TargetIcon />
									</div>

									<div className="progress-panel__bar">
										<span style={{ width: `${weeklyProgressPercent}%` }} />
									</div>

									<div className="progress-panel__summary-row">
										<strong>{weeklyGoalCompletionText}</strong>
										<span>{weeklyGoal} target</span>
									</div>

									<div className="progress-goal-editor">
										<div className="progress-goal-editor__header">
											<span>Current weekly goal</span>
											<strong>{weeklyGoal} applications</strong>
										</div>

										<div className="progress-goal-editor__options" role="group" aria-label="Weekly goal options">
											{WEEKLY_GOAL_OPTIONS.map((goalOption) => (
												<button
													key={goalOption}
													className={
														goalOption === selectedWeeklyGoal
															? "progress-goal-editor__option progress-goal-editor__option--selected"
															: "progress-goal-editor__option"
													}
													type="button"
													onClick={() => {
														clearWeeklyGoalUpdateState();
														setPendingWeeklyGoal(goalOption);
													}}
													disabled={isUpdatingWeeklyGoal}
												>
													{goalOption}
												</button>
											))}
										</div>

										<button
											className="progress-goal-editor__save"
											type="button"
											onClick={() => void handleSaveWeeklyGoal()}
											disabled={isSaveDisabled}
										>
											{isUpdatingWeeklyGoal ? "Saving..." : "Save goal"}
										</button>

										{weeklyGoalUpdateSuccess ? (
											<p className="progress-goal-editor__success">{weeklyGoalUpdateSuccess}</p>
										) : null}

										{weeklyGoalUpdateError ? (
											<p className="progress-goal-editor__error">{weeklyGoalUpdateError}</p>
										) : null}
									</div>
									{weeklyGoalProgress ? (
										<p className="progress-panel__caption">
											Window: {formatDateLabel(weeklyGoalProgress.weekStartDate)} to {formatDateLabel(weeklyGoalProgress.weekEndDate)}
										</p>
									) : null}
								</article>

								<article className="progress-panel">
									<div className="progress-panel__header">
										<div>
											<p>Pipeline breakdown</p>
											<h2>Where your applications stand</h2>
										</div>
										<CalendarIcon />
									</div>

									<div className="progress-stage-grid">
										<div className="progress-stage-card">
											<span>Saved</span>
											<strong>{savedCount}</strong>
										</div>
										<div className="progress-stage-card">
											<span>Applied</span>
											<strong>{appliedCount}</strong>
										</div>
										<div className="progress-stage-card">
											<span>Interviews</span>
											<strong>{interviewCount}</strong>
										</div>
										<div className="progress-stage-card">
											<span>Offers</span>
											<strong>{offerCount}</strong>
										</div>
										<div className="progress-stage-card">
											<span>Rejected</span>
											<strong>{rejectedCount}</strong>
										</div>
									</div>
								</article>
							</div>

							<aside className="progress-layout__side">
								<article className="progress-streak-card">
									<div className="progress-streak-card__header">
										<div>
											<p>Consistency</p>
											<h2>{String(currentStreak).padStart(2, "0")}</h2>
										</div>
										<FlameIcon />
									</div>
									<strong>{currentStreak} day streak</strong>
									<span>
										Consistency compounds. Keep applying to protect your streak and keep
										your momentum alive.
									</span>
								</article>

								<article className="progress-insight-card">
									<p>Last activity</p>
									<h3>{formatDateLabel(lastActivityDate)}</h3>
									<span>
										{isGoalMet
											? "You hit this week's target. Keep the streak going."
											: `${remainingApplications} more application${remainingApplications === 1 ? "" : "s"} to hit your weekly goal.`}
									</span>
									<Link className="progress-insight-card__link" to="/achievements">
										See achievements
									</Link>
								</article>
							</aside>
						</section>
					</>
				)}
			</section>
		</main>
	);
}