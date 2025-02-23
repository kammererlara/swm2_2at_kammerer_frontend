import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {MetarData, MetarResponse, WeatherRecord} from '../models/weather.model';
import {environment} from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class weatherService {
  private backendBaseUrl = environment.backendBaseUrl;
  private avwxBaseUrl = environment.avwxBaseUrl;
  private avwxToken = environment.avwxToken;

  constructor(private http: HttpClient) {}

  getWeather(favoriteId: number): Observable<WeatherRecord[]> {
    return this.http.get<WeatherRecord[]>(`${this.backendBaseUrl}/weather/${favoriteId}`).pipe(
      catchError(err => this.handleWeatherError(err))
    );
  }

  getMetar(icao: string): Observable<MetarData> {
    console.log(this.avwxBaseUrl + "/" + icao + "?token=" + this.avwxToken);
    return this.http.get<MetarResponse>(`${this.avwxBaseUrl}/${icao}?token=${this.avwxToken}`).pipe(
      map(response => ({
        raw: response.raw,
        temperature: response.temperature?.value,
        dewpoint: response.dewpoint?.value,
        humidity: response.relative_humidity
      })),
      catchError(err => this.handleMetarError(err))
    );
  }

  private handleWeatherError(error: HttpErrorResponse): Observable<WeatherRecord[]> {
    console.error(`getWeather failed: ${error.message}`);
    return of([]);
  }

  private handleMetarError(error: HttpErrorResponse): Observable<MetarData> {
    console.error(`getMetar failed: ${error.error}`);
    return of({
      raw: ''
    } as MetarData);
  }
}
