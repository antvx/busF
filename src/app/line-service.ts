import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fermata as Stop } from './model/entities'; // Importa la tua interfaccia

@Injectable({ providedIn: 'root' })
export class LineService {
  private apiUrl = 'http://tuo-backend.com/api/lines/2208'; // L'URL del tuo backend

  constructor(private http: HttpClient) {}

  // Recupera i dati dal database
  getLineData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Esempio: Salva una nuova fermata sul database
  saveStop(newStop: Stop): Observable<Stop> {
    return this.http.post<Stop>(`${this.apiUrl}/stops`, newStop);
  }
}
