import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EEchoCost } from '../../../../shared/enums';
import type { IEchoSet, IFilterT, TFilter } from '../../../../shared/interfaces';

@Component({
  selector: 'app-filter-echo-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-echo-popup.component.html',
})
export class FilterEchoPopupComponent {
  @Input() isOpen = false;
  @Input() echoSets: IEchoSet[] = [];
  @Output() closePopup = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<IFilterT>();

  EEchoCost = EEchoCost;
  costs = [
    { label: 'Common (1)', code: EEchoCost.COST_ONE },
    { label: 'Elite (3)', code: EEchoCost.COST_THREE },
    { label: 'Overlord (4)', code: EEchoCost.COST_FOUR },
    { label: 'Calamity', code: EEchoCost.COST_CAMA },
  ];

  filters = signal<IFilterT>({ rarity: [], type: [], element: [], bodyType: [], rarity_weapon: [], echo: [], set: [] });

  toggleCost(code: EEchoCost): void {
    this.filters.update((prev) => {
      const arr = prev.echo as TFilter<EEchoCost>[];
      const exists = arr.some((i) => i.code === code);
      return { ...prev, echo: exists ? arr.filter((i) => i.code !== code) : [...arr, { code, name: code }] };
    });
    this.filterChange.emit(this.filters());
  }

  toggleSet(id: number, name: string): void {
    this.filters.update((prev) => {
      const arr = prev.set as TFilter<number>[];
      const exists = arr.some((i) => i.code === id);
      return { ...prev, set: exists ? arr.filter((i) => i.code !== id) : [...arr, { code: id, name }] };
    });
    this.filterChange.emit(this.filters());
  }

  isActiveCost(code: EEchoCost): boolean {
    return (this.filters().echo as TFilter<EEchoCost>[]).some((i) => i.code === code);
  }

  isActiveSet(id: number): boolean {
    return (this.filters().set as TFilter<number>[]).some((i) => i.code === id);
  }
}
