import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SimulationEngineService } from '../../core/services/simulation-engine.service';
import { SimulationState } from '../../core/models/simulation-state.model';
import { RamBarComponent } from './components/ram-bar/ram-bar.component';
import { MmuTableComponent } from './components/mmu-table/mmu-table.component';
import { StatsPanelComponent } from './components/stats-panel/stats-panel.component';
import { StepLogComponent } from './components/step-log/step-log.component';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [RamBarComponent, MmuTableComponent, StatsPanelComponent, StepLogComponent, RouterLink],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss',
})
export class SimulationComponent implements OnInit, OnDestroy {
  state: SimulationState | null = null;
  speedLevel = 2; // 1 = más lento, 10 = más rápido

  private sub!: Subscription;

  constructor(
    private engine: SimulationEngineService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sub = this.engine.state$.subscribe((s) => {
      this.state = s;
      this.cdr.detectChanges();
    });
    if (!this.state) {
      this.router.navigate(['/setup']);
      return;
    }
    this.engine.play(); // autoplay al entrar a la pantalla de simulación
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  togglePlay(): void {
    if (!this.state) return;
    this.state.isRunning ? this.engine.pause() : this.engine.play();
  }

  stepOnce(): void {
    this.engine.step();
  }

  onSpeedChange(event: Event): void {
    const level = parseInt((event.target as HTMLInputElement).value);
    this.speedLevel = level;
    // Mapeo exponencial: nivel 1 → 1500ms, nivel 10 → 50ms
    const ms = Math.round(1500 * Math.pow(50 / 1500, (level - 1) / 9));
    this.engine.setSpeed(ms);
  }

  goBack(): void {
    this.engine.reset();
    this.router.navigate(['/setup']);
  }

  get progressPercent(): number {
    if (!this.state || this.state.totalSteps === 0) return 0;
    return Math.round((this.state.currentStep / this.state.totalSteps) * 100);
  }

  get optAdvantage(): number {
    if (!this.state) return 0;
    return this.state.algState.clock - this.state.optState.clock;
  }
}
