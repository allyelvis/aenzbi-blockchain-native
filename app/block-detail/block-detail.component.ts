import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlockchainService } from '../services/blockchain.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-block-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (block(); as b) {
      <div class="space-y-8 max-w-4xl mx-auto">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="bg-brand-surface hover:bg-brand-border rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-brand-heading">Block #{{ b.height }}</h1>
        </div>
        
        <div class="bg-brand-surface p-6 rounded-lg space-y-3 border border-brand-border">
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Block Height:</span>
              <span class="text-right font-mono text-brand-accent">{{ b.height }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Timestamp:</span>
              <span class="text-right font-mono">{{ b.timestamp | date:'medium' }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Transactions:</span>
              <span class="text-right font-mono">{{ b.transactions.length }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Validator:</span>
              <span class="text-right font-mono break-all">{{ b.validator }}</span>
            </div>
             <div class="flex justify-between items-start">
              <span class="text-brand-muted font-medium w-32">Block Hash:</span>
              <span class="text-right font-mono break-all">{{ b.hash }}</span>
            </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4 text-brand-heading">Transactions in this Block</h2>
          <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
              @for (tx of b.transactions; track tx.hash) {
                <a [routerLink]="['/transaction', tx.hash]" class="block bg-brand-bg/50 p-3 rounded-md hover:bg-brand-border/40 text-sm">
                    <p class="font-mono text-xs text-brand-accent truncate">{{ tx.hash }}</p>
                    <div class="flex justify-between items-center mt-1">
                        <div>
                            <p class="text-xs text-brand-muted">From: <span class="font-mono">{{ tx.from.substring(0, 12) }}...</span></p>
                            <p class="text-xs text-brand-muted">To: <span class="font-mono">{{ tx.to.substring(0, 12) }}...</span></p>
                        </div>
                        <div class="text-right">
                           <p class="font-bold text-brand-heading">{{ tx.amount | number: '1.0-4' }} AENZ</p>
                           <p class="text-xs text-brand-muted">{{ tx.timestamp | date:'mediumTime' }}</p>
                        </div>
                    </div>
                </a>
              } @empty {
                   <p class="text-center text-brand-muted p-4">No transactions in this block.</p>
              }
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center p-8">
        <h1 class="text-2xl text-brand-muted">Block not found.</h1>
        <a routerLink="/explorer" class="text-brand-accent hover:underline mt-4 inline-block">Return to Explorer</a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockDetailComponent {
  private route = inject(ActivatedRoute);
  private blockchainService = inject(BlockchainService);
  private location = inject(Location);
  
  private id = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));

  block = computed(() => {
    const blockId = this.id();
    return blockId ? this.blockchainService.getBlock(blockId) : undefined;
  });
  
  goBack(): void {
    this.location.back();
  }
}
