import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models/user.interface';

const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private currentUser = signal<User | null>(this.loadUser());

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly userId = computed(() => this.currentUser()?.id ?? null);

  setUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    this.currentUser.set(null);
    localStorage.removeItem(USER_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
