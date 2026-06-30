import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlacesService } from '../../core/places.service';
import { CreatePlacePayload, UpdatePlacePayload } from '../../models/place.interface';
import { LeafletMapComponent } from '../../map/leaflet-map.component';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-place-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingComponent, LeafletMapComponent],
  template: `
    @if (loading()) {
      <app-loading message="Cargando..." />
    } @else {
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{{ isEdit() ? 'Editar' : 'Nuevo' }} Lugar</h1>
        <p class="text-base-content/60">
          {{ isEdit() ? 'Modifica los datos del lugar' : 'Registra un nuevo lugar geográfico' }}
        </p>
      </div>

      <form #placeForm="ngForm" (ngSubmit)="onSubmit()" class="card bg-base-100 shadow-xl" novalidate>
        <div class="card-body">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <fieldset class="fieldset">
                <label class="fieldset-label">Nombre del Negocio *</label>
                <input type="text" class="input w-full" [(ngModel)]="form.businessName" name="businessName" required />
              </fieldset>

              <fieldset class="fieldset">
                <label class="fieldset-label">Nombre del Contacto *</label>
                <input type="text" class="input w-full" [(ngModel)]="form.contactName" name="contactName" required />
              </fieldset>

              <fieldset class="fieldset">
                <label class="fieldset-label">Teléfono *</label>
                <input type="text" class="input w-full" [(ngModel)]="form.phone" name="phone" required />
              </fieldset>

              <fieldset class="fieldset">
                <label class="fieldset-label">Dirección *</label>
                <input type="text" class="input w-full" [(ngModel)]="form.address" name="address" required />
              </fieldset>

              <fieldset class="fieldset">
                <label class="fieldset-label">Pega coordenadas de Google Maps</label>
                <input type="text" class="input w-full" placeholder="-17.3745, -66.1610" [ngModel]="clipboardCoords()" (ngModelChange)="onPasteCoords($event)" name="clipboardCoords" />
                <span class="fieldset-label text-xs text-base-content/50">Se separa automaticamente en latitud y longitud</span>
              </fieldset>

              <div class="grid grid-cols-2 gap-3">
                <fieldset class="fieldset">
                  <label class="fieldset-label">Latitud *</label>
                  <input type="number" step="any" class="input w-full" [(ngModel)]="form.latitude" name="latitude" required (ngModelChange)="onCoordChange()" />
                </fieldset>

                <fieldset class="fieldset">
                  <label class="fieldset-label">Longitud *</label>
                  <input type="number" step="any" class="input w-full" [(ngModel)]="form.longitude" name="longitude" required (ngModelChange)="onCoordChange()" />
                </fieldset>
              </div>

              <fieldset class="fieldset">
                <label class="fieldset-label">Notas</label>
                <textarea class="textarea w-full" [(ngModel)]="form.notes" name="notes" rows="3"></textarea>
              </fieldset>
            </div>

            <div>
              <label class="fieldset-label mb-2">Selecciona en el mapa (clic o arrastra el marcador)</label>
              <div class="h-[400px] rounded-box overflow-hidden border">
                <app-leaflet-map
                  [editable]="true"
                  [locate]="!initialCoords()"
                  [initialCoords]="initialCoords()"
                  (mapClick)="onMapClick($event)"
                />
              </div>
            </div>
          </div>

          @if (error()) {
            <div class="alert alert-error text-sm mt-4">
              <div>{{ error() }}</div>
              @if (fieldErrors().length) {
                <ul class="list-disc list-inside mt-1">
                  @for (e of fieldErrors(); track e) {
                    <li>{{ e }}</li>
                  }
                </ul>
              }
            </div>
          }

          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="loading loading-spinner"></span>
              }
              {{ isEdit() ? 'Guardar Cambios' : 'Crear Lugar' }}
            </button>
            <a routerLink="/places" class="btn btn-ghost">Cancelar</a>
          </div>
        </div>
      </form>
    }
  `,
})
export class PlaceFormComponent implements OnInit {
  private readonly placesService = inject(PlacesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isEdit = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly fieldErrors = signal<string[]>([]);

  protected readonly clipboardCoords = signal('');

  private readonly coordToken = signal(0);

  protected readonly initialCoords = computed(() => {
    this.coordToken();
    if (!this.form.latitude && !this.form.longitude) return null;
    return { lat: this.form.latitude, lng: this.form.longitude };
  });

  protected readonly form: CreatePlacePayload & { notes?: string } = {
    businessName: '',
    contactName: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
    notes: '',
  };

  private placeId?: number;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.placeId = Number(id);
      this.loadPlace();
    }
  }

  private loadPlace(): void {
    this.loading.set(true);
    this.placesService.findById(this.placeId!).subscribe({
      next: (res) => {
        if (res.data) {
          this.form.businessName = res.data.businessName;
          this.form.contactName = res.data.contactName;
          this.form.phone = res.data.phone;
          this.form.address = res.data.address;
          this.form.latitude = Number(res.data.latitude);
          this.form.longitude = Number(res.data.longitude);
          this.clipboardCoords.set(`${res.data.latitude}, ${res.data.longitude}`);
          this.form.notes = res.data.notes ?? '';
          this.coordToken.update(v => v + 1);
        }
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected onCoordChange(): void {
    this.clipboardCoords.set(`${this.form.latitude}, ${this.form.longitude}`);
    this.coordToken.update(v => v + 1);
  }

  protected onMapClick(event: { latitude: number; longitude: number }): void {
    this.form.latitude = event.latitude;
    this.form.longitude = event.longitude;
    this.clipboardCoords.set(`${event.latitude}, ${event.longitude}`);
    this.coordToken.update(v => v + 1);
  }

  protected onPasteCoords(value: string): void {
    this.clipboardCoords.set(value);
    const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat)) this.form.latitude = lat;
      if (!isNaN(lng)) this.form.longitude = lng;
      this.coordToken.update(v => v + 1);
    }
  }

  protected onSubmit(): void {
    this.saving.set(true);
    this.error.set(null);
    this.fieldErrors.set([]);

    if (!this.form.latitude && !this.form.longitude) {
      this.error.set('Debes seleccionar una ubicación en el mapa');
      this.saving.set(false);
      return;
    }

    const payload: CreatePlacePayload | UpdatePlacePayload = {
      businessName: this.form.businessName,
      contactName: this.form.contactName,
      phone: this.form.phone,
      address: this.form.address,
      latitude: this.form.latitude,
      longitude: this.form.longitude,
      notes: this.form.notes || undefined,
    };

    const request = this.isEdit()
      ? this.placesService.update(this.placeId!, payload as UpdatePlacePayload)
      : this.placesService.create(payload as CreatePlacePayload);

    request.subscribe({
      next: () => this.router.navigate(['/places']),
      error: (err) => {
        this.error.set(err.message || 'Error al guardar');
        const errs = err.error?.errors;
        this.fieldErrors.set(Array.isArray(errs) ? errs.map((e: any) => e.msg) : []);
        this.saving.set(false);
      },
      complete: () => this.saving.set(false),
    });
  }
}
