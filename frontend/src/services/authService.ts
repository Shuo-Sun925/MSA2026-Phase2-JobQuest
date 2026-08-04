import api from "./api";
import type {
  AuthRequest,
  AuthResponse,
  AuthSession,
  CurrentUserResponse,
} from "../types/auth";

const SESSION_STORAGE_KEY = "auth_session";

function toSession(response: AuthResponse): AuthSession {
  return {
    userId: response.userId,
    username: response.username,
    token: response.token,
    expiresAt: response.expiresAt,
  };
}

export function isSessionExpired(expiresAt: string): boolean {
  const expiresAtValue = Date.parse(expiresAt);

  if (Number.isNaN(expiresAtValue)) {
    return true;
  }

  return expiresAtValue <= Date.now();
}

export function persistSession(session: AuthSession) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getStoredSession(): AuthSession | null {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as AuthSession;

    if (
      !parsedSession.token
      || !parsedSession.username
      || typeof parsedSession.userId !== "number"
      || isSessionExpired(parsedSession.expiresAt)
    ) {
      clearStoredSession();
      return null;
    }

    return parsedSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export async function register(request: AuthRequest): Promise<AuthSession> {
  const response = await api.post<AuthResponse>("/auth/register", {
    username: request.username,
    password: request.password,
  });

  const session = toSession(response.data);
  persistSession(session);
  return session;
}

export async function login(request: AuthRequest): Promise<AuthSession> {
  const response = await api.post<AuthResponse>("/auth/login", {
    username: request.username,
    password: request.password,
  });

  const session = toSession(response.data);
  persistSession(session);
  return session;
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>("/auth/me");
  return response.data;
}