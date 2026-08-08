import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import consistentSeekerIcon from "../assets/consistent-seeker.png";
import firstApplicationIcon from "../assets/first-application.png";
import interviewUnlockedIcon from "../assets/interview-unlocked.png";
import jobHunterIcon from "../assets/job-hunter.png";
import logo from "../assets/logo.png";
import offerHunterIcon from "../assets/offer-hunter.png";
import { getLevelProgress } from "../helpers/levelProgress";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import { useAuthStore } from "../store/useAuthStore";
import { useAchievementsStore } from "../store/useAchievementsStore";
import { useJobApplicationsStore } from "../store/useJobApplicationsStore";
import { useProgressStore } from "../store/useProgressStore";

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

function PlusIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 5v14M5 12h14"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
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

function getInitials(name: string) {
	const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
	return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "JQ";
}

function getStatusTone(status: string) {
	switch (status) {
		case "Applied":
			return "dashboard-status-pill--applied";
		case "Interview":
			return "dashboard-status-pill--interview";
		case "Offer":
			return "dashboard-status-pill--offer";
		case "Rejected":
			return "dashboard-status-pill--rejected";
		default:
			return "dashboard-status-pill--neutral";
	}
}

function getAchievementAsset(name: string) {
	const normalizedName = name.trim().toLowerCase();

	switch (normalizedName) {
		case "first application":
			return firstApplicationIcon;
		case "job hunter":
			return jobHunterIcon;
		case "consistent seeker":
			return consistentSeekerIcon;
		case "interview unlocked":
			return interviewUnlockedIcon;
		case "offer hunter":
			return offerHunterIcon;
		default:
			return null;
	}
}

