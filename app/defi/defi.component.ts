import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockchainService } from '../services/blockchain.service';
import { DeFiService } from '../services/defi.service';

@Component({
  selector: 'app-defi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-brand-heading">Decentralized Finance (DeFi)</h1>

      <!-- Staking Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">Available to Stake</h3>
          <p class="text-3xl font-semibold text-brand-heading mt-2">{{ wallet().balance | number:'1.0-4' }}</p>
          <p class="text-lg font-medium text-brand-text -mt-1">AENZ</p>
        </div>
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">Currently Staked</h3>
          <p class="text-3xl font-semibold text-brand-heading mt-2">{{ defiService.stakedBalance() | number:'1.0-4' }}</p>
          <p class="text-lg font-medium text-brand-text -mt-1">AENZ</p>
        </div>
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 class="text-sm font-medium text-brand-muted">AENZ Rewards</h3>
          <p class="text-3xl font-semibold text-green-400 mt-2">{{ defiService.rewards() | number:'1.0-6' }}</p>
          <p class="text-lg font-medium text-brand-text -mt-1">AENZ</p>
        </div>
      </div>

      <!-- Staking Actions -->
      <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-brand-heading">AENZ Staking Protocol</h2>
            <div class="text-right">
                <p class="text-sm text-brand-muted">Staking APY</p>
                <p class="text-lg font-bold text-brand-accent">{{ defiService.apy() }}%</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <!-- Stake Form -->
            <form [formGroup]="stakeForm" (ngSubmit)="onStake()" class="space-y-4">
                <div>
                    <label for="stakeAmount" class="block text-sm font-medium text-brand-text">Amount to Stake</label>
                    <input formControlName="amount" id="stakeAmount" type="number" placeholder="0.0"
                           class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm p-2">
                </div>
                <button type="submit" [disabled]="stakeForm.invalid" 
                        class="w-full bg-brand-accent text-brand-bg font-semibold px-4 py-3 rounded-md hover:bg-brand-accent-hover transition-colors disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">
                    Stake AENZ
                </button>
            </form>
             <!-- Unstake Form -->
            <form [formGroup]="unstakeForm" (ngSubmit)="onUnstake()" class="space-y-4">
                 <div>
                    <label for="unstakeAmount" class="block text-sm font-medium text-brand-text">Amount to Unstake</label>
                    <input formControlName="amount" id="unstakeAmount" type="number" placeholder="0.0"
                           class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm p-2">
                </div>
                <button type="submit" [disabled]="unstakeForm.invalid" 
                        class="w-full bg-brand-border text-brand-text font-semibold px-4 py-3 rounded-md hover:bg-brand-border/70 transition-colors disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">
                    Unstake AENZ
                </button>
            </form>
        </div>
        
        <!-- Claim Rewards -->
        <div class="mt-8 pt-6 border-t border-brand-border">
            <button (click)="onClaim()" [disabled]="defiService.rewards() <= 0"
                    class="w-full bg-green-600/80 text-white font-semibold px-4 py-3 rounded-md hover:bg-green-600 transition-colors disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">
                Claim {{ defiService.rewards() | number:'1.0-6' }} AENZ Rewards
            </button>
        </div>

        @if (statusMessage(); as msg) {
            <p class="text-sm text-center mt-4" [class.text-green-400]="msg.type === 'success'" [class.text-red-400]="msg.type === 'error'">
                {{ msg.text }}
            </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeFiComponent {
  blockchainService = inject(BlockchainService);
  defiService = inject(DeFiService);

  wallet = this.blockchainService.wallet;
  statusMessage = signal<{ text: string, type: 'success' | 'error' } | null>(null);

  stakeForm = new FormGroup({
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)])
  });

  unstakeForm = new FormGroup({
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)])
  });

  onStake() {
    if (this.stakeForm.invalid) return;
    const { amount } = this.stakeForm.value;
    const result = this.defiService.stake(amount!);
    this.flashMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      this.stakeForm.reset();
    }
  }

  onUnstake() {
    if (this.unstakeForm.invalid) return;
    const { amount } = this.unstakeForm.value;
    const result = this.defiService.unstake(amount!);
    this.flashMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        this.unstakeForm.reset();
    }
  }

  onClaim() {
    const result = this.defiService.claimRewards();
    this.flashMessage(result.message, result.success ? 'success' : 'error');
  }

  private flashMessage(text: string, type: 'success' | 'error') {
    this.statusMessage.set({ text, type });
    setTimeout(() => this.statusMessage.set(null), 3000);
  }
}
