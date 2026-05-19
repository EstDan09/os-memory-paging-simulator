import { Component, Input } from '@angular/core';
import { AlgorithmState } from '../../../../core/models/simulation-state.model';
import { Page } from '../../../../core/models/page.model';
import { getPidColorAlpha } from '../../../../core/utils/color.utils';

@Component({
  selector: 'app-mmu-table',
  standalone: true,
  templateUrl: './mmu-table.component.html',
  styleUrl: './mmu-table.component.scss',
})
export class MmuTableComponent {
  @Input({ required: true }) state!: AlgorithmState;

  get sortedPages(): Page[] {
    return Array.from(this.state.allPages.values()).sort((a, b) => a.id - b.id);
  }

  rowBg(page: Page): string {
    return getPidColorAlpha(page.pid, page.inRam ? 0.25 : 0.08);
  }

  dAddr(page: Page): string {
    // Mostrar dirección de disco solo para páginas virtuales
    return page.inRam ? '' : String(page.diskAddress);
  }

  mAddr(page: Page): string {
    return page.frameIndex !== null ? String(page.frameIndex) : '';
  }

  loadedT(page: Page): string {
    return page.inRam ? `${page.loadedAt}s` : '';
  }

  markDisplay(page: Page): string {
    return page.mark ? '1' : '';
  }
}
