import { useEffect, useState } from "react";

export type DashboardTheme = "light" | "dark";

const STORAGE_KEY = "jobquest-dashboard-theme";
const DEFAULT_THEME: DashboardTheme = "dark";

function isDashboardTheme(value: string | null): value is DashboardTheme {
	return value === "light" || value === "dark";
}

export function useDashboardTheme() {
	const [theme, setTheme] = useState<DashboardTheme>(() => {
		if (typeof window === "undefined") {
			return DEFAULT_THEME;
		}

		const storedTheme = window.localStorage.getItem(STORAGE_KEY);
		return isDashboardTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
	});

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, theme);
		document.body.dataset.dashboardTheme = theme;

		return () => {
			if (document.body.dataset.dashboardTheme === theme) {
				delete document.body.dataset.dashboardTheme;
			}
		};
	}, [theme]);

	function toggleTheme() {
		setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
	}

	return { theme, toggleTheme };
}