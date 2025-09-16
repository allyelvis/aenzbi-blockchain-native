import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BlockchainService, Block, Transaction } from '../services/blockchain.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
     <div class="space-y-8">
      <h1 class="text-3xl font-bold text-brand-heading">Block Explorer</h1>

      <!-- Search Bar -->
      <form (ngSubmit)="performSearch()" class="bg-brand-surface p-4 rounded-lg flex items-center border border-brand-border">
        <input type="text" [formControl]="searchControl" placeholder="Search by Block Height / Block Hash / Txn Hash"
               class="flex-grow bg-brand-bg border-brand-border rounded-l-md shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm p-3">
        <button type="submit" [disabled]="searchControl.invalid" class="bg-brand-accent text-brand-bg font-semibold px-6 py-3 rounded-r-md hover:bg-brand-accent-hover transition-colors disabled:bg-brand-border/50 disabled:cursor-not-allowed">Search</button>
      </form>

      <!-- Search Results -->
      @if (searchResult(); as result) {
        <div class="bg-brand-surface rounded-lg p-6 animate-fade-in border border-brand-border">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-brand-heading">Search Result</h2>
            <button (click)="searchResult.set(null)" class="text-2xl leading-none text-brand-muted hover:text-brand-heading">&times;</button>
          </div>
          @if (result === 'not_found') {
            <p class="text-center text-brand-muted py-4">No block or transaction found for your query.</p>
          } @else {
            @switch (result.type) {
              @case ('block') {
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-brand-accent">Block #{{ result.data.height }}</h3>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Hash:</span> <span class="font-mono text-sm break-all">{{ result.data.hash }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Timestamp:</span> <span class="font-mono">{{ result.data.timestamp | date:'medium' }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Transactions:</span> <span class="font-mono">{{ result.data.transactions.length }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Validator:</span> <span class="font-mono text-sm break-all">{{ result.data.validator }}</span></p>
                </div>
              }
              @case ('transaction') {
                <div class="space-y-2">
                  <h3 class="text-lg font-bold text-brand-accent">Transaction Details</h3>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Hash:</span> <span class="font-mono text-sm break-all">{{ result.data.hash }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">From:</span> <span class="font-mono text-sm break-all">{{ result.data.from }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">To:</span> <span class="font-mono text-sm break-all">{{ result.data.to }}</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Amount:</span> <span class="font-mono font-bold">{{ result.data.amount | number:'1.0-4' }} AENZ</span></p>
                  <p><span class="font-semibold text-brand-muted w-28 inline-block">Timestamp:</span> <span class="font-mono">{{ result.data.timestamp | date:'medium' }}</span></p>
                </div>
              }
            }
          }
        </div>
      }

      <!-- Data Tabs -->
      <div class="flex border-b border-brand-border">
        <button (click)="activeTab.set('blocks')" 
                [class.border-brand-accent]="activeTab() === 'blocks'"
                [class.text-brand-accent]="activeTab() === 'blocks'"
                class="px-6 py-3 text-lg font-medium border-b-2 border-transparent hover:text-brand-heading">
          Blocks
        </button>
        <button (click)="activeTab.set('transactions')"
                [class.border-brand-accent]="activeTab() === 'transactions'"
                [class.text-brand-accent]="activeTab() === 'transactions'"
                class="px-6 py-3 text-lg font-medium border-b-2 border-transparent hover:text-brand-heading">
          Transactions
        </button>
      </div>

      <!-- Content -->
      <div class="bg-brand-surface rounded-lg p-4 border border-brand-border">
        @switch (activeTab()) {
          @case ('blocks') {
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left text-brand-text">
                <thead class="text-xs text-brand-muted uppercase bg-brand-bg">
                  <tr>
                    <th scope="col" class="px-6 py-3">Height</th>
                    <th scope="col" class="px-6 py-3">Hash</th>
                    <th scope="col" class="px-6 py-3">Transactions</th>
                    <th scope="col" class="px-6 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  @for (block of blocks(); track block.hash) {
                    <tr class="border-b border-brand-border hover:bg-brand-border/30">
                      <td class="px-6 py-4 font-mono text-brand-accent">{{ block.height }}</td>
                      <td class="px-6 py-4 font-mono truncate max-w-xs">{{ block.hash }}</td>
                      <td class="px-6 py-4 text-center">{{ block.transactions.length }}</td>
                      <td class="px-6 py-4">{{ block.timestamp | date:'medium' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
          @case ('transactions') {
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left text-brand-text">
                <thead class="text-xs text-brand-muted uppercase bg-brand-bg">
                  <tr>
                    <th scope="col" class="px-6 py-3">Txn Hash</th>
                    <th scope="col" class="px-6 py-3">From</th>
                    <th scope="col" class="px-6 py-3">To</th>
                    <th scope="col" class="px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                   @for (tx of transactions(); track tx.hash) {
                    <tr class="border-b border-brand-border hover:bg-brand-border/30">
                      <td class="px-6 py-4 font-mono text-brand-accent truncate max-w-sm">{{ tx.hash }}</td>
                      <td class="px-6 py-4 font-mono truncate max-w-xs">{{ tx.from }}</td>
                      <td class="px-6 py-4 font-mono truncate max-w-xs">{{ tx.to }}</td>
                      <td class="px-6 py-4 font-semibold">{{ tx.amount | number:'1.0-4' }} AENZ</td>
                    </tr>
                   }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent {
  private blockchainService = inject(BlockchainService);
  blocks = this.blockchainService.blocks;
  transactions = this.blockchainService.transactions;
  activeTab = signal<'blocks' | 'transactions'>('blocks');

  searchControl = new FormControl('', [Validators.required]);
  searchResult = signal<{ type: 'block'; data: Block } | { type: 'transaction'; data: Transaction } | 'not_found' | null>(null);

  performSearch() {
    if (this.searchControl.invalid) {
      return;
    }
    const query = this.searchControl.value!;
    const result = this.blockchainService.search(query);
    if (result) {
      this.searchResult.set(result);
    } else {
      this.searchResult.set('not_found');
    }
  }
}