import { Link } from "react-router-dom";
import { useAchievementsStore } from "../store/useAchievementsStore";

export default function AchievementsPage() {
	const achievements = useAchievementsStore((state) => state.achievements);
	const hasLoadedAchievements = useAchievementsStore((state) => state.hasLoadedAchievements);
	const isLoadingAchievements = useAchievementsStore((state) => state.isLoadingAchievements);
	const requestError = useAchievementsStore((state) => state.requestError);
	const statusMessage = useAchievementsStore((state) => state.statusMessage);
	const loadAchievements = useAchievementsStore((state) => state.loadAchievements);
	const resetStatus = useAchievementsStore((state) => state.resetStatus);
	const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;

	return (
		<main className="app-shell">
			<section className="app-hero">
				<p className="app-hero__eyebrow">Achievements</p>
				<h1>Temporary Achievements API sandbox</h1>
				<p className="app-hero__body">
					This page calls the real achievements list endpoint before the final gamification UI is designed.
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
								<dt>Endpoint state</dt>
								<dd>
									{isLoadingAchievements
										? "Loading"
										: hasLoadedAchievements
											? `${achievements.length} achievement(s)`
											: "Not requested yet"}
								</dd>
							</div>
							<div>
								<dt>Unlocked count</dt>
								<dd>{hasLoadedAchievements ? unlockedCount : "Unknown"}</dd>
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
								onClick={() => void loadAchievements().catch(() => undefined)}
								disabled={isLoadingAchievements}
							>
								{isLoadingAchievements ? "Loading..." : "Load /achievements"}
							</button>

							<button
								className="secondary-button"
								type="button"
								onClick={() => resetStatus()}
								disabled={isLoadingAchievements}
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
						<h2>Current achievements payload</h2>
					</div>
				</div>

				{!isLoadingAchievements && !hasLoadedAchievements ? (
					<p className="status-text">The achievements endpoint has not been requested yet.</p>
				) : null}

				{!isLoadingAchievements && hasLoadedAchievements && achievements.length === 0 ? (
					<p className="status-text">The API returned an empty achievements list.</p>
				) : null}

				{achievements.length > 0 ? (
					<div className="achievement-grid">
						{achievements.map((achievement) => (
							<article
								key={achievement.id}
								className={
									achievement.isUnlocked
										? "achievement-card achievement-card--unlocked"
										: "achievement-card"
								}
							>
								<div className="achievement-card__header">
									<div>
										<p className="auth-card__eyebrow">#{achievement.id}</p>
										<h3>{achievement.name}</h3>
									</div>
									<span
										className={
											achievement.isUnlocked
												? "status-pill status-pill--success"
												: "status-pill"
										}
									>
										{achievement.isUnlocked ? "Unlocked" : "Locked"}
									</span>
								</div>

								<p className="status-text">{achievement.description}</p>

								<dl className="compact-definition-list">
									<div><dt>ConditionType</dt><dd>{achievement.conditionType}</dd></div>
									<div><dt>TargetValue</dt><dd>{achievement.targetValue}</dd></div>
									<div><dt>Icon</dt><dd>{achievement.icon ?? "None"}</dd></div>
									<div><dt>UnlockedAt</dt><dd>{achievement.unlockedAt ?? "Not yet"}</dd></div>
								</dl>
							</article>
						))}
					</div>
				) : null}

				<div className="route-actions">
					<Link className="primary-button route-link" to="/dashboard">
						Back to Dashboard
					</Link>
					<Link className="secondary-button route-link" to="/progress">
						Go to Progress
					</Link>
				</div>
			</section>
		</main>
	);
}