import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { FavoriteResponse } from '../models/response/favorite-response.model';
import { ItemTypeEnum } from '../models/item-type-enum';
import { UserService } from './UserService';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.apiLearningServiceUrl}/favorites`;
  private favoritesSource = new BehaviorSubject<FavoriteResponse[]>([]);
  private favoritesCache: Map<ItemTypeEnum, FavoriteResponse[]> = new Map();
  private initService = false;
  favoritesIds$ = this.favoritesSource.asObservable();
  constructor(private http: HttpClient, private userService: UserService) {}

  getFavoritesByType(itemType?: ItemTypeEnum): Observable<FavoriteResponse[]> {
    let params = new HttpParams();
    if (itemType) {
      params = params.set('filterType', itemType);
    }
    return this.http.get<FavoriteResponse[]>(`${this.apiUrl}`, { params });
  }
  getFavoriteIdsByType(itemType: ItemTypeEnum){
    if(this.userService.getJwt() === null) return;
    if(this.favoritesCache.has(itemType)){
      this.favoritesSource.next(this.favoritesCache.get(itemType) || []);
    }
    if(this.initService) return;
    this.initService = true;
    const params = new HttpParams().set('filterType', itemType);
    this.http.get<FavoriteResponse[]>(`${this.apiUrl}/ids`, { params }).subscribe((response) => {
      this.favoritesCache.set(itemType, response);
      this.favoritesSource.next(response);
    });
  }

  deleteFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`).pipe(
      // Invalidate cache after deletion
      tap(() => {
       for (const [type, favorites] of this.favoritesCache.entries()) {
          const updatedFavorites = favorites.filter((f) => f.id !== favoriteId);
          this.favoritesCache.set(type, updatedFavorites);
        }
      })
    );
  }

  addFavorite(
    itemId: string,
    itemType: ItemTypeEnum
  ): Observable<FavoriteResponse> {
    const body = {
      itemId: itemId,
      itemType: itemType,
    };
    return this.http.post<FavoriteResponse>(`${this.apiUrl}`, body).pipe(
      // Invalidate cache after addition
      tap((newFavorite) => {
        const favorites = this.favoritesCache.get(itemType) || [];        
        this.favoritesCache.set(itemType, [...favorites, newFavorite]);
      })
    );
  }
}
