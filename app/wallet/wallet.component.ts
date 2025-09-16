import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Update imports for reactive forms and remove FormBuilder.
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockchainService } from '../services/blockchain.service';
import { take } from 'rxjs/operators';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-brand-heading">My Wallet</h1>

      <!-- Wallet Info -->
      <div class="bg-brand-surface p-6 rounded-lg shadow-lg border border-brand-border">
        <p class="text-sm text-brand-muted">My Address</p>
        <p class="font-mono text-lg text-brand-accent break-all">{{ wallet().address }}</p>
        <hr class="my-4 border-brand-border" />
        <p class="text-sm text-brand-muted">Total Balance</p>
        <p class="text-4xl font-bold text-brand-heading">{{ wallet().balance | number:'1.0-4' }} AENZ</p>
         <div class="mt-6 flex space-x-4">
          <button (click)="showSendForm.set(true)" class="bg-brand-accent text-brand-bg font-semibold px-4 py-2 rounded-md hover:bg-brand-accent-hover transition-colors">Send</button>
          <button (click)="generateNewWallet()" class="bg-brand-border px-4 py-2 rounded-md hover:bg-brand-border/70 transition-colors">Generate New Wallet</button>
        </div>
      </div>

      <!-- Send Form -->
      @if (showSendForm()) {
        <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h2 class="text-xl font-semibold mb-4 text-brand-heading">Send AENZ</h2>
          <form [formGroup]="sendForm" (ngSubmit)="sendAenz()" class="space-y-4">
            <div>
              <label for="toAddress" class="block text-sm font-medium text-brand-text">Recipient Address</label>
              <input formControlName="toAddress" id="toAddress" type="text" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm p-2">
            </div>
            <div>
              <label for="amount" class="block text-sm font-medium text-brand-text">Amount</label>
              <input formControlName="amount" id="amount" type="number" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm p-2">
            </div>
            <div class="flex justify-end space-x-3">
               <button type="button" (click)="showSendForm.set(false)" class="bg-brand-border px-4 py-2 rounded-md hover:bg-brand-border/70 transition-colors">Cancel</button>
               <button type="submit" [disabled]="sendForm.invalid" class="bg-brand-accent text-brand-bg font-semibold px-4 py-2 rounded-md hover:bg-brand-accent-hover transition-colors disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">Confirm & Send</button>
            </div>
             @if (transactionStatus()) {
                <p class="text-sm text-center" [class.text-green-400]="transactionStatus() === 'Success'" [class.text-red-400]="transactionStatus() === 'Failed'">
                    {{ transactionStatus() === 'Success' ? 'Transaction sent successfully!' : 'Transaction failed. Insufficient funds.' }}
                </p>
             }
          </form>
        </div>
      }

      <!-- Transaction History -->
      <div>
        <h2 class="text-xl font-semibold mb-4 text-brand-heading">Transaction History</h2>
        <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
            @for (tx of userTransactions(); track tx.hash) {
              <div class="bg-brand-bg/50 p-3 rounded-md flex justify-between items-center text-sm">
                <div>
                   <p class="font-mono text-xs truncate" [class.text-red-400]="tx.from === wallet().address" [class.text-green-400]="tx.to === wallet().address">
                      {{ tx.hash }}
                   </p>
                   @if (tx.from === wallet().address) {
                      <p class="text-xs text-brand-muted">To: <span class="font-mono">{{ tx.to.substring(0,16) }}...</span></p>
                   } @else {
                      <p class="text-xs text-brand-muted">From: <span class="font-mono">{{ tx.from.substring(0,16) }}...</span></p>
                   }
                </div>
                <div class="text-right">
                    <p class="font-bold" [class.text-red-400]="tx.from === wallet().address" [class.text-green-400]="tx.to === wallet().address">
                        {{ tx.from === wallet().address ? '-' : '+' }} {{ tx.amount }} AENZ
                    </p>
                    <p class="text-xs text-brand-muted">{{ tx.timestamp | date:'short' }}</p>
                </div>
              </div>
            } @empty {
                 <p class="text-center text-brand-muted p-4">No transactions yet.</p>
            }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  private blockchainService = inject(BlockchainService);
  private modalService = inject(ModalService);
  
  wallet = this.blockchainService.wallet;
  userTransactions = this.blockchainService.transactions;
  showSendForm = signal(false);
  transactionStatus = signal<'Success' | 'Failed' | null>(null);

  // FIX: Replaced FormBuilder with direct FormGroup and FormControl instantiation to fix typing error.
  sendForm = new FormGroup({
    toAddress: new FormControl('', [Validators.required, Validators.minLength(10)]),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.0001)])
  });

  sendAenz() {
    if (this.sendForm.invalid) return;

    const { toAddress, amount } = this.sendForm.value;
    const fee = this.blockchainService.gasPrice() * 0.0001;

    this.modalService.open({
      title: 'Confirm AENZ Transfer',
      details: [
        { key: 'Recipient', value: toAddress! },
        { key: 'Amount', value: `${amount!} AENZ` },
      ],
      fee: fee,
      confirmButtonText: 'Send Transaction',
    });

    this.modalService.action$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        const success = this.blockchainService.sendTransaction(toAddress!, amount!);
        if (success) {
          this.transactionStatus.set('Success');
          this.showSendForm.set(false);
          this.sendForm.reset();
        } else {
          this.transactionStatus.set('Failed');
        }

        setTimeout(() => this.transactionStatus.set(null), 3000);
      }
    });
  }
  
  generateNewWallet() {
      this.blockchainService.generateNewWallet();
  }
}