import { Component } from '@angular/core';
import { Fermata, LineaTrasporto } from '../model/entities';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-line',
  imports: [ReactiveFormsModule, RouterLink],
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
}

