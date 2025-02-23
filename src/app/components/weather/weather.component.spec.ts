import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherComponent } from './weather.component';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {weatherService} from '../../services/weather.service';
import {By} from '@angular/platform-browser';
import {favoritesService} from '../../services/favorites.service';

describe('WeatherComponent', () => {
  let component: WeatherComponent;
  let fixture: ComponentFixture<WeatherComponent>;
  let mockWeatherService: jasmine.SpyObj<weatherService>;
  let mockFavoritesService: jasmine.SpyObj<favoritesService>;

  beforeEach(async () => {
    mockWeatherService = jasmine.createSpyObj('weatherService', ['getWeather', 'getMetar']);
    mockFavoritesService = jasmine.createSpyObj('favoritesService', ['getFavorite']);

    mockFavoritesService.getFavorite.and.returnValue(of({
      id: 1,
      name: 'Test Favorite',
      user: { firstname: 'John', lastname: 'Doe' },
      location: { name: 'Test Location', latitude: 48.2, longitude: 16.37, elevation: 200, icao: 'LOWW' }
    }));

    mockWeatherService.getMetar.and.returnValue(of({
      raw: 'METAR DATA', temperature: 22, dewpoint: 12, humidity: 0.55
    }));

    mockWeatherService.getWeather.and.returnValue(of([
      {time: '12:00', temperature: 25, humidity: 50}
    ]));

    await TestBed.configureTestingModule({
      imports: [WeatherComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: weatherService, useValue: mockWeatherService },
        { provide: favoritesService, useValue: mockFavoritesService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display weather details header correctly', () => {
    const nameElement = fixture.debugElement.query(By.css('h1'));
    expect(nameElement.nativeElement.textContent).toContain('Weather Details');
  });

  it('should show back button linking to favorites', () => {
    const backButton = fixture.debugElement.query(By.css('.btn-primary.back-button'));
    expect(backButton.nativeElement.getAttribute('routerLink')).toBe('/favorites');
  });

  it('should display favorite data', () => {
    const favoriteElement = fixture.debugElement.query(By.css('.card.favoriteData'));
    expect(favoriteElement.nativeElement.textContent).toContain('Favorite Details');
    expect(favoriteElement.nativeElement.textContent).toContain('NameTest Favorite');
    expect(favoriteElement.nativeElement.textContent).toContain('User');
    expect(favoriteElement.nativeElement.textContent).toContain('First Name: John');
    expect(favoriteElement.nativeElement.textContent).toContain('Last Name: Doe');
    expect(favoriteElement.nativeElement.textContent).toContain('Location');
    expect(favoriteElement.nativeElement.textContent).toContain('Name: Test Location');
    expect(favoriteElement.nativeElement.textContent).toContain('Latitude: 48.2');
    expect(favoriteElement.nativeElement.textContent).toContain('Longitude: 16.37');
    expect(favoriteElement.nativeElement.textContent).toContain('Elevation: 200m');
    expect(favoriteElement.nativeElement.textContent).toContain('ICAO: LOWW');
  });

  it('should successfully load favorite data', () => {
    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.favorite).toBeDefined();
    expect(component.favorite?.name).toBe('Test Favorite');
    expect(component.favorite?.user.firstname).toBe('John');
    expect(component.favorite?.user.lastname).toBe('Doe');
    expect(component.favorite?.location.name).toBe('Test Location');
  });

  it('should display METAR data when available', () => {
    const metarElement = fixture.debugElement.query(By.css('.card.metar'));
    expect(metarElement.nativeElement.textContent).toContain('METAR Data');
    expect(metarElement.nativeElement.textContent).toContain('METAR DATA');
    expect(metarElement.nativeElement.textContent).toContain('Temperature: 22°C');
    expect(metarElement.nativeElement.textContent).toContain('Dew Point: 12°C');
    expect(metarElement.nativeElement.textContent).toContain('Humidity: 55%');
  });

  // assume that raw data is always available
  it('should only display METAR raw report if no other data is available', () => {
    mockWeatherService.getMetar.and.returnValue(of({ raw: 'METAR ONLY' }));
    component.ngOnInit();
    fixture.detectChanges();
    const metarElement = fixture.debugElement.query(By.css('.card.metar'));
    expect(metarElement.nativeElement.textContent).toContain('METAR ONLY');
    expect(metarElement.nativeElement.textContent).not.toContain('Temperature:');
    expect(metarElement.nativeElement.textContent).not.toContain('Dew Point:');
    expect(metarElement.nativeElement.textContent).not.toContain('Humidity:');
  });

  it('should successfully load metar data', () => {
    expect(component.metar).toBeDefined();
    expect(component.metar?.raw).toBe('METAR DATA');
    expect(component.metar?.temperature).toBe(22);
    expect(component.metar?.dewpoint).toBe(12);
    expect(component.metar?.humidity).toBe(0.55);
  });

  it('should display weather records if available', () => {
    const weatherElement = fixture.debugElement.query(By.css('.card.weather'));
    expect(weatherElement.nativeElement.textContent).toContain('Weather Data');
    expect(weatherElement.nativeElement.textContent).toContain('Weather Records');
    expect(weatherElement.nativeElement.textContent).toContain('Time: 12:00');
    expect(weatherElement.nativeElement.textContent).toContain('Temperature: 25°C');
    expect(weatherElement.nativeElement.textContent).toContain('Humidity: 50%');
  });

  it('should successfully load weather data', () => {
    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.weatherData).toEqual([{time: '12:00', temperature: 25, humidity: 50}]);
  });
});
