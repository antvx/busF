import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  // Somma minuti a un orario HH:MM e restituisce HH:MM
  calculateArrivalTime(startTime: string, totalMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + totalMinutes);

    return date.toTimeString().slice(0, 5); // Restituisce "HH:MM"
  }

  // Determina la stagione in base alla data
  getSeason(date: Date): 'summer' | 'winter' {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Primavera (21/3) + Estate (21/6) -> Summer
    // Autunno (21/9) + Inverno (21/12) -> Winter
    if ((month > 3 || (month === 3 && day >= 21)) && (month < 9 || (month === 9 && day < 21))) {
      return 'summer';
    }
    return 'winter';
  }
}
