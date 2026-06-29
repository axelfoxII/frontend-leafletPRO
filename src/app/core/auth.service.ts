import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.interface';
import { AuthResponse } from '../models/auth-response.interface';
import { User } from '../models/user.interface';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly authState = inject(AuthStateService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.data) {
            this.tokenService.set(res.data.token);
            this.authState.setUser(res.data.user);
          }
        }),
      );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`);
  }

  refreshToken(): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.apiUrl}/refresh`, {});
  }

  logout(): void {
    this.tokenService.remove();
    this.authState.clear();
  }

  restoreSession(): void {
    if (!this.tokenService.has()) {
      return;
    }

    this.getProfile().subscribe({
      next: (res) => {
        if (res.data) this.authState.setUser(res.data);
      },
    });
  }
}
