import { Injectable } from '@angular/core';
import { Instruction } from '../models/instruction.model';
import { SeededRandomService } from './seeded-random.service';

interface ProcState {
  pid: number;
  remaining: number;
  symbolTable: number[]; // active ptr ids owned by this process
  started: boolean;
  killed: boolean;
}

@Injectable({ providedIn: 'root' })
export class InstructionGeneratorService {
  constructor(private rng: SeededRandomService) {}

  generate(seed: number, P: number, N: number): Instruction[] {
    if (N < P * 2) throw new Error(`N must be at least ${P * 2} (2 per process minimum).`);

    this.rng.setSeed(seed);

    const opCounts = this.distributeOps(N, P);
    const procs: ProcState[] = Array.from({ length: P }, (_, i) => ({
      pid: i + 1,
      remaining: opCounts[i],
      symbolTable: [],
      started: false,
      killed: false,
    }));

    const instructions: Instruction[] = [];
    let ptrCounter = 1;

    while (true) {
      const alive = procs.filter((p) => !p.killed && p.remaining > 0);
      if (alive.length === 0) break;

      const proc = alive[this.rng.nextInt(0, alive.length - 1)];
      const isLast = proc.remaining === 1;

      let inst: Instruction;

      if (isLast) {
        inst = { type: 'kill', pid: proc.pid };
        proc.killed = true;
      } else if (!proc.started || proc.symbolTable.length === 0) {
        // Must do new when process hasn't started or has no active ptrs
        const ptr = ptrCounter++;
        const size = this.rng.nextInt(50, 10000);
        inst = { type: 'new', pid: proc.pid, ptr, size };
        proc.symbolTable.push(ptr);
        proc.started = true;
      } else {
        const validOps: Array<'new' | 'use' | 'delete'> = ['new', 'use', 'delete'];
        const op = validOps[this.rng.nextInt(0, validOps.length - 1)];

        if (op === 'new') {
          const ptr = ptrCounter++;
          const size = this.rng.nextInt(50, 10000);
          inst = { type: 'new', pid: proc.pid, ptr, size };
          proc.symbolTable.push(ptr);
        } else if (op === 'use') {
          const ptr = proc.symbolTable[this.rng.nextInt(0, proc.symbolTable.length - 1)];
          inst = { type: 'use', pid: proc.pid, ptr };
        } else {
          const idx = this.rng.nextInt(0, proc.symbolTable.length - 1);
          const ptr = proc.symbolTable[idx];
          proc.symbolTable.splice(idx, 1);
          inst = { type: 'delete', pid: proc.pid, ptr };
        }
      }

      instructions.push(inst);
      proc.remaining--;
    }

    return instructions;
  }

  /** Distribuye N operaciones entre P procesos, cada uno con mínimo 2 (1 new + kill). */
  private distributeOps(N: number, P: number): number[] {
    const counts = new Array(P).fill(2);
    let remaining = N - P * 2;
    for (let i = 0; i < remaining; i++) {
      counts[this.rng.nextInt(0, P - 1)]++;
    }
    return counts;
  }

  /** Convierte la lista de instrucciones al formato CSV del archivo (Anexo 1). */
  toFileContent(instructions: Instruction[]): string {
    return instructions
      .map((inst) => {
        switch (inst.type) {
          case 'new':    return `new,${inst.pid},${inst.size}`;
          case 'use':    return `use,${inst.ptr}`;
          case 'delete': return `delete,${inst.ptr}`;
          case 'kill':   return `kill,${inst.pid}`;
        }
      })
      .join('\n');
  }
}
