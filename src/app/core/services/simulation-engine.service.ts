import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Instruction } from '../models/instruction.model';
import { SimulationState, StepLogEntry } from '../models/simulation-state.model';
import { MmuService } from './mmu.service';
import { PageReplacementAlgorithm } from '../algorithms/page-replacement.interface';
import { FifoAlgorithm } from '../algorithms/fifo.algorithm';
import { ScAlgorithm } from '../algorithms/sc.algorithm';
import { LruAlgorithm } from '../algorithms/lru.algorithm';
import { MruAlgorithm } from '../algorithms/mru.algorithm';
import { RndAlgorithm } from '../algorithms/rnd.algorithm';
import { OptAlgorithm } from '../algorithms/opt.algorithm';
import { LfuAlgorithm } from '../algorithms/lfu.algorithm';

@Injectable({ providedIn: 'root' })
export class SimulationEngineService {
  readonly state$ = new BehaviorSubject<SimulationState | null>(null);

  private current: SimulationState | null = null;
  private optAlgorithm!: PageReplacementAlgorithm;
  private algAlgorithm!: PageReplacementAlgorithm;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private mmu: MmuService) {}

  init(instructions: Instruction[], algorithmName: string, seed: number): void {
    this.stopInterval();

    this.optAlgorithm = new OptAlgorithm(instructions);
    this.algAlgorithm = this.buildAlgorithm(algorithmName, seed);
    this.optAlgorithm.reset();
    this.algAlgorithm.reset();

    this.current = {
      instructions,
      currentStep: 0,
      totalSteps: instructions.length,
      optState: this.mmu.createInitialState('OPT'),
      algState: this.mmu.createInitialState(algorithmName),
      isRunning: false,
      isPaused: false,
      speed: 800, // milisegundos entre pasos (velocidad inicial)
      done: false,
      stepLog: [],
    };

    this.emit();
  }

  step(): void {
    if (!this.current || this.current.done) return;

    const s = this.current;
    const inst = s.instructions[s.currentStep];

    const prevOptClock = s.optState.clock;
    const prevAlgClock = s.algState.clock;

    s.optState = this.mmu.execInstruction(inst, s.optState, this.optAlgorithm, s.instructions, s.currentStep);
    s.algState = this.mmu.execInstruction(inst, s.algState, this.algAlgorithm, s.instructions, s.currentStep);

    const optCost = s.optState.clock - prevOptClock;
    const algCost = s.algState.clock - prevAlgClock;

    s.stepLog.push({
      step: s.currentStep + 1,
      instruction: this.fmtInst(inst),
      optCost,
      algCost,
      optWins: optCost < algCost,
    });

    s.currentStep++;

    if (s.currentStep >= s.totalSteps) {
      s.done = true;
      s.isRunning = false;
      this.stopInterval();
    }

    this.emit();
  }

  play(): void {
    if (!this.current || this.current.done || this.intervalId) return;
    this.current.isRunning = true;
    this.current.isPaused = false;
    this.intervalId = setInterval(() => this.step(), this.current!.speed);
    this.emit();
  }

  pause(): void {
    this.stopInterval();
    if (!this.current) return;
    this.current.isRunning = false;
    this.current.isPaused = true;
    this.emit();
  }

  setSpeed(ms: number): void {
    if (!this.current) return;
    this.current.speed = ms;
    if (this.intervalId) {
      this.stopInterval();
      this.intervalId = setInterval(() => this.step(), ms);
    }
  }

  reset(): void {
    this.stopInterval();
    this.current = null;
    this.state$.next(null);
  }

  // ---------------------------------------------------------------------------

  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private emit(): void {
    this.state$.next(this.current ? { ...this.current } : null);
  }

  private buildAlgorithm(name: string, seed: number): PageReplacementAlgorithm {
    switch (name) {
      case 'FIFO': return new FifoAlgorithm();
      case 'SC':   return new ScAlgorithm();
      case 'LRU':  return new LruAlgorithm();
      case 'MRU':  return new MruAlgorithm();
      case 'RND':  return new RndAlgorithm(seed);
      case 'LFU':  return new LfuAlgorithm();
      default:     return new FifoAlgorithm();
    }
  }

  private fmtInst(inst: Instruction): string {
    switch (inst.type) {
      case 'new':    return `new(${inst.pid}, ${inst.size})`;
      case 'use':    return `use(${inst.ptr})`;
      case 'delete': return `del(${inst.ptr})`;
      case 'kill':   return `kill(${inst.pid})`;
    }
  }
}
