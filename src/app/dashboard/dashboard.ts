import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // Simuliamo un database di linee
  allLines = [
    { id: '2208', name: 'Linea 2208', stopCount: 4 },
    { id: 'z221', name: 'Linea z221', stopCount: 12 },
    { id: 'z222', name: 'Linea z222', stopCount: 8 }
  ];
}







