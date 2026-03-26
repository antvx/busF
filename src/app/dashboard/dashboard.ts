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

  searchQuery: string = '';
  filteredLines: any[] = []; // Questa conterrà i risultati della ricerca

  suggestions: string[] = [];

  constructor(private lineService: LineService) {}

  ngOnInit() {
    // 1. Carichiamo tutte le linee dal Service (L'archivio)
    this.allLines = this.lineService.getLines().map((l: LineaTrasporto) => ({
      id: l.line,
      name: 'Linea ' + l.line,
      stopCount: l.stops.length
    }));

    // 2. DIAMO IL COMANDO DI COPIARE L'ARCHIVIO NELLA VETRINA
    // Siccome searchQuery è vuota "", onSearch mostrerà tutto.
    this.onSearch();
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

  // Metodo per filtrare le linee
  onSearch() {
    const query = this.searchQuery.toLowerCase().trim();
    this.suggestions = []; // Puliamo i vecchi suggerimenti ad ogni tasto premuto

    // 1. Se la barra è vuota, mostriamo tutto e usciamo
    if (!query) {
      this.filteredLines = this.allLines;
      return;
    }

    // 2. Filtriamo le linee in base alle fermate
    this.filteredLines = this.allLines.filter(line => {
      const fullLineData = this.lineService.getLineById(line.id);

      // Escludiamo linee senza dati o senza fermate
      if (!fullLineData || fullLineData.stops.length === 0) return false;

      // Troviamo TUTTE le fermate della linea che corrispondono alla query
      const matchingStops = fullLineData.stops.filter(stop =>
        stop.city.toLowerCase().includes(query) ||
        stop.address.toLowerCase().includes(query)
      );

      // Se abbiamo trovato almeno una fermata corrispondente:
      if (matchingStops.length > 0) {
        // Popoliamo i suggerimenti per il datalist
        matchingStops.forEach(s => {
          const text = `${s.city} - ${s.address}`;
          // Evitiamo di aggiungere lo stesso suggerimento più volte
          if (!this.suggestions.includes(text)) {
            this.suggestions.push(text);
          }
        });
        return true; // La linea compare nei risultati
      }

      return false; // Nessuna fermata corrisponde, la linea viene nascosta
    });
  }
}
