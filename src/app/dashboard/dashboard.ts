import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LineService } from '../line-service'; // Importa il service
import { LineaTrasporto } from '../model/entities';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  /*// Simuliamo un database di linee
  allLines = [
    { id: '2208', name: 'Linea 2208', stopCount: 4 },
    { id: 'z221', name: 'Linea z221', stopCount: 12 },
    { id: 'z222', name: 'Linea z222', stopCount: 8 }
  ];*/

  allLines: any[] = [];
  newLineName: string = '';

  constructor(private lineService: LineService) {}

  ngOnInit() {
    this.allLines = this.lineService.getLines().map((l: LineaTrasporto) => ({
    id: l.line,
    name: 'Linea ' + l.line,
    stopCount: l.stops.length
    }));
  }

  removeLine(event: Event, lineId: string) {
    // 1. IMPORTANTE: Impediamo al click di attivare il routerLink della card
    event.stopPropagation();

    // 2. Chiediamo conferma all'utente
    const confirmDelete = confirm(`Sei sicuro di voler eliminare la linea ${lineId}?`);

    if (confirmDelete) {
      // 3. Eliminiamo dal Service
      this.lineService.deleteLine(lineId);

      // 4. Aggiorniamo la vista locale (filtriamo via la linea eliminata)
      this.allLines = this.allLines.filter(l => l.id !== lineId);
    }
  }

  addNewLine() {
    if (this.newLineName.trim()) {
      const success = this.lineService.addLine(this.newLineName);

      if (success) {
        // Rinfreschiamo la lista visualizzata
        this.allLines = this.lineService.getLines().map((l: LineaTrasporto) => ({
          id: l.line,
          name: 'Linea ' + l.line,
          stopCount: l.stops.length
        }));
        this.newLineName = ''; // Puliamo il campo dopo l'aggiunta
      } else {
        alert("Errore: La linea esiste già o il nome non è valido.");
      }
    }
  }
}
