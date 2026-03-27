import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LineService } from '../line-service';
import { Line } from '../model/entities';

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

  constructor(
    private lineService: LineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateStats();
    this.startAnimations();
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

  startAnimations() {
    const allLines = this.lineService.getLines();

    const targetLines = allLines.length;
    const targetStops = allLines.reduce((acc: number, line: any) => acc + (line.stops?.length || 0), 0);
    const targetDrivers = targetLines > 0 ? targetLines * 2 : 0;

    // Facciamo partire le animazioni (ho aumentato leggermente la durata per vederle meglio)
    this.animateValue('activeLinesCount', targetLines, 1000);
    this.animateValue('totalStopsCount', targetStops, 1500);
    this.animateValue('driversCount', targetDrivers, 1000);
  }

  // Funzione magica per l'animazione
  animateValue(prop: 'activeLinesCount' | 'totalStopsCount' | 'driversCount', target: number, duration: number) {
    if (target <= 0) {
      this[prop] = 0;
      return;
    }

    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calcoliamo il valore attuale
      this[prop] = Math.floor(progress * target);

      // 2. FONDAMENTALE: Diciamo ad Angular di aggiornare la grafica ORA
      this.cdr.detectChanges();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this[prop] = target;
        this.cdr.detectChanges();
      }
    };

    requestAnimationFrame(update);
  }
}
