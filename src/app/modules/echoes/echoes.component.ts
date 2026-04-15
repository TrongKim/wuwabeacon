import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchoesService } from './echoes.service';
import { EchoesApi } from './api/echoes.api';
import { EchoGridComponent } from './ui/echo-grid/echo-grid.component';
import type { IEcho, IEchoSet } from '../../shared/interfaces';

@Component({
  selector: 'app-echoes',
  standalone: true,
  imports: [CommonModule, EchoGridComponent],
  providers: [EchoesService, EchoesApi],
  template: `
    <main class="flex-1 pb-4">
      <div class="min-h-screen bg-[#1f293780] border border-[#374151] text-white rounded-[20px]">
        <div class="container mx-auto px-4 py-6">
          @if (echos().length > 0) {
            <app-echo-grid [echos]="echos()" [echoSets]="sets()"></app-echo-grid>
          }
        </div>
      </div>
    </main>
  `,
})
export class EchoesComponent implements OnInit {
  private service = inject(EchoesService);
  echos = signal<IEcho[]>([]);
  sets = signal<IEchoSet[]>([]);

  ngOnInit(): void {
    this.service.getAll().subscribe(({ echos, sets }) => {
      this.echos.set(echos);
      this.sets.set(sets);
    });
  }
}
