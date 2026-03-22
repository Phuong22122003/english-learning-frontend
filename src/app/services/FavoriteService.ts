import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FavoriteResponse } from '../models/response/favorite-response.model';
import { ItemTypeEnum } from '../models/item-type-enum';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.apiLearningServiceUrl}/favorites`;

  constructor(private http: HttpClient) {}

  getFavoritesByType(itemType?: ItemTypeEnum): Observable<FavoriteResponse[]> {
    let params = new HttpParams();
    if (itemType) {
      params = params.set('filterType', itemType);
    }
    return this.http.get<FavoriteResponse[]>(`${this.apiUrl}`, { params });
  }
  getFavoriteIdsByType(itemType: ItemTypeEnum): Observable<FavoriteResponse[]> {
    const params = new HttpParams().set('filterType', itemType);
    return this.http.get<FavoriteResponse[]>(`${this.apiUrl}/ids`, { params });
  }
  deleteFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`);
  }

  addFavorite(
    itemId: string,
    itemType: ItemTypeEnum
  ): Observable<FavoriteResponse> {
    const body = {
      itemId: itemId,
      itemType: itemType,
    };
    return this.http.post<FavoriteResponse>(`${this.apiUrl}`, body);
  }
}
