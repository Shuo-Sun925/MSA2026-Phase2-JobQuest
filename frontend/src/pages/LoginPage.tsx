import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
	const [username, setUsername] = useState("alice");
	const [password, setPassword] = useState("password123");
	const navigate = useNavigate();
	const { session, login, isSubmitting, requestError, resetError } = useAuthStore();

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
		<main className="app-shell app-shell--auth">
			<section className="auth-card auth-card--large">
				<div className="auth-card__header">
					<p className="auth-card__eyebrow">JobQuest</p>
					<h2>Sign in</h2>
					<p>Access your dashboard and continue tracking your job search progress.</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label>
						<span>Username</span>
						<input
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							placeholder="Enter your username"
							autoComplete="username"
							required
						/>
					</label>

					<label>
						<span>Password</span>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="Enter your password"
							autoComplete="current-password"
							required
						/>
					</label>

					{requestError ? <p className="auth-form__error">{requestError}</p> : null}

					<button className="primary-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<p className="auth-card__footer">
					Need an account? <Link to="/register">Create one</Link>
				</p>
			</section>
		</main>
	);
}
