import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

/**
 * MRU — Most Recently Used (Más Recientemente Usado)
 *
 * TODO PARA EL EQUIPO:
 *   selectVictim: encontrar el frame cuya página tenga el valor MAYOR de lastUsed.
 *
 *   let victim = -1;
 *   let maxLastUsed = -1;
 *   for (let i = 0; i < 100; i++) {
 *     const page = state.ram[i];
 *     if (page && page.lastUsed > maxLastUsed) {
 *       maxLastUsed = page.lastUsed;
 *       victim = i;
 *     }
 *   }
 *   return victim;
 *
 *   onPageLoaded / onPageAccessed / onPageEvicted no hacen nada porque
 *   lastUsed ya es actualizado por el servicio MMU en cada acceso.
 */
export class MruAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'MRU';

  reset(): void {}

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    // TODO: retornar el frame con el mayor valor de page.lastUsed
    return state.ram.findIndex((p) => p !== null); // por mientras
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
}
