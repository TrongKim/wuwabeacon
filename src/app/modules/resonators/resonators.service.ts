import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResonatorsApi } from './api/resonators.api';
import type { ICharacter } from '../../shared/interfaces';

@Injectable()
export class ResonatorsService {
  private api = inject(ResonatorsApi);

  getAll(): Observable<ICharacter[]> {
    return this.api.getAll();
  }
}
