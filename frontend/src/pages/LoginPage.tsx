import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import loginHero from "../assets/login-hero.png";
import logo from "../assets/logo.png";
import { useAuthStore } from "../store/useAuthStore";

function UserIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
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
				d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm4 4v2"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { theme, toggleTheme } = useDashboardTheme();
	const { session, login, isSubmitting, requestError, resetError } = useAuthStore();
	const authShellClassName =
		theme === "dark" ? "app-shell app-shell--auth app-shell--auth-dark" : "app-shell app-shell--auth";
	const authLayoutClassName =
		theme === "dark" ? "auth-layout auth-layout--login auth-layout--dark" : "auth-layout auth-layout--login";

	useEffect(() => {
		if (session) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate, session]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		resetError();

		try {
			await login({
				username: username.trim(),
				password,
			});
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<main className={authShellClassName}>
			<section className={authLayoutClassName}>
				<button
					className="auth-theme-toggle"
					type="button"
					onClick={toggleTheme}
					aria-pressed={theme === "dark"}
				>
					{theme === "dark" ? "Light mode" : "Dark mode"}
				</button>

				<div className="auth-layout__visual auth-layout__visual--login">
					<div className="auth-login-badge" aria-label="JobQuest">
						<img className="auth-logo-image" src={logo} alt="JobQuest" />
					</div>

					<div className="auth-login-preview" aria-hidden="true">
						<img src={loginHero} alt="Career progress dashboard illustration" />
					</div>

					<div className="auth-copy auth-copy--login">
						<p className="auth-copy__eyebrow">YOUR CAREER CATALYST</p>
						<h1>
							Track applications.
							<span> Build momentum.</span>
							<br />
							Level up.
						</h1>
						<p className="auth-copy__vertical">PROFESSIONAL GROWTH PLATFORM</p>
					</div>
				</div>

				<section className="auth-layout__panel auth-layout__panel--login">
					<div className="auth-panel__corner" aria-hidden="true">◔</div>
					<div className="auth-panel__content">
						<header className="auth-panel__header">
							<h2>Welcome Back</h2>
							<p>Continue your journey to the next level.</p>
						</header>

						<form className="auth-form auth-form--mockup" onSubmit={handleSubmit}>
							<label className="auth-field">
								<span>Username</span>
								<div className="auth-field__control">
									<div className="auth-field__icon">
										<UserIcon />
									</div>
									<input
										value={username}
										onChange={(event) => setUsername(event.target.value)}
										placeholder="Enter your username"
										autoComplete="username"
										required
									/>
								</div>
							</label>

							<label className="auth-field">
								<span>Password</span>
								<div className="auth-field__control">
									<div className="auth-field__icon">
										<LockIcon />
									</div>
									<input
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										placeholder="Enter your password"
										autoComplete="current-password"
										required
									/>
								</div>
							</label>

							{requestError ? <p className="auth-form__error">{requestError}</p> : null}

							<button
								className="primary-button auth-submit-button"
								type="submit"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Signing in..." : "Log In →"}
							</button>
						</form>

						<div className="auth-panel__footer auth-panel__footer--split">
							<span>New to JobQuest?</span>
							<Link to="/register">Create an account</Link>
						</div>
					</div>
				</section>
			</section>
		</main>
	);
}
