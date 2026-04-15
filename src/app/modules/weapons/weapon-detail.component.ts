import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { WeaponDetailApi, type IWeaponDetailRaw, type IItemRaw } from './api/weapon-detail.api';
import { WeaponDetailComponent } from './ui/weapon-detail/weapon-detail.component';

@Component({
  selector: 'app-weapon-detail-page',
  standalone: true,
  imports: [CommonModule, WeaponDetailComponent],
  providers: [WeaponDetailApi],
  template: `
    <main class="min-h-screen bg-[#0d0d0d] text-white p-4 md:p-6 flex items-center justify-center">
      <div class="w-full max-w-4xl">
        @if (weapon()) {
          <app-weapon-detail [weapon]="weapon()!" [items]="items()"></app-weapon-detail>
        } @else {
          <p class="text-slate-400 text-center">Đang tải...</p>
        }
      </div>
    </main>
  `,
})
export class WeaponDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(WeaponDetailApi);
  private titleService = inject(Title);

  weapon = signal<IWeaponDetailRaw | null>(null);
  items = signal<IItemRaw[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    forkJoin({ weapon: this.api.getWeapon(id), items: this.api.getItems() }).subscribe(
      ({ weapon, items }) => {
        this.weapon.set(weapon);
        this.items.set(items);
        this.titleService.setTitle(weapon.name + ' - Wuwabeacon');
      }
    );
  }
}
