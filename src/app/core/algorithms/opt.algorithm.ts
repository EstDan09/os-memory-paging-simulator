import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

export class OptAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'OPT';

  // ptr -> lista de índices futuros donde ese ptr es referenciado (ordenada asc)
  private futureUses: Map<number, number[]> = new Map();

  constructor(instructions: Instruction[]) {
    this.precompute(instructions);
  }

  reset(): void {
    // futureUses se pre-calcula en el constructor, no necesita reset
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], currentStep: number): number {
    let victimFrame = -1;
    let farthestNextUse = -1;

    for (let frame = 0; frame < 100; frame++) {
      const page = state.ram[frame];
      if (!page) continue;

      const nextUse = this.findNextUse(page.ptr, currentStep);

      // nunca se usará de nuevo → víctima perfecta
      if (nextUse === Infinity) return frame;

      if (nextUse > farthestNextUse) {
        farthestNextUse = nextUse;
        victimFrame = frame;
      }
    }

    return victimFrame !== -1 ? victimFrame : state.ram.findIndex((p) => p !== null);
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}

  // ---------------------------------------------------------------------------

  /**
   * Pre-computa los índices futuros de cada ptr en la secuencia completa de instrucciones.
   * Equivalente al page_index del código de referencia dado por el profesor.
   */
  private precompute(instructions: Instruction[]): void {
    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];
      if (inst.ptr === undefined) continue;
      if (inst.type !== 'use' && inst.type !== 'new') continue;

      if (!this.futureUses.has(inst.ptr)) {
        this.futureUses.set(inst.ptr, []);
      }
      this.futureUses.get(inst.ptr)!.push(i);
    }
  }

  /**
   * Retorna el próximo índice > currentStep donde ptr es referenciado.
   * Si no hay ninguno, retorna Infinity (la página nunca se volverá a usar).
   * Equivalente a page_index[idx][0] tras el shift() del código de referencia.
   */
  private findNextUse(ptr: number, currentStep: number): number {
    const uses = this.futureUses.get(ptr);
    if (!uses) return Infinity;

    for (const idx of uses) {
      if (idx > currentStep) return idx;
    }
    return Infinity;
  }
}
