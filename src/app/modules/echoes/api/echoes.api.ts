import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupabaseService } from '../../../shared/services/supabase.service';
import type { IEcho, IEchoSet } from '../../../shared/interfaces';

@Injectable()
export class EchoesApi {
  private supabase = inject(SupabaseService);

  getAll(): Observable<IEcho[]> {
    return this.supabase.get<IEcho>('echoes', { select: 'id,name,intensity,icon,set_ids', order: 'name.desc' });
  }

  getSets(): Observable<IEchoSet[]> {
    return this.supabase.get<IEchoSet>('echo_sets', { select: 'id,name,icon', order: 'name.desc' });
  }
}
