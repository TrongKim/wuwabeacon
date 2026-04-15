import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';
import type { IGuideDetailBody } from '../../../shared/interfaces';

@Injectable()
export class GuideApi {
  private supabase = inject(SupabaseService);

  getById(id: string): Observable<IGuideDetailBody> {
    return this.supabase.getOne<IGuideDetailBody>('guide', {
      select: '*',
      id: `eq.${id}`,
    });
  }
}
