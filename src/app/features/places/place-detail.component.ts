import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlacesService } from '../../core/places.service';
import { Place } from '../../models/place.interface';
import { MapMarker } from '../../map/map.types';
import { LeafletMapComponent } from '../../map/leaflet-map.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [RouterLink, LeafletMapComponent, LoadingComponent],
  template: `
    @if (loading()) {
      <app-loading message="Cargando..." />
    } @else if (place(); as p) {
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{{ p.businessName }}</h1>
          <p class="text-base-content/60">{{ p.contactName }}</p>
        </div>
        <div class="flex gap-2">
          <a [routerLink]="['/places', p.id, 'edit']" class="btn btn-primary">Editar</a>
          <a routerLink="/places" class="btn btn-ghost">Volver</a>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body p-0">
              <div class="h-[50vh]">
                <app-leaflet-map [markers]="markers()" [locate]="false" />
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-lg mb-4">Información</h2>
            <dl class="space-y-3 text-sm">
              <div>
                <dt class="text-base-content/60">Contacto</dt>
                <dd class="font-medium">{{ p.contactName }}</dd>
              </div>
              <div>
                <dt class="text-base-content/60">Teléfono</dt>
                <dd class="font-medium">{{ p.phone }}</dd>
              </div>
              <div>
                <dt class="text-base-content/60">Dirección</dt>
                <dd class="font-medium">{{ p.address }}</dd>
              </div>
              <div>
                <dt class="text-base-content/60">Latitud</dt>
                <dd class="font-medium">{{ p.latitude }}</dd>
              </div>
              <div>
                <dt class="text-base-content/60">Longitud</dt>
                <dd class="font-medium">{{ p.longitude }}</dd>
              </div>
              @if (p.notes) {
                <div>
                  <dt class="text-base-content/60">Notas</dt>
                  <dd class="font-medium">{{ p.notes }}</dd>
                </div>
              }
              @if (p.user) {
                <div>
                  <dt class="text-base-content/60">Creado por</dt>
                  <dd class="font-medium">{{ p.user.name }}</dd>
                </div>
              }
            </dl>
          </div>
        </div>
      </div>
    }
  `,
})
export class PlaceDetailComponent implements OnInit {
  private readonly placesService = inject(PlacesService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly place = signal<Place | undefined>(undefined);
  protected readonly markers = computed<MapMarker[]>(() => {
    const p = this.place();
    if (!p) return [];
    return [{
      id: p.id,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      title: p.businessName,
      description: p.contactName,
      phone: p.phone,
      address: p.address,
    }];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.placesService.findById(id).subscribe({
      next: (res) => this.place.set(res.data),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
