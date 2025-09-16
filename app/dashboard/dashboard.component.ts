import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService } from '../services/blockchain.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <h1 class="text-3xl font-bold text-brand-heading">Network Dashboard</h1>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">Current Block</h3>
          <p class="text-3xl font-semibold text-brand-heading">{{ latestBlock()?.height ?? 'Loading...' }}</p>
        </div>
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">Total Transactions</h3>
          <p class="text-3xl font-semibold text-brand-heading">{{ totalTransactions() }}</p>
        </div>
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">Deployed Assets</h3>
          <p class="text-3xl font-semibold text-brand-heading">{{ totalAssets() }}</p>
        </div>
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">AENZ Price</h3>
          <p class="text-3xl font-semibold text-brand-heading">$0.42 <span class="text-sm font-medium text-green-400">+5.2%</span></p>
        </div>
      </div>

      <!-- Recent Blocks and Transactions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl font-semibold mb-4 text-brand-heading">Latest Blocks</h2>
          <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
            @for (block of blocks(); track block.hash) {
              <div class="bg-brand-bg/50 p-3 rounded-md flex justify-between items-center text-sm">
                <div>
                  <p class="font-mono text-brand-accent">Block #{{ block.height }}</p>
                  <p class="text-xs text-brand-muted">{{ block.transactions.length }} txns</p>
                </div>
                <div class="text-right">
                    <p class="font-mono text-xs">{{ block.hash.substring(0, 16) }}...</p>
                    <p class="text-xs text-brand-muted">{{ block.timestamp | date:'mediumTime' }}</p>
                </div>
              </div>
            }
          </div>
        </div>
        <div>
          <h2 class="text-xl font-semibold mb-4 text-brand-heading">Latest Transactions</h2>
          <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
             @for (tx of transactions(); track tx.hash) {
                <div class="bg-brand-bg/50 p-3 rounded-md text-sm">
                    <p class="font-mono text-xs text-brand-accent truncate">{{ tx.hash }}</p>
                    <div class="flex justify-between items-center mt-1">
                        <div>
                            <p class="text-xs text-brand-muted">From: <span class="font-mono">{{ tx.from.substring(0, 12) }}...</span></p>
                            <p class="text-xs text-brand-muted">To: <span class="font-mono">{{ tx.to.substring(0, 12) }}...</span></p>
                        </div>
                        <div class="text-right">
                           <p class="font-bold text-brand-heading">{{ tx.amount }} AENZ</p>
                           <p class="text-xs text-brand-muted">{{ tx.timestamp | date:'mediumTime' }}</p>
                        </div>
                    </div>
                </div>
             }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private blockchainService = inject(BlockchainService);
  blocks = computed(() => this.blockchainService.blocks().slice(0, 5));
  transactions = computed(() => this.blockchainService.transactions().slice(0, 5));
  latestBlock = computed(() => this.blockchainService.blocks()[0]);
  totalTransactions = computed(() => this.blockchainService.transactions().length + 1000); // Add mock base
  totalAssets = computed(() => this.blockchainService.userAssets().length);
}