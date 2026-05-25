import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

export class MruAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'MRU';

  reset(): void {}

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    let victim = -1;
    let maxLastUsed = -1;
    for (let i = 0; i < 100; i++) {
      const page = state.ram[i];
      if (page && page.lastUsed > maxLastUsed) {
        maxLastUsed = page.lastUsed;
        victim = i;
      }
    }
    return victim;
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
}
