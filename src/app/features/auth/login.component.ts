import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content w-full max-w-sm flex-col">
        <div class="text-center">
          <h1 class="text-3xl font-bold">LeafletPro</h1>
          <p class="text-base-content/60 py-2">Inicia sesión para continuar</p>
        </div>

        <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="card bg-base-100 w-full shadow-2xl">
          <div class="card-body">
            <fieldset class="fieldset">
              <label class="fieldset-label">Email</label>
              <input
                type="email"
                name="email"
                class="input w-full"
                placeholder="admin@leaflet.com"
                [(ngModel)]="email"
                required
                autocomplete="email"
              />
            </fieldset>

            <fieldset class="fieldset">
              <label class="fieldset-label">Contraseña</label>
              <input
                type="password"
                name="password"
                class="input w-full"
                placeholder="••••••••"
                [(ngModel)]="password"
                required
                autocomplete="current-password"
              />
            </fieldset>

            @if (error()) {
              <div class="alert alert-error text-sm">{{ error() }}</div>
            }

            <div class="form-control mt-4">
              <button type="submit" class="btn btn-primary" [disabled]="loading()">
                @if (loading()) {
                  <span class="loading loading-spinner"></span>
                }
                Iniciar Sesión
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.password()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
