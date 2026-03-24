export interface Fermata
{
  order: number;
  city: string;
  address: string;
  time: number | null; // null per il capolinea
}

export interface LineaTrasporto
{
  line: string;
  stops: Fermata[];
}
