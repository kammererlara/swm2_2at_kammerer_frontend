import { TestBed } from '@angular/core/testing';
import { weatherService } from './weather.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {MetarResponse, WeatherRecord} from '../models/weather.model';
import {environment} from '../../environment/environment';

describe('WeatherService', () => {
  let service: weatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [weatherService]
    });
    service = TestBed.inject(weatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch weather data for a given favorite ID and process JSON response', () => {
    const responseWeatherData = [
        { time: '2025-02-16T00:00:00', temperature: -1.1, humidity: 53 },
        { time: '2025-02-16T01:00:00', temperature: -1.4, humidity: 52 },
        { time: '2025-02-16T02:00:00', temperature: -1.6, humidity: 54 },
        { time: '2025-02-16T03:00:00', temperature: -1.6, humidity: 57 },
        { time: '2025-02-16T04:00:00', temperature: -1.8, humidity: 59 },
        { time: '2025-02-16T05:00:00', temperature: -2.1, humidity: 62 }
    ];

    service.getWeather(1).subscribe(data => {
      expect(data.length).toBe(6);
      expect(data.at(0)).toEqual({ time: '2025-02-16T00:00:00', temperature: -1.1, humidity: 53 } as WeatherRecord);
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/weather/1`);
    expect(req.request.method).toBe('GET');
    req.flush(responseWeatherData);
  });

  it('should return an empty array when getWeather fails due to wrong favoriteId input', () => {
    service.getWeather(0).subscribe(data => {
      expect(data).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/weather/0`);
    expect(req.request.method).toBe('GET');
    req.flush('Favorite id must be greater than 0.', { status: 400, statusText: 'Bad request' });
  });

  it('should return an empty array when getWeather fails due to missing favorite', () => {
    service.getWeather(99).subscribe(data => {
      expect(data).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/weather/99`);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 404, statusText: 'Not found' });
  });

  it('should return an empty array when getWeather fails due to other error', () => {
    service.getWeather(1).subscribe(data => {
      expect(data).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/weather/1`);
    expect(req.request.method).toBe('GET');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should fetch METAR data for a given ICAO code', () => {
    const metarResponse = {
      "altimeter": {
        "repr": "Q1020",
        "spoken": "one zero two zero",
        "value": 1020
      },
      "clouds": [],
      "density_altitude": -1137,
      "dewpoint": {
        "repr": "M11",
        "spoken": "minus one one",
        "value": -11
      },
      "flight_rules": "VFR",
      "meta": {
        "stations_updated": "2024-12-02",
        "timestamp": "2025-02-16T12:53:43.544765Z"
      },
      "other": [],
      "pressure_altitude": 399,
      "raw": "LOWW 161220Z 04007KT 010V080 CAVOK 01/M11 Q1020 NOSIG",
      "relative_humidity": 0.4032212183835962,
      "remarks": "NOSIG",
      "remarks_info": {
        "codes": [],
        "dewpoint_decimal": null,
        "maximum_temperature_24": null,
        "maximum_temperature_6": null,
        "minimum_temperature_24": null,
        "minimum_temperature_6": null,
        "precip_24_hours": null,
        "precip_36_hours": null,
        "precip_hourly": null,
        "pressure_tendency": null,
        "sea_level_pressure": null,
        "snow_depth": null,
        "sunshine_minutes": null,
        "temperature_decimal": null
      },
      "runway_visibility": [],
      "sanitized": "LOWW 161220Z 04007KT 010V080 CAVOK 01/M11 Q1020 NOSIG",
      "station": "LOWW",
      "temperature": {
        "repr": "01",
        "spoken": "one",
        "value": 1
      },
      "time": {
        "dt": "2025-02-16T12:20:00Z",
        "repr": "161220Z"
      },
      "units": {
        "accumulation": "in",
        "altimeter": "hPa",
        "altitude": "ft",
        "temperature": "C",
        "visibility": "m",
        "wind_speed": "kt"
      },
      "visibility": {
        "repr": "CAVOK",
        "spoken": "ceiling and visibility ok",
        "value": 9999
      },
      "wind_direction": {
        "repr": "040",
        "spoken": "zero four zero",
        "value": 40
      },
      "wind_gust": null,
      "wind_speed": {
        "repr": "07",
        "spoken": "seven",
        "value": 7
      },
      "wind_variable_direction": [
        {
          "repr": "010",
          "spoken": "zero one zero",
          "value": 10
        },
        {
          "repr": "080",
          "spoken": "zero eight zero",
          "value": 80
        }
      ],
      "wx_codes": []
    } as unknown as MetarResponse;
    service.getMetar('LOWW').subscribe(data => {
      expect(data.raw).toBe("LOWW 161220Z 04007KT 010V080 CAVOK 01/M11 Q1020 NOSIG");
      expect(data.temperature).toBe(1);
      expect(data.dewpoint).toBe(-11);
      expect(data.humidity).toBeCloseTo(0.4032, 4);
    });

    const req = httpMock.expectOne(`${environment.avwxBaseUrl}/LOWW?token=${environment.avwxToken}`);
    expect(req.request.method).toBe('GET');
    req.flush(metarResponse);
  });

  it('should return default MetarData when getMetar fails', () => {
    service.getMetar('INVALID').subscribe(data => {
      expect(data.raw).toBe('');
      expect(data.temperature).toBeUndefined();
      expect(data.dewpoint).toBeUndefined();
      expect(data.humidity).toBeUndefined();
    });

    const req = httpMock.expectOne(`${environment.avwxBaseUrl}/INVALID?token=${environment.avwxToken}`);
    expect(req.request.method).toBe('GET');
    req.flush({ error: "Invalid ICAO code" }, { status: 400, statusText: 'Bad Request' });
  });
});
