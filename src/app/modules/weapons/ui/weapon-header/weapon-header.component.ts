import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IFilterT } from '../../../../shared/interfaces';
import { FilterWeaponPopupComponent } from '../filter-weapon-popup/filter-weapon-popup.component';

@Component({
  selector: 'app-weapon-header',
  standalone: true,
  imports: [CommonModule, FilterWeaponPopupComponent],
  templateUrl: './weapon-header.component.html',
})
export class WeaponHeaderComponent {
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
