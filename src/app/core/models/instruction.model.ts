export type InstructionType = 'new' | 'use' | 'delete' | 'kill';

export interface Instruction {
  type: InstructionType;
  pid: number;
  ptr?: number;  // for new: pre-assigned ptr id; for use/delete: target ptr id
  size?: number; // for new: allocation size in bytes
}
