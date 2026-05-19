import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { StepLogEntry } from '../../../../core/models/simulation-state.model';

@Component({
  selector: 'app-step-log',
  standalone: true,
  templateUrl: './step-log.component.html',
  styleUrl: './step-log.component.scss',
})
export class StepLogComponent implements OnChanges {
  @Input({ required: true }) log: StepLogEntry[] = [];
  @Input({ required: true }) algName = '';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // Últimas 200 entradas para no saturar el DOM
  get displayed(): StepLogEntry[] {
    return this.log.slice(-200);
  }

  ngOnChanges(): void {
    // Auto-scroll al fondo cuando llega un nuevo paso
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  costLabel(cost: number): string {
    if (cost === 0) return '—';
    // Múltiples páginas → sumar costos
    const faults = cost >= 5 ? Math.floor(cost / 5) : 0;
    const hits   = cost % 5;
    if (faults > 0 && hits > 0) return `FAULT+HIT`;
    if (faults > 0)              return `FAULT`;
    return `HIT`;
  }
}
