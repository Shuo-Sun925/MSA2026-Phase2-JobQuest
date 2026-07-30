import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function RegisterPage() {
	const [username, setUsername] = useState("alice");
	const [password, setPassword] = useState("password123");
	const navigate = useNavigate();
	const { session, register, isSubmitting, requestError, resetError } = useAuthStore();

	useEffect(() => {
		if (session) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate, session]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		resetError();

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
		<main className="app-shell app-shell--auth">
			<section className="auth-card auth-card--large">
				<div className="auth-card__header">
					<p className="auth-card__eyebrow">JobQuest</p>
					<h2>Create an account</h2>
					<p>Register a new account to unlock your job application dashboard.</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label>
						<span>Username</span>
						<input
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							placeholder="At least 3 characters"
							autoComplete="username"
							minLength={3}
							required
						/>
					</label>

					<label>
						<span>Password</span>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="At least 8 characters"
							autoComplete="new-password"
							minLength={8}
							required
						/>
					</label>

					{requestError ? <p className="auth-form__error">{requestError}</p> : null}

					<button className="primary-button" type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating account..." : "Create Account"}
					</button>
				</form>

				<p className="auth-card__footer">
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</section>
		</main>
	);
}
