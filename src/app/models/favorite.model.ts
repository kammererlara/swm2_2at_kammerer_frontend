export interface Favorite {
  id?: number;
  name: string;
  user: User;
  location: Location;
}

export interface User {
  id?: number;
  firstname?: string;
  lastname?: string;
}

export interface Location {
  id?: number;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  name: string;
  icao?: string;
}
