export interface WeatherRecord {
  time: string;
  temperature: number;
  humidity: number;
}

export interface MetarData {
  raw?: string;
  temperature?: number;
  dewpoint?: number;
  humidity?: number;
}

export interface MetarResponse {
  raw?: string;
  temperature?: {
    repr?: string;
    spoken?: string;
    value?: number;
  };
  dewpoint?: {
    repr?: string;
    spoken?: string;
    value?: number;
  };
  relative_humidity?: number;
}
