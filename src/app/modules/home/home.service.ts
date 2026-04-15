import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { HomeApi } from './api/home.api';
import type { IReviewGuide, Resonator } from '../../shared/interfaces';

export interface HomeData {
  guides: IReviewGuide[];
  resonators: Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>[];
  guideMap: Map<number, IReviewGuide[]>;
}

@Injectable()
export class HomeService {
  private api = inject(HomeApi);

  getHomeData(): Observable<HomeData> {
    return this.api.getGuides().pipe(
      switchMap((guides) => {
        const ids = [...new Set(guides.map((g) => g.resonator_id))];
        return this.api.getResonatorsByIds(ids).pipe(
          map((resonators) => {
            const guideMap = new Map<number, IReviewGuide[]>();
            guides.forEach((g) => {
              const arr = guideMap.get(g.resonator_id) ?? [];
              arr.push(g);
              guideMap.set(g.resonator_id, arr);
            });
            return { guides, resonators, guideMap };
          })
        );
      })
    );
  }
}
