import { Component, Input } from '@angular/core';
import { AlgorithmState } from '../../../../core/models/simulation-state.model';
import { Page } from '../../../../core/models/page.model';
import { getPidColor } from '../../../../core/utils/color.utils';

@Component({
  selector: 'app-ram-bar',
  standalone: true,
  templateUrl: './ram-bar.component.html',
  styleUrl: './ram-bar.component.scss',
})
export class RamBarComponent {
  @Input({ required: true }) state!: AlgorithmState;

  frameColor(page: Page | null): string {
    return page ? getPidColor(page.pid) : '#1f2937';
  }

  frameTitle(page: Page | null, idx: number): string {
    if (!page) return `Frame ${idx} — empty`;
    return `Frame ${idx} | PID ${page.pid} | PTR ${page.ptr} | PAGE ${page.id} | ${page.usedBytes}B`;
  }

  get usedFrames(): number {
    return this.state.ram.filter((p) => p !== null).length;
  }

  get ramPercent(): number {
    return Math.round((this.usedFrames / 100) * 100);
  }
}
