import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { Line } from './line/line';

export const routes: Routes = [
  { path: '', component: HomePage },            // La pagina vuota (homepage) mostra il menu
  { path: 'linea-gestione', component: Line },  // Questa URL mostrerà la tabella
  { path: '**', redirectTo: '' }                // Se l'utente scrive una URL errata, torna in Home
];
