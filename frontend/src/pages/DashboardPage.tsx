import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function DashboardPage() {
	const { currentUser, session, statusMessage, logout } = useAuthStore();

	return (
		<main className="app-shell">
			<section className="app-hero">
				<p className="app-hero__eyebrow">Dashboard</p>
				<h1>Welcome back{currentUser ? `, ${currentUser.username}` : ""}</h1>
				<p className="app-hero__body">
					Your authentication flow is now routed through the real sign-in pages and protected routes.
				</p>
			</section>

			<section className="session-card">
				<div className="session-card__header">
					<div>
						<p className="auth-card__eyebrow">Session</p>
						<h2>Current account</h2>
					</div>

					<span className={session ? "status-pill status-pill--success" : "status-pill"}>
						{session ? "Authenticated" : "Signed Out"}
					</span>
				</div>

				<div className="session-card__content">
					<div className="session-panel">
						<h3>Profile</h3>
						<dl>
							<div>
								<dt>UserId</dt>
								<dd>{currentUser?.userId ?? session?.userId ?? "Unknown"}</dd>
							</div>
							<div>
								<dt>Username</dt>
								<dd>{currentUser?.username ?? session?.username ?? "Unknown"}</dd>
							</div>
							<div>
								<dt>CreatedAt</dt>
								<dd>{currentUser?.createdAt ?? "Loading..."}</dd>
							</div>
						</dl>
					</div>

					<div className="session-panel">
						<h3>Auth status</h3>
						<p>{statusMessage}</p>
					</div>
				</div>

				<div className="route-actions">
					<Link className="primary-button route-link" to="/applications">
						Go to Applications
					</Link>
					<Link className="secondary-button route-link" to="/progress">
						Go to Progress
					</Link>
					<Link className="secondary-button route-link" to="/achievements">
						Go to Achievements
					</Link>
					<button className="secondary-button" type="button" onClick={() => logout()}>
						Sign Out
					</button>
				</div>
			</section>
		</main>
	);
}
