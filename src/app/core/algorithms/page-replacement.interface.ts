import { AlgorithmState } from '../models/simulation-state.model';
import { Instruction } from '../models/instruction.model';

/**
 * Interfaz que todo algoritmo de reemplazo de páginas debe implementar.
 *
 * CONTRATO PARA EL EQUIPO:
 * - Implementar selectVictim() con la lógica de desalojo del algoritmo.
 * - Usar los hooks (onPageLoaded, onPageAccessed, onPageEvicted)
 *   para mantener las estructuras internas que el algoritmo necesite
 *   (ej: cola FIFO, bits de referencia, timestamps).
 * - NO mutar el estado dentro de selectVictim — solo LEER.
 *   Las mutaciones las hace el servicio MMU después de recibir el frame víctima.
 * - El objeto state ya fue clonado para este paso, las lecturas son seguras.
 */
export interface PageReplacementAlgorithm {
  readonly name: string;

  /**
   * Se llama una vez al iniciar (o reiniciar) la simulación.
   * Inicializar / limpiar las estructuras internas aquí.
   */
  reset(): void;

  /**
   * Selecciona qué frame de RAM desalojar cuando la RAM está llena.
   * Se llama ANTES de cargar la nueva página.
   *
   * @param state        Estado actual de la MMU — solo lectura
   * @param instructions Secuencia completa de instrucciones (OPT la usa para lookahead)
   * @param currentStep  Índice de la instrucción que se está ejecutando ahora
   * @returns Índice de frame (0–99) a desalojar
   */
  selectVictim(
    state: AlgorithmState,
    instructions: Instruction[],
    currentStep: number,
  ): number;

  /**
   * Se llama DESPUÉS de colocar una página en `frameIndex`.
   * Agregar el frame a la cola / actualizar estructuras internas aquí.
   */
  onPageLoaded(frameIndex: number, pageId: number, state: AlgorithmState): void;

  /**
   * Se llama cuando una página YA EN RAM es accedida (page hit).
   * Actualizar timestamps LRU/MRU o bits de referencia SC aquí.
   * Nota: state.ram[frameIndex].lastUsed ya fue actualizado por la MMU antes de este llamado.
   */
  onPageAccessed(frameIndex: number, pageId: number, state: AlgorithmState): void;

  /**
   * Se llama ANTES de remover una página de `frameIndex`.
   * Eliminar el frame de las estructuras internas aquí.
   */
  onPageEvicted(frameIndex: number, pageId: number, state: AlgorithmState): void;
}
