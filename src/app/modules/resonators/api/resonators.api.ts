import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';
import type { ICharacter } from '../../../shared/interfaces';

@Injectable()
export class ResonatorsApi {
  private supabase = inject(SupabaseService);

  getAll(): Observable<ICharacter[]> {
    return this.supabase.get<ICharacter>('resonators', {
      select: 'id,name,card,rank,element,weapon_type,release_date',
      order: 'release_date.desc,name.desc',
    });
  }
}
