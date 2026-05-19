import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InstructionGeneratorService } from '../../core/services/instruction-generator.service';
import { InstructionParserService } from '../../core/services/instruction-parser.service';
import { SimulationEngineService } from '../../core/services/simulation-engine.service';
import { Instruction } from '../../core/models/instruction.model';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  seed = 42;
  algorithm = 'FIFO';
  mode: 'auto' | 'file' = 'auto';
  P = 10;
  N = 500;

  readonly algorithms = ['FIFO', 'SC', 'LRU', 'MRU', 'RND'];
  readonly pOptions = [10, 50, 100];
  readonly nOptions = [500, 1000, 5000];

  instructions: Instruction[] = [];
  fileName = '';
  error = '';
  preview: string[] = [];

  constructor(
    private generator: InstructionGeneratorService,
    private parser: InstructionParserService,
    private engine: SimulationEngineService,
    private router: Router,
  ) {}

  generate(): void {
    try {
      this.error = '';
      // Coerce to numbers — Angular ngModel on <select> can yield strings
      this.instructions = this.generator.generate(+this.seed, +this.P, +this.N);
      this.fileName = `sim_seed${this.seed}_P${this.P}_N${this.N}.txt`;
      this.preview = this.instructions.slice(0, 20).map((i) => this.fmtInst(i));
    } catch (e: any) {
      this.error = e.message;
      this.instructions = [];
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.error = '';
        this.instructions = this.parser.parse(e.target?.result as string);
        this.preview = this.instructions.slice(0, 20).map((i) => this.fmtInst(i));
      } catch (err: any) {
        this.error = 'Parse error: ' + err.message;
        this.instructions = [];
      }
    };
    reader.readAsText(file);
  }

  downloadFile(): void {
    const content = this.generator.toFileContent(this.instructions);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName || 'operations.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  startSimulation(): void {
    this.engine.init(this.instructions, this.algorithm, this.seed);
    this.router.navigate(['/simulation']);
  }

  get hasInstructions(): boolean {
    return this.instructions.length > 0;
  }

  private fmtInst(i: Instruction): string {
    switch (i.type) {
      case 'new':    return `new,${i.pid},${i.size}`;
      case 'use':    return `use,${i.ptr}`;
      case 'delete': return `delete,${i.ptr}`;
      case 'kill':   return `kill,${i.pid}`;
    }
  }
}
