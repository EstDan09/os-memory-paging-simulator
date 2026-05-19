import { Injectable } from '@angular/core';
import { Page } from '../models/page.model';
import { SimProcess } from '../models/process.model';
import { Instruction } from '../models/instruction.model';
import { AlgorithmState } from '../models/simulation-state.model';
import { PageReplacementAlgorithm } from '../algorithms/page-replacement.interface';

const PAGE_SIZE = 4096; // bytes
const RAM_FRAMES = 100;

@Injectable({ providedIn: 'root' })
export class MmuService {
  readonly PAGE_SIZE = PAGE_SIZE;
  readonly RAM_FRAMES = RAM_FRAMES;

  createInitialState(algorithmName: string): AlgorithmState {
    return {
      algorithmName,
      ram: new Array<Page | null>(RAM_FRAMES).fill(null),
      ptrMap: new Map(),
      allPages: new Map(),
      processes: new Map(),
      clock: 0,
      thrashingTime: 0,
      nextPageId: 1,
      evictions: 0,
    };
  }

  /**
   * Ejecuta una instrucción y retorna el estado actualizado (deep clone).
   * Tanto OPT como el algoritmo seleccionado llaman a esto de forma independiente.
   */
  execInstruction(
    instruction: Instruction,
    state: AlgorithmState,
    algorithm: PageReplacementAlgorithm,
    instructions: Instruction[],
    currentStep: number,
  ): AlgorithmState {
    const s = this.cloneState(state);

    // pid=0 significa use/delete sin pid (formato spec) — omitir seguimiento de proceso
    if (instruction.pid > 0) {
      if (!s.processes.has(instruction.pid)) {
        s.processes.set(instruction.pid, {
          pid: instruction.pid,
          killed: false,
          ownedPtrs: new Set(),
        });
      }
      const proc = s.processes.get(instruction.pid)!;
      if (proc.killed) return s;
    }

    const proc = s.processes.get(instruction.pid)
      ?? { pid: 0, killed: false, ownedPtrs: new Set<number>() };

    switch (instruction.type) {
      case 'new':    this.execNew(instruction, s, proc, algorithm, instructions, currentStep); break;
      case 'use':    this.execUse(instruction, s, algorithm, instructions, currentStep); break;
      case 'delete': this.execDelete(instruction, s, algorithm); break;
      case 'kill':   this.execKill(s, proc, algorithm); break;
    }

    return s;
  }

  // ---------------------------------------------------------------------------
  // Manejadores privados de instrucciones
  // ---------------------------------------------------------------------------

  private execNew(
    inst: Instruction,
    s: AlgorithmState,
    proc: SimProcess,
    algorithm: PageReplacementAlgorithm,
    instructions: Instruction[],
    currentStep: number,
  ): void {
    const ptr = inst.ptr!;
    const size = inst.size!;
    const pagesNeeded = Math.ceil(size / PAGE_SIZE);
    const pageIds: number[] = [];

    for (let i = 0; i < pagesNeeded; i++) {
      const pageId = s.nextPageId++;
      const isLastPage = i === pagesNeeded - 1;
      const usedBytes = isLastPage ? size - i * PAGE_SIZE : PAGE_SIZE;

      const page: Page = {
        id: pageId,
        pid: inst.pid,
        ptr,
        ptrPageIndex: i,
        usedBytes,
        inRam: false,
        frameIndex: null,
        diskAddress: pageId * PAGE_SIZE,
        loadedAt: 0,
        lastUsed: 0,
        mark: false,
      };

      s.allPages.set(pageId, page);
      pageIds.push(pageId);

      // Las páginas nuevas siempre cuentan como fallos de página
      s.clock += 5;
      s.thrashingTime += 5;
      this.loadIntoRam(page, s, algorithm, instructions, currentStep);
    }

    s.ptrMap.set(ptr, pageIds);
    proc.ownedPtrs.add(ptr);
  }

  private execUse(
    inst: Instruction,
    s: AlgorithmState,
    algorithm: PageReplacementAlgorithm,
    instructions: Instruction[],
    currentStep: number,
  ): void {
    const pageIds = s.ptrMap.get(inst.ptr!);
    if (!pageIds) return;

    for (const pageId of pageIds) {
      const page = s.allPages.get(pageId);
      if (!page) continue;

      if (page.inRam) {
        s.clock += 1; // acierto de página
        page.lastUsed = s.clock;
        algorithm.onPageAccessed(page.frameIndex!, pageId, s);
      } else {
        s.clock += 5; // fallo de página
        s.thrashingTime += 5;
        this.loadIntoRam(page, s, algorithm, instructions, currentStep);
      }
    }
  }

