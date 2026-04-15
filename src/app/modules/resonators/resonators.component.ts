import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResonatorsService } from './resonators.service';
import { ResonatorsApi } from './api/resonators.api';
import { CharacterGridComponent } from './ui/character-grid/character-grid.component';
import type { ICharacter } from '../../shared/interfaces';

@Component({
  selector: 'app-resonators',
  standalone: true,
  imports: [CommonModule, CharacterGridComponent],
  providers: [ResonatorsService, ResonatorsApi],
  template: `
    <main class="flex-1 pb-4">
      <div class="min-h-screen border bg-[#1f293780] border-[#374151] text-white rounded-[20px]">
        <div class="container mx-auto px-4 py-6">
          @if (characters().length > 0) {
            <app-character-grid [characters]="characters()"></app-character-grid>
          }
        </div>
      </div>
    </main>
  `,
})
export class ResonatorsComponent implements OnInit {
  private service = inject(ResonatorsService);
  characters = signal<ICharacter[]>([]);

  ngOnInit(): void {
    this.service.getAll().subscribe((data) => this.characters.set(data));
  }
}
