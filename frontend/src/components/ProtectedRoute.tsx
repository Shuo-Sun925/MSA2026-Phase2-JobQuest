import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const {
    session,
    currentUser,
    isLoadingProfile,
    requestError,
    loadCurrentUser,
    logout,
  } = useAuthStore();

  useEffect(() => {
    if (session && !currentUser && !isLoadingProfile) {
      void loadCurrentUser().catch(() => undefined);
    }
  }, [currentUser, isLoadingProfile, loadCurrentUser, session]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingProfile && !currentUser) {
    return (
      <main className="app-shell">
        <section className="auth-card auth-card--centered">
          <p className="auth-card__eyebrow">Protected Route</p>
          <h2>Loading your session</h2>
          <p>Verifying the current user before rendering the page.</p>
        </section>
      </main>
    );
  }

  if (!currentUser && requestError) {
    return (
      <main className="app-shell">
        <section className="auth-card auth-card--centered">
          <p className="auth-card__eyebrow">Protected Route</p>
          <h2>Unable to load the current user</h2>
          <p className="auth-form__error">{requestError}</p>
          <div className="route-actions">
            <button className="primary-button" type="button" onClick={() => void loadCurrentUser()}>
              Retry
            </button>
            <button className="secondary-button" type="button" onClick={() => logout()}>
              Sign Out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}