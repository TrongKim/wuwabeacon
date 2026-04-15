import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'characters', renderMode: RenderMode.Prerender },
  { path: 'weapons', renderMode: RenderMode.Prerender },
  { path: 'echos', renderMode: RenderMode.Prerender },
  { path: 'tribute', renderMode: RenderMode.Prerender },
  // Dynamic — SSR on demand (SEO tốt hơn Prerender vì data luôn fresh)
  { path: 'characters/:id', renderMode: RenderMode.Server },
  { path: 'weapons/:id', renderMode: RenderMode.Server },
  { path: 'echos/:id', renderMode: RenderMode.Server },
  { path: 'guide/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
