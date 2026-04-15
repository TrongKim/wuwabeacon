import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ECharacterElementType, ECharacterRare, ECharacterWeaponType } from '../../../../shared/enums';
import type { IFilterT, TFilter } from '../../../../shared/interfaces';

@Component({
  selector: 'app-filter-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-popup.component.html',
})
export class FilterPopupComponent {
  @Input() isOpen = false;
  @Output() closePopup = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<IFilterT>();

  ECharacterRare = ECharacterRare;
  ECharacterWeaponType = ECharacterWeaponType;
  ECharacterElementType = ECharacterElementType;

  filters = signal<IFilterT>({ rarity: [], type: [], element: [], bodyType: [], rarity_weapon: [], echo: [], set: [] });

  toggle<T>(category: keyof IFilterT, value: TFilter<T>): void {
    this.filters.update((prev) => {
      const arr = prev[category] as TFilter<T>[];
      const exists = arr.some((i) => i.code === value.code);
      return {
        ...prev,
        [category]: exists ? arr.filter((i) => i.code !== value.code) : [...arr, value],
      };
    });
    this.filterChange.emit(this.filters());
  }

  isActive<T>(category: keyof IFilterT, code: T): boolean {
    return (this.filters()[category] as TFilter<T>[]).some((i) => i.code === code);
  }

  clear(category: keyof IFilterT): void {
    this.filters.update((prev) => ({ ...prev, [category]: [] }));
    this.filterChange.emit(this.filters());
  }
}
