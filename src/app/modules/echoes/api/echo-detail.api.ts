import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';

export interface IEchoDetailRaw {
  id: number;
  name: string;
  intensity: string;
  icon: string;
  set_ids: number[];
  skill_desc: string;
  skill_simple_desc: string;
  skill_icon: string;
}

export interface IEchoSetDetailRaw {
  id: number;
  name: string;
  icon: string;
  color: string;
  set_2_desc: string;
  set_3_desc: string;
  set_5_desc: string;
}

@Injectable()
export class EchoDetailApi {
  private supabase = inject(SupabaseService);

  getEcho(id: string): Observable<IEchoDetailRaw> {
    return this.supabase.getOne<IEchoDetailRaw>('echoes', { select: '*', id: `eq.${id}` });
  }

  getSets(ids: number[]): Observable<IEchoSetDetailRaw[]> {
    return this.supabase.get<IEchoSetDetailRaw>('echo_sets', {
      select: '*',
      id: `in.(${ids.join(',')})`,
    });
  }
}
