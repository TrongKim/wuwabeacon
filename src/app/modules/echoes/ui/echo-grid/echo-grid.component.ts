import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { IEcho, IEchoSet, IFilterT } from '../../../../shared/interfaces';
import { EchoHeaderComponent } from '../echo-header/echo-header.component';

@Component({
  selector: 'app-echo-grid',
  standalone: true,
  imports: [CommonModule, RouterLink, EchoHeaderComponent],
  templateUrl: './echo-grid.component.html',
})
export class EchoGridComponent implements OnChanges {
  @Input() echos: IEcho[] = [];
  @Input() echoSets: IEchoSet[] = [];

  filtered = signal<IEcho[]>([]);

  ngOnChanges(): void {
    this.filtered.set(this.echos);
  }

  onFilterChange(value: IFilterT & { name?: string }): void {
    this.filtered.set(
      this.echos.filter((e) => {
        const matchCost = !value.echo.length || value.echo.some((c) => c.code === e.intensity);
        const matchSet = !value.set.length || value.set.some((s) => e.set_ids.includes(s.code as number));
        const matchName = !value.name || e.name.toLowerCase().includes(value.name.toLowerCase());
        return matchCost && matchName && matchSet;
      })
    );
  }

  iconUrl(icon: string): string {
    return icon.split('.')[0] + '.png';
  }
}
