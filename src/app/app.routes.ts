import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'places', loadComponent: () => import('./features/places/places-list.component').then((m) => m.PlacesListComponent) },
      { path: 'places/new', loadComponent: () => import('./features/places/place-form.component').then((m) => m.PlaceFormComponent) },
      { path: 'places/:id', loadComponent: () => import('./features/places/place-detail.component').then((m) => m.PlaceDetailComponent) },
      { path: 'places/:id/edit', loadComponent: () => import('./features/places/place-form.component').then((m) => m.PlaceFormComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent) },
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/users/users-list.component').then((m) => m.UsersListComponent) },
          { path: 'new', loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent) },
        ],
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
