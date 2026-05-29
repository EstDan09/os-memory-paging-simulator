import { Injectable } from '@angular/core';
import { Instruction, InstructionType } from '../models/instruction.model';

/**
 * Parsea el archivo CSV de operaciones (formato Anexo 1).
 *
 * Soporta dos formatos equivalentes:
 *   Formato CSV (preferido):       new,1,500 / use,1 / delete,1 / kill,1
 *   Formato función (Anexo 1):     new(1,500) / use(1) / delete(1) / kill(1)
 *
 * En ambos casos el ptr de new se asigna secuencialmente por orden de aparición
 * (1er new = ptr 1, 2do new = ptr 2, etc.)
 *
 * También acepta formato extendido con pid en use/delete para compatibilidad:
 *   use,pid,ptr  /  delete,pid,ptr
 */
@Injectable({ providedIn: 'root' })
export class InstructionParserService {
  parse(content: string): Instruction[] {
    const rawLines = content
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

    if (rawLines.length === 0) {
      throw new Error('El archivo está vacío o solo contiene comentarios.');
    }

    const instructions: Instruction[] = [];
    let ptrCounter = 1;

    for (let lineNum = 0; lineNum < rawLines.length; lineNum++) {
      const raw = rawLines[lineNum];
      const line = this.normalize(raw);
      const parts = line.split(',').map((s) => s.trim());
      const type = parts[0] as InstructionType;

      try {
        switch (type) {
          case 'new': {
            const pid  = parseInt(parts[1]);
            const size = parseInt(parts[2]);
            if (isNaN(pid) || isNaN(size))
              throw new Error(`'new' requiere pid y size numéricos. Recibido: "${raw}"`);
            if (size <= 0)
              throw new Error(`'new' requiere size > 0. Recibido: ${size} en línea ${lineNum + 1}`);
            instructions.push({ type: 'new', pid, size, ptr: ptrCounter++ });
            break;
          }

          case 'use': {
            // formato spec: use,ptr  — extendido: use,pid,ptr
            const ptr = parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]);
            const pid = parts.length >= 3 ? parseInt(parts[1]) : 0;
            if (isNaN(ptr))
              throw new Error(`'use' requiere un ptr numérico. Recibido: "${raw}"`);
            instructions.push({ type: 'use', pid, ptr });
            break;
          }

          case 'delete': {
            // formato spec: delete,ptr  — extendido: delete,pid,ptr
            const ptr = parts.length >= 3 ? parseInt(parts[2]) : parseInt(parts[1]);
            const pid = parts.length >= 3 ? parseInt(parts[1]) : 0;
            if (isNaN(ptr))
              throw new Error(`'delete' requiere un ptr numérico. Recibido: "${raw}"`);
            instructions.push({ type: 'delete', pid, ptr });
            break;
          }

          case 'kill': {
            const pid = parseInt(parts[1]);
            if (isNaN(pid))
              throw new Error(`'kill' requiere un pid numérico. Recibido: "${raw}"`);
            instructions.push({ type: 'kill', pid });
            break;
          }

          default:
            throw new Error(
              `Tipo de instrucción desconocido: "${parts[0]}" en línea ${lineNum + 1}.\n` +
              `Tipos válidos: new, use, delete, kill.`
            );
        }
      } catch (e: any) {
        throw new Error(`Línea ${lineNum + 1}: ${e.message}`);
      }
    }

    if (instructions.length === 0) {
      throw new Error('No se encontraron instrucciones válidas en el archivo.');
    }

    return instructions;
  }

  /**
   * Convierte notación función a CSV:
   *   new(1,500)  →  new,1,500
   *   use(3)      →  use,3
   *   kill(2)     →  kill,2
   */
  private normalize(line: string): string {
    return line
      .replace(/\s*\(\s*/g, ',')   // "new(" → "new,"
      .replace(/\s*\)\s*/g, '')     // ")" → ""
      .replace(/\s+/g, '');         // eliminar espacios restantes
  }
}
