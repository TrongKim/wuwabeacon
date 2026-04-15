import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ICharacter, IFilterT } from '../../../../shared/interfaces';
import { CharacterHeaderComponent } from '../character-header/character-header.component';

@Component({
  selector: 'app-character-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, CharacterHeaderComponent],
  templateUrl: './character-grid.component.html',
})
export class CharacterGridComponent implements OnChanges {
  @Input() characters: ICharacter[] = [];

  filtered = signal<ICharacter[]>([]);

  ngOnChanges(): void {
    this.filtered.set(this.characters);
  }

  onFilterChange(value: IFilterT & { name?: string }): void {
    this.filtered.set(
      this.characters.filter((c) => {
        const matchRarity = !value.rarity.length || value.rarity.some((r) => r.code === c.rank);
        const matchType = !value.type.length || value.type.some((t) => t.code === c.weapon_type);
        const matchElement = !value.element.length || value.element.some((e) => e.code === c.element);
        const matchName = !value.name || c.name.toLowerCase().includes(value.name.toLowerCase());
        return matchRarity && matchType && matchElement && matchName;
      })
    );
  }

  stars(rank: number): number[] {
    return Array.from({ length: rank }, (_, i) => i);
  }

  gradientClass(rank: number): string {
    return rank === 5
      ? 'bg-[linear-gradient(0deg,_#c9ac67c8_0%,_#c9ac6700_100%)]'
      : 'bg-[linear-gradient(0deg,_#b567c9c8_0%,_#aa67c900_100%)]';
  }

  elementIcon(element: string): string {
    const map: Record<string, string> = {
      Fusion: '/elements_icon/Fusion.png',
      Electro: '/elements_icon/Electro.png',
      Aero: '/elements_icon/Aero.png',
      Glacio: '/elements_icon/Glacio.png',
      Spectro: '/elements_icon/Spectro.png',
      Havoc: '/elements_icon/Havoc.png',
    };
    return map[element] ?? '';
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
}
