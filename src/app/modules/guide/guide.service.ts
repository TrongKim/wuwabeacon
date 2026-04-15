import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GuideApi } from './api/guide.api';
import type { IGuideDetail, IGuideDetailBody } from '../../shared/interfaces';

@Injectable()
export class GuideService {
  private api = inject(GuideApi);

  getGuideDetail(id: string): Observable<{ body: IGuideDetailBody; detail: IGuideDetail }> {
    return this.api.getById(id).pipe(
      map((raw) => {
        let detail: IGuideDetail;
        if (typeof raw.content === 'string') {
          detail = JSON.parse(raw.content) as IGuideDetail;
        } else {
          detail = JSON.parse(JSON.stringify(raw.content)) as IGuideDetail;
        }
        return { body: raw, detail };
      })
    );
  }
}
