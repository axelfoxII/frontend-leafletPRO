import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero min-h-full">
      <div class="hero-content text-center">
        <div>
          <h1 class="text-6xl font-bold text-primary">404</h1>
          <p class="text-xl mt-4">Página no encontrada</p>
          <p class="text-base-content/60 py-4">La página que buscas no existe o fue movida</p>
          <a routerLink="/dashboard" class="btn btn-primary">Volver al Dashboard</a>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
