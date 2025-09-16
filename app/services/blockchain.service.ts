import { Injectable, signal } from '@angular/core';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  type?: 'contract_creation' | 'token_mint';
  fee?: number;
}

export interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: Transaction[];
  validator: string;
}

export interface Asset {
  name: string;
  symbol: string;
  type: 'Token' | 'NFT';
  address: string;
  supply?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  readonly blocks = signal<Block[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly wallet = signal({
    address: 'aenz_18f9a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    balance: 1000,
  });
  readonly userAssets = signal<Asset[]>([]);
  readonly gasPrice = signal(20); // In gwei

  private blockTime = 5000; // 5 seconds

  constructor() {
    this.generateInitialBlocks();
    setInterval(() => this.mineBlock(), this.blockTime);
  }

  private generateHash(length: number): string {
    const chars = 'abcdef0123456789';
    return '0x' + Array.from({ length: length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private generateAddress(): string {
     return 'aenz_' + Array.from({ length: 40 }, () => 'abcdef1234567890'[Math.floor(Math.random() * 16)]).join('');
  }
  
  private mineBlock(): void {
    const newHeight = this.blocks().length;
    const newTransactions = this.generateMockTransactions(Math.floor(Math.random() * 5));
    const newBlock: Block = {
      height: newHeight,
      hash: this.generateHash(64),
      timestamp: Date.now(),
      transactions: newTransactions,
      validator: this.generateHash(40),
    };

    this.blocks.update(blocks => [newBlock, ...blocks.slice(0, 99)]);
    this.transactions.update(txs => [...newTransactions, ...txs.slice(0, 99)]);
  }

  private generateMockTransactions(count: number): Transaction[] {
    const txs: Transaction[] = [];
    for (let i = 0; i < count; i++) {
        const fee = this.gasPrice() * 0.0001 * (Math.random() + 0.5);
        txs.push({
            hash: this.generateHash(64),
            from: this.generateAddress(),
            to: this.generateAddress(),
            amount: parseFloat((Math.random() * 100).toFixed(4)),
            timestamp: Date.now() - Math.random() * this.blockTime,
            fee: fee
        });
    }
    return txs;
  }

  private generateInitialBlocks(): void {
    const initialBlocks: Block[] = [];
    for (let i = 0; i < 5; i++) {
      const txs = this.generateMockTransactions(2);
      initialBlocks.unshift({
        height: i,
        hash: this.generateHash(64),
        timestamp: Date.now() - (4-i) * this.blockTime,
        transactions: txs,
        validator: this.generateHash(40)
      });
      this.transactions.update(current => [...txs, ...current]);
    }
    this.blocks.set(initialBlocks);
  }

  sendTransaction(to: string, amount: number): boolean {
    const fee = this.gasPrice() * 0.0001;
    const totalCost = amount + fee;

    if (this.wallet().balance >= totalCost) {
      const tx: Transaction = {
        hash: this.generateHash(64),
        from: this.wallet().address,
        to,
        amount,
        timestamp: Date.now(),
        fee
      };
      this.transactions.update(txs => [tx, ...txs]);
      this.wallet.update(w => ({ ...w, balance: w.balance - totalCost }));
      return true;
    }
    return false;
  }

  generateNewWallet() {
      this.wallet.set({
          address: this.generateAddress(),
          balance: 0
      });
  }

  createAsset(name: string, symbol: string, type: 'Token' | 'NFT', supply: number | undefined, cost: number): { success: boolean; message: string } {
    if (this.wallet().balance < cost) {
      return { success: false, message: 'Insufficient funds for deployment fee.' };
    }
    
    const newAsset: Asset = {
      name,
      symbol,
      type,
      address: this.generateAddress(),
      supply,
    };
    
    this.wallet.update(w => ({...w, balance: w.balance - cost}));
    this.userAssets.update(assets => [...assets, newAsset]);

    const tx: Transaction = {
        hash: this.generateHash(64),
        from: this.wallet().address,
        to: newAsset.address,
        amount: 0,
        timestamp: Date.now(),
        type: 'contract_creation',
        fee: cost
    };
    this.transactions.update(txs => [tx, ...txs]);

    return { success: true, message: 'Asset created successfully!' };
  }

  deployContract(cost: number): { success: boolean; message: string } {
     if (this.wallet().balance < cost) {
      return { success: false, message: 'Insufficient funds for deployment fee.' };
    }
    this.wallet.update(w => ({...w, balance: w.balance - cost}));
     const tx: Transaction = {
        hash: this.generateHash(64),
        from: this.wallet().address,
        to: '0x0000000000000000000000000000000000000000',
        amount: 0,
        timestamp: Date.now(),
        type: 'contract_creation',
        fee: cost
    };
    this.transactions.update(txs => [tx, ...txs]);
    return { success: true, message: 'Mock contract deployed successfully!' };
  }

  mintTokens(assetAddress: string, amount: number, cost: number): { success: boolean; message: string } {
    if (this.wallet().balance < cost) {
      return { success: false, message: 'Insufficient funds for minting fee.' };
    }

    let assetFound = false;
    this.userAssets.update(assets => {
      return assets.map(asset => {
        if (asset.address === assetAddress && asset.type === 'Token') {
          assetFound = true;
          const currentSupply = asset.supply ?? 0;
          return { ...asset, supply: currentSupply + amount };
        }
        return asset;
      });
    });

    if (!assetFound) {
      return { success: false, message: 'Token not found.' };
    }

    this.wallet.update(w => ({...w, balance: w.balance - cost}));

    const tx: Transaction = {
        hash: this.generateHash(64),
        from: this.wallet().address,
        to: assetAddress,
        amount: 0,
        timestamp: Date.now(),
        type: 'token_mint',
        fee: cost
    };
    this.transactions.update(txs => [tx, ...txs]);

    return { success: true, message: `${amount.toLocaleString()} tokens minted successfully!` };
  }

  search(query: string): { type: 'block'; data: Block } | { type: 'transaction'; data: Transaction } | null {
    const blockHeight = parseInt(query, 10);
    if (!isNaN(blockHeight)) {
      const block = this.blocks().find(b => b.height === blockHeight);
      if (block) {
        return { type: 'block', data: block };
      }
    }

    const lowerCaseQuery = query.toLowerCase();
    const blockByHash = this.blocks().find(b => b.hash.toLowerCase() === lowerCaseQuery);
    if (blockByHash) {
      return { type: 'block', data: blockByHash };
    }
    
    const transactionByHash = this.transactions().find(t => t.hash.toLowerCase() === lowerCaseQuery);
    if (transactionByHash) {
      return { type: 'transaction', data: transactionByHash };
    }

    return null;
  }

  getAssetByAddress(address: string): Asset | undefined {
    return this.userAssets().find(asset => asset.address === address);
  }

  getTransactionsForAsset(address: string): Transaction[] {
    const lowerCaseAddress = address.toLowerCase();
    return this.transactions().filter(tx => 
        tx.to.toLowerCase() === lowerCaseAddress || tx.from.toLowerCase() === lowerCaseAddress
    );
  }
}
