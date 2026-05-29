import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';
import { PageReplacementAlgorithm } from './page-replacement.interface';

/**
 * RND — Reemplazo Aleatorio
 * Elige un frame ocupado al azar usando el PRNG Mulberry32 con la semilla dada.
 * Reproducible: la misma semilla produce la misma secuencia de víctimas.
 */
export class RndAlgorithm implements PageReplacementAlgorithm {
  readonly name = 'RND';
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  reset(): void {
    // la semilla se fija en el constructor; no necesita reset
  }

  selectVictim(state: AlgorithmState, _instructions: Instruction[], _step: number): number {
    const ocupados = state.ram
      .map((p, i) => (p !== null ? i : -1))
      .filter((i) => i >= 0);
    const idx = Math.floor(this.nextRandom() * ocupados.length);
    return ocupados[idx];
  }

  onPageLoaded(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageAccessed(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}
  onPageEvicted(_frameIndex: number, _pageId: number, _state: AlgorithmState): void {}

  /** PRNG Mulberry32 — determinístico y reproducible. */
  private nextRandom(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
