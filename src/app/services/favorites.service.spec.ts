import { TestBed } from '@angular/core/testing';
import { favoritesService } from './favorites.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../environment/environment';
import {Favorite} from '../models/favorite.model';

describe('FavoritesService', () => {
  let service: favoritesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [favoritesService]
    });
    service = TestBed.inject(favoritesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch favorites for the default user and process JSON response', () => {
    const returnedFavorites = [
      {
        id: 1,
        name: "Home",
        user: { id: 1, firstname: "John", lastname: "Doe" },
        location: {id: 10, latitude: 48.2082, longitude: 16.3738, elevation: 200, name: "Vienna", icao: "LOWW"}
      },
      {
        id: 2,
        name: "Work",
        user: { id: 1, firstname: "John", lastname: "Doe" },
        location: {id: 11, latitude: 52.5200, longitude: 13.4050, elevation: 34, name: "Berlin", icao: "EDDB"}
      }
    ];

    service.getFavoritesforDefaultUser().subscribe(data => {
      expect(data.length).toBe(2);
      expect(data[0].name).toBe("Home");
      expect(data[1].location.icao).toBe("EDDB");
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(returnedFavorites);
  });

  it('should return an error when getFavoritesforDefaultUser fails due to server error', () => {
    service.getFavoritesforDefaultUser().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should return an error when getFavoritesforDefaultUser fails due to missing default user', () => {
    service.getFavoritesforDefaultUser().subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 404, statusText: 'Not found' });
  });

  it('should fetch a specific favorite by ID and process JSON response', () => {
    const returnedFavorite = {
      id: 1,
      name: "Home",
      user: { id: 1, firstname: "John", lastname: "Doe" },
      location: {id: 10, latitude: 48.2082, longitude: 16.3738, elevation: 200, name: "Vienna", icao: "LOWW"}
    };

    service.getFavorite(1).subscribe(data => {
      expect(data.id).toBe(1);
      expect(data.location.name).toBe("Vienna");
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/1`);
    expect(req.request.method).toBe('GET');
    req.flush(returnedFavorite);
  });

  it('should return an error when getFavorite fails due to missing favorite', () => {
    service.getFavorite(99).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/99`);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('should return an error when getFavorite fails due to invalid input', () => {
    service.getFavorite(0).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('Favorite id must be greater than 0.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/0`);
    expect(req.request.method).toBe('GET');
    req.flush('Favorite id must be greater than 0.', { status: 400, statusText: 'Bad request' });
  });

  it('should return an error when getFavorite fails due to server error', () => {
    service.getFavorite(1).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/1`);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 500, statusText: 'Internal server error' });
  });

  it('should create a new favorite and process JSON response', () => {
    const sentFavorite: Favorite = {
      name: "Vacation",
      user: { id: 1 },
      location: { name: "New York" }
    };

    const responseJson = {
      id: 3,
      name: "Vacation",
      user: { id: 1, firstname: "John", lastname: "Doe" },
      location: { id: 12, latitude: 40.7128, longitude: -74.0060, elevation: 10, name: "New York", icao: "JFK" }
    };

    service.createFavorite(sentFavorite).subscribe(data => {
      expect(data.id).toBe(3);
      expect(data.location.icao).toBe("JFK");
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites`);
    expect(req.request.method).toBe('POST');
    req.flush(responseJson);
  });

  it('should return an error when createFavorite fails due to empty name', () => {
    //name or location = null not possible -> no tests for these cases
    const newFavorite: Favorite = {
      name: "",
      user: { id: 1 },
      location: { name: "Test Location" }
    };

    service.createFavorite(newFavorite).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('Name and location must be provided.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites`);
    expect(req.request.method).toBe('POST');
    req.flush('Name and location must be provided.', { status: 400, statusText: 'Bad Request' });
  });

  it('should return an error when createFavorite fails due to already existing name or location', () => {
    const newFavorite: Favorite = {
      name: "Test",
      user: { id: 1 },
      location: { name: "Test Location" }
    };

    service.createFavorite(newFavorite).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 400, statusText: 'Bad Request' });
  });

  it('should return an error when createFavorite fails due to a server error', () => {
    const newFavorite: Favorite = {
      name: "Test",
      user: { id: 1 },
      location: { name: "Test Location" }
    };

    service.createFavorite(newFavorite).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites`);
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 500, statusText: 'Internal server error' });
  });

  it('should delete a favorite and return success response', () => {
    service.deleteFavorite(1).subscribe(data => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should return an error when deleteFavorite fails due to missing favorite', () => {
    service.deleteFavorite(99).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/99`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 404, statusText: 'Not found' });
  });

  it('should return an error when deleteFavorite fails due to invalid input', () => {
    service.deleteFavorite(0).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('Favorite id must be greater than 0.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/0`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Favorite id must be greater than 0.', { status: 404, statusText: 'Bad request' });
  });

  it('should return an error when deleteFavorite fails due to a server error', () => {
    service.deleteFavorite(1).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (err) => expect(err.message).toContain('An unexpected error occurred.')
    });

    const req = httpMock.expectOne(`${environment.backendBaseUrl}/favorites/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 500, statusText: 'Internal server error' });
  });
});
