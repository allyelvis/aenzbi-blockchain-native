import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlockchainService } from '../services/blockchain.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (transaction(); as tx) {
      <div class="space-y-8 max-w-4xl mx-auto">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="bg-brand-surface hover:bg-brand-border rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-brand-heading">Transaction Details</h1>
        </div>
        
        <div class="bg-brand-surface p-6 rounded-lg space-y-3 border border-brand-border">
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Transaction Hash:</span>
              <span class="text-right font-mono text-brand-accent break-all">{{ tx.hash }}</span>
            </div>
             <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Block:</span>
              <span class="text-right font-mono">
                @if (blockHeight() !== -1) {
                  <a [routerLink]="['/block', blockHeight()]" class="text-brand-accent hover:underline">{{ blockHeight() }}</a>
                } @else {
                  <span>Pending</span>
                }
              </span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">From:</span>
              <span class="text-right font-mono break-all">{{ tx.from }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">To:</span>
              <span class="text-right font-mono break-all">{{ tx.to }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Amount:</span>
              <span class="text-right font-mono font-bold">{{ tx.amount | number:'1.0-4' }} AENZ</span>
            </div>
             <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Fee:</span>
              <span class="text-right font-mono">{{ (tx.fee || 0) | number:'1.0-8' }} AENZ</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Timestamp:</span>
              <span class="text-right font-mono">{{ tx.timestamp | date:'medium' }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Type:</span>
              <span class="text-right font-mono capitalize">{{ (tx.type || 'transfer').replace('_', ' ') }}</span>
            </div>
        </div>

      </div>
    } @else {
      <div class="text-center p-8">
        <h1 class="text-2xl text-brand-muted">Transaction not found.</h1>
        <a routerLink="/explorer" class="text-brand-accent hover:underline mt-4 inline-block">Return to Explorer</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailComponent {
  private route = inject(ActivatedRoute);
  private blockchainService = inject(BlockchainService);
  private location = inject(Location);
  
  private hash = toSignal(this.route.paramMap.pipe(map(params => params.get('hash'))));

  transaction = computed(() => {
    const txHash = this.hash();
    return txHash ? this.blockchainService.getTransaction(txHash) : undefined;
  });

  blockHeight = computed(() => {
    const tx = this.transaction();
    if (!tx) return -1;
    const block = this.blockchainService.blocks().find(b => b.transactions.some(t => t.hash === tx.hash));
    return block ? block.height : -1;
  });
  
  goBack(): void {
    this.location.back();
  }
}
