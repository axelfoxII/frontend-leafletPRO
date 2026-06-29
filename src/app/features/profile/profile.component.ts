import { Component, inject } from '@angular/core';
import { AuthStateService } from '../../core/auth-state.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Mi Perfil</h1>
      <p class="text-base-content/60">Información de tu cuenta</p>
    </div>

    <div class="card bg-base-100 shadow-xl max-w-lg">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-6">
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-16">
              <span class="text-2xl">{{ authState.user()?.name?.charAt(0) }}</span>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ authState.user()?.name }}</h2>
            <span class="badge" [class.badge-primary]="authState.isAdmin()">
              {{ authState.role() }}
            </span>
          </div>
        </div>

        <dl class="space-y-4 text-sm">
          <div>
            <dt class="text-base-content/60">Email</dt>
            <dd class="font-medium">{{ authState.user()?.email }}</dd>
          </div>
          <div>
            <dt class="text-base-content/60">Rol</dt>
            <dd class="font-medium">{{ authState.role() }}</dd>
          </div>
          <div>
            <dt class="text-base-content/60">Estado</dt>
            <dd>
              @if (authState.user()?.isActive) {
                <span class="badge badge-success badge-outline">Activo</span>
              } @else {
                <span class="badge badge-error badge-outline">Inactivo</span>
              }
            </dd>
          </div>
        </dl>

        <div class="mt-6">
          <button (click)="logout()" class="btn btn-error">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  protected readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);

  protected logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
