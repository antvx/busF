import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { Dashboard } from './dashboard/dashboard';
import { Line } from './line/line';

export const routes: Routes = [
  { path: '', component: HomePage },            // La pagina vuota (homepage) mostra il menu
  { path: 'dashboard', component: Dashboard },  // Dashboard è la lista di tutte le linee
  { path: 'line/:id', component: Line },        // Questa URL mostrerà la tabella di ogni linea specifica
  { path: '**', redirectTo: '' }                // Se l'utente scrive una URL errata, torna in Home
];
