import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

/**
 * SC — Segunda Oportunidad (Algoritmo del Reloj)
 *
 * TODO PARA EL EQUIPO:
 *   1. selectVictim:
 *      Recorrer this.queue desde el frente:
 *        - Obtener page = state.ram[this.queue[0]]
 *        - Si page.mark === false  → desalojar este frame (retornar this.queue[0])
 *        - Si page.mark === true   → poner page.mark = false, mover el frame al final de la cola, continuar
 *
 *   2. onPageLoaded:
 *      this.queue.push(frameIndex);
 *      state.ram[frameIndex]!.mark = false;
 *
 *   3. onPageAccessed:
 *      state.ram[frameIndex]!.mark = true;
 *
 *   4. onPageEvicted:
 *      eliminar frameIndex de this.queue
 */
export class ScAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'SC';

  private queue: number[] = [];

  reset(): void {
    this.queue = [];
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    // TODO: implementar desalojo Segunda Oportunidad usando this.queue y page.mark
    return state.ram.findIndex((p) => p !== null); // stub
  }

  onPageLoaded(frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    // TODO: this.queue.push(frameIndex); state.ram[frameIndex]!.mark = false;
  }

  onPageAccessed(frameIndex: number, _pageId: number, state: AlgorithmState): void {
    // TODO: if (state.ram[frameIndex]) state.ram[frameIndex]!.mark = true;
  }

  onPageEvicted(frameIndex: number, _pageId: number, _state: AlgorithmState): void {
    // TODO: const idx = this.queue.indexOf(frameIndex); if (idx !== -1) this.queue.splice(idx, 1);
    // (eliminar el frame desalojado de la cola)
  }
}
