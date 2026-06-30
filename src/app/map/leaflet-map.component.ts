import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, input, output, effect } from '@angular/core';
import L from 'leaflet';
import { MapMarker, MapClickEvent } from './map.types';

const PLACE_ICON = L.icon({
  iconUrl: '/icono/marker-icon1.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const USER_ICON = L.icon({
  iconUrl: '/icono/marker-icon2.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  template: `
    <div class="relative h-full w-full">
      @if (showLocateBtn()) {
        <button
          class="btn btn-circle btn-sm btn-primary absolute top-4 right-4 z-[1000] shadow"
          (click)="getLocation()"
          title="Mi ubicación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      }
      <div #mapContainer class="h-full w-full"></div>
    </div>
  `,
})
export class LeafletMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;

  readonly markers = input<MapMarker[]>([]);
  readonly editable = input(false);
  readonly locate = input(true);
  readonly showLocateBtn = input(true);
  readonly initialCoords = input<{ lat: number; lng: number } | null>(null);
  readonly markerClick = output<MapMarker>();
  readonly mapClick = output<MapClickEvent>();

  private map: L.Map | null = null;
  private layerGroup: L.LayerGroup | null = null;
  private tempMarker: L.Marker | null = null;
  private markerMap = new Map<number, L.Marker>();

  constructor() {
    effect(() => {
      const currentMarkers = this.markers();
      if (this.mapInitialized) {
        this.updateMarkers(currentMarkers);
      }
    });

    effect(() => {
      const coords = this.initialCoords();
      if (this.mapInitialized && coords) {
        this.setTempMarker(coords.lat, coords.lng);
        this.map?.setView([coords.lat, coords.lng], 15);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private mapInitialized = false;

  private initMap(): void {
    if (this.map) return;

    const el = this.mapContainer.nativeElement;
    this.map = L.map(el, {
      center: [-12.0464, -77.0428],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.editable()) {
        this.setTempMarker(e.latlng.lat, e.latlng.lng);
      }
      this.mapClick.emit({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    setTimeout(() => this.map?.invalidateSize(), 200);

    const coords = this.initialCoords();
    if (coords) {
      this.setTempMarker(coords.lat, coords.lng);
      this.map.setView([coords.lat, coords.lng], 15);
    } else if (this.locate()) {
      this.tryGeolocate();
    }

    this.mapInitialized = true;
    this.updateMarkers(this.markers());
  }

  getLocation(): void {
    if (!this.map) return;
    this.tryGeolocate(true);
  }

  private tryGeolocate(force = false): void {
    if (!this.map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!force && this.initialCoords()) return;
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];

        if (this.tempMarker) {
          this.tempMarker.setLatLng(coords);
        } else if (force || this.markerMap.size === 0) {
          this.tempMarker = L.marker(coords, { icon: USER_ICON, draggable: true })
            .addTo(this.map!)
            .bindPopup('Estas aqui')
            .openPopup();

          this.tempMarker.on('dragend', () => {
            const pos = this.tempMarker!.getLatLng();
            this.mapClick.emit({ latitude: pos.lat, longitude: pos.lng });
          });
        }

        if (force || this.markerMap.size === 0) {
          this.map!.setView(coords, 15);
        }
      },
      () => {
        if (this.locate()) {
          this.map?.setView([-12.0464, -77.0428], 6);
        }
      },
      { enableHighAccuracy: true },
    );
  }

  private setTempMarker(lat: number, lng: number): void {
    if (this.tempMarker) {
      this.tempMarker.setLatLng([lat, lng]);
    } else {
      this.tempMarker = L.marker([lat, lng], {
        icon: USER_ICON,
        draggable: true,
      })
        .addTo(this.map!)
        .bindPopup('Nueva ubicación');

      this.tempMarker.on('dragend', () => {
        const pos = this.tempMarker!.getLatLng();
        this.mapClick.emit({ latitude: pos.lat, longitude: pos.lng });
      });
    }
  }

  private updateMarkers(markers: MapMarker[]): void {
    if (!this.layerGroup || !this.map) return;

    this.layerGroup.clearLayers();
    this.markerMap.clear();
    const bounds = L.latLngBounds([]);

    for (const marker of markers) {
      const info = [
        `<div class="text-sm">`,
        `<b class="text-base">${marker.title}</b>`,
        marker.description ? `<br>Contacto: ${marker.description}` : '',
        marker.phone ? `<br>Telefono: ${marker.phone}` : '',
        marker.address ? `<br>Direccion: ${marker.address}` : '',
        `<br><a href="/places/${marker.id}" class="text-primary font-medium mt-1 inline-block">Ver detalle &rarr;</a>`,
        `</div>`,
      ].join('');

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon: PLACE_ICON })
        .bindPopup(info)
        .on('click', () => this.markerClick.emit(marker));

      leafletMarker.addTo(this.layerGroup);
      this.markerMap.set(marker.id, leafletMarker);
      bounds.extend([marker.latitude, marker.longitude]);
    }

    if (markers.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  flyTo(lat: number, lng: number, markerId?: number): void {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 17, { duration: 1 });
    if (markerId !== undefined) {
      const marker = this.markerMap.get(markerId);
      setTimeout(() => marker?.openPopup(), 1000);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