  private execDelete(
    inst: Instruction,
    s: AlgorithmState,
    algorithm: PageReplacementAlgorithm,
  ): void {
    const pageIds = s.ptrMap.get(inst.ptr!);
    if (!pageIds) return;

    for (const pageId of pageIds) {
      const page = s.allPages.get(pageId);
      if (!page) continue;
      if (page.inRam) this.evictFromRam(page.frameIndex!, s, algorithm);
      s.allPages.delete(pageId);
    }

    s.ptrMap.delete(inst.ptr!);
    // Remove from all processes' ownedPtrs (supports cross-process delete)
    for (const p of s.processes.values()) p.ownedPtrs.delete(inst.ptr!);
  }

  private execKill(
    s: AlgorithmState,
    proc: SimProcess,
    algorithm: PageReplacementAlgorithm,
  ): void {
    for (const ptr of proc.ownedPtrs) {
      const pageIds = s.ptrMap.get(ptr);
      if (!pageIds) continue;
      for (const pageId of pageIds) {
        const page = s.allPages.get(pageId);
        if (!page) continue;
        if (page.inRam) this.evictFromRam(page.frameIndex!, s, algorithm);
        s.allPages.delete(pageId);
      }
      s.ptrMap.delete(ptr);
    }
    proc.ownedPtrs.clear();
    proc.killed = true;
  }

  // ---------------------------------------------------------------------------
  // Auxiliares de RAM
  // ---------------------------------------------------------------------------

  private loadIntoRam(
    page: Page,
    s: AlgorithmState,
    algorithm: PageReplacementAlgorithm,
    instructions: Instruction[],
    currentStep: number,
  ): void {
    let frameIndex = s.ram.findIndex((f) => f === null);

    if (frameIndex === -1) {
      // RAM llena — pedir al algoritmo qué frame desalojar
      frameIndex = algorithm.selectVictim(s, instructions, currentStep);
      this.evictFromRam(frameIndex, s, algorithm);
      s.evictions++;
    }

    page.inRam = true;
    page.frameIndex = frameIndex;
    page.loadedAt = s.clock;
    page.lastUsed = s.clock;
    s.ram[frameIndex] = page;

    algorithm.onPageLoaded(frameIndex, page.id, s);
  }

  private evictFromRam(
    frameIndex: number,
    s: AlgorithmState,
    algorithm: PageReplacementAlgorithm,
  ): void {
    const page = s.ram[frameIndex];
    if (!page) return;
    algorithm.onPageEvicted(frameIndex, page.id, s);
    page.inRam = false;
    page.frameIndex = null;
    s.ram[frameIndex] = null;
  }

  // ---------------------------------------------------------------------------
  // Deep clone (garantiza que los estados de OPT y ALG sean completamente independientes)
  // ---------------------------------------------------------------------------

  private cloneState(state: AlgorithmState): AlgorithmState {
    // Clone all Page objects first
    const newAllPages = new Map<number, Page>();
    for (const [id, page] of state.allPages) {
      newAllPages.set(id, { ...page });
    }

    // Clone ram array, updating references to new Page objects
    const newRam = state.ram.map((page) =>
      page ? newAllPages.get(page.id)! : null,
    );

    // Clone ptrMap
    const newPtrMap = new Map<number, number[]>();
    for (const [ptr, ids] of state.ptrMap) {
      newPtrMap.set(ptr, [...ids]);
    }

    // Clone processes
    const newProcesses = new Map<number, SimProcess>();
    for (const [pid, proc] of state.processes) {
      newProcesses.set(pid, {
        pid: proc.pid,
        killed: proc.killed,
        ownedPtrs: new Set(proc.ownedPtrs),
      });
    }

    return {
      algorithmName: state.algorithmName,
      ram: newRam,
      ptrMap: newPtrMap,
      allPages: newAllPages,
      processes: newProcesses,
      clock: state.clock,
      thrashingTime: state.thrashingTime,
      nextPageId: state.nextPageId,
      evictions: state.evictions,
    };
  }
}
