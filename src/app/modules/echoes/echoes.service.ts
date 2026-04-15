import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { EchoesApi } from './api/echoes.api';
import type { IEcho, IEchoSet } from '../../shared/interfaces';

@Injectable()
export class EchoesService {
  private api = inject(EchoesApi);

  getAll(): Observable<{ echos: IEcho[]; sets: IEchoSet[] }> {
    return forkJoin({ echos: this.api.getAll(), sets: this.api.getSets() });
  }
}
