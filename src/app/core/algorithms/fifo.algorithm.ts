import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

export class FifoAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'FIFO';

  // Cola de frames en orden de llegada — el más antiguo está en [0]
  private queue: number[] = [];

  reset(): void {
    this.queue = [];
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    // El frame que lleva más tiempo en RAM es queue[0]
    if (this.queue.length > 0) return this.queue[0];
    return state.ram.findIndex((p) => p !== null); // fallback
  }

  onPageLoaded(frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    this.queue.push(frameIndex);
  }

  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    // FIFO no cambia el orden al acceder una página
  }

  onPageEvicted(frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    const idx = this.queue.indexOf(frameIndex);
    if (idx !== -1) this.queue.splice(idx, 1);
  }
}
