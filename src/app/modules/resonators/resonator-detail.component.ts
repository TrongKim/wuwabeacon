import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import {
  ResonatorDetailApi,
  type ICharacterDetailRaw,
  type ISkillRaw,
  type IResonanceChainRaw,
  type IItemRaw,
} from './api/resonator-detail.api';

type TabMode = 'profile' | 'forte' | 'resonance-chain' | 'backstory';

interface DisplayItem {
  id: number;
  quantity: number;
  name?: string;
  icon?: string;
  rank?: number;
}

@Component({
  selector: 'app-resonator-detail-page',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  providers: [ResonatorDetailApi],
  templateUrl: './resonator-detail.component.html',
  styleUrl: './resonator-detail.component.scss',
})
export class ResonatorDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ResonatorDetailApi);
  private titleService = inject(Title);

  resonator = signal<ICharacterDetailRaw | null>(null);
  skills = signal<ISkillRaw[]>([]);
  chains = signal<IResonanceChainRaw[]>([]);
  items = signal<IItemRaw[]>([]);
  activeTab = signal<TabMode>('profile');

  level = signal(90);
  range = signal<0 | 1 | 2 | 3 | 4 | 5 | 6>(6);
  ascensionItems = signal<DisplayItem[]>([]);
  skillLevel = signal(10);

  tabs: { mode: TabMode; label: string }[] = [
    { mode: 'profile', label: 'Thông tin' },
    { mode: 'forte', label: 'Kĩ năng' },
    { mode: 'resonance-chain', label: 'Resonance Chain' },
    { mode: 'backstory', label: 'Câu chuyện' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const mode = (this.route.snapshot.queryParamMap.get('mode') as TabMode) ?? 'profile';
    this.activeTab.set(mode);

    forkJoin({
      resonator: this.api.getResonator(id),
      skills: this.api.getSkills(id),
      chains: this.api.getChains(id),
      items: this.api.getItems(),
    }).subscribe(({ resonator, skills, chains, items }) => {
      this.resonator.set(resonator);
      this.skills.set(skills);
      this.chains.set(chains);
      this.items.set(items);
      this.titleService.setTitle(resonator.name + ' - Wuwabeacon');
      this.updateAscension(resonator, items);
    });
  }

  setTab(mode: TabMode): void {
    this.activeTab.set(mode);
    this.router.navigate([], { queryParams: { mode }, replaceUrl: true });
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
    if (this.resonator()) this.updateAscension(this.resonator()!, this.items());
  }

  private updateAscension(resonator: ICharacterDetailRaw, items: IItemRaw[]): void {
    const upgradeRange = this.range() === 6 ? 5 : this.range();
    const mats = resonator.ascensions?.[upgradeRange] ?? [];
    this.ascensionItems.set(
      (mats as { Key: number; Value: number }[]).map((m) => {
        const found = items.find((i) => i.id === m.Key);
        return { id: m.Key, quantity: m.Value, name: found?.name, icon: found?.icon, rank: found?.rank };
      })
    );
  }

  getStat(key: 'Life' | 'Atk' | 'Def'): number {
    const r = this.resonator();
    if (!r) return 0;
    return r.stats?.[this.range()]?.[this.level()]?.[key] ?? 0;
  }

  stars(rank: number): number[] {
    return Array.from({ length: rank }, (_, i) => i);
  }

  elementIcon(element: string): string {
    const map: Record<string, string> = {
      Fusion: '/elements_icon/Fusion.png', Electro: '/elements_icon/Electro.png',
      Aero: '/elements_icon/Aero.png', Glacio: '/elements_icon/Glacio.png',
      Spectro: '/elements_icon/Spectro.png', Havoc: '/elements_icon/Havoc.png',
    };
    return map[element] ?? '';
  }

  borderColor(rank: number): string {
    const map: Record<number, string> = { 2: 'border-[#45c675]', 3: 'border-[#528dcf]', 4: 'border-[#de4aff]', 5: 'border-amber-300' };
    return map[rank] ?? '';
  }

  cleanDescription(desc: string): string {
    return desc.replaceAll('<br><br>', '<br>').replaceAll('text-3xl', 'text-[17px]');
  }
}
