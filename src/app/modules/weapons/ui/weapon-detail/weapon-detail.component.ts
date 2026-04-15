import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { highlightNumbersToHtml } from '../../../../shared/utils/text.utils';
import type { IItemRaw, IWeaponDetailRaw } from '../../api/weapon-detail.api';

interface DisplayItem {
  id: number;
  quantity: number;
  name?: string;
  icon?: string;
  rank?: number;
}

@Component({
  selector: 'app-weapon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weapon-detail.component.html',
})
export class WeaponDetailComponent implements OnChanges {
  @Input() weapon!: IWeaponDetailRaw;
  @Input() items: IItemRaw[] = [];

  level = signal(90);
  range = signal<0 | 1 | 2 | 3 | 4 | 5 | 6>(6);

  stars: number[] = [];
  ascensionItems = signal<DisplayItem[]>([]);

  ngOnChanges(): void {
    if (this.weapon) {
      this.stars = Array.from({ length: this.weapon.rarity }, (_, i) => i);
      this.updateAscension();
    }
  }

  onSliderChange(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    let lv = Math.max(1, Math.round((raw / 100) * 90));
    let r: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 6;
    if (lv <= 20) r = 0;
    else if (lv <= 40) r = 1;
    else if (lv <= 50) r = 2;
    else if (lv <= 60) r = 3;
    else if (lv <= 70) r = 4;
    else if (lv <= 80) r = 5;
    this.level.set(lv);
    this.range.set(r);
    this.updateAscension();
  }

  private updateAscension(): void {
    const upgradeRange = this.range() === 6 ? 5 : this.range();
    const mats = this.weapon?.ascensions?.[upgradeRange] ?? [];
    this.ascensionItems.set(
      (mats as { Key: number; Value: number }[]).map((m) => {
        const found = this.items.find((i) => i.id === m.Key);
        return { id: m.Key, quantity: m.Value, name: found?.name, icon: found?.icon, rank: found?.rank };
      })
    );
  }

  getStat(index: 0 | 1): { name: string; value: string } {
    const statsAtRange = this.weapon?.stats?.[this.range()]?.[this.level()];
    if (!statsAtRange) return { name: '', value: '' };
    const stat = statsAtRange[index];
    if (!stat) return { name: '', value: '' };
    let val = stat.Value;
    if (index === 1) {
      val = stat.isRatio ? val * 100 : val / 100;
    }
    return { name: stat.Name, value: index === 1 ? val.toFixed(1) + '%' : Math.round(val).toString() };
  }

  highlightHtml(text: string): string {
    return highlightNumbersToHtml(text);
  }

  borderColor(rank: number): string {
    const map: Record<number, string> = { 2: 'border-[#45c675]', 3: 'border-[#528dcf]', 4: 'border-[#de4aff]', 5: 'border-amber-300' };
    return map[rank] ?? '';
  }
}
