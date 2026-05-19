import { Injectable } from '@angular/core';
import { Instruction, InstructionType } from '../models/instruction.model';

/**
 * Parsea el archivo CSV de operaciones (formato Anexo 1).
 *
 * Formato por línea (formato de la spec):
 *   new,pid,size      — ptr se asigna secuencialmente (1er new = ptr 1, etc.)
 *   use,ptr
 *   delete,ptr
 *   kill,pid
 *
 * También acepta formato extendido de 3 partes para compatibilidad:
 *   use,pid,ptr
 *   delete,pid,ptr
 */
@Injectable({ providedIn: 'root' })
export class InstructionParserService {
  parse(content: string): Instruction[] {
    const lines = content
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

    const instructions: Instruction[] = [];
    let ptrCounter = 1;

    for (const line of lines) {
      const parts = line.split(',').map((s) => s.trim());
      const type = parts[0] as InstructionType;

      switch (type) {
        case 'new':
          instructions.push({
            type: 'new',
            pid: parseInt(parts[1]),
            size: parseInt(parts[2]),
            ptr: ptrCounter++,
          });
          break;

        case 'use':
          // formato spec: use,ptr  — extendido: use,pid,ptr
          instructions.push({
            type: 'use',
            pid: parts.length >= 3 ? parseInt(parts[1]) : 0,
            ptr: parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]),
          });
          break;

        case 'delete':
          // formato spec: delete,ptr  — extendido: delete,pid,ptr
          instructions.push({
            type: 'delete',
            pid: parts.length >= 3 ? parseInt(parts[1]) : 0,
            ptr: parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]),
          });
          break;

        case 'kill':
          instructions.push({
            type: 'kill',
            pid: parseInt(parts[1]),
          });
          break;

        default:
          console.warn(`Unknown instruction type: "${type}" — skipped`);
      }
    }

    return instructions;
  }
}
