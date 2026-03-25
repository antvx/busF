import { Component } from '@angular/core';
import { Fermata, LineaTrasporto } from '../model/entities';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-line',
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './line.html',
  styleUrl: './line.css',
})
export class Line
{
  // I tuoi dati di prova
  lineData: LineaTrasporto = {
    line: "2208",
    stops: [
      { order: 1, city: "Monza", address: "Piazza Stazione", time: null },
      { order: 2, city: "Monza", address: "Via Lecco 10", time: 10 },
      { order: 3, city: "Monza", address: "Via Lecco 40", time: 40 },
      { order: 4, city: "Villasanta", address: "Via Edison", time: 10 }
    ]
  };

  // Form per aggiungere nuove fermate
  // Form aggiornato con il campo position
  stopForm = new FormGroup({
    city: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    time: new FormControl<number | null>(null, [Validators.min(1)]),
    // Aggiungiamo la posizione, partendo di default da 1
    position: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] })
  });

  get availablePositions(): number[] {
    // Se hai 3 fermate, restituisce [1, 2, 3, 4]
    const currentCount = this.lineData?.stops?.length || 0;
    return Array.from({ length: currentCount + 1 }, (_, i) => i + 1);
  }

  addStop() {
  if (this.stopForm.valid) {
    const formData = this.stopForm.value;
    // Recuperiamo la posizione scelta (es. 1, 2, 3)
    // e la trasformiamo in indice per l'array (0, 1, 2)
    const insertIndex = (formData.position ?? (this.lineData.stops.length + 1)) - 1;

    const newStop: Fermata = {
      order: 0, // Verrà impostato correttamente dal ricalcolo sotto
      city: formData.city!,
      address: formData.address!,
      // Se è la prima posizione forziamo null, altrimenti usiamo il valore inserito o 0
      time: insertIndex === 0 ? null : (formData.time ?? 10)
    };

    // Inseriamo la fermata nella posizione desiderata
    this.lineData.stops.splice(insertIndex, 0, newStop);

    // RICALCOLO: aggiorniamo gli ordini e la logica del tempo per tutta la lista
    this.lineData.stops = this.lineData.stops.map((stop, i) => {
      const isFirst = i === 0;
      return {
        ...stop,
        order: i + 1,
        // La nuova prima fermata è sempre Partenza
        // Se una vecchia partenza è stata spostata, le assegniamo un tempo di default (es. 10)
        time: isFirst ? null : (stop.time === null ? 10 : stop.time)
      };
    });

    // Reset del form: puliamo i campi ma prepariamo la 'position' per la prossima aggiunta in coda
    this.stopForm.reset({
      city: '',
      address: '',
      time: null,
      position: this.lineData.stops.length + 1
    });
  }
}

  // Bonus: Metodo per eliminare una fermata
  removeStop(index: number) {
    this.lineData.stops.splice(index, 1);
    // Ricalcola gli ordini dopo l'eliminazione
    this.lineData.stops.forEach((s, i) => s.order = i + 1);
  }

  generateReturnLine() {
    // 1. Creiamo una copia delle fermate attuali
    const forwardStops = [...this.lineData.stops];

    // 2. Prendiamo solo i minuti (escludendo il null) e li invertiamo
    // Esempio: se i tempi erano [null, 10, 40, 10], i 'gaps' invertiti sono [10, 40, 10]
    const travelTimes = forwardStops
      .map(s => s.time)
      .filter(t => t !== null)
      .reverse() as number[];

    // 3. Invertiamo l'ordine fisico delle fermate
    const reversedStops = forwardStops.reverse();

    // 4. Ricostruiamo la linea riassegnando i tempi invertiti
    const updatedReturnStops = reversedStops.map((stop, index) => {
      return {
        ...stop,
        order: index + 1,
        // La prima fermata è sempre 'null' (Partenza)
        // Le altre prendono il tempo dall'array invertito (index - 1)
        time: index === 0 ? null : travelTimes[index - 1]
      };
    });

    // 5. Aggiornamento finale del nome e dei dati
    this.lineData = {
      line: this.lineData.line.includes('-R')
            ? this.lineData.line.replace('-R', '')
            : this.lineData.line + "-R",
      stops: updatedReturnStops
    };
  }

  // Aggiungi questa variabile nella classe
  editingIndex: number | null = null;

  // Metodo per attivare la modifica
  startEdit(index: number) {
    this.editingIndex = index;
  }

  // Metodo per salvare e chiudere
  stopEdit() {
    this.editingIndex = null;
    // Qui potresti chiamare anche la funzione di salvataggio nel database o localStorage
    console.log("Dati aggiornati:", this.lineData.stops);
  }

  moveStop(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Controllo limiti (non posso andare sopra la prima o sotto l'ultima)
    if (targetIndex < 0 || targetIndex >= this.lineData.stops.length) return;

    // 1. Scambio le posizioni nell'array
    const stops = this.lineData.stops;
    [stops[index], stops[targetIndex]] = [stops[targetIndex], stops[index]];

    // 2. Ricalcolo gli ordini e sistemo il "Partenza" (null)
    this.lineData.stops = stops.map((stop, i) => ({
      ...stop,
      order: i + 1,
      // La nuova prima fermata diventa Partenza (null),
      // alle altre diamo un valore di default (es. 10) se erano null
      time: i === 0 ? null : (stop.time === null ? 10 : stop.time)
    }));
  }
}

