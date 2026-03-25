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
  stopForm = new FormGroup({
    city: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    time: new FormControl<number | null>(null, [Validators.min(1)])
  });

  addStop() {
    if (this.stopForm.valid) {
      const newStop: Fermata = {
        order: this.lineData.stops.length + 1,
        city: this.stopForm.value.city!,
        address: this.stopForm.value.address!,
        time: this.stopForm.value.time ?? 0
      };

      this.lineData.stops.push(newStop);
      this.stopForm.reset();
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

