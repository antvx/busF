export interface Stop
{
  order: number;
  city: string;
  address: string;
  time: number | null; // Minuti dalla fermata precedente, null per il capolinea
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
  line?: Line;
  day: Day;
}

export interface Day {
  date: string;     // DD-MM-YYYY
  dayType: 'ferial' | 'festive' | 'both';
  season: 'summer' | 'winter';
}
