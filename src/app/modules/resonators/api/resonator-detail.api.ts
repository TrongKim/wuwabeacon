import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';

export interface ICharacterDetailRaw {
  id: number;
  name: string;
  card: string;
  rank: number;
  element: string;
  weapon_type: string;
  description: string;
  icon: string;
  birthday: string;
  sex: string;
  country: string;
  cv_cn: string;
  cv_en: string;
  cv_jp: string;
  cv_ko: string;
  forte_name: string;
  forte_desc: string[];
  ascensions: Record<string, { Key: number; Value: number }[]>;
  stats: Record<string, Record<string, { Life: number; Atk: number; Def: number }>>;
}

export interface ISkillRaw {
  id: number;
  resonator_id: number;
  type: string;
  name: string;
  description: string;
  icon: string;
  attributes: { attributeName: string; values: string[] }[];
}

export interface IResonanceChainRaw {
  id: number;
  resonator_id: number;
  index: number;
  name: string;
  description: string;
  icon: string;
}

export interface IItemRaw {
  id: number;
  icon: string;
  rank: number;
  name: string;
  tag: string;
}

@Injectable()
export class ResonatorDetailApi {
  private supabase = inject(SupabaseService);

  getResonator(id: string): Observable<ICharacterDetailRaw> {
    return this.supabase.getOne<ICharacterDetailRaw>('resonators', { select: '*', id: `eq.${id}` });
  }

  getSkills(resonatorId: string): Observable<ISkillRaw[]> {
    return this.supabase.get<ISkillRaw>('skill', {
      select: '*',
      resonator_id: `eq.${resonatorId}`,
      order: 'id.asc',
    });
  }

  getChains(resonatorId: string): Observable<IResonanceChainRaw[]> {
    return this.supabase.get<IResonanceChainRaw>('resonant_chain', {
      select: '*',
      resonator_id: `eq.${resonatorId}`,
      order: 'index.asc',
    });
  }

  getItems(): Observable<IItemRaw[]> {
    return this.supabase.get<IItemRaw>('items', {
      select: '*',
      tag: `in.(Resonator Ascension Material,Weapon and Skill Material,Ascension Material,Universal Currency)`,
    });
  }
}
