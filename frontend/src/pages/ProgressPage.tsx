import { Link } from "react-router-dom";
import { useProgressStore } from "../store/useProgressStore";

export default function ProgressPage() {
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
	const statusMessage = useProgressStore((state) => state.statusMessage);
	const loadProgress = useProgressStore((state) => state.loadProgress);
	const loadSummary = useProgressStore((state) => state.loadSummary);
	const loadWeeklyGoalProgress = useProgressStore((state) => state.loadWeeklyGoalProgress);
	const resetStatus = useProgressStore((state) => state.resetStatus);
	const isAnyLoading =
		isLoadingProgress || isLoadingSummary || isLoadingWeeklyGoalProgress;

	return (
		<main className="app-shell">
			<section className="app-hero">
				<p className="app-hero__eyebrow">Progress</p>
				<h1>Temporary Progress API sandbox</h1>
				<p className="app-hero__body">
					This page calls the three real read-only progress endpoints before any final dashboard UI is designed.
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
								<dt>Progress endpoint</dt>
								<dd>{isLoadingProgress ? "Loading" : hasLoadedProgress ? "Loaded" : "Not requested yet"}</dd>
							</div>
							<div>
								<dt>Summary endpoint</dt>
								<dd>{isLoadingSummary ? "Loading" : hasLoadedSummary ? "Loaded" : "Not requested yet"}</dd>
							</div>
							<div>
								<dt>Weekly goal endpoint</dt>
								<dd>
									{isLoadingWeeklyGoalProgress
										? "Loading"
										: hasLoadedWeeklyGoalProgress
											? "Loaded"
											: "Not requested yet"}
								</dd>
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
								onClick={() => void loadProgress().catch(() => undefined)}
								disabled={isAnyLoading}
							>
								{isLoadingProgress ? "Loading..." : "Load /progress"}
							</button>

							<button
								className="secondary-button"
								type="button"
								onClick={() => void loadSummary().catch(() => undefined)}
								disabled={isAnyLoading}
							>
								{isLoadingSummary ? "Loading..." : "Load /progress/summary"}
							</button>

							<button
								className="secondary-button"
								type="button"
								onClick={() => void loadWeeklyGoalProgress().catch(() => undefined)}
								disabled={isAnyLoading}
							>
								{isLoadingWeeklyGoalProgress
									? "Loading..."
									: "Load /progress/weekly-goal-progress"}
							</button>

							<button
								className="secondary-button"
								type="button"
								onClick={() => resetStatus()}
								disabled={isAnyLoading}
							>
								Reset Status Message
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="session-card">
				<div className="session-card__header">
					<div>
						<p className="auth-card__eyebrow">Response inspection</p>
						<h2>Returned progress payloads</h2>
					</div>
				</div>

				<div className="metric-grid">
					<div className="metric-panel">
						<h3>/progress</h3>
						{progress ? (
							<dl className="compact-definition-list">
								<div><dt>TotalPoints</dt><dd>{progress.totalPoints}</dd></div>
								<div><dt>CurrentLevel</dt><dd>{progress.currentLevel}</dd></div>
								<div><dt>CurrentStreak</dt><dd>{progress.currentStreak}</dd></div>
								<div><dt>LastActivityDate</dt><dd>{progress.lastActivityDate ?? "None"}</dd></div>
								<div><dt>WeeklyGoal</dt><dd>{progress.weeklyGoal}</dd></div>
							</dl>
						) : (
							<p className="status-text">No progress payload loaded yet.</p>
						)}
					</div>

					<div className="metric-panel">
						<h3>/progress/summary</h3>
						{summary ? (
							<dl className="compact-definition-list">
								<div><dt>TotalApplications</dt><dd>{summary.totalApplications}</dd></div>
								<div><dt>ApplicationsThisWeek</dt><dd>{summary.applicationsThisWeek}</dd></div>
								<div><dt>AppliedCount</dt><dd>{summary.appliedCount}</dd></div>
								<div><dt>InterviewCount</dt><dd>{summary.interviewCount}</dd></div>
								<div><dt>OfferCount</dt><dd>{summary.offerCount}</dd></div>
								<div><dt>WeeklyGoalProgress</dt><dd>{summary.weeklyGoalProgress}</dd></div>
								<div><dt>RemainingApplications</dt><dd>{summary.remainingApplications}</dd></div>
								<div><dt>IsGoalMet</dt><dd>{summary.isGoalMet ? "True" : "False"}</dd></div>
							</dl>
						) : (
							<p className="status-text">No summary payload loaded yet.</p>
						)}
					</div>

					<div className="metric-panel metric-panel--wide">
						<h3>/progress/weekly-goal-progress</h3>
						{weeklyGoalProgress ? (
							<dl className="compact-definition-list">
								<div><dt>WeeklyGoal</dt><dd>{weeklyGoalProgress.weeklyGoal}</dd></div>
								<div><dt>AppliedThisWeek</dt><dd>{weeklyGoalProgress.appliedThisWeek}</dd></div>
								<div><dt>RemainingApplications</dt><dd>{weeklyGoalProgress.remainingApplications}</dd></div>
								<div><dt>IsGoalMet</dt><dd>{weeklyGoalProgress.isGoalMet ? "True" : "False"}</dd></div>
								<div><dt>WeekStartDate</dt><dd>{weeklyGoalProgress.weekStartDate}</dd></div>
								<div><dt>WeekEndDate</dt><dd>{weeklyGoalProgress.weekEndDate}</dd></div>
							</dl>
						) : (
							<p className="status-text">No weekly goal payload loaded yet.</p>
						)}
					</div>
				</div>

				<div className="route-actions">
					<Link className="primary-button route-link" to="/dashboard">
						Back to Dashboard
					</Link>
					<Link className="secondary-button route-link" to="/applications">
						Go to Applications
					</Link>
					<Link className="secondary-button route-link" to="/achievements">
						Go to Achievements
					</Link>
				</div>
			</section>
		</main>
	);
}