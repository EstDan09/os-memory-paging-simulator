import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

export class LruAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'LRU';

  reset(): void {}

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    let victim = -1;
    let minLastUsed = Infinity;
    for (let i = 0; i < 100; i++) {
      const page = state.ram[i];
      if (page && page.lastUsed < minLastUsed) {
        minLastUsed = page.lastUsed;
        victim = i;
      }
    }
    return victim;
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
}
