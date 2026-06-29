import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/users.service';
import { AuthStateService } from '../../core/auth-state.service';
import { UserRole, CreateUserPayload, UpdateUserPayload } from '../../models/user.interface';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingComponent],
  template: `
    @if (loading()) {
      <app-loading message="Cargando..." />
    } @else {
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ isEdit() ? 'Editar' : 'Nuevo' }} Usuario</h1>
        <p class="text-base-content/60">
          {{ isEdit() ? 'Modifica los datos del usuario' : 'Registra un nuevo usuario en el sistema' }}
        </p>
      </div>

      <form #userForm="ngForm" (ngSubmit)="onSubmit()" class="card bg-base-100 shadow-xl max-w-lg">
        <div class="card-body">
          <fieldset class="fieldset">
            <label class="fieldset-label">Nombre *</label>
            <input type="text" class="input w-full" [(ngModel)]="form.name" name="name" required />
          </fieldset>

          <fieldset class="fieldset">
            <label class="fieldset-label">Email *</label>
            <input type="email" class="input w-full" [(ngModel)]="form.email" name="email" required />
          </fieldset>

          <fieldset class="fieldset">
            <label class="fieldset-label">
              Contraseña {{ isEdit() ? '(dejar vacío para no cambiar)' : '*' }}
            </label>
            <input type="password" class="input w-full" [(ngModel)]="form.password" name="password"
              [required]="!isEdit()" minlength="6" />
          </fieldset>

          <fieldset class="fieldset">
            <label class="fieldset-label">Rol</label>
            <select class="select w-full" [(ngModel)]="form.role" name="role">
              <option [value]="UserRole.USER">Usuario</option>
              <option [value]="UserRole.ADMIN">Administrador</option>
            </select>
          </fieldset>

          @if (isEdit() && !isSelf()) {
            <fieldset class="fieldset">
              <label class="fieldset-label">Estado</label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" class="toggle" [(ngModel)]="form.isActive" name="isActive" />
                <span>{{ form.isActive ? 'Activo' : 'Inactivo' }}</span>
              </label>
            </fieldset>
          }

          @if (error()) {
            <div class="alert alert-error text-sm">{{ error() }}</div>
          }

          <div class="flex gap-3 mt-4">
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="loading loading-spinner"></span>
              }
              {{ isEdit() ? 'Guardar Cambios' : 'Crear Usuario' }}
            </button>
            <a routerLink="/admin/users" class="btn btn-ghost">Cancelar</a>
          </div>
        </div>
      </form>
    }
  `,
})
export class UserFormComponent implements OnInit {
  protected readonly UserRole = UserRole;
  private readonly usersService = inject(UsersService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isEdit = signal(false);
  protected readonly isSelf = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form: CreateUserPayload & { isActive?: boolean } = {
    name: '',
    email: '',
    password: '',
    role: UserRole.USER,
    isActive: true,
  };

  private userId?: number;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.userId = Number(id);
      this.loadUser();
    }
  }

  private loadUser(): void {
    this.loading.set(true);
    this.usersService.findById(this.userId!).subscribe({
      next: (res) => {
        if (res.data) {
          this.form.name = res.data.name;
          this.form.email = res.data.email;
          this.form.role = res.data.role;
          this.form.isActive = res.data.isActive;
          this.isSelf.set(res.data.id === this.authState.userId());
        }
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected onSubmit(): void {
    this.saving.set(true);
    this.error.set(null);

    if (this.isEdit()) {
      const payload: UpdateUserPayload = {
        name: this.form.name,
        email: this.form.email,
        role: this.form.role,
      };
      if (!this.isSelf()) {
        payload.isActive = this.form.isActive;
      }
      if (this.form.password) {
        payload.password = this.form.password;
      }

      this.usersService.update(this.userId!, payload).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error.set(err.message || 'Error al guardar');
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    } else {
      const payload: CreateUserPayload = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        role: this.form.role,
      };

      this.usersService.create(payload).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error.set(err.message || 'Error al guardar');
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    }
  }
}
