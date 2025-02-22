import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesComponent } from './favorites.component';
import { favoritesService } from '../../services/favorites.service';
import { By } from '@angular/platform-browser';
import {of, throwError} from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('FavoritesComponent - List Tests', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let mockFavoritesService: jasmine.SpyObj<favoritesService>;

  beforeEach(async () => {
    mockFavoritesService = jasmine.createSpyObj('favoritesService', ['getFavoritesforDefaultUser', 'deleteFavorite']);
    mockFavoritesService.getFavoritesforDefaultUser.and.returnValue(of([
      { id: 1, name: 'Test Favorite 1', location: { name: 'Vienna' }, user: { id: 1 } },
      { id: 2, name: 'Test Favorite 2', location: { name: 'Graz' }, user: { id: 1 } }
    ]));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FavoritesComponent],
      providers: [{ provide: favoritesService, useValue: mockFavoritesService }]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display a list of favorites', () => {
    const rows = fixture.debugElement.queryAll(By.css('.favoriteTable tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should display favorite names as links', () => {
    const links = fixture.debugElement.queryAll(By.css('.favoriteTable tbody tr td a'));
    expect(links.length).toBe(2);
    expect(links[0].nativeElement.textContent).toContain('Test Favorite 1');
    expect(links[1].nativeElement.textContent).toContain('Test Favorite 2');
  });

  it('should display a delete button for each favorite', () => {
    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    expect(deleteButtons.length).toBe(2);
  });

  it('should call deleteFavorite when delete button is clicked', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'onDelete');

    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    deleteButtons[0].nativeElement.click();

    expect(component.onDelete).toHaveBeenCalledWith(1);
  });

  it('should call deleteFavorite and reload favorites on delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(component, 'loadFavorites');
    const favoriteId = 1;
    mockFavoritesService.deleteFavorite.and.returnValue(of(undefined));

    component.onDelete(favoriteId);

    expect(mockFavoritesService.deleteFavorite).toHaveBeenCalledWith(favoriteId);
    expect(window.alert).toHaveBeenCalledWith('Favorite deleted successfully!');
    expect(component.loadFavorites).toHaveBeenCalled();
  });

  it('should handle errors when deleting a favorite', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(component, 'loadFavorites');
    const favoriteId = 1;
    const errorResponse = { error: 'Deletion failed' };
    mockFavoritesService.deleteFavorite.and.returnValue(throwError(() => errorResponse));

    component.onDelete(favoriteId);

    expect(window.alert).toHaveBeenCalledWith('Error deleting favorite.');
    expect(component.loadFavorites).not.toHaveBeenCalled();
  });

  it('should not call deleteFavorite if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const favoriteId = 1;

    component.onDelete(favoriteId);

    expect(mockFavoritesService.deleteFavorite).not.toHaveBeenCalledWith(favoriteId);
  });
});
