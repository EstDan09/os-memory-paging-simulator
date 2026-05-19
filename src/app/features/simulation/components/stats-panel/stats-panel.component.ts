import { Component, Input } from '@angular/core';
import { AlgorithmState } from '../../../../core/models/simulation-state.model';

const PAGE_SIZE_KB = 4;
const RAM_TOTAL_KB = 400;

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  templateUrl: './stats-panel.component.html',
  styleUrl: './stats-panel.component.scss',
})
export class StatsPanelComponent {
  @Input({ required: true }) state!: AlgorithmState;

  get ramKB(): number {
    return this.state.ram.filter((p) => p !== null).length * PAGE_SIZE_KB;
  }

  get ramPercent(): number {
    return Math.round((this.ramKB / RAM_TOTAL_KB) * 100);
  }

  get vramKB(): number {
    let count = 0;
    for (const page of this.state.allPages.values()) {
      if (!page.inRam) count++;
    }
    return count * PAGE_SIZE_KB;
  }

  /** V-RAM % is relative to total RAM (400 KB) — can exceed 100%. */
  get vramPercent(): number {
    return Math.round((this.vramKB / RAM_TOTAL_KB) * 100);
  }

  get pagesLoaded(): number {
    return this.state.ram.filter((p) => p !== null).length;
  }

  get pagesUnloaded(): number {
    return this.state.allPages.size - this.pagesLoaded;
  }

  get runningProcesses(): number {
    let count = 0;
    for (const p of this.state.processes.values()) {
      if (!p.killed) count++;
    }
    return count;
  }

  get thrashingPercent(): number {
    if (this.state.clock === 0) return 0;
    return Math.round((this.state.thrashingTime / this.state.clock) * 100);
  }

  get thrashingIsHigh(): boolean {
    return this.thrashingPercent > 50;
  }

  /** Internal fragmentation: wasted bytes in currently loaded pages. */
  get fragmentationKB(): number {
    let wasted = 0;
    for (const page of this.state.allPages.values()) {
      if (page.inRam) wasted += 4096 - page.usedBytes;
    }
    return Math.round(wasted / 1024);
  }
}
