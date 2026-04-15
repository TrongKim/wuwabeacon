import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FooterComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private router = inject(Router);

  showSidebar = signal(false);
  showScrollTop = signal(false);
  activeRoute = signal('/');

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.activeRoute.set(e.urlAfterRedirects);
        this.showSidebar.set(false);
      });
  }

  toggleSidebar(): void {
    this.showSidebar.update((v) => !v);
  }

  closeSidebar(): void {
    this.showSidebar.set(false);
  }

  onContentScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.showScrollTop.set(el.scrollTop > 300);
  }

  scrollToTop(contentEl: HTMLElement): void {
    contentEl.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isActive(path: string): boolean {
    if (path === '/') return this.activeRoute() === '/';
    return this.activeRoute().startsWith(path);
  }
}
