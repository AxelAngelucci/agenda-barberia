// Gestión de sesión simple usando localStorage en el cliente
import { User } from './types';

export const SESSION_KEY = 'barberia_session';

export function saveSession(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession(): User | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}