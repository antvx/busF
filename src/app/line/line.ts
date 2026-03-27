import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Stop, Line as LineEntity } from '../model/entities';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LineService } from '../line-service';

@Component({
  selector: 'app-line',
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './line.html',
  styleUrl: './line.css',
})
export class Line implements OnInit
{
  isSaving = false;
  showSuccessToast = false;

  // Inizializziamo con un oggetto vuoto "sicuro" o lasciamolo gestire al Service
  lineData: LineEntity = {
    line: "",
    stops: []
  };

  cities: string[] = [
    'Monza',
    'Milano',
    'Villasanta',
    'Sesto San Giovanni',
    'Cinisello Balsamo',
    'Lissone',
    'Desio'
  ];

  constructor(
    private route: ActivatedRoute,
    private lineService: LineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = this.lineService.getLineById(id);
      if (data) {
        // Ora carichiamo i dati REALI dal Service (z221, 2208, ecc.)
        this.lineData = JSON.parse(JSON.stringify(data));
      } else {
        // Se l'ID non esiste, possiamo dare un nome di default
        this.lineData.line = id;
      }
    }
  }

  // Modifica il tuo metodo saveToDatabase (quello del tasto salva)
  saveToDatabase() {
    console.log("Inizio salvataggio...");
    this.isSaving = true; // Qui il tasto diventa "disabilitato" (cursore divieto)

    try {
      // 1. Salviamo i dati nel Service
      this.lineService.updateLine(this.lineData);

      // 2. Dopo un piccolo delay per dare feedback visivo
      setTimeout(() => {
        this.isSaving = false;        // Sblocca il tasto (il cursore torna normale)
        this.showSuccessToast = true; // Mostra il toast verde
        console.log("Salvataggio completato!");

        // FORZA l'aggiornamento della grafica
        this.cdr.detectChanges();

        // 3. Nascondi il toast dopo 3 secondi
        setTimeout(() => {
          this.showSuccessToast = false;
          this.cdr.detectChanges(); // Forza di nuovo quando sparisce il toast
        }, 3000);
      }, 500);

    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      this.isSaving = false; // Sblocca il tasto anche in caso di errore!
      this.cdr.detectChanges();
    }
  }

  // Form per aggiungere nuove fermate
  // Form aggiornato con il campo position
  stopForm = new FormGroup({
    city: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    time: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    // Aggiungiamo la posizione, partendo di default da 1
    position: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] })
  }, {
      // Aggiungiamo un validatore a livello di intero gruppo (FormGroup)
      validators: (group) => {
        const city = group.get('city')?.value;
        const address = group.get('address')?.value;

        if (this.isDuplicateStop(city, address)) {
          return { duplicateStop: true };
        }
        return null;
      }
  });

  get availablePositions(): number[] {
    // Se hai 3 fermate, restituisce [1, 2, 3, 4]
    const currentCount = this.lineData?.stops?.length || 0;
    return Array.from({ length: currentCount + 1 }, (_, i) => i + 1);
  }

  addStop() {
    const formData = this.stopForm.value;

    // Protezione finale: se è un duplicato, non procedere
    if (this.isDuplicateStop(formData.city!, formData.address!)) {
      alert('Errore: questa fermata è già presente nel percorso.');
      return;
    }

    if (this.stopForm.valid) {

      // Recuperiamo la posizione scelta (es. 1, 2, 3)
      // e la trasformiamo in indice per l'array (0, 1, 2)
      const insertIndex = (formData.position ?? (this.lineData.stops.length + 1)) - 1;

      const newStop: Stop = {
        order: 0, // Verrà impostato correttamente dal ricalcolo sotto
        city: formData.city!,
        address: formData.address!,
        // 1. Se è la prima posizione (indice 0), il tempo DEVE essere null (Partenza)
        // 2. Altrimenti, usiamo ESCLUSIVAMENTE il valore del form (formData.time)
        time: insertIndex === 0 ? null : formData.time!
      };

      // Inseriamo la fermata nella posizione desiderata
      this.lineData.stops.splice(insertIndex, 0, newStop);

      // RICALCOLO: aggiorniamo gli ordini e la logica del tempo per tutta la lista
      this.lineData.stops = this.lineData.stops.map((stop, i) => {
        const isFirst = i === 0;
        return {
          ...stop,
          order: i + 1,
          // La nuova prima fermata è sempre Partenza
          // Se una vecchia partenza è stata spostata, le assegniamo un tempo di default (es. 10)
          time: isFirst ? null : (stop.time === null ? 10 : stop.time)
        };
      });

      const lastCity = formData.city; // Salviamo la città appena usata

      // Reset del form: puliamo i campi ma prepariamo la 'position' per la prossima aggiunta in coda
      this.stopForm.reset({
        city: lastCity, // La riproponiamo per la prossima fermata
        address: '',
        time: null,
        position: this.lineData.stops.length + 1
      });
    }
}

  // Bonus: Metodo per eliminare una fermata
  removeStop(index: number) {
    this.lineData.stops.splice(index, 1);
    // Ricalcola gli ordini dopo l'eliminazione
    this.lineData.stops.forEach((s, i) => s.order = i + 1);
  }

  generateReturnLine() {
    // 1. Creiamo una copia delle fermate attuali
    const forwardStops = [...this.lineData.stops];

    // 2. Prendiamo solo i minuti (escludendo il null) e li invertiamo
    // Esempio: se i tempi erano [null, 10, 40, 10], i 'gaps' invertiti sono [10, 40, 10]
    const travelTimes = forwardStops
      .map(s => s.time)
      .filter(t => t !== null)
      .reverse() as number[];

    // 3. Invertiamo l'ordine fisico delle fermate
    const reversedStops = forwardStops.reverse();

    // 4. Ricostruiamo la linea riassegnando i tempi invertiti
    const updatedReturnStops = reversedStops.map((stop, index) => {
      return {
        ...stop,
        order: index + 1,
        // La prima fermata è sempre 'null' (Partenza)
        // Le altre prendono il tempo dall'array invertito (index - 1)
        time: index === 0 ? null : travelTimes[index - 1]
      };
    });

    // 5. Aggiornamento finale del nome e dei dati
    this.lineData = {
      line: this.lineData.line.includes('-R')
            ? this.lineData.line.replace('-R', '')
            : this.lineData.line + "-R",
      stops: updatedReturnStops
    };
  }

  // Aggiungi questa variabile nella classe
  editingIndex: number | null = null;

  // Metodo per attivare la modifica
  startEdit(index: number) {
    this.editingIndex = index;
  }

  // Metodo per salvare e chiudere
  stopEdit() {
    this.editingIndex = null;
    // Qui potresti chiamare anche la funzione di salvataggio nel database o localStorage
    console.log("Dati aggiornati:", this.lineData.stops);
  }

  moveStop(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Controllo limiti (non posso andare sopra la prima o sotto l'ultima)
    if (targetIndex < 0 || targetIndex >= this.lineData.stops.length) return;

    // 1. Scambio le posizioni nell'array
    const stops = this.lineData.stops;
    [stops[index], stops[targetIndex]] = [stops[targetIndex], stops[index]];

    // 2. Ricalcolo gli ordini e sistemo il "Partenza" (null)
    this.lineData.stops = stops.map((stop, i) => ({
      ...stop,
      order: i + 1,
      // La nuova prima fermata diventa Partenza (null),
      // alle altre diamo un valore di default (es. 10) se erano null
      time: i === 0 ? null : (stop.time === null ? 10 : stop.time)
    }));
  }

  // Controlla se esiste già una fermata con stessa città e indirizzo
  isDuplicateStop(city: string | null, address: string | null): boolean {
    if (!city || !address) return false;

    return this.lineData.stops.some(stop =>
      stop.city.toLowerCase() === city.toLowerCase() &&
      stop.address.toLowerCase() === address.toLowerCase()
    );
  }
}
