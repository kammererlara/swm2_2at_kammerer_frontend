import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Favorite} from '../../models/favorite.model';
import {favoritesService} from '../../services/favorites.service';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    RouterLink
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit{
  favoriteForm: FormGroup;
  favorites: Favorite[] = [];

  constructor(private fb: FormBuilder, private favoritesService: favoritesService) {
    this.favoriteForm = this.fb.group({
      name: '',
      location: this.fb.group({
        name: ''
      }),
      user: this.fb.group({
        id: 1
      })
    });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoritesService.getFavoritesforDefaultUser().subscribe({
      next: data => {
        this.favorites = data;
        console.log('Favorites loaded: ', this.favorites);
      },
      error: err => console.error('Error loading favorites: ', err)
    })
  }

  onSubmit() {
    console.log("Submit")
    const favorite: Favorite = {
      name: this.favoriteForm.value.name,
      location: {
        name: this.favoriteForm.value.location.name
      },
      user: {
        id: 1
      }
    };

    console.log('Favorite object to create:', JSON.stringify(favorite, null, 2));

    this.favoritesService.createFavorite(favorite).subscribe({
        next: () => {
          this.loadFavorites();
          this.favoriteForm.reset();
          alert('Favorite successfully created!');
        },
      error: (err) => {
        console.error('Error creating favorite:', err);
        if (err.error) {
          alert(`Error: ${err.error}`);
        } else {
          alert('An unexpected error occurred while creating the favorite.');
        }
      }
    })
  }

  onDelete(favoriteId: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this favorite?');
    if (confirmDelete) {
      this.favoritesService.deleteFavorite(favoriteId).subscribe({
        next: () => {
          console.log('Favorite deleted successfully');
          alert('Favorite deleted successfully!');
          this.loadFavorites();
        },
        error: err => {
          console.log(favoriteId);
          console.error('Error deleting favorite:', err);
          alert('Error deleting favorite.');
        }
      })
    }
  }
}
