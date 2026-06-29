import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlacesService } from '../../core/places.service';
import { Place } from '../../models/place.interface';
import { MapMarker } from '../../map/map.types';
import { LeafletMapComponent } from '../../map/leaflet-map.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, LeafletMapComponent, LoadingComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-base-content/60">Visualización de lugares en el mapa</p>
    </div>

    <div class="stats shadow mb-6">
      <div class="stat">
        <div class="stat-title">Total de lugares</div>
        <div class="stat-value text-primary">{{ places().length }}</div>
      </div>
    </div>

    @if (loading()) {
      <app-loading message="Cargando mapa..." />
    } @else {
      <div class="card bg-base-100 shadow-xl overflow-visible">
        <div class="card-body relative z-10">
          <div class="flex w-full max-w-xl mx-auto gap-2">
            <div class="relative flex-1">
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Buscar por nombre, contacto o direccion..."
                [(ngModel)]="searchQuery"
                (focus)="showSuggestions.set(true)"
                (blur)="hideSuggestions()"
              />
              @if (suggestions().length > 0 && showSuggestions()) {
                <ul class="absolute top-full left-0 right-0 mt-1 bg-base-100 shadow-lg rounded-box max-h-60 overflow-y-auto z-50 border">
                  @for (place of suggestions(); track place.id) {
                    <li
                      class="px-4 py-3 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-0"
                      (mousedown)="selectPlace(place)"
                    >
                      <div class="font-medium">{{ place.businessName }}</div>
                      <div class="text-xs text-base-content/60 flex gap-2 mt-0.5">
                        <span>{{ place.contactName }}</span>
                        <span>&middot;</span>
                        <span class="truncate">{{ place.address }}</span>
                      </div>
                    </li>
                  }
                </ul>
              }
            </div>
            <button class="btn btn-primary btn-square" (click)="searchPlace()" [disabled]="!selectedPlace()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="h-[70vh] relative z-0">
          <app-leaflet-map [markers]="mapMarkers()" />
        </div>
      </div>
    }
  `,
})
export class DashboardComponent {
  @ViewChild(LeafletMapComponent) private mapComponent!: LeafletMapComponent;

  private readonly placesService = inject(PlacesService);

  protected readonly loading = signal(true);
  protected readonly places = signal<Place[]>([]);
  protected readonly mapMarkers = signal<MapMarker[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly showSuggestions = signal(false);
  protected readonly selectedPlace = signal<Place | null>(null);

  protected readonly suggestions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.places().filter(
      (p) =>
        p.businessName.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    ).slice(0, 6);
  });

  constructor() {
    this.loadPlaces();
  }

  private loadPlaces(): void {
    this.placesService.findAll().subscribe({
      next: (res) => {
        const items = res.data ?? [];
        this.places.set(items);
        this.mapMarkers.set(this.toMarkers(items));
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  private toMarkers(places: Place[]): MapMarker[] {
    return places.map((p) => ({
      id: p.id,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      title: p.businessName,
      description: p.contactName,
      phone: p.phone,
      address: p.address,
    }));
  }

  protected selectPlace(place: Place): void {
    this.selectedPlace.set(place);
    this.searchQuery.set(place.businessName);
    this.showSuggestions.set(false);
  }

  protected searchPlace(): void {
    const place = this.selectedPlace();
    if (!place) return;
    this.mapComponent.flyTo(Number(place.latitude), Number(place.longitude), place.id);
  }

  protected hideSuggestions(): void {
    setTimeout(() => this.showSuggestions.set(false), 200);
  }
}