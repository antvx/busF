import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stop, Line } from './model/entities'; // Importa la tua interfaccia

@Injectable({
  providedIn: 'root' // Lo rende disponibile in tutta l'app
})
export class LineService {
  // Il nostro "Database" temporaneo
  private lines: Line[] = [
    {
      line: '2208',
      stops: [
        { order: 1, city: 'Monza', address: 'Piazza Stazione', time: null },
        { order: 2, city: 'Monza', address: 'Via Visconti', time: 10 },
        { order: 3, city: 'Villasanta', address: 'Via Roma', time: 15 }
      ],
      trips: [
        {
          id: 1,
          start: '07:30',
          day: { date: '', dayType: 'ferial', season: 'summer' }
        },
        {
          id: 2,
          start: '08:30',
          day: { date: '', dayType: 'ferial', season: 'summer' }
        },
        {
          id: 3,
          start: '09:00',
          day: { date: '', dayType: 'festive', season: 'summer' }
        }
      ]
    },
    {
      line: '2209',
      stops: [
        { order: 1, city: 'Sesto SG', address: 'FS / M1', time: null },
        { order: 2, city: 'Monza', address: 'Via Milano', time: 20 }
      ]
    }
  ];

  // Metodo per avere tutte le linee (per la Dashboard)
  getLines() {
    // Restituiamo una copia profonda per essere sicuri che nessuno modifichi l'originale per sbaglio
    return JSON.parse(JSON.stringify(this.lines));
  }

  // Metodo per avere una singola linea (per LineComponent)
  getLineById(id: string): Line | undefined {
    const line = this.lines.find(l => l.line === id);
    return line ? JSON.parse(JSON.stringify(line)) : undefined;
  }

  // Metodo per aggiornare i dati (quando premi "Salva")
  updateLine(updatedLine: Line) {
    // 1. Cerchiamo l'indice della linea nell'array originale
    const index = this.lines.findIndex(l => l.line === updatedLine.line);

    if (index !== -1) {
      // 2. SOVRASCRIVIAMO l'elemento esistente con una copia pulita
      // Usiamo lo spread operator {...} per rompere ogni legame di riferimento
      this.lines[index] = JSON.parse(JSON.stringify(updatedLine));
      console.log('✅ Service: Linea ' + updatedLine.line + ' aggiornata nell\'array master');
    } else {
      // 3. Se non esiste (es: hai generato una linea -R), la AGGIUNGIAMO
      this.lines.push(JSON.parse(JSON.stringify(updatedLine)));
      console.log('➕ Service: Nuova linea ' + updatedLine.line + ' creata nel master');
    }

    // Log di controllo: guarda la console del browser per vedere se l'array è cambiato davvero
    console.log('Stato attuale del database in memoria:', this.lines);
  }

  deleteLine(lineId: string) {
    const index = this.lines.findIndex(l => l.line === lineId);
    if (index !== -1) {
      this.lines.splice(index, 1);
      console.log(`✅ Linea ${lineId} eliminata dal Service`);
    }
  }

  addLine(name: string): boolean {
    // Verifichiamo se esiste già una linea con lo stesso nome per evitare duplicati
    const exists = this.lines.some(l => l.line === name);

    if (!exists && name.trim() !== '') {
      this.lines.push({
        line: name,
        stops: [] // Inizia vuota come richiesto
      });
      return true;
    }
    return false;
  }
}
