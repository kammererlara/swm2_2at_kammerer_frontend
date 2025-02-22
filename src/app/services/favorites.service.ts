import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Favorite} from '../models/favorite.model';
import {environment} from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class favoritesService {
  private baseUrl = environment.backendBaseUrl;

  constructor(private http: HttpClient) {}

  getFavoritesforDefaultUser(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.baseUrl}/favorites/user/1`).pipe(
      catchError(err => this.handleError<Favorite[]>(err))
    );
  }

  getFavorite(favoriteId: number): Observable<Favorite> {
    return this.http.get<Favorite>(`${this.baseUrl}/favorites/${favoriteId}`).pipe(
      catchError(err => this.handleError<Favorite>(err))
    );
  }

  createFavorite(favorite: Favorite): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.baseUrl}/favorites`, favorite).pipe(
      catchError(err => this.handleError<Favorite>(err))
    );
  }

  deleteFavorite(favoriteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/favorites/${favoriteId}`).pipe(
      catchError(err => this.handleError<void>(err))
    );
  }

  private handleError<T>(error: HttpErrorResponse): Observable<T> {
    console.error(`Request failed: ${error.message}`);
    return throwError(() => new Error(error.error || 'An unexpected error occurred.'));
  }
}
