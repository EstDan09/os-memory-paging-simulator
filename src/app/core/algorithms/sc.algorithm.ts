import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';
export class ScAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'SC';

  private queue: number[] = [];

  reset(): void {
    this.queue = [];
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    const len = this.queue.length
    let currentPage;
    while (true) {

      currentPage = this.queue[0]
  
      if (!state.ram[currentPage]?.mark) return currentPage

      state.ram[currentPage]!.mark = 0
      this.queue.push(this.queue.shift() || -1)

    }
  }

  onPageLoaded(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    this.queue.push(frameIndex); 
    state.ram[frameIndex]!.mark = 0;
  }

  onPageAccessed(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    if (state.ram[frameIndex]) state.ram[frameIndex]!.mark = 1;
  }

  onPageEvicted(frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    const idx = this.queue.indexOf(frameIndex); 
    if (idx !== -1) this.queue.splice(idx, 1);
  }
}