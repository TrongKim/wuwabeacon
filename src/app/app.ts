import { Component } from '@angular/core';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent],
  template: `<app-sidebar></app-sidebar>`,
})
export class App {}
