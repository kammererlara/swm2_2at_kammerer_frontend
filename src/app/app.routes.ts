import { Routes } from '@angular/router';
import {FavoritesComponent} from './components/favorites/favorites.component';
import {WeatherComponent} from './components/weather/weather.component';

export const routes: Routes = [
  { path: '', redirectTo: '/favorites', pathMatch: 'full' },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'favorites/:id', component: WeatherComponent }
];
