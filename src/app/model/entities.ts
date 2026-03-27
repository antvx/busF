export interface Stop
{
  order: number;
  city: string;
  address: string;
  time: number | null; // null per il capolinea
}

export interface Line
{
  line: string;
  stops: Stop[];
  trips?: Trip[];
}

export interface Trip
{
  id: number;
  start: string; // Formato HH:MM
  dayType: string;
  season: string;
  line?: Line;
  date: string; // Formato DD-MM-YYYY
}
