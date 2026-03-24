import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Line } from './line/line';
import { HomePage } from "./home-page/home-page";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Line, HomePage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('busF');
}
