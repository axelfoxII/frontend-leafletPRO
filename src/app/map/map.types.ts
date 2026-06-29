export interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  phone?: string;
  address?: string;
}

export interface MapClickEvent {
  latitude: number;
  longitude: number;
}
