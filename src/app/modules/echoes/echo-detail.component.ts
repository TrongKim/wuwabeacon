import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { switchMap } from 'rxjs';
import { EchoDetailApi, type IEchoDetailRaw, type IEchoSetDetailRaw } from './api/echo-detail.api';
import { highlightNumbersToHtml } from '../../shared/utils/text.utils';

@Component({
  selector: 'app-echo-detail-page',
  standalone: true,
  imports: [CommonModule],
  providers: [EchoDetailApi],
  templateUrl: './echo-detail.component.html',
})
export class EchoDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(EchoDetailApi);
  private titleService = inject(Title);

  echo = signal<IEchoDetailRaw | null>(null);
  sets = signal<IEchoSetDetailRaw[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getEcho(id).pipe(
      switchMap((echo) => {
        this.echo.set(echo);
        this.titleService.setTitle(echo.name + ' - Wuwabeacon');
        return this.api.getSets(echo.set_ids);
      })
    ).subscribe((sets) => this.sets.set(sets));
  }

  iconUrl(icon: string): string {
    return icon.split('.')[0] + '.png';
  }

  highlightHtml(text: string): string {
    return highlightNumbersToHtml(text);
  }
}
