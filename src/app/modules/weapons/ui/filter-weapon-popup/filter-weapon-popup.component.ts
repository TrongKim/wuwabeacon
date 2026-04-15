import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ECharacterWeaponType, EWeaponRare } from '../../../../shared/enums';
import type { IFilterT, TFilter } from '../../../../shared/interfaces';

@Component({
  selector: 'app-filter-weapon-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-weapon-popup.component.html',
})
export class FilterWeaponPopupComponent {
  @Input() isOpen = false;
  @Output() closePopup = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<IFilterT>();

  EWeaponRare = EWeaponRare;
  ECharacterWeaponType = ECharacterWeaponType;

  rarities = [
    { code: EWeaponRare.ONE_STAR, label: '1★' },
    { code: EWeaponRare.TWO_STAR, label: '2★' },
    { code: EWeaponRare.THREE_STAR, label: '3★' },
    { code: EWeaponRare.FOUR_STAR, label: '4★' },
    { code: EWeaponRare.FIVE_STAR, label: '5★' },
  ];

  weaponTypes = [
    { code: ECharacterWeaponType.SWORD, icon: '/weapons_icon/sword.png' },
    { code: ECharacterWeaponType.BROAD_BLADE, icon: '/weapons_icon/broadblade.png' },
    { code: ECharacterWeaponType.PISTOLS, icon: '/weapons_icon/pistols.png' },
    { code: ECharacterWeaponType.RECTIFIER, icon: '/weapons_icon/rectifier.png' },
    { code: ECharacterWeaponType.GAUNTLETS, icon: '/weapons_icon/gauntlets.png' },
  ];

  filters = signal<IFilterT>({ rarity: [], type: [], element: [], bodyType: [], rarity_weapon: [], echo: [], set: [] });

  toggleRarity(code: EWeaponRare): void {
    this.filters.update((prev) => {
      const arr = prev.rarity_weapon as TFilter<EWeaponRare>[];
      const exists = arr.some((i) => i.code === code);
      return { ...prev, rarity_weapon: exists ? arr.filter((i) => i.code !== code) : [...arr, { code, name: String(code) }] };
    });
    this.filterChange.emit(this.filters());
  }

  toggleType(code: ECharacterWeaponType): void {
    this.filters.update((prev) => {
      const arr = prev.type as TFilter<ECharacterWeaponType>[];
      const exists = arr.some((i) => i.code === code);
      return { ...prev, type: exists ? arr.filter((i) => i.code !== code) : [...arr, { code, name: code }] };
    });
    this.filterChange.emit(this.filters());
  }

  isActiveRarity(code: EWeaponRare): boolean {
    return (this.filters().rarity_weapon as TFilter<EWeaponRare>[]).some((i) => i.code === code);
  }

  isActiveType(code: ECharacterWeaponType): boolean {
    return (this.filters().type as TFilter<ECharacterWeaponType>[]).some((i) => i.code === code);
  }
}
