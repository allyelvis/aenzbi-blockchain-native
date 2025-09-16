import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlockchainService, Asset, Transaction } from '../services/blockchain.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (asset(); as a) {
      <div class="space-y-8 max-w-4xl mx-auto">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="bg-brand-surface hover:bg-brand-border rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-brand-heading">{{ a.name }} ({{ a.symbol }})</h1>
        </div>
        
        <div class="bg-brand-surface p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 border border-brand-border">
            <div>
                <p class="text-sm text-brand-muted">Asset Type</p>
                <p class="text-lg font-semibold">{{ a.type }}</p>
            </div>
             <div>
                <p class="text-sm text-brand-muted">Contract Address</p>
                <p class="text-lg font-mono break-all">{{ a.address }}</p>
            </div>
            @if(a.type === 'Token') {
                <div>
                    <p class="text-sm text-brand-muted">Total Supply</p>
                    <p class="text-lg font-semibold">{{ a.supply | number }}</p>
                </div>
            }
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4 text-brand-heading">Asset Transactions</h2>
          <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
              @for (tx of transactions(); track tx.hash) {
                <div class="bg-brand-bg/50 p-3 rounded-md flex justify-between items-center text-sm">
                  <div>
                    <p class="font-mono text-xs text-brand-accent truncate">{{ tx.hash }}</p>
                    <div class="flex space-x-4 mt-1">
                      <p class="text-xs text-brand-muted">From: <span class="font-mono">{{ tx.from.substring(0, 12) }}...</span></p>
                      <p class="text-xs text-brand-muted">To: <span class="font-mono">{{ tx.to.substring(0, 12) }}...</span></p>
                    </div>
                  </div>
                  <div class="text-right">
                     <p class="font-bold text-brand-heading">{{ tx.amount | number: '1.0-4' }} AENZ</p>
                     <p class="text-xs text-brand-muted">{{ tx.timestamp | date:'mediumTime' }}</p>
                  </div>
                </div>
              } @empty {
                   <p class="text-center text-brand-muted p-4">No transactions found for this asset.</p>
              }
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center p-8">
        <h1 class="text-2xl text-brand-muted">Asset not found.</h1>
        <a routerLink="/dapps" class="text-brand-accent hover:underline mt-4 inline-block">Return to DApp Hub</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailComponent {
  private route = inject(ActivatedRoute);
  private blockchainService = inject(BlockchainService);
  private location = inject(Location);
  
  private address = toSignal(this.route.paramMap.pipe(map(params => params.get('address'))));

  asset = computed(() => {
    const addr = this.address();
    return addr ? this.blockchainService.getAssetByAddress(addr) : undefined;
  });

  transactions = computed(() => {
    const addr = this.address();
    return addr ? this.blockchainService.getTransactionsForAsset(addr) : [];
  });
  
  goBack(): void {
    this.location.back();
  }
}