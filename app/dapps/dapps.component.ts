import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BlockchainService } from '../services/blockchain.service';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { ModalService } from '../services/modal.service';

// Custom Validator for ABI JSON
export function abiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Let 'required' validator handle empty value
    }

    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      return { invalidJson: true };
    }

    if (!Array.isArray(parsed)) {
      return { notAnArray: true };
    }
    
    if (parsed.length === 0) {
        return { emptyAbi: true };
    }

    // Check if every item in the array is an object with essential keys
    const hasValidStructure = parsed.every((item: any) => 
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      'type' in item &&
      'inputs' in item &&
      'outputs' in item
    );

    if (!hasValidStructure) {
      return { invalidAbiStructure: true };
    }

    return null;
  };
}


@Component({
  selector: 'app-dapps',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-brand-heading">DApp Hub</h1>

      <!-- DApp Selection Tabs -->
      <div class="flex border-b border-brand-border">
        @for (tab of tabs; track tab) {
          <button (click)="activeTab.set(tab)" 
                  [class.border-brand-accent]="activeTab() === tab"
                  [class.text-brand-accent]="activeTab() === tab"
                  class="px-6 py-3 text-lg font-medium border-b-2 border-transparent hover:text-brand-heading capitalize">
            {{ tab.replace('_', ' ') }}
          </button>
        }
      </div>

      <!-- DApp Content -->
      <div class="bg-brand-surface rounded-lg p-6 border border-brand-border">
        @switch (activeTab()) {
          @case ('create_token') {
            <h2 class="text-xl font-semibold mb-4 text-brand-heading">Create Fungible Token (AENZ-20)</h2>
            <form [formGroup]="tokenForm" (ngSubmit)="createToken()" class="space-y-4">
              <div>
                <label for="tokenName" class="block text-sm font-medium text-brand-text">Token Name</label>
                <input formControlName="name" id="tokenName" type="text" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2">
              </div>
              <div>
                <label for="tokenSymbol" class="block text-sm font-medium text-brand-text">Token Symbol</label>
                <input formControlName="symbol" id="tokenSymbol" type="text" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2">
              </div>
              <div>
                <label for="tokenSupply" class="block text-sm font-medium text-brand-text">Total Supply</label>
                <input formControlName="supply" id="tokenSupply" type="number" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2">
              </div>
              <div class="text-sm text-brand-muted">
                Deployment Fee: {{ tokenCreationFee() | number: '1.0-4' }} AENZ
              </div>
              <div class="flex justify-end">
                <button type="submit" [disabled]="tokenForm.invalid" class="bg-brand-accent text-brand-bg font-semibold px-4 py-2 rounded-md hover:bg-brand-accent-hover disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">Create Token</button>
              </div>
            </form>
          }
          @case ('create_nft') {
            <h2 class="text-xl font-semibold mb-4 text-brand-heading">Create NFT Collection (AENZ-721)</h2>
             <form [formGroup]="nftForm" (ngSubmit)="createNft()" class="space-y-4">
              <div>
                <label for="nftName" class="block text-sm font-medium text-brand-text">Collection Name</label>
                <input formControlName="name" id="nftName" type="text" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2">
              </div>
              <div>
                <label for="nftSymbol" class="block text-sm font-medium text-brand-text">Collection Symbol</label>
                <input formControlName="symbol" id="nftSymbol" type="text" class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2">
              </div>
               <div class="text-sm text-brand-muted">
                Deployment Fee: {{ nftCreationFee() | number: '1.0-4' }} AENZ
              </div>
              <div class="flex justify-end">
                <button type="submit" [disabled]="nftForm.invalid" class="bg-brand-accent text-brand-bg font-semibold px-4 py-2 rounded-md hover:bg-brand-accent-hover disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">Create Collection</button>
              </div>
            </form>
          }
           @case ('deploy_contract') {
            <h2 class="text-xl font-semibold mb-4 text-brand-heading">Deploy Smart Contract</h2>
            <form [formGroup]="contractForm" (ngSubmit)="deployContract()" class="space-y-4">
              <div>
                <label for="contractAbi" class="block text-sm font-medium text-brand-text">Contract ABI (JSON)</label>
                <textarea formControlName="abi" id="contractAbi" rows="8" 
                          class="mt-1 block w-full bg-brand-bg border-brand-border rounded-md shadow-sm p-2 font-mono text-xs focus:ring-brand-accent focus:border-brand-accent"
                          [class.border-red-500]="contractForm.controls.abi.invalid && contractForm.controls.abi.touched"
                          [class.border-green-500]="contractForm.controls.abi.valid && (contractForm.controls.abi.touched || contractForm.controls.abi.dirty)"
                          placeholder='[{"constant":true,"inputs":[],"name":"name",...}]'></textarea>
                <p class="mt-1 text-xs text-brand-muted">Paste the JSON representation of your contract's Application Binary Interface.</p>
                @if (contractForm.controls.abi.invalid && (contractForm.controls.abi.touched || contractForm.controls.abi.dirty)) {
                  <div class="mt-1 text-xs text-red-400 space-y-1">
                    @if (contractForm.controls.abi.errors?.['required']) {
                      <p>ABI is required.</p>
                    }
                    @if (contractForm.controls.abi.errors?.['invalidJson']) {
                      <p>The provided text is not valid JSON.</p>
                    }
                    @if (contractForm.controls.abi.errors?.['notAnArray']) {
                      <p>ABI must be a JSON array.</p>
                    }
                    @if (contractForm.controls.abi.errors?.['emptyAbi']) {
                      <p>ABI array cannot be empty.</p>
                    }
                    @if (contractForm.controls.abi.errors?.['invalidAbiStructure']) {
                      <p>Each item in the ABI array must be an object with 'name', 'type', 'inputs', and 'outputs' properties.</p>
                    }
                  </div>
                }
              </div>
               <div class="text-sm text-brand-muted">
                Deployment Fee: {{ contractDeployFee() | number: '1.0-4' }} AENZ
              </div>
              <div class="flex justify-end">
                  <button type="submit" [disabled]="contractForm.invalid" class="bg-brand-accent text-brand-bg font-semibold px-4 py-2 rounded-md hover:bg-brand-accent-hover disabled:bg-brand-border/50 disabled:text-brand-muted disabled:cursor-not-allowed">Deploy Contract</button>
              </div>
            </form>
           }
        }
        @if (showSuccess()) {
             <p class="text-green-400 mt-4 text-center">{{ showSuccess() }}</p>
        }
         @if (showError()) {
             <p class="text-red-400 mt-4 text-center">{{ showError() }}</p>
        }
      </div>

       <!-- My Assets -->
      <div>
        <h2 class="text-xl font-semibold mb-4 text-brand-heading">My Deployed Assets</h2>
        <div class="bg-brand-surface rounded-lg p-2 space-y-2 border border-brand-border">
            @for (asset of userAssets(); track asset.address) {
              <a [routerLink]="['/asset', asset.address]" class="block bg-brand-bg/50 p-4 rounded-md hover:bg-brand-border/40 cursor-pointer">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                       @if (asset.type === 'Token') {
                        <div class="flex-shrink-0 w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                       } @else if (asset.type === 'NFT') {
                        <div class="flex-shrink-0 w-10 h-10 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                       }
                        <div>
                            <p class="font-bold text-brand-heading">{{ asset.name }} ({{ asset.symbol }})</p>
                            <p class="text-xs text-brand-muted font-mono">{{ asset.address }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-xs px-2 py-1 rounded-full font-semibold" [class.bg-brand-accent/20]="asset.type === 'Token'" [class.text-brand-accent]="asset.type === 'Token'" [class.bg-brand-secondary/20]="asset.type === 'NFT'" [class.text-brand-secondary]="asset.type === 'NFT'">{{ asset.type }}</span>
                        @if(asset.type === 'Token' && asset.supply) {
                            <p class="text-sm mt-1">{{ asset.supply | number }} supply</p>
                        } @else if (asset.type === 'NFT') {
                            <p class="text-sm mt-1">NFT Collection</p>
                        }
                    </div>
                </div>
                 @if(asset.type === 'Token') {
                    <div (click)="$event.stopPropagation()" class="mt-4 pt-4 border-t border-brand-border/50">
                        <div class="flex items-center space-x-3">
                        <input #mintAmountInput type="number" placeholder="Amount to mint" 
                                class="flex-grow bg-brand-surface border-brand-border rounded-md shadow-sm p-2 text-sm focus:ring-brand-accent focus:border-brand-accent">
                        <button (click)="mint(asset.address, mintAmountInput)"
                                class="bg-brand-accent/80 px-4 py-2 text-sm rounded-md hover:bg-brand-accent text-brand-bg font-semibold">
                            Mint Tokens
                        </button>
                        </div>
                        <p class="text-xs text-brand-muted mt-1 text-right">Minting Fee: {{ mintFee() | number: '1.0-4' }} AENZ</p>
                    </div>
                 }
              </a>
            } @empty {
                <p class="text-center text-brand-muted p-4">You haven't deployed any assets yet.</p>
            }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DappsComponent {
  private blockchainService = inject(BlockchainService);
  private modalService = inject(ModalService);
  
  tabs: ('create_token' | 'create_nft' | 'deploy_contract')[] = ['create_token', 'create_nft', 'deploy_contract'];
  activeTab = signal<'create_token' | 'create_nft' | 'deploy_contract'>('create_token');
  showSuccess = signal('');
  showError = signal('');

  private gasPrice = this.blockchainService.gasPrice;
  
  tokenCreationFee = computed(() => 0.5 + (this.gasPrice() * 0.001));
  nftCreationFee = computed(() => 0.1 + (this.gasPrice() * 0.0005));
  contractDeployFee = computed(() => 0.25 + (this.gasPrice() * 0.0008));
  mintFee = computed(() => 0.05 + (this.gasPrice() * 0.0002));

  userAssets = this.blockchainService.userAssets;

  tokenForm = new FormGroup({
      name: new FormControl('', Validators.required),
      symbol: new FormControl('', Validators.required),
      supply: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

  nftForm = new FormGroup({
      name: new FormControl('', Validators.required),
      symbol: new FormControl('', Validators.required),
  });

  contractForm = new FormGroup({
    abi: new FormControl('', [Validators.required, abiValidator()]),
  });

  createToken() {
    if (this.tokenForm.invalid) return;

    const { name, symbol, supply } = this.tokenForm.value;
    const fee = this.tokenCreationFee();

    this.modalService.open({
      title: 'Confirm Token Creation',
      details: [
        { key: 'Token Name', value: name! },
        { key: 'Symbol', value: symbol! },
        { key: 'Total Supply', value: supply!.toLocaleString() },
      ],
      fee: fee,
      confirmButtonText: 'Create Token',
    });

    this.modalService.action$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        const result = this.blockchainService.createAsset(name!, symbol!, 'Token', supply!, fee);
        if (result.success) {
          this.tokenForm.reset();
          this.flashMessage(result.message, 'success');
        } else {
          this.flashMessage(result.message, 'error');
        }
      }
    });
  }

  createNft() {
    if (this.nftForm.invalid) return;

    const { name, symbol } = this.nftForm.value;
    const fee = this.nftCreationFee();

    this.modalService.open({
      title: 'Confirm NFT Collection Creation',
      details: [
        { key: 'Collection Name', value: name! },
        { key: 'Symbol', value: symbol! },
      ],
      fee: fee,
      confirmButtonText: 'Create Collection',
    });

    this.modalService.action$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        const result = this.blockchainService.createAsset(name!, symbol!, 'NFT', undefined, fee);
        if (result.success) {
          this.nftForm.reset();
          this.flashMessage(result.message, 'success');
        } else {
          this.flashMessage(result.message, 'error');
        }
      }
    });
  }

  deployContract() {
    if (this.contractForm.invalid) return;

    const fee = this.contractDeployFee();

    this.modalService.open({
      title: 'Confirm Contract Deployment',
      details: [
        { key: 'Action', value: 'Deploy Generic Contract' },
        { key: 'ABI Size', value: `${this.contractForm.value.abi!.length} chars` },
      ],
      fee: fee,
      confirmButtonText: 'Deploy',
    });

    this.modalService.action$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        const result = this.blockchainService.deployContract(fee);
        if (result.success) {
          this.flashMessage(result.message, 'success');
          this.contractForm.reset();
        } else {
          this.flashMessage(result.message, 'error');
        }
      }
    });
  }

  mint(assetAddress: string, amountInput: HTMLInputElement) {
    const amount = parseFloat(amountInput.value);
    if (!amount || amount <= 0) {
        this.flashMessage('Please enter a valid amount to mint.', 'error');
        return;
    }

    const fee = this.mintFee();
    const asset = this.userAssets().find((a) => a.address === assetAddress);

    this.modalService.open({
      title: `Confirm Minting of ${asset?.symbol || 'Tokens'}`,
      details: [
        { key: 'Asset', value: `${asset?.name} (${asset?.symbol})` },
        { key: 'Amount to Mint', value: amount.toLocaleString() },
      ],
      fee: fee,
      confirmButtonText: 'Mint',
    });

    this.modalService.action$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        const result = this.blockchainService.mintTokens(assetAddress, amount, fee);
        if (result.success) {
          this.flashMessage(result.message, 'success');
          amountInput.value = '';
        } else {
          this.flashMessage(result.message, 'error');
        }
      }
    });
  }

  private flashMessage(message: string, type: 'success' | 'error') {
      if (type === 'success') {
          this.showSuccess.set(message);
          setTimeout(() => this.showSuccess.set(''), 3000);
      } else {
          this.showError.set(message);
          setTimeout(() => this.showError.set(''), 3000);
      }
  }
}