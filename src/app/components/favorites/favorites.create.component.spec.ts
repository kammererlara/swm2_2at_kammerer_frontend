import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesComponent } from './favorites.component';
import {favoritesService} from '../../services/favorites.service';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of, throwError} from 'rxjs';
import {By} from '@angular/platform-browser';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let mockFavoritesService: jasmine.SpyObj<favoritesService>;

  beforeEach(async () => {
    mockFavoritesService = jasmine.createSpyObj('favoritesService', ['getFavoritesforDefaultUser', 'createFavorite']);
    mockFavoritesService.getFavoritesforDefaultUser.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, FavoritesComponent],
      declarations: [],
      providers: [
        FormBuilder,
        { provide: favoritesService, useValue: mockFavoritesService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a name input field', () => {
    const nameInput = fixture.debugElement.query(By.css('input#name'));
    expect(nameInput).toBeTruthy();
  });

  it('should contain a location name input field', () => {
    const locationInput = fixture.debugElement.query(By.css('input#locationName'));
    expect(locationInput).toBeTruthy();
  });

  it('should contain a submit button', () => {
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"].btn.btn-primary'));
    expect(submitButton).toBeTruthy();
  });

  it('should update the form when inputs change', () => {
    const nameInput = fixture.debugElement.query(By.css('input#name')).nativeElement;
    const locationInput = fixture.debugElement.query(By.css('input#locationName')).nativeElement;

    nameInput.value = 'Test Favorite';
    nameInput.dispatchEvent(new Event('input'));

    locationInput.value = 'Vienna';
    locationInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(component.favoriteForm.value).toEqual({
      name: 'Test Favorite',
      location: { name: 'Vienna' },
      user: { id: 1 }
    });
  });

  it('should initialize the form with empty values', () => {
    expect(component.favoriteForm.value).toEqual({
      name: '',
      location: { name: '' },
      user: { id: 1 }
    });
  });

  it('should load favorites on init', () => {
    const mockFavorites =
      [{ id: 1, name: 'Test Favorite', location: { name: 'Vienna' }, user: { id: 1 } },
        { id: 2, name: 'Test2 Favorite', location: { name: 'Graz' }, user: { id: 1 } }];
    mockFavoritesService.getFavoritesforDefaultUser.and.returnValue(of(mockFavorites));

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockFavoritesService.getFavoritesforDefaultUser).toHaveBeenCalled();
    expect(component.favorites).toEqual(mockFavorites);
  });

  it('should call createFavorite on form submit and reload favorites with success message', () => {
    const mockFavorite = { name: 'Test Favorite', location: { name: 'Vienna' }, user: { id: 1 } };
    mockFavoritesService.createFavorite.and.returnValue(of(mockFavorite));
    spyOn(window, 'alert');
    spyOn(component, 'loadFavorites');

    component.favoriteForm.setValue(mockFavorite);
    component.onSubmit();

    expect(mockFavoritesService.createFavorite).toHaveBeenCalledWith(mockFavorite);
    expect(window.alert).toHaveBeenCalledWith('Favorite successfully created!');
    expect(component.loadFavorites).toHaveBeenCalled();
  });

  it('should handle errors when creating a favorite with error message', () => {
    const errorResponse = { error: 'Creation failed' };
    mockFavoritesService.createFavorite.and.returnValue(throwError(() => errorResponse));
    spyOn(window, 'alert');

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Error: Creation failed');
  });
});
