export type LineShort = 'Red' | 'Orange' | 'Green' | 'Blue' | 'Bus';

export type SlowZone = {
  start: string;
  end: string;
  mean_metric: number;
  duration: number;
  baseline: number;
  delay: number;
  color: Exclude<LineShort, 'Bus'>;
  fr_id: string;
  to_id: string;
};

export interface StopGeoJson {
  type: string;
  features: Stop[];
}
export interface Stop {
  type: string;
  geometry: StopGeometry;
  properties: StopProperties;
}

export interface StopProperties {
  STATION: string;
  LINE: string;
  TERMINUS: string;
  ROUTE: string;
}

export interface StopGeometry {
  type: string;
  coordinates: number[];
}

export interface LineGeoJson {
  type: string;
  features: Line[];
}

export interface Line {
  type: string;
  geometry: LineGeometry;
  properties: LineProperties;
}

export interface LineProperties {
  LINE: string;
  ROUTE: string;
  GRADE: number;
  SHAPE_LEN: number;
}

export interface LineGeometry {
  type: string;
  coordinates: (number[] | number)[][];
}
