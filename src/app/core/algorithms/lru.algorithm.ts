import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

/**
 * LRU — Least Recently Used (Menos Recientemente Usado)
 *
 * TODO PARA EL EQUIPO:
 *   selectVictim: encontrar el frame cuya página tenga el valor MENOR de lastUsed.
 *
 *   let victim = -1;
 *   let minLastUsed = Infinity;
 *   for (let i = 0; i < 100; i++) {
 *     const page = state.ram[i];
 *     if (page && page.lastUsed < minLastUsed) {
 *       minLastUsed = page.lastUsed;
 *       victim = i;
 *     }
 *   }
 *   return victim;
 *
 *   onPageLoaded / onPageAccessed / onPageEvicted no hacen nada porque
 *   lastUsed ya es actualizado por el servicio MMU en cada acceso.
 */
export class LruAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'LRU';

  reset(): void {}

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    // TODO: retornar el frame con el menor valor de page.lastUsed
    return state.ram.findIndex((p) => p !== null); // stub
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
}
