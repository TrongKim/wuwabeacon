import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { IReviewGuide, Resonator } from '../../../../shared/interfaces';
import { CharacterGuideCardComponent } from '../character-guide-card/character-guide-card.component';

@Component({
  selector: 'app-character-guide-gallery',
  standalone: true,
  imports: [CommonModule, CharacterGuideCardComponent],
  template: `
    <div class="grid grid-cols-3 gap-3 max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
      @for (r of resonators; track r.id) {
        <button class="cursor-pointer text-left" (click)="navigate(r.id)">
          <app-character-guide-card [character]="r" [guides]="getGuides(r.id)"></app-character-guide-card>
        </button>
      }
    </div>
  `,
})
export class CharacterGuideGalleryComponent {
  @Input() resonators: Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>[] = [];
  @Input() guideMap: Map<number, IReviewGuide[]> = new Map();

  constructor(private router: Router) {}

  getGuides(id: number): IReviewGuide[] {
    return this.guideMap.get(id) ?? [];
  }

  navigate(id: number): void {
    const guideId = this.guideMap.get(id)?.[0]?.id;
    if (guideId) this.router.navigate(['/guide', guideId]);
  }
}
