import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeaponsService } from './weapons.service';
import { WeaponsApi } from './api/weapons.api';
import { WeaponGridComponent } from './ui/weapon-grid/weapon-grid.component';
import type { IWeapon } from '../../shared/interfaces';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [CommonModule, WeaponGridComponent],
  providers: [WeaponsService, WeaponsApi],
  template: `
    <main class="flex-1 pb-4">
      <div class="min-h-screen border bg-[#1f293780] border-[#374151] text-white rounded-[20px]">
        <div class="container mx-auto px-4 py-6">
          @if (weapons().length > 0) {
            <app-weapon-grid [weapons]="weapons()"></app-weapon-grid>
          }
        </div>
      </div>
    </main>
  `,
})
export class WeaponsComponent implements OnInit {
  private service = inject(WeaponsService);
  weapons = signal<IWeapon[]>([]);

  ngOnInit(): void {
    this.service.getAll().subscribe((data) => this.weapons.set(data));
  }
}
