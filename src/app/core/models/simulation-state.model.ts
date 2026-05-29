import { Instruction } from './instruction.model';
import { Page } from './page.model';
import { SimProcess } from './process.model';

export interface AlgorithmState {
  algorithmName: string;
  ram: (Page | null)[];                 // 100 frames (índice = número de frame)
  ptrMap: Map<number, number[]>;        // ptr -> [pageIds] (mapa global de la MMU)
  allPages: Map<number, Page>;          // pageId -> Page (RAM + virtual)
  processes: Map<number, SimProcess>;   // pid -> proceso
  clock: number;                        // tiempo total de simulación en segundos
  thrashingTime: number;                // tiempo acumulado en fallos de página
  nextPageId: number;                   // contador auto-incremental de IDs de página
  evictions: number;                    // cuántas veces se llamó selectVictim
  hits: number;                         // total de aciertos de página
  faults: number;                       // total de fallos de página
}

export interface StepLogEntry {
  step: number;
  instruction: string;   // texto formateado, ej. "new(1,500)"
  optCost: number;       // segundos de reloj consumidos por OPT en este paso
  algCost: number;       // segundos de reloj consumidos por ALG en este paso
  optWins: boolean;      // OPT usó menos segundos que ALG en este paso
}

export interface SimulationState {
  instructions: Instruction[];
  currentStep: number;
  totalSteps: number;
  optState: AlgorithmState;
  algState: AlgorithmState;
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // milisegundos entre pasos
  done: boolean;
  stepLog: StepLogEntry[];
}
