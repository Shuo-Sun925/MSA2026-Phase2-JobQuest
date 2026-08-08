import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AchievementsPage from "./pages/AchievementsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationsOverviewPage from "./pages/ApplicationsOverviewPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProgressPage from "./pages/ProgressPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./store/useAuthStore";

function RootRedirect() {
  const session = useAuthStore((state) => state.session);

  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/applications/new") {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function AppShell() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AppShell />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/applications"
          element={(
            <ProtectedRoute>
              <ApplicationsOverviewPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/applications/new"
          element={(
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/applications/:applicationId"
          element={(
            <ProtectedRoute>
              <ApplicationsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/progress"
          element={(
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/achievements"
          element={(
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<RootRedirect />} />
      </Route>
    </>,
  ),
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