export default function DashboardPage() {
	const { currentUser, logout } = useAuthStore();
	const { theme, toggleTheme } = useDashboardTheme();
	const progress = useProgressStore((state) => state.progress);
	const summary = useProgressStore((state) => state.summary);
	const weeklyGoalProgress = useProgressStore((state) => state.weeklyGoalProgress);
	const loadProgress = useProgressStore((state) => state.loadProgress);
	const loadSummary = useProgressStore((state) => state.loadSummary);
	const loadWeeklyGoalProgress = useProgressStore((state) => state.loadWeeklyGoalProgress);
	const progressError = useProgressStore((state) => state.requestError);

	const achievements = useAchievementsStore((state) => state.achievements);
	const loadAchievements = useAchievementsStore((state) => state.loadAchievements);

	const applications = useJobApplicationsStore((state) => state.applications);
	const listApplications = useJobApplicationsStore((state) => state.listApplications);

	useEffect(() => {
		void loadProgress().catch(() => undefined);
		void loadSummary().catch(() => undefined);
		void loadWeeklyGoalProgress().catch(() => undefined);
		void loadAchievements().catch(() => undefined);
		void listApplications().catch(() => undefined);
	}, [
		listApplications,
		loadAchievements,
		loadProgress,
		loadSummary,
		loadWeeklyGoalProgress,
	]);

	const recentApplications = applications.slice(0, 3);
	const featuredAchievements = achievements.slice(0, 3);
	const safeWeeklyGoal = weeklyGoalProgress?.weeklyGoal ?? summary?.weeklyGoal ?? progress?.weeklyGoal ?? 5;
	const appliedThisWeek = weeklyGoalProgress?.appliedThisWeek ?? summary?.weeklyGoalProgress ?? 0;
	const weeklyProgressPercent = Math.min(100, Math.round((appliedThisWeek / Math.max(safeWeeklyGoal, 1)) * 100));
	const totalPoints = progress?.totalPoints ?? summary?.totalPoints ?? 0;
	const levelProgress = getLevelProgress(totalPoints);
	const currentLevel = levelProgress.currentLevel;
	const nextLevelTarget = levelProgress.nextLevelTarget;
	const levelProgressPercent = levelProgress.progressPercent;
	const xpToNextLevel = levelProgress.xpToNextLevel;
	const currentStreak = progress?.currentStreak ?? summary?.currentStreak ?? 0;
	const totalApplications = summary?.totalApplications ?? applications.length;
	const isNewUserEmptyState = totalApplications === 0;
	const displayName = currentUser?.username ? `${currentUser.username}!` : "there!";
	const dashboardShellClassName =
		theme === "dark" ? "dashboard-shell dashboard-shell--dark" : "dashboard-shell";

	return (
		<main className={dashboardShellClassName}>
			<aside className="dashboard-sidebar">
				<div className="dashboard-brand" aria-label="JobQuest">
					<img className="dashboard-brand__image" src={logo} alt="JobQuest" />
				</div>

				<nav className="dashboard-nav" aria-label="Dashboard navigation">
					<NavLink className="dashboard-nav__item dashboard-nav__item--active" to="/dashboard">
						<DashboardIcon />
						<span>Dashboard</span>
					</NavLink>
					<NavLink className="dashboard-nav__item" to="/applications">
						<ApplicationsIcon />
						<span>Applications</span>
					</NavLink>
					<NavLink className="dashboard-nav__item" to="/achievements">
						<AchievementIcon />
						<span>Achievements</span>
					</NavLink>
					<NavLink className="dashboard-nav__item" to="/progress">
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

			<section className="dashboard-main">
				{isNewUserEmptyState ? (
					<section className="dashboard-empty-hero" aria-label="Get started on JobQuest">
						<div className="dashboard-empty-hero__orbital" aria-hidden="true">
							<div className="dashboard-empty-hero__orbit" />
							<div className="dashboard-empty-hero__planet">
								<ApplicationsIcon />
							</div>
							<div className="dashboard-empty-hero__badge dashboard-empty-hero__badge--top">
								<PlusIcon />
							</div>
							<div className="dashboard-empty-hero__badge dashboard-empty-hero__badge--bottom">
								<AchievementIcon />
							</div>
						</div>

						<div className="dashboard-empty-hero__content">
							<p className="dashboard-empty-hero__eyebrow">Fresh start</p>
							<h2>
								Your next chapter <span>starts here.</span>
							</h2>
							<p>
								Add your first application to begin tracking progress, building streaks,
								and unlocking achievements across your job search.
							</p>
							<Link className="dashboard-empty-hero__button" to="/applications/new">
								<PlusIcon />
								<span>Add Your First Application</span>
							</Link>
						</div>

						<div className="dashboard-empty-hero__glance" aria-label="What you can do next">
							<article className="dashboard-empty-hero__glance-card">
								<strong>Track every application</strong>
								<span>Keep company, role, status, and notes in one place.</span>
							</article>
							<article className="dashboard-empty-hero__glance-card">
								<strong>See progress build up</strong>
								<span>Weekly goals and streaks start updating after your first entry.</span>
							</article>
							<article className="dashboard-empty-hero__glance-card">
								<strong>Unlock achievements</strong>
								<span>Milestones appear automatically as your search gains momentum.</span>
							</article>
						</div>

						{progressError ? <p className="dashboard-inline-error">{progressError}</p> : null}
					</section>
				) : (
					<>
						<header className="dashboard-header">
							<div>
								<p className="dashboard-header__eyebrow">System active</p>
								<h1>
									Welcome back, <span>{displayName}</span>
								</h1>
								<p>Ready to tackle your next career milestone? Let&apos;s get started.</p>
							</div>

							<Link className="dashboard-add-button" to="/applications/new">
								<PlusIcon />
								<span>Add application</span>
							</Link>
						</header>

						<section className="dashboard-kpi-grid" aria-label="Key metrics">
							<article className="dashboard-kpi dashboard-kpi--blue">
								<span>Total apps</span>
								<strong>{totalApplications}</strong>
							</article>
							<article className="dashboard-kpi dashboard-kpi--purple">
								<span>This week</span>
								<strong>{summary?.applicationsThisWeek ?? appliedThisWeek}</strong>
							</article>
							<article className="dashboard-kpi dashboard-kpi--cyan">
								<span>Interviews</span>
								<strong>{summary?.interviewCount ?? 0}</strong>
							</article>
							<article className="dashboard-kpi dashboard-kpi--violet">
								<span>Offers</span>
								<strong>{summary?.offerCount ?? 0}</strong>
							</article>
						</section>

						<section className="dashboard-content-grid">
							<div className="dashboard-content-grid__main">
								<article className="dashboard-level-card">
									<div className="dashboard-level-card__header">
										<div>
											<p>Current level</p>
											<h2>Level {currentLevel}</h2>
										</div>
										<div className="dashboard-level-card__meta">
											<strong>
												{nextLevelTarget === null ? `${totalPoints} XP total` : `${totalPoints} / ${nextLevelTarget} XP`}
											</strong>
											<span>
												{levelProgress.isMaxLevel
													? "Max level reached"
													: `${xpToNextLevel} XP to Level ${levelProgress.nextLevel}`}
											</span>
										</div>
									</div>
									<div className="dashboard-level-card__progress">
										<span style={{ width: `${levelProgressPercent}%` }} />
									</div>
								</article>

								<article className="dashboard-panel dashboard-panel--applications">
									<div className="dashboard-panel__header">
										<h3>Recent Applications</h3>
										<Link to="/applications">View all</Link>
									</div>

									{recentApplications.length ? (
										<ul className="dashboard-application-list">
											{recentApplications.map((application) => (
												<li key={application.id} className="dashboard-application-item">
													<div className="dashboard-application-item__avatar">
														{getInitials(application.companyName)}
													</div>
													<div className="dashboard-application-item__body">
														<div className="dashboard-application-item__topline">
															<strong>{application.companyName}</strong>
															<span
																className={`dashboard-status-pill ${getStatusTone(application.status)}`}
															>
																{application.status}
															</span>
														</div>
														<p>
															{application.jobTitle}
															<span> • </span>
															{application.appliedDate ? `Applied ${formatShortDate(application.appliedDate)}` : "Drafted recently"}
														</p>
													</div>
												</li>
											))}
										</ul>
									) : (
										<p className="dashboard-empty-state">
											No applications yet. Add your first application to start the streak.
										</p>
									)}
								</article>
							</div>

							<aside className="dashboard-content-grid__side">
								<article className="dashboard-panel dashboard-panel--goal">
									<div className="dashboard-panel__header dashboard-panel__header--stacked">
										<h3>Weekly Goal</h3>
										<p>Applications target</p>
									</div>
									<div
										className="dashboard-goal-ring"
										style={{
											background: `conic-gradient(#6fc2ff 0 ${weeklyProgressPercent}%, #dbe8ff ${weeklyProgressPercent}% 100%)`,
										}}
									>
										<div>
											<strong>
												{appliedThisWeek}/{safeWeeklyGoal}
											</strong>
											<span>Done</span>
										</div>
									</div>
								</article>

								<article className="dashboard-streak-card">
									<strong>{currentStreak} Day Streak</strong>
									<span>Unstoppable momentum</span>
								</article>

								<article className="dashboard-panel dashboard-panel--achievements">
									<div className="dashboard-panel__header dashboard-panel__header--stacked">
										<h3>Achievements</h3>
										<p>{featuredAchievements.filter((achievement) => achievement.isUnlocked).length} unlocked recently</p>
									</div>

									<div className="dashboard-achievement-grid">
										{featuredAchievements.length ? (
											featuredAchievements.map((achievement) => (
												<div key={achievement.id} className="dashboard-achievement-item">
													<div className="dashboard-achievement-item__icon">
														{getAchievementAsset(achievement.name) ? (
															<img
																className="dashboard-achievement-item__icon-image"
																src={getAchievementAsset(achievement.name) ?? undefined}
																alt={achievement.name}
															/>
														) : (
															achievement.name.slice(0, 2).toUpperCase()
														)}
													</div>
													<span>{achievement.name}</span>
												</div>
											))
										) : (
											<div className="dashboard-achievement-item dashboard-achievement-item--empty">
												<span>Keep applying to unlock your first badge.</span>
											</div>
										)}
									</div>

									<Link className="dashboard-panel__button" to="/achievements">
										View achievements
									</Link>
								</article>

								{progressError ? <p className="dashboard-inline-error">{progressError}</p> : null}
							</aside>
						</section>
					</>
				)}
			</section>
		</main>
	);
}
