import { Routes } from '@angular/router';
import {FavoritesComponent} from './components/favorites/favorites.component';

export const routes: Routes = [
  { path: '', redirectTo: '/favorites', pathMatch: 'full' },
  { path: 'favorites', component: FavoritesComponent },
];
