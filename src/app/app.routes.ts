import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('./modules/resonators/resonators.component').then((m) => m.ResonatorsComponent),
  },
  {
    path: 'characters/:id',
    loadComponent: () =>
      import('./modules/resonators/resonator-detail.component').then(
        (m) => m.ResonatorDetailPageComponent
      ),
  },
  {
    path: 'weapons',
    loadComponent: () =>
      import('./modules/weapons/weapons.component').then((m) => m.WeaponsComponent),
  },
  {
    path: 'weapons/:id',
    loadComponent: () =>
      import('./modules/weapons/weapon-detail.component').then(
        (m) => m.WeaponDetailPageComponent
      ),
  },
  {
    path: 'echos',
    loadComponent: () =>
      import('./modules/echoes/echoes.component').then((m) => m.EchoesComponent),
  },
  {
    path: 'echos/:id',
    loadComponent: () =>
      import('./modules/echoes/echo-detail.component').then(
        (m) => m.EchoDetailPageComponent
      ),
  },
  {
    path: 'guide/:id',
    loadComponent: () =>
      import('./modules/guide/guide.component').then((m) => m.GuideComponent),
  },
  {
    path: 'tribute',
    loadComponent: () =>
      import('./modules/contribute/contribute.component').then((m) => m.ContributeComponent),
  },
  {
    path: 'battle',
    loadComponent: () =>
      import('./modules/battle/battle.component').then((m) => m.BattleComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
