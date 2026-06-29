import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PlacesService } from '../../core/places.service';
import { Place } from '../../models/place.interface';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [RouterLink, LoadingComponent, DecimalPipe],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Mis Lugares</h1>
        <p class="text-base-content/60">Gestiona tus lugares geográficos</p>
      </div>
      <a routerLink="/places/new" class="btn btn-primary">Nuevo Lugar</a>
    </div>

    @if (loading()) {
      <app-loading message="Cargando lugares..." />
    } @else if (places().length === 0) {
      <div class="hero py-16">
        <div class="hero-content text-center">
          <div>
            <h2 class="text-xl font-semibold">No hay lugares registrados</h2>
            <p class="text-base-content/60 py-2">Crea tu primer lugar para empezar</p>
            <a routerLink="/places/new" class="btn btn-primary mt-2">Nuevo Lugar</a>
          </div>
        </div>
      </div>
    } @else {
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Negocio</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Coordenadas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (place of places(); track place.id) {
              <tr>
                <td class="font-medium">{{ place.businessName }}</td>
                <td>{{ place.contactName }}</td>
                <td>{{ place.phone }}</td>
                <td class="max-w-xs truncate">{{ place.address }}</td>
                <td>
                  <button class="link link-hover text-sm font-mono" (click)="copyCoords(place)" title="Copiar coordenadas">
                    {{ place.latitude | number:'1.4-4' }}, {{ place.longitude | number:'1.4-4' }}
                    @if (copiedId() === place.id) {
                      <span class="text-success text-xs ml-1">✓</span>
                    }
                  </button>
                </td>
                <td>
                  <div class="flex gap-2">
                    <a [routerLink]="['/places', place.id]" class="btn btn-sm btn-ghost">Ver</a>
                    <a [routerLink]="['/places', place.id, 'edit']" class="btn btn-sm btn-ghost">Editar</a>
                    <button (click)="deletePlace(place.id)" class="btn btn-sm btn-ghost text-error">Eliminar</button>
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
export class PlacesListComponent {
  private readonly placesService = inject(PlacesService);

  protected readonly loading = signal(true);
  protected readonly places = signal<Place[]>([]);
  protected readonly copiedId = signal<number | null>(null);

  constructor() {
    this.loadPlaces();
  }

  private loadPlaces(): void {
    this.placesService.findAll().subscribe({
      next: (res) => this.places.set(res.data ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected copyCoords(place: Place): void {
    const text = `${place.latitude}, ${place.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(place.id);
      setTimeout(() => {
        if (this.copiedId() === place.id) this.copiedId.set(null);
      }, 2000);
    });
  }

  protected deletePlace(id: number): void {
    if (!confirm('¿Eliminar este lugar?')) return;
    this.placesService.delete(id).subscribe(() => this.loadPlaces());
  }
}
