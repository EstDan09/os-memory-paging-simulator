import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

export class LfuAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'LFU';

  //Para resolver empates usando FIFO
  private queue: number[] = [];

  constructor() {

  }

  reset(): void {
    this.queue = [];
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    
    let min = Infinity
    let minIndex = 0;
    for (let i = 0; i < this.queue.length; i++) {


      const el = state.ram[this.queue[i]]
      if (!el) continue;

      if (el && el.mark < min) {
        min = el.mark
        minIndex = i
      }
    }
    return this.queue[minIndex]
  }

  onPageLoaded(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    this.queue.push(frameIndex);
    state.ram[frameIndex]!.mark = 1;
  }

  onPageAccessed(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    state.ram[frameIndex]!.mark += 1;
  }

  onPageEvicted(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    state.ram[frameIndex]!.mark = 0;
    const idx = this.queue.indexOf(frameIndex);
    if (idx !== -1) this.queue.splice(idx, 1);
  }
}
