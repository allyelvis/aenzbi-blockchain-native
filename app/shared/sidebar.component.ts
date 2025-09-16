import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlockchainService } from '../services/blockchain.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="w-64 bg-brand-surface p-6 flex flex-col justify-between border-r border-brand-border">
      <div>
        <div class="flex items-center space-x-3 mb-10">
           <svg class="w-10 h-10 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
           <div>
            <h1 class="text-xl font-bold text-brand-heading">Aenzbi</h1>
            <p class="text-xs text-brand-muted">Blockchain Interface</p>
           </div>
        </div>
        <nav class="space-y-2">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-brand-accent/10 text-brand-accent" 
               class="flex items-center space-x-3 px-4 py-2 rounded-md text-brand-text font-medium hover:bg-brand-border/50 transition-colors duration-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" [innerHTML]="item.icon"></svg>
              <span>{{ item.name }}</span>
            </a>
          }
        </nav>
      </div>
      <div>
        <div class="p-4 bg-brand-bg rounded-lg border border-brand-border text-left">
          <p class="text-xs font-medium text-brand-muted">Wallet Balance</p>
          <p class="text-2xl font-bold text-brand-heading mt-1">{{ wallet().balance | number:'1.0-4' }} <span class="text-lg font-medium text-brand-text">AENZ</span></p>
        </div>
        <div class="text-center text-xs text-brand-muted/75 mt-6">
          <p>Aenzbi Network v1.0.0</p>
          <p>&copy; 2024. All rights reserved.</p>
        </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule],
})
export class SidebarComponent {
  private blockchainService = inject(BlockchainService);
  wallet = this.blockchainService.wallet;

  navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>' },
    { name: 'Wallet', path: '/wallet', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>' },
    { name: 'Explorer', path: '/explorer', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' },
    { name: 'DeFi', path: '/defi', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008h-.008V10.5zm-12 0h.008v.008h-.008V10.5z" />' },
    { name: 'DApps', path: '/dapps', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21.5v-2.5M12 18.5l-2-1-2 1M12 18.5l2-1 2 1M12 18.5v2.5M6 11.5l-2-1-2 1M6 11.5l2-1 2 1M6 11.5V9M18 11.5l2-1 2 1M18 11.5l-2-1-2 1M18 11.5V9"></path>'},
    { name: 'AI Maintainer', path: '/ai-maintainer', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>'}
  ];
}
