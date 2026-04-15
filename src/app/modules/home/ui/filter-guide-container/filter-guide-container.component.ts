import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ECharacterElementType, ECharacterWeaponType } from '../../../../shared/enums';
import { elements, weapons } from '../../../../shared/data/mock-data';
import type { IReviewGuide, Resonator } from '../../../../shared/interfaces';
import { CharacterGuideGalleryComponent } from '../character-guide-gallery/character-guide-gallery.component';

@Component({
  selector: 'app-filter-guide-container',
  standalone: true,
  imports: [CommonModule, CharacterGuideGalleryComponent],
  templateUrl: './filter-guide-container.component.html',
})
export class FilterGuideContainerComponent implements OnChanges {
  @Input() resonators: Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>[] = [];
  @Input() guideMap: Map<number, IReviewGuide[]> = new Map();

  elements = elements;
  weapons = weapons;

  filterByElement = signal<ECharacterElementType | null>(null);
  filterByWeapon = signal<ECharacterWeaponType | 'Misc' | null>(null);
  searchString = signal('');

  filteredResonators = signal<typeof this.resonators>([]);

  ngOnChanges(): void {
    this.applyFilter();
  }

  onSearch(event: Event): void {
    this.searchString.set((event.target as HTMLInputElement).value.trim());
    this.applyFilter();
  }

  selectElement(code: ECharacterElementType): void {
    this.filterByElement.update((v) => (v === code ? null : code));
    this.applyFilter();
  }

  selectWeapon(code: ECharacterWeaponType | 'Misc'): void {
    this.filterByWeapon.update((v) => (v === code ? null : code));
    this.applyFilter();
  }

  private applyFilter(): void {
    let list = [...this.resonators];
    const search = this.searchString().toLowerCase();
    const el = this.filterByElement();
    const wp = this.filterByWeapon();

    if (search) list = list.filter((r) => r.name.toLowerCase().includes(search));
    if (el) list = list.filter((r) => r.element === el);
    if (wp && wp !== 'Misc') list = list.filter((r) => r.weapon_type === wp);

    this.filteredResonators.set(list);
  }

  getElementClass(code: ECharacterElementType): string {
    return code === ECharacterElementType.ELECTRO ? 'scale-[1.2]' : code === ECharacterElementType.SPECTRO ? 'scale-[1.1]' : '';
  }

  getGuideUrl(id: number): string {
    const arr = this.guideMap.get(id);
    return arr?.[0]?.id ?? '';
  }
}
