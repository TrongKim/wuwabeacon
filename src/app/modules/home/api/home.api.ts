import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';
import type { IReviewGuide, Resonator } from '../../../shared/interfaces';

@Injectable()
export class HomeApi {
  private supabase = inject(SupabaseService);

  getGuides(): Observable<IReviewGuide[]> {
    return this.supabase.get<IReviewGuide>('guide', {
      select: 'id,title,created_at,published,tags,thumnail,resonator_id',
      order: 'created_at.desc',
    });
  }

  getResonatorsByIds(
    ids: number[]
  ): Observable<Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>[]> {
    return this.supabase.get<Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>>(
      'resonators',
      {
        select: 'id,name,element,weapon_type,icon',
        id: `in.(${ids.join(',')})`,
      }
    );
  }
}
