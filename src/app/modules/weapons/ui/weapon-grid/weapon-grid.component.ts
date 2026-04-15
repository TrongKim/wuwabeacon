import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { IFilterT, IWeapon } from '../../../../shared/interfaces';
import { WeaponHeaderComponent } from '../weapon-header/weapon-header.component';

@Component({
  selector: 'app-weapon-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, WeaponHeaderComponent],
  templateUrl: './weapon-grid.component.html',
})
export class WeaponGridComponent implements OnChanges {
  @Input() weapons: IWeapon[] = [];
  filtered = signal<IWeapon[]>([]);

  ngOnChanges(): void { this.filtered.set(this.weapons); }

  onFilterChange(value: IFilterT & { name?: string }): void {
    this.filtered.set(
      this.weapons.filter((w) => {
        const matchRarity = !value.rarity_weapon.length || value.rarity_weapon.some((r) => r.code === w.rarity);
        const matchType = !value.type.length || value.type.some((t) => t.code === w.type);
        const matchName = !value.name || w.name.toLowerCase().includes(value.name.toLowerCase());
        return matchRarity && matchType && matchName;
      })
    );
  }

  stars(rank: number): number[] { return Array.from({ length: rank }, (_, i) => i); }

  gradient(rarity: number): string {
    const map: Record<number, string> = {
      5: 'bg-[linear-gradient(0deg,_#c9ac67c8_0%,_#c9ac6700_100%)]',
      4: 'bg-[linear-gradient(0deg,_#b567c9c8_0%,_#aa67c900_100%)]',
      3: 'bg-[linear-gradient(0deg,_#679ac996_0%,_#abc3a900_100%)]',
      2: 'bg-[linear-gradient(0deg,_#67c96b96_0%,_#abc3a900_100%)]',
    };
    return map[rarity] ?? '';
  }

  weaponIcon(type: string): string {
    const map: Record<string, string> = {
      Sword: '/weapons_icon/sword.png',
      Pistols: '/weapons_icon/pistols.png',
      Rectifier: '/weapons_icon/rectifier.png',
      Broadblade: '/weapons_icon/broadblade.png',
      Gauntlets: '/weapons_icon/gauntlets.png',
    };
    return map[type] ?? '';
  }

  weaponImage(src: string | undefined): string {
    if (!src) return '';
    if (src.includes('https://')) return src;
    return src;
  }
}
