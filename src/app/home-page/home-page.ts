import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LineService } from '../line-service';
import { LineaTrasporto } from '../model/entities';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink], // Fondamentale per navigare tra le pagine
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit
{
  activeLinesCount: number = 0;
  totalStopsCount: number = 0;
  driversCount: number = 8; // Per ora lo teniamo fisso a 8 o lo calcoliamo se hai una lista autisti

  constructor(private lineService: LineService) {}

  ngOnInit() {
    this.updateStats();
  }

  updateStats() {
    const allLines: any[] = this.lineService.getLines();

    // 1. Conteggio Linee Attive
    this.activeLinesCount = allLines.length;

    // 2. Conteggio Fermate Totali (Risoluzione errore TS)
    // Specifichiamo che acc è un number e line è any (o LineaTrasporto)
    this.totalStopsCount = allLines.reduce((acc: number, line: any) => {
      return acc + (line.stops ? line.stops.length : 0);
    }, 0);

    // 3. Autisti in Servizio
    // Possiamo renderlo dinamico basandoci sulle linee (es. 2 autisti per ogni linea attiva)
    this.driversCount = this.activeLinesCount * 2;
  }
}
