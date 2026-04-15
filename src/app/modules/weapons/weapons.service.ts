import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WeaponsApi } from './api/weapons.api';
import type { IWeapon } from '../../shared/interfaces';

@Injectable()
export class WeaponsService {
  private api = inject(WeaponsApi);
  getAll(): Observable<IWeapon[]> { return this.api.getAll(); }
}
