import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { GuideService } from './guide.service';
import { GuideApi } from './api/guide.api';
import { GuideDetailComponent } from './ui/guide-detail/guide-detail.component';
import type { IGuideDetail } from '../../shared/interfaces';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, GuideDetailComponent],
  providers: [GuideService, GuideApi],
  template: `
    <main class="min-h-screen bg-[#0d0d0d] text-white">
      @if (guide()) {
        <app-guide-detail [guide]="guide()!"></app-guide-detail>
      }
    </main>
  `,
})
export class GuideComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private guideService = inject(GuideService);
  private title = inject(Title);
  private meta = inject(Meta);

  guide = signal<IGuideDetail | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.guideService.getGuideDetail(id).subscribe(({ body, detail }) => {
      this.guide.set(detail);
      this.title.setTitle(body.title);
      const desc = 'Hướng dẫn về: ' + body.title.toLowerCase();
      this.meta.updateTag({ name: 'description', content: desc });
      this.meta.updateTag({ property: 'og:title', content: body.title });
      this.meta.updateTag({ property: 'og:description', content: desc });
      if (body.thumnail) {
        this.meta.updateTag({ property: 'og:image', content: body.thumnail });
      }
    });
  }
}
