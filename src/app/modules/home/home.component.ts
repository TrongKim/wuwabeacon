import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HomeService, type HomeData } from './home.service';
import { HomeApi } from './api/home.api';
import { FilterGuideContainerComponent } from './ui/filter-guide-container/filter-guide-container.component';
import type { IReviewGuide, Resonator } from '../../shared/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterGuideContainerComponent],
  providers: [HomeService, HomeApi],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);

  guides = signal<IReviewGuide[]>([]);
  resonators = signal<Pick<Resonator, 'id' | 'element' | 'icon' | 'weapon_type' | 'name'>[]>([]);
  guideMap = signal<Map<number, IReviewGuide[]>>(new Map());
  loading = signal(true);

  ngOnInit(): void {
    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.guides.set(data.guides);
        this.resonators.set(data.resonators);
        this.guideMap.set(data.guideMap);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }
}
