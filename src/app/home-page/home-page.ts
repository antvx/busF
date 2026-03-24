import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink], // Fondamentale per navigare tra le pagine
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage
{
  // Potresti aggiungere statistiche rapide qui in futuro
  stats = {
    activeLines: 12,
    totalStops: 145,
    driversOnDuty: 8
  };
}






