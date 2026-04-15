import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';

export interface IWeaponDetailRaw {
  id: number;
  name: string;
  icon: string;
  rarity: number;
  type: string;
  description: string;
  effect_name: string;
  effect: string;
  ascensions: Record<string, { Key: number; Value: number }[]>;
  stats: Record<string, Record<string, { Name: string; Value: number; IsPercent: boolean; isRatio: boolean }[]>>;
}

export interface IItemRaw {
  id: number;
  icon: string;
  rank: number;
  name: string;
  tag: string;
}

@Injectable()
export class WeaponDetailApi {
  private supabase = inject(SupabaseService);

  getWeapon(id: string): Observable<IWeaponDetailRaw> {
    return this.supabase.getOne<IWeaponDetailRaw>('weapons', {
      select: '*',
      id: `eq.${id}`,
    });
  }

  getItems(): Observable<IItemRaw[]> {
    return this.supabase.get<IItemRaw>('items', {
      select: '*',
      tag: `in.(Resonator Ascension Material,Weapon and Skill Material,Ascension Material,Universal Currency)`,
    });
  }
}
