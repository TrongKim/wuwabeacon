import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';
import type { IWeapon } from '../../../shared/interfaces';

@Injectable()
export class WeaponsApi {
  private supabase = inject(SupabaseService);

  getAll(): Observable<IWeapon[]> {
    return this.supabase.get<IWeapon>('weapons', { select: 'id,name,icon,rarity,type', order: 'rarity.desc' });
  }
}
