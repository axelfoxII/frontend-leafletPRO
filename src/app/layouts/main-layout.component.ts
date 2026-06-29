import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../core/auth-state.service';
import { TokenService } from '../core/token.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="drawer lg:drawer-open">
      <input
        id="drawer"
        type="checkbox"
        class="drawer-toggle"
        [checked]="drawerOpen()"
        (change)="drawerOpen.set(!drawerOpen())"
      />

      <div class="drawer-content flex flex-col">
        <nav class="navbar bg-base-100 border-b border-base-200 lg:hidden">
          <div class="flex-none">
            <label for="drawer" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <a class="text-xl font-bold" routerLink="/dashboard">LeafletPro</a>
          </div>
          <div class="flex-none gap-2">
            <span class="text-sm">{{ authState.user()?.name }}</span>
          </div>
        </nav>

        <main class="p-6">
          <router-outlet />
        </main>
      </div>

      <div class="drawer-side z-40">
        <label for="drawer" class="drawer-overlay"></label>
        <aside class="menu bg-base-200 text-base-content min-h-full w-64 p-4">
          <a class="text-xl font-bold mb-6 px-4" routerLink="/dashboard">LeafletPro</a>

          <ul class="menu menu-sm gap-1">
            <li class="menu-title">
              <span>General</span>
            </li>
            <li>
              <a routerLink="/dashboard" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/places" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mis Lugares
              </a>
            </li>

            @if (authState.isAdmin()) {
              <li class="menu-title mt-4">
                <span>Administración</span>
              </li>
              <li>
                <a routerLink="/admin/users" routerLinkActive="active">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Usuarios
                </a>
              </li>
            }

            <li class="menu-title mt-4">
              <span>Cuenta</span>
            </li>
            <li>
              <a routerLink="/profile" routerLinkActive="active">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </a>
            </li>
            <li>
              <a (click)="logout()" class="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
    :host .active {
      background-color: oklch(var(--p));
      color: oklch(var(--pc));
      border-radius: var(--rounded-box, 1rem);
    }
    `,
  ],
})
export class MainLayoutComponent {
  protected readonly drawerOpen = signal(false);
  protected readonly authState = inject(AuthStateService);

  constructor(
    private readonly tokenService: TokenService,
  ) {}

  protected logout(): void {
    this.tokenService.remove();
    this.authState.clear();
    window.location.href = '/login';
  }
}
