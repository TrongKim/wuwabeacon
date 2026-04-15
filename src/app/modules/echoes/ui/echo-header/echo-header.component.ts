import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IEchoSet, IFilterT } from '../../../../shared/interfaces';
import { EEchoCost } from '../../../../shared/enums';
import { FilterEchoPopupComponent } from '../filter-echo-popup/filter-echo-popup.component';

@Component({
  selector: 'app-echo-header',
  standalone: true,
  imports: [CommonModule, FilterEchoPopupComponent],
  templateUrl: './echo-header.component.html',
})
export class EchoHeaderComponent {
  @Input() echoSets: IEchoSet[] = [];
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
