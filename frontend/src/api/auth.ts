import { apiFetch } from './client';

export interface LoginResponse {
  partial_token: string;
  mfa_required: boolean;
  totp_uri?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function verifyMfa(partial_token: string, totp_code: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partial_token, totp_code }),
  });
}

// Authentication API methods for login, TOTP verification, and session refreshes
