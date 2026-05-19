import { Injectable } from '@angular/core';

/**
 * PRNG determinístico usando Mulberry32.
 * La misma semilla siempre produce la misma secuencia — garantiza reproducibilidad de la simulación.
 */
@Injectable({ providedIn: 'root' })
export class SeededRandomService {
  private seed = 0;

  setSeed(n: number): void {
    this.seed = n >>> 0;
  }

  /** Retorna un flotante en [0, 1). */
  next(): number {
    this.seed = (this.seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Retorna un entero en [min, max] inclusive. */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
