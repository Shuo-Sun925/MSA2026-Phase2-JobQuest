export interface AuthRequest {
	username: string;
	password: string;
}

export interface AuthResponse {
	userId: number;
	username: string;
	token: string;
	expiresAt: string;
}

export interface CurrentUserResponse {
	userId: number;
	username: string;
	createdAt: string;
}

export interface AuthSession {
	userId: number;
	username: string;
	token: string;
	expiresAt: string;
}
