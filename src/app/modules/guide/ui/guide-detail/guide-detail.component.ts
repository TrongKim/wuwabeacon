import { Component, Input, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, SlicePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { IGuideDetail } from '../../../../shared/interfaces';
import { navigationItems } from '../../../../shared/data/mock-data';
import { getYoutubeEmbedUrl, highlightNumbersToHtml } from '../../../../shared/utils/text.utils';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [CommonModule, SlicePipe],
  templateUrl: './guide-detail.component.html',
})
export class GuideDetailComponent implements OnInit {
  @Input() guide!: IGuideDetail;

  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  navItems = navigationItems;
  activeSection = signal('overview');
  isMobileMenuOpen = signal(false);
  showNav = signal(true);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // scroll tracking handled in template via (scroll) on container
    }
  }

  embedUrl(url: string): SafeResourceUrl | null {
    const embed = getYoutubeEmbedUrl(url);
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  }

  highlightHtml(text: string): string {
    return highlightNumbersToHtml(text);
  }

  scrollTo(id: string, container: HTMLElement): void {
    const el = document.getElementById(id);
    if (el) {
      container.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
    this.activeSection.set(id);
    this.isMobileMenuOpen.set(false);
  }

  onContainerScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollTop = container.scrollTop;
    const distToBottom = container.scrollHeight - scrollTop - container.clientHeight;
    this.showNav.set(distToBottom > 200);

    for (let i = this.navItems.length - 1; i >= 0; i--) {
      const el = document.getElementById(this.navItems[i].id);
      if (el && el.offsetTop <= scrollTop + 100) {
        this.activeSection.set(this.navItems[i].id);
        break;
      }
    }
  }

  linkArray(link: string | string[]): string[] {
    return Array.isArray(link) ? link : [link];
  }
}
