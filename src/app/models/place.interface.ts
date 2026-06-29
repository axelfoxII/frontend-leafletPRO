export interface Place {
  id: number;
  userId: number;
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string; email: string };
}

export interface CreatePlacePayload {
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface UpdatePlacePayload {
  businessName?: string;
  contactName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}
