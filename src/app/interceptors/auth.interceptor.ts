import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { TokenService } from '../core/token.service';
import { AuthStateService } from '../core/auth-state.service';
import { AuthService } from '../core/auth.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const token = tokenService.get();

  if (!token) {
    return next(req);
  }

  if (req.url.includes('/auth/refresh')) {
    return next(addToken(req, token));
  }

  return next(addToken(req, token)).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshSubject.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => next(addToken(req, newToken!))),
        );
      }

      isRefreshing = true;
      refreshSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((res) => {
          isRefreshing = false;
          const newToken = res.data!.token;
          tokenService.set(newToken);
          refreshSubject.next(newToken);
          return next(addToken(req, newToken));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          tokenService.remove();
          authState.clear();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
