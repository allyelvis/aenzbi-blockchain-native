import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/sidebar.component';
import { ConfirmationModalComponent } from './shared/confirmation-modal.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="flex h-screen bg-brand-bg text-brand-text">
      <app-sidebar></app-sidebar>
      <main class="flex-1 overflow-y-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-confirmation-modal></app-confirmation-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, ConfirmationModalComponent],
})
export class AppComponent {}