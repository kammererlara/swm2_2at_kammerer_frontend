import {Component, OnInit} from '@angular/core';
import {Favorite} from '../../models/favorite.model';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {favoritesService} from '../../services/favorites.service';
import {NgForOf, NgIf} from '@angular/common';
import {weatherService} from '../../services/weather.service';
import {MetarData, WeatherRecord} from '../../models/weather.model';

@Component({
  selector: 'app-weather',
  imports: [
    NgIf,
    RouterLink,
    NgForOf
  ],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css'
})
export class WeatherComponent implements OnInit{
  favorite: Favorite | undefined;
  weatherData: WeatherRecord[] = [];
  metar: MetarData | undefined;

  constructor(
    private route: ActivatedRoute,
    private favoritesService: favoritesService,
    private weatherService: weatherService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.favoritesService.getFavorite(+id).subscribe({
        next: data => {
          console.log('Geladene Favoritendaten:', data);
          this.favorite = data;

          //METAR Data only loaded when favorite data already present
          if (this.favorite?.location?.icao) {
            this.weatherService.getMetar(this.favorite.location.icao).subscribe({
              next: data => {
                console.log("METAR Data:", data);
                this.metar = data;
              },
              error: err => console.error("Fehler beim Abrufen der METAR-Daten:", err)
            });
          }
        },
        error: err => console.error('Fehler beim Laden des Favoriten: ', err)
      })
      this.weatherService.getWeather(+id).subscribe({
        next: data => {
          console.log('Geladene Wetterdaten:', data);
          this.weatherData = data
        },
        error: err => console.error('Fehler beim Laden der Wetterdaten: ', err)
      })
    }
  }
}
