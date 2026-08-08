import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import consistentSeekerIcon from "../assets/consistent-seeker.png";
import firstApplicationIcon from "../assets/first-application.png";
import interviewUnlockedIcon from "../assets/interview-unlocked.png";
import jobHunterIcon from "../assets/job-hunter.png";
import logo from "../assets/logo.png";
import offerHunterIcon from "../assets/offer-hunter.png";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import { useAuthStore } from "../store/useAuthStore";
import { useAchievementsStore } from "../store/useAchievementsStore";

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

function LockIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M8 10V8a4 4 0 0 1 8 0v2m-9 0h10v10H7z"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

function SparkIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z"
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

function formatAchievementDate(value: string | null) {
	if (!value) {
		return "Locked";
	}

	const parsedDate = Date.parse(value);

	if (Number.isNaN(parsedDate)) {
		return value;
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(parsedDate);
}

export default function AchievementsPage() {
	const { currentUser, logout } = useAuthStore();
	const { theme, toggleTheme } = useDashboardTheme();
	const achievements = useAchievementsStore((state) => state.achievements);
	const hasLoadedAchievements = useAchievementsStore((state) => state.hasLoadedAchievements);
	const isLoadingAchievements = useAchievementsStore((state) => state.isLoadingAchievements);
	const requestError = useAchievementsStore((state) => state.requestError);
	const loadAchievements = useAchievementsStore((state) => state.loadAchievements);
	const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;
	const lockedCount = Math.max(0, achievements.length - unlockedCount);
	const latestUnlockedAchievement = achievements.find((achievement) => achievement.isUnlocked) ?? null;
	const completionPercent = Math.min(
		100,
		Math.round((unlockedCount / Math.max(achievements.length, 1)) * 100),
	);
	const dashboardShellClassName =
		theme === "dark" ? "dashboard-shell dashboard-shell--dark" : "dashboard-shell";

	useEffect(() => {
		void loadAchievements().catch(() => undefined);
	}, [loadAchievements]);

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

			<section className="dashboard-main achievements-main">
				<section className="achievements-hero">
					<div className="achievements-hero__copy">
						<p className="achievements-hero__eyebrow">Growth journey</p>
						<h1>Career Milestones</h1>
						<p>
							Track your professional evolution. Every application, interview, and
							connection brings you closer to your next big leap.
						</p>
					</div>

					<div className="achievements-hero__summary">
						<div className="achievements-hero__summary-count">
							<strong>{unlockedCount}</strong>
							<span>/ {Math.max(achievements.length, 1)} unlocked</span>
						</div>
						<div className="achievements-hero__summary-bar">
							<span
								style={{
									width: `${completionPercent}%`,
								}}
							/>
						</div>
					</div>
				</section>

				{requestError ? <p className="dashboard-inline-error">{requestError}</p> : null}

				{isLoadingAchievements && !hasLoadedAchievements ? (
					<p className="dashboard-empty-state">Loading achievements...</p>
				) : achievements.length ? (
					<section className="achievements-layout">
						<div className="achievements-grid">
							{achievements.map((achievement) => {
								const achievementAsset = getAchievementAsset(achievement.name);
								const isHighlighted = latestUnlockedAchievement?.id === achievement.id;

								return (
									<article
										key={achievement.id}
										className={
											achievement.isUnlocked
												? isHighlighted
													? "achievement-showcase achievement-showcase--highlighted"
													: "achievement-showcase achievement-showcase--unlocked"
												: "achievement-showcase achievement-showcase--locked"
										}
									>
										<div className="achievement-showcase__badge">
											{achievement.isUnlocked ? (
												isHighlighted ? "New" : formatAchievementDate(achievement.unlockedAt)
											) : (
												<LockIcon />
											)}
										</div>

										<div className="achievement-showcase__icon-shell">
											<div className="achievement-showcase__icon-core">
												{achievementAsset ? (
													<img src={achievementAsset} alt={achievement.name} />
												) : (
													achievement.name.slice(0, 2).toUpperCase()
												)}
											</div>
										</div>

										<p className="achievement-showcase__meta">
											{achievement.isUnlocked ? formatAchievementDate(achievement.unlockedAt) : "Locked"}
										</p>
										<h3>{achievement.name}</h3>
										<p className="achievement-showcase__description">{achievement.description}</p>
									</article>
								);
							})}
						</div>

						<aside className="achievements-side-rail">
							<article className="achievement-collection-card">
								<div className="achievement-collection-card__header">
									<div>
										<p>Collection</p>
										<h2>{completionPercent}%</h2>
									</div>
									<SparkIcon />
								</div>
								<div className="achievement-collection-card__bar">
									<span style={{ width: `${completionPercent}%` }} />
								</div>
								<dl className="achievement-collection-card__stats">
									<div>
										<dt>Unlocked</dt>
										<dd>{unlockedCount}</dd>
									</div>
									<div>
										<dt>Locked</dt>
										<dd>{lockedCount}</dd>
									</div>
								</dl>
							</article>

							<article className="achievement-latest-card">
								<div className="achievement-latest-card__header">
									<div>
										<p>Latest unlock</p>
										<h3>{latestUnlockedAchievement?.name ?? "Keep going"}</h3>
									</div>
									<strong>
										{latestUnlockedAchievement
											? formatAchievementDate(latestUnlockedAchievement.unlockedAt)
											: "No unlocks yet"}
									</strong>
								</div>

								<p>
									{latestUnlockedAchievement?.description ?? "Your milestones will appear here as you build momentum across applications and interviews."}
								</p>
								<Link className="achievement-latest-card__link" to="/progress">
									View progress centre
								</Link>
							</article>
						</aside>
					</section>
				) : (
					<div className="achievements-empty-state">
						<h2>No milestones yet.</h2>
						<p>Add your first application to start unlocking achievements.</p>
						<Link className="applications-overview__add-button applications-overview__add-button--inline" to="/applications/new">
							Go to applications
						</Link>
					</div>
				)}
			</section>
		</main>
	);
}