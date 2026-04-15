import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IFilterT } from '../../../../shared/interfaces';
import { ECharacterElementType, ECharacterRare, ECharacterWeaponType } from '../../../../shared/enums';
import { FilterPopupComponent } from '../filter-popup/filter-popup.component';

@Component({
  selector: 'app-character-header',
  standalone: true,
  imports: [CommonModule, FilterPopupComponent],
  templateUrl: './character-header.component.html',
})
export class CharacterHeaderComponent {
  @Output() filterChange = new EventEmitter<IFilterT & { name?: string }>();

  isFilterOpen = signal(false);
  searchString = signal('');
  filter = signal<IFilterT>({ rarity: [], type: [], element: [], bodyType: [], rarity_weapon: [], echo: [], set: [] });

  onSearch(event: Event): void {
    this.searchString.set((event.target as HTMLInputElement).value.trim());
    this.emit();
  }

  onFilterChange(f: IFilterT): void {
    this.filter.set(f);
    this.emit();
  }

  private emit(): void {
    this.filterChange.emit({ ...this.filter(), name: this.searchString() });
  }
}
