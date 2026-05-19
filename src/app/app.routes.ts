import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/setup/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: 'simulation',
    loadComponent: () =>
      import('./features/simulation/simulation.component').then(
        (m) => m.SimulationComponent,
      ),
  },
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: '**', redirectTo: 'setup' },
];
