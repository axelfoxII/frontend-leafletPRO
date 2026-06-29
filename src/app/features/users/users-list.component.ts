import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../core/users.service';
import { AuthStateService } from '../../core/auth-state.service';
import { User } from '../../models/user.interface';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, LoadingComponent],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Usuarios</h1>
        <p class="text-base-content/60">Administración de usuarios del sistema</p>
      </div>
      <a routerLink="/admin/users/new" class="btn btn-primary">Nuevo Usuario</a>
    </div>

    @if (loading()) {
      <app-loading message="Cargando usuarios..." />
    } @else {
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td class="font-medium">{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" [class.badge-primary]="user.role === 'ADMIN'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  @if (user.isActive) {
                    <span class="badge badge-success badge-outline">Activo</span>
                  } @else {
                    <span class="badge badge-error badge-outline">Inactivo</span>
                  }
                </td>
                <td>
                  <div class="flex gap-2">
                    <a [routerLink]="['/admin/users', user.id, 'edit']" class="btn btn-sm btn-ghost">Editar</a>
                    @if (user.id !== currentUserId) {
                      <button (click)="deleteUser(user.id)" class="btn btn-sm btn-ghost text-error">Eliminar</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class UsersListComponent {
  private readonly usersService = inject(UsersService);
  private readonly authState = inject(AuthStateService);

  protected readonly currentUserId = this.authState.userId();
  protected readonly loading = signal(true);
  protected readonly users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.usersService.findAll().subscribe({
      next: (res) => this.users.set(res.data ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected deleteUser(id: number): void {
    if (id === this.currentUserId) return;
    if (!confirm('¿Eliminar este usuario?')) return;
    this.usersService.delete(id).subscribe(() => this.loadUsers());
  }
}
