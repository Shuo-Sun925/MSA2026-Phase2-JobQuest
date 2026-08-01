import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import registerHero from "../assets/register-hero.png";
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

function ShieldIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 3 6 5.5V11c0 4.12 2.52 7.96 6 10 3.48-2.04 6-5.88 6-10V5.5Z"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
			<path
				d="M9.5 11.8 11.2 13.5 14.8 9.9"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.8"
			/>
		</svg>
	);
	}

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState("");
	const navigate = useNavigate();
	const { theme, toggleTheme } = useDashboardTheme();
	const { session, register, isSubmitting, requestError, resetError } = useAuthStore();
	const authShellClassName =
		theme === "dark" ? "app-shell app-shell--auth app-shell--auth-dark" : "app-shell app-shell--auth";
	const authLayoutClassName =
		theme === "dark" ? "auth-layout auth-layout--register auth-layout--dark" : "auth-layout auth-layout--register";

	useEffect(() => {
		if (session) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate, session]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		resetError();
		setFormError("");

		if (password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}

		try {
			await register({
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

				<div className="auth-layout__visual auth-layout__visual--register">
					<div className="auth-register-brand" aria-label="JobQuest">
						<img className="auth-logo-image auth-logo-image--light" src={logo} alt="JobQuest" />
					</div>

					<div className="auth-copy auth-copy--register">
						<h1>Gamify your job search.</h1>
						<p>
							Track applications effortlessly, build daily application streaks, and unlock
							 achievements as you level up your career journey.
						</p>
					</div>

					<div className="auth-register-preview" aria-hidden="true">
						<img src={registerHero} alt="City tower illustration" />
					</div>
				</div>

				<section className="auth-layout__panel auth-layout__panel--register">
					<div className="auth-panel__content auth-panel__content--register">
						<div className="auth-panel__sun" aria-hidden="true">☼</div>
						<div className="auth-register-card">
							<header className="auth-panel__header auth-panel__header--compact">
								<h2>Create Account</h2>
								<p>Start tracking and building your streak.</p>
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
											placeholder="e.g. alex_growth"
											autoComplete="username"
											minLength={3}
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
											placeholder="At least 8 characters"
											autoComplete="new-password"
											minLength={8}
											required
										/>
									</div>
								</label>

								<label className="auth-field">
									<span>Confirm Password</span>
									<div className="auth-field__control">
										<div className="auth-field__icon">
											<ShieldIcon />
										</div>
										<input
											type="password"
											value={confirmPassword}
											onChange={(event) => setConfirmPassword(event.target.value)}
											placeholder="Repeat your password"
											autoComplete="new-password"
											required
										/>
									</div>
								</label>

								{formError ? <p className="auth-form__error">{formError}</p> : null}
								{requestError ? <p className="auth-form__error">{requestError}</p> : null}

								<button
									className="primary-button auth-submit-button auth-submit-button--register"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Creating account..." : "Create Account"}
								</button>
							</form>

							<div className="auth-panel__footer auth-panel__footer--centered">
								<Link to="/login">← Back to Login</Link>
							</div>
						</div>

						<p className="auth-panel__copyright">© 2024</p>
					</div>
				</section>
			</section>
		</main>
	);
}
