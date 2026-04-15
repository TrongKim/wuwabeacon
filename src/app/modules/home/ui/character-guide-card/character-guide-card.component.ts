import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IReviewGuide, Resonator } from '../../../../shared/interfaces';

@Component({
  selector: 'app-character-guide-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[#1f293780] border border-[#374151] rounded-xl overflow-hidden flex items-center flex-row p-4 shadow-lg h-[160px]">
      <div class="relative min-w-12 h-auto flex-shrink-0 rounded-md flex-[2]">
        <img [src]="character.icon" [alt]="character.name" width="96" height="96" class="object-contain" />
      </div>
      <div class="ml-4 flex-[5]">
        <h2 class="text-white text-xl font-bold truncate">{{ character.name }}</h2>
        <div class="mt-2">
          <div class="flex justify-between border border-[#4d647e] px-1 pr-0 rounded-xl overflow-hidden bg-[#606d8180] max-w-[170px] mx-auto">
            <span class="text-white text-sm pr-1 text-center w-full">Quick Guide</span>
            <span class="flex items-center justify-center min-w-[35px] text-white text-sm font-medium border-l border-[#1a3759] w-[35px] text-center bg-[#5d6977]">
              {{ guides.length }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CharacterGuideCardComponent {
  @Input() character!: Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>;
  @Input() guides: IReviewGuide[] = [];
}
