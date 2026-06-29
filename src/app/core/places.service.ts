import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.interface';
import { Place, CreatePlacePayload, UpdatePlacePayload } from '../models/place.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/places`;

  findAll(): Observable<ApiResponse<Place[]>> {
    return this.http.get<ApiResponse<Place[]>>(this.apiUrl);
  }

  findById(id: number): Observable<ApiResponse<Place>> {
    return this.http.get<ApiResponse<Place>>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreatePlacePayload): Observable<ApiResponse<Place>> {
    return this.http.post<ApiResponse<Place>>(this.apiUrl, payload);
  }

  update(id: number, payload: UpdatePlacePayload): Observable<ApiResponse<Place>> {
    return this.http.put<ApiResponse<Place>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}
