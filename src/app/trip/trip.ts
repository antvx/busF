import { Component, Input, OnInit } from '@angular/core';
import { Day, Line, Trip } from '../model/entities';
import { TripService } from '../trip-service';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-trip',
  imports: [FormsModule, UpperCasePipe],
  templateUrl: './trip.html',
  styleUrl: './trip.css',
})
export class TripComponent implements OnInit {
  @Input() lineData!: Line;

  selectedDate: string = new Date().toISOString().split('T')[0];
  currentDayInfo!: Day;
  filteredTrips: any[] = [];
  totalDuration: number = 0;

  // Limite massimo di prenotazione/visualizzazione: 6 mesi da oggi
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = '';

  ngOnInit() {
    const d = new Date();
    d.setMonth(d.getMonth() + 6); // Impostiamo il limite a +6 mesi
    this.maxDate = d.toISOString().split('T')[0];

    this.updateDisplay();
  }

  updateDisplay() {
    const dateObj = new Date(this.selectedDate);

    // Calcoliamo i metadati del giorno basandoci sulla data selezionata
    this.currentDayInfo = {
      date: dateObj.toLocaleDateString('it-IT'),
      season: this.getSeason(dateObj),
      dayType: this.getDayType(dateObj)
    };

    // Calcolo durata totale (somma minuti fermate)
    this.totalDuration = this.lineData.stops.reduce((acc, s) => acc + (s.time || 0), 0);

    // Filtriamo le corse
    if (this.lineData.trips) {
      this.filteredTrips = this.lineData.trips
        .filter(t => this.isTripValidForDay(t))
        .map(t => ({
          ...t,
          arrival: this.calculateArrivalTime(t.start, this.totalDuration)
        }))
        .sort((a, b) => a.start.localeCompare(b.start));
    }
  }

  // RISOLUZIONE ERRORE: Metodo per validare la corsa
  isTripValidForDay(trip: Trip): boolean {
    const selectedDayType = this.currentDayInfo.dayType;
    const selectedSeason = this.currentDayInfo.season;

    // Una corsa è valida se la sua stagione coincide
    const seasonMatch = trip.day.season === selectedSeason;

    // Logica 'both': se la corsa è di tipo 'both', appare sempre.
    // Altrimenti deve coincidere col tipo di giorno (feriale/festivo)
    const typeMatch = trip.day.dayType === 'both' || trip.day.dayType === selectedDayType;

    return seasonMatch && typeMatch;
  }

  getSeason(date: Date): 'summer' | 'winter' {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    // Estate (Primavera + Estate): dal 21 Marzo al 20 Settembre
    const isSpringSummer = (month > 3 || (month === 3 && day >= 21)) && (month < 9 || (month === 9 && day < 21));
    return isSpringSummer ? 'summer' : 'winter';
  }

  getDayType(date: Date): 'ferial' | 'festive' | 'both' {
    const day = date.getDay();
    return (day === 0 || day === 6) ? 'festive' : 'ferial';
    // Nota: 'both' verrebbe assegnato manualmente a date specifiche (es. festività locali)
  }

  calculateArrivalTime(startTime: string, duration: number): string {
    const [h, m] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return date.toTimeString().slice(0, 5);
  }
}
